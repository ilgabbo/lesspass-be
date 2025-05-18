/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Headers,
  HttpStatus,
  Post,
} from '@nestjs/common';
import db from 'db';
import { users } from 'db/schema';
import { eq } from 'drizzle-orm';
import env from 'env';
import {
  BaseAuthSchema,
  SigninModel,
  SignupAuthSchema,
  SignupModel,
} from 'models/auth.model';
import { ResponseModel } from 'models/response.model';
import bcrypt from 'bcryptjs';
import { UserRole } from 'enums/role.enum';
import crypto from 'crypto';

@Controller('auth')
export class AuthController {
  @Post('signin')
  async signin(
    @Body() body: SigninModel,
  ): Promise<ResponseModel> {
    const result = BaseAuthSchema.safeParse(body);
    if (!result.success) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: result.error.issues[0].message,
      };
    }

    const { email, password } = result.data;
    const user = await db
      .selectDistinct()
      .from(users)
      .where(eq(users.email, email));
    if (user.length <= 0) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'User not found',
      };
    }
    const isPasswordValid = bcrypt.compareSync(password, user[0].password);
    if (!isPasswordValid) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid password',
      };
    }

    await db.update(users).set({
      publicKey: body.key
    }).where(eq(users.email, email));

    const jose = await import('jose');
    const token = await new jose.SignJWT({
      userId: user[0].userId,
      role: user[0].role,
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15mins')
    .setJti(crypto.randomBytes(16).toString('hex'))
    .sign(new TextEncoder().encode(env.JWT_SECRET));

    return {
      status: HttpStatus.OK,
      message: 'Signin successfully',
      data: {
        token: token
      }
    };
  }

  @Post('signup')
  async signup(
    @Body() body: SignupModel,
    @Headers('Authorization') header: string | undefined,
  ): Promise<ResponseModel> {
    const result = SignupAuthSchema.safeParse(body);
    if (!result.success) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: result.error.issues[0].message,
      };
    }

    const jose = await import('jose');
    try {
      // only admins can create new users
      const userCount = await db.$count(users);
      const token = header
        ? await jose.jwtVerify(
            header.split(' ')[1],
            new TextEncoder().encode(env.JWT_SECRET),
          )
        : null;

      if (userCount > 0) {
        if (!header || !token || token.payload.role !== UserRole.ADMIN) {
          return {
            status: HttpStatus.UNAUTHORIZED,
            message: 'You must be admin to register new users',
          };
        }
      }

      // first signup or an admin is creating a new user
      const { firstName, lastName, email, password, role } = result.data;
      const user = await db.select().from(users).where(eq(users.email, email));
      if (user.length > 0) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'User already exists',
        };
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      await db.insert(users).values({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: userCount > 0 ? (role ?? UserRole.USER) : UserRole.ADMIN,
      });

      return {
        status: HttpStatus.OK,
        message: 'Signup successfully',
      };
    } catch (error) {
      console.error(error);
      if (error instanceof jose.errors.JOSEError) {
        return {
          status: HttpStatus.UNAUTHORIZED,
          message: 'Invalid token',
        };
      }
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
      };
    }
  }
}
