import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../core/services/api';
import { getApiErrorMessage } from '../core/utils/api-error.util';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  step = 1;
  isLoading = false;
  errorMsg = '';
  otpFormGroup: FormGroup;
  resetFormGroup: FormGroup;

  constructor(private api: Api, private router: Router, private fb: FormBuilder) {
    this.otpFormGroup = this.fb.group({
      mobile: ['', [Validators.required, Validators.pattern('^01[0125][0-9]{8}$')]]
    });
    this.resetFormGroup = this.fb.group({
      otp: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  requestOtp() {
    if (this.otpFormGroup.invalid) {
      this.otpFormGroup.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMsg = '';
    // TODO: needs to be added later
    setTimeout(() => {
      this.step = 2;
      this.isLoading = false;
    }, 1000);
  }

  resetPassword() {
    if (this.resetFormGroup.invalid) {
      this.resetFormGroup.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMsg = '';
    
    this.api.post('auth/forgot-password', {
      mobile: this.otpFormGroup.value.mobile,
      newPassword: this.resetFormGroup.value.newPassword
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = getApiErrorMessage(err, 'Failed to reset password. Please try again.');
      }
    });
  }
}
