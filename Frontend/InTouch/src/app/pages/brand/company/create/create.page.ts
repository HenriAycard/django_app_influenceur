
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonCol, IonContent, IonIcon, IonItem, IonProgressBar, IonRow } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleOutline, chevronBackOutline, closeOutline, cloudUploadOutline } from 'ionicons/icons';
import { CompanyAddressPage } from 'src/app/modal/company/address/company-address.component';
import { CompanyDescriptionPage } from 'src/app/modal/company/description/company-description.component';
import { CompanyMainPage } from 'src/app/modal/company/main/company-main.component';
import { CompanyOpeningDayPage } from 'src/app/modal/company/opening-day/company-opening-day.component';
import { CompanyPicturePage } from 'src/app/modal/company/picture/company-picture.component';
import { CompanySocialMediaComponent } from 'src/app/modal/company/social-media/company-social-media.component';
import { Address, Company, CompanyCreateDto, CompanyMainDto, SocialMedia, Day, DAYS, OpeningDate } from 'src/app/shared/models';
import { ApiAddressService } from 'src/app/services/api/api-address.service';
import { ApiCompanyImgService } from 'src/app/services/api/api-company-img.service';
import { ApiCompanyService } from 'src/app/services/api/api-company.service';
import { ApiOpeningService } from 'src/app/services/api/api-opening.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonItem, IonIcon, IonProgressBar, IonRow, IonCol, CompanyMainPage, CompanyDescriptionPage, CompanyAddressPage, CompanyOpeningDayPage, CompanyPicturePage, CompanySocialMediaComponent]
})
export class CreatePage {

  // Initialization values
  public companyMainData: Partial<CompanyMainDto> = { isOnsit: false, isTakeaway: false};
  public companyDescription: string = ""
  public companyAddress: Partial<Address> = {};
  public companyOpeningDay: OpeningDate[] = []
  public companyImgSrc: string = ""
  public companyFormData: FormData = new FormData();
  public companySocialMedia: SocialMedia = {} as SocialMedia;

  public steps: String[] = ['MAIN', 'DESCRIPTION', 'SOCIAL_MEDIA', 'ADDRESS', 'OPENING_DAY', 'PICTURE', 'END']
  public progress = 1 / this.steps.length
  public indice: number = 0
  public step: String = this.steps[this.indice]

  public idCompany: number = -1;
  public idAddress: number = -1;
  public idOpeningDate: Day[] = DAYS; 

  private apiCompany = inject(ApiCompanyService);
  private apiCompanyImg = inject(ApiCompanyImgService);
  private apiAddress = inject(ApiAddressService);
  private apiOpening = inject(ApiOpeningService);
  private toastService = inject(ToastService);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    addIcons({ closeOutline, chevronBackOutline, cloudUploadOutline, addCircleOutline });
    this.idOpeningDate.forEach((day: Day) => {
      this.companyOpeningDay.push({
        day: day.name,
        openHour: '',
        closeHour: '',
        breakStart: '',
        breakEnd: '',
        isOpen: false,
        idDay: day.id,
        company: -1
      })
    })
  }

  public nextCompanyMain(newCompanyMainData: Partial<CompanyMainDto>): void {
    console.log(newCompanyMainData)
    this.companyMainData = newCompanyMainData
    this.next()
  }

  public nextDescription(newCompanyDescription: string): void {
    this.companyDescription = newCompanyDescription
    this.next()
  }

  nextSocialMedia(newSocialMedia: SocialMedia) {
    this.companySocialMedia = newSocialMedia
    this.next()
}

  public nextAddress(newCompanyAddress: Partial<Address>): void {
    this.companyAddress = newCompanyAddress
    this.next()
  }

  public nextOpeningDay(newOpeningDay: OpeningDate[]): void {
    this.companyOpeningDay = newOpeningDay
    this.next()
  }

  public nextPicture(newPicture: FormData): void {
    this.companyFormData = newPicture
    this.next()
  }

  public submit() {
    this.saveAddress()
  }

  public saveAddress() {
    this.apiAddress.create(this.companyAddress).subscribe({
      next: (address: Address) => {
        this.idAddress = address.id
        this.companyAddress = address
      },
      complete: () => this.saveCompany()
    })
  }

  public saveCompany() {
    const currentValue: CompanyCreateDto = {
      nameCompany: this.companyMainData.nameCompany!,
      isTakeaway: this.companyMainData.isTakeaway!,
      isOnsit: this.companyMainData.isOnsit!,
      description: this.companyDescription,
      address: this.idAddress,
      typeCompany: this.companyMainData.typeCompany!.id,
      instagram: this.companySocialMedia.instagram,
      youtube: this.companySocialMedia.youtube,
      tiktok: this.companySocialMedia.tiktok,
      facebook: this.companySocialMedia.facebook,
      twitter: this.companySocialMedia.twitter
    }
    this.apiCompany.create(currentValue).subscribe({
      next: (company: Company) => {
        this.idCompany = company.id
        this.companyMainData = company
      },
      complete: () => {
        this.saveOpeningDay()
        this.saveFile()
      }
    })
  }

  public saveOpeningDay() {
    this.companyOpeningDay.forEach((item: OpeningDate) => {
      item.company = this.idCompany
      this.apiOpening.create(item).subscribe()
    })
  }

  public saveFile() {
    this.companyFormData.append('company', this.idCompany.toString())
    this.companyFormData.append('is_principal', 'true')
    this.apiCompanyImg.uploadPhoto(this.companyFormData).subscribe({
      complete: () => this.back()
    })
  }

  public next(): void {
    if (this.indice + 1 < this.steps.length) {
      this.indice += 1;
      this.step = this.steps[this.indice]
      this.progress = (this.indice + 1) / this.steps.length
    } else {
      this.back()
    }
  }

  public previous() {
    if (this.indice - 1 >= 0) {
      this.indice -= 1;
      this.step = this.steps[this.indice]
      this.progress = (this.indice + 1) / this.steps.length
    } else {
      this.back();
    }
  }

  public isIndiceNotMinMax() {
    return this.indice > 0 && this.indice < this.steps.length - 1 ? true : false
  }

  back() {
    this.router.navigate(['../../home'], { relativeTo: this.route })
  }
}
