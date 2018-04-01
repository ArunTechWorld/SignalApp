import { Component, ViewChild, ElementRef, Renderer } from '@angular/core';
import { Slides, IonicPage, NavController, NavParams, AlertController, Nav, Platform } from 'ionic-angular';
import { LoginProvider } from '../../../login/login.provider';
import { CarLocationHomePageComponent } from '../../../car-location-home/car-location-home';
import { AccSetupProvider } from './acc-setup-provider';
import { LoginComponent } from '../../../../pages/login/login';
import { SharedAPIProvider } from '../../../../providers/shared/sharedAPI';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { ENV } from '../../../../environments/environment';
import { SharedProvider } from '../../../../providers/shared/shared';
import { PushNotificationsProvider } from '../../../../providers/push-notifications/push-notifications';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
/**
 * Generated class for the FirstTimeAccountSetupStepsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */

@Component({
  selector: 'acc-setup-steps',
  templateUrl: 'acc-setup-steps.html',
})
export class AccSetupStepsComponent {
  userobj: any;
  public password: '';
  public disableNextBtn = false;
  public stepImage;
  public stepID;
  public errorMessage;
  public rules;
  public userobject: any;
  public procedeAccSetupHideDiv = false;
  public Carname: any;
  public res: any;
  public username: String;
  public procedeAccSetup = false;
  public errorMessageInput = false;
  public passwordType = 'password';
  public assetDetail: any;
  public assetId: any;
  public carImageSrc: any;
  public loginSecondtimeupdate: any;
  public loginFirsttimeupdate: any;
  public acceptedTnC = false;
  public Url: SafeResourceUrl;
  public iframeUrl;
  public year;
  public make;
  public model;
  public placeHolder;
  public accountSetupInfo = {
    name: {
      firstName: '',
      lastName: '',
    },
    phoneNo: '',
    password: {
      newPassword: '',
      confirmPassword: '',
    },
    justInCase: {
      value: '',
      firstName: '',
      lastName: '',
      phoneNo: '',
    },
    carName: '',
  };
  @ViewChild(Slides) slides: Slides;
  @ViewChild('firstName') firstName;
  @ViewChild('phoneNumber') phoneNumber;
  @ViewChild('NewPassword') NewPassword;
  @ViewChild('justInCasefirstName') justInCasefirstName;
  @ViewChild('carName') carName;


  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public loginProvider: LoginProvider,
    public accountSetupProvider: AccSetupProvider,
    public sharedAPIProvider: SharedAPIProvider,
    public navParams: NavParams,
    public platform: Platform,
    public push: Push,
    public element: ElementRef,
    public renderer: Renderer,
    public sharedProvider: SharedProvider,
    public pushNotificationsProvider: PushNotificationsProvider,
    private sanitizer: DomSanitizer,
  ) {
    this.rules = this.loginProvider.getPasswordRules();
    this.iframeUrl = this.sharedAPIProvider.getUserInfo().response.eulaUrl;
    console.log(this.iframeUrl);
    this.Url = sanitizer.bypassSecurityTrustResourceUrl(this.iframeUrl);
  }
  private tempVar = false;
  private authToken;
  ngAfterViewInit() {
    this.loadDeviceDetails();
    const platformHeight = this.platform.height() - 210;
    const openingSlider = this.element.nativeElement.querySelector('#termsFrame');
    this.renderer.setElementStyle(openingSlider, 'height', platformHeight + 'px');
  }

  loadDeviceDetails() {
    this.initializeSteps();
    this.res = this.loginProvider.getUserInfo();
    this.username = this.res.response.user.firstName;
    this.accountSetupInfo.name.firstName = this.res.response.user.firstName;
    this.accountSetupInfo.name.lastName = this.res.response.user.lastName;
    this.accountSetupInfo.phoneNo = this.phoneFormatter(this.res.response.user.phoneNumbers[0] && this.res.response.user.phoneNumbers[0].phoneNumber);
    if (this.res.response.user.extendedAttribute && this.res.response.user.extendedAttribute.value) {
      this.accountSetupInfo.justInCase.value = this.res.response.user.extendedAttribute.value;
    }
    if (this.accountSetupInfo.justInCase && this.accountSetupInfo.justInCase.value) {
      const justIncaseJson = JSON.parse(this.accountSetupInfo.justInCase.value);
      if (justIncaseJson.EmergencyContact) {
        this.accountSetupInfo.justInCase.firstName = justIncaseJson.EmergencyContact.firstName;
        this.accountSetupInfo.justInCase.lastName = justIncaseJson.EmergencyContact.lastName;
        this.accountSetupInfo.justInCase.phoneNo = this.phoneFormatter(justIncaseJson.EmergencyContact.phone);
      }
    }
    this.authToken = this.res.response.authToken;


    this.disableNextBtnFunction(0);
    this.accountSetupProvider.getdevicedetails(this.authToken).then((res) => {
      // this.sharedAPIProvider.setDeviceDetails(res);
      this.devicedetails(res);
      this.getuserdetails();
      this.placeHolder = this.year + ' ' + this.make + ' ' + this.model;
    },                                                              (err) => {
      // this.loginApiFailureRes(err);
    });
  }

  showPassword() {
    this.passwordType = (this.passwordType === 'text') ? this.passwordType = 'password' : this.passwordType = 'text';
  }

  initializeSteps() {
    this.stepImage = 'Your_Name_Icon.svg';
    this.stepID = 0;
    this.slides.lockSwipes(true);
    // this.firstName.setFocus();
  }
  accoutSetupSlideChanged(id) {
    this.slides.lockSwipes(false);
    this.errorMessageInput = false;
    this.errorMessage = '';
    let stepID = (id === '1') ? this.slides.getActiveIndex() + 1 : this.slides.getActiveIndex() - 1;
    if (stepID > this.slides.length() - 1) this.stepID = this.slides.length();
    if (stepID < 0) { this.stepID = 0; this.procedeAccSetup = false; this.procedeAccSetupHideDiv = false; }
    console.log(this.stepID);
    switch (stepID) {
      case 0:
        this.stepID = stepID;
        this.slides.slideTo(0);
        this.stepImage = 'Your_Name_Icon.svg';
        this.disableNextBtnFunction(0);
        if (!this.accountSetupInfo.name.firstName) {
          setTimeout(() => {
            this.firstName.setFocus();
          },         150);
        }
        break;
      case 1:
        this.updatingyourname().then((res) => {

          if (res) {
            this.slides.lockSwipes(false);
            this.stepID = stepID;
            this.slides.slideTo(1);
            this.slides.lockSwipes(true);
            this.stepImage = 'PhoneNumber_Icon.svg';
            this.disableNextBtnFunction(1);
            if (!this.accountSetupInfo.phoneNo) {
              setTimeout(() => {
                this.phoneNumber.setFocus();
              },         150);
            }
          }
          // this.phoneNumber.setFocus();
        },
        );
        break;
      case 2:
        this.updatingYourPhoneNumber().then((res) => {
          if (res) {
            this.slides.lockSwipes(false);
            this.stepID = stepID;
            this.slides.slideTo(2);
            this.slides.lockSwipes(true);
            this.stepImage = 'Password_Icon.svg';
            this.disableNextBtnFunction(2);
            if (!this.accountSetupInfo.password.newPassword) {
              setTimeout(() => {
                this.NewPassword.setFocus();
              },         150);
            }
          }
        },
        );
        break;
      case 3:
        if (this.validatePassword()) {
          this.updatingYourPassword().then((res) => {
            if (res) {
              this.slides.lockSwipes(false);
              this.stepID = stepID;
              this.slides.slideTo(3);
              this.slides.lockSwipes(true);
              this.stepImage = 'Emergency_Contact_Icon.svg';
              this.disableNextBtnFunction(3);
              if (!this.accountSetupInfo.justInCase.firstName) {
                setTimeout(() => {
                  this.justInCasefirstName.setFocus();
                },         150);
              }

            }
          },
          );
        }
        break;
      case 4:
        if (this.accountSetupInfo.justInCase.phoneNo) {
          this.updatingEmergencycontact().then((res) => {
            if (res) {
              this.slides.lockSwipes(false);
              this.stepID = stepID;
              this.slides.slideTo(4);
              this.slides.lockSwipes(true);
              this.stepImage = 'Notification_Icon.svg';
            }
          });

        } else {
          this.slides.lockSwipes(false);
          this.stepID = stepID;
          this.slides.slideTo(4);
          this.slides.lockSwipes(true);
          this.stepImage = 'Notification_Icon.svg';
        }


        break;
      case 5:
        this.stepID = stepID;
        this.slides.slideTo(5);
        this.stepImage = 'car.jpg';
        if (!this.accountSetupInfo.carName) {
          setTimeout(() => {
            this.carName.setFocus();
          },         150);
        }
        break;
      case 6:
        this.updateCarName().then((res) => {
          if (res) {
            this.slides.lockSwipes(false);
            this.stepID = stepID;
            this.slides.slideTo(6);
            this.slides.lockSwipes(true);
          }
        },
        );
        break;
      case 7:
        this.stepID = stepID;


        break;
      default: break;
    }
    this.slides.lockSwipes(true);
    console.log(this.accountSetupInfo);
  }

  contentScroll(event) {
    console.dir(event);
    if (event.directionY === 'down' && event.scrollTop === 689) {
      setTimeout(() => {
        this.tempVar = true;
        console.log('scrolldone' + this.tempVar);
      },         1000);
      // return true;;
    } else {
    }
  }

  accountSetupSuccess() {
    setTimeout(() => {
      this.navCtrl.setRoot(CarLocationHomePageComponent);
    },         500);
  }

  disableNextBtnFunction(val) {
    this.errorMessageInput = false;
    this.errorMessage = '';
    switch (val) {
      case 0: this.disableNextBtn = (!this.accountSetupInfo.name.lastName || !this.accountSetupInfo.name.firstName) ? true : false;
        break;
      case 1: this.disableNextBtn = (!this.accountSetupInfo.phoneNo) ? true : false;
        break;
      case 2: this.disableNextBtn = (!this.accountSetupInfo.password.newPassword || !this.accountSetupInfo.password.confirmPassword) ? true : false;
        break;
      case 3:
        this.disableNextBtn = (!this.accountSetupInfo.justInCase.firstName && !this.accountSetupInfo.justInCase.lastName && !this.accountSetupInfo.justInCase.phoneNo) ||
          (this.accountSetupInfo.justInCase.phoneNo.length > 13 && this.accountSetupInfo.justInCase.firstName && this.accountSetupInfo.justInCase.lastName) ? false : true;
        break;
      default: break;
    }
  }
  validatePassword() {
    console.log(this.rules);
    if (this.accountSetupInfo.password.newPassword != this.accountSetupInfo.password.confirmPassword) {
      this.errorMessage = 'Your password and confirmation password do not match.';
      this.errorMessageInput = true;
      this.disableNextBtn = true;
      return false;
    }
    this.rules.forEach(rule => rule.accomplished = true);
    const notAccomplishedRules = this.validatePasswordRules(this.accountSetupInfo.password.newPassword, 'AA', 'aa@com');//userCredentials.username, user.email);
    if (!notAccomplishedRules.length) {
      return true;
    }
    this.errorMessage = notAccomplishedRules[0].description;
    this.errorMessageInput = true;
    this.disableNextBtn = true;
    return false;
  }

  validatePasswordRules(password, userName, email) {
    const notAccomplishedRules = [];

    for (let i = 0; i < this.rules.length; i += 1) {
      const rule = this.rules[i];
      rule.accomplished = rule.isValidFn(password, userName, email);
      !rule.accomplished && notAccomplishedRules.push(rule);
    }

    return notAccomplishedRules;
  }
  updatingyourname() {
    this.res = this.loginProvider.getUserInfo();
    const tempVar = this.res.response.user || this.res.response.results[0].user;
    const response = {
      response: {
        results: [tempVar],
      },
    };
    this.accountSetupProvider.setAccsetupRequestObj(response);
    const loginResObj = this.accountSetupProvider.getAccsetupRequestObj();
    return new Promise((resolve, reject) => {
      if (this.accountSetupInfo.name.firstName !== loginResObj.response.results[0].firstName || this.accountSetupInfo.name.lastName !== loginResObj.response.results[0].lastName) {
        this.userobject = loginResObj.response.results[0];
        this.userobject.firstName = this.accountSetupInfo.name.firstName;
        this.userobject.lastName = this.accountSetupInfo.name.lastName;
        return this.accountSetupProvider.updatedetails(this.userobject).then((res) => {
          this.loginProvider.setUserInfo(res);
          resolve(true);
        },                                                                   (err) => {
          this.apiFailureRes(err);
          resolve(false);
        });
      }
      resolve(true);
    });
  }

  updatingYourPhoneNumber() {
    this.res = this.loginProvider.getUserInfo();
    const tempVar = this.res.response.user || this.res.response.results[0].user;
    const response = {
      response: {
        results: [tempVar],
      },
    };
    this.accountSetupProvider.setAccsetupRequestObj(response);
    const loginResObj = this.accountSetupProvider.getAccsetupRequestObj();
    console.log(loginResObj);
    const prevPhoneNo = (loginResObj.response.results[0].phoneNumbers.length > 0) ? loginResObj.response.results[0].phoneNumbers[0].phoneNumber : '';
    return new Promise((resolve, reject) => {
      if (this.accountSetupInfo.phoneNo !== prevPhoneNo) {
        this.userobject = loginResObj.response.results[0];
        this.userobject.phoneNumbers = [];
        this.userobject.phoneNumbers.push({ 'phoneNumber': this.accountSetupInfo.phoneNo, 'phoneType': 'WORK' });
        this.userobject.lastName = this.accountSetupInfo.name.lastName;
        return this.accountSetupProvider.updatedetails(this.userobject).then((res) => {
          this.loginProvider.setUserInfo(res);
          resolve(true);
        },                                                                   (err) => {
          this.apiFailureRes(err);
          resolve(false);
        });
      }
      resolve(true);
    });
  }

  updateCarName() {
    return new Promise((resolve, reject) => {
      if (this.Carname && (this.accountSetupInfo.carName !== this.Carname)) {
        this.assetDetail.name = this.accountSetupInfo.carName;
        this.accountSetupProvider.updateCarDetails(this.assetDetail).then((res) => {
          resolve(true);
        },                                                                (err) => {
          this.apiFailureRes(err);
          resolve(false);
        });
      }
      resolve(true);
    });
  }

  updatingYourPassword() {
    this.res = this.loginProvider.getUserInfo();
    const resultreturn = '';
    const tempVar = this.res.response.user || this.res.response.results[0].user;
    const response = {
      response: {
        results: [tempVar],
      },
    };
    this.accountSetupProvider.setAccsetupRequestObj(response);
    const loginResObj = this.accountSetupProvider.getAccsetupRequestObj();
    console.log(loginResObj);
    return new Promise((resolve, reject) => {
      this.userobject = loginResObj.response.results[0];
      this.userobject.password = this.accountSetupInfo.password.confirmPassword;
      this.userobject.passwordUpdated = true;
      return this.accountSetupProvider.updatedetails(this.userobject).then((res) => {
        this.loginProvider.setUserInfo(res);
        resolve(true);
      },                                                                   (err) => {
        this.apiFailureRes(err);
        resolve(false);
      });
    });

  }


  updatingEmergencycontact() {
    this.res = this.loginProvider.getUserInfo();
    const tempVar = (this.res.response && this.res.response.user) ? this.res.response.user : this.res.response.results[0].user;
    // = this.res.response.user || this.res.response.results[0].user;
    const response = {
      response: {
        results: [tempVar],
      },
    };
    this.accountSetupProvider.setAccsetupRequestObj(response);
    const loginResObj = this.accountSetupProvider.getAccsetupRequestObj();
    console.log(loginResObj);
    return new Promise((resolve, reject) => {
      this.userobject = loginResObj.response.results[0];
      let extendedAttribute;
      extendedAttribute = this.userobject.extendedAttribute ? JSON.parse(this.userobject.extendedAttribute.value) : '';
      let emergencyContact = extendedAttribute.EmergencyContact ? extendedAttribute.EmergencyContact : '';
      let isEdited = false;
      if (emergencyContact) {
        if (this.accountSetupInfo.justInCase.firstName !== emergencyContact.firstName) {
          emergencyContact.firstName = this.accountSetupInfo.justInCase.firstName;
          isEdited = true;
        }
        if (this.accountSetupInfo.justInCase.lastName !== emergencyContact.lastName) {
          emergencyContact.lastName = this.accountSetupInfo.justInCase.lastName;
          isEdited = true;
        }
        if (this.accountSetupInfo.justInCase.phoneNo !== emergencyContact.phone) {
          emergencyContact.phone = this.accountSetupInfo.justInCase.phoneNo;
          isEdited = true;
        }
        this.userobject.extendedAttribute.value = JSON.stringify(extendedAttribute);
      } else {
        extendedAttribute.EmergencyContact = '';
        extendedAttribute.EmergencyContact = { firstName: this.accountSetupInfo.justInCase.firstName, lastName: this.accountSetupInfo.justInCase.lastName, phone: this.accountSetupInfo.justInCase.phoneNo };
        this.userobject.extendedAttribute.value = JSON.stringify(extendedAttribute);
        isEdited = true;
      }
      if (isEdited) {
        console.log(this.userobject);
        return this.accountSetupProvider.updatedetails(this.userobject).then((res) => {
          this.loginProvider.setUserInfo(res);
          resolve(true);
        },                                                                   (err) => {
          this.apiFailureRes(err);
          resolve(false);
        });
      }
      resolve(true);
    });
  }

  apiFailureRes(response) {
    this.errorMessageInput = true;
    console.log(response);
    switch (response.status) {
      case 401: this.errorMessage = 'Server is not responding, please try again';
        break;
      case 400: this.errorMessage = 'Bad Request';
        break;
      case 403: this.errorMessage = 'Permission Denied';
        break;
      case 502: this.errorMessage = 'Internal Server Error';
        break;
      case 409: this.errorMessage = 'Server is not responding, please try again';
        break;
      default: this.errorMessage = 'Server is not responding, please try again'; break;
    }
  }
  updatinguserdtails() {

    const loginResObj = this.loginProvider.getUserInfo();
    this.loginFirsttimeupdate = loginResObj.response.user;
    this.userobject = this.loginSecondtimeupdate !== undefined ? this.loginSecondtimeupdate : this.loginFirsttimeupdate;
    this.userobject.firstName = this.accountSetupInfo.name.firstName;
    this.userobject.lastName = this.accountSetupInfo.name.lastName;
    this.userobject.phoneNumbers = [{
      extension: null,
      phoneNumber: this.accountSetupInfo.phoneNo,
      phoneType: 'WORK',
    }];
    this.userobject.password = this.accountSetupInfo.password.confirmPassword;
    this.userobject.passwordUpdated = true;
    // const object = this.userobject;
    if (this.loginFirsttimeupdate != this.loginSecondtimeupdate) {
      this.accountSetupProvider.updatedetails(this.userobject).then((res) => {
        // console.log("sheshathri response"+res);
        // console.log("sheshathri response1"+res.response.results[0].user);
        this.updateLoginVal(res);
      },                                                            (err) => {
        // this.loginApiFailureRes(err);
      });
    }

  }
  updateLoginVal(res) {
    this.loginSecondtimeupdate = res.response.results[0].user;
  }

  displayPhoneNumber() {
    // this.accountSetupInfo.carName = this.accountSetupProvider.devicedetails();
  }

  getuserdetails() {
    this.accountSetupProvider.userdetails();
  }
  moveToPreviousPage() {
    this.navCtrl.push(LoginComponent);
  }

  logOut() {
    this.loginProvider.logOut();
  }
  start() {
    this.procedeAccSetup = true;
    setTimeout(() => {
      this.procedeAccSetupHideDiv = true;
    },         1000);
  }

  devicedetails(devicedetailres) {
    this.accountSetupProvider.setDeviceDetails(devicedetailres);
    for (let j = 0; j < devicedetailres.response.results.length; j++) {
      if (devicedetailres.response.results[j].asset) {
        this.assetDetail = devicedetailres.response.results[j].asset;
        this.Carname = devicedetailres.response.results[j].asset.name;
        this.year = devicedetailres.response.results[j].asset.year;
        this.make = devicedetailres.response.results[j].asset.make;
        this.model = devicedetailres.response.results[j].asset.model;
        this.accountSetupInfo.carName = this.Carname;
        this.carImageSrc = devicedetailres.response.results[j].asset.imageUrl;
        break;
      }
    }
  }

  allowNotifications() {
    let alert = this.alertCtrl.create({
      title: '“LoJack” Would Like to Send You Notifications',
      message: 'Notifications may include alerts, sounds, and icon badges. These can be configured in Settings.',
      buttons: [
        {
          text: 'Don’t Allow',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
            this.sharedAPIProvider.updateAlertPref(this.authToken, false).then((res)=>{console.log(res)}, (err)=>{console.log(err)});
            this.accoutSetupSlideChanged('1');
          },
        },
        {
          text: 'Allow',
          handler: () => {
            this.platform.ready().then(() => {
              this.pushNotificationsProvider.initPushNotification(true, true);
            });
            this.accoutSetupSlideChanged('1');
          },
        },
      ],
    });
    alert.present();
  }
  /**
 * formats phone number
 */
  formatPhoneNumber = (event: any) => {
    this.disableNextBtn = true;
    const code = event.which ? event.which : event.keyCode;
    const phNo = event.target.value;
    if (code !== 8 && code !== 37 && code !== 39 && code !== 46) {
      event.target.value = this.phoneFormatter(phNo);
      if (this.accountSetupInfo.phoneNo.length == 14) {
        this.disableNextBtn = false;
      }
    }
  }
  phoneFormatter(phNo) {
    if (undefined == phNo || null == phNo) phNo = '';
    const numbers = phNo.replace(/\D/g, ''),
      char = { 0: '(', 3: ') ', 6: '-' };
    phNo = '';
    for (let i = 0; i < numbers.length; i++) {
      phNo += (char[i] || '') + numbers[i];
    }
    return phNo;
  }

  checkTnC() {
    this.acceptedTnC = this.loginProvider.getUserInfo().response.user.eulaAccepted;
  }

  acceptTnC() {
    this.accountSetupProvider.updateTnc(this.authToken).then((res) => {
      this.loginProvider.setUserInfo(res);
      this.accountSetupSuccess();
    },                                                       (err) => {
      this.apiFailureRes(err);
    });
  }

  termsConditionsPopUp() {
    const alert = this.alertCtrl.create({
      title: 'To use the app, please accept the terms and conditions.',
      buttons: [
        {
          text: 'Decline',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
            this.navCtrl.setRoot(LoginComponent);
          },
        },
        {
          text: 'Accept',
          handler: () => {
            console.log('Buy clicked');
            this.acceptTnC();
          },
        },
      ],
    });
    alert.present();
  }

}
