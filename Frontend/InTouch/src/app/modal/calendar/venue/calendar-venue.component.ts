import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, Input } from "@angular/core";
import { IonThumbnail, IonLabel, NavController, IonItem } from "@ionic/angular/standalone";
import { Application } from "src/app/shared/models";
import { Location } from '@angular/common';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-calendar-venue',
    templateUrl: './calendar-venue.component.html',
    styleUrls: ['../calendar.component.scss'],
    standalone: true,
    imports: [CommonModule, IonLabel, IonThumbnail, IonItem]
})
export class CalendarVenueComponent {
    @Input() collaborations!: Application[];

    private navCtrl = inject(NavController)
    private location = inject(Location)

    public displayInfo(info: Application) {
        this.location.replaceState('/brand/calendar')
        this.navCtrl.navigateForward(['/brand/booking/', info.id])
      }
}