import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';

interface UserProfile {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  department?: string;
  specialization?: string;
  photo?: string;
  medicalRecordNumber?: string;
}

@Component({
  selector: 'app-profile',
  imports: [MaterialModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  user: UserProfile | null = null;
  isLoading = true;
  error = '';

  private readonly API = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.error = 'User not found. Please log in again.';
      this.isLoading = false;
      return;
    }
    this.http.get<UserProfile>(`${this.API}/users/${userId}`).subscribe({
      next: (data) => {
        this.user = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load profile. Please try again.';
        this.isLoading = false;
      },
    });
  }

  getInitials(): string {
    if (!this.user) return '?';
    return `${this.user.firstName?.[0] ?? ''}${this.user.lastName?.[0] ?? ''}`.toUpperCase();
  }

  formatDate(d?: string): string {
    if (!d) return 'Not provided';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}