import { Component, Input } from '@angular/core';
import { Events } from 'ionic-angular';

/**
 * Generated class for the ApiStatusComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'app-api-status',
  templateUrl: 'api-status.html',
})
export class ApiStatusComponent {

  @Input() statusRequests: object;
  apiRequests: object;

  constructor(public events: Events) {
    console.log('Hello ApiStatusComponent Component');
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    this.apiRequests = this.statusRequests;
    console.log(this.apiRequests);
  }

  tryAgain(requestObj) {
    console.log(requestObj);
    this.events.publish('request:tryAgain', requestObj);
  }

  close(requestObj) {
    this.events.publish('request:removeFailureRequest', requestObj);
  }
}
