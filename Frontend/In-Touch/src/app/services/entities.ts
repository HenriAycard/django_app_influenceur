export class User {
    id: string;
    first_name: string
    last_name: string
    username: string
    facebookId: string
    android: boolean
    ios: boolean
    is_influenceur: boolean

    constructor(
        id: string,
        first_name: string,
        last_name: string,
        username: string,
        facebookId: string,
        android: boolean,
        ios: boolean,
        is_influenceur: boolean
    ) {
        this.id = id
        this.first_name = first_name
        this.last_name = last_name
        this.username = username
        this.facebookId = facebookId
        this.android = android
        this.ios = ios
        this.is_influenceur = is_influenceur
    }
}