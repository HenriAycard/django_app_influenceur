import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { Application, CreateReviewDto } from 'src/app/shared/models';
import { AuthService } from 'src/app/services/auth.service';
import { ApiReviewService } from 'src/app/features/reviews/api-review.service';
import { ToastService } from 'src/app/services/toast.service';
import { RatingStarsComponent } from 'src/app/features/reviews/ui/rating-stars/rating-stars.component';
import { ReviewDialogComponent } from 'src/app/features/reviews/ui/review-dialog/review-dialog.component';

/**
 * Drop-in block for a collaboration detail page. Shows the viewer's existing
 * review, or — when `reservation.canReview` — an elegant inline "tap a star"
 * prompt that opens the rating dialog (pre-filled with the tapped star).
 * Emits `reviewed` after a successful submit.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-review-section',
    standalone: true,
    imports: [RatingStarsComponent],
    template: `
    @if (reservation.myReview) {
      <div class="card my-review">
        <div class="mr-head">
          <span class="mr-label">Your review</span>
          <app-rating-stars [rating]="reservation.myReview.rating" [size]="18"></app-rating-stars>
        </div>
        @if (reservation.myReview.comment) {
          <p class="mr-comment">“{{ reservation.myReview.comment }}”</p>
        }
      </div>
    } @else if (reservation.canReview) {
      <div class="card rate-prompt">
        <p class="rp-title">How was this collaboration?</p>
        <app-rating-stars [rating]="0" [editable]="true" [size]="36"
          (ratingChange)="openDialog($event)"></app-rating-stars>
        <p class="rp-sub">Tap a star to leave a review</p>
      </div>
    }
  `,
    styles: [`
    .card {
      margin: 16px;
      padding: 20px 18px;
      border-radius: 18px;
      background: var(--ion-background-color, #fff);
      border: 1px solid var(--ion-color-step-100, #ececec);
      box-shadow: 0 2px 10px rgba(0, 0, 0, .04);
    }
    .rate-prompt { text-align: center; }
    .rp-title { margin: 0 0 12px; font-weight: 700; font-size: 1.05rem; }
    .rp-sub { margin: 12px 0 0; color: var(--ion-color-medium); font-size: .82rem; }

    .my-review { padding: 16px 18px; }
    .mr-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .mr-label { font-weight: 700; }
    .mr-comment { margin: 10px 0 0; color: var(--ion-color-medium-shade); line-height: 1.5; font-style: italic; }
  `],
})
export class ReviewSectionComponent {
    @Input() reservation!: Application;
    @Output() reviewed = new EventEmitter<void>();

    private auth = inject(AuthService);
    private modalCtrl = inject(ModalController);
    private api = inject(ApiReviewService);
    private toast = inject(ToastService);

    private title(): string {
        return this.auth.user?.isCompany
            ? `How was ${this.reservation.user?.firstname ?? 'the influencer'}?`
            : `How was ${this.reservation.offer?.venue?.nameVenue ?? 'this venue'}?`;
    }

    async openDialog(initialRating = 0): Promise<void> {
        const modal = await this.modalCtrl.create({
            component: ReviewDialogComponent,
            cssClass: 'review-alert-modal',
            backdropDismiss: true,
            componentProps: { title: this.title(), initialRating },
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
