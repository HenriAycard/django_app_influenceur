import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from 'src/app/services/entities';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user: User

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}


  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(
      (response: any) => {
        this.user = new User(response);
      }
    )
    
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

}
