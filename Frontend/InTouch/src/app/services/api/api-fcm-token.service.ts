import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import * as Constant from '../../config/constant';
import { Observable } from "rxjs";
import { Address, AddressDto } from "src/app/shared/models";
import { ApiService } from "./api.service";
import { GetTokenResult } from "@capacitor-firebase/messaging";

@Injectable({
  providedIn: 'root'
})
export class ApiFCMTokenService extends ApiService {

  urlBase: string = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix + "/save-fcm-token/";

  sendTokenToBackend(token: string): Observable<any> {
    return this.http.patch(this.urlBase, { token })
  }

}