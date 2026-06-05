import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonLabel, IonToolbar, IonText, IonItem, IonIcon, IonAccordion, IonAccordionGroup, IonRefresher, IonRefresherContent, IonCol, IonGrid, IonRow, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, NavController, IonThumbnail } from '@ionic/angular/standalone';
import { BookingBrand } from 'src/app/models/booking';
import { ApiBookingService } from 'src/app/services/api/api-booking.service';
import { AlertControllerService } from 'src/app/services/alert-controller.service';
import { addIcons } from 'ionicons';
import { closeOutline, helpOutline, timeOutline } from 'ionicons/icons';
import { ReloadService } from 'src/app/services/reload.service';
import { Location } from '@angular/common';
import { CalendarCompanyComponent } from 'src/app/modal/calendar/company/calendar-company.component';


export interface comingSoonDto {
  date: Date;
  valeur: BookingBrand[];
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonLabel, IonText, IonItem, IonIcon, IonAccordion, IonAccordionGroup, IonRefresher, IonRefresherContent, IonCol, IonGrid, IonRow, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, CalendarCompanyComponent]
})
export class CalendarPage implements OnInit {

  dataWaiting : Array<BookingBrand> = new Array<BookingBrand>()
  countWaiting : number = 0;

  dataLastExperiences : Array<BookingBrand> = new Array<BookingBrand>()
  countLastExperiences : number = 0;

  dataUnsuccessful : Array<BookingBrand> = new Array<BookingBrand>()
  countUnsuccessful : number = 0;

  dataComingSoon : Array<comingSoonDto> = new Array<comingSoonDto>()
  countComingSoon : number = 0;

  private apiBooking = inject(ApiBookingService)
  private alertCtrlService = inject(AlertControllerService)
  private reloadService = inject(ReloadService);
  private navCtrl = inject(NavController)
  private location = inject(Location)

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
        $event.target.complete();  
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
    
    this.dataWaiting = new Array<BookingBrand>()
    
    await this.apiBooking.findBooking4Brand(0, dateObj, 'from_date').subscribe({
        next: (response: Array<BookingBrand>) => {
          this.dataWaiting = response as BookingBrand[]
          this.countWaiting = this.dataWaiting.length
        },
        complete: () => this.alertCtrlService.stopLoading()
      });
  }

  public async findResaLastExperiences(dateObj: Date){
    
    this.dataLastExperiences = new Array<BookingBrand>()

    await this.apiBooking.findBooking4Brand(1, dateObj, 'to_date').subscribe({
      next: (response: Array<BookingBrand>) => {
        this.dataLastExperiences = response as BookingBrand[]
        this.countLastExperiences = this.dataLastExperiences.length
      },
      complete: () => this.alertCtrlService.stopLoading()
    })
  }

  public async findResaUnsuccessful(dateObj: Date){
    
    this.dataUnsuccessful = new Array<BookingBrand>()

    await this.apiBooking.findBooking4Brand(2, dateObj).subscribe({
      next: (response: Array<BookingBrand>) => {
        this.dataUnsuccessful = response as BookingBrand[]
        this.countUnsuccessful = this.dataUnsuccessful.length
      },
      complete: () => this.alertCtrlService.stopLoading()
    });
  }

  public async findResaComingSoon(dateObj: Date){

    this.dataComingSoon = new Array<comingSoonDto>()
    
    await this.apiBooking.findBooking4Brand(1, dateObj, 'from_date').subscribe({
      next: (response: BookingBrand[]) => {

        let data: BookingBrand[] = new Array<BookingBrand>()
        for (const res of response){
          data.push(res)
        }

        let date = new Set(data.map(item => item.dateReservation.toDateString()))
        date.forEach((date)=>{
          this.dataComingSoon.push({
            date: new Date(date),
            valeur: data.filter(i => i.dateReservation.toDateString() === date)
          })
        })
        
        this.countComingSoon = this.dataComingSoon.length
      },
      complete: () => this.alertCtrlService.stopLoading()
    });
  }

  public displayInfo(waiting: BookingBrand) {
    this.location.replaceState('/brand/calendar')
    this.navCtrl.navigateForward(['/brand/booking/', waiting.id])
  }

}
