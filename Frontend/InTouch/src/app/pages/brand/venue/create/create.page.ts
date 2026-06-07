
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonCol, IonContent, IonIcon, IonItem, IonProgressBar, IonRow } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleOutline, chevronBackOutline, closeOutline, cloudUploadOutline } from 'ionicons/icons';
import { VenueAddressPage } from 'src/app/modal/venue/address/venue-address.component';
import { VenueDescriptionPage } from 'src/app/modal/venue/description/venue-description.component';
import { VenueMainPage } from 'src/app/modal/venue/main/venue-main.component';
import { VenueOpeningDayPage } from 'src/app/modal/venue/opening-day/venue-opening-day.component';
import { VenuePicturePage } from 'src/app/modal/venue/picture/venue-picture.component';
import { VenueSocialMediaComponent } from 'src/app/modal/venue/social-media/venue-social-media.component';
import { Address, Venue, VenueCreateDto, VenueMainDto, SocialMedia, Day, DAYS, OpeningDate } from 'src/app/shared/models';
import { ApiAddressService } from 'src/app/services/api/api-address.service';
import { ApiVenueImgService } from 'src/app/services/api/api-venue-img.service';
import { ApiVenueService } from 'src/app/services/api/api-venue.service';
import { ApiOpeningService } from 'src/app/services/api/api-opening.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonItem, IonIcon, IonProgressBar, IonRow, IonCol, VenueMainPage, VenueDescriptionPage, VenueAddressPage, VenueOpeningDayPage, VenuePicturePage, VenueSocialMediaComponent]
})
export class CreatePage {

  // Initialization values
  public venueMainData: Partial<VenueMainDto> = { isOnsit: false, isTakeaway: false};
  public venueDescription: string = ""
  public venueAddress: Partial<Address> = {};
  public venueOpeningDay: OpeningDate[] = []
  public venueImgSrc: string = ""
  public venueFormData: FormData = new FormData();
  public venueSocialMedia: SocialMedia = {} as SocialMedia;

  public steps: String[] = ['MAIN', 'DESCRIPTION', 'SOCIAL_MEDIA', 'ADDRESS', 'OPENING_DAY', 'PICTURE', 'END']
  public progress = 1 / this.steps.length
  public indice: number = 0
  public step: String = this.steps[this.indice]

  public idVenue: number = -1;
  public idAddress: number = -1;
  public idOpeningDate: Day[] = DAYS; 

  private apiVenue = inject(ApiVenueService);
  private apiVenueImg = inject(ApiVenueImgService);
  private apiAddress = inject(ApiAddressService);
  private apiOpening = inject(ApiOpeningService);
  private toastService = inject(ToastService);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    addIcons({ closeOutline, chevronBackOutline, cloudUploadOutline, addCircleOutline });
    this.idOpeningDate.forEach((day: Day) => {
      this.venueOpeningDay.push({
        day: day.name,
        openHour: '',
        closeHour: '',
        breakStart: '',
        breakEnd: '',
        isOpen: false,
        idDay: day.id,
        venue: -1
      })
    })
  }

  public nextVenueMain(newVenueMainData: Partial<VenueMainDto>): void {
    console.log(newVenueMainData)
    this.venueMainData = newVenueMainData
    this.next()
  }

  public nextDescription(newVenueDescription: string): void {
    this.venueDescription = newVenueDescription
    this.next()
  }

  nextSocialMedia(newSocialMedia: SocialMedia) {
    this.venueSocialMedia = newSocialMedia
    this.next()
}

  public nextAddress(newVenueAddress: Partial<Address>): void {
    this.venueAddress = newVenueAddress
    this.next()
  }

  public nextOpeningDay(newOpeningDay: OpeningDate[]): void {
    this.venueOpeningDay = newOpeningDay
    this.next()
  }

  public nextPicture(newPicture: FormData): void {
    this.venueFormData = newPicture
    this.next()
  }

  public submit() {
    this.saveAddress()
  }

  public saveAddress() {
    this.apiAddress.create(this.venueAddress).subscribe({
      next: (address: Address) => {
        this.idAddress = address.id
        this.venueAddress = address
      },
      complete: () => this.saveVenue()
    })
  }

  public saveVenue() {
    const currentValue: VenueCreateDto = {
      nameVenue: this.venueMainData.nameVenue!,
      isTakeaway: this.venueMainData.isTakeaway!,
      isOnsit: this.venueMainData.isOnsit!,
      description: this.venueDescription,
      address: this.idAddress,
      typeVenue: this.venueMainData.typeVenue!.id,
      instagram: this.venueSocialMedia.instagram,
      youtube: this.venueSocialMedia.youtube,
      tiktok: this.venueSocialMedia.tiktok,
      facebook: this.venueSocialMedia.facebook,
      twitter: this.venueSocialMedia.twitter
    }
    this.apiVenue.create(currentValue).subscribe({
      next: (venue: Venue) => {
        this.idVenue = venue.id
        this.venueMainData = venue
      },
      complete: () => {
        this.saveOpeningDay()
        this.saveFile()
      }
    })
  }

  public saveOpeningDay() {
    this.venueOpeningDay.forEach((item: OpeningDate) => {
      item.venue = this.idVenue
      this.apiOpening.create(item).subscribe()
    })
  }

  public saveFile() {
    this.venueFormData.append('venue', this.idVenue.toString())
    this.venueFormData.append('is_principal', 'true')
    this.apiVenueImg.uploadPhoto(this.venueFormData).subscribe({
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
