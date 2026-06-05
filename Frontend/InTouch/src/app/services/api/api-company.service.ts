import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Constant from '../../config/constant';
import { Observable } from 'rxjs/internal/Observable';
import { Company, CompanyCreateDto, CompanySortDto, CompanyUpdateDto } from 'src/app/models/company';
import { retry } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ApiCompanyService extends ApiService {
  
  urlBase: string = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix + "/company/";

  public findCompanyBySearch(search: string): Observable<CompanySortDto[]>{
    const url = this.urlBase + 'search/?search=' + search
    return this.http.get<CompanySortDto[]>(url, this.options);
  }

  public findCompanyById(id: number) : Observable<Company>{
    return this.http.get<Company>(this.urlBase + id.toString(), this.options);
  }

  public findCompany() : Observable<CompanySortDto[]> {
    return this.http.get<CompanySortDto[]>(this.urlBase, this.options);
  }

  public create(company: CompanyCreateDto) : Observable<Company>{
    var bodyJson: string = JSON.stringify(company)
    return this.http.post<Company>(this.urlBase, bodyJson,this.options).pipe(retry(3));
  }

  public update(id: number, company: Partial<CompanyUpdateDto>) : Observable<Company> {
    const url = `${this.urlBase}${id}`;    
    return this.http.patch<Company>(url, company, this.options).pipe(retry(3));
  }
}
