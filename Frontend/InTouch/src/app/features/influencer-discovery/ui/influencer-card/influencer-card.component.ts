import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IonCard, IonCardContent, IonCardTitle, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoInstagram, logoTiktok, logoYoutube, starOutline } from 'ionicons/icons';
import { User } from 'src/app/shared/models';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-influencer-card',
    templateUrl: './influencer-card.component.html',
    styleUrls: ['./influencer-card.component.scss'],
    standalone: true,
    imports: [DecimalPipe, IonCard, IonCardContent, IonCardTitle, IonIcon],
})
export class InfluencerCardComponent {
    @Input() influencer!: User;

    constructor() {
        addIcons({ logoInstagram, logoTiktok, logoYoutube, starOutline });
    }

    get initials(): string {
        return ((this.influencer.firstname?.[0] ?? '') + (this.influencer.lastname?.[0] ?? '')) || '?';
    }

    format(n: number | null | undefined): string {
        if (n == null) return '';
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
        if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
        return n.toString();
    }
}
