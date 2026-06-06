import { Routes } from "@angular/router";
import { BrandTabsPage } from "./brand-tabs/brand-tabs.page";

export const BRAND_TABS_ROUTES: Routes = [{
    path: '',
    component: BrandTabsPage,
    children: [
        {
            path: 'calendar',
            loadComponent: () => import('./calendar/calendar.page').then( m => m.CalendarPage)
        },
        {
            path: 'home',
            loadComponent: () => import('./home/home.page').then( m => m.HomePage)
        },
        {
            path: 'profile',
            loadComponent: () => import('../profile/main/profile.page').then( m => m.ProfilePage)
        },
        {
          path: 'profile/edit',
          loadComponent: () => import('../profile/edit/profile-edit.page').then(m => m.ProfileEditPage)
        },
        {
            path: 'company/create',
            loadComponent: () => import('./company/create/create.page').then(m => m.CreatePage)
        },
        {
            path: 'company/:companyId',
            loadComponent: () => import('./company/view/company-view.page').then(m => m.CompanyViewPage)
        },
        {
            path: 'company/:companyId/edit',
            loadComponent: () => import('./company/edit/company-edit.page').then(m => m.CompanyEditPage)
        },
        {
            path: 'company/:companyId/offer/create',
            loadComponent: () => import('../../features/offers/pages/offer-create/offer-create.page').then(m => m.OfferCreatePage)
        },
        {
            path: 'company/:companyId/offer/:offerId',
            loadComponent: () => import('../../features/offers/pages/offer-detail/offer-detail.page').then(m => m.OfferDetailPage)
        },
        {
            path: 'company/:companyId/offer/:offerId/edit',
            loadComponent: () => import('../../features/offers/pages/offer-edit/offer-edit.page').then(m => m.OfferEditPage)
        },
        {
            path: 'booking/:bookingId',
            loadComponent: () => import('./booking/view/brand-booking-view.page').then(m => m.BrandBookingViewPage)
        },
        {
            path: '',
            redirectTo: '/brand/home',
            pathMatch: 'full'
        },
    ]
  }
]