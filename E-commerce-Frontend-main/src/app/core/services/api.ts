import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export type QueryParams = Record<string, string | number | boolean>;
export type RequestBody = FormData | object;

@Injectable({
  providedIn: 'root'
})
export class Api {
  private readonly baseUrl = API_BASE_URL;

  constructor(private http: HttpClient) {}

  private url(path: string): string {
    return `${this.baseUrl}/${path}`;
  }

  get<T>(path: string, params?: QueryParams): Observable<T> {
    return this.http.get<T>(this.url(path), { params });
  }

  post<T>(path: string, body: RequestBody): Observable<T> {
    return this.http.post<T>(this.url(path), body);
  }

  patch<T>(path: string, body: RequestBody): Observable<T> {
    return this.http.patch<T>(this.url(path), body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.url(path));
  }
}
