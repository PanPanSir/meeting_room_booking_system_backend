import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '会议开始时间',
  })
  start_time: Date;

  @Column({
    comment: '会议结束时间',
  })
  end_time: Date;

  @Column({
    length: 20,
    comment: '预定状态（申请中、审批成功、审批失败、已解除）',
    default: '申请中',
  })
  status: string;

  @Column({
    length: 100,
    comment: '备注',
  })
  note: string;

  @Column({
    comment: '会议预订人',
  })
  @ManyToOne(() => User)
  user: User;

  @Column({
    comment: '会议室id',
  })
  @ManyToOne(() => MeetingRoom)
  room: MeetingRoom;

  @Column({
    comment: '创建时间',
  })
  create_time: Date;

  @Column({
    comment: '创建时间',
  })
  update_time: Date;
}
