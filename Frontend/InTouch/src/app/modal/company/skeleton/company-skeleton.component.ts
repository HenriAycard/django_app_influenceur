
import { Component } from "@angular/core";
import { IonItem, IonLabel, IonList, IonListHeader, IonSkeletonText, IonThumbnail } from "@ionic/angular/standalone";

@Component({
    selector: 'app-company-skeleton',
    templateUrl: './company-skeleton.component.html',
    standalone: true,
    imports: [IonSkeletonText, IonLabel, IonThumbnail, IonItem, IonList, IonListHeader]
})
export class CompanySkeletonComponent {}