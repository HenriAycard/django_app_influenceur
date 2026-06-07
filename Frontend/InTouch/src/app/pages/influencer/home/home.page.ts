import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonContent, IonIcon, IonLabel, IonRefresher, IonRefresherContent, IonSearchbar } from '@ionic/angular/standalone';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DiscoveryStore } from 'src/app/features/discovery/discovery.store';
import { flash } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home-influencer',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, IonSearchbar, IonCard, IonCardTitle, IonCardSubtitle, IonCardHeader, IonCardContent, IonLabel, IonChip, IonIcon, IonRefresher, IonRefresherContent, SlicePipe]
})
export class HomeInfluencerPage {

  protected readonly store = inject(DiscoveryStore);

  public firstname = '';
  public readonly categories = [
    { label: 'Sushi',     emoji: '🍣' },
    { label: 'Tacos',     emoji: '🌮' },
    { label: 'Pizza',     emoji: '🍕' },
    { label: 'Seafood',   emoji: '🦞' },
    { label: 'Spa',       emoji: '💆' },
    { label: 'Adventure', emoji: '🏕️' },
    { label: 'Hotel',     emoji: '🏨' },
    { label: 'Event',     emoji: '🎉' },
  ];

  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    addIcons({ flash });
    if (this.authService.user) {
      this.firstname = this.authService.user.firstname;
    }
  }

  // Refresh the venue feed on every entry.
  ionViewWillEnter(): void {
    this.store.loadFeed().subscribe();
  }

  handleRefresh($event: any): void {
    this.store.loadFeed().subscribe({
      complete: () => $event.target.complete(),
    });
  }

  search(event: any, val: string | null | undefined) {
    if (event.key === 'Enter' && typeof val === 'string') {
      this.navigation(val);
    }
  }

  navigation(val: string) {
    const navigationExtras: NavigationExtras = {
      queryParams: { search: val },
      relativeTo: this.activatedRoute,
    };
    this.router.navigate(['search'], navigationExtras);
  }

  openVenue(id: number) {
    this.router.navigate(['search', 'company', id], { relativeTo: this.activatedRoute });
  }
}
