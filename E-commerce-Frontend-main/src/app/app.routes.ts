import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Home } from './layout/home/home';
import { ProductsList } from './layout/products-list/products-list';
import { ProductDetails } from './layout/product-details/product-details';
import { Cart } from './layout/cart/cart';
import { Checkout } from './layout/checkout/checkout';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { Account } from './layout/account/account';
import { Profile } from './layout/account/profile/profile';
import { MyOrders } from './layout/account/my-orders/my-orders';
import { OrderDetail } from './layout/account/order-detail/order-detail';
import { Addresses } from './layout/account/addresses/addresses';
import { MyTestimonial } from './layout/account/my-testimonial/my-testimonial';
import { About } from './layout/about/about';
import { ContactUs } from './layout/contact-us/contact-us';
import { Testimonials } from './layout/testimonials/testimonials';
import { ForgotPassword } from './forgot-password/forgot-password';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { AdminDashboard } from './layout/admin-dashboard/admin-dashboard';
import { AdminProducts } from './layout/admin-products/admin-products';
import { AdminCategories } from './layout/admin-categories/admin-categories';
import { AdminSubcategories } from './layout/admin-subcategories/admin-subcategories';
import { AdminOrders } from './layout/admin-orders/admin-orders';
import { AdminUsers } from './layout/admin-users/admin-users';
import { AdminTestimonials } from './layout/admin-testimonials/admin-testimonials';
import { AdminReports } from './layout/admin-reports/admin-reports';
import { AdminSettings } from './layout/admin-settings/admin-settings';
import { AdminHeroSlides } from './layout/admin-hero-slides/admin-hero-slides';
import { AdminRefunds } from './layout/admin-refunds/admin-refunds';
import { AdminMaintenance } from './layout/admin-maintenance/admin-maintenance';
import { AdminMessages } from './layout/admin-messages/admin-messages';
import { guestGuard } from './core/guards/guest-guard';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin.guard';
import { userGuard } from './core/guards/user.guard';
import { CheckoutGuard } from './core/guards/checkout.guard';
import { NotFound } from './layout/not-found/not-found';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      { path: '', component: AdminDashboard },
      { path: 'products', component: AdminProducts },
      { path: 'categories', component: AdminCategories },
      { path: 'subcategories', component: AdminSubcategories },
      { path: 'orders', component: AdminOrders },
      { path: 'users', component: AdminUsers },
      { path: 'testimonials', component: AdminTestimonials },
      { path: 'reports', component: AdminReports },
      { path: 'settings', component: AdminSettings },
      { path: 'hero-slides', component: AdminHeroSlides },
      { path: 'refunds', component: AdminRefunds },
      { path: 'maintenance', component: AdminMaintenance },
      { path: 'messages', component: AdminMessages },
      { path: '**', redirectTo: '/not-found' }
    ]
  },
  {
    path: '',
    component: Layout,
    children: [
      { path: '', component: Home },
      { path: 'products', component: ProductsList },
      { path: 'about', component: About },
      { path: 'contact', component: ContactUs },
      { path: 'testimonials', component: Testimonials },
      { path: 'product/:id', component: ProductDetails },
      { path: 'cart', component: Cart, canActivate: [userGuard] },
      { path: 'checkout', component: Checkout, canActivate: [authGuard, userGuard, CheckoutGuard] },
      { path: 'login', component: Login, canActivate: [guestGuard] },
      { path: 'signup', component: Signup, canActivate: [guestGuard] },
      { path: 'forgot-password', component: ForgotPassword, canActivate: [guestGuard] },
      { path: 'not-found', component: NotFound },
      {
        path: 'account',
        component: Account,
        canActivate: [authGuard, userGuard],
        children: [
          { path: '', redirectTo: 'profile', pathMatch: 'full' },
          { path: 'profile', component: Profile },
          { path: 'orders', component: MyOrders },
          { path: 'orders/:id', component: OrderDetail },
          { path: 'addresses', component: Addresses },
          { path: 'testimonial', component: MyTestimonial },
        ]
      },
      { path: '**', component: NotFound }
    ]
  }
];
