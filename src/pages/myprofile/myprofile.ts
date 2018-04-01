import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ActionSheetController } from 'ionic-angular';
import { CarLocationHomePageComponent } from '../car-location-home/car-location-home';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { LoginProvider } from '../../pages/login/login.provider';
import { PushNotificationsProvider } from '../../providers/push-notifications/push-notifications';
import { PasswordVerificationComponent } from './password-verification/password-verification';
import { SharedProvider } from '../../providers/shared/shared';
import { SharedAPIProvider } from '../../providers/shared/sharedAPI';
import { AccSetupProvider } from '../../pages/account-setup/components/acc-setup-steps/acc-setup-provider';

/**
 * Generated class for the MyprofilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-myprofile',
  templateUrl: 'myprofile.html',
})
export class MyprofilePage {
  isValidEmail = false;
  @ViewChild('userName') userName;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public actionSheetCtrl: ActionSheetController,
              private loginProvider: LoginProvider,
              public sharedProvider: SharedProvider,
              public sharedAPIProvider: SharedAPIProvider,
              private accSetupProvider: AccSetupProvider,
              private nativePageTransitions: NativePageTransitions,
              private pushNotificationsProvider: PushNotificationsProvider) {
    this.userDetail = null;
  }
  private errorMessageonphone;
  private disableNextBtn = false;
  private disablesaveBtn = false;
  private disablesEmgsaveBtn = false;
  private isAlertEnabled = false;
  private accountSetupInfo = {
    userId: '',
    name: {
      firstName: '',
      lastName: '',
    },
    phoneNo: '',
    email: '',
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
  private preferredCar;
  private isEditProfille = true;
  private authToken;
  private assetImages = [];
  private errorMessageInput = false;
  private errorMessage = '';
  private userDetail;
  private userExtended;
  /* ionViewWillEnter() {
    const options: NativeTransitionOptions = {
      direction: 'right',
      duration: 350,
      slowdownfactor: 1,
      slidePixels: 300,
      iosdelay: 300,
      androiddelay: 350,
      //fixedPixelsTop: 10,
      fixedPixelsBottom: 200,
    };

    this.nativePageTransitions.slide(options)
      .then(onSuccess => console.log(onSuccess))
      .catch(onError => console.log('error'));
  } */
  ionViewDidLoad() {
    console.log('ionViewDidLoad MyprofilePage');
    this.userDetail = this.loginProvider.getUserInfo().response.user || this.loginProvider.getUserInfo().response.results[0].user;
    console.log(this.userDetail);
    this.accountSetupInfo.name.firstName = this.userDetail.firstName ? this.userDetail.firstName : '';
    this.accountSetupInfo.name.lastName = this.userDetail.lastName ? this.userDetail.lastName : '';
    this.accountSetupInfo.password.newPassword = '********';
    this.accountSetupInfo.phoneNo = this.userDetail.phoneNumbers[0] ? this.userDetail.phoneNumbers[0].phoneNumber : '';
    this.accountSetupInfo.email = this.userDetail.email ? this.userDetail.email : '';
    this.authToken = this.sharedAPIProvider.getUserInfo().response.authToken;
    this.sharedAPIProvider.getAssets(this.authToken).then((res) => {
      this.setImageData(res);
    },                                                    (err) => {
      console.log(err);
    });

    this.accountSetupInfo.userId = this.userDetail.extendedAttribute ? JSON.parse(this.userDetail.extendedAttribute.value).preferredCar : '';
    this.userExtended = this.userDetail.extendedAttribute ? JSON.parse(this.userDetail.extendedAttribute.value).EmergencyContact : '';
    this.accountSetupInfo.justInCase.firstName = this.userExtended && this.userExtended.firstName ? this.userExtended.firstName : '';
    this.accountSetupInfo.justInCase.lastName = this.userExtended && this.userExtended.lastName ? this.userExtended.lastName : '';
    this.accountSetupInfo.justInCase.phoneNo = this.userExtended && this.userExtended.phone ? this.userExtended.phone : '';

    this.isAlertEnabled = this.sharedProvider.getAlertStatus() === 'true' ? true : false ;
  }

  disableSaveBtnFunction() {
    this.disableNextBtn = (this.accountSetupInfo.name.lastName.length === 0 || this.accountSetupInfo.name.firstName.length === 0
      || this.accountSetupInfo.justInCase.firstName.length === 0 || this.accountSetupInfo.justInCase.lastName.length === 0) ? true : false;

  }

  setImageData(data) {
    this.assetImages = [];
    for (let i = 0; i < data.response.results.length; i++) {
      if (data.response.results[i].asset.devices) {
        this.assetImages.push({ userId: data.response.results[i].asset.id, imageUrl: data.response.results[i].asset.imageUrl });
      }
    }
  }

  myprofiletohomepage() {
    this.navCtrl.pop();
    // this.navCtrl.setRoot(CarLocationHomePageComponent);
    // const options: NativeTransitionOptions = {
    //   direction: 'right',
    //   duration: 300,
    //   iosdelay: 200,
    //   androiddelay: 150,
    // };
    // this.nativePageTransitions.slide(options);
  }


  // tslint:disable-next-line:function-name
  MyprofiletoverifyPass() {
    // const options: NativeTransitionOptions = {
    //   direction: 'left',
    //   duration: 300,
    //   iosdelay: 200,
    //   androiddelay: 150,
    // };
    // this.nativePageTransitions.slide(options);
    // this.navCtrl.setRoot(PasswordVerificationComponent);
    this.navCtrl.push(PasswordVerificationComponent);
  }

  editMode() {
    this.isEditProfille = false;
  }

  saveMode() {
    this.isEditProfille = true;
    let isEdited = false;
    if (this.accountSetupInfo.name.firstName !== this.userDetail.firstName) {
      this.userDetail.firstName = this.accountSetupInfo.name.firstName;
      isEdited = true;
    }
    if (this.accountSetupInfo.name.lastName !== this.userDetail.lastName) {
      this.userDetail.lastName = this.accountSetupInfo.name.lastName;
      isEdited = true;
    }
    if (this.accountSetupInfo.phoneNo !== this.userDetail.phoneNumbers[0].phoneNumber) {
      this.userDetail.phoneNumbers[0].phoneNumber = this.accountSetupInfo.phoneNo;
      this.userDetail.phoneNumbers[0].phoneType = 'CELL';
      isEdited = true;
    }
    if (this.accountSetupInfo.email !== this.userDetail.email) {
      this.userDetail.email = this.accountSetupInfo.email;
      isEdited = true;
    }

    this.userExtended = this.userDetail.extendedAttribute ? JSON.parse(this.userDetail.extendedAttribute.value).EmergencyContact : '';
    this.preferredCar = this.userDetail.extendedAttribute ? JSON.parse(this.userDetail.extendedAttribute.value).preferredCar : '';

    if (this.userExtended) {
      if (this.accountSetupInfo.justInCase.firstName !== this.userExtended.firstName) {
        this.userExtended.firstName = this.accountSetupInfo.justInCase.firstName;
        isEdited = true;
      }
      if (this.accountSetupInfo.justInCase.lastName !== this.userExtended.lastName) {
        this.userExtended.lastName = this.accountSetupInfo.justInCase.lastName;
        isEdited = true;
      }
      if (this.accountSetupInfo.justInCase.phoneNo !== this.userExtended.phone) {
        this.userExtended.phone = this.accountSetupInfo.justInCase.phoneNo;
        isEdited = true;
      }
    } else {
      this.userExtended = { firstName: this.accountSetupInfo.justInCase.firstName, lastName: this.accountSetupInfo.justInCase.lastName, phone: this.accountSetupInfo.justInCase.phoneNo };
      isEdited = true;
    }

    // // To implement preferred car selection
    // if(this.preferredCar){
    //   this.preferredCar = this.accountSetupInfo.userId;
    // }

    this.userExtended = JSON.stringify({ EmergencyContact: this.userExtended, preferredCar: this.preferredCar });
    this.userDetail.extendedAttribute = {
      value: this.userExtended,
    };

    if (isEdited) {
      this.accSetupProvider.updatedetails(this.userDetail).then(
        (res) => {
          this.updateUserVersion(res);
          console.log(res);
        },
        (err) => {
          console.log(err);
        });
    }
  }
  updateUserVersion(data) {
    if (data.response.results[0].user.version) {
      if (data.response) {
        if (data.response.results[0]) {
          if (data.response.results[0].user) {
            this.userDetail.version = data.response.results[0].user.version;
          }
        }
      }
    }
  }

  logOut() {
    this.loginProvider.logOut();
  }

  /**
   * formats phone number
   */
  formatPhoneNumber = (event: any) => {
    this.disablesaveBtn = true;
    this.errorMessageInput = false;
    const code = event.which ? event.which : event.keyCode;
    const phNo = event.target.value;
    this.errorMessageonphone = 'Incorrect phone number';
    if (code !== 8 && code !== 37 && code !== 39 && code !== 46) {
      event.target.value = this.phoneFormatter(phNo);
      if (this.accountSetupInfo.phoneNo.length === 14) {
        this.disablesaveBtn = false;
        return false;
      }
    }
  }

  formatEmergencyPhoneNumber = (event: any) => {
    this.disablesEmgsaveBtn = true;
    this.errorMessageInput = false;
    const code = event.which ? event.which : event.keyCode;
    const phNo = event.target.value;
    this.errorMessageonphone = 'Incorrect phone number';
    if (code !== 8 && code !== 37 && code !== 39 && code !== 46) {
      event.target.value = this.phoneFormatter(phNo);
      if (this.accountSetupInfo.phoneNo.length === 14) {
        this.disablesEmgsaveBtn = false;
        return false;
      }
    }
  }
  phoneFormatter(phNo) {
    let numbers;
    let char;
    if (undefined === phNo || null == phNo) {
      phNo = '';
    }
    numbers = phNo.replace(/\D/g, ''),
    char = { 0: '(', 3: ') ', 6: '-' };
    phNo = '';
    // tslint:disable-next-line:no-increment-decrement
    for (let i = 0; i < numbers.length; i++) {
      phNo += (char[i] || '') + numbers[i];
    }
    return phNo;
  }

  validateForm(field: string, event: any) {
    this.errorMessageInput = false;
    this.errorMessage = '';
    const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    switch (field) {
      case 'email':
        // tslint:disable-next-line:max-line-length
        this.isValidEmail = emailPattern.test(event.target.value);
        break;
      case 'emailError':
        this.errorMessage = (event.target.value && !emailPattern.test(event.target.value)) ? 'Incorrect email format' : '';
        break;
      default: break;
    }
  }

  setPreferredCar(mappedAssetId) {
    console.log('updating preferredCar imageId ->'); console.log(mappedAssetId);
    let isEdited = false;
    this.accountSetupInfo.userId != mappedAssetId.userId ? isEdited = true : isEdited = false;
    if (isEdited) {
      if (this.userDetail.extendedAttribute) {
        if (this.userDetail.extendedAttribute.value) {
          let eVal = JSON.parse(this.userDetail.extendedAttribute.value);
          if (eVal.preferredCar) {
            if (eVal.preferredCar != mappedAssetId.userId) {
              eVal.preferredCar = mappedAssetId.userId;
            }
          } else {
            eVal.preferredCar = mappedAssetId.userId;
          }
          this.userDetail.extendedAttribute.value = JSON.stringify(eVal);
        }
      }
      console.log(this.userDetail);
      this.accSetupProvider.updatedetails(this.userDetail).then(
        (res) => {
          this.updateUserVersion(res);
          this.accountSetupInfo.userId = mappedAssetId.userId;
          console.log(res);
        },
        (err) => {
          console.log(err);
        });
    }
  }

  toggleNotification(isAlertEnabled) {
    this.sharedProvider.showBusyIndicator();
    this.sharedAPIProvider.updateAlertPref(this.authToken, isAlertEnabled).then(
    (res) => {
      this.sharedProvider.setAlertStatus(isAlertEnabled ? 'true' : 'false');
      console.log(isAlertEnabled);
      this.sharedProvider.hideBusyIndicator();
    },
    (err) => {
      isAlertEnabled = !isAlertEnabled;
      this.sharedProvider.hideBusyIndicator();
      console.log(err);
    });
  }

}
