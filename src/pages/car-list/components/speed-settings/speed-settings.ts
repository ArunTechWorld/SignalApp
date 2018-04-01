import { Component, OnInit, OnDestroy } from '@angular/core';
import { CarListProvider } from '../../car-list.provider';
import { ApiStatusProvider } from '../../../../components/api-status/api-status.provider';
import { NavController, AlertController, ToastController, NavParams, ModalController, Events } from 'ionic-angular';

@Component({
  selector: 'speed-settings',
  templateUrl: 'speed-settings.html',
})

export class SpeedSettingsComponent implements OnInit, OnDestroy {
  public carSettingDetail = {
    currentUserId: null,
    selectedCar: null,
    collisionNotification: [],
    tripwireNotification: [],
    speedAlertNotification: [],
    speedAlert: null,
    places: null,
    preferredServiceCenter: null,
    serviceCenterPermission: null,
  };
  public maxspeed: number;
  public statusRequests = {
    submit: [],
    success: [],
    failure: [],
  };
  public statusMessages = {
    speedAlert: {
      submit: 'Submitting speed alert updates…',
      success: 'Speed alert successfully updated',
      failure: 'Cannot connect to device. Your speed alert settings were reverted.',
    },
  };
  public speedAlertSubmitting = false;
  public requestCount: number = 0;
  constructor(public navCtrl: NavController, public navParams: NavParams, public events: Events, public modalCtrl: ModalController, public carListProvider: CarListProvider, public apiStatusProvider: ApiStatusProvider) {

    console.log('Hello SpeedSettingsComponent ');
    this.loadSpeedSettings();
  }
  ngOnInit() {
    this.loadSpeedSettings();
  }
  ngOnDestroy() {


    this.resetObject(this.statusMessages.speedAlert);
    //this.resetObject(this.carSettingDetail);
    //this.resetObject(this.statusRequests);
    console.log('destroyed');
  }



  ionViewDidLoad() {

    this.loadSpeedSettings();
  }
  loadSpeedSettings() {
    this.carSettingDetail.selectedCar = this.navParams.get('selectedDevice');
    this.carSettingDetail.selectedCar.asset.speedSetting ? this.maxspeed = this.carSettingDetail.selectedCar.asset.speedSetting.speedThreshold : this.maxspeed = 75;
    console.log(this.carSettingDetail);
    (<any>window).Maxspeed = this.maxspeed;
    this.loadScript('assets/libs/meter.js');

  }

  moveToPreviousPage() {
    this.navCtrl.pop();
  }

  public loadScript(url) {
    console.log('preparing to load...');
    const node = document.createElement('script');
    node.src = url;
    node.type = 'text/javascript';
    document.getElementsByTagName('div')[0].appendChild(node);
  }

  updateAPIRequestCount() {
    const requestsObj = this.apiStatusProvider.getRequests();
    this.statusRequests = requestsObj.statusRequests;
    this.requestCount = requestsObj.requestCount;
    console.log(this.statusRequests);
  }
  removeRequest(apiRequest, action) {
    if (action === 'failure') {
      this.apiStatusProvider.removeFailureRequest(apiRequest);
    } else if (action === 'success') {
      this.apiStatusProvider.removeSuccessRequest(apiRequest);
    }
    this.updateAPIRequestCount();
  }
  tryAgnain(apiRequest) {
    if (apiRequest.type === 'SetSpeedLimit') {
      // remove request from failure array
      this.removeRequest(apiRequest, 'failure');
      // resend failed request (add request to submit array)
      this.setSpeedLimit();
    } else {
      // this.updateAlertSetting(apiRequest.request, apiRequest.type);
    }
  }
  setSpeedLimit() {
    this.maxspeed = (<any>window).Maxspeed;
    console.log(this.maxspeed);
    this.apiStatusProvider.addRequest(this.carSettingDetail.selectedCar.asset.id, status, 'SetSpeedLimit', this.statusMessages.speedAlert.submit);
    this.updateAPIRequestCount();
    this.carListProvider.updateSpeedLimit(this.carSettingDetail.selectedCar.asset.id, this.maxspeed).then((res) => {
      status = 'update';
      this.apiStatusProvider.updateRequest(this.carSettingDetail.selectedCar.asset.id, status, 'SetSpeedLimit', this.statusMessages.speedAlert.success, 'success');
      this.updateAPIRequestCount();
      this.setRequestTimer({ id: this.carSettingDetail.selectedCar.asset.id, request: status, type: 'SetSpeedLimit', message: this.statusMessages.speedAlert.success }, 'success');
      if (this.carSettingDetail.selectedCar.asset && this.carSettingDetail.selectedCar.asset.speedSetting && this.carSettingDetail.selectedCar.asset.speedSetting.speedThreshold) {
        this.carSettingDetail.selectedCar.asset.speedSetting.speedThreshold = this.maxspeed;
      }

      // this.navCtrl.pop();
      this.navCtrl.pop().then(() => {
        this.carSettingDetail.selectedCar.asset.version += 1;
        this.events.publish('custom-user-events', { selectedDevice: this.carSettingDetail.selectedCar });
      });
    },                                                                                                    (err) => {
      status = 'update';
      this.apiStatusProvider.updateRequest(this.carSettingDetail.selectedCar.asset.id, status, 'SetSpeedLimit', this.statusMessages.speedAlert.failure, 'failure');
      this.updateAPIRequestCount();
      this.setRequestTimer({ id: this.carSettingDetail.selectedCar.asset.id, request: status, type: 'SetSpeedLimit', message: this.statusMessages.speedAlert.failure }, 'failure');
    });
  }
  setRequestTimer(apiRequest, action) {
    setTimeout(() => {
      this.removeRequest(apiRequest, action);
    },         5000);
  }

  resetObject(obj) {
    Object.keys(obj).forEach((key) => {
      obj[key] = null;
    });
  }

}
