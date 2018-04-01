import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CarLocationHomePageComponent } from '../../pages/car-location-home/car-location-home';
import { lojackPhone, lojackEmail, leftAnimationOptions, rightAnimationOptions, EmergencyPhone } from '../../helper/utils';
import * as moment from 'moment';

/**
 * Generated class for the TripwireBreachPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tripwire-breach',
  templateUrl: 'tripwire-breach.html',
})
export class TripwireBreachPage {
  public lojackPhone;
  public lojackEmail;
  public EmergencyPhone;
  public tripwireDetails;
  public carDetailsItem;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.lojackPhone = lojackPhone;
    this.lojackEmail = lojackEmail;
    this.EmergencyPhone = EmergencyPhone;
    this.getTripWiredetails();
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad TripwireBreachPage');
    this.getTripWiredetails();
  }
  ionViewDidLeave() {
    this.resetObject(this.carDetailsItem);
    this.resetObject(this.tripwireDetails);
    console.log('destroyed trip');
  }
  getTripWiredetails() {
    this.carDetailsItem = this.navParams.get('tripWireData');
    this.tripwireDetails = this.carDetailsItem && this.carDetailsItem.tripwireBreachData ? this.carDetailsItem.tripwireBreachData : {};
    this.carDetailsItem = this.carDetailsItem ? this.carDetailsItem : { year: '', make : '', model: '' };
  }

  navigatetoHomePage() {
    this.navCtrl.setRoot(CarLocationHomePageComponent);

  }

  getMomentDateTime(date) {
    let newDate;
    if (moment(moment.unix(date / 1000)).isSame(moment(), 'day')) { // utc
      newDate = moment(moment.unix(date / 1000)).format('h:mm A'); // utc
    } else {
      newDate = moment(moment.unix(date / 1000)).format('h:mm A'); // date = moment.utc(date / 1000).format('MMM D, YYYY hh:mm A') // utc
    }
    return newDate; // .replace(/\b0/g, '');
  }

  resetObject(obj) {
    Object.keys(obj).forEach((key) => {
      obj[key] = null;
    });
  }

}
