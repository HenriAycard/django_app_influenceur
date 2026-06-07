import { Injectable, inject, signal } from '@angular/core';
import { Observable, combineLatest, tap } from 'rxjs';
import { Venue, Offer } from 'src/app/shared/models';
import { ApiVenueService } from 'src/app/services/api/api-venue.service';
import { ApiOfferService } from 'src/app/features/offers/api-offer.service';

/**
 * Single source of truth for a venue (venue) and its offers — shared by the
 * brand venue overview and the influencer venue detail, which previously each
 * duplicated the same combineLatest fetch.
 */
@Injectable({ providedIn: 'root' })
export class VenueStore {
    private readonly apiVenue = inject(ApiVenueService);
    private readonly apiOffer = inject(ApiOfferService);

    private readonly _venue = signal<Venue | null>(null);
    private readonly _offers = signal<Offer[]>([]);
    private readonly _loaded = signal(false);

    readonly venue = this._venue.asReadonly();
    readonly offers = this._offers.asReadonly();
    readonly loaded = this._loaded.asReadonly();

    /**
     * Loads a venue and its offers together. Completes once both resolve, so a
     * pull-to-refresh can dismiss when done. Switching to a different venue clears
     * `loaded` first (so the skeleton shows); a same-venue refresh keeps the data.
     */
    load(venueId: number): Observable<unknown> {
        if (this._venue()?.id !== venueId) {
            this._loaded.set(false);
        }
        return combineLatest([
            this.apiVenue.findVenueById(venueId),
            this.apiOffer.findOffersByVenueId(venueId),
        ]).pipe(
            tap(([venue, offers]) => {
                venue.openings.sort((a, b) => a.idDay - b.idDay);
                this._venue.set(venue);
                this._offers.set(offers);
                this._loaded.set(true);
            })
        );
    }

    deleteOffer(id: number): Observable<unknown> {
        return this.apiOffer.deleteOffer(id);
    }
}
