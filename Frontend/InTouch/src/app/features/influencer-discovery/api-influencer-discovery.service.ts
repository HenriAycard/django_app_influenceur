import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as Constant from 'src/app/config/constant';
import { User } from 'src/app/shared/models';
import { ApiService } from 'src/app/services/api/api.service';

@Injectable({ providedIn: 'root' })
export class ApiInfluencerDiscoveryService extends ApiService {

    private readonly urlBase =
        Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix + '/influencer/';

    findInfluencers(search?: string): Observable<User[]> {
        const url = search?.trim()
            ? `${this.urlBase}?search=${encodeURIComponent(search.trim())}`
            : this.urlBase;
        return this.http.get<any>(url, this.options).pipe(
            map(res => Array.isArray(res) ? res : (res.results ?? []))
        );
    }

    findInfluencer(id: string): Observable<User> {
        return this.http.get<User>(`${this.urlBase}${id}`, this.options);
    }
}
