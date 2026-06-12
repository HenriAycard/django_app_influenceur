import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { IonBadge, IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, calendarOutline, personCircleOutline, chatbubbleEllipsesOutline, peopleOutline } from 'ionicons/icons';
import { Subscription, interval } from 'rxjs';
import { MessagingStore } from 'src/app/features/messaging/messaging.store';

// NOTE: do NOT put OnPush on this tab shell. It hosts <ion-tabs> (a router
// outlet); an undirty OnPush parent makes a CD tick skip its whole subtree, so
// child tab pages that update via a plain subscribe (e.g. brand home) never
// repaint. Signal-driven children would be fine, but the shell must stay Default.
@Component({
  selector: 'app-brand-tabs',
  templateUrl: './brand-tabs.page.html',
  styleUrls: ['./brand-tabs.page.scss'],
  standalone: true,
  imports: [IonTabButton, IonLabel, IonIcon, IonBadge, IonTabBar, IonTabs]
})
export class BrandTabsPage implements OnInit, OnDestroy {

  protected store = inject(MessagingStore);
  private poll?: Subscription;

  constructor() {
    addIcons({ searchOutline, calendarOutline, personCircleOutline, chatbubbleEllipsesOutline, peopleOutline });
  }

  ngOnInit() {
    this.store.refreshUnread();
    this.poll = interval(15000).subscribe(() => this.store.refreshUnread());
  }

  ngOnDestroy() {
    this.poll?.unsubscribe();
  }
}
