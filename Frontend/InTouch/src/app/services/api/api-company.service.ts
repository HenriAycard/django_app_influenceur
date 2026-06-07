import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Constant from '../../config/constant';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { Company, CompanyCreateDto, CompanySortDto, CompanyUpdateDto } from 'src/app/shared/models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ApiCompanyService extends ApiService {

  urlBase: string = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix + "/company/";

  public findCompanyBySearch(search: string): Observable<CompanySortDto[]>{
    const url = this.urlBase + 'search/?search=' + search
    return this.http.get<any>(url, this.options).pipe(
      map(response => response.results || response)
    );
  }

  public findCompanyById(id: number) : Observable<Company>{
    return this.http.get<Company>(this.urlBase + id.toString(), this.options);
  }

  public findCompany() : Observable<CompanySortDto[]> {
    return this.http.get<any>(this.urlBase, this.options).pipe(
      map(response => response.results || response)
    );
  }

  public create(company: CompanyCreateDto) : Observable<Company>{
    var bodyJson: string = JSON.stringify(company)
    return this.http.post<Company>(this.urlBase, bodyJson,this.options);
  }

  public update(id: number, company: Partial<CompanyUpdateDto>) : Observable<Company> {
    const url = `${this.urlBase}${id}`;
    return this.http.patch<Company>(url, company, this.options);
  }
}
