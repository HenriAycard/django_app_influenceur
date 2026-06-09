/** Messaging shapes (camelCased by the backend's CamelCaseJSONRenderer). */

export interface ChatUser {
    id: string;
    firstname: string;
    lastname: string;
    avatar: string | null;
}

export interface ChatMessage {
    id: number;
    sender: string;          // user uuid
    body: string;
    createdAt: string;       // ISO datetime
    readAt: string | null;
}

export interface Conversation {
    id: number;
    title: string;             // venue name (influencer view) or influencer name (brand view)
    subtitle: string | null;   // venue name for the brand view
    avatar: string | null;     // venue image (influencer view) or influencer avatar (brand view)
    lastMessage: ChatMessage | null;
    unreadCount: number;
    updatedAt: string;
}
