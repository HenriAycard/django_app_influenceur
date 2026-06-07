import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import * as Constant from '../../config/constant';
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { typeVenueDto } from "src/app/shared/models";
import { ApiService } from "./api.service";

@Injectable({
    providedIn: 'root'
  })
  export class ApiVenueTypeService extends ApiService {

    urlBase: string = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix + "/typeVenue/";

    public findTypeVenue() : Observable<typeVenueDto[]> {
        return this.http.get<any>(this.urlBase, this.options).pipe(
            map(response => response.results ?? response)
        );
    }
}