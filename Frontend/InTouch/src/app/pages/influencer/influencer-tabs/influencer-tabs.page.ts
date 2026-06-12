import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { IonBadge, IonLabel, IonTabButton, IonIcon, IonTabBar, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, calendarOutline, personCircleOutline, chatbubbleEllipsesOutline, mapOutline } from 'ionicons/icons';
import { Subscription, interval } from 'rxjs';
import { MessagingStore } from 'src/app/features/messaging/messaging.store';

// NOTE: do NOT put OnPush on this tab shell. It hosts <ion-tabs> (a router
// outlet); an undirty OnPush parent makes a CD tick skip its whole subtree, so
// child tab pages that update via a plain subscribe never repaint. The shell
// must stay Default.
@Component({
  selector: 'app-influencer-tabs',
  templateUrl: './influencer-tabs.page.html',
  styleUrls: ['./influencer-tabs.page.scss'],
  standalone: true,
  imports: [IonTabButton, IonLabel, IonIcon, IonBadge, IonTabBar, IonTabs]
})
export class InfluencerTabsPage implements OnInit, OnDestroy {

  protected store = inject(MessagingStore);
  private poll?: Subscription;

  constructor() {
    addIcons({ searchOutline, calendarOutline, personCircleOutline, chatbubbleEllipsesOutline, mapOutline });
  }

  ngOnInit() {
    this.store.refreshUnread();
    this.poll = interval(15000).subscribe(() => this.store.refreshUnread());
  }

  ngOnDestroy() {
    this.poll?.unsubscribe();
  }
}
