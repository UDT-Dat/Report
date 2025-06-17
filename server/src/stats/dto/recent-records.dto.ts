import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/user.model';
import { Post } from '../../post/post.model';
import { Event } from '../../event/event.model';
import { Permission } from '../../library/models/permission.model';

export class RecentRecordsDto {
  @ApiProperty({
    type: [User],
    description: '5 bản ghi User mới nhất',
  })
  users: User[];

  @ApiProperty({
    type: [Post],
    description: '5 bản ghi Post mới nhất',
  })
  posts: Post[];

  @ApiProperty({
    type: [Event],
    description: '5 bản ghi Event mới nhất',
  })
  events: Event[];

  @ApiProperty({
    type: [Permission],
    description: '5 bản ghi Permission mới nhất',
  })
  permissions: Permission[];
}
