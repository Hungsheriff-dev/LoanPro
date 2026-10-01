import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService); //dùng để kiểm tra role
    const router = inject(Router); //dùng để chuyển trang

    if (auth.hasAnyRole(allowedRoles)) {
      return true;
    }

    // Không đủ quyền → đá về dashboard
    router.navigate(['/dashboard']);
    return false;
  };
}