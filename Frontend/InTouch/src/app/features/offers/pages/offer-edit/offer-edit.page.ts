
import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from "@angular/core";
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { IonContent, IonLabel, IonItem, IonTextarea, IonButton, IonInput, IonCol, IonTitle, IonGrid, IonRow, IonButtons, IonToolbar, IonHeader, IonBackButton } from "@ionic/angular/standalone";
import { OfferFormComponent } from "src/app/features/offers/ui/offer-form/offer-form.component";
import { Offer } from "src/app/shared/models";
import { AlertControllerService } from "src/app/services/alert-controller.service";
import { ApiOfferService } from "src/app/features/offers/api-offer.service";
import { ToastService } from "src/app/services/toast.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-offer-edit',
    templateUrl: './offer-edit.page.html',
    styleUrls: ['./offer-edit.page.scss'],
    standalone: true,
    imports: [RouterModule, IonContent, IonTitle, IonBackButton, IonToolbar, IonHeader, IonButtons, OfferFormComponent]
})
export class OfferEditPage implements OnInit {
    @Input() offerId!: number;
    public offerInput!: Partial<Offer>;
    readonly isLoad = signal(false);


    private alertCtrlService = inject(AlertControllerService);
    private toastService = inject(ToastService);
    private apiOffer = inject(ApiOfferService);

    constructor(
        private router: Router,
        private route: ActivatedRoute) {
    }
    
    ngOnInit(): void {
        this.apiOffer.findOfferById(this.offerId).subscribe({
            next: (value: Offer) => {
                // Frozen or archived terms can't be edited (the API would 400):
                // bounce back with the duplicate hint instead of a dead form.
                if (value.isEditable === false) {
                    this.toastService.toastWarn(
                        'Terms are frozen',
                        'This offer has applications or is archived. Duplicate it to make changes.'
                    )
                    this.router.navigate(['../../..'], { relativeTo: this.route })
                    return
                }
                this.offerInput = value
                this.isLoad.set(true)
            }
        })
    }

    async update(offer: Partial<Offer>) {

        this.alertCtrlService.showLoading()

        this.apiOffer.updateOffer(this.offerId, offer).subscribe({
            next: (_value: unknown) => {
                this.toastService.toastSuccess(
                    'Update offer !',
                    'Your offer has been saved.'
                )
            },
            error: (_err: unknown) => {
                this.toastService.toastDanger(
                    'We have a little problem',
                    'Sorry your offer failed'
                )
            },
            complete: () => {
                this.alertCtrlService.stopLoading()

                this.router.navigate(['../../..'], { relativeTo: this.route })
            },
        })
        
    }

    customCounterFormatter(inputLength: number, maxLength: number) {
        return `${maxLength - inputLength} characters remaining`;
    }

}