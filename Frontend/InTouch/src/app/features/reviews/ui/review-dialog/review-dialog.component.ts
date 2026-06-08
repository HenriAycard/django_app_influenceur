import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star } from 'ionicons/icons';

/**
 * iOS App-Store-style rating dialog: title, tappable stars, hint, optional
 * comment, and Dismiss / Submit. Rendered inside a small centered ion-modal
 * (see `.review-alert-modal` in global.scss). Dismisses with
 * `{ rating, comment }` + role 'submit', or null + role 'cancel'.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-review-dialog',
    standalone: true,
    imports: [FormsModule, IonIcon],
    template: `
    <div class="dlg">
      <h2 class="dlg-title">{{ title }}</h2>

      <div class="dlg-stars">
        @for (i of [1,2,3,4,5]; track i) {
          <button type="button" class="star" (click)="rating.set(i)" [attr.aria-label]="i + ' stars'">
            <ion-icon name="star" [class.on]="i <= rating()"></ion-icon>
          </button>
        }
      </div>
      <div class="dlg-hint">{{ rating() ? labels[rating()] : 'Tap a Star to Rate' }}</div>

      <textarea class="dlg-text" [(ngModel)]="comment"
        placeholder="Leave a review (Optional)" maxlength="1000" rows="4"></textarea>

      <div class="dlg-actions">
        <button class="dlg-btn" (click)="dismiss()">Dismiss</button>
        <button class="dlg-btn primary" [class.disabled]="rating() < 1" (click)="submit()">Submit</button>
      </div>
    </div>
  `,
    styles: [`
    :host { display: block; }
    .dlg { text-align: center; padding-top: 18px; color: var(--ion-text-color, #000); }
    .dlg-title { font-size: 17px; font-weight: 700; margin: 0 16px 14px; }
    .dlg-stars { display: flex; justify-content: center; gap: 4px; margin-bottom: 4px; }
    .star { background: none; border: 0; padding: 4px; line-height: 0; cursor: pointer; }
    .star ion-icon { font-size: 30px; color: #c7c7cc; transition: transform .1s ease, color .1s ease; }
    .star ion-icon.on { color: #ff9500; }
    .star:active ion-icon { transform: scale(1.2); }
    .dlg-hint { color: #8e8e93; font-size: 13px; margin-bottom: 6px; min-height: 16px; }
    .dlg-text {
      width: 100%; box-sizing: border-box; resize: none;
      border: 0; border-top: 1px solid var(--ion-color-step-150, #d1d1d6);
      outline: none; padding: 16px; font: inherit; font-size: 15px;
      background: transparent; color: inherit;
    }
    .dlg-text::placeholder { color: #c7c7cc; }
    .dlg-actions { display: flex; border-top: 1px solid var(--ion-color-step-150, #d1d1d6); }
    .dlg-btn {
      flex: 1; background: none; border: 0; padding: 13px; cursor: pointer;
      font-size: 17px; color: var(--ion-color-primary, #007aff);
    }
    .dlg-btn:active { background: rgba(0,0,0,.05); }
    .dlg-btn.primary { font-weight: 700; border-left: 1px solid var(--ion-color-step-150, #d1d1d6); }
    .dlg-btn.disabled { color: #c7c7cc; }
  `],
})
export class ReviewDialogComponent {
    @Input() title = 'Leave a review';
    readonly rating = signal(0);
    public comment = '';
    readonly labels = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

    private modalCtrl = inject(ModalController);

    constructor() {
        addIcons({ star });
    }

    submit(): void {
        if (this.rating() < 1) return;
        this.modalCtrl.dismiss({ rating: this.rating(), comment: this.comment.trim() }, 'submit');
    }

    dismiss(): void {
        this.modalCtrl.dismiss(null, 'cancel');
    }
}
