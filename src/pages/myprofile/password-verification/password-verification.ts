import { Component,ViewChild,Input } from '@angular/core';
import { LoginProvider } from '../../login/login.provider';
import { SharedProvider } from '../../../providers/shared/shared';
import { SharedAPIProvider } from '../../../providers/shared/sharedAPI';
import { AccSetupProvider } from '../../../pages/account-setup/components/acc-setup-steps/acc-setup-provider';
import { IonicPage, NavController } from 'ionic-angular';
import { MyprofilePage } from '../myprofile';
import { from } from 'rxjs/observable/from';

/**
 * Generated class for the PasswordVerificationComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'password-verification',
  templateUrl: 'password-verification.html'
})
export class PasswordVerificationComponent {

  @ViewChild('input') input ;
  @ViewChild('input1') input1 ;

  text: string;
  isValidEmail = false;
  private newPassword = false;
  public userInput = { email: '', password: '' };
  public errorMessage;
  public errorMessageInput = false;
  public rules;
  public loginres: any;
  public loginProviderres: any;
  public userobject: any;
  public passwordType = 'password';
  public passwordType1 = 'password';
  
  public accountSetupInfo = {

    password: {
      newPassword: '',
      confirmPassword: '',
    },
  };
  constructor(public loginProvider: LoginProvider,public navCtrl: NavController,
    public sharedProvider: SharedProvider,
     public sharedAPIProvider: SharedAPIProvider,
     public accSetupProvider: AccSetupProvider,) {
    console.log('Hello PasswordVerificationComponent Component');
    this.text = 'Hello World';
    
    this.rules = this.loginProvider.getPasswordRules();
  }

  ionViewDidLoad() {
    setTimeout(() => {
      this.input.setFocus();
    },150);

 }
  showPassword() {
    this.passwordType = (this.passwordType == 'text') ? this.passwordType = 'password' : this.passwordType = 'text';
  }

  showPassword1() {
    this.passwordType1 = (this.passwordType1 == 'text') ? this.passwordType1 = 'password' : this.passwordType1 = 'text';
  }
  changetoNewPassword()
  {
    this.newPassword = true;
  }


  updatePassword(){
  if(this.validatePassword()) {
    this.updatingYourPassword().then((res)=>{
     if(res){
       this.movetobackpage();
    }
   }
    );
     // this.stepID--;
   }
  }

  validatePassword() {
    console.log(this.rules);
    if (this.accountSetupInfo.password.newPassword != this.accountSetupInfo.password.confirmPassword) {
      this.errorMessage = 'Your password and confirmation password do not match.';
      this.errorMessageInput = true;
     // this.disableNextBtn = true;
      return false;
    } else {
      this.rules.forEach(rule => rule.accomplished = true);
      const user = "Ar";//this.caUserService.getActiveUser();
      //const userCredentials = this.caUserService.getCredentials();
      const notAccomplishedRules = this.validatePasswordRules(this.accountSetupInfo.password.newPassword, 'AA', 'aa@com');//userCredentials.username, user.email);
      if (!notAccomplishedRules.length) {
        return true;
      } else {
        this.errorMessage = notAccomplishedRules[0].description;
        this.errorMessageInput = true;
        //this.disableNextBtn = true;
        return false;
      }
    }
  }
  validatePasswordRules(password, userName, email) {
    let notAccomplishedRules = [];

    for (let i = 0; i < this.rules.length; i++) {
      let rule = this.rules[i];
      rule.accomplished = rule.isValidFn(password, userName, email);
      !rule.accomplished && notAccomplishedRules.push(rule);
    }

    return notAccomplishedRules;
  }

  disableError(){
    this.errorMessageInput = false;
    this.errorMessage='';
  }
  movetobackpage(){
    this.navCtrl.pop();
    // this.navCtrl.setRoot(MyprofilePage);
  }
  

  signIn() {
    this.errorMessageInput = false;
    this.loginres = this.loginProvider.getUserInfo();
    const requestObj = {
      username: this.loginres.response.user == undefined ? this.loginres.response.results[0].user.username : this.loginres.response.user.username  ,
      password: this.userInput.password,
      useAuthToken: true,
    };
    // apiuser Sure@123
    this.sharedProvider.showBusyIndicator();
    this.loginProvider.login(requestObj).then((res) => {
      this.loginApiSuccessRes(res);
    },                                        (err) => {

      this.loginApiFailureRes(err);
    });
  }

  loginApiSuccessRes(response) {
  
    this.errorMessage = '';
    this.loadDeviceDetails(response);
    this.loginProvider.setUserInfo(response);
    this.sharedAPIProvider.setUserInfo(response);
  }
 

  loadDeviceDetails(response) {
    // this.sharedProvider.showBusyIndicator();
     this.sharedAPIProvider.getDeviceDetails(response.response.authToken).then((deviceDetails) => {
       this.accSetupProvider.setDeviceDetails(deviceDetails);
       this.sharedAPIProvider.setDeviceDetails(deviceDetails);
      this.navigateToNextPage(response);
     },                                                                        (err) => {
       this.navigateToNextPage(response);
     });
   }
   
   navigateToNextPage(response){
    this.sharedProvider.hideBusyIndicator();
    if (response.response.user.passwordUpdated === true) {
      this.newPassword = true;
    } else {
      this.newPassword = true;
    }
  }

   loginApiFailureRes(response) {
    this.sharedProvider.hideBusyIndicator();
    this.errorMessageInput = true;
    console.log(response);
    switch (response.status) {
      case 401: this.errorMessage = "Incorrect Password";//response.error.response.errors[0];
        break;
      default: this.errorMessage = 'Something Went Wrong'; break;
    }
  }

  updatingYourPassword() {
    this.loginProviderres = this.loginProvider.getUserInfo();
    let resultreturn = '';
    let tempVar = this.loginProviderres.response.user || this.loginProviderres.response.results[0].user;
    let response = {
      response: {
        results: [tempVar]
      }
    };
    this.accSetupProvider.setAccsetupRequestObj(tempVar);
    let loginResObj = this.accSetupProvider.getAccsetupRequestObj();//this.loginProvider.getUserInfo();
    console.log(loginResObj);
    return new Promise((resolve, reject) => {
    this.userobject = loginResObj
    this.userobject.password = this.accountSetupInfo.password.confirmPassword;
    this.userobject.passwordUpdated = true;
    //this.userobject.lastName =  this.accountSetupInfo.name.lastName;
    return this.accSetupProvider.updatedetails(this.userobject).then((res) => {
      this.loginProvider.setUserInfo(res);
      resolve(true);
    }, (err) => {
      this.ApiFailureRes(err);
      resolve(false);
    });
  });

  }

  ApiFailureRes(response) {
    this.errorMessageInput = true;
    console.log(response);
    switch (response.status) {
      case 401: this.errorMessage ="Something Went Wrong";
        break;
      case 400: this.errorMessage = "Bad Request";
        break;
      case 403: this.errorMessage = "Permission Denied";
        break;
      case 502: this.errorMessage ="Internal Server Error";
        break;
      case 409: this.errorMessage ="Resource state out-of-date";
        break;
      default: this.errorMessage = 'Something Went Wrong'; break;
    }
  }

}
