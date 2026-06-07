import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonListHeader, IonRefresher, IonRefresherContent, IonText, IonTitle, IonToolbar, RefresherCustomEvent } from '@ionic/angular/standalone';
import { Router, ActivatedRoute, NavigationExtras, RouterModule } from '@angular/router';
import { VenueSortDto, ImgVenueDto } from 'src/app/shared/models';
import { ApiVenueService } from 'src/app/services/api/api-venue.service';
import { addCircleOutline, flash } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, FormsModule, IonCard, IonCardContent, IonChip, IonCardTitle, IonCardSubtitle, IonCardHeader, IonIcon, IonButton, IonLabel, IonRefresher, IonRefresherContent, RouterModule, SlicePipe]
})
export class HomePage {

  readonly lstVenues = signal<VenueSortDto[]>([])

  private apiVenue = inject(ApiVenueService);

  constructor(
    public router:Router,
    public activatedRoute: ActivatedRoute) {
      addIcons({addCircleOutline, flash});
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
