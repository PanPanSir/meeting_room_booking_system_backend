import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EmailModule } from 'src/email/email.module';
import { Role } from './entities/role.entity';
import { Permissions } from './entities/permissions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permissions]), EmailModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
