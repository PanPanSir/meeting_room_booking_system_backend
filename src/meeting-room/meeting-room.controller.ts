import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { generateParseIntPipe } from 'src/utils';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { RequireLogin } from 'src/custom.decorator';

@Controller('meeting-room')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) {}

  @Get('list')
  async initData(
    /** 这个generateParseIntPipe 管道会将查询参数 pageNo 的值转换为整数（parseInt），并确保其有效 **/
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(2),
      generateParseIntPipe('pageSize'), // 这个自定义管道会将查询参数 pageSize 的值转换为整数（parseInt），并确保其有效
    )
    pageSize: number,
    @Query('name') name: string,
    @Query('capacity') capacity: string,
    @Query('equipment') equipment: string,
  ) {
    const { meetingRooms, totalCount } = await this.meetingRoomService.find(
      pageNo,
      pageSize,
      name,
      capacity,
      equipment,
    );
    return {
      meetingRooms,
      totalCount,
    };
  }

  @Post('create')
  async create(@Body() meetingRoom: CreateMeetingRoomDto) {
    await this.meetingRoomService.create(meetingRoom);
    return '新增成功'; // post代表新增，返回的 code 为201
  }
  @Put('update')
  async update(@Body() meetingRoom: UpdateMeetingRoomDto) {
    await this.meetingRoomService.update(meetingRoom);
    return '更新成功'; // Put代表部分更新，返回的 code 为200
  }
  @Get(':id')
  async findById(@Param('id') id: number) {
    return await this.meetingRoomService.findById(id);
  }

  @RequireLogin()
  @Delete(':id')
  async deleteById(@Param('id') id: number) {
    return await this.meetingRoomService.deleteById(id);
  }
}
