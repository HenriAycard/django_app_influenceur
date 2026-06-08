import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, starHalf, starOutline } from 'ionicons/icons';

/**
 * Renders a 1–5 star rating. Read-only by default (shows half stars for
 * fractional averages); set `editable` to let the user pick a whole-star value
 * with a comfortable tap target and a tactile press animation.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-rating-stars',
    standalone: true,
    imports: [IonIcon],
    template: `
    <span class="stars" [class.editable]="editable">
      @for (i of [1,2,3,4,5]; track i) {
        <button type="button" class="star-btn" [disabled]="!editable" (click)="pick(i)"
          [style.--s.px]="size">
          <ion-icon [name]="iconFor(i)" [class.filled]="rating >= i - 0.5"></ion-icon>
        </button>
      }
    </span>
  `,
    styles: [`
    .stars { display: inline-flex; align-items: center; gap: 2px; vertical-align: middle; }
    .star-btn {
      --s: 18px;
      background: none; border: 0; padding: 0; margin: 0; line-height: 0;
      display: inline-flex;
    }
    .star-btn ion-icon {
      font-size: var(--s);
      color: #d7d7db;
      transition: transform .12s ease, color .12s ease;
    }
    .star-btn ion-icon.filled { color: #ffc409; }
    .editable .star-btn { cursor: pointer; padding: 4px; }
    .editable .star-btn:active ion-icon { transform: scale(1.25); }
  `],
})
export class RatingStarsComponent {
    /** Current rating (0–5, may be fractional when read-only). */
    @Input() rating = 0;
    @Input() editable = false;
    @Input() size = 18;
    @Output() ratingChange = new EventEmitter<number>();

    constructor() {
        addIcons({ star, starHalf, starOutline });
    }

    iconFor(position: number): string {
        if (this.rating >= position) return 'star';
        if (this.rating >= position - 0.5) return 'star-half';
        return 'star-outline';
    }

    pick(value: number): void {
        if (!this.editable) return;
        this.rating = value;
        this.ratingChange.emit(value);
    }
}
