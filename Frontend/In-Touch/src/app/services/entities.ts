export class User {
    id:string;
    first_name:string;
    last_name:string;
    username:any;
    facebookId:any;
    android:string;
    ios:string;
    is_influenceur:boolean;

    constructor() {

    }

/*
    initWithJSON(json) : User{
      console.log(json)
      let _user = new User();
      for (var key in json) {
          _user[key] = json[key];
      }
      return this;
    }
    */
}