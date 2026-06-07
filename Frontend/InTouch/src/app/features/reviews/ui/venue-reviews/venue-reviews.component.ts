import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IonItem, IonLabel, IonList, IonNote } from '@ionic/angular/standalone';
import { Review } from 'src/app/shared/models';
import { ApiReviewService } from 'src/app/features/reviews/api-review.service';
import { RatingStarsComponent } from 'src/app/features/reviews/ui/rating-stars/rating-stars.component';

/** Lists the reviews influencers left about a venue. Self-fetches on init. */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-venue-reviews',
    standalone: true,
    imports: [DatePipe, IonList, IonItem, IonLabel, IonNote, RatingStarsComponent],
    template: `
    <h2 class="ion-margin-horizontal">Reviews</h2>
    @if (reviews().length) {
      <ion-list lines="full">
        @for (review of reviews(); track review.id) {
          <ion-item>
            <ion-label class="ion-text-wrap">
              <h3>{{ review.author.firstname }} {{ review.author.lastname }}</h3>
              <app-rating-stars [rating]="review.rating" [size]="16"></app-rating-stars>
              @if (review.comment) { <p>{{ review.comment }}</p> }
            </ion-label>
            <ion-note slot="end">{{ review.created | date:'mediumDate' }}</ion-note>
          </ion-item>
        }
      </ion-list>
    } @else {
      <p class="ion-margin-horizontal">No reviews yet.</p>
    }
  `,
})
export class VenueReviewsComponent implements OnInit {
    @Input() venueId!: number;

    readonly reviews = signal<Review[]>([]);
    private api = inject(ApiReviewService);

    ngOnInit(): void {
        if (this.venueId != null) {
            this.api.findForVenue(this.venueId).subscribe({
                next: list => this.reviews.set(list),
            });
        }
    }
}
