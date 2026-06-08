import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { IonChip, IonIcon, IonItem, IonLabel, IonList } from "@ionic/angular/standalone";
import { Venue } from "src/app/shared/models";
import { AppLauncher } from '@capacitor/app-launcher';
import { RatingBadgeComponent } from 'src/app/features/reviews/ui/rating-badge/rating-badge.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-venue-main-view',
    templateUrl: './venue-main-view.component.html',
    styleUrls: ['./venue-main-view.component.scss'],
    standalone: true,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [CommonModule, IonLabel, IonItem, IonChip, IonIcon, IonList, RatingBadgeComponent]
})
export class VenueMainViewPage {
    @Input() venue!: Venue;

    public showFullDescription = false;

    async openMap() {
        const addressParts = [
            this.venue.nameVenue,
            this.venue.address.addressPrincipal,
            this.venue.address.addressSecondary,
            this.venue.address.zipCode,
            this.venue.address.city,
            this.venue.address.state,
            this.venue.address.country
        ];
          
        // Filter out null, undefined, or empty strings and join them with ", "
        const address: string = addressParts
            .filter(part => part && part.trim()) // Remove empty/null parts
            .join(', ');
        
        const encodedAddress = encodeURIComponent(address);
        const canOpen = await AppLauncher.canOpenUrl({ url: 'geo:' });

        if (canOpen.value) {
            // Opens native map app
            await AppLauncher.openUrl({ url: `geo:0,0?q=${encodedAddress}` });
        } else {
            // Fallback to Google Maps in browser
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
        }
    }

    toggleDescription() {
        this.showFullDescription = !this.showFullDescription;
      }
}