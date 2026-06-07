import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, starHalf, starOutline } from 'ionicons/icons';

/**
 * Renders a 1–5 star rating. Read-only by default (shows half stars for
 * fractional averages); set `editable` to let the user pick a whole-star value.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-rating-stars',
    standalone: true,
    imports: [IonIcon],
    template: `
    <span class="stars" [class.editable]="editable">
      @for (i of [1,2,3,4,5]; track i) {
        <ion-icon
          [name]="iconFor(i)"
          (click)="pick(i)"
          [style.font-size.px]="size"
          color="warning"></ion-icon>
      }
    </span>
  `,
    styles: [`
    .stars { display: inline-flex; align-items: center; gap: 2px; vertical-align: middle; }
    .stars.editable ion-icon { cursor: pointer; }
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
