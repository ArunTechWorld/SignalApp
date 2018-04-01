import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SharedProvider } from '../../providers/shared/shared';
import { ENV } from '../../environments/environment';
import * as _ from 'lodash';
import { SharedAPIProvider } from '../../providers/shared/sharedAPI';

@Injectable()
export class CarListProvider {
  public authorizationToken;
  public carList;
  private authToken;
  // tslint:disable-next-line:member-ordering
  constructor(public http: HttpClient, public sharedProvider: SharedProvider, private sharedAPIProvider: SharedAPIProvider) {
    this.authToken = sharedAPIProvider.getUserInfo().response.authToken;
  }

  getUsers(authToken) {
    this.authorizationToken = authToken;
    this.sharedProvider.showBusyIndicator();
    return new Promise((resolve, reject) => {
      this.http.get(ENV.apiUrl + 'users', {
        headers: new HttpHeaders().set('authorization', authToken).set('Content-Type','application/json'),
      }).subscribe((res) => {
        resolve(res);
        // this.sharedProvider.hideBusyIndicator();
      },           (err) => {
        reject(err);
        this.sharedProvider.hideBusyIndicator();
      });
    });
  }

  getUser(authToken, userId) {
    this.authorizationToken = authToken;
    return new Promise((resolve, reject) => {
      this.http.get(ENV.apiUrl + 'users/' + userId, {
        headers: new HttpHeaders().set('authorization', authToken),
      }).subscribe((res) => {
        resolve(res);
      },           (err) => {
        reject(err);
      });
    });
  }

  updateAsset(asset) {
    const authToken = this.sharedAPIProvider.getUserInfo().response.authToken;
    this.sharedProvider.showBusyIndicator();
    return new Promise((resolve, reject) => {
      this.http.put(ENV.apiUrl + `assets/${asset.id}`, { asset }, {
        headers: new HttpHeaders().set('authorization', authToken),
      }).subscribe((carDetailRes) => {
        resolve(carDetailRes);
        this.sharedProvider.hideBusyIndicator();
      },           (err) => {
        reject(err);
        this.sharedProvider.hideBusyIndicator();
      });
    });
  }

  getAllAlerts() {
    const authToken = this.sharedAPIProvider.getUserInfo().response.authToken;
    this.sharedProvider.showBusyIndicator();
    return new Promise((resolve, reject) => {
      this.http.get(ENV.apiUrl + 'alerts', {
        headers: new HttpHeaders().set('authorization', authToken),
      }).subscribe((res) => {
        resolve(res);
        this.sharedProvider.hideBusyIndicator();
      },           (err) => {
        reject(err);
        this.sharedProvider.hideBusyIndicator();
      });
    });
  }

  updateNotificationSetting(requestObj, alertId, alertName) {
    const authToken = this.sharedAPIProvider.getUserInfo().response.authToken;
    console.log('received following setting info to update'); console.log(requestObj);
    this.sharedProvider.hideBusyIndicator();
    return new Promise((resolve, reject) => {
      this.sharedProvider.showBusyIndicator();
      this.http.put(ENV.apiUrl + 'alerts/update/' + alertId, requestObj, {
        headers: new HttpHeaders().set('authorization', authToken),
      }).subscribe((res) => {
        resolve(res);
        this.sharedProvider.hideBusyIndicator();
      },           (err) => {
        reject(err);
        this.sharedProvider.hideBusyIndicator();
      });
    });
  }

  createAlert(userInfo, zoneId, esn, email) {
    const authToken = this.sharedAPIProvider.getUserInfo().response.authToken;
    const localDeviceToken = this.sharedProvider.getLocalDeviceToken();
    const requestObj = {
      userId: userInfo.userId,
      alertKey: 'SDCTC_IZN_ALERT',
      deviceEsn: esn,
      deviceId: userInfo.deviceId,
      geozoneId: zoneId,
      actionType: 'MOBILE_PUSH',
      platform: this.sharedProvider.getPlatformName(),
      dealerEmail: email,
      // tslint:disable-next-line:max-line-length
      deviceToken: localDeviceToken,
      status: userInfo.state ? 'Enabled' : 'Disabled',
    };
    this.sharedProvider.showBusyIndicator();
    return new Promise((resolve, reject) => {
      this.http.post(ENV.apiUrl + 'alerts/createsingle?alertType=geozone', requestObj, {
        headers: new HttpHeaders().set('authorization', authToken),
      })
        .subscribe(
          (res) => {
            resolve(res);
            this.sharedProvider.hideBusyIndicator();
          },
          (err) => {
            reject(err);
            this.sharedProvider.hideBusyIndicator();
          });
    });
  }

  getDevice(deviceId, authToken) {
    this.sharedProvider.showBusyIndicator();
    return new Promise((resolve, reject) => {
      this.http.get(ENV.apiUrl + 'devices/' + deviceId, {
        headers: new HttpHeaders().set('authorization', authToken),
      }).subscribe(
        (res) => {
          resolve(res);
        },
        (err) => {
          reject(err);
        });
    });
  }

  updateSpeedAlert(assetId, changeToStatus) {
    return new Promise((resolve, reject) => {
      this.http.put(ENV.apiUrl + 'assets/' + assetId + '/speed/' + changeToStatus, null, {
        headers: new HttpHeaders().set('authorization', this.authToken),
      }).subscribe((res) => {
        resolve(res);
      },           (err) => {
        reject(err);
      });
    });
  }

  updateSpeedLimit(assetId, maxspeed) {
    const requestBody = { speedThreshold: maxspeed };
    return new Promise((resolve, reject) => {
      this.http.post(ENV.apiUrl + 'assets/' + assetId + '/speed', requestBody, {
        headers: new HttpHeaders().set('authorization', this.authToken),
      }).subscribe((res) => {
        resolve(res);

      },           (err) => {
        reject(err);
      });
    });
  }

  createAlertForUser(requestObj, alertName) {
    const authToken = this.sharedAPIProvider.getUserInfo().response.authToken;
    this.sharedProvider.showBusyIndicator();
    return new Promise((resolve, reject) => {
      this.http.post(ENV.apiUrl + 'alerts/createsingle?alertType=' + alertName.toLowerCase(), requestObj, {
        headers: new HttpHeaders().set('authorization', authToken),
      })
        .subscribe(
          (res) => {
            resolve(res);
            this.sharedProvider.hideBusyIndicator();
          },
          (err) => {
            reject(err);
            this.sharedProvider.hideBusyIndicator();
          });
    });
  }
}
