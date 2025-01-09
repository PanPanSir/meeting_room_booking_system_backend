import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class user_roles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '用户Id',
  })
  user_id: string;

  @Column({
    comment: '角色Id',
  })
  role_id: string;
}
