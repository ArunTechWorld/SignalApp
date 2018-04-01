import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyfamilyPageComponent } from './myfamily';
import { MyFamilyProvider } from './myfamily.provider';

@NgModule({
  declarations: [
    MyfamilyPageComponent,
  ],
  imports: [
    IonicPageModule.forChild(MyfamilyPageComponent),
  ],
  providers: [
    MyFamilyProvider,
  ],
  entryComponents: [
    MyfamilyPageComponent,
  ],
})
export class MyfamilyPageModule {}
