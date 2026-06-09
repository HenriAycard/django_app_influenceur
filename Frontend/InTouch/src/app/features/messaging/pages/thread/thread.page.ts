import { ChangeDetectionStrategy, Component, Input, ViewChild, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { paperPlaneOutline } from 'ionicons/icons';
import { Subscription, interval } from 'rxjs';
import { MessagingStore } from 'src/app/features/messaging/messaging.store';
import { ChatMessage } from 'src/app/features/messaging/messaging.models';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-thread',
    templateUrl: './thread.page.html',
    styleUrls: ['./thread.page.scss'],
    standalone: true,
    imports: [FormsModule, DatePipe, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonFooter, IonTextarea, IonButton, IonIcon]
})
export class ThreadPage {
    @Input() conversationId!: string;   // route param
    @Input() name?: string;             // query param (other participant's name)

    readonly messages = signal<ChatMessage[]>([]);
    public draft = '';
    public sending = false;

    @ViewChild(IonContent) private content?: IonContent;

    private store = inject(MessagingStore);
    private auth = inject(AuthService);
    private router = inject(Router);
    private poll?: Subscription;

    constructor() {
        addIcons({ paperPlaneOutline });
    }

    get myId(): string { return this.auth.user?.id ?? ''; }

    /** Fallback for the back button when there is no nav history (e.g. opened
     *  from another tab): return to the role's Messages inbox. */
    get backHref(): string {
        return this.router.url.split('/').slice(0, 2).join('/') + '/messages';
    }
    private get id(): number { return Number(this.conversationId); }

    ionViewWillEnter(): void {
        this.load(true);
        this.poll = interval(4000).subscribe(() => this.load(false));
    }

    ionViewWillLeave(): void {
        this.poll?.unsubscribe();
    }

    private load(scroll: boolean): void {
        this.store.messages(this.id).subscribe({
            next: list => {
                const grew = list.length !== this.messages().length;
                this.messages.set(list);
                if (scroll || grew) this.scrollToBottom();
            },
            error: () => {},
        });
    }

    send(): void {
        const body = this.draft.trim();
        if (!body || this.sending) return;
        this.sending = true;
        this.store.send(this.id, body).subscribe({
            next: msg => {
                this.draft = '';
                this.sending = false;
                this.messages.set([...this.messages(), msg]);
                this.scrollToBottom();
            },
            error: () => { this.sending = false; },
        });
    }

    private scrollToBottom(): void {
        setTimeout(() => this.content?.scrollToBottom(200), 50);
    }
}
