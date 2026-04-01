import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientService } from 'src/app/services/patient.service';

interface Contact {
  _id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  specialization?: string;
  department?: string;
}

interface SentNote {
  _id?: string;
  toUserId: string;
  message: string;
  createdAt?: string;
}

@Component({
  selector: 'app-messages',
  imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent implements OnInit {
  messageForm: FormGroup;
  contacts: Contact[] = [];
  sentNotes: SentNote[] = [];
  isLoadingContacts = true;
  isLoadingSent = true;
  isSending = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private patientService: PatientService) {
    this.messageForm = this.fb.group({
      toUserId: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  ngOnInit() {
    this.patientService.getDoctorsAndNurses().subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        this.isLoadingContacts = false;
      },
      error: () => { this.isLoadingContacts = false; },
    });

    this.patientService.getMySentNotes().subscribe({
      next: (notes) => {
        this.sentNotes = notes;
        this.isLoadingSent = false;
      },
      error: () => { this.isLoadingSent = false; },
    });
  }

  getContactName(id: string): string {
    const c = this.contacts.find(x => x._id === id);
    return c ? `${c.firstName} ${c.lastName}` : id;
  }

  onSubmit() {
    if (this.messageForm.invalid) {
      this.messageForm.markAllAsTouched();
      return;
    }
    this.isSending = true;
    this.successMessage = '';
    this.errorMessage = '';
    const { toUserId, message } = this.messageForm.value;

    this.patientService.sendNote(toUserId, message).subscribe({
      next: (note: any) => {
        this.sentNotes.unshift(note);
        this.isSending = false;
        this.successMessage = 'Message sent successfully!';
        this.messageForm.reset();
      },
      error: () => {
        this.isSending = false;
        this.errorMessage = 'Failed to send message. Please try again.';
      },
    });
  }
}