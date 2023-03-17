import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

interface User {
  logentry:string;
  password:string;
  last_login:any;
  is_superuser:any;
  id:any;
  email:string;
  first_name:string;
  last_name:string;
  date_joined:any;
  is_influenceur:any;
  is_active:any;
  is_staff:any;
  avatar:any;
  groups:any;
  user_permissions:any;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user: any

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}


  ngOnInit(): void {
    this.authService.user$.subscribe(
      (response: any) => {
        this.user = response;
      }
    )
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

}
