import { Component } from '@angular/core';
import { ViewController, NavParams, NavController } from 'ionic-angular';


@Component({
  selector: 'app-request-notification',
  templateUrl: 'request-notification.html',
})
export class RequestNotificationComponent {

  displayDate: string;

  constructor(
    private params: NavParams,
    public viewCtrl: ViewController,
    public navCtrl: NavController,
  ) {
    this.displayDate = params.get('display');
    this.autoCloseNotification();
  }
  private retryInterval;
  autoCloseNotification() {
    this.retryInterval = setTimeout(
      () => {
        this.dismiss();
      },
      10000,
    );
  }
  dismiss() {
    clearInterval(this.retryInterval);
    this.viewCtrl.dismiss();
    this.navCtrl.pop();
  }

}
