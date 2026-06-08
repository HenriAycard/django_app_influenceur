import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star } from 'ionicons/icons';

/** Compact "★ 4.5 (12)" rating pill. Renders nothing when there is no rating. */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-rating-badge',
    standalone: true,
    imports: [IonIcon],
    template: `
    @if (average != null) {
      <span class="badge">
        <ion-icon name="star"></ion-icon>
        <strong>{{ average }}</strong>
        @if (count) { <span class="count">({{ count }})</span> }
      </span>
    }
  `,
    styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.85rem;
      line-height: 1;
      color: var(--ion-color-dark);
    }
    .badge ion-icon { color: #ffc409; font-size: 1rem; }
    .badge strong { font-weight: 700; }
    .badge .count { color: var(--ion-color-medium); font-weight: 500; }
  `],
})
export class RatingBadgeComponent {
    @Input() average: number | null = null;
    @Input() count = 0;

    constructor() {
        addIcons({ star });
    }
}
