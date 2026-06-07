
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { IonItem, IonLabel, IonList, IonListHeader, IonSkeletonText, IonThumbnail } from "@ionic/angular/standalone";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-venue-skeleton',
    templateUrl: './venue-skeleton.component.html',
    standalone: true,
    imports: [IonSkeletonText, IonLabel, IonThumbnail, IonItem, IonList, IonListHeader]
})
export class VenueSkeletonComponent {}