export class User {
    id: string;
    first_name: string
    last_name: string
    username: string
    instagram: string
    tiktok: string
    youtube: string
    is_influencer: boolean

    constructor(init: User) {
        this.id = init.id
        this.first_name = init.first_name
        this.last_name = init.last_name
        this.username = init.username
        this.instagram = init.instagram
        this.tiktok = init.tiktok
        this.youtube = init.youtube
        this.is_influencer = init.is_influencer
    }
}