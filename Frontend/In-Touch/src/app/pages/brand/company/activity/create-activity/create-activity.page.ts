import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { AlertController, PickerController, IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { dataOpeningDate,OpeningDate, AddressDto, ActivityCreatDto } from 'src/app/models/activity-model';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';



@Component({
  selector: 'app-create-activity',
  templateUrl: './create-activity.page.html',
  styleUrls: ['./create-activity.page.scss'],
})
export class CreateActivityPage implements OnInit {
  @ViewChild(IonModal) modal: IonModal;

  id: any;
  nameCompany: string = ""
  days = [{id: 1, name:'Monday'}, {id:2, name:'Tuesday'}, {id:3, name:'Wednesday'}, {id:4, name:'Thursday'}, {id:5, name:'Friday'}, {id:6, name:'Saturday'}, {id:7, name:'Sunday'}]
  daysChip = [{id: 1, name:'Monday'}, {id:2, name:'Tuesday'}, {id:3, name:'Wednesday'}, {id:4, name:'Thursday'}, {id:5, name:'Friday'}, {id:6, name:'Saturday'}, {id:7, name:'Sunday'}]
  tagDefaultColor = Array(this.daysChip.length).fill("medium");
  daysSelected = Array<number>()
  isBreak: boolean = false;
  datas: Array<OpeningDate> = new Array<OpeningDate>()

  opening = new Map<string, string>();
  dataActivity: ActivityCreatDto = new ActivityCreatDto();
  dataAddress: AddressDto = new AddressDto();


  constructor(
    public userManager:UserManagerProviderService,
    public apiService:ApiserviceService,
    private pickerCtrl: PickerController,
    public router:Router,
    public activatedRoute: ActivatedRoute
  ) { 
    this.opening.set('startDate', "00:00 AM");
    this.opening.set('endDate', "00:00 AM");
  }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {id: number, nameCompany: string}
    this.id = state.id
    this.nameCompany = state.nameCompany
    this.dataActivity.company = +state.id
    this.dataActivity.typeActivity = 1;
  }

  customCounterFormatter(inputLength: number, maxLength: number) {
    return `${maxLength - inputLength} characters remaining`;
  }

  changeTagColor(i:number) {
    if (this.tagDefaultColor[i] === "medium") {
      this.tagDefaultColor[i] = "success"
      this.daysSelected.push(this.daysChip[i].id)
    } else {
      this.tagDefaultColor[i] = "medium"
      this.daysSelected = this.daysSelected.filter(item => item !== this.daysChip[i].id)
    }
  }

  setBreak() {
    
    if(this.isBreak){
      this.opening.set('pauseStart', "00:00 AM");
      this.opening.set('pauseEnd', "00:00 AM");
    }else{
      this.opening.delete('pauseStart');
      this.opening.delete('pauseEnd');
    }
    
  }

  async openPicker(variable: string){
    //values for Hours
    let optionHours = [];
    for (let i = 0; i <= 12; i++){
      let hour = (i < 10) ? "0" + i.toString() : i.toString()
      optionHours.push({
        value: hour,
        text: hour
      })
    }
    //values for Minutes
    let optionMinutes = [];
    for (let i = 0; i <= 59; i++){
      let minute = (i < 10) ? "0" + i.toString() : i.toString()
      optionMinutes.push({
        value: minute,
        text: minute
      })
    };
    const picker = await this.pickerCtrl.create({
      columns: [
        {
          name: 'Hours',
          options: optionHours,
        },
        {
          name: 'Minutes',
          options: optionMinutes,
        },
        {
          name: 'Clock',
          options: [
            { text: 'AM', value: 'AM' },
            { text: 'PM', value: 'PM' },
          ],
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Confirm',
          handler: (value) => {
            let valeur = value.Hours.text + ":" + value.Minutes.text + " " + value.Clock.text
            switch (variable) {
              case 'startDate': {
                this.opening.set('startDate', valeur);
                break;
              }
              case 'endDate': {
                this.opening.set('endDate', valeur);
                break;
              }
              case 'pauseStart': {
                this.opening.set('pauseStart', valeur);
                break;
              }
              case 'pauseEnd':{
                this.opening.set('pauseEnd', valeur);
                break;
              }
            }
          },
        },
      ],
    });

    await picker.present();
  }

  cancel() {
    this.tagDefaultColor = Array(this.daysChip.length).fill("medium");
    this.daysSelected = Array<number>()
    this.opening = new Map<string, string>();
    this.opening.set('startDate', "00:00 AM");
    this.opening.set('endDate', "00:00 AM");
    this.opening.delete('pauseStart')
    this.opening.delete('pauseEnd')
    this.isBreak = false
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    let data: dataOpeningDate = new dataOpeningDate()
    data.lstDays = this.daysSelected;
    data.OpeningDays = this.opening;
    this.modal.dismiss(data, 'confirm');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<dataOpeningDate>>;
    console.log(ev)

    
    ev.detail.data!.lstDays.forEach(item => {
      let desc: OpeningDate = new OpeningDate();

      this.days.forEach(value => {
        if(value.id === item){
          desc.fromDate = value.name
          desc.toDate = value.name
          this.daysChip = this.daysChip.filter(item => item.id != value.id)
        }
      })

      desc.startDate = ev.detail.data!.OpeningDays.get('startDate')!;
      desc.endDate = ev.detail.data!.OpeningDays.get('endDate')!;
      console.log(this.isBreak)
      if (this.isBreak){
        desc.pauseStart = ev.detail.data!.OpeningDays.get('pauseStart')!;
        desc.pauseEnd = ev.detail.data!.OpeningDays.get('pauseEnd')!;
      }

      desc.isOpen = true
      desc.isOrderBy = item

      this.datas.push(desc)
      

    })

    this.datas.sort(((a: OpeningDate, b:OpeningDate) => a.isOrderBy - b.isOrderBy))

    // reset
    this.tagDefaultColor = Array(this.daysChip.length).fill("medium");
    this.daysSelected = Array<number>()
    this.opening = new Map<string, string>();
    this.opening.set('startDate', "00:00 AM");
    this.opening.set('endDate', "00:00 AM");
    this.opening.delete('pauseStart')
    this.opening.delete('pauseEnd')
    this.isBreak = false

    console.log(this.datas)

  }

  public deleteOpeningDate(id: number){
    this.datas = this.datas.filter(item => item.isOrderBy !== id)
    this.days.forEach(value => {
      if(value.id === id){
        this.daysChip.push({id: value.id, name: value.name})
        this.daysChip.sort(((a: { id: number; name: string; }, b: { id: number; name: string; }) => a.id - b.id))
        this.tagDefaultColor = Array(this.daysChip.length).fill("medium");
      }
    })
    console.log(this.daysChip)
    
    console.log(this.tagDefaultColor)
  }

  
  async saveAddress(){
      this.apiService.showLoading();
      this.apiService.createAddresse(this.dataAddress).subscribe({
        next: (value: any) => {
          console.log("[CREATE-ACTIVITY] - saveAddress - end OK")
          console.log(value.id)
          this.dataActivity.address = value.id
          this.saveActivity();
        },
        error: (err: any) => {
            console.error("[CREATE-ACTIVITY] - saveAddress - end KO")
            console.log(err);// Error getting the data
        },
        complete: () => {
          console.info('Complete')
        },
      })
    
  }

  async saveActivity(){

    this.apiService.createActivity(this.dataActivity).subscribe({
      next: (value: any) => {
        console.log("[CREATE-ACTIVITY] - saveActivity - end OK")
        console.log(value.id)
        this.dataActivity.id = value.id
        this.saveOpeningOpen(value.id);
        this.saveOpeningClose(value.id);
        this.apiService.stopLoading();
      },
      error: (err: any) => {
          console.error("[CREATE-ACTIVITY] - saveActivity - end KO")
          console.log(err);// Error getting the data
      },
      complete: () => {
        console.info('Complete')
      },
    })

  }

  async saveOpeningOpen(id: number){
    this.datas.forEach(item => {
      item.activity = id
      this.apiService.createOpening(item).subscribe({
        next: (value: any) => {
          console.log("[CREATE-ACTIVITY] - saveOpeningOpen - end OK")
          console.log(value.id)
        },
        error: (err: any) => {
            console.error("[CREATE-ACTIVITY] - saveOpeningOpen - end KO")
            console.log(err);// Error getting the data
        },
        complete: () => {
          console.info('Complete')
        },
      })
    })
  }

  async saveOpeningClose(id: number){
    this.daysChip.forEach(item => {
      let tmp: OpeningDate = new OpeningDate();
      tmp.isOpen = false;
      tmp.isOrderBy = item.id
      tmp.fromDate = item.name
      tmp.toDate = item.name
      tmp.activity = id
      this.apiService.createOpening(tmp).subscribe({
        next: (value: any) => {
          console.log("[CREATE-ACTIVITY] - saveOpeningClose - end OK")
          console.log(value.id)
        },
        error: (err: any) => {
            console.error("[CREATE-ACTIVITY] - saveOpeningClose - end KO")
            console.log(err);// Error getting the data
        },
        complete: () => {
          console.info('Complete')
        },
      })
    })
  }

  public createActivity(){
    // initialise a zero
    this.saveAddress()
    console.log(this.dataActivity)
    let navigationExtras: NavigationExtras = {
      state: {
        id: this.id,
        nameCompany: this.nameCompany
      },
      relativeTo: this.activatedRoute
    };
    this.router.navigate(['../view-activity'], navigationExtras)

  }


}
