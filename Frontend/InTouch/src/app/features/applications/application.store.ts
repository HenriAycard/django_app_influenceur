import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, forkJoin, tap } from 'rxjs';
import {
    Application,
    ApplicationView,
    ApplicationStatus,
} from 'src/app/shared/models';
import { ApiApplicationService } from './api-application.service';

/** Applications grouped under a single calendar day (calendar "coming soon" agenda). */
export interface DayGroup<T = Application> {
    date: Date;
    valeur: T[];
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
    private readonly _iInvited = signal<ApplicationView[]>([]);
    private readonly _iDateProposed = signal<ApplicationView[]>([]);

    readonly iWaiting = this._iWaiting.asReadonly();
    readonly iPast = this._iPast.asReadonly();
    readonly iDeclined = this._iDeclined.asReadonly();
    readonly iComingSoon = this._iComingSoon.asReadonly();
    readonly iInvited = this._iInvited.asReadonly();
    readonly iDateProposed = this._iDateProposed.asReadonly();
    // The influencer's "Invitations" section bundles both pending invitations
    // (status 3) and the ones where they already proposed a date (status 4).
    readonly iInvitationFlow = computed<ApplicationView[]>(() => [...this._iInvited(), ...this._iDateProposed()]);
    readonly iWaitingCount = computed(() => this._iWaiting().length);
    readonly iPastCount = computed(() => this._iPast().length);
    readonly iDeclinedCount = computed(() => this._iDeclined().length);
    readonly iComingSoonCount = computed(() => this._iComingSoon().length);
    readonly iInvitedCount = computed(() => this._iInvited().length);
    readonly iInvitationFlowCount = computed(() => this.iInvitationFlow().length);
    readonly iComingSoonByDate = computed<DayGroup<ApplicationView>[]>(() => groupByDay(this._iComingSoon()));

    // ---- Brand calendar groups ----
    private readonly _bWaiting = signal<Application[]>([]);
    private readonly _bPast = signal<Application[]>([]);
    private readonly _bDeclined = signal<Application[]>([]);
    private readonly _bComingSoon = signal<Application[]>([]);
    private readonly _bInvited = signal<Application[]>([]);
    private readonly _bDateProposed = signal<Application[]>([]);

    readonly bWaiting = this._bWaiting.asReadonly();
    readonly bPast = this._bPast.asReadonly();
    readonly bDeclined = this._bDeclined.asReadonly();
    readonly bInvited = this._bInvited.asReadonly();
    // Invitations the influencer answered with a date — the brand must confirm.
    readonly bDateProposed = this._bDateProposed.asReadonly();
    readonly bWaitingCount = computed(() => this._bWaiting().length);
    readonly bPastCount = computed(() => this._bPast().length);
    readonly bDeclinedCount = computed(() => this._bDeclined().length);
    readonly bInvitedCount = computed(() => this._bInvited().length);
    readonly bDateProposedCount = computed(() => this._bDateProposed().length);
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
            this.api.findApplications4Influencer(ApplicationStatus.Invited).pipe(tap(r => this._iInvited.set(r))),
            this.api.findApplications4Influencer(ApplicationStatus.DateProposed).pipe(tap(r => this._iDateProposed.set(r))),
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
            this.api.findApplications4Brand(ApplicationStatus.Invited).pipe(tap(r => this._bInvited.set(r))),
            this.api.findApplications4Brand(ApplicationStatus.DateProposed).pipe(tap(r => this._bDateProposed.set(r))),
        ]);
    }

    findOne(id: number): Observable<Application> {
        return this.api.findApplication(id);
    }

    /** Collaboration agreement PDF (chantier #8) — accepted collaborations only. */
    downloadContract(id: number): Observable<Blob> {
        return this.api.downloadContract(id);
    }

    /** Standard .ics calendar file — accepted collaborations only. */
    downloadCalendar(id: number): Observable<Blob> {
        return this.api.downloadCalendar(id);
    }

    submitPostLink(id: number, url: string): Observable<Application> {
        return this.api.submitPostLink(id, url);
    }

    complete(id: number): Observable<Application> {
        return this.api.complete(id);
    }

    reportNoShow(id: number): Observable<Application> {
        return this.api.reportNoShow(id);
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

    /** Influencer answers a brand invitation by proposing a date (3 → 4). */
    proposeDate(id: number, date: Date): Observable<unknown> {
        return this.api.updateApplication(id, { status: ApplicationStatus.DateProposed, dateReservation: date });
    }

    /** Venue owner confirms the date the influencer proposed (4 → 1). */
    confirmDate(id: number): Observable<unknown> {
        return this.api.updateApplication(id, { status: ApplicationStatus.Accepted });
    }

    sendInvitation(offerId: number, influencerId: string): Observable<Application> {
        return this.api.sendInvitation(offerId, influencerId);
    }
}

function groupByDay<T extends { dateReservation: Date }>(items: T[]): DayGroup<T>[] {
    const days = new Set(items.map(item => item.dateReservation.toDateString()));
    return Array.from(days).map(day => ({
        date: new Date(day),
        valeur: items.filter(item => item.dateReservation.toDateString() === day),
    }));
}
