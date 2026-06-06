import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import * as Constant from '../../config/constant';
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { typeCompanyDto } from "src/app/models/company";
import { ApiService } from "./api.service";

@Injectable({
    providedIn: 'root'
  })
  export class ApiCompanyTypeService extends ApiService {

    urlBase: string = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix + "/typeCompany/";

    public findTypeCompany() : Observable<typeCompanyDto[]> {
        return this.http.get<any>(this.urlBase, this.options).pipe(
            map(response => response.results ?? response)
        );
    }
}