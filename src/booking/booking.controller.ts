import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { generateParseIntPipe } from 'src/utils';
import { RequireLogin, UserInfo } from 'src/custom.decorator';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('list')
  @RequireLogin()
  async list(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(2),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,
    @Query('username') username: string,
    @Query('meetingRoomName') meetingRoomName: string,
    @Query('meetingRoomPosition') meetingRoomPosition: string,
    @Query('bookingTimeRangeStart') bookingTimeRangeStart: number,
    @Query('bookingTimeRangeEnd') bookingTimeRangeEnd: number,
  ) {
    return await this.bookingService.list(
      // 有外键的处理方式
      // return await this.bookingService.searchWithoutForeignKey( // 无外键的处理方式
      pageNo,
      pageSize,
      username,
      meetingRoomName,
      meetingRoomPosition,
      bookingTimeRangeStart,
      bookingTimeRangeEnd,
    );
  }

  @Post('add')
  @RequireLogin()
  async add(
    @Body() booking: CreateBookingDto,
    @UserInfo('userId') userId: number,
  ) {
    await this.bookingService.add(booking, userId);
    return 'success';
  }
  @Get('apply/:id')
  @RequireLogin()
  async apply(@Param('id') id: number) {
    return this.bookingService.apply(id);
  }

  @Get('reject/:id')
  @RequireLogin()
  async reject(@Param('id') id: number) {
    return this.bookingService.reject(id);
  }

  @Get('unbind/:id')
  @RequireLogin()
  async unbind(@Param('id') id: number) {
    return this.bookingService.unbind(id);
  }

  @Get('urge/:id')
  async urge(@Param('id') id: number) {
    return this.bookingService.urge(id);
  }
}
