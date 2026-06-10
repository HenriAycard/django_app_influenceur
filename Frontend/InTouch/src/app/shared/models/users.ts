export interface User {
    id: string;
    firstname: string
    lastname: string
    username: string
    avatar: null | string
    instagram: string
    tiktok: string
    youtube: string
    isInfluencer: boolean
    isCompany: boolean
    instagramFollowers?: number | null
    tiktokFollowers?: number | null
    youtubeFollowers?: number | null
    emailNotifications?: boolean
    averageRating?: number | null
    reviewCount?: number
}

/** Application to join: no password — it is set through the emailed link
 *  once an admin approves the account. */
export interface RegisterRequest {
    firstname: string
    lastname: string
    email: string
    role: 'influencer' | 'venue'
    instagram?: string
    tiktok?: string
    youtube?: string
}

export interface LoginParam {
    email: string;
    password: string
}

// The refresh token is no longer returned in the body — it is set by the backend
// as an httpOnly cookie. Only the (in-memory) access token comes back to JS.
export interface TokenResponse {
    access: string;
}