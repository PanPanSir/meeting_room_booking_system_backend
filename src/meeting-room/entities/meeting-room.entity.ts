import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class MeetingRoom {
  @PrimaryGeneratedColumn({
    comment: '会议室id',
  })
  id: number;

  @Column({
    comment: '会议室名称',
    length: 50,
  })
  name: string;

  @Column({
    comment: '会议室容量',
  })
  capacity: number;

  @Column({
    length: 50,
    comment: '会议室位置',
  })
  location: string;

  @Column({
    comment: '设备',
    length: 50,
    default: '',
  })
  equipment: string;

  @Column({
    comment: '描述',
    length: 100,
    default: '',
  })
  description: string;

  @Column({
    comment: '是否被预定',
    default: false,
  })
  isBooked: boolean;

  @CreateDateColumn({
    comment: '创建时间',
  })
  createTime: Date;

  @UpdateDateColumn({
    comment: '修改时间',
  })
  updateTime: Date;
}
