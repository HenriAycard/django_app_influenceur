import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, calendarOutline, personCircleOutline } from 'ionicons/icons';

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
