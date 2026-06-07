
import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { IonButton, IonCol, IonContent, IonIcon, IonItem, IonProgressBar, IonRow } from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { closeOutline, chevronBackOutline, cloudUploadOutline, addCircleOutline } from "ionicons/icons";
import { forkJoin, Observable } from "rxjs";
import { VenueAddressPage } from "src/app/modal/venue/address/venue-address.component";
import { VenueDescriptionPage } from "src/app/modal/venue/description/venue-description.component";
import { VenueMainPage } from "src/app/modal/venue/main/venue-main.component";
import { VenueOpeningDayPage } from "src/app/modal/venue/opening-day/venue-opening-day.component";
import { VenuePicturePage } from "src/app/modal/venue/picture/venue-picture.component";
import { VenueSocialMediaComponent } from "src/app/modal/venue/social-media/venue-social-media.component";
import { Address, AddressDto, Venue, VenueCreateDto, VenueMainDto, VenueUpdateDto, SocialMedia, OpeningDate } from "src/app/shared/models";
import { AlertControllerService } from "src/app/services/alert-controller.service";
import { ApiAddressService } from "src/app/services/api/api-address.service";
import { ApiVenueImgService } from "src/app/services/api/api-venue-img.service";
import { ApiVenueService } from "src/app/services/api/api-venue.service";
import { ApiOpeningService } from "src/app/services/api/api-opening.service";
import { HelperService } from "src/app/services/helper.service";
import { ToastService } from "src/app/services/toast.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-venue-edit',
    templateUrl: './venue-edit.page.html',
    styleUrls: ['./venue-edit.page.scss'],
    standalone: true,
    imports: [VenueMainPage, VenueDescriptionPage, VenueAddressPage, VenueOpeningDayPage, VenuePicturePage, VenueSocialMediaComponent, IonProgressBar, IonIcon, IonButton, IonItem, IonContent, IonCol, IonRow]
})
export class VenueEditPage implements OnInit {
    @Input() venueId!: number;

    public venue: Venue = {} as Venue;
    
    public venueMainData: Partial<VenueMainDto> = {};
    public venueDescription: string = ""
    public venueAddress: Partial<Address> = {};
    public venueOpeningDay: OpeningDate[] = []
    public venueImgSrc: string = ""
    public venueSocialMedia: SocialMedia = {} as SocialMedia;

    public updateVenue: Partial<VenueUpdateDto> = {};
    public updateAddress: Partial<Address> = {};
    public updateOpeningDay: Partial<OpeningDate[]> = []
    public updateImgSrc: string = ""
    public updateFormData: FormData = new FormData();

    public listRequestHttp: Observable<any>[] = []

    readonly isLoad = signal(false);
    public steps: String[] = ['MAIN', 'DESCRIPTION', 'SOCIAL_MEDIA', 'ADDRESS', 'OPENING_DAY', 'PICTURE', 'END']
    public progress = 1 / this.steps.length
    public indice: number = 0
    public step: String = this.steps[this.indice]

    private apiVenue = inject(ApiVenueService)
    private apiAddress = inject(ApiAddressService);
    private apiOpening = inject(ApiOpeningService);
    private apiVenueImg = inject(ApiVenueImgService);
    private helper = inject(HelperService);
    private alertCtrlService = inject(AlertControllerService);
    private toastService = inject(ToastService);

    constructor(
        private router: Router, 
        private route: ActivatedRoute,
    ) {
        addIcons({ closeOutline, chevronBackOutline, cloudUploadOutline, addCircleOutline });
    }

    ngOnInit(): void {
        this.apiVenue.findVenueById(this.venueId)
            .subscribe({
                next: (venue: Venue) => {
                    this.venue = venue;

                    this.venueMainData = {
                        id: venue.id,
                        nameVenue: venue.nameVenue,
                        isOnsit: venue.isOnsit,
                        isTakeaway: venue.isTakeaway,
                        typeVenue: venue.typeVenue
                    }

                    this.venueSocialMedia = {
                        instagram: venue.instagram,
                        youtube: venue.youtube,
                        tiktok: venue.tiktok,
                        facebook: venue.facebook,
                        twitter: venue.twitter
                    }

                    this.venueDescription = venue.description

                    this.venueAddress = venue.address

                    this.venueOpeningDay = venue.openings

                    this.venueImgSrc = venue?.imgVenue?.length ? venue.imgVenue[0].file : "";
                },
                complete: () => this.isLoad.set(true)
            })
    }

    nextVenueMain(newVenueMainData: Partial<VenueMainDto>) {
        this.venueMainData = newVenueMainData

        this.updateVenue.id = this.venue.id
        this.updateVenue.nameVenue = newVenueMainData.nameVenue
        this.updateVenue.isOnsit = newVenueMainData.isOnsit
        this.updateVenue.isTakeaway = newVenueMainData.isTakeaway
        this.updateVenue.typeVenueId = newVenueMainData.typeVenue?.id
        this.next()
    }

    nextDescription(newVenueDescription: string) {
        this.venueDescription = newVenueDescription
        this.updateVenue.description = newVenueDescription
        this.next()
    }

    nextSocialMedia(newSocialMedia: SocialMedia) {
        this.venueSocialMedia = newSocialMedia
        this.updateVenue.instagram = newSocialMedia.instagram
        this.updateVenue.tiktok = newSocialMedia.tiktok
        this.updateVenue.youtube = newSocialMedia.youtube
        this.updateVenue.twitter = newSocialMedia.twitter
        this.updateVenue.facebook = newSocialMedia.facebook
        this.next()
    }

    nextAddress(newVenueAddress: Partial<Address>) {
        this.venueAddress = newVenueAddress
        this.updateAddress = newVenueAddress
        this.next()
    }

    nextOpeningDay(newOpeningDay: OpeningDate[]) {
        this.venueOpeningDay = newOpeningDay
        this.updateOpeningDay = newOpeningDay
        this.next()
    }

    nextPicture(newPicture: FormData) {
        this.updateFormData = newPicture
        this.next()
    }

    submit() {
        this.alertCtrlService.showLoading()
        this.listRequestHttp = []
        this.saveAddress()
        this.saveOpeningDay()
        this.saveVenue()
        this.saveFile()

        if (this.listRequestHttp.length > 0) {
            forkJoin([...this.listRequestHttp]).subscribe(
                {
                    next: (_value: unknown) => {
                        this.toastService.toastSuccess(
                            'Changes have been saved successfully !',
                            'The information of your venue has been saved.'
                        )
                    },
                    error: (_err: unknown) => {
                        this.toastService.toastDanger(
                            'Failed to save changes.',
                            'Please try again.'
                        )
                    },
                    complete: () => {
                        this.alertCtrlService.stopLoading()
                        this.router.navigate(['..'], { relativeTo: this.route })
                    },
                }
            )
        } else {
            this.back()
        }
    }

    saveVenue() {
        const currentValue: VenueUpdateDto = {
            id: this.venue.id,
            nameVenue: this.venue.nameVenue,
            isTakeaway: this.venue.isTakeaway,
            isOnsit: this.venue.isOnsit,
            description: this.venue.description,
            typeVenueId: this.venue.typeVenue?.id,
            instagram: this.venue.instagram,
            youtube: this.venue.youtube,
            tiktok: this.venue.tiktok,
            facebook: this.venue.facebook,
            twitter: this.venue.twitter
        }
        const toUpdate = this.helper.getUpdatedFields(currentValue, this.updateVenue)
        if (Object.keys(toUpdate).length > 0 && this.venue.id !== undefined) {
            this.listRequestHttp.push(this.apiVenue.update(this.venue.id, toUpdate))
        }
    }

    saveAddress() {
        const toUpdate = this.helper.getUpdatedFields(this.venue.address, this.updateAddress)
        if (Object.keys(toUpdate).length > 0 && this.venue.address.id !== undefined) {
            this.listRequestHttp.push(this.apiAddress.update(this.venue.address.id, toUpdate))
        }
    }

    saveOpeningDay() {
        this.updateOpeningDay.forEach(item => {
            if(item !== undefined) {
                const currentValue = this.venue.openings.find(val => val.idDay === item.idDay)
                if (currentValue !== undefined) {
                    const toUpdate = this.helper.getUpdatedFields(currentValue, item)
                    if (Object.keys(toUpdate).length > 0 && currentValue.id !== undefined) {
                        this.listRequestHttp.push(this.apiOpening.update(currentValue.id, toUpdate))
                    }
                }
            }
        })
    }

    saveFile() {
        if(this.updateFormData.has('file')) {
            if ( this.venue.imgVenue?.length && this.venue.imgVenue.length > 0) {
                this.listRequestHttp.push(this.apiVenueImg.update(this.venue.imgVenue[0].id, this.updateFormData))
            } else {
                this.updateFormData.append('venue', this.venueId.toString())
                this.updateFormData.append('is_principal', 'true')
                this.listRequestHttp.push(this.apiVenueImg.uploadPhoto(this.updateFormData))
            }
        }
    }


    public next() {
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

    back() {
        this.alertCtrlService.stopLoading()
        this.router.navigate(['..'], { relativeTo: this.route})
     }

    public isIndiceNotMinMax() {
        return this.indice > 0 && this.indice < this.steps.length - 1 ? true : false
    }
}