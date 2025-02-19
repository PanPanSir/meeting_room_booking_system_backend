import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { User } from 'src/user/entities/user.entity';
import { Between, createQueryBuilder, Like, Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingService {
  @InjectRepository(User)
  private userRepository: Repository<User>;

  @InjectRepository(MeetingRoom)
  private meetingRoomRepository: Repository<MeetingRoom>;

  @InjectRepository(Booking)
  private bookingRepository: Repository<Booking>;

  async initData() {
    const user1 = await this.userRepository.findOne({
      where: { id: 9 },
    });

    const user2 = await this.userRepository.findOne({
      where: { id: 10 },
    });

    const room1 = await this.meetingRoomRepository.findOneBy({
      id: 1,
    });
    const room2 = await await this.meetingRoomRepository.findOneBy({
      id: 2,
    });

    const booking1 = new Booking();
    booking1.room = room1;
    booking1.user = user1;
    booking1.startTime = new Date();
    booking1.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.bookingRepository.save(booking1);

    const booking2 = new Booking();
    booking2.room = room2;
    booking2.user = user2;
    booking2.startTime = new Date();
    booking2.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.bookingRepository.save(booking2);

    const booking3 = new Booking();
    booking3.room = room1;
    booking3.user = user2;
    booking3.startTime = new Date();
    booking3.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.bookingRepository.save(booking3);

    const booking4 = new Booking();
    booking4.room = room2;
    booking4.user = user1;
    booking4.startTime = new Date();
    booking4.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.bookingRepository.save(booking4);
  }

  async list(
    pageNo,
    pageSize,
    username,
    meetingRoomName,
    meetingRoomPosition,
    bookingTimeRangeStart,
    bookingTimeRangeEnd,
  ) {
    const skipCount = (pageNo - 1) * pageSize;

    const [bookings, totalCount] = await this.bookingRepository.findAndCount({
      skip: skipCount,
      take: pageSize,
      where: {
        user: {
          username: Like(`%${username}%`),
        },
        room: {
          name: Like(`%${meetingRoomName}%`),
          location: Like(`%${meetingRoomPosition}%`),
        },
        startTime: Between(
          new Date(bookingTimeRangeStart),
          new Date(bookingTimeRangeEnd),
        ),
      },
      relations: {
        user: true,
        room: true,
      },
    });
    return {
      bookings,
      totalCount,
      pageNo,
      pageSize,
    };
  }

  // 这个list使用了外键，如果不用外键怎么写查询语句？
  async searchWithoutForeignKey(
    pageNo,
    pageSize,
    username,
    meetingRoomName,
    meetingRoomPosition,
    bookingTimeRangeStart,
    bookingTimeRangeEnd,
  ) {
    const skipCount = (pageNo - 1) * pageSize;
    const bookingIdsQueryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .select('booking.id', 'id')
      .leftJoin('booking.user', 'user')
      .leftJoin('booking.room', 'room');
    if (username) {
      bookingIdsQueryBuilder.andWhere('user.username LIKE :username', {
        username: `%${username}%`,
      });
    }
    if (meetingRoomName) {
      bookingIdsQueryBuilder.andWhere('room.name LIKE :meetingRoomName', {
        meetingRoomName: `%${meetingRoomName}%`,
      });
    }
    if (meetingRoomPosition) {
      bookingIdsQueryBuilder.andWhere(
        'room.location LIKE :meetingRoomPosition',
        {
          meetingRoomPosition: `%${meetingRoomPosition}%`,
        },
      );
    }
    if (bookingTimeRangeEnd && bookingTimeRangeEnd) {
      bookingIdsQueryBuilder.andWhere(
        'booking.startTime BETWEEN :bookingTimeRangeStart AND :bookingTimeRangeEnd',
        {
          bookingTimeRangeStart,
          bookingTimeRangeEnd,
        },
      );
    }
    bookingIdsQueryBuilder
      .orderBy('booking.startTime', 'DESC')
      .offset(skipCount)
      .limit(pageSize);
    const bookingIds = await bookingIdsQueryBuilder
      .getRawMany()
      .then((res) => res.map((booking) => booking.id));

    console.log('!!!!!bookingIds', bookingIds);

    const query = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.room', 'room')
      .where('booking.id IN (:...ids)', { ids: bookingIds });
    // 获取总数
    const total = await this.bookingRepository.count();
    return {
      bookings: await query.getMany(),
      totalCount: total,
      pageNo,
      pageSize,
    };
  }
}
