import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonIcon, IonModal } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { starOutline } from 'ionicons/icons';
import { Application } from 'src/app/shared/models';
import { AuthService } from 'src/app/services/auth.service';
import { RatingStarsComponent } from 'src/app/features/reviews/ui/rating-stars/rating-stars.component';
import { ReviewModalComponent } from 'src/app/features/reviews/ui/review-modal/review-modal.component';

/**
 * Drop-in block for a collaboration detail page. Shows the viewer's existing
 * review, or — when `reservation.canReview` — a button opening the rating modal.
 * Emits `reviewed` after a successful submit so the parent can reload.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-review-section',
    standalone: true,
    imports: [IonButton, IonIcon, IonModal, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, RatingStarsComponent, ReviewModalComponent],
    template: `
    @if (reservation.myReview) {
      <ion-card>
        <ion-card-header>
          <ion-card-subtitle>Your review</ion-card-subtitle>
          <ion-card-title>
            <app-rating-stars [rating]="reservation.myReview.rating" [size]="22"></app-rating-stars>
          </ion-card-title>
        </ion-card-header>
        @if (reservation.myReview.comment) {
          <ion-card-content>{{ reservation.myReview.comment }}</ion-card-content>
        }
      </ion-card>
    } @else if (reservation.canReview) {
      <ion-button expand="full" fill="outline" color="warning" (click)="open.set(true)">
        <ion-icon name="star-outline" slot="start"></ion-icon>Leave a review
      </ion-button>
    }

    <ion-modal [isOpen]="open()" (didDismiss)="open.set(false)">
      <ng-template>
        <app-review-modal [reservationId]="reservation.id" [title]="title()"
          (dismissChange)="onDismiss($event)"></app-review-modal>
      </ng-template>
    </ion-modal>
  `,
})
export class ReviewSectionComponent {
    @Input() reservation!: Application;
    @Output() reviewed = new EventEmitter<void>();

    readonly open = signal(false);
    private auth = inject(AuthService);

    constructor() {
        addIcons({ starOutline });
    }

    title(): string {
        if (this.auth.user?.isCompany) {
            return `Rate ${this.reservation.user?.firstname ?? 'the influencer'}`;
        }
        return `Rate ${this.reservation.offer?.venue?.nameVenue ?? 'this venue'}`;
    }

    onDismiss(submitted: boolean): void {
        this.open.set(false);
        if (submitted) {
            this.reviewed.emit();
        }
    }
}
