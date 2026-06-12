import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  IonContent, IonIcon, IonModal, IonRefresher, IonRefresherContent, IonSearchbar,
  IonInfiniteScroll, IonInfiniteScrollContent, InfiniteScrollCustomEvent, RefresherCustomEvent
} from '@ionic/angular/standalone';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DiscoveryStore } from 'src/app/features/discovery/discovery.store';
import { checkmark, chevronDown, earthOutline, flash, location } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { VenueCardComponent } from 'src/app/features/discovery/ui/venue-card/venue-card.component';

/** Emoji per venue type name (lowercase). Unknown types fall back to 📍. */
const TYPE_EMOJI: Record<string, string> = {
  'hotel': '🏨',
  'restaurant': '🍽️',
  'clothing store': '👗',
  'sports studio': '🤸',
  'coffee shop': '☕',
  'spa': '💆',
  'retail store': '🛍️',
  'consulting firm': '💼',
  'software development': '💻',
  'tech startup': '🚀',
  'fitness center': '🏋️',
  'art gallery': '🖼️',
  'travel agency': '✈️',
  'car dealership': '🚗',
  'barbershop': '💈',
  'bakery': '🥐',
  'gym': '💪',
  'supermarket': '🛒',
  'real estate agency': '🏠',
  'event planning': '🎉',
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home-influencer',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonSearchbar, IonIcon, IonModal, IonRefresher, IonRefresherContent,
    IonInfiniteScroll, IonInfiniteScrollContent, VenueCardComponent
  ]
})
export class HomeInfluencerPage {

  protected readonly store = inject(DiscoveryStore);

  public firstname = '';

  /** City picker sheet state. */
  protected readonly cityModalOpen = signal(false);
  protected readonly citySearch = signal('');
  protected readonly filteredCities = computed(() => {
    const term = this.citySearch().trim().toLowerCase();
    const cities = this.store.cities();
    return term ? cities.filter(c => c.toLowerCase().includes(term)) : cities;
  });

  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    addIcons({ flash, location, chevronDown, checkmark, earthOutline });
    if (this.authService.user) {
      this.firstname = this.authService.user.firstname;
    }
  }

  ionViewWillEnter(): void {
    this.store.loadFilters();
    this.store.loadFeed().subscribe();
  }

  handleRefresh(event: RefresherCustomEvent): void {
    this.store.loadFeed().subscribe({
      complete: () => event.target.complete(),
    });
  }

  onIonInfinite(event: InfiniteScrollCustomEvent): void {
    this.store.loadMore().subscribe({
      complete: () => event.target.complete(),
    });
  }

  search(event: KeyboardEvent, val: string | null | undefined): void {
    if (event.key === 'Enter' && typeof val === 'string') {
      this.navigate(val);
    }
  }

  navigate(val: string): void {
    const extras: NavigationExtras = {
      queryParams: { search: val },
      relativeTo: this.activatedRoute,
    };
    this.router.navigate(['search'], extras);
  }

  openVenue(id: number): void {
    this.router.navigate(['search', 'venue', id], { relativeTo: this.activatedRoute });
  }

  onTypeVenueChange(id: number | null): void {
    this.store.setTypeVenueFilter(id);
  }

  typeEmoji(name: string | undefined): string {
    return TYPE_EMOJI[(name ?? '').toLowerCase()] ?? '📍';
  }

  onCitySearch(event: CustomEvent): void {
    this.citySearch.set((event.detail as { value?: string }).value ?? '');
  }

  selectCity(city: string | null): void {
    this.store.setCityFilter(city);
    this.cityModalOpen.set(false);
    this.citySearch.set('');
  }
}
