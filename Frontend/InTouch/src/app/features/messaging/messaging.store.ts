import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiMessagingService } from './api-messaging.service';
import { Conversation, ChatMessage } from './messaging.models';

/**
 * Messaging state. Data lives in Postgres (via DRF); this store caches it and
 * exposes a global unread count for the Messages tab badge. Live updates use
 * polling driven by the pages (v1) — no WebSocket.
 */
@Injectable({ providedIn: 'root' })
export class MessagingStore {
    private api = inject(ApiMessagingService);

    private readonly _conversations = signal<Conversation[]>([]);
    readonly conversations = this._conversations.asReadonly();

    private readonly _unread = signal(0);
    readonly unread = this._unread.asReadonly();
    readonly hasUnread = computed(() => this._unread() > 0);

    loadConversations(): Observable<Conversation[]> {
        return this.api.getConversations().pipe(tap(list => this._conversations.set(list)));
    }

    /** Lightweight poll for the tab badge; swallows errors (e.g. logged out). */
    refreshUnread(): void {
        this.api.unreadCount().subscribe({
            next: r => this._unread.set(r.count),
            error: () => {},
        });
    }

    open(venueId: number, influencerId?: string): Observable<Conversation> {
        return this.api.openConversation(venueId, influencerId);
    }

    messages(conversationId: number): Observable<ChatMessage[]> {
        return this.api.getMessages(conversationId);
    }

    send(conversationId: number, body: string): Observable<ChatMessage> {
        return this.api.sendMessage(conversationId, body);
    }
}
