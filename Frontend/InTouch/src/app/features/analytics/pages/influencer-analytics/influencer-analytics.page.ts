import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonSpinner, IonTitle, IonToolbar, RefresherCustomEvent, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { ApiAnalyticsService } from 'src/app/features/analytics/api-analytics.service';
import { InfluencerAnalytics } from 'src/app/features/analytics/analytics.models';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-influencer-analytics',
    templateUrl: './influencer-analytics.page.html',
    styleUrls: ['../../ui/analytics.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonSpinner, IonRefresher, IonRefresherContent]
})
export class InfluencerAnalyticsPage implements OnInit {

    readonly stats = signal<InfluencerAnalytics | null>(null);
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
        this.api.getInfluencerAnalytics().subscribe({
            next: s => { this.stats.set(s); this.loading.set(false); onDone?.(); },
            error: () => { this.loading.set(false); onDone?.(); },
        });
    }
}
