import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-account',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account implements OnInit {
  userName = '';

  constructor(private auth: Auth, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.auth.getUserStatus().subscribe(user => {
      this.userName = user ? user.name : '';
      this.cdr.detectChanges();
    });
  }

  logout() {
    this.auth.logout();
  }
}
