import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import * as Constant from '../../config/constant';
import { Observable } from "rxjs";
import { ApiService } from "./api.service";

@Injectable({
    providedIn: 'root'
  })
  export class ApiVenueImgService extends ApiService {
    
    urlBase: string = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix + "/imgVenue/";

    public uploadPhoto(formData: FormData): Observable<any> {
        return this.http.post<any>(
            this.urlBase,
            formData,
            {
                reportProgress: true,
                observe: 'events'
            }
        );

    }

    public update(id: number, formData: FormData) {
        const url = `${this.urlBase}${id}`;
        return this.http.patch(url, formData, { reportProgress: true, observe: 'events'})
    }
}