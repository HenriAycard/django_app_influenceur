import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonInfiniteScroll, IonInfiniteScrollContent, IonSearchbar, IonTitle, IonToolbar, NavController, RefresherCustomEvent, IonRefresher, IonRefresherContent, IonSpinner } from '@ionic/angular/standalone';
import { InfluencerDiscoveryStore } from 'src/app/features/influencer-discovery/influencer-discovery.store';
import { InfluencerCardComponent } from 'src/app/features/influencer-discovery/ui/influencer-card/influencer-card.component';
import { User } from 'src/app/shared/models';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-influencers',
    templateUrl: './influencers.page.html',
    styleUrls: ['./influencers.page.scss'],
    standalone: true,
    imports: [FormsModule, IonContent, IonHeader, IonRefresher, IonRefresherContent, IonSearchbar, IonSpinner, IonTitle, IonToolbar, InfluencerCardComponent],
})
export class InfluencersPage {
    protected readonly store = inject(InfluencerDiscoveryStore);
    private readonly navCtrl = inject(NavController);

    protected search = '';

    ionViewWillEnter(): void {
        this.load();
    }

    protected handleRefresh(event: RefresherCustomEvent): void {
        this.load(() => event.target.complete());
    }

    protected onSearch(): void {
        this.load();
    }

    protected openProfile(influencer: User): void {
        this.navCtrl.navigateForward(['/brand/influencers', influencer.id]);
    }

    private load(onDone?: () => void): void {
        this.store.load(this.search).subscribe({ complete: onDone, error: onDone });
    }
}
