import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  VideoCallInvite,
  VideoCallInviteSchema,
} from './video-call-invite.schema';
import { User, UserSchema } from '../users/users.schema';
import { VideoCallsController } from './video-calls.controller';
import { VideoCallsService } from './video-calls.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VideoCallInvite.name, schema: VideoCallInviteSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [VideoCallsController],
  providers: [VideoCallsService],
  exports: [VideoCallsService],
})
export class VideoCallsModule {}
