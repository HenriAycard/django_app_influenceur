import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Constant from '../../config/constant';
import { Observable } from 'rxjs/internal/Observable';
import { Company, CompanySortDto } from 'src/app/models/company';

@Injectable({
  providedIn: 'root'
})
export class ApiCompanyService {

  readonly options = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    })
  };

  constructor(public http: HttpClient) { }
  
  urlBase: string = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix + "/company/";

  public findCompanyBySearch(search: string): Observable<CompanySortDto[]>{
    const url = this.urlBase + 'search/?search=' + search
    return this.http.get<CompanySortDto[]>(url)
  }

  public findCompanyById(id: number) : Observable<Company>{
    return this.http.get<Company>(this.urlBase + id.toString(), this.options)
  }
}
