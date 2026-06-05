import { CommonModule } from "@angular/common";
import { Component, inject, Input } from "@angular/core";
import { IonThumbnail, IonLabel, NavController, IonItem } from "@ionic/angular/standalone";
import { BookingBrand, BookingStatus } from "src/app/models/booking";
import { Location } from '@angular/common';

@Component({
    selector: 'app-calendar-influencer',
    templateUrl: './calendar-influencer.component.html',
    styleUrls: ['../calendar.component.scss'],
    standalone: true,
    imports: [CommonModule, IonLabel, IonThumbnail, IonItem]
})
export class CalendarInfluencerComponent {
    @Input() collaborations!: BookingStatus[];

    private navCtrl = inject(NavController)
    private location = inject(Location)

    public displayInfo(info: BookingStatus) {
        this.location.replaceState('/influencer/calendar')
        this.navCtrl.navigateForward(['/influencer/collaboration/', info.id])
    }
}