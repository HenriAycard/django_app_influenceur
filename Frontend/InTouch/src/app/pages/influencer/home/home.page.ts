import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCardTitle, IonContent, IonHeader, IonSearchbar, IonTitle, IonToolbar, IonCard, IonText, IonLabel, IonCol, IonThumbnail, IonGrid, IonRow, IonIcon, IonCardContent } from '@ionic/angular/standalone';
import { Router, ActivatedRoute, NavigationExtras, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { flash } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-home-influencer',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonCardTitle, IonCard, IonSearchbar, RouterModule, IonIcon]
})
export class HomeInfluencerPage implements OnInit {

  infoAboutMe: any;
  title = "Authenticated"

  searchVal: any;//IonSearchbar;
  firstname: string = ''

  private authService = inject(AuthService)
  private router = inject(Router)
  private activatedRoute = inject(ActivatedRoute)


  constructor() {
    addIcons({ flash })
  }

  ngOnInit(): void {
    if(this.authService.user) {
      this.firstname = this.authService.user.firstname
    }
  }

  search(event: any, val: string | null | undefined) {
    if (event.key === 'Enter' && typeof val === 'string') {
      this.navigation(val)
    }
  }

  navigation(val: string) {
    let navigationExtras: NavigationExtras = {
      queryParams: { search: val },
      relativeTo: this.activatedRoute
    };
    this.router.navigate(['search'], navigationExtras);
  }

}

