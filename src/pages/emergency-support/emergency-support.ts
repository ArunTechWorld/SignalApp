import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CarLocationHomePageComponent } from '../../pages/car-location-home/car-location-home';
import { lojackPhone, lojackEmail, leftAnimationOptions, rightAnimationOptions, EmergencyPhone } from '../../helper/utils';

/**
 * Generated class for the EmergencySupportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-emergency-support',
  templateUrl: 'emergency-support.html',
})
export class EmergencySupportPage {
  public lojackPhone;
  public lojackEmail;
  public EmergencyPhone;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.lojackPhone = lojackPhone;
    this.lojackEmail = lojackEmail;
    this.EmergencyPhone = EmergencyPhone;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EmergencySupportPage');
  }
  navigatetoHomePage() {
    this.navCtrl.pop();
   // this.navCtrl.setRoot(CarLocationHomePageComponent);
  }

}
