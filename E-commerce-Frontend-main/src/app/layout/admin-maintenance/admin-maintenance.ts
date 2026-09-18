import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Api } from '../../core/services/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { getApiErrorMessage } from '../../core/utils/api-error.util';

@Component({
  selector: 'app-admin-maintenance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, ConfirmDialogModule, InputTextModule],
  providers: [ConfirmationService],
  templateUrl: './admin-maintenance.html',
  styleUrl: './admin-maintenance.scss'
})
export class AdminMaintenance {
  backupLoading = false;
  backupSuccess = '';
  backupError = '';

  restoreLoading = false;
  restoreSuccess = '';
  restoreError = '';

  restoreForm!: FormGroup;

  constructor(private api: Api, private fb: FormBuilder, private cdr: ChangeDetectorRef, private confirmationService: ConfirmationService) {
    this.restoreForm = this.fb.group({
      folderName: ['', Validators.required]
    });
  }

  createBackup() {
    this.backupLoading = true;
    this.backupSuccess = '';
    this.backupError = '';

    this.api.post('admin/backup', {}).subscribe({
      next: () => {
        this.backupLoading = false;
        this.backupSuccess = `Backup created successfully at ${new Date().toLocaleString()}.`;
        this.cdr.detectChanges();
        setTimeout(() => { this.backupSuccess = ''; this.cdr.detectChanges(); }, 5000);
      },
      error: (err) => {
        this.backupLoading = false;
        this.backupError = getApiErrorMessage(err, 'Failed to create backup.');
        this.cdr.detectChanges();
        setTimeout(() => { this.backupError = ''; this.cdr.detectChanges(); }, 4000);
      }
    });
  }

  confirmRestore(event: Event) {
    if (this.restoreForm.invalid) {
      this.restoreForm.markAllAsTouched();
      return;
    }

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `This will OVERWRITE the current database with the backup from folder "${this.restoreForm.value.folderName}". This action cannot be undone. Are you absolutely sure?`,
      header: 'Danger — Confirm Restore',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Restore Now',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      acceptIcon: 'none',
      rejectIcon: 'none',
      accept: () => {
        this.runRestore();
      }
    });
  }

  runRestore() {
    this.restoreLoading = true;
    this.restoreSuccess = '';
    this.restoreError = '';

    this.api.post('admin/restore', { folderName: this.restoreForm.value.folderName }).subscribe({
      next: () => {
        this.restoreLoading = false;
        this.restoreSuccess = 'Database restored successfully.';
        this.restoreForm.reset();
        this.cdr.detectChanges();
        setTimeout(() => { this.restoreSuccess = ''; this.cdr.detectChanges(); }, 5000);
      },
      error: (err) => {
        this.restoreLoading = false;
        this.restoreError = getApiErrorMessage(err, 'Restore failed. Check the folder name and try again.');
        this.cdr.detectChanges();
        setTimeout(() => { this.restoreError = ''; this.cdr.detectChanges(); }, 4000);
      }
    });
  }

  get f() { return this.restoreForm.controls; }
}
