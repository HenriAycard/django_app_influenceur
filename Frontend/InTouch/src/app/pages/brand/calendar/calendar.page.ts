import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Location, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonLabel, IonToolbar, IonText, IonItem, IonIcon, IonAccordion, IonAccordionGroup, IonRefresher, IonRefresherContent, IonCol, IonGrid, IonRow, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, NavController, RefresherCustomEvent } from '@ionic/angular/standalone';
import { Application } from 'src/app/shared/models';
import { addIcons } from 'ionicons';
import { closeOutline, helpOutline, timeOutline } from 'ionicons/icons';
import { CalendarVenueComponent } from 'src/app/modal/calendar/venue/calendar-venue.component';
import { ApplicationStore } from 'src/app/features/applications/application.store';
import { AlertControllerService } from 'src/app/services/alert-controller.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, FormsModule, IonLabel, IonText, IonItem, IonIcon, IonAccordion, IonAccordionGroup, IonRefresher, IonRefresherContent, IonCol, IonGrid, IonRow, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, CalendarVenueComponent, DatePipe]
})
export class CalendarPage {

  protected readonly store = inject(ApplicationStore);
  private readonly alertCtrlService = inject(AlertControllerService);
  private readonly navCtrl = inject(NavController);
  private readonly location = inject(Location);

  constructor() {
    addIcons({ helpOutline, timeOutline, closeOutline });
  }

  ionViewWillEnter(): void {
    this.load();
  }

  public handleRefresh($event: RefresherCustomEvent): void {
    this.load(() => $event.target.complete());
  }

  private load(onDone?: () => void): void {
    this.alertCtrlService.showLoading();
    this.store.loadBrandCalendar().subscribe({
      complete: () => { this.alertCtrlService.stopLoading(); onDone?.(); },
      error: () => { this.alertCtrlService.stopLoading(); onDone?.(); },
    });
  }

  public displayInfo(application: Application): void {
    this.location.replaceState('/brand/calendar');
    this.navCtrl.navigateForward(['/brand/booking/', application.id]);
  }

}
