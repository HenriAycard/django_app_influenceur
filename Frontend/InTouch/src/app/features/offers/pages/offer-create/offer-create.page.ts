import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Offer } from 'src/app/shared/models';
import { AlertControllerService } from 'src/app/services/alert-controller.service';
import { ApiOfferService } from 'src/app/features/offers/api-offer.service';
import { ToastService } from 'src/app/services/toast.service';
import { IonContent, IonTitle, IonToolbar, IonBackButton, IonHeader, IonButtons } from '@ionic/angular/standalone';
import { OfferFormComponent } from 'src/app/features/offers/ui/offer-form/offer-form.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-offer-create',
    templateUrl: './offer-create.page.html',
    styleUrls: ['./offer-create.page.scss'],
    standalone: true,
    imports: [RouterModule, IonContent, IonTitle, IonBackButton, IonToolbar, IonHeader, IonButtons, OfferFormComponent]
})
export class OfferCreatePage {
    @Input() venueId!: number;
    public offerInput!: Partial<Offer>;

    private alertCtrlService = inject(AlertControllerService);
    private toastService = inject(ToastService);
    private apiOffer = inject(ApiOfferService);

    constructor(
        private router: Router,
        private route: ActivatedRoute) {
            console.log("create new page")
    }

    async save(offer: Partial<Offer>) {
        this.alertCtrlService.showLoading()

        let newOffer: Partial<Offer> = {
            venue: this.venueId,
            ...offer
        }

        this.apiOffer.createOffer(newOffer).subscribe({
            next: (_value: unknown) => {
                this.toastService.toastSuccess(
                    'New offer !',
                    'A new offer has been saved.'
                )
                this.alertCtrlService.stopLoading()
            },
            error: (_err: unknown) => {
                this.toastService.toastDanger(
                    'We have a little problem',
                    'Sorry your offer failed'
                )
                this.alertCtrlService.stopLoading()
            },
            complete: () => {
                this.router.navigate(['../..'], { relativeTo: this.route })
            },
        })

    }

}