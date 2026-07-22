export type Role = 'COMPANY' | 'INFLUENCER' | 'UNKNOW';

export interface UserRole {
    name: string;
    roles: Role[]
}

export const company: UserRole = {
    name: 'company',
    roles: ['COMPANY']
}

export const influencer: UserRole = {
    name: 'influencer',
    roles: ['INFLUENCER']
}

export const unknow: UserRole = {
    name: 'unknow',
    roles: ['UNKNOW']
}

export type ActionType = 'view' | 'edit' | 'archive' | 'duplicate';

export interface ActionPayload<T = any> {
    action: ActionType;
    data: T;
}  