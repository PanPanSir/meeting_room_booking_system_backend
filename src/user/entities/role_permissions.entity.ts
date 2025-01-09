import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class role_permissions {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({
    comment: '角色id',
  })
  roleId: string;

  @Column({
    comment: '权限id',
  })
  permissionId: string;
}
