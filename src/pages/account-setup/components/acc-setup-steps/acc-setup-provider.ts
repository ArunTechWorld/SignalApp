import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SharedProvider } from '../../../../providers/shared/shared';
import { LoginProvider } from '../../../../pages/login/login.provider';
import { ENV } from '../../../../environments/environment';
import { SharedAPIProvider } from '../../../../providers/shared/sharedAPI';
import { Push, PushObject, PushOptions } from '@ionic-native/push';

/*first-time-account-setup-steps
  Generated class for the LoginProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AccSetupProvider {
  public Carname;
  public authorizationToken;
  public deviceDetails;
  public accRequestObj;
  constructor(public http: HttpClient, public sharedProvider: SharedProvider, private loginProvider: LoginProvider,
    public sharedAPIProvider: SharedAPIProvider, private push: Push, private platform: Platform) {
  }

  getdevicedetails(authToken) {
    this.authorizationToken = authToken;
    if (this.deviceDetails) {
      return new Promise((resolve, reject) => {
        resolve(this.deviceDetails);
      });
    }
    else {
      return new Promise((resolve, reject) => {
        this.sharedProvider.showBusyIndicator();
        this.http.get(ENV.apiUrl + 'devices', {
          headers: new HttpHeaders().set('authorization', authToken),
        })
          // tslint:disable-next-line:ter-arrow-parens
          .subscribe(devicedetailres => {
            this.Carname = devicedetailres;
            // this.devicedetails();

            resolve(devicedetailres);
            this.sharedProvider.hideBusyIndicator();
          }, (err) => {
            reject(err);
            this.sharedProvider.hideBusyIndicator();
          });
      });
    }
  }
  setDeviceDetails(details) {
    this.deviceDetails = details;
  }
  userdetails() {
    return new Promise((resolve, reject) => {
      this.sharedProvider.showBusyIndicator();
      this.http.get(ENV.apiUrl + 'users', {
        headers: new HttpHeaders().set('authorization', this.authorizationToken),
      })
        // tslint:disable-next-line:ter-arrow-parens
        .subscribe(userdetailres => {
          //         this.Carname=devicedetailres;
          this.usersdata(userdetailres);

          resolve(userdetailres);
          this.sharedProvider.hideBusyIndicator();
        }, (err) => {
          reject(err);
          this.sharedProvider.hideBusyIndicator();
        });
    });

  }
  setAccsetupRequestObj(obj){
    console.log("ressssssssssss");
    console.log(obj);
    this.accRequestObj=obj;
  }
  getAccsetupRequestObj(){
    return this.accRequestObj;
  }
  usersdata(userdetailres) {

  }
  updatedetails(user) {
    console.log('userobject>>>>' + user);
    const userInfo = this.sharedAPIProvider.getUserInfo();//userInfo.response.authToken
    this.authorizationToken=(this.authorizationToken)?this.authorizationToken:userInfo.response.authToken;
    return new Promise((resolve, reject) => {
      this.sharedProvider.showBusyIndicator();

      // const user = { user };
      this.http.put(ENV.apiUrl + `users/${user.id}`, { user }, {
        headers: new HttpHeaders().set('authorization', this.authorizationToken),
      })
        // tslint:disable-next-line:ter-arrow-parens
        .subscribe(userdetailres => {
          //         this.Carname=devicedetailres;
          this.usersdata(userdetailres);

          resolve(userdetailres);
          
          this.sharedProvider.hideBusyIndicator();
        }, (err) => {
          reject(err);
          this.sharedProvider.hideBusyIndicator();
        });
    });

  }

  updateCarDetails(carDetail){
    return new Promise((resolve, reject) => {
      this.sharedProvider.showBusyIndicator();
      this.http.put(ENV.apiUrl + `assets/${carDetail.id}`, { asset: carDetail }, {
        headers: new HttpHeaders().set('authorization', this.authorizationToken),
      })
        .subscribe(carDetailRes => {
          console.log(carDetailRes);
          resolve(carDetailRes);
          this.sharedProvider.hideBusyIndicator();
        }, (err) => {
          reject(err);
          this.sharedProvider.hideBusyIndicator();
        });
    });
  }
  
  updateTnc(authToken){
    return new Promise((resolve, reject) => {
      this.sharedProvider.showBusyIndicator();
      this.http.post(ENV.apiUrl + 'eula/accept','', {
        headers: new HttpHeaders().set('authorization', authToken),
      }).subscribe(res => {
        resolve(res);
        this.sharedProvider.hideBusyIndicator();
      }, (err) => {
        reject(err);
        this.sharedProvider.hideBusyIndicator();
      })
    });
  }

  TncFormat(tncUrl){
    return new Promise((resolve, reject) => {
      this.sharedProvider.showBusyIndicator();
      this.http.get(tncUrl, {
        headers: new HttpHeaders().set('Content-Type', 'application/json'),
      }).subscribe(res => {
        
        resolve(res);
        this.sharedProvider.hideBusyIndicator();
      }, (err) => {
        reject(err);
        this.sharedProvider.hideBusyIndicator();
      })
    });

  }

}
