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

@Injectable({
    providedIn: 'root'
})
export class ApiApplicationService extends ApiService {

    urlBase: string = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix + "/reservation/";

    public findApplication(id: number): Observable<Application> {
        return this.http.get<any>(`${this.urlBase}${id}`, this.options)
            .pipe(map(dto => this.toApplication(dto)));
    }

    public findApplications4Influencer(status: ApplicationStatus, date?: Date, conditionalDate?: string): Observable<ApplicationView[]> {
        return this.http.get<any[]>(this.buildListUrl(status, date, conditionalDate), this.options)
            .pipe(map(list => list.map(dto => this.toApplication(dto))));
    }

    public findApplications4Brand(status: ApplicationStatus, date?: Date, conditionalDate?: string): Observable<Application[]> {
        return this.http.get<any[]>(this.buildListUrl(status, date, conditionalDate), this.options)
            .pipe(map(list => list.map(dto => this.toApplication(dto))));
    }

    public createApplication(application: CreateApplicationDto): Observable<any> {
        var bodyJson: string = JSON.stringify(application)
        return this.http.post(this.urlBase, bodyJson, this.options)
    }

    public updateApplication(id: number, changes: Partial<Application>): Observable<any> {
        const body: any = { ...changes };
        if (changes.status !== undefined) {
            body.status = toApiStatus(changes.status);
        }
        return this.http.patch(`${this.urlBase}${id}`, JSON.stringify(body), this.options)
    }

    private buildListUrl(status: ApplicationStatus, date?: Date, conditionalDate?: string): string {
        let url = `${this.urlBase}?status=${toApiStatus(status)}`;
        if (date && conditionalDate) {
            const formattedDate = date.toISOString().split('T')[0]; // "YYYY-MM-DD"
            url += `&${conditionalDate}=${formattedDate}`;
        }
        return url;
    }

    /** Converts the backend's integer status into the typed enum at the boundary. */
    private toApplication(dto: any): any {
        return { ...dto, status: fromApiStatus(dto.status) };
    }

}
