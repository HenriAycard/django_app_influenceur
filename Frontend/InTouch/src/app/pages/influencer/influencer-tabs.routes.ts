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
      path: 'home/search/venue/:venueId',
      loadComponent: () => import('./venue/venue.page').then(m => m.VenuePage)
    },
    {
      path: 'home/search/venue/:venueId/offer/:offerId',
      loadComponent: () => import('../../features/offers/pages/offer-detail/offer-detail.page').then(m => m.OfferDetailPage)
    },
    {
      path: 'calendar',
      loadComponent: () => import('./calendar/calendar.page').then(m => m.CalendarPage)
    },
    {
      path: 'messages',
      loadComponent: () => import('../../features/messaging/pages/inbox/inbox.page').then(m => m.InboxPage)
    },
    {
      path: 'messages/:conversationId',
      loadComponent: () => import('../../features/messaging/pages/thread/thread.page').then(m => m.ThreadPage)
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
      path: 'profile/security',
      loadComponent: () => import('../profile/security/security.page').then(m => m.SecurityPage)
    },
    {
      path: 'profile/stats',
      loadComponent: () => import('../../features/analytics/pages/influencer-analytics/influencer-analytics.page').then(m => m.InfluencerAnalyticsPage)
    },
    {
      path: 'collaboration/:bookingId',
      loadComponent: () => import('./collaboration/main/influencer-collaboration.page').then(m => m.InfluencerCollaborationPage)
    },
    {
      path: 'collaboration/:bookingId/offer/:offerId',
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