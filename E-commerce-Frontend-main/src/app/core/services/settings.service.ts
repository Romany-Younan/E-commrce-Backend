import { Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { Api } from './api';
import { ApiResponse } from '../models/api-response';
import { ISettings } from '../models/settings';
import { DEFAULT_SEASON } from '../constants/seasons';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  constructor(private api: Api) {}

  getSettings(): Observable<ISettings> {
    return this.api
      .get<ApiResponse<{ settings: ISettings }>>('settings')
      .pipe(map(res => res.data.settings));
  }

  getCurrentSeason(): Observable<string> {
    return this.getSettings().pipe(
      map(s => s.currentSeason || DEFAULT_SEASON),
      catchError(() => of(DEFAULT_SEASON))
    );
  }

  updateSeason(currentSeason: string): Observable<ISettings> {
    return this.api
      .patch<ApiResponse<{ settings: ISettings }>>('settings', { currentSeason })
      .pipe(map(res => res.data.settings));
  }
}
