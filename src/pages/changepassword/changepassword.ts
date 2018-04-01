import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LoginProvider } from '../login/login.provider';
import { SharedAPIProvider } from '../../providers/shared/sharedAPI';
import { LoginComponent } from '../login/login';

/**
 * Generated class for the ChangepasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-changepassword',
  templateUrl: 'changepassword.html',
})
export class ChangepasswordPage {
  public passwordType = 'password';
  public rules;
  public errorMessage;
  public errorMessageInput = false;
  public disableNextBtn = true;
  public  password = {
    newPassword: '',
    confirmPassword: '',
  };
  public token;
  constructor(public navCtrl: NavController, public navParams: NavParams, public loginProvider: LoginProvider , public sharedApiProvider: SharedAPIProvider) {
    this.rules = this.loginProvider.getPasswordRules();
    this.token =  navParams.data.match.$args.token;
    console.log(this.token);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChangepasswordPage');
  }
  showPassword() {
    this.passwordType = (this.passwordType === 'text') ? this.passwordType = 'password' : this.passwordType = 'text';
  }
  backtoLogin() {
    this.navCtrl.setRoot(LoginComponent);
  }

  validatePassword() {
    console.log(this.rules);
    if (this.password.newPassword !== this.password.confirmPassword) {
      this.errorMessage = 'Your password and confirmation password do not match.';
      this.errorMessageInput = true;
      this.disableNextBtn = true;
      return false;
    }
    this.rules.forEach(rule => rule.accomplished = true);
    const user = 'Ar';
    const notAccomplishedRules = this.validatePasswordRules(this.password.newPassword, 'AA', 'aa@com'); // userCredentials.username, user.email);
    if (!notAccomplishedRules.length) {
      this.errorMessage = '';
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

  disableNextBtnFunction(val) {
    this.errorMessageInput = false;
    this.errorMessage = '';
    switch (val) {
      case 1: this.disableNextBtn = (!this.password.newPassword || !this.password.confirmPassword) ? true : false;
        break;
      default: break;
    }
  }

  updatePassword() {
    if (this.validatePassword()) {
      this.sharedApiProvider.resetPassword(this.password.newPassword, this.token).then((res) => {
        if (res) {
          this.navCtrl.setRoot(LoginComponent);
        }
      },
     );
    }
  }
}
