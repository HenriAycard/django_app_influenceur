import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonModal, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileStore } from 'src/app/features/profile/profile.store';
import { addIcons } from 'ionicons';
import { flash, helpCircleOutline, lockClosedOutline, logoInstagram, logoTiktok, logOutOutline, logoYoutube, notificationsOutline, pencil, personOutline } from 'ionicons/icons';
import { Photo, Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonItem, IonIcon, IonLabel, IonList, FormsModule, ReactiveFormsModule, IonButton, IonModal, IonTitle, IonToolbar, IonHeader, RouterLink]
})
export class ProfilePage {

  protected readonly store = inject(ProfileStore)
  private authService = inject(AuthService)
  public isLogoutModalOpen: boolean = false;
  @ViewChild(IonModal) modal!: IonModal;

  constructor(
    private router: Router) {
    addIcons({ logoInstagram, logoTiktok, logoYoutube, flash, personOutline, notificationsOutline, lockClosedOutline, helpCircleOutline, logOutOutline, pencil })
  }

  // Reloads on every entry (incl. returning from profile edit).
  ionViewWillEnter(): void {
    this.store.refresh();
  }

  public showLogoutModal() {
    this.isLogoutModalOpen = true;
  }

  public async logout() {
    this.isLogoutModalOpen = false;
    await this.modal.onDidDismiss().then(() => {
      this.authService.logout();
      this.router.navigateByUrl('/login');
    })
  }

  public openSupportEmail() {
    window.location.href = 'mailto:support@intouch.fr';
  }

  public async chooseOrTakePicture() {
    const photo: Photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    })

    if (photo) {
      const mimeType = `image/${photo.format}`;
      const blob = this.b64toBlob(photo.base64String!, mimeType);

      // Generate a random filename
      const name =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 10);

      const formData = new FormData();
      formData.append("avatar", blob, `${name}.${photo.format}`);

      this.store.updateAvatar(formData).subscribe();
    }
  };

  public b64toBlob(b64Data: string, contentType = '', sliceSize = 512): Blob {
    const byteCharacters = atob(b64Data);
    const byteArrays: Uint8Array[] = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

}
