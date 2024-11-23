import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Constant from '../../config/constant';
import { Observable } from 'rxjs/internal/Observable';
import { BookingCreateParam, BookingStatus } from 'src/app/models/booking';
import { retry } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ApiBookingService {

    readonly options = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(public http: HttpClient) { }
  
    urlBase: string = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix + "/reservation/";

    public findBooking(status: number, date: Date): Observable<BookingStatus[]>{
        const url = this.urlBase + '?status=' + status.toString() + this.getConditionalDateOption(date)
        return this.http.get<BookingStatus[]>(url, this.options)
    }

    private getConditionalDateOption(dateObj: Date) {
        return "&from_date=" + dateObj.getFullYear() + '-' + ('0' + (dateObj.getMonth() + 1)).slice(-2) + '-' + ('0' + dateObj.getDate()).slice(-2);
    }

    public createBooking(reservation: BookingCreateParam) {
        var bodyJson: string = JSON.stringify(reservation)
        return this.http.post(this.urlBase, bodyJson, this.options).pipe(retry(3))
    }


}
