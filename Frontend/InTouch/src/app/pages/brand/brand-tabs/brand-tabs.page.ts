import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, calendarOutline, personCircleOutline } from 'ionicons/icons';

// NOTE: do NOT put OnPush on this tab shell. It hosts <ion-tabs> (a router
// outlet); an undirty OnPush parent makes a CD tick skip its whole subtree, so
// child tab pages that update via a plain subscribe (e.g. brand home) never
// repaint. Signal-driven children would be fine, but the shell must stay Default.
@Component({
  selector: 'app-brand-tabs',
  templateUrl: './brand-tabs.page.html',
  styleUrls: ['./brand-tabs.page.scss'],
  standalone: true,
  imports: [IonTabButton, IonLabel, IonLabel, IonIcon, IonTabBar, IonTabs]
})
export class BrandTabsPage {

  constructor() { 
    addIcons({searchOutline, calendarOutline, personCircleOutline});
  }

}
