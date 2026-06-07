import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, Input } from "@angular/core";
import { IonThumbnail, IonLabel, NavController, IonItem } from "@ionic/angular/standalone";
import { ApplicationView } from "src/app/shared/models";
import { Location } from '@angular/common';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-calendar-influencer',
    templateUrl: './calendar-influencer.component.html',
    styleUrls: ['../calendar.component.scss'],
    standalone: true,
    imports: [CommonModule, IonLabel, IonThumbnail, IonItem]
})
export class CalendarInfluencerComponent {
    @Input() collaborations!: ApplicationView[];

    private navCtrl = inject(NavController)
    private location = inject(Location)

    public displayInfo(info: ApplicationView) {
        this.location.replaceState('/influencer/calendar')
        this.navCtrl.navigateForward(['/influencer/collaboration/', info.id])
    }
}