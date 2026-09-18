import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { SettingsService } from '../../core/services/settings.service';
import { SEASON_OPTIONS, DEFAULT_SEASON } from '../../core/constants/seasons';
import { getApiErrorMessage } from '../../core/utils/api-error.util';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SelectModule],
  templateUrl: './admin-settings.html',
  styleUrl: './admin-settings.scss'
})
export class AdminSettings implements OnInit {
  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  currentSeason = DEFAULT_SEASON;
  seasons = SEASON_OPTIONS;

  constructor(private settings: SettingsService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.isLoading = true;
    this.settings.getSettings().subscribe({
      next: (data) => {
        this.currentSeason = data.currentSeason || DEFAULT_SEASON;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveSettings() {
    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.settings.updateSeason(this.currentSeason).subscribe({
      next: (data) => {
        this.successMessage = 'Store season updated. Home and products pages will reflect this change.';
        this.currentSeason = data.currentSeason;
        this.isSaving = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = getApiErrorMessage(err, 'Failed to save settings.');
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }
}
