import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonRefresher, IonRefresherContent, RefresherCustomEvent } from '@ionic/angular/standalone';
import { Router, ActivatedRoute, NavigationExtras, RouterModule } from '@angular/router';
import { VenueSortDto, ImgVenueDto } from 'src/app/shared/models';
import { ApiVenueService } from 'src/app/services/api/api-venue.service';
import { add, addCircleOutline, flash } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { RatingBadgeComponent } from 'src/app/features/reviews/ui/rating-badge/rating-badge.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, FormsModule, IonIcon, IonRefresher, IonRefresherContent, RouterModule, SlicePipe, RatingBadgeComponent]
})
export class HomePage {

  readonly lstVenues = signal<VenueSortDto[]>([])

  private apiVenue = inject(ApiVenueService);

  constructor(
    public router:Router,
    public activatedRoute: ActivatedRoute) {
      addIcons({add, addCircleOutline, flash});
  }

  // Load on every entry (not ngOnInit): like the sibling brand pages, this
  // refreshes the list on return and avoids the empty-on-first-paint the tab
  // creation timing caused with ngOnInit.
  ionViewWillEnter(): void {
    this.callApiService()
  }

  public handleRefresh($event: RefresherCustomEvent): void {
    setTimeout(() => {
        this.callApiService()
        $event.target.complete();  
      }, 2000);
  }

  public callApiService(): void {
    //Get info 
    this.apiVenue.findVenue().subscribe({
      next: (data: VenueSortDto[]) => {
        this.lstVenues.set(data)
      }
    });
  }

  getPrincipalImage(venue: VenueSortDto): string | null {
    if (!venue?.imgVenue?.length) {
      return null; // No images
    }
  
    const principalImage = venue.imgVenue.find((img: ImgVenueDto) => img.isPrincipal);
    return principalImage?.file || null; // Return file or null if not found
  }

}
