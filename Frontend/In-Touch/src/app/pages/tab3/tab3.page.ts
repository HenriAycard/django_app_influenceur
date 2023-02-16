import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, take } from 'rxjs';
import { User } from 'src/app/services/entities';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit{

  //user: any

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}


  ngOnInit(): void {
    this.authService.getCurrentUser().pipe(take(1)).subscribe((value: any) =>
    console.log(value)
     // this.user = value
    )
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

}
