import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../core/services/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IUser } from '../../core/models/user';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, TagModule, DialogModule, InputTextModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss'
})
export class AdminUsers implements OnInit {
  users: IUser[] = [];
  filteredUsers: IUser[] = [];
  isLoading = true;
  searchQuery = '';
  detailDialog = false;
  selectedUser: IUser | null = null;
  isToggling = false;

  constructor(private api: Api, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.isLoading = true;
    this.api.get<{ data: { users: IUser[] } }>('admin/users').subscribe({
      next: (res) => {
        this.users = res.data.users;
        this.filteredUsers = [...this.users];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; }
    });
  }

  filterUsers() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.mobile?.includes(q)
      );
    }
  }

  openDetail(user: IUser) {
    this.selectedUser = { ...user };
    this.detailDialog = true;
  }

  toggleActive() {
    if (!this.selectedUser) return;
    this.isToggling = true;
    const newStatus = !this.selectedUser.isActive;
    this.api.patch<{ data: { user: IUser } }>(`admin/users/${this.selectedUser._id}`, { isActive: newStatus }).subscribe({
      next: (res) => {
        if (this.selectedUser) {
          this.selectedUser.isActive = res.data.user.isActive;
        }
        this.isToggling = false;
        this.loadUsers();
        this.cdr.detectChanges();
      },
      error: () => { this.isToggling = false; }
    });
  }
}
