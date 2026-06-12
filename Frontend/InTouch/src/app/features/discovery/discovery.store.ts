import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, of, tap } from 'rxjs';
import { typeVenueDto, VenueSortDto } from 'src/app/shared/models';
import { ApiVenueService, VenueFeedFilter } from 'src/app/services/api/api-venue.service';
import { ApiVenueTypeService } from 'src/app/services/api/api-venue-type.service';

@Injectable({ providedIn: 'root' })
export class DiscoveryStore {
    private readonly api = inject(ApiVenueService);
    private readonly typeApi = inject(ApiVenueTypeService);

    // Search
    private readonly _query = signal('');
    private readonly _results = signal<VenueSortDto[]>([]);
    private readonly _loading = signal(false);

    // Feed + pagination
    private readonly _feed = signal<VenueSortDto[]>([]);
    private readonly _feedLoading = signal(false);
    private readonly _page = signal(1);
    private readonly _hasMore = signal(false);

    // Filter options
    private readonly _typeVenues = signal<typeVenueDto[]>([]);
    private readonly _cities = signal<string[]>([]);

    // Active filters
    private readonly _filterTypeVenueId = signal<number | null>(null);
    private readonly _filterCity = signal<string | null>(null);

    // Public read-only
    readonly query = this._query.asReadonly();
    readonly results = this._results.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly noResults = computed(() => !this._loading() && !!this._query() && this._results().length === 0);

    readonly feed = this._feed.asReadonly();
    readonly feedLoading = this._feedLoading.asReadonly();
    readonly feedEmpty = computed(() => !this._feedLoading() && this._feed().length === 0);
    readonly hasMore = this._hasMore.asReadonly();

    readonly typeVenues = this._typeVenues.asReadonly();
    readonly cities = this._cities.asReadonly();
    readonly filterTypeVenueId = this._filterTypeVenueId.asReadonly();
    readonly filterCity = this._filterCity.asReadonly();

    setTypeVenueFilter(id: number | null): void {
        this._filterTypeVenueId.set(id);
        this.loadFeed().subscribe();
    }

    setCityFilter(city: string | null): void {
        this._filterCity.set(city || null);
        this.loadFeed().subscribe();
    }

    loadFilters(): void {
        if (this._typeVenues().length) return; // already loaded
        forkJoin({
            types: this.typeApi.findTypeVenue().pipe(catchError(() => of([]))),
            cities: this.api.findVenueCities().pipe(catchError(() => of([]))),
        }).subscribe(({ types, cities }) => {
            this._typeVenues.set(types);
            this._cities.set(cities);
        });
    }

    /** Load page 1, replacing the current feed. */
    loadFeed(): Observable<unknown> {
        this._feedLoading.set(true);
        this._page.set(1);
        return this.api.findVenue(this._activeFilters(), 1).pipe(
            tap(({ results, hasMore }) => {
                this._feed.set(results);
                this._hasMore.set(hasMore);
                this._feedLoading.set(false);
            }),
            catchError(() => {
                this._feedLoading.set(false);
                return of(null);
            })
        );
    }

    /** Append the next page to the feed. Call from IonInfiniteScroll. */
    loadMore(): Observable<unknown> {
        if (!this._hasMore() || this._feedLoading()) return of(null);
        this._feedLoading.set(true);
        const next = this._page() + 1;
        return this.api.findVenue(this._activeFilters(), next).pipe(
            tap(({ results, hasMore }) => {
                this._feed.update(prev => [...prev, ...results]);
                this._page.set(next);
                this._hasMore.set(hasMore);
                this._feedLoading.set(false);
            }),
            catchError(() => {
                this._feedLoading.set(false);
                return of(null);
            })
        );
    }

    search(term: string): void {
        const value = (term ?? '').trim();
        this._query.set(value);
        if (!value) { this._results.set([]); return; }
        this._loading.set(true);
        this.api.findVenueBySearch(value).subscribe({
            next: results => { this._results.set(results); this._loading.set(false); },
            error: () => { this._results.set([]); this._loading.set(false); },
        });
    }

    private _activeFilters(): VenueFeedFilter | undefined {
        const typeId = this._filterTypeVenueId();
        const city = this._filterCity();
        if (typeId == null && !city) return undefined;
        const f: VenueFeedFilter = {};
        if (typeId != null) f.typeVenue = typeId;
        if (city) f.city = city;
        return f;
    }
}
