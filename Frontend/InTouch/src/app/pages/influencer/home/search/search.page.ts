import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonCardTitle, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonChip, IonCardContent, IonCardSubtitle, IonCardHeader, IonButtons, IonBackButton, IonLabel } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { DiscoveryStore } from 'src/app/features/discovery/discovery.store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardTitle, IonChip, IonCardContent, IonCardSubtitle, IonCardHeader, IonButtons, IonBackButton, IonLabel, SlicePipe]
})
export class SearchPage {

  protected readonly store = inject(DiscoveryStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor() {
    // Read the search term reactively from the route. Unlike getCurrentNavigation()
    // (which is null on a direct navigation / refresh / deep link), queryParamMap
    // always emits, so the search works however the page is reached.
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      this.store.search(params.get('search') ?? '');
    });
  }

  navToVenue(id: number) {
    this.router.navigate(['venue', id], { relativeTo: this.route });
  }
}
