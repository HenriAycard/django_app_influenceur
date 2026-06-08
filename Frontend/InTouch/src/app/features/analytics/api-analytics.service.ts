import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as Constant from 'src/app/config/constant';
import { ApiService } from 'src/app/services/api/api.service';
import { VenueAnalytics, InfluencerAnalytics } from './analytics.models';

@Injectable({ providedIn: 'root' })
export class ApiAnalyticsService extends ApiService {

    private readonly base = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix;

    getVenueAnalytics(venueId: number): Observable<VenueAnalytics> {
        return this.http.get<VenueAnalytics>(`${this.base}/venue/${venueId}/analytics`, this.options);
    }

    getInfluencerAnalytics(): Observable<InfluencerAnalytics> {
        return this.http.get<InfluencerAnalytics>(`${this.base}/influencer/analytics`, this.options);
    }

    /** Fire-and-forget: records an influencer's visit of a venue page. */
    logVenueView(venueId: number): Observable<void> {
        return this.http.post<void>(`${this.base}/venue/${venueId}/view`, {}, this.options);
    }
}
