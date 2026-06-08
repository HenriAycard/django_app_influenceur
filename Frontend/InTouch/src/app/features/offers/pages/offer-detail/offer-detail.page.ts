import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonItem, IonLabel, IonList, IonModal, IonText, IonTitle, IonToolbar, NavController } from "@ionic/angular/standalone";
import { HasRoleDirective } from "src/app/directive/has-role.directive";
import { Offer } from "src/app/shared/models";
import { ApiOfferService } from "src/app/features/offers/api-offer.service";
import { Location } from '@angular/common';
import { ModalNewReservationComponent } from "src/app/modal/reservation/new/modal-new-reservation.component";


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-offer-detail',
    templateUrl: './offer-detail.page.html',
    styleUrls: ['./offer-detail.page.scss'],
    standalone: true,
    imports: [HasRoleDirective, IonText, IonLabel, IonItem, IonList, IonCard, IonCardContent, IonCardTitle, IonCardHeader, IonContent, IonTitle, IonBackButton, IonButtons, IonToolbar, IonHeader, ModalNewReservationComponent, IonModal, IonButton, DatePipe]
})
export class OfferDetailPage implements OnInit {
    @Input() offerId!: number;
    /** Present when this offer is opened from an existing collaboration (route
     *  `…/:bookingId/offer/:offerId`). In that context the page is read-only:
     *  the influencer has already applied, so the "apply" CTA is hidden. */
    @Input() bookingId?: number;
    public offer!: Offer;
    readonly isLoad = signal(false);

    /** Influencers can apply only when browsing an offer, not from a collaboration. */
    get canApply(): boolean {
        return this.bookingId == null;
    }

    public noEndDate: boolean = true;
    public isPaymentTerms: boolean = false;
    public isExclusivityClause: boolean = false;
    public isApprovalRequired: boolean = false;
    public isAdditionalInfos: boolean = false;

    // Modal
    public canDismiss = false;
    public isModalOpen = false;
    public presentingElement: Element | null = null;

    private apiOffer = inject(ApiOfferService);
    private navCtrl = inject(NavController)

    ngOnInit(): void {
        this.apiOffer.findOfferById(this.offerId).subscribe({
            next: (value: Offer) => {
                this.offer = value
                this.initCondition()
                this.isLoad.set(true)
            }
        })
        this.presentingElement = document.querySelector('.ion-page');
    }

    initCondition() {
        if (this.offer.endDate) this.noEndDate = false
        if (this.offer.paymentAmount ||
            this.offer.paymentTerms) this.isPaymentTerms = true
        if (this.offer.exclusivityDuration ||
            this.offer.restrictedCompetitors ||
            this.offer.scopeExclusivity ||
            this.offer.exclusivityType ||
            this.offer.exclusivitySpecification) this.isExclusivityClause = true
        if (this.offer.contactApprover) this.isApprovalRequired = true
        if (this.offer.cancellationPolicy ||
            this.offer.specialInstructions) this.isAdditionalInfos = true
    }

    openModal() {
        this.isModalOpen = true;
        this.canDismiss = false;
    }

    onDismissChange(canDismiss: boolean) {
        this.canDismiss = canDismiss
        this.isModalOpen = false
    }

    goBack() {
        //this.location.back(); // Goes back to the last route
        this.navCtrl.back()
    }
}