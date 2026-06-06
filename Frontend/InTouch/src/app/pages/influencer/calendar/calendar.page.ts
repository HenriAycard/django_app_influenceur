import { Component, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonLabel, IonToolbar, IonText, IonItem, IonIcon, IonAccordion, IonAccordionGroup, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, helpOutline, timeOutline } from 'ionicons/icons';
import { CalendarInfluencerComponent } from 'src/app/modal/calendar/influencer/calendar-influencer.component';
import { ApplicationStore } from 'src/app/features/applications/application.store';
import { AlertControllerService } from 'src/app/services/alert-controller.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, FormsModule, IonLabel, IonText, IonItem, IonIcon, IonAccordion, IonAccordionGroup, IonRefresher, IonRefresherContent, CalendarInfluencerComponent]
})
export class CalendarPage {

  protected readonly store = inject(ApplicationStore);
  private readonly alertCtrlService = inject(AlertControllerService);

  constructor() {
    addIcons({ helpOutline, timeOutline, closeOutline });
  }

  // Fires on every entry (incl. returning from a cached page), so the calendar
  // always reflects the latest data without the old ReloadService coupling.
  ionViewWillEnter(): void {
    this.load();
  }

  public handleRefresh($event: any): void {
    this.load(() => $event.target.complete());
  }

  private load(onDone?: () => void): void {
    this.alertCtrlService.showLoading();
    this.store.loadInfluencerCalendar().subscribe({
      complete: () => { this.alertCtrlService.stopLoading(); onDone?.(); },
      error: () => { this.alertCtrlService.stopLoading(); onDone?.(); },
    });
  }

}
