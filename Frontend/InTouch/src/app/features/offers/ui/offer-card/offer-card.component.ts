
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output, ViewChild } from "@angular/core";
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonModal, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { archiveOutline, createOutline, eyeOutline, chevronForward, cashOutline } from "ionicons/icons";
import { Offer, ActionPayload, ActionType, Role } from "src/app/shared/models";
import { AuthService } from "src/app/services/auth.service";


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-offer-card',
    templateUrl: './offer-card.component.html',
    styleUrls: ['./offer-card.component.scss'],
    standalone: true,
    imports: [IonLabel, IonItem, IonIcon, IonContent, IonButtons, IonList, IonButton, IonTitle, IonToolbar, IonHeader, IonModal]
})
export class OfferCardComponent {
    @Input() offer!: Offer;
    @Output() actionPerformed: EventEmitter<ActionPayload<number>> = new EventEmitter();
    @ViewChild(IonModal) modal!: IonModal;

    public isModalOpen: boolean = false;

    private authService = inject(AuthService)

    constructor() {
        addIcons({archiveOutline, createOutline, eyeOutline, chevronForward, cashOutline});
    }

    get isArchived(): boolean {
        return !!this.offer.archivedAt;
    }

    checkUserRole(requiredRoles: Role[]): boolean {
        const userRoles = this.authService.getCurrentUserProfile();
        return userRoles.roles.some(role => requiredRoles.includes(role));
    }

    onCardDealClick() {
        if (this.checkUserRole(['COMPANY'])) {
            this.isModalOpen = true
        } else if (this.checkUserRole(['INFLUENCER'])){
            // Influencer can only view access
            this.emitAction('view')
        }
    }

    closeModal() {
        this.isModalOpen = false
    }

    onView() {
        this.closeModalAndSetAction('view')
    }

    onEdit() {
        this.closeModalAndSetAction('edit')
    }

    onArchive() {
        this.closeModalAndSetAction('archive')
    }

    async closeModalAndSetAction(action: ActionType) {
        this.closeModal();
        await this.modal.onDidDismiss().then(() => this.emitAction(action))
    }

    private emitAction(action: ActionType) {
        if (this.offer && this.offer.id) {
            const data: number = this.offer.id
            const payload: ActionPayload<number> = { action, data };
            this.actionPerformed.emit(payload);
        }
    }
}