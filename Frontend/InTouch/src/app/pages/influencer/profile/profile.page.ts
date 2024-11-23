import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { User } from 'src/app/models/users';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ApiAuthService } from 'src/app/services/api/api-auth.service';
import { addIcons } from 'ionicons';
import { logoInstagram, logoTiktok, logoYoutube } from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonItem, IonIcon, IonLabel, IonButton, IonList, IonListHeader]
})
export class ProfilePage implements OnInit {

  private apiAuth = inject(ApiAuthService)
  private authService = inject(AuthService)
  public user!: User;
  public isEditMode: boolean = false;

  constructor(private router: Router) {
    addIcons({logoInstagram, logoTiktok, logoYoutube})
  }


  ngOnInit(): void {
    this.apiAuth.findUser().subscribe({
      next: (response: User) => this.user = response as User
      }
    )
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  public edit(): void {
    this.isEditMode = true;
  }

  public save(): void {
    console.log(this.user)
    this.isEditMode = false;
    this.apiAuth.findUser().subscribe({
      next: (response: User) => this.user = response as User
      }
    )
  }

}