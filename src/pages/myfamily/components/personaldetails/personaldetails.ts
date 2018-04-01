import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController , ActionSheetController } from 'ionic-angular';
import { MyFamilyProvider } from '../../myfamily.provider';
import { MyfamilyPageComponent } from '../../myfamily';
import { SharedAPIProvider } from '../../../../providers/shared/sharedAPI';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { rightAnimationOptions } from '../../../../helper/utils';

/**
 * Generated class for the PersonaldetailsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'app-personaldetails',
  templateUrl: 'personaldetails.html',
})
export class PersonaldetailsComponent {
  public userDetail;
  public accountSetupInfo = {
    id: '',
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
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public myFamilyProvider: MyFamilyProvider,
              public actionSheetCtrl: ActionSheetController,
              private sharedAPIProvider: SharedAPIProvider,
              private nativePageTransitions: NativePageTransitions,
  ) {
  }
  private isEditProfille = true;
  private userId;
  private userIsAdmin;
  private me;

  ionViewDidLoad() {
    this.userDetail = this.navParams.data.userDetail;
    const loggedInUser = this.sharedAPIProvider.getUserInfo().response.user;
    const adminRole = this.myFamilyProvider.checkAdminRole(loggedInUser.roles);
    this.userIsAdmin = adminRole !== undefined ? true : false;
    this.me = loggedInUser.id === this.userDetail.id ? true : false ;
    this.userId = this.userDetail.id;
    this.accountSetupInfo.id = this.userDetail.id ? this.userDetail.id : '';
    this.accountSetupInfo.name.firstName = this.userDetail.firstName ? this.userDetail.firstName : '';
    this.accountSetupInfo.name.lastName = this.userDetail.lastName ? this.userDetail.lastName : '';
    this.accountSetupInfo.phoneNo = this.userDetail.phoneNumbers.length > 0 ? this.userDetail.phoneNumbers[0].phoneNumber : '' ;
    this.accountSetupInfo.email = this.userDetail.email ? this.userDetail.email : '';

    this.myFamilyProvider.getUser(this.userDetail.id).then(
      (res) => {
        this.setEmergencyDetail(res);
      // tslint:disable-next-line:align
      }, (err) => {
      console.log(err);
    });
  }
  setEmergencyDetail(data) {
    const extendedAttribute = data.response.results[0].user.extendedAttribute ? data.response.results[0].user.extendedAttribute.value : '';
    if (extendedAttribute) {
      let emergencyContact = JSON.parse(extendedAttribute);
      if (emergencyContact) {
        emergencyContact = emergencyContact.EmergencyContact;
        this.accountSetupInfo.justInCase.firstName = emergencyContact ? emergencyContact.firstName : '';
        this.accountSetupInfo.justInCase.lastName =  emergencyContact ? emergencyContact.lastName : '';
        this.accountSetupInfo.justInCase.phoneNo = emergencyContact ? emergencyContact.phone : '';
      }
    }
  }

  moveToPreviousPage() {
    const options: NativeTransitionOptions = rightAnimationOptions;
    this.nativePageTransitions.slide(options);
    this.navCtrl.pop();
  }

  removeUser() {
    const actionSheet = this.actionSheetCtrl.create({
      cssClass: 'buttons-color-class',
      buttons: [
        {
          cssClass: 'buttons-color-class',
          text: 'Remove',
          role: 'destructive',
          handler: () => {
            this.myFamilyProvider.deleteUser(this.userId).then((res) => {
              this.moveToPreviousPage();
            },                                                 (err) => {
            });
          },
        }, {
          cssClass: 'buttons-color-class',
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
      ],
    });
    actionSheet.present();
  }

}
