import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  public logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

}
