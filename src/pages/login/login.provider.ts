import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable  , EventEmitter} from '@angular/core';
import { SharedProvider } from '../../providers/shared/shared';
import { SharedAPIProvider } from '../../providers/shared/sharedAPI';
import { LoadingController , ActionSheetController, Events } from 'ionic-angular';
import { ENV } from '../../environments/environment';
import { LoginComponent } from '../login/login';
/*
  Generated class for the LoginProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LoginProvider {
  public userDetails;
  constructor(public http: HttpClient, public sharedProvider: SharedProvider, public actionSheetCtrl: ActionSheetController,
              public events: Events, public sharedAPIProvider: SharedAPIProvider,
              ) {
  }

  login(requestObj) {
    this.sharedProvider.setAlertIds('');
    return new Promise((resolve, reject) => {
      // this.sharedProvider.showBusyIndicator();
      this.http.post(ENV.apiUrl + 'login', requestObj, {
        headers: new HttpHeaders().set('Content-Type', 'application/json'),
      })
        .subscribe((res) => {
          resolve(res);
          // this.sharedProvider.hideBusyIndicator();
        },         (err) => {
          reject(err);
         // this.sharedProvider.hideBusyIndicator();
        });
    });
  }
  setUserInfo(logInUserInfo) {
    this.userDetails = logInUserInfo;
  }
  getUserInfo() {
    return  this.userDetails;
    // return this.userDetails;
  }
  getPasswordRules() {
    const passwordRules = [
      {
        id: 1,
        description: 'Must be at least 8 characters but no more than 32',
        accomplished: true,
        isValidFn: (password, userName, email) => {
          return password.length >= 8;
        },
      },
      {
        id: 2,
        description: 'Must not contain your user name',
        accomplished: true,
        isValidFn: (password, userName, email) => {
          return password.search(new RegExp(userName, 'i')) < 0;
        },
      },
      {
        id: 3,
        description: 'Must not contain your email address',
        accomplished: true,
        isValidFn: (password, userName, email) => {
          return password.search(new RegExp(email, 'i')) < 0;
        },
      },
      {
        id: 4,
        description: 'Must contain at least 1 lower case letter',
        accomplished: true,
        isValidFn: (password, userName, email) => {
          return password.search(new RegExp('([a-z]+)')) >= 0;
        },
      },
      {
        id: 5,
        description: 'Must contain at least 1 upper case letter',
        accomplished: true,
        isValidFn: (password, userName, email) => {
          return password.search(new RegExp('([A-Z]+)')) >= 0;
        },
      },
      {
        id: 6,
        description: 'Must contain at least 1 special character, but none of the following: \\ * ? " \' % # & /',
        accomplished: true,
        isValidFn: (password, userName, email) => {
          return password.search(new RegExp('([^0-9a-zA-Z]+)')) >= 0 && password.search(new RegExp("[\\*?\"'%&#/]+")) < 0;
        },
      },
      {
        id: 7,
        description: 'Must contain at least 1 number',
        accomplished: true,
        isValidFn: (password, userName, email) => {
          return password.search(new RegExp('([0-9]+)')) >= 0;
        },
      },
      {
        id: 8,
        description: 'First 3 characters must be unique',
        accomplished: true,
        isValidFn: (password, userName, email) => {
          const a = password.split('', 3);
          let h = '';
          let valid = true;
          for (const f in a) {
            if (h.length > 0 && h.indexOf(a[f]) >= 0) {
              valid = false;
              return valid;
            // tslint:disable-next-line:no-else-after-return
            } else {
              h += a[f];
            }
          }
          return valid;
        }

      }];
    const newPasswordRules = [{
      id: 1,
      description: 'Your password must contain minimum of 8 characters and at least one symbol.',
      accomplished: true,
      isValidFn: (password) => {
        return (password.length >= 8 && /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password));
      }
    }];
    return newPasswordRules;
  }
  logOut() {
    const actionSheet = this.actionSheetCtrl.create({
      cssClass: 'signOut-buttons-class',
      buttons: [
        {
          cssClass: 'signOut-buttons-class',
          text: 'Sign Out',
          role: 'destructive',
          handler: () => {
            console.log('Sign Out clicked');
            this.events.publish('user:logout');
            localStorage.removeItem('loginInfo'); // setItem('loginInfo', JSON.stringify(this.userInput));
            // this.accSetupProvider.setDeviceDetails(deviceDetails);
            // this.sharedAPIProvider.setDeviceDetails('');

            // this.sharedProvider.showBusyIndicator();
            this.performLogout(this.userDetails.response.authToken).then((res) => {
              console.log(res); // route back to signout page
              // this.sharedProvider.hideBusyIndicator();
              // this.events.publish('user:logout');

            },                                                           (err) => {
              console.log(err);
              // this.events.publish('user:logout');
              // this.sharedProvider.hideBusyIndicator();

            });
            this.userDetails = '';
            this.sharedAPIProvider.setDeviceDetails('');
          },
        }, {
          cssClass: 'signOut-buttons-class',
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
  performLogout(authToken){
    return new Promise((resolve, reject) => {
      this.http.get(ENV.apiUrl + 'logout?updatetoken=false&appName=suredrive', {
        headers: new HttpHeaders().set('authorization', authToken),
      }).subscribe((res) => {
        resolve(res);
      },           (err) => {
        reject(err);
      });
    });
  }

  forgotPassword(email) {
    return new Promise((resolve, reject) => {
      this.http.get(ENV.apiUrl + 'users/forgotpassword?username=' + email, {
      }).subscribe((res) => {
        resolve(res);
      },           (err) => {
        reject(err);
      });
    });
  }

  enableAlerts(requestObj){
    return new Promise((resolve, reject) => {
      this.http.put(ENV.apiUrl + 'alerts/updatebulk?updatetoken=false&appName=suredrive', requestObj, {
        headers: new HttpHeaders().set('authorization', this.userDetails.response.authToken),
      }).subscribe((res) => {
        resolve(res);
      },           (err) => {
        reject(err);
      });
    });
  }
}
