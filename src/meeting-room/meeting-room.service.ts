import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';
import { Like, Repository } from 'typeorm';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';

@Injectable()
export class MeetingRoomService {
  @InjectRepository(MeetingRoom)
  private repository: Repository<MeetingRoom>;

  async initData() {
    // this.repository.save()
    const room1 = new MeetingRoom();
    room1.name = '木星';
    room1.capacity = 10;
    room1.equipment = '白板';
    room1.location = '一层西';

    const room2 = new MeetingRoom();
    room2.name = '金星';
    room2.capacity = 5;
    room2.equipment = '';
    room2.location = '二层东';

    const room3 = new MeetingRoom();
    room3.name = '天王星';
    room3.capacity = 30;
    room3.equipment = '白板，电视';
    room3.location = '三层东';

    //  确定是 insert 的时候 用 insert 比用 save 更好，能够批量插入数据。

    // 同理，确定是 update 的时候，也不要用 save，因为它会先 select 一次，再确定是 udpate 还是 insert。
    this.repository.save([room1, room2, room3]);
  }

  async find(
    pageNo: number,
    pageSize: number,
    name: string,
    capacity: string,
    equipment: string,
  ) {
    const skipCount = (pageNo - 1) * pageSize;
    const condition: Record<string, any> = {};
    if (name) {
      condition.name = Like(`%${name}%`);
    }
    if (capacity) {
      condition.capacity = Like(`%${capacity}%`);
    }
    if (equipment) {
      condition.equipment = Like(`%${equipment}%`);
    }
    const [meetingRooms, totalCount] = await this.repository.findAndCount({
      skip: skipCount,
      take: pageSize,
      where: condition,
    });
    return {
      meetingRooms,
      totalCount,
    };
  }

  async create(meetingRoom: CreateMeetingRoomDto) {
    const findMeetingRoom = await this.repository.find({
      where: {
        name: meetingRoom.name,
      },
    });
    if (findMeetingRoom.length) {
      throw new BadRequestException('会议室名称已存在');
    }
    return await this.repository.insert(meetingRoom);
  }

  async update(meetingRoom: UpdateMeetingRoomDto) {
    const [findMeetingRoom] = await this.repository.find({
      where: {
        id: meetingRoom.id,
      },
    });
    if (!findMeetingRoom) {
      throw new BadRequestException('会议室不存在');
    }
    findMeetingRoom.name = meetingRoom.name;
    findMeetingRoom.capacity = meetingRoom.capacity;
    findMeetingRoom.location = meetingRoom.location;
    if (meetingRoom.equipment) {
      findMeetingRoom.equipment = meetingRoom.equipment;
    }
    if (meetingRoom.description) {
      findMeetingRoom.description = meetingRoom.description;
    }
    return await this.repository.update(
      { id: findMeetingRoom.id },
      findMeetingRoom,
    );
  }

  async findById(id: number) {
    return this.repository.findOneBy({ id });
  }
  async deleteById(id: number) {
    await this.repository.delete(id);
    return 'success';
  }
}
