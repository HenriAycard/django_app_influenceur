import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { CreateReviewDto } from 'src/app/shared/models';
import { ApiReviewService } from 'src/app/features/reviews/api-review.service';
import { ToastService } from 'src/app/services/toast.service';
import { RatingStarsComponent } from 'src/app/features/reviews/ui/rating-stars/rating-stars.component';

/**
 * Modal body for leaving a review on a completed collaboration. Placed inside an
 * <ion-modal> in the parent; emits `dismissChange(true)` once a review is saved.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-review-modal',
    standalone: true,
    imports: [FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonItem, IonLabel, IonTextarea, RatingStarsComponent],
    template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancel()">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item lines="none">
        <ion-label>Your rating</ion-label>
        <app-rating-stars [rating]="rating()" [editable]="true" [size]="34"
          (ratingChange)="rating.set($event)"></app-rating-stars>
      </ion-item>
      <ion-item lines="none">
        <ion-textarea label="Comment" labelPlacement="stacked" [autoGrow]="true"
          placeholder="Share how the collaboration went…" [maxlength]="1000"
          [(ngModel)]="comment"></ion-textarea>
      </ion-item>
      <ion-button expand="block" class="ion-margin-top" [disabled]="rating() < 1 || submitting()" (click)="submit()">
        Submit review
      </ion-button>
    </ion-content>
  `,
})
export class ReviewModalComponent {
    @Input() reservationId!: number;
    @Input() title = 'Leave a review';
    @Output() dismissChange = new EventEmitter<boolean>();

    readonly rating = signal(0);
    public comment = '';
    readonly submitting = signal(false);

    private api = inject(ApiReviewService);
    private toast = inject(ToastService);

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
            error: () => {
                this.submitting.set(false);
                this.toast.toastDanger('Could not post review', 'Please try again later.');
            },
        });
    }

    cancel(): void {
        this.dismissChange.emit(false);
    }
}
