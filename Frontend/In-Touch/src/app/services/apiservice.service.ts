import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable,BehaviorSubject, Observer, throwError} from 'rxjs';
import { from, of, forkJoin } from 'rxjs';
import { catchError, retry, map, tap, switchMap } from 'rxjs/operators';
import { AlertController, LoadingController } from '@ionic/angular';
import * as Constant from '../config/constant';
import { Platform } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { Network } from '@capacitor/network';
import { resolve } from 'dns';
import { dataOpeningDate,OpeningDate, AddressDto, NewCompanyDto, CompanyDto, OfferDto, CreateOfferDto, CreateReservationDto, django_pagination_ResaByStatusDto, ResaByStatusDto, ResaByStatusBrandDto, MainCompanyDto, typeCompanyDto } from 'src/app/models/activity-model';

export enum ConnectionStatus {
  Online,
  Offline
}

export interface django_pagination {
    count: number;
    next: any;
    previous: any;
    results: Array<Object>
}

export interface tokenDto {
    access: string;
    refresh: string;
}

export interface httpTokenDto {
    status: boolean;
    access: string;
    refresh: string;
}



@Injectable({
  providedIn: 'root'
})
export class ApiserviceService {

    

    //private status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.Offline);
    //public tokenSet: BehaviorSubject<Boolean> = new BehaviorSubject<Boolean>(false);

    //public tokenSSO: String = "";
    //public networkConnected: boolean = true;
    virtualHostName: string = ''
    appName: string = '';
    apiPrefix = "/api"
    loader: any;
    expireDate: any;
    isOnline = false;
    urlPwdOublie: string = '';
    checkUrl: string = '';
    cordovaiOS = false;
    isShowingLoader = false;
    getCustomUserUrl : string =''
    
    // ================ AUTHENTIFICATION METHODS ====================
    getLoginUrl : string=""
    getCreatUserUrl: string=""
    getResetPwdUrl : string="";
    getRefreshTokenUrl : string =""
    getMeUrl : string=""
    getUserUrl : string='';
    getCompanyUrl : string = "";
    getImgCompanyUrl : string = "";
    getAddressUrl: string = "";
    getOpeningUrl: string = "";
    getOfferUrl: string = "";
    getReservationUrl: string = "";
    getTypeCompanyUrl: string = "";
    
    
    getAppProfileUrl : string='';
    
    initProvider(url: string, app_name: string, apiPrefix: string) {
        this.virtualHostName = url;
        this.appName = app_name;
        this.apiPrefix = apiPrefix;
        console.log("init provider appName " + this.appName);
        this.initUrls()
    }

    private initUrls() {
    //Default urls 
        this.checkUrl = this.virtualHostName + this.apiPrefix + "/checkAPI/"
        // ================ AUTHENTIFICATION METHODS ====================
        this.getLoginUrl =  this.virtualHostName + "auth/jwt/create/"
        this.getCreatUserUrl  =  this.virtualHostName + "auth/users/"
        this.getResetPwdUrl = this.virtualHostName + "auth/users/reset_password/"
        this.getRefreshTokenUrl = this.virtualHostName + "auth/jwt/refresh/"
        this.getMeUrl =  this.virtualHostName + "auth/users/me/"
        // =================================================================
        
        this.getUserUrl = this.virtualHostName + this.apiPrefix + "/users/"
        this.getAppProfileUrl = this.virtualHostName + this.apiPrefix + "/appprofile/"
        this.getCompanyUrl = this.virtualHostName + this.apiPrefix + "/company/"
        this.getImgCompanyUrl = this.virtualHostName + this.apiPrefix + "/imgCompany/"
        this.getAddressUrl = this.virtualHostName + this.apiPrefix + "/address/"
        this.getOpeningUrl = this.virtualHostName + this.apiPrefix + "/opening/"
        this.getOfferUrl = this.virtualHostName + this.apiPrefix + "/offer/"
        this.getReservationUrl = this.virtualHostName + this.apiPrefix + "/reservation/"
        this.getTypeCompanyUrl = this.virtualHostName + this.apiPrefix + "/typeCompany/"
      }

    constructor(public http: HttpClient,
        public loadingController: LoadingController,
        public alertCtrl: AlertController){

        //this.initializeNetworkEvents();

         this.initProvider(Constant.domainConfig.virtual_host, Constant.domainConfig.client, "api")
        this.http = http
    }


        // Local Data 
      public setLocalData(key: string, jsonData: any) {
        return new Promise(async resolve => {

            console.log("=ON enregistre cle "+Constant.domainConfig.client+"-"+key+" valeur "+JSON.stringify(jsonData))
            await Preferences.set({key:`${Constant.domainConfig.client}-${key}`,value:JSON.stringify(jsonData)})
            resolve(true)
      
    });
      }

      public removeLocalData(key: string){
        return new Promise(async resolve => {
            let ret = await Preferences.remove({key:`${Constant.domainConfig.client}-${key}`}) 

        });
      }
      // Get cached API result
      public getLocalData(key: string) {
        return new Promise(async resolve => {
            let ret = await Preferences.get({key:`${Constant.domainConfig.client}-${key}`}) 
            
            if (ret.value){
                resolve( JSON.parse(ret.value))
            }
            else{
                resolve(null)
            }
        });
    }


    public findCompany() {
        let url = this.getCompanyUrl

        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        console.log("[GET][URL] " + url);
        console.log(options)
        return this.http.get(url, options);
    }
    /*

    public findActivityByCompanyId(valeur: any){
        let url = this.getActivityUrl + '?company=' + valeur

        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };

        return this.callBackEnd(url, options);
    }
*/
    public callBackEnd(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
    }){
        return new Observable((observer: Observer<ArrayBuffer>) => {
            // At this point make a request to your backend to make a real check!
            console.log("[GET][URL] " + url);
            console.log(options)
            this.http.get(url, options)
                .pipe(retry(3))
                .subscribe({
                    next: (value: any) => {
                        observer.next(value);
                        observer.complete();
                    },
                    error(err) {
                        observer.error(err);
                        observer.complete();
                        console.log(err);// Error getting the data
                    },
                });
        });
    }


    // ================ AUTHENTIFICATION METHODS ====================
    /*
    public refreshToken(token: string): any{
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
         
         let params = {
             "refresh":token
         }
        console.log("[POST][URL]", this.getRefreshTokenUrl)
        console.log("[POST][PARAMS]", params)
        
        this.http.post<tokenDto>(this.getRefreshTokenUrl, params, options)
            .pipe(retry(3))
            .subscribe({
                next: (value: tokenDto) => {
                    console.log("=== REFRESH reponse",value)
                    this.setLocalData("access",{"access":value.access})
                    this.setLocalData("refresh",{"refresh":value.refresh})
                    return <httpTokenDto> {"status": true, "access":value.access,"refresh":value.refresh}
                },
                error: (err: any) => {
                    console.log(err);// Error getting the data
                    return <httpTokenDto> {"status": false, "access":"","refresh": ""}
                },
            })
    }  */

    login(params: any){
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        
        return new Observable(observer=>{
            console.log(this.getLoginUrl)
            console.log(params)
            this.http.post(this.getLoginUrl, params, options)
            .subscribe({
                next(value) {
                    console.log("OK")
                    observer.next(value)
                    observer.complete()
                },
                error(err) {
                    console.log("POST call in error", err);
                    observer.error()
                    observer.complete()
                }
            });
            
        })
        
    }

    registerUser(params: any){
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
         
        console.log("[registerUser] URL :"+this.getCreatUserUrl)
        
        return new Observable((observer: Observer<object>) => {
            this.http.post(this.getCreatUserUrl, params, options)
                .pipe(retry(3))
                .subscribe({
                    next: (value) => {
                        observer.next({"status":"OK","data":value})
                        observer.complete()
                    },
                    error(err) {
                        console.log("POST call in error", err);
                        observer.next({"status":"KO","error":err})
                        observer.complete()
                    },
                })
        })
        
    }
/*
    getUserMe(){
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
         
        console.log("URL "+this.getMeUrl)
        
        return new Observable((observer: Observer<object>) => {
            console.log(this.getMeUrl)
            console.log(options)
            this.http.get(this.getMeUrl, options)
                .pipe(retry(3))
                .subscribe({
                    next: (value) => {
                        observer.next({"status":"OK","data":value})
                        observer.complete()
                    },
                    error: (err) => {
                        console.log("POST call in error", err);
                         observer.next({"status":"KO","error":err})
                         observer.complete()
                    },
                });
            })
    }
*/
     
    createUser(modelToCreate: any) {
        // model JSON
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };

        let params = JSON.stringify(modelToCreate)
        console.log("[createUser] URL :"+this.getCreatUserUrl)
        return this.http.post(this.getCreatUserUrl, modelToCreate, options).pipe(retry(3))
    }


    getAllUser() {
        let url = this.getUserUrl;
        return this.findUser(url)
    }
    
    findUserWithQuery(query: string) {
        let url = this.getUserUrl + query;
        return this.findUser(url)
    }



    private findUser(url: string) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };

        return new Observable((observer: Observer<object>) => {
            // At this point make a request to your backend to make a real check!
            console.log("call url " + url);
            this.http.get(url, options)
                .pipe(retry(3))
                .subscribe({
                    next(value) {
                        observer.next(value);
                        observer.complete();
                    },
                    error(err) {
                        observer.error(err);
                        observer.complete();
                        console.log(err);// Error getting the data
                    },
                })
        });
    }

    findUserBylogentry(parameter: string) {
    let url = this.getUserUrl+"?logentry="+parameter;
    return this.findUser(url)
    }
    findUserByappprofile(parameter: string) {
    let url = this.getUserUrl+"?appprofile="+parameter;
    return this.findUser(url)
    }
    findUserByfcmdevice(parameter: string) {
    let url = this.getUserUrl+"?fcmdevice="+parameter;
    return this.findUser(url)
    }
    findUserBypassword(parameter: string) {
    let url = this.getUserUrl+"?password="+parameter;
    return this.findUser(url)
    }
    findUserBylast_login(parameter: string) {
    let url = this.getUserUrl+"?last_login="+parameter;
    return this.findUser(url)
    }
    findUserByis_superuser(parameter: string) {
    let url = this.getUserUrl+"?is_superuser="+parameter;
    return this.findUser(url)
    }
    findUserByid(parameter: string) {
    let url = this.getUserUrl+"?id="+parameter;
    return this.findUser(url)
    }
    findUserByemail(parameter: string) {
    let url = this.getUserUrl+"?email="+parameter;
    return this.findUser(url)
    }
    findUserByfirst_name(parameter: string) {
    let url = this.getUserUrl+"?first_name="+parameter;
    return this.findUser(url)
    }
    findUserBylast_name(parameter: string) {
    let url = this.getUserUrl+"?last_name="+parameter;
    return this.findUser(url)
    }
    findUserBydate_joined(parameter: string) {
    let url = this.getUserUrl+"?date_joined="+parameter;
    return this.findUser(url)
    }
    findUserByis_active(parameter: string) {
    let url = this.getUserUrl+"?is_active="+parameter;
    return this.findUser(url)
    }
    findUserByis_staff(parameter: string) {
    let url = this.getUserUrl+"?is_staff="+parameter;
    return this.findUser(url)
    }
    findUserByavatar(parameter: string) {
    let url = this.getUserUrl+"?avatar="+parameter;
    return this.findUser(url)
    }
    findUserBygroups(parameter: string) {
    let url = this.getUserUrl+"?groups="+parameter;
    return this.findUser(url)
    }
    findUserByuser_permissions(parameter: string) {
    let url = this.getUserUrl+"?user_permissions="+parameter;
    return this.findUser(url)
    }

/*
    getUserDetails(id: string){
        const options = {
            headers: new HttpHeaders({
                'Authorization': 'Bearer ' + this.tokenSSO,
                'Content-Type': 'application/json'
            })
        };
        return new Observable((observer: Observer<object>) => {
            // At this point make a request to your backend to make a real check!
            this.http.get(this.getUserUrl + id + "/", options)
                .pipe(retry(3))
                .subscribe({
                    next: (value) => {
                        //this.networkConnected = true
                        observer.next(value);
                        observer.complete();
                    },
                    error(err) {
                        observer.error(err);
                        observer.complete();
                        console.log(err);// Error getting the data
                    },
                })
        });
    }*/
    updateUser(id: string, patchParams: any) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return new Observable((observer: Observer<object>) => {
            // At this point make a request to your backend to make a real check!
            this.http.patch(this.getUserUrl + id + "/", patchParams, options)
                .pipe(retry(3))
                .subscribe({
                    next: (value) => {
                        //this.networkConnected = true
                        observer.next(value);
                        observer.complete();
                    },
                    error(err) {
                        observer.error(err);
                        observer.complete();
                        console.log(err);// Error getting the data
                    },
                });
        });
    }

    putUser(object: any) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return new Observable((observer: Observer<object>) => {
            // At this point make a request to your backend to make a real check!
            this.http.put(this.getUserUrl + object.id + "/", object, options)
                .pipe(retry(3))
                .subscribe({
                    next: (value) => {
                        //this.networkConnected = true
                        observer.next(value);
                        observer.complete();
                    },
                    error(err) {
                        observer.error(err);
                        observer.complete();
                        console.log(err);// Error getting the data
                    },
                });
        });
    }
    deleteUser(id: string) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return  this.http.delete(this.getUserUrl + id + "/", options).pipe(retry(3))


    }    
    createAppProfile(modelToCreate: any) {
        // model JSON
        const options = {
            headers: new HttpHeaders({
                
                'Content-Type': 'application/json'
            })
        };

       
        console.log("URL "+this.getAppProfileUrl)
        return this.http.post(this.getAppProfileUrl, modelToCreate, options).pipe(retry(3))
    }


    getAllAppProfile() {
        let url = this.getAppProfileUrl;
        return this.findAppProfile(url)
    }
    
    findAppProfileWithQuery(query: string) {
        let url = this.getAppProfileUrl + query;
        return this.findAppProfile(url)
    }



    private findAppProfile(url: string) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };

        return new Observable((observer: Observer<object>) => {
            // At this point make a request to your backend to make a real check!
            console.log("call url " + url);
            this.http.get(url, options)
                .pipe(retry(3))
                .subscribe({
                    next: (value) => {
                        //this.networkConnected = true
                        observer.next(value);
                        observer.complete();
                    },
                    error(err) {
                        observer.error(err);
                        observer.complete();
                        console.log(err);// Error getting the data
                    },
                });
        });
        }

    findAppProfileByid(parameter: string) {
    let url = this.getAppProfileUrl+"?id="+parameter;
    return this.findAppProfile(url)
    }
    findAppProfileByuser(parameter: string) {
    let url = this.getAppProfileUrl+"?user="+parameter;
    return this.findAppProfile(url)
    }
    findAppProfileByfacebookToken(parameter: string) {
    let url = this.getAppProfileUrl+"?facebookToken="+parameter;
    return this.findAppProfile(url)
    }
    findAppProfileBygoogleToken(parameter: string) {
    let url = this.getAppProfileUrl+"?googleToken="+parameter;
    return this.findAppProfile(url)
    }
    findAppProfileByappleToken(parameter: string) {
    let url = this.getAppProfileUrl+"?appleToken="+parameter;
    return this.findAppProfile(url)
    }
    findAppProfileByonline(parameter: string) {
    let url = this.getAppProfileUrl+"?online="+parameter;
    return this.findAppProfile(url)
    }
    findAppProfileBylastConnexionDate(parameter: string) {
    let url = this.getAppProfileUrl+"?lastConnexionDate="+parameter;
    return this.findAppProfile(url)
    }
    findAppProfileByvalid(parameter: string) {
    let url = this.getAppProfileUrl+"?valid="+parameter;
    return this.findAppProfile(url)
    }
    findAppProfileBystripeCustomerId(parameter: string) {
    let url = this.getAppProfileUrl+"?stripeCustomerId="+parameter;
    return this.findAppProfile(url)
    }
    findAppProfileBystripePaymentMethodId(parameter: string) {
    let url = this.getAppProfileUrl+"?stripePaymentMethodId="+parameter;
    return this.findAppProfile(url)
    }
    findAppProfileBystripeSubscriptionId(parameter: string) {
    let url = this.getAppProfileUrl+"?stripeSubscriptionId="+parameter;
    return this.findAppProfile(url)
    }
    findAppProfileByrefSubscription(parameter: string) {
    let url = this.getAppProfileUrl+"?refSubscription="+parameter;
    return this.findAppProfile(url)
    }
    findAppProfileBysubscriptionValid(parameter: string) {
    let url = this.getAppProfileUrl+"?subscriptionValid="+parameter;
    return this.findAppProfile(url)
    }
    findAppProfileBysubscriptionDate(parameter: string) {
    let url = this.getAppProfileUrl+"?subscriptionDate="+parameter;
    return this.findAppProfile(url)
    }
    findAppProfileBysubscriptionTransactionId(parameter: string) {
    let url = this.getAppProfileUrl+"?subscriptionTransactionId="+parameter;
    return this.findAppProfile(url)
    }
    findAppProfileBysubscriptionCancel(parameter: string) {
    let url = this.getAppProfileUrl+"?subscriptionCancel="+parameter;
    return this.findAppProfile(url)
    }
    findAppProfileBypurchaseId(parameter: string) {
    let url = this.getAppProfileUrl+"?purchaseId="+parameter;
    return this.findAppProfile(url)
    }
    findAppProfileBypushAccepted(parameter: string) {
    let url = this.getAppProfileUrl+"?pushAccepted="+parameter;
    return this.findAppProfile(url)
    }
    findAppProfileBycreatedAt(parameter: string) {
        let url = this.getAppProfileUrl+"?createdAt="+parameter;
        return this.findAppProfile(url)
    }
    findAppProfileByupdatedAt(parameter: string) {
        let url = this.getAppProfileUrl+"?updatedAt="+parameter;
        return this.findAppProfile(url)
    }

/*
    getAppProfileDetails(id: string){
        const options = {
            headers: new HttpHeaders({
                'Authorization': 'Bearer ' + this.tokenSSO,
                'Content-Type': 'application/json'
            })
        };
        return new Observable((observer: Observer<object>) => {
            // At this point make a request to your backend to make a real check!
            this.http.get(this.getAppProfileUrl + id + "/", options)
                .pipe(retry(3))
                .subscribe({
                    next: (value) => {
                        //this.networkConnected = true
                        observer.next(value);
                        observer.complete();
                    },
                    error(err) {
                        observer.error(err);
                        observer.complete();
                        console.log(err);// Error getting the data
                    },
                });
        });
    }*/
    updateAppProfile(id: string, patchParams: any) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return new Observable((observer: Observer<object>) => {
            // At this point make a request to your backend to make a real check!
            this.http.patch(this.getAppProfileUrl + id + "/", patchParams, options)
                .pipe(retry(3))
                .subscribe({
                    next: (value) => {
                        //this.networkConnected = true
                        observer.next(value);
                        observer.complete();
                    },
                    error(err) {
                        observer.error(err);
                        observer.complete();
                        console.log(err);// Error getting the data
                    },
                });
        });
    }

    putAppProfile(object: any) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return new Observable((observer: Observer<boolean>) => {
            // At this point make a request to your backend to make a real check!
            this.http.put(this.getAppProfileUrl + object.id + "/", object, options)
                .pipe(retry(3))
                .subscribe({
                    next: (value) => {
                        //this.networkConnected = true
                        observer.next(true);
                        observer.complete();
                    },
                    error(err) {
                        observer.next(false);
                        observer.complete();
                        console.log(err);// Error getting the data
                    },
                });
        });
    }
    deleteAppProfile(id: any) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return  this.http.delete(this.getAppProfileUrl + id + "/", options).pipe(retry(3))


    }    
    
       //Override 
    async showNoNetwork() {
        let alert = await this.alertCtrl.create({
            header: 'Désolé',
            message: 'Pas de réseau détecté. Merci de vérifier votre connexion 3G/4G ou Wifi',
            buttons: ['OK']
        });
        return await alert.present();

    }
   
    async showLoading() {
     
      console.log("SHOW LOADING")
      if (!this.isShowingLoader){
        this.isShowingLoader=true
          this.loader = await this.loadingController.create({
            message:  'Merci de patienter',
            duration: 2000
          });
          return await this.loader.present();
        
      }
     
    }


  
    async stopLoading() {
     
      console.log("STOP LOADING?")
      console.log(this.isShowingLoader)
      if (this.loader){
        this.loader.dismiss()
        this.loader =  null
        this.isShowingLoader=false
      }
    
    }
    
     public async showLoadingMessage(message: string) {
      this.loader = await this.loadingController.create({
        message: message,
      });
      this.loader.present();
    }

    async loadingPresent() {
        const loading = await this.loadingController.create({
            message:  'Loading, please wait',
            duration: 2000
        });
        return await loading.present();
    }

    async loadingDismiss(){
        this.loadingController.dismiss();
    }
  
  
  

    /**
    * Show error message  
    *
    * @param text - The message to show
    * 
    */
    async showError(text: string) {
        let alert = await this.alertCtrl.create({
            header: 'Erreur',
            message: text,
            buttons: ['OK']
        });
        return await alert.present();
    }

    /**
    * Show a message  
    *
    * @param title - The title of the message to show
    * @param message - The text of the message to show
    * 
    */
    async showMessage(title: string, message: string) {
        let alert = await this.alertCtrl.create({
            header: title,
            message: message,
            buttons: ['OK']
        });
        return await alert.present();
    }

 
    checkAPI() {
        return new Observable((observer: Observer<boolean>) => {
            // At this point make a request to your backend to make a real check!
            this.http.get(this.checkUrl)
                .pipe(
                    retry(3)
                )
                .subscribe({
                    next: (res) => {
                        //this.networkConnected = true
                        observer.next(true);
                        observer.complete();
                    },
                    error: (err: any) => {
                        observer.next(false);
                        observer.complete();
                    }
                });
        });
    
    }

    sendResetPasswordLink(email: string) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        let postParams = {
            'email' : email
        }
        return new Observable((observer: Observer<boolean>) => {
            // At this point make a request to your backend to make a real check!
            this.http.post(this.urlPwdOublie, postParams, options)
                .pipe(retry(3))
                .subscribe({
                    next: () => {
                        //this.networkConnected = true
                        observer.next(true);
                        observer.complete();
                    },
                    error: (err: any) => {
                        observer.next(false);
                        observer.complete();
                        console.log(err);// Error getting the data
                    },

                });
        });
    }


    createAddresse(address: AddressDto) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        var bodyJson: string = JSON.stringify(address)
        console.log("[APISERVICE][POST] - createAddresse - start")
        console.log("[APISERVICE][POST] - URL - " + this.getAddressUrl)
        console.log("[APISERVICE][POST] - BODY - " + bodyJson)
        return this.http.post(this.getAddressUrl, bodyJson, options).pipe(retry(3))
    }

    createOpening(opening: OpeningDate) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        var bodyJson: string = JSON.stringify(opening)
        console.log("[APISERVICE][POST] - createOpening - start")
        console.log("[APISERVICE][POST] - URL - " + this.getOpeningUrl)
        console.log("[APISERVICE][POST] - BODY - " + bodyJson)
        return this.http.post(this.getOpeningUrl, bodyJson, options).pipe(retry(3))
    }

    createCompany(activity: NewCompanyDto) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        var bodyJson: string = JSON.stringify(activity)
        console.log("[APISERVICE][POST] - createCompany - start")
        console.log("[APISERVICE][POST] - URL - " + this.getCompanyUrl)
        console.log("[APISERVICE][POST] - BODY - " + bodyJson)
        return this.http.post(this.getCompanyUrl, bodyJson, options).pipe(retry(3))
    }

    createOffer(offer: CreateOfferDto) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        var bodyJson: string = JSON.stringify(offer)
        console.log("[APISERVICE][POST] - createOffer - start")
        console.log("[APISERVICE][POST] - URL - " + this.getOfferUrl)
        console.log("[APISERVICE][POST] - BODY - " + bodyJson)
        return this.http.post(this.getOfferUrl, bodyJson, options).pipe(retry(3))
    }

    createReservation(reservation: CreateReservationDto) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        var bodyJson: string = JSON.stringify(reservation)
        console.log("[APISERVICE][POST] - createReservation - start")
        console.log("[APISERVICE][POST] - URL - " + this.getReservationUrl)
        console.log("[APISERVICE][POST] - BODY - " + bodyJson)
        return this.http.post(this.getReservationUrl, bodyJson, options).pipe(retry(3))
    }

    public findCompanyById(id: number): Observable<CompanyDto>{
        const url = this.getCompanyUrl + id.toString()
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        console.log("[APISERVICE][GET] - findCompanyById - start")
        console.log("[APISERVICE][GET] - URL - " + url)
        return this.http.get<CompanyDto>(url, options)
    }

    public findOfferById(id: number): Observable<OfferDto[]>{
        const url = this.getOfferUrl + "?company=" + id.toString()
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        console.log("[APISERVICE][GET] - findOfferById - start")
        console.log("[APISERVICE][GET] - URL - " + url)
        return this.http.get<OfferDto[]>(url, options)
    }

    public findCompanyBySearch(search: string): Observable<Array<MainCompanyDto>>{
        const url = this.getCompanyUrl + 'search/?search=' + search
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        console.log("[APISERVICE][GET] - findCompanyBySearch - start")
        console.log("[APISERVICE][GET] - URL - " + url)
        return this.http.get<Array<MainCompanyDto>>(url, options)
    }

    public findReservation(status: number, conditionDate: string): Observable<Array<ResaByStatusDto>>{
        const url = this.getReservationUrl + '?status=' + status.toString() + conditionDate
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        console.log("[APISERVICE][GET] - findReservation - start")
        console.log("[APISERVICE][GET] - URL - " + url)
        return this.http.get<Array<ResaByStatusDto>>(url, options)
    }
    
    public findReservationBrand(status: number, conditionDate: string): Observable<Array<ResaByStatusBrandDto>>{
        const url = this.getReservationUrl + '?status=' + status.toString() + conditionDate
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        console.log("[APISERVICE][GET] - findReservationBrand - start")
        console.log("[APISERVICE][GET] - URL - " + url)
        return this.http.get<Array<ResaByStatusBrandDto>>(url, options)
    }

    public updateReservationBrand(id: number, status: number, user: string, offer: number): Observable<any>{
        const url = this.getReservationUrl + id.toString()
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        var bodyJson: string = JSON.stringify({status: status, user: user, offer: offer})
        console.log("[APISERVICE][PUT] - updateReservationBrand - start")
        console.log("[APISERVICE][PUT] - URL - " + url)
        return this.http.put<any>(url, bodyJson, options)
    }

    public uploadPhoto(formData: FormData): Observable<any> {
        const url = this.getImgCompanyUrl
        console.log("[APISERVICE][POST] - uploadPhoto - start")
        console.log("[APISERVICE][POST] - URL - " + url)
        console.log("[APISERVICE][POST] - formData - " + formData.get('company'))
        return this.http.post<any>(url, formData, {
            reportProgress: true,
            observe: 'events'
          })

    }

    public findTypeCompany(): Observable<typeCompanyDto[]> {
        const url = this.getTypeCompanyUrl;
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.http.get<typeCompanyDto[]>(url, options)
    }
}
