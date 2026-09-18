import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../core/services/api';
import { Auth } from '../../core/services/auth';
import { getApiErrorMessage } from '../../core/utils/api-error.util';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.scss'
})
export class ContactUs implements OnInit {
  name = '';
  email = '';
  subject = '';
  message = '';
  
  isSubmitting = false;
  messageSent = false;
  isLoggedIn = false;
  errorMsg = '';
  successMsg = '';

  constructor(private api: Api, private auth: Auth, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.auth.getUserStatus().subscribe({
      next: (user) => {
        this.isLoggedIn = !!user;
        this.cdr.detectChanges();
      }
    });
  }

  submitForm() {
    if (!this.isLoggedIn) {
      this.errorMsg = 'Guest accounts cannot send messages. Please log in to submit.';
      return;
    }

    this.isSubmitting = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.api.post('message', { subject: this.subject, message: this.message }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.messageSent = true;
        this.successMsg = 'Your message has been sent successfully! Our team will review it shortly.';
        
        this.name = '';
        this.email = '';
        this.subject = '';
        this.message = '';
        this.cdr.detectChanges();

        setTimeout(() => {
          this.messageSent = false;
          this.successMsg = '';
          this.cdr.detectChanges();
        }, 5000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMsg = getApiErrorMessage(err, 'Failed to send message. Please try again later.');
        this.cdr.detectChanges();
      }
    });
  }
}
