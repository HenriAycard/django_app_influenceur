import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Constant from '../../config/constant';
import { Observable } from 'rxjs/internal/Observable';
import { BookingBrand, BookingCreateParam } from 'src/app/models/booking';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class ApiBookingService extends ApiService {
  
    urlBase: string = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix + "/reservation/";

    public findBooking(id: number): Observable<BookingBrand> {
        const url = `${this.urlBase}${id}`;
        return this.http.get<BookingBrand>(url, this.options);
    }

    public findBooking4Influencer(status: number, date?: Date, conditionalDate?: string): Observable<BookingBrand[]>{
        let url = `${this.urlBase}?status=${status}`;
        
        if (date && conditionalDate) {
            url += this.getConditionalDateOption(date, conditionalDate)
        }

        return this.http.get<BookingBrand[]>(url, this.options)
    }

    public findBooking4Brand(status: number, date?: Date, conditionalDate?: string): Observable<BookingBrand[]>{
        let url = `${this.urlBase}?status=${status}`;
        
        if (date && conditionalDate) {
            url += this.getConditionalDateOption(date, conditionalDate)
        }
        return this.http.get<BookingBrand[]>(url, this.options)
    }

    private getConditionalDateOption(dateObj: Date, conditionalDate: string) {
        const formattedDate = dateObj.toISOString().split('T')[0]; // Format as "YYYY-MM-DD"
        return `&${conditionalDate}=${formattedDate}`;
    }

    public createBooking(reservation: BookingCreateParam) {
        var bodyJson: string = JSON.stringify(reservation)
        return this.http.post(this.urlBase, bodyJson, this.options)
    }

    public updateBooking(id: number, reservation: Partial<BookingBrand>) {
        const url = `${this.urlBase}${id}`;
        var bodyJson: string = JSON.stringify(reservation)
        return this.http.patch(url, bodyJson, this.options)
    }

}
