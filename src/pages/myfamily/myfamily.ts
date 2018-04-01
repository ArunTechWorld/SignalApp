import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SharedAPIProvider } from '../../providers/shared/sharedAPI';
import { MyFamilyProvider } from './myfamily.provider';
import * as _ from 'lodash';
import { AddPersonComponent } from './components/addperson/addperson';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { PersonaldetailsComponent } from './components/personaldetails/personaldetails';
import { leftAnimationOptions, rightAnimationOptions } from '../../helper/utils';

/**
 * Generated class for the MyfamilyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  name: 'myfamily',
  segment: 'myfamily',
})
@Component({
  selector: 'app-page-myfamily',
  templateUrl: 'myfamily.html',
})
export class MyfamilyPageComponent  {
  public personsList: any[] = [];
  public loginUserobject;
  onSuccess: any;
  onError: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public myFamilyProvider: MyFamilyProvider,
    public sharedAPIProvider: SharedAPIProvider,
    private nativePageTransitions: NativePageTransitions,
  ) {
  }
  private userIsAdmin = false;
  private authToken;
  private adminRole;
  private userRole;
  private errorMessage = '';

  ionViewDidEnter() {
    const loginUserData = this.sharedAPIProvider.getUserInfo();
    if (loginUserData !== undefined) {
      this.loginUserobject = loginUserData.response.user;
      this.authToken = loginUserData.response.authToken;
      const adminRole = this.myFamilyProvider.checkAdminRole(this.loginUserobject.roles);
      this.userIsAdmin = adminRole !== undefined ? true : false;
      if (this.userIsAdmin) {
        this.adminRole = adminRole;
        this.userRole = this.myFamilyProvider.getUserRole(this.adminRole);
      }
      this.getpeopleList();
    }
  }

  goToHome() {
    const options: NativeTransitionOptions = rightAnimationOptions;
    this.nativePageTransitions.slide(options);
    this.navCtrl.pop();
  }

  getpeopleList() {
    this.myFamilyProvider.getUsers(this.authToken).then((res) => {
      this.setuserData(res);
      this.errorMessage = '';
    },                                                  (err) => {
      this.handleError(err);
    });
  }

  setuserData(res) {
    this.personsList = res.response.results;
    this.mapPersonList();
  }

  mapPersonList() {
    const data = this.personsList;
    const itemIndex = _.findIndex(data, { user: { id: this.loginUserobject.id } });
    data.splice(0, 0, data.splice(itemIndex, 1)[0]);
    data.forEach((item, index) => {
      item.user.isAdmin = this.myFamilyProvider.checkAdminRole(item.user.roles) !== undefined ? true : false;
    });
  }

  updateRole(person) {
    const roles = person.roles;
    if (person.isAdmin) {
      this.myFamilyProvider.removeRole(roles, this.userRole);
      roles.push(this.adminRole);
    } else {
      this.myFamilyProvider.removeRole(roles, this.adminRole);
      roles.push(this.userRole);
    }
    this.myFamilyProvider.updateUser(person).then((res) => {
      this.getpeopleList();
    },                                            (err) => {
      this.handleError(err);
    });
  }

  handleError = (response) => {
    if (response.status !== 401) {
      this.errorMessage = this.sharedAPIProvider.getErrorMessage(response);
    } else {
      this.errorMessage = '';
    }
  }

  add() {
    const options: NativeTransitionOptions = leftAnimationOptions;
    this.nativePageTransitions.slide(options);
    this.navCtrl.push(AddPersonComponent);
  }
  personalDetails(user) {
    const options: NativeTransitionOptions = leftAnimationOptions;
    this.nativePageTransitions.slide(options);
    this.navCtrl.push(PersonaldetailsComponent, {
      userDetail: user});
  }
}
