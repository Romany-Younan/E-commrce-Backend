import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Api } from '../core/services/api';
import { Auth } from '../core/services/auth';
import { CartService } from '../core/services/cart';
import { AuthResponse } from '../core/models/auth-response';
import { getApiErrorMessage } from '../core/utils/api-error.util';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  signupForm: FormGroup;
  isLoading = false;
  errorMsg = '';

  constructor(private api: Api, private auth: Auth, private router: Router, private cart: CartService, private fb: FormBuilder) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern('^01[0-9]{9}$')]],
      email: ['', Validators.email],
      gender: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', Validators.required],
      termsAccepted: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const passwordConfirm = control.get('passwordConfirm');
    if (password && passwordConfirm && password.value !== passwordConfirm.value) {
      passwordConfirm.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  onSubmit() {
    this.errorMsg = '';
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValues = this.signupForm.value;
    const body = {
      name: formValues.name.trim(),
      mobile: formValues.mobile.trim(),
      email: formValues.email?.trim() || undefined,
      password: formValues.password,
      passwordConfirm: formValues.passwordConfirm,
      gender: formValues.gender,
      termsAccepted: formValues.termsAccepted,
    };

    this.api.post<AuthResponse>('auth/register', body).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.auth.checkIfLogedIn();
        this.cart.syncGuestCart().subscribe({
          next: () => this.router.navigate(['/']),
          error: () => this.router.navigate(['/'])
        });
      },
      error: (err) => {
        this.errorMsg = getApiErrorMessage(err, 'Registration failed. Please try again.');
        this.isLoading = false;
      }
    });
  }
}
