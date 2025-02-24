import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { User } from 'src/user/entities/user.entity';
import { Between, LessThan, Like, MoreThan, Or, Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class BookingService {
  @InjectRepository(User)
  private userRepository: Repository<User>;

  @InjectRepository(MeetingRoom)
  private meetingRoomRepository: Repository<MeetingRoom>;

  @InjectRepository(Booking)
  private bookingRepository: Repository<Booking>;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(EmailService)
  private emailService: EmailService;

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

    const condition: Record<string, any> = {};
    if (username) {
      condition.user = {
        username: Like(`%${username}%`),
      };
    }
    if (meetingRoomName) {
      condition.room = {
        name: Like(`%${meetingRoomName}%`),
      };
    }
    if (meetingRoomPosition) {
      condition.room = {
        location: Like(`%${meetingRoomPosition}%`),
      };
    }
    let endTime = bookingTimeRangeEnd;
    if (bookingTimeRangeStart) {
      if (!bookingTimeRangeEnd) {
        endTime = bookingTimeRangeStart + 60 * 60 * 1000;
      }
      condition.startTime = Between(
        new Date(bookingTimeRangeStart),
        new Date(endTime),
      );
    }
    const [bookings, totalCount] = await this.bookingRepository.findAndCount({
      skip: skipCount,
      take: pageSize,
      where: condition,
      relations: {
        user: true,
        room: true,
      },
    });
    return {
      bookings: bookings.map((item) => {
        delete item.user.password;
        return item;
      }),
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
    console.log('!!!!!!meetingRoomName', meetingRoomName);

    const bookingIdsQueryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .select('booking.id', 'id')
      .leftJoin('booking.user', 'user')
      .leftJoin('booking.room', 'room');
    // .leftJoin('booking.user_booking', 'user') // 错误：应使用实体属性名 user, 而不是数据库列名user_booking或者数据库表名users
    // .leftJoin('booking.roomId', 'room'); // 错误：应使用实体属性名 room，而不是数据库列名roomId或者数据库表名meeting_room
    if (username) {
      bookingIdsQueryBuilder.andWhere('user.username LIKE :username', {
        username: `%${username}`,
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
    if (bookingTimeRangeStart && bookingTimeRangeEnd) {
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
    // 获取总数
    const total = await this.bookingRepository.count();

    // 如果筛选出的bookingId为空，则直接返回，不能进行子查询
    if (!bookingIds.length) {
      return {
        bookings: [],
        totalCount: total,
        pageNo,
        pageSize,
      };
    }
    const query = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user') // leftJoinAndSelect是为了把user和room两个实体数据塞到结果中
      //   {
      //     "code": 200,
      //     "message": "success",
      //     "data": {
      //         "bookings": [
      //             {
      //                 "id": 3,
      //                 "startTime": "2025-02-18T07:38:58.000Z",
      //                 "endTime": "2025-02-18T08:38:58.000Z",
      //                 "status": "申请中",
      //                 "note": "",
      //                 "createTime": "2025-02-18T07:38:57.718Z",
      //                 "updateTime": "2025-02-20T01:51:26.249Z",
      //                 "user": { // leftJoinAndSelect 的功劳
      //                     "id": 10,
      //                     "username": "测试01",
      //                     "password": "111111",
      //                     "nickName": "神说要有光-2",
      //                     "email": "5f8e5d3084750d8f7a26919681295204",
      //                     "headPic": null,
      //                     "phoneNumber": null,
      //                     "isFrozen": null,
      //                     "isAdmin": false,
      //                     "createTime": "2025-02-18T06:53:51.197Z",
      //                     "updateTime": "2025-02-18T06:53:51.197Z"
      //                 },
      //                 "room": { // leftJoinAndSelect 的功劳
      //                     "id": 1,
      //                     "name": "木星",
      //                     "capacity": 10,
      //                     "location": "一层西",
      //                     "equipment": "白板，电视",
      //                     "description": "",
      //                     "isBooked": false,
      //                     "createTime": "2025-02-14T06:30:52.485Z",
      //                     "updateTime": "2025-02-14T06:30:52.485Z"
      //                 }
      //             },
      //         ],
      //         "totalCount": 4,
      //         "pageNo": 2,
      //         "pageSize": 2
      //     }
      // }
      .leftJoinAndSelect('booking.room', 'room')
      .where('booking.id IN (:...ids)', { ids: bookingIds }); // 先筛选出目标ids，然后填充每一个id对应的数据内容。这样可以避免分页膨胀/分页偏移
    return {
      bookings: (await query.getMany()).map((item) => {
        delete item.user.password;
        return item;
      }),
      totalCount: total,
      pageNo,
      pageSize,
    };
  }

  async add(booking: CreateBookingDto, userId: number) {
    const meetingRoom = await this.meetingRoomRepository.findOneBy({
      id: booking.meetingRoomId,
    });
    if (!meetingRoom) {
      throw new BadRequestException('会议室不存在');
    }
    const user = await this.userRepository.findOneBy({
      id: userId,
    });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    const bookingEntity = new Booking();
    bookingEntity.room = meetingRoom;
    bookingEntity.startTime = new Date(booking.startTime);
    bookingEntity.user = user;
    let endTime = new Date(booking.endTime);
    if (!booking.endTime) {
      endTime = new Date(booking.startTime + 60 * 60 * 1000);
    } else {
      bookingEntity.endTime = new Date(endTime);
    }

    console.log(
      '!!!!!!!!!LessThan(new Date(bookingEntity.startTime))',
      LessThan(new Date(bookingEntity.startTime)),
    );

    console.log(
      '!!!!1new Date(bookingEntity.startTime)',
      new Date(bookingEntity.startTime),
    );

    console.log(
      '!!!!!!!!!morewhan(new Date(bookingEntity.endTime))',
      MoreThan(new Date(bookingEntity.endTime)),
    );
    console.log(
      '!!!!!!!!!new Date(bookingEntity.endTime)',
      new Date(bookingEntity.endTime),
    );

    const res = await this.bookingRepository.findOne({
      where: [
        {
          room: meetingRoom,
          endTime: MoreThan(new Date(bookingEntity.startTime)),
          startTime: LessThan(new Date(bookingEntity.endTime)),
        },
      ],
    });
    if (res) {
      throw new BadRequestException('该时间段已被预定');
    }
    await this.bookingRepository.save(bookingEntity);
  }

  async apply(id: number) {
    await this.bookingRepository.update(id, { status: '审批通过' });
  }
  async reject(id: number) {
    await this.bookingRepository.update(id, { status: '审批驳回' });
  }
  async unbind(id: number) {
    await this.bookingRepository.update(id, { status: '已解除' });
  }

  async urge(id: number) {
    const redisKey = `urge_${id}`;
    const flag = await this.redisService.get(redisKey);
    if (flag) {
      return '半小时之内只能催办一次，请耐心等待';
    }
    const redisAdminEmailKey = `admin_email`;
    let adminEmail = await this.redisService.get(redisAdminEmailKey);
    if (!adminEmail) {
      const admin = await this.userRepository.findOne({
        select: {
          email: true,
        },
        where: {
          isAdmin: true,
        },
      });
      adminEmail = admin.email;
      this.redisService.set(redisAdminEmailKey, adminEmail);
    }
    this.emailService.sendMail({
      to: adminEmail,
      subject: '预定申请催办提醒',
      html: `id 为 ${id} 的预定申请正在等待审批`,
    });
    this.redisService.set(redisKey, 1, 60 * 30);
  }
}
