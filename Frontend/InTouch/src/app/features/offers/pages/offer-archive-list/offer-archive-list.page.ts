
import { ChangeDetectionStrategy, Component, computed, inject, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { archiveOutline, copyOutline } from 'ionicons/icons';
import { VenueStore } from 'src/app/features/venues/venue.store';
import { ToastService } from 'src/app/services/toast.service';

/** Compact list of a venue's archived offers (they are hidden from the venue
 * overview to keep it light). Tap opens the read-only detail; the end button
 * duplicates — the only way to revive an archived deal. */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-offer-archive-list',
    templateUrl: './offer-archive-list.page.html',
    styleUrls: ['./offer-archive-list.page.scss'],
    standalone: true,
    imports: [DatePipe, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar]
})
export class OfferArchiveListPage {
    @Input() venueId!: number;

    protected readonly store = inject(VenueStore);
    private toast = inject(ToastService);

    protected readonly archivedOffers = computed(() =>
        this.store.offers()
            .filter(o => !!o.archivedAt)
            .sort((a, b) => (b.archivedAt ?? '').localeCompare(a.archivedAt ?? ''))
    );

    constructor(
        private router: Router,
        private route: ActivatedRoute) {
        addIcons({archiveOutline, copyOutline});
    }

    ionViewWillEnter() {
        this.store.load(this.venueId).subscribe();
    }

    view(id: number) {
        this.router.navigate(['../offer', id], { relativeTo: this.route });
    }

    duplicate(id: number, event: Event) {
        event.stopPropagation();
        this.store.duplicateOffer(id).subscribe({
            next: (offer) => this.router.navigate(['../offer', offer.id, 'edit'], { relativeTo: this.route }),
            error: () => this.toast.toastDanger('Duplicate failed', 'Something went wrong. Please try again.'),
        });
    }
}
