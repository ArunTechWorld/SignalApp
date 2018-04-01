import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyprofilePage } from './myprofile';
import { PasswordVerificationComponent } from './password-verification/password-verification';
@NgModule({
  declarations: [
  // MyprofilePage,
  ],
  imports: [
    IonicPageModule.forChild(MyprofilePage),
  ],
   entryComponents: [
    MyprofilePage,
    PasswordVerificationComponent,
  ],
})
export class MyprofilePageModule {}
