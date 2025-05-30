import { HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ServiceReturnValueModel } from 'shared/models/serviceReturnValue.model';
import { HttpStatusText } from 'shared/enums/httpStatusText.enum';
import bcrypt from 'bcryptjs';
import crypto, { randomUUID } from 'crypto';
import env from 'shared/env';
import db from 'db';
import { users } from 'db/schema';
import { eq } from 'drizzle-orm';
import { SignupDto } from 'shared/dto/auth.dto';
import { UserRole } from 'shared/enums/role.enum';
import { JwtService } from '@nestjs/jwt';
import { TokenPayloadModel } from 'shared/models/token.model';
import { TOKEN_EXP } from 'shared/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    password: string,
    publicKey: string,
  ): Promise<ServiceReturnValueModel<{ token: string }>> {
    const user = await this.usersService.findOne(email);

    if (user.status !== HttpStatus.OK) {
      return {
        status: user.status,
        message: user.message,
      };
    }

    const isPasswordValid = bcrypt.compareSync(password, user.data!.password);
    if (!isPasswordValid) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid username or password',
      };
    }

    const tokenVersion = randomUUID();

    await db
      .update(users)
      .set({
        publicKey: publicKey,
        tokenVersion: tokenVersion,
      })
      .where(eq(users.email, email));

    const token = await this.jwtService.signAsync(
      {
        userId: user.data!.userId,
        role: user.data!.role,
        tokenVersion: tokenVersion,
      },
      {
        secret: env.JWT_SECRET,
        expiresIn: TOKEN_EXP,
        algorithm: 'HS256',
        jwtid: crypto.randomBytes(16).toString('hex'),
      },
    );

    return {
      status: HttpStatus.OK,
      message: HttpStatusText.OK,
      data: {
        token: token,
      },
    };
  }

  // only admins can register new users
  async signUp(
    body: SignupDto,
    token: string | undefined,
  ): Promise<ServiceReturnValueModel> {
    const userCount = await db.$count(users);

    if (userCount > 0) {
      // jwt needed to check the role
      if (!token) {
        return {
          status: HttpStatus.UNAUTHORIZED,
          message: 'You must be admin to register new users',
        };
      }
      const verifiedToken: TokenPayloadModel =
        await this.jwtService.verifyAsync(token, {
          secret: env.JWT_SECRET,
        });
      if (verifiedToken.role !== UserRole.ADMIN) {
        return {
          status: HttpStatus.UNAUTHORIZED,
          message: 'You must be admin to register new users',
        };
      }
    }

    const user = await this.usersService.findOne(body.email);
    if (user.status === HttpStatus.OK) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'User already exists',
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = bcrypt.hashSync(body.password, salt);
    await db.insert(users).values({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: hashedPassword,
      role: userCount > 0 ? (body.role ?? UserRole.USER) : UserRole.ADMIN,
    });

    return {
      status: HttpStatus.OK,
      message: HttpStatusText.OK,
    };
  }
}
