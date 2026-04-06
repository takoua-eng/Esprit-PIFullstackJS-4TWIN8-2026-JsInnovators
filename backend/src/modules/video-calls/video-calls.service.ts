import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  VideoCallInvite,
  VideoCallInviteDocument,
} from './video-call-invite.schema';
import { User, UserDocument } from '../users/users.schema';

const INVITE_TTL_MS = 2 * 60 * 60 * 1000;

export type VideoCallInviteDto = {
  _id: string;
  roomName: string;
  physicianUserId: string;
  physicianName: string;
  createdAt: string;
};

@Injectable()
export class VideoCallsService {
  private readonly logger = new Logger(VideoCallsService.name);

  constructor(
    @InjectModel(VideoCallInvite.name)
    private readonly inviteModel: Model<VideoCallInviteDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  static buildRoomName(patientId: string, physicianUserId: string): string {
    return `EspritCare-${patientId}-${physicianUserId}`;
  }

  async createInvite(body: {
    patientId: string;
    physicianUserId: string;
  }): Promise<VideoCallInviteDto> {
    const { patientId, physicianUserId } = body;
    if (!patientId?.trim() || !physicianUserId?.trim()) {
      throw new BadRequestException('patientId and physicianUserId are required');
    }
    if (!Types.ObjectId.isValid(patientId) || !Types.ObjectId.isValid(physicianUserId)) {
      throw new BadRequestException('patientId and physicianUserId must be valid ObjectIds');
    }
    const pid = new Types.ObjectId(patientId);
    const did = new Types.ObjectId(physicianUserId);
    const roomName = VideoCallsService.buildRoomName(patientId, physicianUserId);
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

    /** `dismissedAt: null` matches both “field missing” and explicit null (unlike only `$exists: false`). */
    await this.inviteModel
      .updateMany(
        { patientId: pid, dismissedAt: null },
        { $set: { dismissedAt: new Date() } },
      )
      .exec();

    const doc = await this.inviteModel.create({
      patientId: pid,
      physicianUserId: did,
      roomName,
      expiresAt,
    });

    this.logger.log(
      `VideoCallInvite saved _id=${doc._id.toString()} db=${this.inviteModel.db.name} room=${roomName}`,
    );

    return this.toDto(doc);
  }

  async findPendingForPatient(patientId: string): Promise<VideoCallInviteDto | null> {
    if (!Types.ObjectId.isValid(patientId)) {
      throw new BadRequestException('patientId must be a valid ObjectId');
    }
    const pid = new Types.ObjectId(patientId);
    const now = new Date();
    const doc = await this.inviteModel
      .findOne({
        patientId: pid,
        dismissedAt: null,
        expiresAt: { $gt: now },
      })
      .sort({ createdAt: -1 })
      .exec();

    if (!doc) return null;
    return this.toDto(doc);
  }

  async dismiss(inviteId: string, patientId: string): Promise<{ ok: boolean }> {
    if (!Types.ObjectId.isValid(inviteId) || !Types.ObjectId.isValid(patientId)) {
      throw new BadRequestException('Invalid id');
    }
    const doc = await this.inviteModel.findById(inviteId).exec();
    if (!doc) {
      throw new NotFoundException('Invite not found');
    }
    const pid = new Types.ObjectId(patientId);
    if (!doc.patientId.equals(pid)) {
      throw new BadRequestException('Invite does not belong to this patient');
    }
    doc.dismissedAt = new Date();
    await doc.save();
    return { ok: true };
  }

  private async toDto(doc: VideoCallInviteDocument): Promise<VideoCallInviteDto> {
    const phys = await this.userModel
      .findById(doc.physicianUserId)
      .select('firstName lastName')
      .lean()
      .exec();
    const physicianName = phys
      ? [phys.firstName, phys.lastName].filter(Boolean).join(' ').trim() ||
        'Physician'
      : 'Physician';

    return {
      _id: doc._id.toString(),
      roomName: doc.roomName,
      physicianUserId: doc.physicianUserId.toString(),
      physicianName,
      createdAt: (doc as { createdAt?: Date }).createdAt?.toISOString?.() ?? new Date().toISOString(),
    };
  }
}
