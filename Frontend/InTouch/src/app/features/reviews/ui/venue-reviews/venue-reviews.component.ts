import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Review } from 'src/app/shared/models';
import { ApiReviewService } from 'src/app/features/reviews/api-review.service';
import { RatingStarsComponent } from 'src/app/features/reviews/ui/rating-stars/rating-stars.component';

/** Lists the reviews influencers left about a venue. Self-fetches on init. */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-venue-reviews',
    standalone: true,
    imports: [DatePipe, RatingStarsComponent],
    template: `
    <div class="vr">
      <h2 class="vr-title">Reviews @if (reviews().length) { <span>({{ reviews().length }})</span> }</h2>

      @if (loaded() && !reviews().length) {
        <p class="vr-empty">No reviews yet — be the first after a collaboration.</p>
      }

      @for (review of reviews(); track review.id) {
        <div class="vr-item">
          <div class="vr-avatar">{{ initials(review) }}</div>
          <div class="vr-body">
            <div class="vr-row">
              <span class="vr-name">{{ review.author.firstname }} {{ review.author.lastname }}</span>
              <span class="vr-date">{{ review.created | date:'mediumDate' }}</span>
            </div>
            <app-rating-stars [rating]="review.rating" [size]="15"></app-rating-stars>
            @if (review.comment) { <p class="vr-comment">{{ review.comment }}</p> }
          </div>
        </div>
      }
    </div>
  `,
    styles: [`
    .vr { padding: 8px 16px 24px; }
    .vr-title { font-size: 1.15rem; font-weight: 800; margin: 8px 0 12px; }
    .vr-title span { color: var(--ion-color-medium); font-weight: 600; }
    .vr-empty { color: var(--ion-color-medium); }
    .vr-item { display: flex; gap: 12px; padding: 14px 0; border-top: 1px solid var(--ion-color-light-shade); }
    .vr-avatar {
      flex: 0 0 40px; height: 40px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: var(--ion-color-primary); color: #fff; font-weight: 700; font-size: .85rem;
      text-transform: uppercase;
    }
    .vr-body { flex: 1; min-width: 0; }
    .vr-row { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
    .vr-name { font-weight: 700; }
    .vr-date { color: var(--ion-color-medium); font-size: .8rem; flex: 0 0 auto; }
    .vr-comment { margin: 6px 0 0; line-height: 1.45; color: var(--ion-color-dark); }
  `],
})
export class VenueReviewsComponent implements OnInit {
    @Input() venueId!: number;

    readonly reviews = signal<Review[]>([]);
    readonly loaded = signal(false);
    private api = inject(ApiReviewService);

    ngOnInit(): void {
        if (this.venueId != null) {
            this.api.findForVenue(this.venueId).subscribe({
                next: list => { this.reviews.set(list); this.loaded.set(true); },
                error: () => this.loaded.set(true),
            });
        }
    }

    initials(review: Review): string {
        const f = review.author.firstname?.[0] ?? '';
        const l = review.author.lastname?.[0] ?? '';
        return (f + l) || '?';
    }
}
