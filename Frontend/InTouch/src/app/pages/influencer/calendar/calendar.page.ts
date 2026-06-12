import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Location, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonLabel, IonToolbar, IonText, IonItem, IonIcon, IonAccordion, IonAccordionGroup, IonRefresher, IonRefresherContent, IonCol, IonGrid, IonRow, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, NavController, RefresherCustomEvent } from '@ionic/angular/standalone';
import { Application, ApplicationView } from 'src/app/shared/models';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeCircleOutline, closeOutline, helpOutline, mailOutline, timeOutline } from 'ionicons/icons';
import { CalendarInfluencerComponent } from 'src/app/modal/calendar/influencer/calendar-influencer.component';
import { ApplicationStore } from 'src/app/features/applications/application.store';
import { AlertControllerService } from 'src/app/services/alert-controller.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonHeader, IonTitle, IonToolbar, FormsModule, IonLabel, IonText, IonItem, IonIcon, IonAccordion, IonAccordionGroup, IonRefresher, IonRefresherContent, IonCol, IonGrid, IonRow, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, CalendarInfluencerComponent, DatePipe]
})
export class CalendarPage {

  protected readonly store = inject(ApplicationStore);
  private readonly alertCtrlService = inject(AlertControllerService);
  private readonly navCtrl = inject(NavController);
  private readonly location = inject(Location);

  private readonly toastService = inject(ToastService);

  constructor() {
    addIcons({ helpOutline, timeOutline, closeOutline, mailOutline, checkmarkCircleOutline, closeCircleOutline });
  }

  // Fires on every entry (incl. returning from a cached page), so the calendar
  // always reflects the latest data without the old ReloadService coupling.
  ionViewWillEnter(): void {
    this.load();
  }

  public handleRefresh($event: RefresherCustomEvent): void {
    this.load(() => $event.target.complete());
  }

  private load(onDone?: () => void): void {
    this.alertCtrlService.showLoading();
    this.store.loadInfluencerCalendar().subscribe({
      complete: () => { this.alertCtrlService.stopLoading(); onDone?.(); },
      error: () => { this.alertCtrlService.stopLoading(); onDone?.(); },
    });
  }

  public displayInfo(application: ApplicationView): void {
    this.location.replaceState('/influencer/calendar');
    this.navCtrl.navigateForward(['/influencer/collaboration/', application.id]);
  }

  public respondToInvitation(application: ApplicationView, accept: boolean): void {
    const action$ = accept ? this.store.accept(application.id) : this.store.decline(application.id);
    action$.subscribe({
      next: () => {
        this.toastService.toastSuccess(
          accept ? 'Invitation accepted!' : 'Invitation declined',
          accept ? 'The collaboration is now confirmed.' : 'The venue has been notified.',
        );
        this.load();
      },
      error: () => this.toastService.toastDanger('Error', 'Could not respond to the invitation. Please try again.'),
    });
  }

}
