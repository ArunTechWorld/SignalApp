import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { CollisionSupportPage } from './collision-support';

@NgModule({
  declarations: [
    CollisionSupportPage,
  ],
  providers: [
    LaunchNavigator,
  ],
  imports: [
    IonicPageModule.forChild(CollisionSupportPage),
  ],
})

export class CollisionSupportPageModule { }
