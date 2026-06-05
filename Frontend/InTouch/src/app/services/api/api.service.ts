import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    readonly options = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(public http: HttpClient) { }

}