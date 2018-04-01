import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import { ENV } from '../../environments/environment';
import { SharedProvider } from '../shared/shared';
import * as _ from 'lodash';

/*
  Generated class for the SharedProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SharedAPIProvider {
  public sharedDeviceData;
  public sharedAssets;
  public userInfo;
  constructor(public http: HttpClient, public loading: LoadingController, public sharedProvider: SharedProvider) {
    console.log('Hello SharedProvider Provider');
  }

  getDeviceDetails(authToken) {
    if (this.sharedDeviceData) {
      return new Promise((resolve, reject) => {
        resolve(this.sharedDeviceData);
      });
    }
    return new Promise((resolve, reject) => {
      // this.sharedProvider.showBusyIndicator();
      this.http.get(ENV.apiUrl + 'assets', {
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

  setDeviceDetails(data) {
    this.sharedDeviceData = data;
  }

  setUserInfo(data) {
    this.userInfo = data;
  }

  getUserInfo() {
    return this.userInfo;
  }

  checktripwireBreach(result) {
    let retvalue = false;
    if (result && result.response && result.response.results && result.response.results.length && result.response.results[0] && result.response.results[0].asset && result.response.results[0].asset.tripwire && result.response.results[0].asset.tripwire.isSet) {
      retvalue = result.response.results[0].asset.tripwire;
    }
    return retvalue;

  }

  getAssets(authToken) {
    return new Promise((resolve, reject) => {
      this.sharedProvider.showBusyIndicator();
      this.http.get(ENV.apiUrl + 'assets', {
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

  getAssetsById(authToken, assetId) {
    return new Promise((resolve, reject) => {
      // this.sharedProvider.showBusyIndicator();
      this.http.get(ENV.apiUrl + 'assets/' + assetId, {
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

  putAssetsById(authToken, assetId, requestBody) {
    return new Promise((resolve, reject) => {
      // this.sharedProvider.showBusyIndicator();
      this.http.put(ENV.apiUrl + 'assets/' + assetId, requestBody, {
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

  setAssets(data) {
    this.sharedAssets = data;
  }

  getErrorMessage = (response) => {
    let errorMsg = '';
    // if (response.error && response.error.response && response.error.response.errors[0]) {
    //   errorMsg = response.error.response.errors[0];
    // } else {
    switch (response.status) {
      case 401: errorMsg = 'Server is not responding, please try again';
        break;
      case 400: errorMsg = 'Bad Request';
        break;
      case 403: errorMsg = 'Permission Denied';
        break;
      case 500: errorMsg = 'Internal Server Error';
        break;
      case 502: errorMsg = 'Internal Server Error';
        break;
      case 409: errorMsg = 'Resource state out-of-date';
        break;
      case 422: errorMsg = 'Email already exists';
        break;
      default: errorMsg = 'Server is not responding, please try again';
        break;
    }
    // }
    return errorMsg;
  }
  resetPassword(password, token) {
    const body = new HttpParams()
    .set('password', password)
    .set('token', token);
    return new Promise((resolve, reject) => {
      this.sharedProvider.showBusyIndicator();
      this.http.post(ENV.apiUrl + 'users/resetpassword', body , {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
      }).subscribe((res) => {
        resolve(res);
        this.sharedProvider.hideBusyIndicator();
      },           (err) => {
        reject(err);
        this.sharedProvider.hideBusyIndicator();
      });
    });
  }

  entityId = (link) => {
    let url = _.isObject(link) ? link.href : link;
    if (url) {
      url = url.substring(url.lastIndexOf('/') + 1);
      if (isNaN(url)) {
        return url;
      }
      return parseInt(url, 10);
    }
  }

  getDeviceById(authToken, deviceId){
    return new Promise((resolve, reject) => {
      this.http.get(ENV.apiUrl + 'devices/'+deviceId, {
        headers: new HttpHeaders().set('authorization', authToken),
      }).subscribe((res) => {
        resolve(res);
      },           (err) => {
        reject(err);
      });
    });
  }

  updateAlertPref(authToken, isAlertEnabled) {
    let requestBody = { "login": isAlertEnabled };
    return new Promise((resolve, reject) => {
      this.http.put(ENV.apiUrl + 'alerts/updatebulk?updatetoken=false&appName=suredrive', requestBody, {
        headers: new HttpHeaders().set('authorization', authToken),
      }).subscribe((res) => {
        resolve(res);
      },           (err) => {
        reject(err);
      });
    });
  }

  getTripwireStatus(assetObj) {
    return assetObj.tripwire && assetObj.tripwire.isSet && assetObj.tripwire.isSet === true ? true : false;
  }

  getAlertSearchableproperties(authToken) {
    return new Promise((resolve, reject) => {
      this.http.get(ENV.apiUrl + 'alerts/searchableproperties', {
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
}
