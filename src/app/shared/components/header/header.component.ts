import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  option = '';
  waiterName = localStorage.getItem('waiter');
  schedule = localStorage.getItem('kitchen');
  logo = 'assets/images/brandLetter.png';

  constructor(
    private readonly location: Location,
    public readonly router: Router,
    private authService: AuthService
  ) { }

  logOut() {
    this.authService.logOut()
    .then(() => {
      localStorage.removeItem('waiter');
      this.router.navigate(['mesas']);
    })
    .catch(() => {

    });
  }

  goBack() {
    this.location.back();
  }

  showOption() {
    if (this.option === '') {
      this.option = 'show';
    } else {
      this.option = '';
    }
  }
}
