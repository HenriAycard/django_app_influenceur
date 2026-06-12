import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Constant from '../../config/constant';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { Venue, VenueCreateDto, VenueMapMarker, VenueSortDto, VenueUpdateDto } from 'src/app/shared/models';
import { ApiService } from './api.service';

export interface VenueFeedFilter {
  typeVenue?: number;
  city?: string;
}

export interface VenuePage {
  results: VenueSortDto[];
  hasMore: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiVenueService extends ApiService {

  urlBase: string = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix + "/venue/";

  public findVenueBySearch(search: string): Observable<VenueSortDto[]>{
    const url = this.urlBase + 'search/?search=' + search
    return this.http.get<any>(url, this.options).pipe(
      map(response => response.results || response)
    );
  }

  public findVenueById(id: number) : Observable<Venue>{
    return this.http.get<Venue>(this.urlBase + id.toString(), this.options);
  }

  public findVenue(filters?: VenueFeedFilter, page: number = 1): Observable<VenuePage> {
    let params = new HttpParams().set('page', page);
    if (filters?.typeVenue != null) params = params.set('type_venue', filters.typeVenue);
    if (filters?.city) params = params.set('city', filters.city);
    const options = { ...this.options, params };
    return this.http.get<any>(this.urlBase, options).pipe(
      map(response => ({
        results: Array.isArray(response) ? response : (response.results ?? []),
        hasMore: !!(response.next),
      }))
    );
  }

  public findVenueCities(): Observable<string[]> {
    return this.http.get<string[]>(this.urlBase + 'cities/', this.options);
  }

  public findVenueMapMarkers(): Observable<VenueMapMarker[]> {
    return this.http.get<VenueMapMarker[]>(this.urlBase + 'map/', this.options);
  }

  public create(venue: VenueCreateDto) : Observable<Venue>{
    var bodyJson: string = JSON.stringify(venue)
    return this.http.post<Venue>(this.urlBase, bodyJson,this.options);
  }

  public update(id: number, venue: Partial<VenueUpdateDto>) : Observable<Venue> {
    const url = `${this.urlBase}${id}`;
    return this.http.patch<Venue>(url, venue, this.options);
  }
}
