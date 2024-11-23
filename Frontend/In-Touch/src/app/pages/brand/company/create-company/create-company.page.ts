import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { AlertController, PickerController, IonModal } from '@ionic/angular/standalone';
import { OverlayEventDetail } from '@ionic/core/components';
import { dataOpeningDate,OpeningDate, AddressDto, NewCompanyDto, typeCompanyDto } from 'src/app/models/activity-model';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Camera, CameraResultType, Photo } from '@capacitor/camera';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


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

  public progress = 1/5
  public steps: String[] = ['MAIN','DESCRIPTION','PICTURE','ADDRESS','OPENING_DAY', 'END']
  public indice: number = 0
  public step: String = this.steps[this.indice]
  public mainForm: FormGroup;
  public descriptionForm: FormGroup;
  public addressForm: FormGroup;
  public typeCompany: typeCompanyDto[] = new Array<typeCompanyDto>();

  constructor(
    public userManager:UserManagerProviderService,
    public apiService:ApiserviceService,
    private pickerCtrl: PickerController,
    public router:Router,
    public activatedRoute: ActivatedRoute,
    public fb: FormBuilder
  ) { 
    this.apiService.findTypeCompany().subscribe({
      next: (response: typeCompanyDto[]) => {
        this.typeCompany = response as typeCompanyDto[];
      }
    });
    this.opening.set('startDate', "00:00 AM");
    this.opening.set('endDate', "00:00 AM");
    this.mainForm = this.fb.group({
      name: ['', [Validators.required]],
      isOnSit: [true, [Validators.required]],
      isTakeAway: [false, [Validators.required]],
      typeCompany: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
    });

    this.descriptionForm = this.fb.group({
      description: ['', [Validators.required]]
    });

    this.addressForm = this.fb.group({
      address1: ['', [Validators.required]],
      address2: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      country: ['', [Validators.required]],
      postalCode: ['', [Validators.required]]
    })
  }

  public compareWith(o1: typeCompanyDto, o2: typeCompanyDto) {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  public handleChange(ev: any) {
    this.mainForm.controls['typeCompany'].setValue(ev.target.value.id);
  }

  public next() {
    if (this.indice+1 < this.step.length) {
      this.indice += 1;
      this.step = this.steps[this.indice]
      this.progress = (this.indice+1)/this.steps.length
    } else {
      this.back()
    }
    
  }

  public previous() {
    if (this.indice-1 >= 0) {
      this.indice -= 1;
      this.step = this.steps[this.indice]
      this.progress = (this.indice+1)/this.steps.length
    } else {
      this.back();
    }
  }

  public isIndiceNotMinMax() {
    return this.indice > 0 && this.indice < this.step.length ? true : false
  }

  public back() {
    this.router.navigateByUrl('/brand/company')
  }

  public nextMainForm() {
    console.log(this.mainForm)
    this.next();
  }

  public nextDescriptionForm(){
    console.log(this.descriptionForm)
    this.next();
  }

  public nextAddressForm(){
    console.log(this.addressForm)
    this.next();
  }


  public submit(){
    this.saveAddress()
    this.next();
  }

  async chooseOrTakePicture() {
    this.image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64
    }).catch((error)=>{
      console.log(error)
    }).finally(() => {
      this.next();
    });
  };

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

      let param: AddressDto = {
        address1: this.addressForm.value.address1,
        address2: this.addressForm.value.address2,
        city: this.addressForm.value.city,
        state: this.addressForm.value.state,
        country: this.addressForm.value.country,
        postalCode: this.addressForm.value.postalCode
      }

      this.apiService.createAddresse(param).subscribe({
        next: (value: any) => {
          console.log("[CREATE][ADDRESS] new address created with id " + value.id)
          this.saveCompany(value.id);
        },
        error: (err: any) => {
            console.error("[CREATE][ADDRESS] impossible to insert the address")
            console.error(err);
        }
      })
    
  }

  async saveCompany(idAddress: number){

    let param: NewCompanyDto = {
      nameCompany: this.mainForm.value.name,
      isTakeAway: this.mainForm.value.isOnSit,
      isOnSit: this.mainForm.value.isTakeAway,
      description: this.descriptionForm.value.description,
      address: idAddress,
      typeCompany: this.mainForm.value.typeCompany
    }

    this.apiService.createCompany(param).subscribe({
      next: (value: any) => {
        console.log("[CREATE][COMPANY] new company created with id " + value.id)
        
        this.saveOpeningOpen(value.id);
        this.saveOpeningClose(value.id);
        this.savePhoto(value.id);
        this.apiService.stopLoading();
      },
      error: (err: any) => {
          console.error("[CREATE][COMPANY] impossible to insert the company")
          console.error(err);
      }
    })

  }
  

  async saveOpeningOpen(id: number){
    this.datas.forEach(item => {
      item.company = id
      this.apiService.createOpening(item).subscribe({
        next: (value: any) => {
          console.log("[CREATE][OPENING DATE] new opening date created with id " + value.id)
        },
        error: (err: any) => {
            console.error("[CREATE][OPENING DATE] impossible to insert the opening date")
            console.log(err);// Error getting the data
        }
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
          console.log("[CREATE][CLOSE DATE] new closing date created with id " + value.id)
        },
        error: (err: any) => {
          console.error("[CREATE][CLOSE DATE] impossible to insert the closing date")
            console.log(err);// Error getting the data
        }
      })
    })
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

      console.log("[UPLOAD][PHOTO] filename: " + name+`.${this.image.format}`)

      this.apiService.uploadPhoto(formData).subscribe({
        next: (value: any) => {
          console.log("[UPLOAD][PHOTO] photo successfully uploaded")
          console.log(value)
        },
        error: (err: any) => {
            console.error("[UPLOAD][PHOTO] error during the upload")
            console.log(err);
        }
      })      
    }
  }
}
