import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, Output, ViewChild } from "@angular/core";
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonModal, IonText, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { createOutline, trashOutline, eyeOutline } from "ionicons/icons";
import { HasRoleDirective } from "src/app/directive/has-role.directive";
import { Deal } from "src/app/models/deal";
import { ActionPayload, ActionType, Role } from "src/app/models/role";
import { AuthService } from "src/app/services/auth.service";


@Component({
    selector: 'app-contract-card',
    templateUrl: './contract-card.component.html',
    styleUrls: ['./contract-card.component.scss'],
    standalone: true,
    imports: [CommonModule, HasRoleDirective, IonCard, IonLabel, IonItem, IonIcon, IonContent, IonButtons, IonList, IonButton, IonTitle, IonToolbar, IonHeader, IonModal, IonCardContent, IonCardTitle, IonCardHeader, IonText]
})
export class ContractCardComponent {
    @Input() contract!: Deal;
    @Output() actionPerformed: EventEmitter<ActionPayload<number>> = new EventEmitter();
    @ViewChild(IonModal) modal!: IonModal;

    public isModalOpen: boolean = false;

    private authService = inject(AuthService)

    constructor() {
        addIcons({createOutline, trashOutline, eyeOutline});
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

    onDelete() {
        this.closeModalAndSetAction('delete')
    }

    async closeModalAndSetAction(action: ActionType) {
        this.closeModal();
        await this.modal.onDidDismiss().then(() => this.emitAction(action))
    }

    private emitAction(action: ActionType) {
        if (this.contract && this.contract.id) {
            const data: number = this.contract.id
            const payload: ActionPayload<number> = { action, data };
            this.actionPerformed.emit(payload);
        }
    }
}