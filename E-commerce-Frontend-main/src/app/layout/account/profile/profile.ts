import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../../core/services/api';
import { Auth } from '../../../core/services/auth';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IUser } from '../../../core/models/user';
import { getApiErrorMessage } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  user: IUser | null = null;
  isLoading = true;
  isSaving = false;
  showPasswordForm = false;
  successMsg = '';
  errorMsg = '';

  name = '';
  email = '';
  phoneNumber = '';
  currentPassword = '';
  newPassword = '';
  passwordConfirm = '';

  constructor(private api: Api, private auth: Auth, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.api.get<{ data: { user: IUser } }>('user/me').subscribe({
      next: (res) => {
        this.user = res.data.user;
        this.name = this.user.name;
        this.email = this.user.email || '';
        this.phoneNumber = this.user.phoneNumber || this.user.mobile || '';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  saveProfile() {
    this.isSaving = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.api.patch('user/updateMe', { name: this.name, email: this.email }).subscribe({
      next: () => {
        this.successMsg = 'Profile updated successfully!';
        this.isSaving = false;
        this.auth.checkIfLogedIn();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = getApiErrorMessage(err, 'Failed to update profile.');
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  changePassword() {
    this.isSaving = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.api.patch('user/updateMyPassword', {
      currentPassword: this.currentPassword,
      password: this.newPassword,
      passwordConfirm: this.passwordConfirm
    }).subscribe({
      next: () => {
        this.successMsg = 'Password changed successfully!';
        this.showPasswordForm = false;
        this.currentPassword = this.newPassword = this.passwordConfirm = '';
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = getApiErrorMessage(err, 'Failed to change password.');
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }
}
