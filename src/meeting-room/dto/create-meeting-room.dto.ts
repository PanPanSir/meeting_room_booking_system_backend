import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateMeetingRoomDto {
  @IsNotEmpty({
    message: '会议名称不能为空',
  })
  @MaxLength(10, {
    message: '会议名称最长为 10 个字符',
  })
  name: string;

  @IsNotEmpty({
    message: '会议容量不能为空',
  })
  capacity: number;

  @IsNotEmpty({
    message: '会议位置不能为空',
  })
  @MaxLength(50, {
    message: '会议位置最长为 50 个字符',
  })
  location: string;

  @MaxLength(50, {
    message: '会议设备最长为 50 个字符',
  })
  equipment: string;

  @MaxLength(100, {
    message: '会议描述最长为 100 个字符',
  })
  description: string;
}
