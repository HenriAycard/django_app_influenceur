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
            path: 'messages',
            loadComponent: () => import('../../features/messaging/pages/inbox/inbox.page').then(m => m.InboxPage)
        },
        {
            path: 'messages/:conversationId',
            loadComponent: () => import('../../features/messaging/pages/thread/thread.page').then(m => m.ThreadPage)
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
          path: 'profile/security',
          loadComponent: () => import('../profile/security/security.page').then(m => m.SecurityPage)
        },
        {
            path: 'venue/create',
            loadComponent: () => import('./venue/create/create.page').then(m => m.CreatePage)
        },
        {
            path: 'venue/:venueId',
            loadComponent: () => import('./venue/view/venue-view.page').then(m => m.VenueViewPage)
        },
        {
            path: 'venue/:venueId/edit',
            loadComponent: () => import('./venue/edit/venue-edit.page').then(m => m.VenueEditPage)
        },
        {
            path: 'venue/:venueId/analytics',
            loadComponent: () => import('../../features/analytics/pages/venue-analytics/venue-analytics.page').then(m => m.VenueAnalyticsPage)
        },
        {
            path: 'venue/:venueId/archives',
            loadComponent: () => import('../../features/offers/pages/offer-archive-list/offer-archive-list.page').then(m => m.OfferArchiveListPage)
        },
        {
            path: 'venue/:venueId/offer/create',
            loadComponent: () => import('../../features/offers/pages/offer-create/offer-create.page').then(m => m.OfferCreatePage)
        },
        {
            path: 'venue/:venueId/offer/:offerId',
            loadComponent: () => import('../../features/offers/pages/offer-detail/offer-detail.page').then(m => m.OfferDetailPage)
        },
        {
            path: 'venue/:venueId/offer/:offerId/edit',
            loadComponent: () => import('../../features/offers/pages/offer-edit/offer-edit.page').then(m => m.OfferEditPage)
        },
        {
            path: 'booking/:bookingId',
            loadComponent: () => import('./booking/view/brand-booking-view.page').then(m => m.BrandBookingViewPage)
        },
        {
            // Mirrors the influencer 'collaboration/:bookingId/offer/:offerId' route:
            // app-booking-view navigates relatively to the offer, so the booking
            // detail needs this child route (was missing on the brand side).
            path: 'booking/:bookingId/offer/:offerId',
            loadComponent: () => import('../../features/offers/pages/offer-detail/offer-detail.page').then(m => m.OfferDetailPage)
        },
        {
            path: 'influencers',
            loadComponent: () => import('./influencers/influencers.page').then(m => m.InfluencersPage)
        },
        {
            path: 'influencers/:influencerId',
            loadComponent: () => import('./influencers/detail/influencer-detail.page').then(m => m.InfluencerDetailPage)
        },
        {
            path: '',
            redirectTo: '/brand/home',
            pathMatch: 'full'
        },
    ]
  }
]