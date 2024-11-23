import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonModal } from '@ionic/angular/standalone';
import { ResaByStatusBrandDto } from 'src/app/models/activity-model';
import { ApiserviceService } from 'src/app/services/apiservice.service';

export interface comingSoonDto {
  date: Date;
  valeur: Array<ResaByStatusBrandDto>;
}

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
})
export class AgendaPage implements OnInit {

  @ViewChild(IonModal) modal: IonModal;
  isModalOpen: boolean = false;
  dataModal: ResaByStatusBrandDto = {} as ResaByStatusBrandDto;

  dataWaiting : Array<ResaByStatusBrandDto> = new Array<ResaByStatusBrandDto>()
  countWaiting : number = 0;

  dataLastExperiences : Array<ResaByStatusBrandDto> = new Array<ResaByStatusBrandDto>()
  countLastExperiences : number = 0;

  dataUnsuccessful : Array<ResaByStatusBrandDto> = new Array<ResaByStatusBrandDto>()
  countUnsuccessful : number = 0;

  dataComingSoon : Array<comingSoonDto> = new Array<comingSoonDto>()
  countComingSoon : number = 0;

  constructor(
    public apiService:ApiserviceService,
    public alertController: AlertController,
  ) {}

  ngOnInit(): void {
    //this.apiService.showLoading();
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
    
    this.dataWaiting = new Array<ResaByStatusBrandDto>()
    
    const option = "&from_date=" + dateObj.getFullYear() + '-' + ('0' + (dateObj.getMonth() + 1)).slice(-2) + '-' + ('0' + dateObj.getDate()).slice(-2);
    await this.apiService.findReservationBrand(0, option).subscribe(
      {
        next: (response: Array<ResaByStatusBrandDto>) => {
          for (const res of response){
            this.dataWaiting.push(res as ResaByStatusBrandDto)
          }
          this.countWaiting = this.dataWaiting.length
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
        },
        complete: () => {
          console.info('Complete')
          //this.apiService.stopLoading();
        }
      }
    )
  }

  public async findResaLastExperiences(dateObj: Date){
    this.dataLastExperiences = new Array<ResaByStatusBrandDto>()
    const option = "&to_date=" + dateObj.getFullYear() + '-' + ('0' + (dateObj.getMonth() + 1)).slice(-2) + '-' + ('0' + dateObj.getDate()).slice(-2);
    
    await this.apiService.findReservationBrand(1, option).subscribe(
      {
        next: (response: Array<ResaByStatusBrandDto>) => {
          for (const res of response){
            this.dataLastExperiences.push(res as ResaByStatusBrandDto)
          }
          this.countLastExperiences = this.dataLastExperiences.length
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
        },
        complete: () => {
          console.info('Complete')
          //this.apiService.stopLoading();
        }
      }
    )
  }

  public async findResaUnsuccessful(dateObj: Date){
    this.dataUnsuccessful = new Array<ResaByStatusBrandDto>()
    const option = "";
    
    await this.apiService.findReservationBrand(2, option).subscribe(
      {
        next: (response: Array<ResaByStatusBrandDto>) => {
          for (const res of response){
            this.dataUnsuccessful.push(res as ResaByStatusBrandDto)
          }
          this.countUnsuccessful = this.dataUnsuccessful.length
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
        },
        complete: () => {
          console.info('Complete')
          //this.apiService.stopLoading();
        }
      }
    )
  }

  public async findResaComingSoon(dateObj: Date){
    this.dataComingSoon = new Array<comingSoonDto>()
    const option = "&from_date=" + dateObj.getFullYear() + '-' + ('0' + (dateObj.getMonth() + 1)).slice(-2) + '-' + ('0' + dateObj.getDate()).slice(-2);
    
    await this.apiService.findReservationBrand(1, option).subscribe(
      {
        next: (response: Array<ResaByStatusBrandDto>) => {
          let data: Array<ResaByStatusBrandDto> = Array<ResaByStatusBrandDto>()
          for (const res of response){
            data.push(new ResaByStatusBrandDto(res))
          }
          let date = new Set(data.map(item => item.dateReservation.toDateString()))
          date.forEach((date)=>{
            this.dataComingSoon.push({
              date: new Date(date),
              valeur: data.filter(i => i.dateReservation.toDateString() === date)
            })
          })

          this.countComingSoon = data.length
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
        },
        complete: () => {
          console.info('Complete')
          //this.apiService.stopLoading();
        }
      }
    )
  }

  public displayInfo(waiting: ResaByStatusBrandDto) {
    this.isModalOpen = true;
    console.log(waiting)
    this.dataModal = waiting

  }

  public closeModal(){
    this.isModalOpen = false

  }

  public acceptReservation(){
    this.apiService.updateReservationBrand(
      this.dataModal.id,
      1,
      this.dataModal.user.id,
      this.dataModal.offer.id
    ).subscribe(
      (response: any) => {
        console.log(response);
        const dateObj = new Date()
        this.findResaWaiting(dateObj)
        this.findResaComingSoon(dateObj)
      }
    )
    this.closeModal()
    
  }

  public cancelReservation(){
    this.apiService.updateReservationBrand(
      this.dataModal.id,
      2,
      this.dataModal.user.id,
      this.dataModal.offer.id
    ).subscribe(
      (response: any) => {
        console.log(response);
        const dateObj = new Date()
        this.findResaWaiting(dateObj)
        this.findResaUnsuccessful(dateObj)
      }
    )
    this.closeModal()
    
  }

}
