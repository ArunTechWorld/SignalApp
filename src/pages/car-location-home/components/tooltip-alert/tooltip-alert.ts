import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

/**
 * Generated class for the TooltipAlertComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'tooltip-alert',
  templateUrl: 'tooltip-alert.html',
})
export class TooltipAlertComponent {

  title: string;
  message: String;
  picture: String;

  constructor(
    private params: NavParams,
    public viewCtrl: ViewController,
  ) {
    this.title = params.get('title');
    console.log(this.title);
    this.message = params.get('message');
    this.picture = params.get('image');
    console.log(this.picture);
    // this.autoCloseNotification();
  }
  autoCloseNotification() {
    setTimeout(
      () => {
        this.dismiss();
      },
      10000,
    );
  }

  onEvent(event) {
    event.stopPropagation();
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }
}
