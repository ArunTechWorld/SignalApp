import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController, ModalController, Slides, IonicPage, NavController, NavParams, AlertController, Nav, Platform } from 'ionic-angular';
import { NotificationRecievedComponent } from '../../components/notification-recieved/notification-recieved';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { SharedProvider } from '../shared/shared';
import { SharedAPIProvider } from '../shared/sharedAPI';
import { ENV } from '../../environments/environment';
/*
  Generated class for the PushNotificationsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
 export class PushNotificationsProvider {

  constructor(private http: HttpClient,
              private toastCtrl: ToastController,
              private modalCtrl: ModalController,
              private push: Push,
              private platform: Platform,
              private alertCtrl: AlertController,
              private sharedProvider: SharedProvider,
              private sharedAPIProvider: SharedAPIProvider) {
    console.log('Hello PushNotificationsProvider Provider');
  }
  private loggedInUser: any;

  public showNotification(notificationData) {
    const profileModal = this.modalCtrl.create(NotificationRecievedComponent, { currentNotification: notificationData }, { cssClass: 'pushnotifications-popup' });
    profileModal.present();
  }
  hideNotification() {
  }

  initPushNotification(listenToNotification: boolean, firstTimeAllow: boolean) {

    this.loggedInUser = this.sharedAPIProvider.getUserInfo();
    console.log('cheking device token in user info -> '); console.log(this.loggedInUser);

    if (!this.platform.is('cordova')) {
      console.warn('Push notifications not initialized. Cordova is not available - Run in physical device');
      return;
    }

    this.push.hasPermission().then((res: any) => {
      if (res.isEnabled) {
        console.log('We have permission to send push notifications');
      } else {
        console.log('We do not have permission to send push notifications');
      }
    });

    const options: PushOptions = {
      android: {
        senderID: ENV.SENDER_ID,
        sound: true,
        vibrate: true,
        iconColor: '#343434',
        icon: 'push_notification',
      },
      ios: {
        alert: 'true',
        badge: 'true',
        sound: 'true',
      },
      windows: {},
    };
    const pushObject: PushObject = this.push.init(options);

    const localDeviceToken = this.sharedProvider.getLocalDeviceToken();
    if (firstTimeAllow) {
      pushObject.on('registration').subscribe((data: any) => {
        const generatedDeviceToken = data.registrationId;
        console.log('device token update -> ' + generatedDeviceToken);
        const devicePushRegDetail = {
          platform: this.sharedProvider.getPlatformName(),
          deviceToken: generatedDeviceToken,
          login: true,
        };
        this.subscribePushNotification(devicePushRegDetail, 'update').then((res) => {
          this.sharedProvider.setLocalDeviceToken(generatedDeviceToken);
          this.sharedProvider.setAlertStatus('true');
          console.log('device token updated successfully');
        },                                                                 (err) => {
          console.log('error updating device token');
        });
      });
    } else {
      if (!this.isDeviceTokenInSync(localDeviceToken, this.loggedInUser)) {
        pushObject.on('registration').subscribe((data: any) => {
          const generatedDeviceToken = data.registrationId;
          console.log('device token add -> ' + generatedDeviceToken);
          const devicePushRegDetail = {
            platform: this.sharedProvider.getPlatformName(),
            deviceToken: generatedDeviceToken,
            login: true,
          };
          this.subscribePushNotification(devicePushRegDetail, 'add').then((res) => {
            this.sharedProvider.setLocalDeviceToken(generatedDeviceToken);
            this.sharedProvider.setAlertStatus('true');
            console.log('new device token added successfully');
          },                                                              (err) => {
            console.log('error adding new device token');
          });
        });
      }
    }
    if (listenToNotification) {
      this.pushNotificationListener(pushObject);
    }
  }

  pushNotificationListener(pushObject: PushObject) {
    pushObject.on('notification').subscribe((data: any) => {
      this.sharedProvider.setUnreadMessage(true);
      console.log({ message: data });
      // if user using app and push notification comes
      if (data.additionalData.foreground) {
        const translatedMessage = this.sharedProvider.alertKeyMap.get(data.additionalData.alertType);
        let alertMessage = data.message ? data.message : translatedMessage ? translatedMessage : '';
        const alertTime = data.additionalData.eventTime;
        if ('IOS' === this.sharedProvider.getPlatformName().toUpperCase()) {
          alertMessage = data.additionalData.body;
        }
        this.showNotification({
          alertType: data.additionalData.alertType,
          alertDesc: alertMessage,
          eventTime: alertTime,
        });
      } else {
        // if user NOT using app and push notification comes
        // TODO: Your logic on click of push notification when in background
        console.log({ message: data.message });
        console.log('push notification received');
      }
    });

    pushObject.on('error').subscribe(error => console.error('Error with Push plugin' + error));
  }

  isDeviceTokenInSync(deviceToken: string, loggedInUser: any): boolean {
    let flag: boolean;
    if (loggedInUser) {
      if (loggedInUser.response) {
        if (loggedInUser.response.user) {
          if (loggedInUser.response.user.mobilePush) {
            let mobilePush = [];
            flag = false;
            mobilePush = loggedInUser.response.user.mobilePush;
            for (let i = 0; i < mobilePush.length; i = i + 1) {
              let deviceTokens = [];
              deviceTokens = mobilePush[i].deviceIdentifierTokens.toString().split(',');
              console.log(deviceTokens);
              for (let j = 0; j < deviceTokens.length; j = j + 1) {
                if (deviceTokens[j] === deviceToken) {
                  flag = true;
                  break;
                }
              }
              if (flag) {
                break;
              }
            }
          }
        }
      }
    }
    return flag;
  }

  subscribePushNotification(devicePushRegDetail, action) {
    console.log('registering device with following details ->'); console.log(devicePushRegDetail);
    return new Promise((resolve, reject) => {
      this.http.put(ENV.apiUrl + 'alerts/updatebulk?updatetoken=' + action + '&appName=suredrive', devicePushRegDetail, {
        headers: new HttpHeaders().set('authorization', this.loggedInUser.response.authToken),
      }).subscribe((res) => {
        resolve(res);
      },           (err) => {
        reject(err);
      });
    });
  }

}
