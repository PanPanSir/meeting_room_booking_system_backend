import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Booking } from './entities/booking.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Booking, MeetingRoom])],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
