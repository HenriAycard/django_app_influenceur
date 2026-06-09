import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as Constant from 'src/app/config/constant';
import { ApiService } from 'src/app/services/api/api.service';
import { Conversation, ChatMessage } from './messaging.models';

@Injectable({ providedIn: 'root' })
export class ApiMessagingService extends ApiService {

    private readonly base = Constant.domainConfig.virtual_host + Constant.domainConfig.apiPrefix;

    getConversations(): Observable<Conversation[]> {
        return this.http.get<Conversation[]>(`${this.base}/conversations/`, this.options);
    }

    /** Opens (or creates) the thread for a venue. The brand side also passes the
     *  influencer's id; the influencer side omits it (they are the influencer). */
    openConversation(venueId: number, influencerId?: string): Observable<Conversation> {
        const payload: { venue_id: number; user_id?: string } = { venue_id: venueId };
        if (influencerId) payload.user_id = influencerId;
        return this.http.post<Conversation>(`${this.base}/conversations/`, payload, this.options);
    }

    getMessages(conversationId: number): Observable<ChatMessage[]> {
        return this.http.get<ChatMessage[]>(`${this.base}/conversations/${conversationId}/messages/`, this.options);
    }

    sendMessage(conversationId: number, body: string): Observable<ChatMessage> {
        return this.http.post<ChatMessage>(`${this.base}/conversations/${conversationId}/messages/`, { body }, this.options);
    }

    unreadCount(): Observable<{ count: number }> {
        return this.http.get<{ count: number }>(`${this.base}/conversations/unread-count/`, this.options);
    }
}
