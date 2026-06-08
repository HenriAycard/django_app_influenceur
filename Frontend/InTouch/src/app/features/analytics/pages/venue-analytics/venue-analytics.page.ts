import { ChangeDetectionStrategy, Component, Input, OnInit, inject, signal } from '@angular/core';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonSpinner, IonTitle, IonToolbar, RefresherCustomEvent, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { ApiAnalyticsService } from 'src/app/features/analytics/api-analytics.service';
import { VenueAnalytics } from 'src/app/features/analytics/analytics.models';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-venue-analytics',
    templateUrl: './venue-analytics.page.html',
    styleUrls: ['../../ui/analytics.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonSpinner, IonRefresher, IonRefresherContent]
})
export class VenueAnalyticsPage implements OnInit {
    @Input() venueId!: number;

    readonly stats = signal<VenueAnalytics | null>(null);
    readonly loading = signal(true);

    private api = inject(ApiAnalyticsService);

    ngOnInit(): void {
        this.load();
    }

    public handleRefresh($event: RefresherCustomEvent): void {
        this.load(() => $event.target.complete());
    }

    private load(onDone?: () => void): void {
        this.loading.set(true);
        this.api.getVenueAnalytics(this.venueId).subscribe({
            next: s => { this.stats.set(s); this.loading.set(false); onDone?.(); },
            error: () => { this.loading.set(false); onDone?.(); },
        });
    }
}
