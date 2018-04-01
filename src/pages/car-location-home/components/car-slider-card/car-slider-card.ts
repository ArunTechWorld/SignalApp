import { Component, Input, OnInit } from '@angular/core';
import { Events, NavController } from 'ionic-angular';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { CollisionSupportPage } from '../../../collision-support/collision-support';

/**
 * Generated class for the CarSliderCardComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'car-slider-card',
  templateUrl: 'car-slider-card.html',
})
export class CarSliderCardComponent implements OnInit{

  @Input('carDetailsItem') carDetailsItem: any;
  @Input('iscolisionhappen') iscolisionhappen: any;
  @Input('isTripwireBreach') isTripwireBreach: any;
  @Input('itemsCount') itemsCount: any;
  @Input('isShowDetail') isShowDetail: any;

  // _name: string;
  public tempNotifiId = 0;
  public showcollisiodetails = true;
  public JSON ;
  public tripWireBreachDate;
  public carLastUpdateTime;
  constructor(public navCtrl: NavController, public events: Events) {
    this.JSON = JSON;
  }
  ngOnInit() {
    console.log('**********************************************');
    console.log(this.carDetailsItem);
    console.log('**********************************************'+ (this.carDetailsItem && this.carDetailsItem.lastUpdate));
    this.tripWireBreachDate = (this.carDetailsItem && this.carDetailsItem.tripwireBreachData && this.carDetailsItem.tripwireBreachData.date) ? this.getMomentTime(this.carDetailsItem.tripwireBreachData.date) : '';
    this.carLastUpdateTime = (this.carDetailsItem && this.carDetailsItem.lastUpdate) ? this.getMomentDateTime(this.carDetailsItem.lastUpdate) : '';
  }

  // private _name: string;

  // get name(): string {
  //   // transform value for display
  //   return this._name.toUpperCase();
  // }
  // @Input()
  // set name(name: string) {
  //   console.log('prev value: ', this._name);
  //   console.log('got name: ', name);
  //   this._name = name;
  // }


  updateLocation() {
    this.events.publish('user:updateLocation');
  }

  // get name(): string {
  //   // transform value for display
  //   return this._name.toUpperCase();
  // }
  // @Input()
  // set name(name: string) {
  //   console.log('prev value: ', this._name);
  //   console.log('got name: ', name);
  //   this._name = name;
  // }


  getMomentDateTime(date) {
    if (moment.unix(date / 1000).isSame(moment(), 'day')) {
      date = moment.unix(date / 1000).format("hh:mm A");
    } else {
      date = moment.unix(date / 1000).format("MMM D, YYYY hh:mm A")
    }
    return date;
  }

  getMomentTime(date) {
    let newDate;
    if (moment(moment.unix(date / 1000)).isSame(moment(), 'day')) { // utc
      newDate = moment(moment.unix(date / 1000)).format('h:mm A'); // utc
    } else {
      newDate = moment(moment.unix(date / 1000)).format('h:mm A'); // date = moment.utc(date / 1000).format('MMM D, YYYY hh:mm A') // utc
    }
    return newDate; // .replace(/\b0/g, '');
  }

  collisionsupport(iscolisionhappen) {
    this.navCtrl.push(CollisionSupportPage, { data: iscolisionhappen, dataasset: this.carDetailsItem.assetId });
  }
  closecollisiondetails(iscolisionhappen) {
    this.showcollisiodetails = false;
    iscolisionhappen.deviceid = null;

    this.events.publish('dissmis:collisiondissmis');
  //   console.log('closecollisiondetails' + JSON.stringify(iscolisionhappen.deviceid));
  // const collisiondetails =  JSON.stringify(localStorage.removeItem('iscolisiondetaildata'));
  //  //console.log('collisiondetails' + JSON.parses(collisiondetails));
  //  //this.updateLocation();
  }

  
  /*
  getMomentDateTime(date){
    if(moment(date).isSame(moment(),'day')){
      date =  moment(date).format("hh:mm A");
    }else {
      date = moment(date).format("DD/MM/YYYY hh:mm A")
    }
    return date;
  }
  */
}
