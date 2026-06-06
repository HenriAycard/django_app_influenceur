import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { CompanySortDto } from 'src/app/models/company';
import { ApiCompanyService } from 'src/app/services/api/api-company.service';

/**
 * Backs influencer discovery: the home venue feed plus free-text venue search.
 * Holds state as signals so the views stay in sync without manual subscriptions.
 */
@Injectable({ providedIn: 'root' })
export class DiscoveryStore {
    private readonly api = inject(ApiCompanyService);

    private readonly _query = signal('');
    private readonly _results = signal<CompanySortDto[]>([]);
    private readonly _loading = signal(false);

    private readonly _feed = signal<CompanySortDto[]>([]);
    private readonly _feedLoading = signal(false);

    readonly query = this._query.asReadonly();
    readonly results = this._results.asReadonly();
    readonly loading = this._loading.asReadonly();
    /** True only once a non-empty search has returned no matches. */
    readonly noResults = computed(() => !this._loading() && !!this._query() && this._results().length === 0);

    readonly feed = this._feed.asReadonly();
    readonly feedLoading = this._feedLoading.asReadonly();
    /** True once the feed has loaded but is empty. */
    readonly feedEmpty = computed(() => !this._feedLoading() && this._feed().length === 0);

    /** Loads the venue feed for the discovery home. Completes when done. */
    loadFeed(): Observable<unknown> {
        this._feedLoading.set(true);
        return this.api.findCompany().pipe(
            tap(venues => {
                this._feed.set(venues);
                this._feedLoading.set(false);
            }),
            catchError(() => {
                this._feedLoading.set(false);
                return of([]);
            })
        );
    }

    /** Searches venues by free text. An empty term simply clears the results. */
    search(term: string): void {
        const value = (term ?? '').trim();
        this._query.set(value);

        if (!value) {
            this._results.set([]);
            return;
        }

        this._loading.set(true);
        this.api.findCompanyBySearch(value).subscribe({
            next: results => {
                this._results.set(results);
                this._loading.set(false);
            },
            error: () => {
                this._results.set([]);
                this._loading.set(false);
            },
        });
    }
}
