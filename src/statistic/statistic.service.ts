import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { User } from 'src/user/entities/user.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class StatisticService {
  @InjectEntityManager()
  private entityManger: EntityManager;

  async userBookingCount(startTime: string, endTime: string) {
    await this.entityManger
      .createQueryBuilder(Booking, 'b')
      .select('u.id', '用户id')
      .addSelect('u.username', '用户名')
      .leftJoin(User, 'u', 'b.user_booking = u.id')
      .addSelect('count(1)', 'bookingCount')
      .where('b.startTime between :time1 and :time2', {
        time1: startTime,
        time2: endTime,
      })
      .addGroupBy('b.user_booking')
      .getRawMany();
  }

  async meetingRoomUsedCount(startTime: string, endTime: string) {
    await this.entityManger
      .createQueryBuilder(Booking, 'b')
      .select('mr.id', '会议室id')
      .leftJoin(MeetingRoom, 'mr', 'mr.id = b.roomId')
      .addSelect('count(1)', 'bookingCount')
      .where('b.startTime between :time1 and :time2', {
        time1: startTime,
        time2: endTime,
      })
      .addGroupBy('mr.id')
      .getRawMany();
  }
}
