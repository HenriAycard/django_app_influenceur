import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Constant from '../../config/constant';
import { Observable } from 'rxjs/internal/Observable';
import { Deal } from 'src/app/models/deal';

@Injectable({
  providedIn: 'root'
})
export class ApiDealService {

  readonly options = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    })
  };

  constructor(public http: HttpClient) { }
  
  urlBase: string = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix + "/offer/";

  public findDealById(id: number): Observable<Deal[]> {
    const url = this.urlBase + "?company=" + id.toString()
    return this.http.get<Deal[]>(url, this.options)
  }
  
}