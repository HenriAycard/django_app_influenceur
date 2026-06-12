import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonContent, IonIcon, IonSearchbar } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { chevronBack, searchOutline } from 'ionicons/icons';
import { DiscoveryStore } from 'src/app/features/discovery/discovery.store';
import { VenueCardComponent } from 'src/app/features/discovery/ui/venue-card/venue-card.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonSearchbar, VenueCardComponent]
})
export class SearchPage {

  protected readonly store = inject(DiscoveryStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor() {
    addIcons({ chevronBack, searchOutline });
    // Read the search term reactively from the route. Unlike getCurrentNavigation()
    // (which is null on a direct navigation / refresh / deep link), queryParamMap
    // always emits, so the search works however the page is reached.
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      this.store.search(params.get('search') ?? '');
    });
  }

  goBack(): void {
    this.router.navigate(['/influencer/home']);
  }

  // Re-searching updates the URL so refresh/back keep the latest term.
  onSearch(event: KeyboardEvent, val: string | null | undefined): void {
    if (event.key === 'Enter' && typeof val === 'string' && val.trim()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { search: val },
      });
    }
  }

  navToVenue(id: number): void {
    this.router.navigate(['venue', id], { relativeTo: this.route });
  }
}
