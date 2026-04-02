import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PatientNote, PatientNoteDocument } from './patient-note.schema';

@Injectable()
export class PatientNotesService {
  constructor(
    @InjectModel(PatientNote.name)
    private noteModel: Model<PatientNoteDocument>,
  ) {}

  async create(fromUserId: string, toUserId: string, message: string): Promise<PatientNoteDocument> {
    return this.noteModel.create({
      fromUserId: new Types.ObjectId(fromUserId),
      toUserId: new Types.ObjectId(toUserId),
      message,
    });
  }

  async getBySender(fromUserId: string): Promise<PatientNoteDocument[]> {
    return this.noteModel
      .find({ fromUserId: new Types.ObjectId(fromUserId) })
      .sort({ createdAt: -1 })
      .exec();
  }
}