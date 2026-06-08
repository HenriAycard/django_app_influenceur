import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { IonButton, IonIcon, IonModal } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star } from 'ionicons/icons';
import { Application } from 'src/app/shared/models';
import { AuthService } from 'src/app/services/auth.service';
import { RatingStarsComponent } from 'src/app/features/reviews/ui/rating-stars/rating-stars.component';
import { ReviewModalComponent } from 'src/app/features/reviews/ui/review-modal/review-modal.component';

/**
 * Drop-in block for a collaboration detail page. Shows the viewer's existing
 * review, or — when `reservation.canReview` — a CTA opening a bottom-sheet
 * rating modal. Emits `reviewed` after a successful submit so the parent reloads.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-review-section',
    standalone: true,
    imports: [IonButton, IonIcon, IonModal, RatingStarsComponent, ReviewModalComponent],
    template: `
    @if (reservation.myReview) {
      <div class="my-review">
        <div class="mr-head">
          <span class="mr-label">Your review</span>
          <app-rating-stars [rating]="reservation.myReview.rating" [size]="20"></app-rating-stars>
        </div>
        @if (reservation.myReview.comment) {
          <p class="mr-comment">{{ reservation.myReview.comment }}</p>
        }
      </div>
    } @else if (reservation.canReview) {
      <ion-button class="cta" expand="block" shape="round" (click)="open.set(true)">
        <ion-icon name="star" slot="start"></ion-icon>
        Rate this collaboration
      </ion-button>
    }

    <ion-modal
      class="review-sheet"
      [isOpen]="open()"
      [breakpoints]="[0, 0.9]"
      [initialBreakpoint]="0.9"
      handle="true"
      (didDismiss)="open.set(false)">
      <ng-template>
        <app-review-modal
          [reservationId]="reservation.id"
          [title]="title()"
          [subtitle]="subtitle()"
          (dismissChange)="onDismiss($event)"></app-review-modal>
      </ng-template>
    </ion-modal>
  `,
    styles: [`
    .cta {
      margin: 16px;
      --background: #ffc409;
      --background-activated: #e6b008;
      --color: #1f1300;
      --border-radius: 14px;
      --box-shadow: 0 6px 18px rgba(255, 196, 9, .35);
      font-weight: 700;
    }
    .my-review {
      margin: 16px;
      padding: 16px;
      border-radius: 16px;
      background: var(--ion-color-light);
    }
    .mr-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .mr-label { font-weight: 700; }
    .mr-comment { margin: 10px 0 0; color: var(--ion-color-dark); line-height: 1.45; }
    .review-sheet::part(handle) { background: var(--ion-color-medium); }
  `],
})
export class ReviewSectionComponent {
    @Input() reservation!: Application;
    @Output() reviewed = new EventEmitter<void>();

    readonly open = signal(false);
    private auth = inject(AuthService);

    constructor() {
        addIcons({ star });
    }

    private isBrand(): boolean {
        return !!this.auth.user?.isCompany;
    }

    title(): string {
        return this.isBrand()
            ? `Rate ${this.reservation.user?.firstname ?? 'the influencer'}`
            : `Rate ${this.reservation.offer?.venue?.nameVenue ?? 'this venue'}`;
    }

    subtitle(): string {
        return this.isBrand()
            ? 'How was working with this influencer?'
            : 'How was your experience at this venue?';
    }

    onDismiss(submitted: boolean): void {
        this.open.set(false);
        if (submitted) {
            this.reviewed.emit();
        }
    }
}
