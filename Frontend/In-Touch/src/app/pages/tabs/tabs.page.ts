import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { User } from 'src/app/services/entities';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit{

  isInfluencer : boolean | null = null;
  title = "Authenticated"

  constructor(
    public userManager:UserManagerProviderService,
    private authService: AuthenticationService) {
      
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (value: User) => (this.isInfluencer = value.is_influenceur)
    })
  }



}
