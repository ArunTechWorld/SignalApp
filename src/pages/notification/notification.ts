import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CarLocationHomePageComponent } from '../car-location-home/car-location-home';
import * as moment from 'moment';
import { SharedProvider } from '../../providers/shared/shared';
import { SharedAPIProvider } from '../../providers/shared/sharedAPI';
import { ENV } from '../../environments/environment';
/**
 * Generated class for the NotificationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notification',
  templateUrl: 'notification.html',
})
export class NotificationPage implements OnInit, OnDestroy {

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private sharedProvider: SharedProvider,
    private sharedAPIProvider: SharedAPIProvider) {
    console.log('loading notifications');
  }
  private isAllNotifications = true;
  private falsyTemplate = false;
  private notification;
  private currentUser;
  private authToken;
  private deviceNameMap;
  private alertData;
  private notificationTitleArray = [];
  private hasNotificationData = false;
  private hasEmptyNotificationData = false;
  private pageNumber;
  private alertToACK = [];
  private totalCount;
  private notificationeorr = false;
  private alertIds;

  ngOnInit() {
    this.alertData = [];
    this.notificationTitleArray = [];
    this.pageNumber = 0;
    this.totalCount = 0;
    this.hasNotificationData = false;
    this.hasEmptyNotificationData = false;
    this.alertToACK = [];
  }

  ngOnDestroy() {
    this.alertData = null;
    this.notificationTitleArray = null;
    this.pageNumber = 0;
    this.totalCount = 0;
    this.hasNotificationData = false;
    this.hasEmptyNotificationData = false;
    this.alertToACK = null;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NotificationPage');
    this.loadNotifications();
  }
  ionViewDidLeave() {
    console.log('ionViewDidLeave NotificationPage.........');
  }
  backtohomepage() {
    console.log('returning to previous view');
    this.navCtrl.pop();
  }

  allnotification() {
    this.isAllNotifications = true;
  }

  alertsnotification() {
    this.isAllNotifications = false;
  }

  dateInMomentFormat(date) {
    let dayTitle;
    if (moment.utc(date).isSame(moment(), 'day')) {
      dayTitle = 'TODAY';
    } else if ((moment.utc(date).add(1, 'days')).isSame(moment(), 'day')) {
      dayTitle = 'YESTERDAY';
    } else {
      dayTitle = moment.utc(date).format('dddd, MMM D');
    }
    return dayTitle;
  }

  loadNotifications() {
    console.log('loading notifications for below user details');
    this.currentUser = this.sharedAPIProvider.getUserInfo();
    if (!this.sharedProvider.getAlertIds()) {
      this.sharedProvider.showBusyIndicator();
      this.sharedProvider.getAlertId(this.currentUser.response.authToken, this.currentUser.response.user.id).then(
        (res) => {
          this.sharedProvider.setAlertIds(res);
          this.getNotification(this.currentUser, res);
          this.notificationeorr = false;
        },
        (err) => {
          console.log(err);
          this.hasEmptyNotificationData = false;
          this.notificationeorr = true;
          this.sharedProvider.hideBusyIndicator();
        });
    } else {
      this.getNotification(this.currentUser, this.sharedProvider.getAlertIds());
    }
  }

  getNotification(currentUser, data) {
    let alertResult;
    this.alertIds = '';
    // this.sharedProvider.hideBusyIndicator();
    if (data) {
      data.alertId ? this.alertIds = data.alertId : this.alertIds = '';
    }
    if (this.alertIds) {
      this.sharedProvider.showBusyIndicator();
      this.pageNumber = this.pageNumber + 1;
      this.sharedProvider.fetchNotification(currentUser, this.alertIds,  this.pageNumber).then(
        (res) => {
          alertResult = res;
          this.totalCount = Math.ceil(alertResult.response.totalCount / ENV.MAX_PAGE_SIZE);
          this.populateNotification(alertResult.response.results);
          this.sharedProvider.hideBusyIndicator();
        },
        (err) => {
          console.log(err);
          this.sharedProvider.hideBusyIndicator();
        });
    } else {
      this.hasEmptyNotificationData = true;
    }
  }
  populateNotification(alertResult) {
    console.log('alert results ->'); console.log(alertResult);

    for (let i = 0; i < alertResult.length; i = i + 1) {
      const alertIdValue = alertResult[i].alertsFired.id ? alertResult[i].alertsFired.id : '';
      const alertTypeName = alertResult[i].alertsFired.alertTypeName ? alertResult[i].alertsFired.alertTypeName : '';
      const assetName = alertResult[i].alertsFired.asset ? alertResult[i].alertsFired.assetName : '';
      const createdOn = alertResult[i].alertsFired.createdOn ? alertResult[i].alertsFired.createdOn : '';
      const severityValue = alertResult[i].alertsFired.severity ? alertResult[i].alertsFired.severity : '';
      const isAcknowledged = alertResult[i].alertsFired.isAcknowledged;
      const action = this.sharedProvider.alertKeyMap.get(alertTypeName); // narration value Needs, Left, Reached ...
      const desc = (assetName ? assetName : '') + ' ' + (action ? action : '');

      if (isAcknowledged == false) {
        this.alertToACK.push(alertIdValue);
      }
      this.alertData.push({ alertId: alertIdValue, alertType: alertTypeName, alertDesc: desc.trim(), eventTime: createdOn, severity: severityValue });
      const temp = this.getMapTitleInfo(createdOn);
      this.notificationTitleArray.push(temp);
      this.hasNotificationData = true;
    }
    // {'tripwire-notification': alert.alertDesc == 'WBAVC53567FZ78542 SDCTC_DEVICE_ALERT' }
    console.log(this.alertData);
    if (alertResult.length == 0 && this.alertData.length == 0){
      this.hasEmptyNotificationData = true;
    }
    console.log('read alerts'); console.log(this.alertToACK);
    if (this.alertToACK.length != 0) {
      this.updateAlertACK();
    }
    this.ackMessageRead();
  }
  timeStampToTime(timestamp) {
    return timestamp ? moment(timestamp).format('h:mm A') : '';
  }

  showHeader(index) {
    if (index === 0) {
      return this.notificationTitleArray[index];
    } else {
      if (this.notificationTitleArray[index] === this.notificationTitleArray[index - 1]){
        return '';
      } else {
        return this.notificationTitleArray[index];
      }
    }
  }
  getMapTitleInfo(date) {
    // let temp=moment.utc("2018-02-10T12:06:41.000Z").format("x");
    let dayTitle;
    if (moment(date).isSame(moment(), 'day')) {
      dayTitle = 'TODAY';
    } else if ((moment(date).add(1, 'days')).isSame(moment(), 'day')) {
      dayTitle = 'YESTERDAY';
    } else {
      dayTitle = moment(date).format('dddd, MMM D');
    }
    return dayTitle;
  }

  ackMessageRead() {
    this.sharedProvider.setUnreadMessage(false);
  }

  doInfinite(infiniteScroll) {
    let alertResult: any;
    this.pageNumber = this.pageNumber + 1;
    if (this.pageNumber <= this.totalCount) {
      this.sharedProvider.fetchNotification(this.currentUser, this.alertIds, this.pageNumber).then(
        (res) => {
          alertResult = res;
          // this.populateNotification(alertResult.response.results);
          infiniteScroll.complete();
        },
        (err) => {
          console.log(err);
        });
    } else {
      infiniteScroll.complete();
    }
  }

  updateAlertACK() {
    this.sharedProvider.updateAlertNotification(this.currentUser.response.authToken, this.alertToACK).then(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      });
  }
}
