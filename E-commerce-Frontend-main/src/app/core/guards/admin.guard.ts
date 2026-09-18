import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, ITokenDecoded } from '../services/auth';
import { jwtDecode } from 'jwt-decode';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  const token = auth.getTokenFromLocalStorage();

  if (token) {
    try {
      const decoded = jwtDecode<ITokenDecoded>(token);
      if (decoded.exp * 1000 > Date.now() && decoded.role === 'admin') {
        return true;
      }
    } catch {
    }
  }

  return router.createUrlTree(['/']);
};
