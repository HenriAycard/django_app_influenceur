import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Constant from '../../config/constant';
import { Observable } from 'rxjs/internal/Observable';
import { Deal } from 'src/app/models/deal';
import { retry } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ApiDealService extends ApiService {

  urlBase: string = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix + "/offer/";

  public findDealByCompanyId(id: number): Observable<Deal[]> {
    const url = this.urlBase + "?company=" + id.toString()
    return this.http.get<Deal[]>(url, this.options)
  }

  public createDeal(deal: Partial<Deal>): Observable<any> {
    var bodyJson: string = JSON.stringify(deal)
    return this.http.post<any>(this.urlBase, bodyJson, this.options).pipe(retry(3));
  }

  public deleteDeal(id: number): Observable<any> {
    return this.http.delete(this.urlBase + id, this.options)
  }

  public findDealById(id: number): Observable<Deal> {
    const url = this.urlBase + id.toString()
    return this.http.get<Deal>(url, this.options)
  }

  public updateDeal(id: number, deal: Partial<Deal>): Observable<any> {
    var bodyJson: string = JSON.stringify(deal)
    const url = this.urlBase + id.toString()
    return this.http.patch<any>(url, bodyJson, this.options).pipe(retry(3));
  }

}