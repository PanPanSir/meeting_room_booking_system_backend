import { Controller, Post, Body, Get, Query, Inject } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject()
  private readonly redisService: RedisService;

  @Inject()
  private readonly emailService: EmailService;

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
}
