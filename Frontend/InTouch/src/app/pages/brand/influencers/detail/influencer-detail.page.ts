import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActionSheetController, IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonSpinner, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircle, arrowBack, checkmarkCircle, logoInstagram, logoTiktok, logoYoutube, mailOutline, star } from 'ionicons/icons';
import { firstValueFrom, forkJoin } from 'rxjs';
import { User, VenueSortDto } from 'src/app/shared/models';
import { formatFollowers, getInfluencerInitials } from 'src/app/shared/util/influencer.util';
import { InfluencerDiscoveryStore } from 'src/app/features/influencer-discovery/influencer-discovery.store';
import { ApplicationStore } from 'src/app/features/applications/application.store';
import { ApiVenueService } from 'src/app/services/api/api-venue.service';
import { ApiOfferService } from 'src/app/features/offers/api-offer.service';
import { ToastService } from 'src/app/services/toast.service';

interface Social { icon: string; cls: string; label: string; count: string; handle: string; url: string; }

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-influencer-detail',
    templateUrl: './influencer-detail.page.html',
    styleUrls: ['./influencer-detail.page.scss'],
    standalone: true,
    imports: [DecimalPipe, IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonSpinner],
})
export class InfluencerDetailPage implements OnInit {
    @Input() influencerId!: string;

    protected readonly influencer = signal<User | null>(null);
    protected readonly venues = signal<VenueSortDto[]>([]);
    protected readonly isLoad = signal(false);
    protected readonly sending = signal(false);

    private readonly store = inject(InfluencerDiscoveryStore);
    private readonly appStore = inject(ApplicationStore);
    private readonly apiVenue = inject(ApiVenueService);
    private readonly apiOffer = inject(ApiOfferService);
    private readonly actionSheet = inject(ActionSheetController);
    private readonly toast = inject(ToastService);
    private readonly navCtrl = inject(NavController);

    constructor() {
        addIcons({ alertCircle, arrowBack, checkmarkCircle, logoInstagram, logoTiktok, logoYoutube, mailOutline, star });
    }

    ngOnInit(): void {
        forkJoin([
            this.store.findOne(this.influencerId),
            this.apiVenue.findVenue(),
        ]).subscribe({
            next: ([influencer, venuePage]) => {
                this.influencer.set(influencer);
                this.venues.set(venuePage.results);
                this.isLoad.set(true);
            },
            error: () => this.isLoad.set(true),
        });
    }

    protected async inviteCta(): Promise<void> {
        const vs = this.venues();
        if (!vs.length) {
            this.toast.toastWarn('No venues', 'Create a venue first before sending invitations.');
            return;
        }

        const venueSheet = await this.actionSheet.create({
            header: 'Select a venue',
            buttons: [
                ...vs.map(v => ({
                    text: v.nameVenue,
                    handler: () => { void this.pickOffer(v.id!); },
                })),
                { text: 'Cancel', role: 'cancel' },
            ],
        });
        await venueSheet.present();
    }

    private async pickOffer(venueId: number): Promise<void> {
        let offers: any[] = [];
        try {
            offers = await firstValueFrom(this.apiOffer.findOffersByVenueId(venueId));
        } catch { /* ignore */ }
        // The owner listing includes archived offers; they can't be invited to.
        offers = offers.filter(o => !o.archivedAt);

        if (!offers.length) {
            this.toast.toastWarn('No offers', 'This venue has no active offers. Create one first.');
            return;
        }

        const offerSheet = await this.actionSheet.create({
            header: 'Select an offer',
            buttons: [
                ...offers
                    .filter(o => o.id != null)
                    .map(o => ({
                        text: o.name,
                        handler: () => { this.doSend(o.id); },
                    })),
                { text: 'Cancel', role: 'cancel' },
            ],
        });
        await offerSheet.present();
    }

    private doSend(offerId: number): void {
        if (this.sending()) return;
        this.sending.set(true);
        this.appStore.sendInvitation(offerId, this.influencerId).subscribe({
            next: () => {
                this.sending.set(false);
                this.toast.toastSuccess('Invitation sent!', 'The influencer will be notified.');
            },
            error: (err: any) => {
                this.sending.set(false);
                this.toast.toastDanger('Invitation failed', err?.error?.detail ?? 'Could not send the invitation.');
            },
        });
    }

    protected goBack(): void {
        this.navCtrl.navigateBack('/brand/influencers');
    }

    protected format(n: number | null | undefined): string {
        return formatFollowers(n);
    }

    get initials(): string {
        const u = this.influencer();
        return getInfluencerInitials(u?.firstname, u?.lastname);
    }

    get socials(): Social[] {
        const u = this.influencer();
        if (!u) return [];
        const out: Social[] = [];
        if (u.instagram) out.push({ icon: 'logo-instagram', cls: 'ig', label: 'Instagram', count: this.format(u.instagramFollowers) || '—', handle: u.instagram, url: 'https://instagram.com/' + u.instagram });
        if (u.tiktok)    out.push({ icon: 'logo-tiktok',    cls: 'tt', label: 'TikTok',    count: this.format(u.tiktokFollowers) || '—', handle: u.tiktok, url: 'https://tiktok.com/@' + u.tiktok });
        if (u.youtube)   out.push({ icon: 'logo-youtube',   cls: 'yt', label: 'YouTube',   count: this.format(u.youtubeFollowers) || '—', handle: u.youtube, url: 'https://youtube.com/@' + u.youtube });
        return out;
    }
}
