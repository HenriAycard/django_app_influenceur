import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AlertController, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star } from 'ionicons/icons';
import { Application, CreateReviewDto } from 'src/app/shared/models';
import { AuthService } from 'src/app/services/auth.service';
import { ApiReviewService } from 'src/app/features/reviews/api-review.service';
import { ToastService } from 'src/app/services/toast.service';
import { RatingStarsComponent } from 'src/app/features/reviews/ui/rating-stars/rating-stars.component';

const RATING_OPTIONS = [
    { value: 5, label: '⭐⭐⭐⭐⭐  Excellent' },
    { value: 4, label: '⭐⭐⭐⭐  Very good' },
    { value: 3, label: '⭐⭐⭐  Good' },
    { value: 2, label: '⭐⭐  Fair' },
    { value: 1, label: '⭐  Poor' },
];

/**
 * Drop-in block for a collaboration detail page. Shows the viewer's existing
 * review, or — when `reservation.canReview` — a CTA that opens a native
 * ion-alert flow (rating radios, then an optional comment). Emits `reviewed`
 * after a successful submit so the parent reloads.
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
      <ion-button class="cta" expand="block" shape="round" (click)="openRating()">
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
    private alertCtrl = inject(AlertController);
    private api = inject(ApiReviewService);
    private toast = inject(ToastService);

    constructor() {
        addIcons({ star });
    }

    private isBrand(): boolean {
        return !!this.auth.user?.isCompany;
    }

    /** Step 1 — pick a star rating. */
    async openRating(): Promise<void> {
        const alert = await this.alertCtrl.create({
            header: this.isBrand()
                ? `Rate ${this.reservation.user?.firstname ?? 'the influencer'}`
                : `Rate ${this.reservation.offer?.venue?.nameVenue ?? 'this venue'}`,
            message: this.isBrand()
                ? 'How was working with this influencer?'
                : 'How was your experience at this venue?',
            inputs: RATING_OPTIONS.map((o, idx) => ({
                type: 'radio' as const,
                label: o.label,
                value: o.value,
                checked: idx === 0,
            })),
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Continue',
                    handler: (rating: number) => {
                        if (!rating) {
                            this.toast.toastWarn('Almost there', 'Please pick a rating.');
                            return false;
                        }
                        // Defer so this alert finishes dismissing before the next opens.
                        setTimeout(() => this.askComment(rating), 150);
                        return true;
                    },
                },
            ],
        });
        await alert.present();
    }

    /** Step 2 — optional comment, then submit. */
    private async askComment(rating: number): Promise<void> {
        const alert = await this.alertCtrl.create({
            header: 'Add a note',
            message: 'Optional — tell others how it went.',
            inputs: [{
                type: 'textarea',
                name: 'comment',
                placeholder: 'Share what went well…',
                attributes: { maxlength: 1000, rows: 4 },
            }],
            buttons: [
                { text: 'Skip', handler: () => { this.submit(rating, ''); } },
                { text: 'Post', handler: (data: { comment?: string }) => { this.submit(rating, (data?.comment ?? '').trim()); } },
            ],
        });
        await alert.present();
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
