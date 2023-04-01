export class User {
    id: string;
    first_name: string
    last_name: string
    username: string
    facebookId: string
    android: boolean
    ios: boolean
    is_influenceur: boolean

    constructor(init: User) {
        this.id = init.id
        this.first_name = init.first_name
        this.last_name = init.last_name
        this.username = init.username
        this.facebookId = init.facebookId
        this.android = init.android
        this.ios = init.ios
        this.is_influenceur = init.is_influenceur
    }
}