import { Component, OnInit } from '@angular/core';
import { IonLabel, IonTabButton, IonTab, IonIcon, IonTabBar, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, calendarOutline, personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-influencer-tabs',
  templateUrl: './influencer-tabs.page.html',
  styleUrls: ['./influencer-tabs.page.scss'],
  standalone: true,
  imports: [IonTab, IonTabButton, IonLabel, IonLabel, IonIcon, IonTabBar, IonTabs]
})
export class InfluencerTabsPage implements OnInit {

  constructor() { 
    addIcons({searchOutline, calendarOutline, personCircleOutline});
  }

  ngOnInit() {
  }

}