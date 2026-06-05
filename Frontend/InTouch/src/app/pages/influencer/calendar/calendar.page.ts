import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonThumbnail, IonTitle, IonLabel, IonToolbar, IonText, IonItem, IonIcon, IonAccordion, IonAccordionGroup, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { ApplicationView, ApplicationStatus } from 'src/app/shared/models';
import { ApiApplicationService } from 'src/app/features/applications/api-application.service';
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

  dataWaiting : Array<ApplicationView> = new Array<ApplicationView>()
  countWaiting : number = 0;

  dataLastExperiences : Array<ApplicationView> = new Array<ApplicationView>()
  countLastExperiences : number = 0;

  dataUnsuccessful : Array<ApplicationView> = new Array<ApplicationView>()
  countUnsuccessful : number = 0;

  dataComingSoon : Array<ApplicationView> = new Array<ApplicationView>()
  countComingSoon : number = 0;

  private apiApplication = inject(ApiApplicationService)
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
    
    this.dataWaiting = new Array<ApplicationView>()
    
    await this.apiApplication.findApplications4Influencer(ApplicationStatus.Pending, dateObj, 'from_date').subscribe({
        next: (response: Array<ApplicationView>) => {
          this.dataWaiting = response as ApplicationView[]
          this.countWaiting = this.dataWaiting.length
        },
        complete: () => this.alertCtrlService.stopLoading()
      });
  }

  public async findResaLastExperiences(dateObj: Date){
    
    this.dataLastExperiences = new Array<ApplicationView>()

    await this.apiApplication.findApplications4Influencer(ApplicationStatus.Accepted, dateObj, 'to_date').subscribe({
      next: (response: Array<ApplicationView>) => {
        this.dataLastExperiences = response as ApplicationView[]
        this.countLastExperiences = this.dataLastExperiences.length
      },
      complete: () => this.alertCtrlService.stopLoading()
    })
  }

  public async findResaUnsuccessful(dateObj: Date){
    
    this.dataUnsuccessful = new Array<ApplicationView>()

    await this.apiApplication.findApplications4Influencer(ApplicationStatus.Declined, dateObj).subscribe({
      next: (response: Array<ApplicationView>) => {
        this.dataUnsuccessful = response as ApplicationView[]
        this.countUnsuccessful = this.dataUnsuccessful.length
      },
      complete: () => this.alertCtrlService.stopLoading()
    });
  }

  public async findResaComingSoon(dateObj: Date){

    this.dataComingSoon = new Array<ApplicationView>()
    
    await this.apiApplication.findApplications4Influencer(ApplicationStatus.Accepted, dateObj).subscribe({
      next: (response: Array<ApplicationView>) => {
        this.dataComingSoon = response as ApplicationView[]
        this.countComingSoon = this.dataComingSoon.length
      },
      complete: () => this.alertCtrlService.stopLoading()
    });
  }

}
