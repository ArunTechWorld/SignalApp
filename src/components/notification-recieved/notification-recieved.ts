import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import * as moment from 'moment';
import { NotificationPage } from '../../pages/notification/notification';
import { TripwireBreachPage } from '../../pages/tripwire-breach/tripwire-breach';
import { CollisionSupportPage } from '../../pages/collision-support/collision-support';
import { ENV } from '../../environments/environment';
/**
 * Generated class for the NotificationRecievedComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'notification-recieved',
  templateUrl: 'notification-recieved.html'
})
export class NotificationRecievedComponent {

  public notificationInfo = [
  ];

  public pushData = [];
  constructor(public navCtrl: NavController, params: NavParams) {
    console.log('received notification -> ', params.get('currentNotification'));
    this.notificationInfo = params.get('currentNotification');
    this.pushData.push(this.notificationInfo);
    this.autoCloseNotification();
  }

  autoCloseNotification() {
    setTimeout(() => {
      this.closeModel();
    },         ENV.PUSH_NOTIFICATION_AUTOCLOSE_DELAY);
  }
  closeModel() {
    // let startIndex = this.navCtrl.getActive().index;
    // console.log("startIndex"+startIndex);
    if (this.navCtrl.getActive() && this.navCtrl.getActive().index > -1) {
      this.navCtrl.pop();
    }
  }
  notificationDetails(pushObject) {
    console.log('user interacted'); console.log(pushObject);
    let clearTime;
    switch (pushObject.alertType) {
      case 'SDCTC_TRIPWIRE_ALERT':
        clearTime = setTimeout(() => {
          this.navCtrl.push(TripwireBreachPage, { pushData: pushObject });
          clearTimeout(clearTime);
        },         0);
        break;
      case 'SDCTC_ICN_ALERT':
        clearTime = setTimeout(() => {
          this.navCtrl.push(CollisionSupportPage, { pushData: pushObject });
          clearTimeout(clearTime);
        },         0);
        break;
      default:
        clearTime = setTimeout(() => {
          this.navCtrl.push(NotificationPage, { pushData: pushObject });
          clearTimeout(clearTime);
        },                         0);
        break;
    }
  }
  timeStampToTime(timestamp) {
    return timestamp ? moment(timestamp).format('h:mm A') : '';
  }
}
