import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Constant from '../../config/constant';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { Venue, VenueCreateDto, VenueSortDto, VenueUpdateDto } from 'src/app/shared/models';
import { ApiService } from './api.service';

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

  public findVenue() : Observable<VenueSortDto[]> {
    return this.http.get<any>(this.urlBase, this.options).pipe(
      map(response => response.results || response)
    );
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
