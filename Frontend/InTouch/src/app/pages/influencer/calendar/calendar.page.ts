import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonThumbnail, IonTitle, IonLabel, IonToolbar, IonText, IonItem, IonIcon, IonAccordion, IonAccordionGroup, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { BookingStatus } from 'src/app/models/booking';
import { ApiBookingService } from 'src/app/services/api/api-booking.service';
import { AlertControllerService } from 'src/app/services/alert-controller.service';
import { addIcons } from 'ionicons';
import { closeOutline, helpOutline, timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonLabel, IonThumbnail, IonText, IonItem, IonIcon, IonAccordion, IonAccordionGroup, IonRefresher, IonRefresherContent]
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

  constructor() {
    addIcons({helpOutline,timeOutline,closeOutline})
  }

  ngOnInit(): void {
    this.alertCtrlService.showLoading();
    const dateObj = new Date()
    this.findResaWaiting(dateObj)
    this.findResaLastExperiences(dateObj)
    this.findResaUnsuccessful(dateObj)
    this.findResaComingSoon(dateObj)
  }

  public handleRefresh($event: any){
    setTimeout(() => {
        const dateObj = new Date()
        this.findResaWaiting(dateObj)
        this.findResaLastExperiences(dateObj)
        this.findResaUnsuccessful(dateObj)
        this.findResaComingSoon(dateObj)
        $event.target.complete();  
      }, 2000);
  }


  public async findResaWaiting(dateObj: Date){
    
    this.dataWaiting = new Array<BookingStatus>()
    
    await this.apiBooking.findBooking(0, dateObj).subscribe({
        next: (response: Array<BookingStatus>) => {
          this.dataWaiting = response as BookingStatus[]
          this.countWaiting = this.dataWaiting.length
        },
        complete: () => this.alertCtrlService.stopLoading()
      });
  }

  public async findResaLastExperiences(dateObj: Date){
    
    this.dataLastExperiences = new Array<BookingStatus>()

    await this.apiBooking.findBooking(1, dateObj).subscribe({
      next: (response: Array<BookingStatus>) => {
        this.dataLastExperiences = response as BookingStatus[]
        this.countLastExperiences = this.dataLastExperiences.length
      },
      complete: () => this.alertCtrlService.stopLoading()
    })
  }

  public async findResaUnsuccessful(dateObj: Date){
    
    this.dataUnsuccessful = new Array<BookingStatus>()

    await this.apiBooking.findBooking(2, dateObj).subscribe({
      next: (response: Array<BookingStatus>) => {
        this.dataUnsuccessful = response as BookingStatus[]
        this.countUnsuccessful = this.dataUnsuccessful.length
      },
      complete: () => this.alertCtrlService.stopLoading()
    });
  }

  public async findResaComingSoon(dateObj: Date){

    this.dataComingSoon = new Array<BookingStatus>()
    
    await this.apiBooking.findBooking(1, dateObj).subscribe({
      next: (response: Array<BookingStatus>) => {
        this.dataComingSoon = response as BookingStatus[]
        this.countComingSoon = this.dataComingSoon.length
      },
      complete: () => this.alertCtrlService.stopLoading()
    });
  }

}
