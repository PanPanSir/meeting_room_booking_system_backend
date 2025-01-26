import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EmailModule } from 'src/email/email.module';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

@Module({
  // 引入并配置数据库实体：通过 TypeOrmModule.forFeature 方法，当前模块可以访问并操作 User、Role、Permission 这三个实体对应的数据库表。
  imports: [TypeOrmModule.forFeature([User, Role, Permission]), EmailModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
