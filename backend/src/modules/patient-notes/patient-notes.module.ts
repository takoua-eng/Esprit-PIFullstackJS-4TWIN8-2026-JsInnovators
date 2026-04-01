import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientNote, PatientNoteSchema } from './patient-note.schema';
import { PatientNotesService } from './patient-notes.service';
import { PatientNotesController } from './patient-notes.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PatientNote.name, schema: PatientNoteSchema }]),
  ],
  controllers: [PatientNotesController],
  providers: [PatientNotesService],
  exports: [PatientNotesService],
})
export class PatientNotesModule {}