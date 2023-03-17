import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ResaByStatusDto } from 'src/app/models/activity-model';
import { ApiserviceService } from 'src/app/services/apiservice.service';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
})
export class AgendaPage implements OnInit {

  dataWaiting : Array<ResaByStatusDto> = new Array<ResaByStatusDto>()
  countWaiting : number = 0;

  dataLastExperiences : Array<ResaByStatusDto> = new Array<ResaByStatusDto>()
  countLastExperiences : number = 0;

  dataUnsuccessful : Array<ResaByStatusDto> = new Array<ResaByStatusDto>()
  countUnsuccessful : number = 0;

  dataComingSoon : Array<ResaByStatusDto> = new Array<ResaByStatusDto>()
  countComingSoon : number = 0;

  constructor(
    public apiService:ApiserviceService,
    public alertController: AlertController,
  ) {}

  ngOnInit(): void {
    this.apiService.showLoading();
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
    
    this.dataWaiting = new Array<ResaByStatusDto>()
    
    const option = "&from_date=" + dateObj.getFullYear() + '-' + ('0' + (dateObj.getMonth() + 1)).slice(-2) + '-' + ('0' + dateObj.getDate()).slice(-2);
    await this.apiService.findReservation(0, option).subscribe(
      {
        next: (response: Array<ResaByStatusDto>) => {
          for (const res of response){
            this.dataWaiting.push(new ResaByStatusDto(res))
          }
          this.countWaiting = this.dataWaiting.length
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
        },
        complete: () => {
          console.info('Complete')
          this.apiService.stopLoading();
        }
      }
    )
  }

  public async findResaLastExperiences(dateObj: Date){
    this.dataLastExperiences = new Array<ResaByStatusDto>()
    const option = "&to_date=" + dateObj.getFullYear() + '-' + ('0' + (dateObj.getMonth() + 1)).slice(-2) + '-' + ('0' + dateObj.getDate()).slice(-2);
    
    await this.apiService.findReservation(1, option).subscribe(
      {
        next: (response: Array<ResaByStatusDto>) => {
          for (const res of response){
            this.dataLastExperiences.push(new ResaByStatusDto(res))
          }
          this.countLastExperiences = this.dataLastExperiences.length
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
        },
        complete: () => {
          console.info('Complete')
          this.apiService.stopLoading();
        }
      }
    )
  }

  public async findResaUnsuccessful(dateObj: Date){
    this.dataUnsuccessful = new Array<ResaByStatusDto>()
    const option = "&to_date=" + dateObj.getFullYear() + '-' + ('0' + (dateObj.getMonth() + 1)).slice(-2) + '-' + ('0' + dateObj.getDate()).slice(-2);
    
    await this.apiService.findReservation(0, option).subscribe(
      {
        next: (response: Array<ResaByStatusDto>) => {
          for (const res of response){
            this.dataUnsuccessful.push(new ResaByStatusDto(res))
          }
          this.countUnsuccessful = this.dataUnsuccessful.length
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
        },
        complete: () => {
          console.info('Complete')
          this.apiService.stopLoading();
        }
      }
    )
  }

  public async findResaComingSoon(dateObj: Date){
    this.dataComingSoon = new Array<ResaByStatusDto>()
    const option = "&from_date=" + dateObj.getFullYear() + '-' + ('0' + (dateObj.getMonth() + 1)).slice(-2) + '-' + ('0' + dateObj.getDate()).slice(-2);
    
    await this.apiService.findReservation(1, option).subscribe(
      {
        next: (response: Array<ResaByStatusDto>) => {
          for (const res of response){
            this.dataComingSoon.push(new ResaByStatusDto(res))
          }
          this.countComingSoon = this.dataComingSoon.length
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
        },
        complete: () => {
          console.info('Complete')
          this.apiService.stopLoading();
        }
      }
    )
  }

}
