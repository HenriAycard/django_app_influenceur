import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import * as Constant from 'src/app/config/constant';
import {
    Application,
    ApplicationView,
    CreateApplicationDto,
    ApplicationStatus,
    fromApiStatus,
    toApiStatus,
} from 'src/app/shared/models';
import { ApiService } from 'src/app/services/api/api.service';

type ApplicationDto = Omit<Application, 'status' | 'dateReservation'> & {
    status: number;
    dateReservation: string | null;
};

@Injectable({
    providedIn: 'root'
})
export class ApiApplicationService extends ApiService {

    urlBase: string = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix + "/reservation/";

    public findApplication(id: number): Observable<Application> {
        return this.http.get<ApplicationDto>(`${this.urlBase}${id}`, this.options)
            .pipe(map(dto => this.toApplication(dto)));
    }

    public findApplications4Influencer(status: ApplicationStatus, date?: Date, conditionalDate?: string): Observable<ApplicationView[]> {
        return this.http.get<{ results?: ApplicationDto[] } | ApplicationDto[]>(this.buildListUrl(status, date, conditionalDate), this.options)
            .pipe(map(response => {
                const list = Array.isArray(response) ? response : (response.results ?? []);
                return list.map(dto => this.toApplication(dto));
            }));
    }

    public findApplications4Brand(status: ApplicationStatus, date?: Date, conditionalDate?: string): Observable<Application[]> {
        return this.http.get<{ results?: ApplicationDto[] } | ApplicationDto[]>(this.buildListUrl(status, date, conditionalDate), this.options)
            .pipe(map(response => {
                const list = Array.isArray(response) ? response : (response.results ?? []);
                return list.map(dto => this.toApplication(dto));
            }));
    }

    /** The signed collaboration agreement as a PDF blob (parties only). */
    public downloadContract(id: number): Observable<Blob> {
        return this.http.get(`${this.urlBase}${id}/contract.pdf`, { responseType: 'blob' });
    }

    /** A standard .ics calendar file for an accepted reservation (parties only). */
    public downloadCalendar(id: number): Observable<Blob> {
        return this.http.get(`${this.urlBase}${id}/calendar.ics`, { responseType: 'blob' });
    }

    /** Influencer: share the URL of the content published for this collaboration. */
    public submitPostLink(id: number, url: string): Observable<Application> {
        return this.http.post<ApplicationDto>(`${this.urlBase}${id}/post-link`, JSON.stringify({ url }), this.options)
            .pipe(map(dto => this.toApplication(dto)));
    }

    /** Venue owner: confirm the collaboration went through. */
    public complete(id: number): Observable<Application> {
        return this.http.post<ApplicationDto>(`${this.urlBase}${id}/complete`, '{}', this.options)
            .pipe(map(dto => this.toApplication(dto)));
    }

    /** Venue owner: report that the influencer never showed up. */
    public reportNoShow(id: number): Observable<Application> {
        return this.http.post<ApplicationDto>(`${this.urlBase}${id}/no-show`, '{}', this.options)
            .pipe(map(dto => this.toApplication(dto)));
    }

    public createApplication(application: CreateApplicationDto): Observable<Application> {
        var bodyJson: string = JSON.stringify(application)
        return this.http.post<Application>(this.urlBase, bodyJson, this.options)
    }

    public sendInvitation(offerId: number, influencerId: string): Observable<Application> {
        const body = JSON.stringify({ offer_id: offerId, influencer_id: influencerId });
        return this.http.post<ApplicationDto>(`${this.urlBase}invite/`, body, this.options)
            .pipe(map(dto => this.toApplication(dto)));
    }

    public updateApplication(id: number, changes: Partial<Application>): Observable<Application> {
        const body: Record<string, unknown> = { ...changes };
        if (changes.status !== undefined) {
            body['status'] = toApiStatus(changes.status);
        }
        return this.http.patch<Application>(`${this.urlBase}${id}`, JSON.stringify(body), this.options)
    }

    private buildListUrl(status: ApplicationStatus, date?: Date, conditionalDate?: string): string {
        let url = `${this.urlBase}?status=${toApiStatus(status)}`;
        if (date && conditionalDate) {
            const formattedDate = date.toISOString().split('T')[0]; // "YYYY-MM-DD"
            url += `&${conditionalDate}=${formattedDate}`;
        }
        return url;
    }

    /**
     * Normalizes a backend DTO at the boundary: maps the integer status into the
     * typed enum and parses the ISO `dateReservation` string into a real Date
     * (the calendar groups by `dateReservation.toDateString()` and compares it
     * against `new Date()`, so it must be a Date, not a string).
     */
    private toApplication(dto: ApplicationDto): Application {
        return {
            ...dto,
            status: fromApiStatus(dto.status),
            dateReservation: dto.dateReservation ? new Date(dto.dateReservation) : null as unknown as Date,
        };
    }

}
