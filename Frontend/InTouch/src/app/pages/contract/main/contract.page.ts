import { CommonModule } from "@angular/common";
import { Component, inject, Input, OnInit } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonItem, IonLabel, IonList, IonModal, IonText, IonTitle, IonToolbar, NavController } from "@ionic/angular/standalone";
import { HasRoleDirective } from "src/app/directive/has-role.directive";
import { Deal } from "src/app/models/deal";
import { ApiDealService } from "src/app/services/api/api-deal.service";
import { Location } from '@angular/common';
import { ModalNewReservationComponent } from "src/app/modal/reservation/new/modal-new-reservation.component";


@Component({
    selector: 'app-contract',
    templateUrl: './contract.page.html',
    styleUrls: ['./contract.page.scss'],
    standalone: true,
    imports: [HasRoleDirective, CommonModule, IonText, IonLabel, IonItem, IonList, IonCard, IonCardContent, IonCardTitle, IonCardHeader, IonContent, IonTitle, IonBackButton, IonButtons, IonToolbar, IonHeader, ModalNewReservationComponent, IonModal, IonButton]
})
export class ContractPage implements OnInit {
    @Input() contractId!: number;
    public contract!: Deal;
    public isLoad: boolean = false;

    public noEndDate: boolean = true;
    public isPaymentTerms: boolean = false;
    public isExclusivityClause: boolean = false;
    public isApprovalRequired: boolean = false;
    public isAdditionalInfos: boolean = false;

    // Modal
    public canDismiss = false;
    public isModalOpen = false;
    public presentingElement: Element | null = null;

    private apiDeal = inject(ApiDealService);
    private navCtrl = inject(NavController)

    ngOnInit(): void {
        this.apiDeal.findDealById(this.contractId).subscribe({
            next: (value: Deal) => {
                this.contract = value
                this.initCondition()
                this.isLoad = true
            }
        })
        this.presentingElement = document.querySelector('.ion-page');
    }

    initCondition() {
        if (this.contract.endDate) this.noEndDate = false
        if (this.contract.paymentAmount ||
            this.contract.paymentTerms) this.isPaymentTerms = true
        if (this.contract.exclusivityDuration ||
            this.contract.restrictedCompetitors ||
            this.contract.scopeExclusivity ||
            this.contract.exclusivityType ||
            this.contract.exclusivitySpecification) this.isExclusivityClause = true
        if (this.contract.contactApprover) this.isApprovalRequired = true
        if (this.contract.cancellationPolicy ||
            this.contract.specialInstructions) this.isAdditionalInfos = true
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