import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Api } from '../core/services/api';
import { Auth } from '../core/services/auth';
import { CartService } from '../core/services/cart';
import { AuthResponse } from '../core/models/auth-response';
import { getApiErrorMessage } from '../core/utils/api-error.util';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, ReactiveFormsModule, ButtonModule, InputTextModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  errorMsg = '';

  constructor(private api: Api, private auth: Auth, private router: Router, private cart: CartService, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      mobile: ['', [Validators.required, Validators.pattern('^01[0-9]{9}$')]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.errorMsg = '';
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    const formValues = this.loginForm.value;
    this.api.post<AuthResponse>('auth/login', {
      mobile: formValues.mobile,
      password: formValues.password
    }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.auth.checkIfLogedIn();
        this.cart.syncGuestCart().subscribe({
          next: () => this.router.navigate(['/']),
          error: () => this.router.navigate(['/'])
        });
      },
      error: (err) => {
        this.errorMsg = getApiErrorMessage(err, 'Invalid mobile or password.');
        this.isLoading = false;
      }
    });
  }
}
