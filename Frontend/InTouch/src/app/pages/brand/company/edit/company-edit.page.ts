
import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { IonButton, IonCol, IonContent, IonIcon, IonItem, IonProgressBar, IonRow } from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { closeOutline, chevronBackOutline, cloudUploadOutline, addCircleOutline } from "ionicons/icons";
import { forkJoin, Observable } from "rxjs";
import { CompanyAddressPage } from "src/app/modal/company/address/company-address.component";
import { CompanyDescriptionPage } from "src/app/modal/company/description/company-description.component";
import { CompanyMainPage } from "src/app/modal/company/main/company-main.component";
import { CompanyOpeningDayPage } from "src/app/modal/company/opening-day/company-opening-day.component";
import { CompanyPicturePage } from "src/app/modal/company/picture/company-picture.component";
import { CompanySocialMediaComponent } from "src/app/modal/company/social-media/company-social-media.component";
import { Address, AddressDto, Company, CompanyCreateDto, CompanyMainDto, CompanyUpdateDto, SocialMedia, OpeningDate } from "src/app/shared/models";
import { AlertControllerService } from "src/app/services/alert-controller.service";
import { ApiAddressService } from "src/app/services/api/api-address.service";
import { ApiCompanyImgService } from "src/app/services/api/api-company-img.service";
import { ApiCompanyService } from "src/app/services/api/api-company.service";
import { ApiOpeningService } from "src/app/services/api/api-opening.service";
import { HelperService } from "src/app/services/helper.service";
import { ToastService } from "src/app/services/toast.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-company-edit',
    templateUrl: './company-edit.page.html',
    styleUrls: ['./company-edit.page.scss'],
    standalone: true,
    imports: [CompanyMainPage, CompanyDescriptionPage, CompanyAddressPage, CompanyOpeningDayPage, CompanyPicturePage, CompanySocialMediaComponent, IonProgressBar, IonIcon, IonButton, IonItem, IonContent, IonCol, IonRow]
})
export class CompanyEditPage implements OnInit {
    @Input() companyId!: number;

    public company: Company = {} as Company;
    
    public companyMainData: Partial<CompanyMainDto> = {};
    public companyDescription: string = ""
    public companyAddress: Partial<Address> = {};
    public companyOpeningDay: OpeningDate[] = []
    public companyImgSrc: string = ""
    public companySocialMedia: SocialMedia = {} as SocialMedia;

    public updateCompany: Partial<CompanyUpdateDto> = {};
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

    private apiCompany = inject(ApiCompanyService)
    private apiAddress = inject(ApiAddressService);
    private apiOpening = inject(ApiOpeningService);
    private apiCompanyImg = inject(ApiCompanyImgService);
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
        this.apiCompany.findCompanyById(this.companyId)
            .subscribe({
                next: (company: Company) => {
                    this.company = company;

                    this.companyMainData = {
                        id: company.id,
                        nameCompany: company.nameCompany,
                        isOnsit: company.isOnsit,
                        isTakeaway: company.isTakeaway,
                        typeCompany: company.typeCompany
                    }

                    this.companySocialMedia = {
                        instagram: company.instagram,
                        youtube: company.youtube,
                        tiktok: company.tiktok,
                        facebook: company.facebook,
                        twitter: company.twitter
                    }

                    this.companyDescription = company.description

                    this.companyAddress = company.address

                    this.companyOpeningDay = company.openings

                    this.companyImgSrc = company?.imgCompany?.length ? company.imgCompany[0].file : "";
                },
                complete: () => this.isLoad.set(true)
            })
    }

    nextCompanyMain(newCompanyMainData: Partial<CompanyMainDto>) {
        this.companyMainData = newCompanyMainData

        this.updateCompany.id = this.company.id
        this.updateCompany.nameCompany = newCompanyMainData.nameCompany
        this.updateCompany.isOnsit = newCompanyMainData.isOnsit
        this.updateCompany.isTakeaway = newCompanyMainData.isTakeaway
        this.updateCompany.typeCompanyId = newCompanyMainData.typeCompany?.id
        this.next()
    }

    nextDescription(newCompanyDescription: string) {
        this.companyDescription = newCompanyDescription
        this.updateCompany.description = newCompanyDescription
        this.next()
    }

    nextSocialMedia(newSocialMedia: SocialMedia) {
        this.companySocialMedia = newSocialMedia
        this.updateCompany.instagram = newSocialMedia.instagram
        this.updateCompany.tiktok = newSocialMedia.tiktok
        this.updateCompany.youtube = newSocialMedia.youtube
        this.updateCompany.twitter = newSocialMedia.twitter
        this.updateCompany.facebook = newSocialMedia.facebook
        this.next()
    }

    nextAddress(newCompanyAddress: Partial<Address>) {
        this.companyAddress = newCompanyAddress
        this.updateAddress = newCompanyAddress
        this.next()
    }

    nextOpeningDay(newOpeningDay: OpeningDate[]) {
        this.companyOpeningDay = newOpeningDay
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
        this.saveCompany()
        this.saveFile()

        if (this.listRequestHttp.length > 0) {
            forkJoin([...this.listRequestHttp]).subscribe(
                {
                    next: (value: any) => {
                        this.toastService.toastSuccess(
                            'Changes have been saved successfully !',
                            'The information of your company has been saved.'
                        )
                    },
                    error: (err: any) => {
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

    saveCompany() {
        const currentValue: CompanyUpdateDto = {
            id: this.company.id,
            nameCompany: this.company.nameCompany,
            isTakeaway: this.company.isTakeaway,
            isOnsit: this.company.isOnsit,
            description: this.company.description,
            typeCompanyId: this.company.typeCompany?.id,
            instagram: this.company.instagram,
            youtube: this.company.youtube,
            tiktok: this.company.tiktok,
            facebook: this.company.facebook,
            twitter: this.company.twitter
        }
        const toUpdate = this.helper.getUpdatedFields(currentValue, this.updateCompany)
        if (Object.keys(toUpdate).length > 0 && this.company.id !== undefined) {
            this.listRequestHttp.push(this.apiCompany.update(this.company.id, toUpdate))
        }
    }

    saveAddress() {
        const toUpdate = this.helper.getUpdatedFields(this.company.address, this.updateAddress)
        if (Object.keys(toUpdate).length > 0 && this.company.address.id !== undefined) {
            this.listRequestHttp.push(this.apiAddress.update(this.company.address.id, toUpdate))
        }
    }

    saveOpeningDay() {
        this.updateOpeningDay.forEach(item => {
            if(item !== undefined) {
                const currentValue = this.company.openings.find(val => val.idDay === item.idDay)
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
            if ( this.company.imgCompany?.length && this.company.imgCompany.length > 0) {
                this.listRequestHttp.push(this.apiCompanyImg.update(this.company.imgCompany[0].id, this.updateFormData))
            } else {
                this.updateFormData.append('company', this.companyId.toString())
                this.updateFormData.append('is_principal', 'true')
                this.listRequestHttp.push(this.apiCompanyImg.uploadPhoto(this.updateFormData))
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