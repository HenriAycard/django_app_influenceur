import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { IonAvatar, IonBadge, IonContent, IonHeader, IonItem, IonLabel, IonList, IonRefresher, IonRefresherContent, IonTitle, IonToolbar, NavController, RefresherCustomEvent } from '@ionic/angular/standalone';
import { Subscription, interval } from 'rxjs';
import { MessagingStore } from 'src/app/features/messaging/messaging.store';
import { Conversation } from 'src/app/features/messaging/messaging.models';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-inbox',
    templateUrl: './inbox.page.html',
    styleUrls: ['./inbox.page.scss'],
    standalone: true,
    imports: [DatePipe, IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonAvatar, IonLabel, IonBadge, IonRefresher, IonRefresherContent]
})
export class InboxPage {
    protected store = inject(MessagingStore);
    private navCtrl = inject(NavController);
    private router = inject(Router);
    private poll?: Subscription;

    ionViewWillEnter(): void {
        this.load();
        // Poll while the inbox is visible; stopped on leave.
        this.poll = interval(8000).subscribe(() => this.load());
    }

    ionViewWillLeave(): void {
        this.poll?.unsubscribe();
    }

    private load(): void {
        this.store.loadConversations().subscribe({ error: () => {} });
        this.store.refreshUnread();
    }

    handleRefresh(event: RefresherCustomEvent): void {
        this.store.loadConversations().subscribe({
            complete: () => event.target.complete(),
            error: () => event.target.complete(),
        });
        this.store.refreshUnread();
    }

    openThread(c: Conversation): void {
        const base = this.router.url.split('?')[0]; // '/influencer/messages' or '/brand/messages'
        this.navCtrl.navigateForward([`${base}/${c.id}`], {
            queryParams: { name: c.title },
        });
    }
}
