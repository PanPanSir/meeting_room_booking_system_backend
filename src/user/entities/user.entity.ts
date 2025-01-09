import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
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
  })
  nick_name: string;

  @Column({
    length: 50,
    comment: '邮箱',
  })
  email: string;

  @Column({
    length: 100,
    comment: '头像',
  })
  head_pic: string;

  @Column({
    length: 20,
    comment: '手机号',
  })
  phone_number: string;

  @Column({
    comment: '是否冻结',
  })
  is_frozen: boolean;

  @Column({
    comment: '是否为管理员',
  })
  is_Admin: boolean;

  @Column({
    comment: '创建时间',
  })
  createTime: Date;

  @Column({
    comment: '更新时间',
  })
  updateTime: Date;
}
