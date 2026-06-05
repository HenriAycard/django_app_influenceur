import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonThumbnail, IonTitle, IonLabel, IonToolbar, IonText, IonItem, IonIcon, IonAccordion, IonAccordionGroup, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { BookingStatus } from 'src/app/models/booking';
import { ApiBookingService } from 'src/app/services/api/api-booking.service';
import { AlertControllerService } from 'src/app/services/alert-controller.service';
import { addIcons } from 'ionicons';
import { closeOutline, helpOutline, timeOutline } from 'ionicons/icons';
import { CalendarInfluencerComponent } from 'src/app/modal/calendar/influencer/calendar-influencer.component';
import { ReloadService } from 'src/app/services/reload.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonLabel, IonText, IonItem, IonIcon, IonAccordion, IonAccordionGroup, IonRefresher, IonRefresherContent, CalendarInfluencerComponent]
})
export class CalendarPage implements OnInit {

  dataWaiting : Array<BookingStatus> = new Array<BookingStatus>()
  countWaiting : number = 0;

  dataLastExperiences : Array<BookingStatus> = new Array<BookingStatus>()
  countLastExperiences : number = 0;

  dataUnsuccessful : Array<BookingStatus> = new Array<BookingStatus>()
  countUnsuccessful : number = 0;

  dataComingSoon : Array<BookingStatus> = new Array<BookingStatus>()
  countComingSoon : number = 0;

  private apiBooking = inject(ApiBookingService)
  private alertCtrlService = inject(AlertControllerService)
  private reloadService = inject(ReloadService);

  constructor() {
    addIcons({helpOutline,timeOutline,closeOutline})
    this.reloadService.reload$.subscribe(() => {
      this.loadData()
    })
  }

  ngOnInit(): void {
    this.loadData()
  }

  public handleRefresh($event: any){
    setTimeout(() => {
        this.loadData()
      }, 2000);
  }

  public loadData() {
    this.alertCtrlService.showLoading();
    const dateObj = new Date()
    this.findResaWaiting(dateObj)
    this.findResaLastExperiences(dateObj)
    this.findResaUnsuccessful(dateObj)
    this.findResaComingSoon(dateObj)
  }


  public async findResaWaiting(dateObj: Date){
    
    this.dataWaiting = new Array<BookingStatus>()
    
    await this.apiBooking.findBooking4Influencer(0, dateObj, 'from_date').subscribe({
        next: (response: Array<BookingStatus>) => {
          this.dataWaiting = response as BookingStatus[]
          this.countWaiting = this.dataWaiting.length
        },
        complete: () => this.alertCtrlService.stopLoading()
      });
  }

  public async findResaLastExperiences(dateObj: Date){
    
    this.dataLastExperiences = new Array<BookingStatus>()

    await this.apiBooking.findBooking4Influencer(1, dateObj, 'to_date').subscribe({
      next: (response: Array<BookingStatus>) => {
        this.dataLastExperiences = response as BookingStatus[]
        this.countLastExperiences = this.dataLastExperiences.length
      },
      complete: () => this.alertCtrlService.stopLoading()
    })
  }

  public async findResaUnsuccessful(dateObj: Date){
    
    this.dataUnsuccessful = new Array<BookingStatus>()

    await this.apiBooking.findBooking4Influencer(2, dateObj).subscribe({
      next: (response: Array<BookingStatus>) => {
        this.dataUnsuccessful = response as BookingStatus[]
        this.countUnsuccessful = this.dataUnsuccessful.length
      },
      complete: () => this.alertCtrlService.stopLoading()
    });
  }

  public async findResaComingSoon(dateObj: Date){

    this.dataComingSoon = new Array<BookingStatus>()
    
    await this.apiBooking.findBooking4Influencer(1, dateObj).subscribe({
      next: (response: Array<BookingStatus>) => {
        this.dataComingSoon = response as BookingStatus[]
        this.countComingSoon = this.dataComingSoon.length
      },
      complete: () => this.alertCtrlService.stopLoading()
    });
  }

}
