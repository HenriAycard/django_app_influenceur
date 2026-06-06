import { Injectable, inject, signal } from '@angular/core';
import { Observable, combineLatest, tap } from 'rxjs';
import { Company } from 'src/app/models/company';
import { Offer } from 'src/app/shared/models';
import { ApiCompanyService } from 'src/app/services/api/api-company.service';
import { ApiOfferService } from 'src/app/features/offers/api-offer.service';

/**
 * Single source of truth for a venue (company) and its offers — shared by the
 * brand venue overview and the influencer venue detail, which previously each
 * duplicated the same combineLatest fetch.
 */
@Injectable({ providedIn: 'root' })
export class VenueStore {
    private readonly apiCompany = inject(ApiCompanyService);
    private readonly apiOffer = inject(ApiOfferService);

    private readonly _company = signal<Company | null>(null);
    private readonly _offers = signal<Offer[]>([]);
    private readonly _loaded = signal(false);

    readonly company = this._company.asReadonly();
    readonly offers = this._offers.asReadonly();
    readonly loaded = this._loaded.asReadonly();

    /**
     * Loads a venue and its offers together. Completes once both resolve, so a
     * pull-to-refresh can dismiss when done. Switching to a different venue clears
     * `loaded` first (so the skeleton shows); a same-venue refresh keeps the data.
     */
    load(companyId: number): Observable<unknown> {
        if (this._company()?.id !== companyId) {
            this._loaded.set(false);
        }
        return combineLatest([
            this.apiCompany.findCompanyById(companyId),
            this.apiOffer.findOffersByCompanyId(companyId),
        ]).pipe(
            tap(([company, offers]) => {
                company.openings.sort((a, b) => a.idDay - b.idDay);
                this._company.set(company);
                this._offers.set(offers);
                this._loaded.set(true);
            })
        );
    }

    deleteOffer(id: number): Observable<unknown> {
        return this.apiOffer.deleteOffer(id);
    }
}
