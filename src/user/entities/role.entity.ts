import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permissions } from './permissions.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
    comment: '角色名称',
  })
  name: string;

  @ManyToMany(() => Permissions)
  @JoinTable({
    name: 'role_permissions',
  })
  permissions: Permissions[];
}
