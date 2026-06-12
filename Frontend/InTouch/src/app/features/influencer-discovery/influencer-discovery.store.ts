import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { User } from 'src/app/shared/models';
import { ApiInfluencerDiscoveryService } from './api-influencer-discovery.service';

@Injectable({ providedIn: 'root' })
export class InfluencerDiscoveryStore {
    private readonly api = inject(ApiInfluencerDiscoveryService);

    private readonly _influencers = signal<User[]>([]);
    private readonly _loading = signal(false);

    readonly influencers = this._influencers.asReadonly();
    readonly loading = this._loading.asReadonly();

    load(search?: string): Observable<User[]> {
        this._loading.set(true);
        return this.api.findInfluencers(search).pipe(
            tap(list => {
                this._influencers.set(list);
                this._loading.set(false);
            })
        );
    }

    findOne(id: string): Observable<User> {
        return this.api.findInfluencer(id);
    }
}
