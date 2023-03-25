import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { AlertController, PickerController, IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { dataOpeningDate,OpeningDate, AddressDto, NewCompanyDto } from 'src/app/models/activity-model';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Camera, CameraResultType, Photo } from '@capacitor/camera';


@Component({
  selector: 'app-create-company',
  templateUrl: './create-company.page.html',
  styleUrls: ['./create-company.page.scss'],
})
export class CreateCompanyPage implements OnInit {

  @ViewChild(IonModal) modal: IonModal;


  days = [{id: 1, name:'Monday'}, {id:2, name:'Tuesday'}, {id:3, name:'Wednesday'}, {id:4, name:'Thursday'}, {id:5, name:'Friday'}, {id:6, name:'Saturday'}, {id:7, name:'Sunday'}]
  daysChip = [{id: 1, name:'Monday'}, {id:2, name:'Tuesday'}, {id:3, name:'Wednesday'}, {id:4, name:'Thursday'}, {id:5, name:'Friday'}, {id:6, name:'Saturday'}, {id:7, name:'Sunday'}]
  tagDefaultColor = Array(this.daysChip.length).fill("medium");
  daysSelected = Array<number>()
  isBreak: boolean = false;
  datas: Array<OpeningDate> = new Array<OpeningDate>()

  opening = new Map<string, string>();
  dataCompany: NewCompanyDto = new NewCompanyDto();
  dataAddress: AddressDto = new AddressDto();

  image: void | Photo;


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
    this.dataCompany.typeCompany = 1;
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
          console.log("[CREATE-COMPANY] - saveAddress - end OK")
          console.log(value.id)
          this.dataCompany.address = value.id
          this.saveCompany();
        },
        error: (err: any) => {
            console.error("[CREATE-COMPANY] - saveAddress - end KO")
            console.log(err);// Error getting the data
        },
        complete: () => {
          console.info('Complete')
        },
      })
    
  }

  async saveCompany(){

    this.apiService.createCompany(this.dataCompany).subscribe({
      next: (value: any) => {
        console.log("[CREATE-COMPANY] - saveCompany - end OK")
        console.log(value.id)
        this.dataCompany.id = value.id
        this.saveOpeningOpen(value.id);
        this.saveOpeningClose(value.id);
        this.savePhoto(value.id);
        this.apiService.stopLoading();
      },
      error: (err: any) => {
          console.error("[CREATE-COMPANY] - saveCompany - end KO")
          console.log(err);// Error getting the data
      },
      complete: () => {
        console.info('Complete')
      },
    })

  }
  

  async saveOpeningOpen(id: number){
    this.datas.forEach(item => {
      item.company = id
      this.apiService.createOpening(item).subscribe({
        next: (value: any) => {
          console.log("[CREATE-COMPANY] - saveOpeningOpen - end OK")
          console.log(value.id)
        },
        error: (err: any) => {
            console.error("[CREATE-COMPANY] - saveOpeningOpen - end KO")
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
      tmp.company = id
      this.apiService.createOpening(tmp).subscribe({
        next: (value: any) => {
          console.log("[CREATE-COMPANY] - saveOpeningClose - end OK")
          console.log(value.id)
        },
        error: (err: any) => {
            console.error("[CREATE-COMPANY] - saveOpeningClose - end KO")
            console.log(err);// Error getting the data
        },
        complete: () => {
          console.info('Complete')
        },
      })
    })
  }

  public createCompany(){
    // initialise a zero
    this.saveAddress()
    this.router.navigate(['/brand/company'])

  }

  public b64toBlob(b64Data: string, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
 
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
 
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
 
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
 
    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  async chooseOrTakePicture() {
    this.image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64
    }).catch((error)=>{
      console.log(error)
    });
  };

  savePhoto(id: number) {
    if (this.image ){
      // convert base64 image to blob
      let blob = this.b64toBlob(this.image.base64String!)
      var formData = new FormData();
      //Generate a fake filename
      let name = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 10);
      formData.append('file', blob, name+`.${this.image.format}`);
      formData.append('company', id.toString())
      formData.append('isPrincipal', 'true')

      console.log("company:")
      console.log(formData.get('company'))

      this.apiService.uploadPhoto(formData).subscribe({
        next: (value: any) => {
          console.log("[UPLOAD-PHOTO] - savePhoto - end OK")
          console.log(value)
        },
        error: (err: any) => {
            console.error("[UPLOAD-PHOTO] - savePhoto - end KO")
            console.log(err);// Error getting the data
        },
        complete: () => {
          console.info('Complete')
        },
      })
      
      
    }
  }
}
