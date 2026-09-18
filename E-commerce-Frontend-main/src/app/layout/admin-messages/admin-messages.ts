import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../core/services/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IMessage } from '../../core/models/message';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './admin-messages.html',
  styleUrl: './admin-messages.scss'
})
export class AdminMessages implements OnInit {
  messages: IMessage[] = [];
  isLoading = true;
  detailDialog = false;
  selectedMessage: IMessage | null = null;

  constructor(
    private api: Api,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.isLoading = true;
    this.api.get<{ data: { messages: IMessage[] } }>('message/admin').subscribe({
      next: (res) => {
        this.messages = res.data.messages || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openDetail(msg: IMessage) {
    this.selectedMessage = msg;
    this.detailDialog = true;
  }

  deleteMessage(event: Event, id: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to delete this message?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.api.delete(`message/admin/${id}`).subscribe({
          next: () => {
            this.detailDialog = false;
            this.loadMessages();
          },
          error: () => {
          }
        });
      }
    });
  }
}
