import { CommonModule } from "@angular/common";
import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { IonChip, IonIcon, IonItem, IonLabel, IonList } from "@ionic/angular/standalone";
import { Company } from "src/app/models/company";
import { AppLauncher } from '@capacitor/app-launcher';

@Component({
    selector: 'app-company-main-view',
    templateUrl: './company-main-view.component.html',
    styleUrls: ['./company-main-view.component.scss'],
    standalone: true,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [CommonModule, IonLabel, IonItem, IonChip, IonIcon, IonList]
})
export class CompanyMainViewPage {
    @Input() company!: Company;

    public showFullDescription = false;

    async openMap() {
        const addressParts = [
            this.company.nameCompany,
            this.company.address.addressPrincipal,
            this.company.address.addressSecondary,
            this.company.address.zipCode,
            this.company.address.city,
            this.company.address.state,
            this.company.address.country
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