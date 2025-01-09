import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50,
    comment: '用户名',
  })
  username: string;

  @Column({
    length: 50,
    comment: '密码',
  })
  password: string;

  @Column({
    length: 50,
    comment: '昵称',
    name: 'nick_name',
  })
  nickName: string;

  @Column({
    length: 50,
    comment: '邮箱',
  })
  email: string;

  @Column({
    length: 100,
    comment: '头像',
    nullable: true,
  })
  headPic: string;

  @Column({
    length: 20,
    comment: '手机号',
    nullable: true,
  })
  phoneNumber: string;

  @Column({
    comment: '是否冻结',
    nullable: true,
  })
  isFrozen: boolean;

  @Column({
    comment: '是否为管理员',
    default: false,
  })
  isAdmin: boolean;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_role',
  })
  roles: Role[];
}
