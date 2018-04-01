import { Component, ViewChild, } from '@angular/core';
import { LoginComponent } from '../login';
import { IonicPage, NavController, NavParams , AlertController} from 'ionic-angular';
import { LoginProvider } from '../login.provider';

/**
 * Generated class for the ForgotPasswordComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'forgot-password',
  templateUrl: 'forgot-password.html'
})
export class ForgotPasswordComponent {

  isValidEmail = false;
  public userInput = { email: '', password: '' };
  public errorMessage;
  public errorMessageInput = false;
 // public isValidEmail  =  true;
  @ViewChild('userName') userName;
  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public loginProvider: LoginProvider) {
    console.log('Hello ForgotPasswordComponent Component');
  }

  backtologinpage() {
    this.navCtrl.push(LoginComponent);
  }
  forgotPassword()  {
    this.loginProvider.forgotPassword(this.userInput.email).then((res) => {
      if (res) {
        this.update();
      }
    },
   );

  }
  update() {
    const alert = this.alertCtrl.create({
      title: 'Check Your Email',
      message: 'A link to reset your password has been sent to the email address provided.',
      cssClass: 'emailAlert',
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
           // this.accoutSetupSlideChanged('1');
          },
        },
      ],
    });
    alert.present();
   // this.navCtrl.push(LoginComponent);

  }

  validateForm(field: string, event: any) {
    this.errorMessageInput = false;
    this.errorMessage = '';
    const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  //  this.disableNextBtn = (event.target.value && !emailPattern.test(event.target.value));
    switch (field) {
      case 'email':
        this.isValidEmail = emailPattern.test(event.target.value);
        break;
      case 'emailError':
        this.errorMessage = (event.target.value && !emailPattern.test(event.target.value)) ? 'Incorrect email format' : '';
        break;
      default: break;
    }
  }

}
