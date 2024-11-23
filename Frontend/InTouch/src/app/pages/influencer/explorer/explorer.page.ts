import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCardTitle, IonContent, IonHeader, IonSearchbar, IonTitle, IonToolbar,IonCard, IonText, IonLabel, IonCol, IonThumbnail, IonGrid, IonRow } from '@ionic/angular/standalone';
import { Router, ActivatedRoute, NavigationExtras, RouterModule } from '@angular/router';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.page.html',
  styleUrls: ['./explorer.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCardTitle, IonCard, IonText, IonLabel, IonCol, IonThumbnail, IonGrid, IonRow, IonSearchbar, RouterModule]
})
export class ExplorerPage implements OnInit {

  infoAboutMe : any;
  title = "Authenticated"

  searchVal: any;//IonSearchbar;

  constructor(
    public router:Router,
    public activatedRoute: ActivatedRoute) {

    }

    ngOnInit(): void {
      
    }
  
    search(event: any, val: string | null | undefined) {
      console.log(event)
      if (event.key === 'Enter' && typeof val === 'string'){
        
        let navigationExtras: NavigationExtras = {
          queryParams: { search: val},
          relativeTo: this.activatedRoute
        };
        console.log("[EXPLORER] - search - " + val)
        this.router.navigate(['view-search'], navigationExtras)
    }
      
  }

}