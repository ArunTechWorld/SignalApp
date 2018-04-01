import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EmergencySupportPage } from './emergency-support';

@NgModule({
  declarations: [
    EmergencySupportPage,
  ],
  imports: [
    IonicPageModule.forChild(EmergencySupportPage),
  ],
})
export class EmergencySupportPageModule {}
