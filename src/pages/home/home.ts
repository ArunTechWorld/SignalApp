import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  isValidEmail = true;
  public psswordType = 'password';
  public showPass = false;

  constructor(public navCtrl: NavController) {
    this.isValidEmail = true;
  }
  showPassword() {
    this.showPass = !this.showPass;
    this.psswordType = (this.showPass) ? 'text' : 'password';
  }

}
