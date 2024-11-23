import { Routes } from "@angular/router";
import { InfluencerTabsPage } from "./influencer-tabs.page";

export const INFLUENCER_TABS_ROUTES: Routes = [{
    path: '',
    component: InfluencerTabsPage,
    children: [
      {
        path: 'explorer',
        loadComponent: () => import('../explorer/explorer.page').then(m => m.ExplorerPage)
      },
      {
        path: 'explorer/view-search',
        loadComponent: () => import('../explorer/view-search/view-search.page').then(m => m.ViewSearchPage)
      },
      {
        path: 'explorer/experience',
        loadComponent: () => import('../explorer/experience/experience.page').then(m => m.ExperiencePage)
      },
      {
        path: 'calendar',
        loadComponent: () => import('../calendar/calendar.page').then(m => m.CalendarPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('../profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: '',
        redirectTo: '/influencer/explorer',
        pathMatch: 'full'
      },
    ]
  }
]