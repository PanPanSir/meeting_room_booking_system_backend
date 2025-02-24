import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Inject,
  UnauthorizedException,
  SetMetadata,
  DefaultValuePipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  RequireLogin,
  requirePermissions,
  UserInfo,
} from 'src/custom.decorator';
import { UserDetailVo } from './vo/user-detail.vo';
import { UpdateUserPasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { generateParseIntPipe } from 'src/utils';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { storage } from 'src/my-file-storage';

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
        email: vo.userInfo.email,
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
        email: vo.userInfo.email,
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
  @RequireLogin()
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
          email: userInfo.email,
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

  @RequireLogin()
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
          email: userInfo.email,
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

  @Get('info')
  @RequireLogin()
  async info(@UserInfo('userId') userId: number) {
    const user = await this.userService.findUserDetailById(userId);
    const vo = new UserDetailVo();
    vo.id = user.id;
    vo.email = user.email;
    vo.username = user.username;
    vo.headPic = user.headPic;
    vo.phoneNumber = user.phoneNumber;
    vo.nickName = user.nickName;
    vo.createTime = user.createTime;
    vo.isFrozen = user.isFrozen;

    return vo;
  }
  @Post(['update', 'admin/update'])
  @RequireLogin()
  async updateUser(
    @UserInfo('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUserInfo(userId, updateUserDto);
  }

  @Post(['update_password', 'admin/update_password'])
  @RequireLogin()
  async updatePassword(
    @UserInfo('userId') userId: number,
    @Body() passwordDto: UpdateUserPasswordDto,
  ) {
    return await this.userService.updatePassword(userId, passwordDto);
  }
  @Get('update_password/captcha')
  async updatePasswordCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(
      `update_password_captcha_${address}`,
      code,
      10 * 60,
    );

    await this.emailService.sendMail({
      to: address,
      subject: '密码修改的验证码',
      html: `<p>你的更改密码验证码是 ${code}</p>`,
    });
    return '验证码发送成功';
  }

  @Get('update/captcha')
  @RequireLogin()
  async updateUserCaptcha(@UserInfo('email') address: string) {
    console.log('address: !!!!!!', address);
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(
      `update_user_captcha_${address}`,
      code,
      10 * 60,
    );

    await this.emailService.sendMail({
      to: address,
      subject: '更改用户信息验证码',
      html: `<p>你的验证码是 ${code}</p>`,
    });
    return '验证码发送成功';
  }

  @Get('freeze')
  @RequireLogin()
  async freeze(@Query('id') userId: number) {
    await this.userService.freezeUserById(userId);
    return '用户冻结成功';
  }

  @Get('list')
  @RequireLogin()
  async list(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query('pageSize', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageSize: number,
    @Query('username') username: string,
    @Query('nickName') nickName: string,
    @Query('email') email: string,
  ) {
    return await this.userService.findUserByPage(
      pageNo,
      pageSize,
      username,
      nickName,
      email,
    );
  }

  @Post('upload')
  @RequireLogin()
  @UseInterceptors(
    FileInterceptor('file', {
      // dest: 'uploads', 和storage的destination功能重复了，所以可以注释掉
      storage: storage, // 重写文件名，防止文件名冲突
      limits: {
        fileSize: 1024 * 1024 * 3, // 最大3M
      },
      fileFilter(req, file, callback) {
        const extname = path.extname(file.originalname);
        if (['.png', '.jpg', '.gif'].includes(extname)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('只能上传图片'), false);
        }
      },
    }),
  )
  UploadedFile(@UploadedFile() file: Express.Multer.File) {
    return file.path;
  }

  @Get('aaa')
  @RequireLogin()
  @requirePermissions(['ddd'])
  aaaa(@UserInfo('username') username: string, @UserInfo() userInfo) {
    // !!!!!!!!从guard中获取中间过程值的user info
    console.log('userInfo: !!!!!!!!', userInfo);
    console.log('username: !!!!!!!!', username);
    return 'aaa';
  }
}
