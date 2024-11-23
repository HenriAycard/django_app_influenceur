export interface User {
    id: string;
    first_name: string
    last_name: string
    username: string
    instagram: string
    tiktok: string
    youtube: string
    is_influencer: boolean
}

export interface UserParam {
    first_name: string
    last_name: string
    email: string
    password: string
}

export interface LoginParam {
    email: string;
    password: string
}

export interface TokenResponse {
    access: string;
    refresh: string;
}

export interface RefreshTokenParam {
    refresh: string;
}