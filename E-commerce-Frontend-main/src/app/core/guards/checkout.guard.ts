import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CheckoutGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.auth.getUserStatus().pipe(
      map(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }
        if (user.role === 'admin') {
          this.router.navigate(['/admin']);
          return false;
        }
        return true;
      })
    );
  }
}
