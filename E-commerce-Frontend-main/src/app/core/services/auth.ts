import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

export interface ITokenDecoded {
  id: string;
  name: string;
  role: string;
  exp: number;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private userData = new BehaviorSubject<ITokenDecoded | null>(null);
  private tokenStorageKey = 'token';

  constructor(private router: Router) {
    this.checkIfLogedIn();
  }

  checkIfLogedIn() {
    const token = this.getTokenFromLocalStorage();
    if (token) {
      const decode = this.decodeToken(token);
      if (decode && decode.exp * 1000 > Date.now()) {
        this.userData.next(decode);
      } else {
        this.logout();
      }
    } else {
      this.userData.next(null);
    }
  }

  getUserStatus() {
    return this.userData.asObservable();
  }

  getTokenFromLocalStorage() {
    return localStorage.getItem(this.tokenStorageKey);
  }

  logout() {
    localStorage.removeItem(this.tokenStorageKey);
    this.userData.next(null);
    this.router.navigate(['/login']);
  }

  private decodeToken(token: string): ITokenDecoded | null {
    try {
      return jwtDecode<ITokenDecoded>(token);
    } catch {
      return null;
    }
  }
}
