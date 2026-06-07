import { Component, OnInit } from '@angular/core';
import { IonLabel, IonTabButton, IonTab, IonIcon, IonTabBar, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, calendarOutline, personCircleOutline } from 'ionicons/icons';

// NOTE: do NOT put OnPush on this tab shell. It hosts <ion-tabs> (a router
// outlet); an undirty OnPush parent makes a CD tick skip its whole subtree, so
// child tab pages that update via a plain subscribe never repaint. The shell
// must stay Default.
@Component({
  selector: 'app-influencer-tabs',
  templateUrl: './influencer-tabs.page.html',
  styleUrls: ['./influencer-tabs.page.scss'],
  standalone: true,
  imports: [IonTabButton, IonLabel, IonLabel, IonIcon, IonTabBar, IonTabs]
})
export class InfluencerTabsPage implements OnInit {

  constructor() { 
    addIcons({searchOutline, calendarOutline, personCircleOutline});
  }

  ngOnInit() {
  }

}