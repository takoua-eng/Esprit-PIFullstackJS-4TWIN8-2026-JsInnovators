import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';

@Injectable()
export class CoordinatorService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getDashboard(coordinatorId: string) {
    const coordinator = await this.userModel
      .findById(coordinatorId)
      .populate('assignedPatients')
      .exec();

    if (!coordinator) {
      throw new NotFoundException('Coordinator not found');
    }

    const patients = coordinator.assignedPatients as unknown as UserDocument[];

    return {
      totalAssignedPatients: patients.length,
      incompleteEntries: 0,
      remindersSentToday: 0,
      activeAlerts: 0,
    };
  }

  async getAssignedPatients(coordinatorId: string) {
    const coordinator = await this.userModel
      .findById(coordinatorId)
      .populate('assignedPatients')
      .exec();

    if (!coordinator) {
      throw new NotFoundException('Coordinator not found');
    }

    const patients = coordinator.assignedPatients as unknown as UserDocument[];

    return patients.map((patient) => ({
      _id: patient._id,
      name: `${patient.firstName} ${patient.lastName}`,
      email: patient.email,
      department: patient.department ?? '',
      status: 'Follow-up pending',
    }));
  }
}