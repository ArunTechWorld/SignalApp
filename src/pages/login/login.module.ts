import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginComponent } from './login';
import { LoginProvider } from './login.provider';
import { HttpClientModule } from '@angular/common/http';
import { focusinput } from '../../providers/shared/focus.directive';
import { ForgotPasswordComponent } from '../login/forgot-password/forgot-password';
import { SecureStorage } from '@ionic-native/secure-storage';

@NgModule({
  declarations: [
    LoginComponent,
    focusinput,
    ForgotPasswordComponent,
  ],
  imports: [
    HttpClientModule,
    IonicPageModule.forChild(LoginComponent),
  ],
  providers: [
    LoginProvider,
    SecureStorage,
  ],
  entryComponents: [
    ForgotPasswordComponent,
  ],
})
export class LoginPageModule { }
