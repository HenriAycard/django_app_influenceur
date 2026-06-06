import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import * as Constant from 'src/app/config/constant';
import { Offer } from 'src/app/shared/models';
import { ApiService } from 'src/app/services/api/api.service';

@Injectable({
  providedIn: 'root'
})
export class ApiOfferService extends ApiService {

  urlBase: string = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix + "/offer/";

  public findOffersByCompanyId(id: number): Observable<Offer[]> {
    const url = this.urlBase + "?company=" + id.toString()
    return this.http.get<any>(url, this.options).pipe(
      map(response => response.results || response)
    )
  }

  public createOffer(offer: Partial<Offer>): Observable<any> {
    var bodyJson: string = JSON.stringify(offer)
    return this.http.post<any>(this.urlBase, bodyJson, this.options);
  }

  public deleteOffer(id: number): Observable<any> {
    return this.http.delete(this.urlBase + id, this.options)
  }

  public findOfferById(id: number): Observable<Offer> {
    const url = this.urlBase + id.toString()
    return this.http.get<Offer>(url, this.options)
  }

  public updateOffer(id: number, offer: Partial<Offer>): Observable<any> {
    var bodyJson: string = JSON.stringify(offer)
    const url = this.urlBase + id.toString()
    return this.http.patch<any>(url, bodyJson, this.options);
  }

}
