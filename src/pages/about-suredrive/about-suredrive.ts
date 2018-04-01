import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CarLocationHomePageComponent } from '../car-location-home/car-location-home';
import { ENV } from '../../environments/environment';
import { TermsAndConditionsComponent } from '../about-suredrive/terms-and-conditions/terms-and-conditions';
import { lojackPhone, lojackEmail, leftAnimationOptions, rightAnimationOptions } from '../../helper/utils';

/**
 * Generated class for the AboutSuredrivePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-about-suredrive',
  templateUrl: 'about-suredrive.html',
})

export class AboutSuredrivePage {
  public version;
  public lojackPhone;
  public lojackEmail;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.lojackPhone = lojackPhone;
    this.lojackEmail = lojackEmail;
  }

  ionViewDidLoad() {
    this.version = ENV.appversion;
    console.log('ionViewDidLoad AboutSuredrivePage');
  }
  goToHome() {
    this.navCtrl.pop();
  }
  openTC() {
    this.navCtrl.push(TermsAndConditionsComponent);
  }

}
