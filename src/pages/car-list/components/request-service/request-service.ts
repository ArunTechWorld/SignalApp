import { Component } from '@angular/core';
import { ViewController, ModalController, NavParams } from 'ionic-angular';
import * as moment from 'moment';
import { RequestNotificationComponent } from './request-notification/request-notification';
import { DAY_NAMES } from '../../../../helper/utils';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SharedAPIProvider } from '../../../../providers/shared/sharedAPI';
import { SharedProvider } from '../../../../providers/shared/shared';
import { ENV } from '../../../../environments/environment';

@Component({
  selector: 'app-request-service',
  templateUrl: 'request-service.html',
})
export class RequestServiceComponent {
  myParam: string;

  selectedDateTime: string;
  currentDate: string;
  selectedMoment = moment();
  isSendRequestEnabled: boolean = false;
  selectedTimeMoment = moment();
  assetName: string;
  assetId: any;
  authtoken: any;
  assetres: any;
  selectedDevice: any;

  constructor(
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    private params: NavParams,
    public http: HttpClient,
    public sharedAPIProvider: SharedAPIProvider,
    public sharedProvider: SharedProvider,
    private nativePageTransitions: NativePageTransitions,
  ) {
    this.selectedDevice = params.get('assetName');
    // console.log(this.selectedDevice);
    this.assetName = this.selectedDevice.asset.name; // params.get('assetName');
    this.selectedDateTime = `${DAY_NAMES[this.selectedMoment.day()]}, ${moment().format('MMM D')}`;
    // this.selectedMoment = moment();
  }

  selectedDate(dateValue) {
    // console.log(dateValue);
    this.selectedMoment = moment(dateValue.dateObj);
    this.selectedMoment = this.selectedMoment.set(
      {
        hour: this.selectedTimeMoment.get('hour'),
        minute: this.selectedTimeMoment.get('minute'),
        second: this.selectedTimeMoment.get('second'),
      },
    );
    // console.log(dateValue.dateObj);
    this.currentDate = this.selectedMoment.format('MMM D');
    this.selectedDateTime = `${DAY_NAMES[this.selectedMoment.day()]}, ${this.currentDate}`;
    this.isSendRequestEnabled = false;
    // if (this.isSendRequestEnabled) {
    //   /* tslint:disable:max-line-length */
    //   this.selectedDateTime = `${DAY_NAMES[this.selectedMoment.day()]}, ${this.selectedMoment.format('MMM D')}, ${moment(this.selectedTimeMoment).format('h:mm A')}`;
    // } else {
    //   this.selectedDateTime = `${DAY_NAMES[this.selectedMoment.day()]}, ${this.currentDate}`;
    // }
    // console.log(this.selectedDateTime);
    // this.isSendRequestEnabled = false;
  }
  selectedTime(timeValue) {
    // console.log(timeValue);
    // console.log(this.selectedMoment);
    const selectedTime = moment(timeValue.dateObj);
    this.selectedMoment = this.selectedMoment.set(
      {
        hour: selectedTime.get('hour'),
        minute: selectedTime.get('minute'),
        second: selectedTime.get('second'),
      },
    );
    this.selectedTimeMoment = this.selectedMoment;
    // this.selectedMoment = moment(dateValue.dateObj);
    this.selectedDateTime = `${DAY_NAMES[this.selectedMoment.day()]}, ${this.selectedMoment.format('MMM D')}, ${moment(timeValue.dateObj).format('h:mm A')}`;
    this.isSendRequestEnabled = true;
  }

  // displayDate() {
  //   return `${DAY_NAMES[this.selectedMoment.day()]}, ${this.currentDate}`;
  // }

  sendServiceRequest() {

    this.serviceRequestapi(this.selectedMoment.format()).then(() => {
      // console.log(this.selectedMoment.format('dddd MMM D [at] h:mm A'));
      const notiModal = this.modalCtrl.create(RequestNotificationComponent, {
        display: this.selectedMoment.format('dddd MMM D [at] h:mm A'),
        selectedDate: this.selectedMoment.format(),
      });
      notiModal.present();
    })
      .catch((err) => {
        console.log('sendServiceRequest error : ', err);
      });
  }

  dismiss() {
    const options: NativeTransitionOptions = {
      direction: 'right',
      duration: 300,
      iosdelay: 200,
      androiddelay: 150,
    };
    this.nativePageTransitions.slide(options);
    this.viewCtrl.dismiss();
  }

  serviceRequestapi(selectedDate) {
    // updateCarDetails(carDetail){
    this.assetId = this.selectedDevice.asset.id;
    this.authtoken = this.sharedAPIProvider.getUserInfo().response.authToken;
    return new Promise((resolve, reject) => {
      this.sharedProvider.showBusyIndicator();
      const objString = { preferredDateTime: selectedDate };
      const service = JSON.stringify(objString);

      this.http.post(ENV.apiUrl + `assets/${this.assetId}/service`, { service }, {
        headers: new HttpHeaders().set('authorization', this.authtoken)
          .set('Content-Type', 'application/json'),
      })
        .subscribe(
        (serciveReqRes) => {
          console.log(serciveReqRes);
          resolve(serciveReqRes);
          this.sharedProvider.hideBusyIndicator();
        },
        (err) => {
          reject(err);
          this.sharedProvider.hideBusyIndicator();
        });
    });
  }


}
