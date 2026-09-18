import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, MenuModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  isSidebarOpen = true;
  userMenu: MenuItem[] | undefined;

  constructor(public auth: Auth, private router: Router) {}

  ngOnInit() {
    this.userMenu = [
      {
        label: 'Storefront',
        icon: 'pi pi-home',
        command: () => { this.router.navigate(['/']); }
      },
      { separator: true },
      {
        label: 'Log Out',
        icon: 'pi pi-power-off',
        command: () => { 
          this.auth.logout(); 
          this.router.navigate(['/login']); 
        }
      }
    ];
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
