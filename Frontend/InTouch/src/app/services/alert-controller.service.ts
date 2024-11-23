import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class AlertControllerService {

  isShowingLoader = false;
  loader: any;

  constructor(
    private alertCtrl: AlertController,
    private loadingController: LoadingController) { }

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

  async showLoading() {
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
    if (this.loader){
      this.loader.dismiss()
      this.loader =  null
      this.isShowingLoader=false
    }
  }
  
  async showLoadingMessage(message: string) {
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

}
