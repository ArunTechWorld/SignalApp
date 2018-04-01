import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';
import { SharedAPIProvider } from '../../../../providers/shared/sharedAPI';
import { MyfamilyPageComponent } from '../../myfamily';
import { MyFamilyProvider } from '../../myfamily.provider';
import * as _ from 'lodash';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { TooltipAlertComponent } from '../../../car-location-home/components/tooltip-alert/tooltip-alert';
import { rightAnimationOptions } from '../../../../helper/utils';

/**
 * Generated class for the AddpersonComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'app-addperson',
  templateUrl: 'addperson.html',
})
export class AddPersonComponent {
  public loginUserobject;
  public userIsAdmin = false;
  public authToken;
  public adminRole;
  public userRole;
  public addUserObj = {
    account: {},
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    isAdmin: false,
    password: 'Sure@123!',
    roles: [],
    applications: [],
  };
  onSuccess: any;
  onError: any;
  public isValidEmail = false;
  public emailError  = '';
  public isValidForm = false;
  public errorMessage = '';
  public errorMessageInput = false;
  public networkError = false;
  @ViewChild('firstName') firstName;
  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public myFamilyProvider: MyFamilyProvider,
    public sharedAPIProvider: SharedAPIProvider,
    private nativePageTransitions: NativePageTransitions,
    public modalCtrl: ModalController,
  ) {
  }

  ionViewDidLoad() {
    const loginUserData = this.sharedAPIProvider.getUserInfo();
    if (loginUserData !== undefined) {
      this.loginUserobject = loginUserData.response.user;
      this.authToken = loginUserData.response.authToken;
      this.adminRole = this.myFamilyProvider.checkAdminRole(this.loginUserobject.roles);
      this.userRole = this.myFamilyProvider.getUserRole(this.adminRole);
    }
    setTimeout(() => {
      this.firstName.setFocus();
    },         150);
  }

  moveToPreviousPage() {
    const options: NativeTransitionOptions = rightAnimationOptions;
    this.nativePageTransitions.slide(options);
    this.navCtrl.pop();
  }

  validateEmail() {
    // tslint:disable-next-line:max-line-length
    const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailPattern.test(this.addUserObj.email);
  }

  validateForm(field: string, event: any) {
    this.errorMessageInput = false;
    this.errorMessage = '';
    this.isValidEmail = false;
    this.emailError = '';
    if (field === 'emailError') {
      this.isValidEmail = this.validateEmail();
    } else {
      if (this.addUserObj.email !== '') {
        this.isValidEmail = this.validateEmail();
        this.errorMessageInput = this.isValidEmail ? false : true;
        this.emailError = this.isValidEmail ? '' : 'Incorrect email format';
      }
      if (this.addUserObj.firstName !== '' && this.addUserObj.lastName !== '' && this.isValidEmail) {
        this.isValidForm = true;
      } else {
        this.isValidForm = false;
      }
    }
  }

  addPerson() {
    this.errorMessageInput = false;
    const user = this.addUserObj;
    const loginUserobject = _.cloneDeep(this.loginUserobject);
    user.username = user.email;
    user.account = loginUserobject.account;
    user.roles = loginUserobject.roles;
    user.applications = loginUserobject.applications;
    if (!user.isAdmin) {
      const roleIndex = _.findIndex(user.roles, { href: this.adminRole.href });
      if (roleIndex > -1) {
        user.roles.splice(roleIndex, 1);
      }
      user.roles.push(this.userRole);
    }
    this.myFamilyProvider.addUser(user).then((res) => {
      this.emailNotificationAlert();
    },                                       (err) => {
      this.handleError(err);
    });
  }

  emailNotificationAlert() {
    const alert = this.alertCtrl.create({
      title: 'Email Invitation Sent',
      subTitle: 'An invitation email has been sent to new person',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.navCtrl.pop();
          },
        },
      ],
    });
    alert.present();
  }

  handleError = (response) => {
    if (response.status !== 401) {
      this.errorMessage = this.sharedAPIProvider.getErrorMessage(response);
    } else {
      this.errorMessage = '';
    }
  }

  presentModalAdmin() {
    const profileModal = this.modalCtrl.create(TooltipAlertComponent, {
      image: 'assets/svg/Group.svg',
      title: 'Admin Privileges',
      // tslint:disable-next-line:max-line-length
      message: 'Only Admins can add or delete members, modify car details, modify notification preferences, create places, and modify the preferred service center.' });
    profileModal.present();
  }

}
