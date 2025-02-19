import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '会议开始时间',
  })
  startTime: Date;

  @Column({
    comment: '会议结束时间',
  })
  endTime: Date;

  @Column({
    length: 20,
    comment: '状态（申请中、审批通过、审批驳回、已解除）',
    default: '申请中',
  })
  status: string;

  @Column({
    length: 100,
    comment: '备注',
    default: '',
  })
  note: string;

  // 	不要在 @ManyToOne 关系字段上使用 @Column 装饰器。@ManyToOne 会自动生成外键列。
  // 使用 @JoinColumn 来指定外键列的名称，这样就能明确告知 TypeORM 使用哪个列来表示外键。
  // 如果你同时为 @ManyToOne 字段加上了 @Column 装饰器，可能会导致数据库表生成不符合预期或出现类型冲突的错误，因此只需要保留 @ManyToOne 和 @JoinColumn 就可以了。
  @ManyToOne(() => User)
  @JoinColumn({
    name: 'user_booking',
  })
  user: User;

  // 表结构：在当前实体对应的表中生成一个名为roomId的外键字段，直接指向关联表（MeetingRoom表）的主键。
  // 关系表达：表示“多对一”关系（例如多个预订记录属于一个用户），查询时通过单表外键直接关联，无需中间表
  // @ManyToMany + @JoinTable： - 创建一个名为user_booking的中间表，包含两个外键列，通常是两个相关实体的主键。
  @ManyToOne(() => MeetingRoom)
  @JoinColumn({
    name: 'roomId',
  })
  room: MeetingRoom;

  @CreateDateColumn({
    comment: '创建时间',
  })
  createTime: Date;

  @UpdateDateColumn({
    comment: '更新时间',
  })
  updateTime: Date;
}
