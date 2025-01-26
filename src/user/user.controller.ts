import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Inject,
  UnauthorizedException,
  SetMetadata,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { requireLoginMeta } from 'src/constants';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject()
  private readonly redisService: RedisService;

  @Inject()
  private readonly emailService: EmailService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @Post('register')
  register(@Body() registerUser: RegisterUserDto) {
    return this.userService.register(registerUser);
  }

  @Get('register-captcha')
  async captcha(@Query('email') email: string) {
    const code = Math.random().toString().slice(2, 8);

    this.redisService.set(`captcha_${email}`, code, 5 * 60);

    await this.emailService.sendMail({
      to: email,
      subject: '邮箱注册',
      html: `<p>你的注册验证码是${code}</p>`,
    });
    return '发送成功';
  }

  @Get('init-data')
  async initData() {
    await this.userService.initData();
    return '数据初始化成功';
  }
  @Post('login')
  async userLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, false);
    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );
    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expires_time') || '7d',
      },
    );
    return vo;
  }
  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, true);
    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );
    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expires_time') || '7d',
      },
    );
    return vo;
  }
  @Get('refresh')
  async refreshToken(@Query('refreshToken') refreshToken: string) {
    try {
      const tokenInfo = this.jwtService.verify(refreshToken);
      const userInfo = await this.userService.findUserById(
        tokenInfo.userId,
        false,
      );

      const access_token = this.jwtService.sign(
        {
          userId: userInfo.id,
          username: userInfo.username,
          roles: userInfo.roles,
          permissions: userInfo.permissions,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );
      const refresh_token = this.jwtService.sign(
        {
          userId: userInfo.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expires_time') || '7d',
        },
      );
      return {
        access_token,
        refresh_token,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  @SetMetadata(requireLoginMeta, true)
  @Get('admin/refresh')
  async adminRefreshToken(@Query('refreshToken') refreshToken: string) {
    try {
      const tokenInfo = this.jwtService.verify(refreshToken);
      const userInfo = await this.userService.findUserById(
        tokenInfo.userId,
        true,
      );

      const access_token = this.jwtService.sign(
        {
          userId: userInfo.id,
          username: userInfo.username,
          roles: userInfo.roles,
          permissions: userInfo.permissions,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );
      const refresh_token = this.jwtService.sign(
        {
          userId: userInfo.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expires_time') || '7d',
        },
      );
      return {
        access_token,
        refresh_token,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }
}
