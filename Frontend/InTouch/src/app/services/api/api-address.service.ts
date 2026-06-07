import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import * as Constant from '../../config/constant';
import { Observable } from "rxjs";
import { Address, AddressDto } from "src/app/shared/models";
import { ApiService } from "./api.service";

@Injectable({
  providedIn: 'root'
})
export class ApiAddressService extends ApiService {

  urlBase: string = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix + "/address/";

  create(address: Partial<Address>): Observable<Address> {
    var bodyJson: string = JSON.stringify(address)
    return this.http.post<Address>(this.urlBase, bodyJson, this.options)
  }

  update(id: number, address: Partial<Address>): Observable<Address> {
    const url = `${this.urlBase}${id}`;
    return this.http.patch<Address>(url, address, this.options);
  }
  
}
