import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { md5 } from 'src/utils';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserVo } from './vo/login-user.vo';
import { userInfo } from 'os';

@Injectable()
export class UserService {
  // !!! 为什么用InjectRepository而不是用entityManger，见user.service.study.md
  // @Inject(EntityManager)
  // private readonly entityManager: EntityManager;

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>;

  @InjectRepository(Permission)
  private readonly permissionsRepository: Repository<Permission>;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  private logger = new Logger();

  async register(registerUser: RegisterUserDto) {
    const captcha = await this.redisService.get(
      `captcha_${registerUser.email}`,
    );
    if (!captcha) {
      throw new HttpException('验证码过期', HttpStatus.BAD_REQUEST);
    }
    if (captcha !== registerUser.captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }
    const userExist = await this.userRepository.findOneBy({
      username: registerUser.username,
    });
    if (userExist) {
      throw new HttpException('用户名已存在', HttpStatus.BAD_REQUEST);
    }
    const user = new User();
    user.username = registerUser.username;
    user.password = registerUser.password;
    user.email = md5(registerUser.email);
    user.nickName = registerUser.nickName;
    try {
      await this.userRepository.save(user);
      return '注册成功';
    } catch (error) {
      this.logger.error(error);
      return '注册失败';
    }
  }

  async initData() {
    const user1 = new User();
    user1.username = 'zhangsan';
    user1.password = md5('111111');
    user1.email = 'xxx@xx.com';
    user1.isAdmin = true;
    user1.nickName = '张三';
    user1.phoneNumber = '13233323333';

    const user2 = new User();
    user2.username = 'lisi';
    user2.password = md5('222222');
    user2.email = 'yy@yy.com';
    user2.nickName = '李四';

    const permission1 = new Permission();
    permission1.code = 'ccc';
    permission1.desc = '访问 ccc 接口';

    const permission2 = new Permission();
    permission2.code = 'ddd';
    permission2.desc = '访问 ddd 接口';

    const role1 = new Role();
    role1.name = '管理员';
    role1.permissions = [permission1, permission2];

    const role2 = new Role();
    role2.name = '普通用户';
    role2.permissions = [permission1];

    user1.roles = [role1];
    user2.roles = [role2];

    await this.permissionsRepository.save([permission1, permission2]);
    await this.roleRepository.save([role1, role2]);
    await this.userRepository.save([user1, user2]);
  }

  async login(loginUser: LoginUserDto, isAdmin: boolean) {
    const userInfo = await this.userRepository.findOne({
      where: {
        username: loginUser.username,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });
    if (!userInfo) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    if (userInfo.password !== md5(loginUser.password)) {
      throw new HttpException('用户密码错误', HttpStatus.BAD_REQUEST);
    }
    const vo = new LoginUserVo();
    vo.userInfo = {
      id: userInfo.id,
      username: userInfo.username,
      nickName: userInfo.nickName,
      email: userInfo.email,
      phoneNumber: userInfo.phoneNumber,
      headPic: userInfo.headPic,
      createTime: userInfo.createTime.getTime(),
      isFrozen: userInfo.isFrozen,
      isAdmin: userInfo.isAdmin,
      roles: userInfo.roles.map((role) => role.name),
      permissions: userInfo.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };
    return vo;
  }
  async findUserById(userId: number, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        isAdmin,
        id: userId,
      },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) {
      throw new HttpException('token错误', HttpStatus.BAD_REQUEST);
    }
    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };
  }
}
