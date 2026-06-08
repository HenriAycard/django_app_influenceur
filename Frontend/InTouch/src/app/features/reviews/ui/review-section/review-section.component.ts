import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { IonButton, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star } from 'ionicons/icons';
import { Application, CreateReviewDto } from 'src/app/shared/models';
import { AuthService } from 'src/app/services/auth.service';
import { ApiReviewService } from 'src/app/features/reviews/api-review.service';
import { ToastService } from 'src/app/services/toast.service';
import { RatingStarsComponent } from 'src/app/features/reviews/ui/rating-stars/rating-stars.component';
import { ReviewDialogComponent } from 'src/app/features/reviews/ui/review-dialog/review-dialog.component';

/**
 * Drop-in block for a collaboration detail page. Shows the viewer's existing
 * review, or — when `reservation.canReview` — a CTA opening an iOS-style rating
 * dialog (ReviewDialogComponent). Emits `reviewed` after a successful submit.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-review-section',
    standalone: true,
    imports: [IonButton, IonIcon, RatingStarsComponent],
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
      <ion-button class="cta" expand="block" shape="round" (click)="openDialog()">
        <ion-icon name="star" slot="start"></ion-icon>
        Rate this collaboration
      </ion-button>
    }
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
    .my-review { margin: 16px; padding: 16px; border-radius: 16px; background: var(--ion-color-light); }
    .mr-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .mr-label { font-weight: 700; }
    .mr-comment { margin: 10px 0 0; color: var(--ion-color-dark); line-height: 1.45; }
  `],
})
export class ReviewSectionComponent {
    @Input() reservation!: Application;
    @Output() reviewed = new EventEmitter<void>();

    private auth = inject(AuthService);
    private modalCtrl = inject(ModalController);
    private api = inject(ApiReviewService);
    private toast = inject(ToastService);

    constructor() {
        addIcons({ star });
    }

    private title(): string {
        return this.auth.user?.isCompany
            ? `How was ${this.reservation.user?.firstname ?? 'the influencer'}?`
            : `How was ${this.reservation.offer?.venue?.nameVenue ?? 'this venue'}?`;
    }

    async openDialog(): Promise<void> {
        const modal = await this.modalCtrl.create({
            component: ReviewDialogComponent,
            cssClass: 'review-alert-modal',
            backdropDismiss: true,
            componentProps: { title: this.title() },
        });
        await modal.present();

        const { data, role } = await modal.onWillDismiss<{ rating: number; comment: string }>();
        if (role === 'submit' && data) {
            this.submit(data.rating, data.comment);
        }
    }

    private submit(rating: number, comment: string): void {
        const payload: CreateReviewDto = { reservationId: this.reservation.id, rating, comment };
        this.api.create(payload).subscribe({
            next: () => {
                this.toast.toastSuccess('Thanks!', 'Your review has been posted.');
                this.reviewed.emit();
            },
            error: (err: { error?: { detail?: string } }) => {
                const detail = typeof err?.error?.detail === 'string' ? err.error.detail : 'Please try again later.';
                this.toast.toastDanger('Could not post review', detail);
            },
        });
    }
}
