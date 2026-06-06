import { Injectable, computed, inject, signal } from '@angular/core';
import { CompanySortDto } from 'src/app/models/company';
import { ApiCompanyService } from 'src/app/services/api/api-company.service';

/**
 * Backs influencer discovery (venue search). Holds the current query and results
 * as signals so the view stays in sync without manual subscription bookkeeping.
 */
@Injectable({ providedIn: 'root' })
export class DiscoveryStore {
    private readonly api = inject(ApiCompanyService);

    private readonly _query = signal('');
    private readonly _results = signal<CompanySortDto[]>([]);
    private readonly _loading = signal(false);

    readonly query = this._query.asReadonly();
    readonly results = this._results.asReadonly();
    readonly loading = this._loading.asReadonly();
    /** True only once a non-empty search has returned no matches. */
    readonly noResults = computed(() => !this._loading() && !!this._query() && this._results().length === 0);

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
