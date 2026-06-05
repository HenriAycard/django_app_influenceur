import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import * as Constant from '../../config/constant';
import { Observable } from "rxjs";
import { OpeningDate } from "src/app/models/opening-date";
import { ApiService } from "./api.service";

@Injectable({
    providedIn: 'root'
  })
  export class ApiOpeningService extends ApiService {
    
    urlBase: string = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix + "/opening/";

    public create(opening: OpeningDate) : Observable<OpeningDate>{
        var bodyJson: string = JSON.stringify(opening)
        return this.http.post<OpeningDate>(this.urlBase, bodyJson,this.options);
    }

    public update(id: number, opening: Partial<OpeningDate>) : Observable<OpeningDate> {
      const url = `${this.urlBase}${id}`;
      return this.http.patch<OpeningDate>(url, opening, this.options)
    }

}