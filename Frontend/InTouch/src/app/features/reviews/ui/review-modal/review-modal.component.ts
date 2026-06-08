import { ChangeDetectionStrategy, Component, computed, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTextarea, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { CreateReviewDto } from 'src/app/shared/models';
import { ApiReviewService } from 'src/app/features/reviews/api-review.service';
import { ToastService } from 'src/app/services/toast.service';
import { RatingStarsComponent } from 'src/app/features/reviews/ui/rating-stars/rating-stars.component';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

/**
 * Sheet-modal body for rating a completed collaboration. Designed to live inside
 * an <ion-modal> with breakpoints (bottom-sheet). Emits `dismissChange(true)`
 * once the review is saved, `false` on cancel.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-review-modal',
    standalone: true,
    imports: [FormsModule, IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTextarea, RatingStarsComponent],
    template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button (click)="cancel()"><ion-icon name="close" slot="icon-only"></ion-icon></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="rm">
        <h2 class="rm-title">{{ title }}</h2>
        <p class="rm-sub">{{ subtitle }}</p>

        <div class="rm-stars">
          <app-rating-stars [rating]="rating()" [editable]="true" [size]="46"
            (ratingChange)="rating.set($event)"></app-rating-stars>
          <div class="rm-label" [class.placeholder]="rating() < 1">{{ label() }}</div>
        </div>

        <ion-textarea
          class="rm-text"
          fill="outline"
          [autoGrow]="true"
          [counter]="true"
          [maxlength]="1000"
          [rows]="4"
          placeholder="Share what went well (optional)…"
          [(ngModel)]="comment"></ion-textarea>

        <ion-button class="rm-submit" expand="block" shape="round"
          [disabled]="rating() < 1 || submitting()" (click)="submit()">
          {{ submitting() ? 'Posting…' : 'Post review' }}
        </ion-button>
      </div>
    </ion-content>
  `,
    styles: [`
    ion-toolbar { --background: transparent; --border-width: 0; }
    .rm { max-width: 520px; margin: 0 auto; text-align: center; }
    .rm-title { font-size: 1.4rem; font-weight: 800; margin: 0 0 6px; }
    .rm-sub { color: var(--ion-color-medium); margin: 0 0 22px; }
    .rm-stars { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 26px; }
    .rm-label { font-weight: 700; color: var(--ion-color-dark); min-height: 1.2em; }
    .rm-label.placeholder { color: var(--ion-color-medium); font-weight: 500; }
    .rm-text { text-align: left; margin-bottom: 22px; --border-radius: 14px; }
    .rm-submit { --border-radius: 14px; font-weight: 700; --box-shadow: none; margin: 0; }
  `],
})
export class ReviewModalComponent {
    @Input() reservationId!: number;
    @Input() title = 'Leave a review';
    @Input() subtitle = 'How was the collaboration?';
    @Output() dismissChange = new EventEmitter<boolean>();

    readonly rating = signal(0);
    public comment = '';
    readonly submitting = signal(false);
    readonly label = computed(() => RATING_LABELS[this.rating()] || 'Tap a star to rate');

    private api = inject(ApiReviewService);
    private toast = inject(ToastService);

    constructor() {
        addIcons({ close });
    }

    submit(): void {
        if (this.rating() < 1) {
            this.toast.toastWarn('Almost there', 'Please pick a rating.');
            return;
        }
        this.submitting.set(true);
        const payload: CreateReviewDto = {
            reservationId: this.reservationId,
            rating: this.rating(),
            comment: this.comment.trim(),
        };
        this.api.create(payload).subscribe({
            next: () => {
                this.toast.toastSuccess('Thanks!', 'Your review has been posted.');
                this.dismissChange.emit(true);
            },
            error: (err: HttpErrorResponse) => {
                this.submitting.set(false);
                const detail = typeof err?.error?.detail === 'string' ? err.error.detail : 'Please try again later.';
                this.toast.toastDanger('Could not post review', detail);
            },
        });
    }

    cancel(): void {
        this.dismissChange.emit(false);
    }
}
