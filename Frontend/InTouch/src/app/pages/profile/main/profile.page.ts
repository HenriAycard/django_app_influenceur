import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonItemDivider, IonLabel, IonList, IonModal, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { User } from 'src/app/models/users';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ApiAuthService } from 'src/app/services/api/api-auth.service';
import { addIcons } from 'ionicons';
import { flash, helpCircleOutline, lockClosedOutline, logoInstagram, logoTiktok, logOutOutline, logoYoutube, notificationsOutline, pencil, personOutline } from 'ionicons/icons';
import { ReloadService } from 'src/app/services/reload.service';
import { Photo, Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { HttpEvent } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonItem, IonIcon, IonLabel, IonList, FormsModule, ReactiveFormsModule, IonButton, IonModal, IonTitle, IonToolbar, IonHeader, RouterLink]
})
export class ProfilePage implements OnInit {

  private apiAuth = inject(ApiAuthService)
  private authService = inject(AuthService)
  public user!: User
  public isLogoutModalOpen: boolean = false;
  @ViewChild(IonModal) modal!: IonModal;

  private reloadService = inject(ReloadService);

  constructor(
    private router: Router) {
    addIcons({ logoInstagram, logoTiktok, logoYoutube, flash, personOutline, notificationsOutline, lockClosedOutline, helpCircleOutline, logOutOutline, pencil })
  }


  ngOnInit(): void {
    this.reloadService.reload$.subscribe(() => {
      this.reloadData();
    });
    this.reloadData();
  }

  public reloadData() {
    this.apiAuth.findUser().subscribe({
      next: (response: User) => {
        this.user = response as User
      }
    })
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
    console.log("Opening camera to choose or take picture...");
    const photo: Photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    })

    console.log("New Picture Triggered");
    if (photo) {
      console.log("Photo found:", photo);

      const mimeType = `image/${photo.format}`;
      const blob = this.b64toBlob(photo.base64String!, mimeType);
      console.log("Blob created:", blob);

      //Generate a fake filename
      const name =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 10);

      const formData = new FormData();
      formData.append("avatar", blob, `${name}.${photo.format}`);

      this.apiAuth.updateAvatar(this.user.id, formData).subscribe({
        next: (value: HttpEvent<User>) => {
          if (value.type === 4) { // HttpResponse
            this.user = value.body as User
          }
        },
        complete: () => {

        }
      })

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