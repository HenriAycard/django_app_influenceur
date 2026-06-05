import { Routes } from "@angular/router";
import { InfluencerTabsPage } from "./influencer-tabs/influencer-tabs.page";

export const INFLUENCER_TABS_ROUTES: Routes = [{
  path: '',
  component: InfluencerTabsPage,
  children: [
    {
      path: 'home',
      loadComponent: () => import('./home/home.page').then(m => m.HomeInfluencerPage)
    },
    {
      path: 'home/search',
      loadComponent: () => import('./home/search/search.page').then(m => m.SearchPage)
    },
    {
      path: 'home/search/company/:companyId',
      loadComponent: () => import('./company/company.page').then(m => m.CompanyPage)
    },
    {
      path: 'home/search/company/:companyId/contract/:contractId',
      loadComponent: () => import('../../features/offers/pages/offer-detail/offer-detail.page').then(m => m.OfferDetailPage)
    },
    {
      path: 'calendar',
      loadComponent: () => import('./calendar/calendar.page').then(m => m.CalendarPage)
    },
    {
      path: 'profile',
      loadComponent: () => import('../profile/main/profile.page').then(m => m.ProfilePage)
    },
    {
      path: 'profile/edit',
      loadComponent: () => import('../profile/edit/profile-edit.page').then(m => m.ProfileEditPage)
    },
    {
      path: 'collaboration/:bookingId',
      loadComponent: () => import('./collaboration/main/influencer-collaboration.page').then(m => m.InfluencerCollaborationPage)
    },
    {
      path: 'collaboration/:bookingId/contract/:contractId',
      loadComponent: () => import('../../features/offers/pages/offer-detail/offer-detail.page').then(m => m.OfferDetailPage)
    },
    {
      path: '',
      redirectTo: '/influencer/home',
      pathMatch: 'full'
    },
  ]
}
]