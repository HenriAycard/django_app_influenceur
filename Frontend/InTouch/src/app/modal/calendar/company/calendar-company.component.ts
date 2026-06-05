import { CommonModule } from "@angular/common";
import { Component, inject, Input } from "@angular/core";
import { IonThumbnail, IonLabel, NavController, IonItem } from "@ionic/angular/standalone";
import { BookingBrand } from "src/app/models/booking";
import { Location } from '@angular/common';

@Component({
    selector: 'app-calendar-company',
    templateUrl: './calendar-company.component.html',
    styleUrls: ['../calendar.component.scss'],
    standalone: true,
    imports: [CommonModule, IonLabel, IonThumbnail, IonItem]
})
export class CalendarCompanyComponent {
    @Input() collaborations!: BookingBrand[];

    private navCtrl = inject(NavController)
    private location = inject(Location)

    public displayInfo(info: BookingBrand) {
        this.location.replaceState('/brand/calendar')
        this.navCtrl.navigateForward(['/brand/booking/', info.id])
      }
}