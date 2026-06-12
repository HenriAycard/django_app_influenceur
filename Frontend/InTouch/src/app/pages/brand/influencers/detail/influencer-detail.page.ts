import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption, IonSpinner, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, logoInstagram, logoTiktok, logoYoutube, mailOutline, starOutline } from 'ionicons/icons';
import { forkJoin } from 'rxjs';
import { Application, Offer, User, VenueSortDto } from 'src/app/shared/models';
import { InfluencerDiscoveryStore } from 'src/app/features/influencer-discovery/influencer-discovery.store';
import { ApplicationStore } from 'src/app/features/applications/application.store';
import { ApiVenueService } from 'src/app/services/api/api-venue.service';
import { ApiOfferService } from 'src/app/features/offers/api-offer.service';
import { ToastService } from 'src/app/services/toast.service';
import { RatingBadgeComponent } from 'src/app/features/reviews/ui/rating-badge/rating-badge.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-influencer-detail',
    templateUrl: './influencer-detail.page.html',
    styleUrls: ['./influencer-detail.page.scss'],
    standalone: true,
    imports: [FormsModule, IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption, IonSpinner, RatingBadgeComponent],
})
export class InfluencerDetailPage implements OnInit {
    @Input() influencerId!: string;

    protected readonly influencer = signal<User | null>(null);
    protected readonly venues = signal<VenueSortDto[]>([]);
    protected readonly offers = signal<Offer[]>([]);
    protected readonly isLoad = signal(false);
    protected readonly sending = signal(false);

    protected selectedVenueId: number | null = null;
    protected selectedOfferId: number | null = null;

    private readonly store = inject(InfluencerDiscoveryStore);
    private readonly appStore = inject(ApplicationStore);
    private readonly apiVenue = inject(ApiVenueService);
    private readonly apiOffer = inject(ApiOfferService);
    private readonly toast = inject(ToastService);
    private readonly navCtrl = inject(NavController);

    constructor() {
        addIcons({ arrowBack, logoInstagram, logoTiktok, logoYoutube, mailOutline, starOutline });
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
        });
    }

    protected onVenueChange(): void {
        this.selectedOfferId = null;
        this.offers.set([]);
        if (!this.selectedVenueId) return;
        this.apiOffer.findOffersByVenueId(this.selectedVenueId).subscribe(
            offers => this.offers.set(offers)
        );
    }

    protected sendInvitation(): void {
        if (!this.selectedOfferId || !this.influencerId || this.sending()) return;
        this.sending.set(true);
        this.appStore.sendInvitation(this.selectedOfferId, this.influencerId).subscribe({
            next: () => {
                this.sending.set(false);
                this.toast.toastSuccess('Invitation sent!', 'The influencer will be notified.');
                this.selectedOfferId = null;
                this.selectedVenueId = null;
                this.offers.set([]);
            },
            error: (err: any) => {
                this.sending.set(false);
                this.toast.toastDanger('Invitation', err?.error?.detail ?? 'Could not send the invitation.');
            },
        });
    }

    protected goBack(): void {
        this.navCtrl.navigateBack('/brand/influencers');
    }

    protected format(n: number | null | undefined): string {
        if (n == null) return '';
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
        if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
        return n.toString();
    }

    get initials(): string {
        const u = this.influencer();
        return ((u?.firstname?.[0] ?? '') + (u?.lastname?.[0] ?? '')) || '?';
    }
}
