import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoInstagram, logoTiktok, logoYoutube, star } from 'ionicons/icons';
import { User } from 'src/app/shared/models';
import { formatFollowers, getInfluencerInitials } from 'src/app/shared/util/influencer.util';

interface SocialStat { icon: string; cls: string; label: string; value: string; }

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-influencer-card',
    templateUrl: './influencer-card.component.html',
    styleUrls: ['./influencer-card.component.scss'],
    standalone: true,
    imports: [DecimalPipe, IonIcon],
})
export class InfluencerCardComponent {
    @Input() influencer!: User;

    constructor() {
        addIcons({ logoInstagram, logoTiktok, logoYoutube, star });
    }

    get initials(): string {
        return getInfluencerInitials(this.influencer.firstname, this.influencer.lastname);
    }

    get primaryHandle(): string {
        const i = this.influencer;
        const arr = [
            { f: i.instagramFollowers ?? 0, h: i.instagram },
            { f: i.tiktokFollowers ?? 0, h: i.tiktok },
            { f: i.youtubeFollowers ?? 0, h: i.youtube },
        ].filter(x => !!x.h);
        if (!arr.length) return '';
        arr.sort((a, b) => b.f - a.f);
        return '@' + arr[0].h;
    }

    get socials(): SocialStat[] {
        const i = this.influencer;
        const out: SocialStat[] = [];
        if (i.instagram) out.push({ icon: 'logo-instagram', cls: 'ig', label: 'Instagram', value: this.format(i.instagramFollowers) || '—' });
        if (i.tiktok)    out.push({ icon: 'logo-tiktok',    cls: 'tt', label: 'TikTok',    value: this.format(i.tiktokFollowers) || '—' });
        if (i.youtube)   out.push({ icon: 'logo-youtube',   cls: 'yt', label: 'YouTube',   value: this.format(i.youtubeFollowers) || '—' });
        return out;
    }

    format(n: number | null | undefined): string {
        return formatFollowers(n);
    }
}
