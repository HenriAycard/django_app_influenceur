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
}

export interface UserParam {
    firstname: string
    lastname: string
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