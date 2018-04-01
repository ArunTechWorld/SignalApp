import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AboutSuredrivePage } from '../about-suredrive';
import { SharedAPIProvider } from '../../../providers/shared/sharedAPI';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

/**
 * Generated class for the TermsAndConditionsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'terms-and-conditions',
  templateUrl: 'terms-and-conditions.html',
})
export class TermsAndConditionsComponent {
  public Url: SafeResourceUrl;
  public iframeUrl;
  text: string;

  constructor(public navCtrl: NavController, public sharedAPIProvider: SharedAPIProvider, private sanitizer: DomSanitizer) {
    console.log('Hello TermsAndConditionsComponent Component');
    this.text = 'Hello World';
    this.iframeUrl = this.sharedAPIProvider.getUserInfo().response.eulaUrl;
    console.log(this.iframeUrl);
    this.Url = sanitizer.bypassSecurityTrustResourceUrl(this.iframeUrl);
  }
  moveToPreviousPage() {
    this.navCtrl.pop();
  }


}
