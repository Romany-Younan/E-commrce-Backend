import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { CartService } from '../../../core/services/cart';
import { DrawerModule } from 'primeng/drawer';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, DrawerModule, NgIf],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  userName = '';
  token = false;
  isAdmin = false;
  sidebarVisible = false;
  cartCount = 0;

  constructor(private authService: Auth, private cdr: ChangeDetectorRef, private cartService: CartService) {}

  ngOnInit(): void {
    this.authService.getUserStatus().subscribe((data) => {
      if (data) {
        this.userName = data.name;
        this.token = true;
        this.isAdmin = data.role === 'admin';
      } else {
        this.userName = '';
        this.token = false;
        this.isAdmin = false;
      }
      this.cdr.detectChanges();
    });

    this.cartService.getCartCount().subscribe((count) => {
      this.cartCount = count;
      this.cdr.detectChanges();
    });
  }

  logout() {
    this.authService.logout();
  }

  toggleSideBar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
}
