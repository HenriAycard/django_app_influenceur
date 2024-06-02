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
  public isEditMode: boolean = false;

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

  public edit(): void {
    this.isEditMode = true;
  }

  public save(): void {
    console.log(this.user)
    this.isEditMode = false;
    this.authService.getCurrentUser().subscribe({
      next: (response: User) => {
        this.user = new User(response);
      }
    })
  }

}
