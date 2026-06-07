import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import * as Constant from 'src/app/config/constant';
import { CreateReviewDto, Review } from 'src/app/shared/models';
import { ApiService } from 'src/app/services/api/api.service';

@Injectable({ providedIn: 'root' })
export class ApiReviewService extends ApiService {

    urlBase: string = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix + '/review/';

    /** Reviews left by influencers about a venue. */
    public findForVenue(venueId: number): Observable<Review[]> {
        return this.http.get<{ results?: Review[] } | Review[]>(`${this.urlBase}?venue=${venueId}`, this.options)
            .pipe(map(r => Array.isArray(r) ? r : (r.results ?? [])));
    }

    /** Reviews left by brands about an influencer. */
    public findForInfluencer(userId: string): Observable<Review[]> {
        return this.http.get<{ results?: Review[] } | Review[]>(`${this.urlBase}?influencer=${userId}`, this.options)
            .pipe(map(r => Array.isArray(r) ? r : (r.results ?? [])));
    }

    public create(review: CreateReviewDto): Observable<Review> {
        return this.http.post<Review>(this.urlBase, JSON.stringify(review), this.options);
    }
}
