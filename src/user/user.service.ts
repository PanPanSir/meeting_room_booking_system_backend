import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { md5 } from 'src/utils';

@Injectable()
export class UserService {
  // !!! 为什么用InjectRepository而不是用entityManger，见user.service.study.md
  // @Inject(EntityManager)
  // private readonly entityManager: EntityManager;

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

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

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
