import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notifModel: Model<NotificationDocument>,
  ) {}

  async create(data: {
    userId: string | Types.ObjectId;
    title: string;
    message: string;
    type?: string;
    relatedUserId?: string | Types.ObjectId;
  }) {
    return this.notifModel.create(data);
  }

  async findForUser(userId: string) {
    // Match both string and ObjectId stored values
    const query = Types.ObjectId.isValid(userId)
      ? { $or: [{ userId: userId }, { userId: new Types.ObjectId(userId) }] }
      : { userId };

    return this.notifModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async countUnread(userId: string): Promise<number> {
    const query = Types.ObjectId.isValid(userId)
      ? { $or: [{ userId: userId }, { userId: new Types.ObjectId(userId) }], isRead: false }
      : { userId, isRead: false };
    return this.notifModel.countDocuments(query);
  }

  async markRead(id: string) {
    return this.notifModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
  }

  async markAllRead(userId: string) {
    const query = Types.ObjectId.isValid(userId)
      ? { $or: [{ userId: userId }, { userId: new Types.ObjectId(userId) }], isRead: false }
      : { userId, isRead: false };
    return this.notifModel.updateMany(query, { isRead: true });
  }

  /**
   * Called when a new patient is created with a doctor assigned.
   * Sends notification to both patient and doctor.
   */
  async notifyPatientAssigned(patient: any, doctor: any): Promise<void> {
    const patientName = `${patient.firstName} ${patient.lastName}`;
    const doctorName  = `Dr. ${doctor.firstName} ${doctor.lastName}`;
    const specialty   = doctor.specialization ?? '';

    const patientId = patient._id?.toString ? patient._id.toString() : patient._id;
    const doctorId  = doctor._id?.toString  ? doctor._id.toString()  : doctor._id;

    console.log('📨 Sending notification to patient:', patientId);
    console.log('📨 Sending notification to doctor:', doctorId);

    // Notification → Patient
    await this.create({
      userId:        patientId,
      title:         'Welcome to MediFlow 👋',
      message:       `You have been assigned to ${doctorName}${specialty ? ' · ' + specialty : ''}. Your care journey starts now.`,
      type:          'WELCOME',
      relatedUserId: doctorId,
    });

    // Notification → Doctor
    await this.create({
      userId:        doctorId,
      title:         'New patient assigned 🩺',
      message:       `${patientName} has been assigned to you. Please review their profile and start follow-up.`,
      type:          'PATIENT_ASSIGNED',
      relatedUserId: patientId,
    });

    console.log('✅ Both notifications saved in DB');
  }
}
