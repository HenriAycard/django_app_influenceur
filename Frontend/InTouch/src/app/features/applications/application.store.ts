import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, forkJoin, tap } from 'rxjs';
import {
    Application,
    ApplicationView,
    ApplicationStatus,
} from 'src/app/shared/models';
import { ApiApplicationService } from './api-application.service';

/** Applications grouped under a single calendar day (brand "coming soon" view). */
export interface DayGroup {
    date: Date;
    valeur: Application[];
}

/**
 * Single source of truth for application data and lifecycle actions.
 *
 * Replaces the duplicated 4-array fetch boilerplate that previously lived in both
 * calendar pages, along with the `ReloadService` + `setTimeout` refresh hacks.
 * The per-status queries are unchanged from before — only their ownership moved here.
 */
@Injectable({ providedIn: 'root' })
export class ApplicationStore {
    private readonly api = inject(ApiApplicationService);

    // ---- Influencer calendar groups ----
    private readonly _iWaiting = signal<ApplicationView[]>([]);
    private readonly _iPast = signal<ApplicationView[]>([]);
    private readonly _iDeclined = signal<ApplicationView[]>([]);
    private readonly _iComingSoon = signal<ApplicationView[]>([]);

    readonly iWaiting = this._iWaiting.asReadonly();
    readonly iPast = this._iPast.asReadonly();
    readonly iDeclined = this._iDeclined.asReadonly();
    readonly iComingSoon = this._iComingSoon.asReadonly();
    readonly iWaitingCount = computed(() => this._iWaiting().length);
    readonly iPastCount = computed(() => this._iPast().length);
    readonly iDeclinedCount = computed(() => this._iDeclined().length);
    readonly iComingSoonCount = computed(() => this._iComingSoon().length);

    // ---- Brand calendar groups ----
    private readonly _bWaiting = signal<Application[]>([]);
    private readonly _bPast = signal<Application[]>([]);
    private readonly _bDeclined = signal<Application[]>([]);
    private readonly _bComingSoon = signal<Application[]>([]);

    readonly bWaiting = this._bWaiting.asReadonly();
    readonly bPast = this._bPast.asReadonly();
    readonly bDeclined = this._bDeclined.asReadonly();
    readonly bWaitingCount = computed(() => this._bWaiting().length);
    readonly bPastCount = computed(() => this._bPast().length);
    readonly bDeclinedCount = computed(() => this._bDeclined().length);
    readonly bComingSoonByDate = computed<DayGroup[]>(() => groupByDay(this._bComingSoon()));
    readonly bComingSoonCount = computed(() => this.bComingSoonByDate().length);

    /** Loads every influencer calendar group. Completes once all queries resolve. */
    loadInfluencerCalendar(): Observable<unknown> {
        const today = new Date();
        return forkJoin([
            this.api.findApplications4Influencer(ApplicationStatus.Pending, today, 'from_date').pipe(tap(r => this._iWaiting.set(r))),
            this.api.findApplications4Influencer(ApplicationStatus.Accepted, today, 'to_date').pipe(tap(r => this._iPast.set(r))),
            this.api.findApplications4Influencer(ApplicationStatus.Declined, today).pipe(tap(r => this._iDeclined.set(r))),
            this.api.findApplications4Influencer(ApplicationStatus.Accepted, today, 'from_date').pipe(tap(r => this._iComingSoon.set(r))),
        ]);
    }

    /** Loads every brand calendar group. Completes once all queries resolve. */
    loadBrandCalendar(): Observable<unknown> {
        const today = new Date();
        return forkJoin([
            this.api.findApplications4Brand(ApplicationStatus.Pending, today, 'from_date').pipe(tap(r => this._bWaiting.set(r))),
            this.api.findApplications4Brand(ApplicationStatus.Accepted, today, 'to_date').pipe(tap(r => this._bPast.set(r))),
            this.api.findApplications4Brand(ApplicationStatus.Declined, today).pipe(tap(r => this._bDeclined.set(r))),
            this.api.findApplications4Brand(ApplicationStatus.Accepted, today, 'from_date').pipe(tap(r => this._bComingSoon.set(r))),
        ]);
    }

    findOne(id: number): Observable<Application> {
        return this.api.findApplication(id);
    }

    accept(id: number): Observable<unknown> {
        return this.api.updateApplication(id, { status: ApplicationStatus.Accepted });
    }

    decline(id: number): Observable<unknown> {
        return this.api.updateApplication(id, { status: ApplicationStatus.Declined });
    }

    updateDate(id: number, date: Date): Observable<unknown> {
        return this.api.updateApplication(id, { dateReservation: date });
    }
}

function groupByDay(items: Application[]): DayGroup[] {
    const days = new Set(items.map(item => item.dateReservation.toDateString()));
    return Array.from(days).map(day => ({
        date: new Date(day),
        valeur: items.filter(item => item.dateReservation.toDateString() === day),
    }));
}
