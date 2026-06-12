import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { VenueSortDto } from 'src/app/shared/models';
import { RatingBadgeComponent } from 'src/app/features/reviews/ui/rating-badge/rating-badge.component';

/** Premium venue card used by the discovery feed and the search results.
 *  Navigation is the parent's job: bind (click) on the host. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-venue-card',
  standalone: true,
  imports: [SlicePipe, RatingBadgeComponent],
  templateUrl: './venue-card.component.html',
  styleUrls: ['./venue-card.component.scss'],
})
export class VenueCardComponent {
  readonly venue = input.required<VenueSortDto>();
}
