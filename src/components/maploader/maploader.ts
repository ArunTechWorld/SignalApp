import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
/**
 * Generated class for the MaploaderComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'maploader',
  templateUrl: 'maploader.html'
})
export class MaploaderComponent {

  textMessage: string;

  constructor(public NavPrms : NavParams) {
    console.log('Hello MaploaderComponent Component '+ NavPrms.get('messageInfo'));
     this.textMessage = NavPrms.get('messageInfo');
  }

}
