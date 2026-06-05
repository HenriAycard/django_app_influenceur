import { CommonModule } from "@angular/common";
import { Component, inject, Input, OnInit } from "@angular/core";
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { IonContent, IonLabel, IonItem, IonTextarea, IonButton, IonInput, IonCol, IonTitle, IonGrid, IonRow, IonButtons, IonToolbar, IonHeader, IonBackButton } from "@ionic/angular/standalone";
import { OfferFormComponent } from "src/app/features/offers/ui/offer-form/offer-form.component";
import { Offer } from "src/app/shared/models";
import { AlertControllerService } from "src/app/services/alert-controller.service";
import { ApiOfferService } from "src/app/features/offers/api-offer.service";
import { ReloadService } from "src/app/services/reload.service";
import { ToastService } from "src/app/services/toast.service";

@Component({
    selector: 'app-offer-edit',
    templateUrl: './offer-edit.page.html',
    styleUrls: ['./offer-edit.page.scss'],
    standalone: true,
    imports: [RouterModule, IonContent, IonTitle, IonBackButton, IonToolbar, IonHeader, IonButtons, OfferFormComponent, CommonModule]
})
export class OfferEditPage implements OnInit {
    @Input() contractId!: number;
    public dealInput!: Partial<Offer>;
    public isLoad: boolean = false;


    private alertCtrlService = inject(AlertControllerService);
    private toastService = inject(ToastService);
    private apiOffer = inject(ApiOfferService);
    private reloadService = inject(ReloadService);

    constructor(
        private router: Router,
        private route: ActivatedRoute) {
    }
    
    ngOnInit(): void {
        this.apiOffer.findOfferById(this.contractId).subscribe({
            next: (value: Offer) => {
                this.dealInput = value
                this.isLoad = true
            }
        })
    }

    async update(offer: Partial<Offer>) {

        this.alertCtrlService.showLoading()

        this.apiOffer.updateOffer(this.contractId, offer).subscribe({
            next: (value: any) => {
                this.toastService.toastSuccess(
                    'Update offer !',
                    'Your offer has been saved.'
                )
            },
            error: (err: any) => {
                this.toastService.toastDanger(
                    'We have a little problem',
                    'Sorry your offer failed'
                )
            },
            complete: () => {
                this.alertCtrlService.stopLoading()

                this.router.navigate(['../../..'], { relativeTo: this.route }).then(() => {
                    this.reloadService.triggerReload();
                })
            },
        })
        
    }

    customCounterFormatter(inputLength: number, maxLength: number) {
        return `${maxLength - inputLength} characters remaining`;
    }

}