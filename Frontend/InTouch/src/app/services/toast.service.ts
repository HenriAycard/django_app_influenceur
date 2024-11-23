import { Injectable } from "@angular/core";
import { ToastController } from "@ionic/angular/standalone";

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    public readonly WARN = 'warning';
    public readonly DANGER = 'danger';
    public readonly SUCCESS = 'success';

    constructor(public toastController: ToastController) { }
    
    public toastWarn(header: string, message: string) {
        this.presentToast(header, message, 'top', this.WARN)
    }

    public toastDanger(header: string, message: string) {
        this.presentToast(header, message, 'top', this.DANGER)
    }

    public toastSuccess(header: string, message: string) {
        this.presentToast(header, message, 'top', this.SUCCESS)
    }

    async presentToast(header: string, message: string, position: 'top' | 'middle' | 'bottom', color: string){
        try {
          this.toastController.dismiss().then(() => {
          }).catch(() => {
          }).finally(() => {
          });
        } catch(e) {}
        
        this.toastController.create({
          header: header,
          message: message,
          position: position,
          duration: 10000,
          buttons: [{text: 'Dismiss',role: 'cancel'}],
          color: color
        }).then((toast) => {
          toast.present();
        });
      }
}