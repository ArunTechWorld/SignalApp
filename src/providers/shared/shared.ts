import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoadingController, ActionSheetController, Platform, ModalController } from 'ionic-angular';
import { ENV } from '../../environments/environment';
import { StatusBar } from '@ionic-native/status-bar';
import { SpinnerComponent } from '../../components/spinner/spinner';
/*
  Generated class for the SharedProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SharedProvider {
  public busyIndicator;
  public networkStatus = false;
  public isInitialLoading = true;
  public unreadMessage = false;
  public alertIds;
  // TODO: make it immutable for writeSafety
  public alertKeyMap;
  public ppTokenTimestamp;
  constructor(public http: HttpClient,
              public loading: LoadingController,
              public actionSheetCtrl: ActionSheetController,
              public statusBar: StatusBar,
              public platform: Platform,
              public modalCtrl: ModalController) {
    this.alertKeyMap = new Map();

    this.alertKeyMap.set('SDCTC_TOWING_ALERT', ' is being towed.');
    this.alertKeyMap.set('SDCTC_ICN_ALERT', ' was in collision.');
    this.alertKeyMap.set('SDCTC_TRIPWIRE_ALERT', ' breached the Tripwire.');
    this.alertKeyMap.set('SDCTC_SPEED_ALERT', '  has exceeded the maximum speed limit.');
    this.alertKeyMap.set('SDCTC_BATTERY_ALERT', ' needs a battery replacement.');
    this.alertKeyMap.set('SDCTC_DEVICE', ' has an issue detected.');
    this.alertKeyMap.set('SDCTC_BATTERY_DISCONNECT', ' battery disconnected.');
    this.alertKeyMap.set('SDCTC_DTC_DEALER_ALERT', ' alerted you');
    this.alertKeyMap.set('SDCTC_DTC_ALERT', ' alert triggered.');
    this.alertKeyMap.set('SDCTC_IZN_ENTRY_ALERT', ' arrived at a geozone.');
    this.alertKeyMap.set('SDCTC_IZN_EXIT_ALERT', ' left a geozone.');
    this.alertKeyMap.set('SDCTC_IZN_ALERT', ' geozone alert.');
  }
  private state = false;
  showBusyIndicator() {
    if (!this.state) {
      console.log('Showing Spinner');
      this.busyIndicator = this.modalCtrl.create(SpinnerComponent, {} , { cssClass: 'spinner-popup' });
      this.busyIndicator.present();
      this.state = true;
    }
  }
  hideBusyIndicator() {
    console.log('Hiding Spinner');
    if (this.state) {
      this.busyIndicator.dismiss(); this.state = false;
    }
  }
  logOut() {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Modify your album',
      buttons: [
        {
          text: 'Sign Out',
          handler: () => {
            console.log('Sign Out clicked');
          },
        }, {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
      ]
    });
    actionSheet.present();
  }
  parseResponse(response) {
    switch (response.status) {
      case 401: console.log(response);
        break;
      case 403: console.log(response);
        break;
      default: console.log('Something Went Wrong'); break;
    }
  }

  getDevices(authToken) {
    return new Promise((resolve, reject) => {
      // this.sharedProvider.showBusyIndicator();
      this.http.get(ENV.apiUrl + 'devices', {
        headers: new HttpHeaders().set('authorization', authToken),
      }).subscribe((res) => {
        resolve(res);
        // this.sharedProvider.hideBusyIndicator();
      },           (err) => {
        reject(err);
        // this.sharedProvider.hideBusyIndicator();
      });
    });
  }

  fetchNotification(currentUser, alertIds, pageNumber) {
    const authToken = currentUser.response.authToken;
    const userDetail = currentUser.response.user;
    console.log(alertIds);
    const requestBody = {
      search: {
        searchTerms: {
          alertConfigurationId: alertIds,
        },
        sort: ['-createdOn'],
      },
    };
    return new Promise((resolve, reject) => {
      this.http.post(ENV.apiUrl + 'alerts/history?pg=' + pageNumber + '&pgsize=' + ENV.MAX_PAGE_SIZE, requestBody, {
        headers: new HttpHeaders().set('authorization', authToken),
      }).subscribe((res) => {
        resolve(res);
      },           (err) => {
        reject(err);
      });
    });
  }

  getUnreadMessage() {
    return this.unreadMessage;
  }
  setUnreadMessage(unreadMessage) {
    this.unreadMessage = unreadMessage;
  }

  getAlertId(authToken, userId) {
    return new Promise((resolve, reject) => {
      this.http.get(ENV.apiUrl + 'alerts/user/' + userId, {
        headers: new HttpHeaders().set('authorization', authToken),
      }).subscribe((res) => {
        resolve(res);
      },           (err) => {
        reject(err);
      });
    });
  }

  updateAlertNotification(authToken, alertToACK) {
    console.log('acknowldging these alerts -> ' + alertToACK);
    const requestBody = {
      "alertsFiredIds": alertToACK,
    };
    return new Promise((resolve, reject) => {
      this.http.post(ENV.apiUrl + 'alerts/history/acknowledge/', requestBody, {
        headers: new HttpHeaders().set('authorization', authToken),
      }).subscribe((res) => {
        resolve(res);
      },           (err) => {
        reject(err);
      });
    });
  }

  updateStatusBar(page) {
    switch (page) {
      case 'login':
        this.statusBar.backgroundColorByHexString('#ffffff');
        this.statusBar.styleDefault();
        break;
      default:
        this.statusBar.backgroundColorByHexString('#000000');
        this.statusBar.styleDefault();
        this.statusBar.styleLightContent();
        break;

    }
  }

  getLocalDeviceToken() : string{
    return localStorage.getItem('deviceToken');
  }

  setLocalDeviceToken(deviceToken: string){
    localStorage.setItem('deviceToken', deviceToken);
  }

  getPlatformName(): string {
    return this.platform.is('android') ? 'ANDROID' : this.platform.is('ios') ? 'IOS' : 'ANDROID';
  }

  getAlertStatus(): string {
    return localStorage.getItem('isAlertEnabled')? localStorage.getItem('isAlertEnabled'): '';
  }
  
  setAlertStatus(value: string) {
    localStorage.setItem('isAlertEnabled', value);
  }
  
  getAlertIds() {
    return this.alertIds;
  }

  setAlertIds(alertIds) {
    this.alertIds = alertIds;
  }
}
