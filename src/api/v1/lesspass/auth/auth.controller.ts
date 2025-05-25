import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ResponseModel } from 'shared/models/response.model';
import { Endpoint } from 'shared/enums/endpoint.enum';
import { SigninDto, SignupDto } from 'shared/dto/auth.dto';
import { AuthService } from 'shared/services/auth/auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(Endpoint.SIGNIN)
  async signin(@Body() body: SigninDto): Promise<ResponseModel> {
    const result = await this.authService.signIn(
      body.email,
      body.password,
      body.key,
    );

    return result;
  }

  @Post(Endpoint.SIGNUP)
  async signup(
    @Body() body: SignupDto,
    @Headers('Authorization') header: string | undefined,
  ): Promise<ResponseModel> {
    return await this.authService.signUp(body, header?.split(' ')?.[1]);
  }
}
