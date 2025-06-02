import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ResponseModel } from 'shared/models';
import { Endpoint } from 'shared/enums';
import { SigninDto, SignupDto } from 'shared/dto';
import { AuthService } from 'shared/services';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(Endpoint.SIGNIN)
  async signin(@Body() body: SigninDto): Promise<ResponseModel> {
    const result = await this.authService.signIn(body.email, body.password);

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
