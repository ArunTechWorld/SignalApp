import { Component } from '@angular/core';
import { NavController, AlertController, ToastController, NavParams, ModalController, Events } from 'ionic-angular';
import { SharedProvider } from '../../../../providers/shared/shared';
import { SharedAPIProvider } from '../../../../providers/shared/sharedAPI';
import { LojackMapProvider } from '../../../../providers/lojack-map/lojack-map';
import { CarListProvider } from '../../car-list.provider';
import * as _ from 'lodash';
import { CarLocationHomePageComponent } from '../../../car-location-home/car-location-home';
import { CarLocationHomeProvider } from '../../../car-location-home/provider/car-location-home';
import { CarListPageComponent } from '../../car-list';
import { CarNameComponent } from '../../components/car-name/car-name';
import { RequestServiceComponent } from '../request-service/request-service';
import { MyFamilyProvider } from '../../../myfamily/myfamily.provider';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { ApiStatusProvider } from '../../../../components/api-status/api-status.provider';
import { GeoZoneComponent } from '../../../../components/geo-zone/geo-zone';
import { SpeedSettingsComponent } from '../speed-settings/speed-settings';
import { lojackPhone, lojackEmail, leftAnimationOptions, rightAnimationOptions, GEO_ZONES_IMAGES, defaultDealerEmail, MAX_DEVICE_GEOZONE } from '../../../../helper/utils';
import { ENV } from '../../../../environments/environment';

import * as moment from 'moment';
/**
 * Generated class for the CarSettingsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'app-car-settings',
  templateUrl: 'car-settings.html',
})
export class CarSettingsComponent {
  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private events: Events,
    private sharedProvider: SharedProvider,
    private sharedAPIProvider: SharedAPIProvider,
    private lojackMapProvider: LojackMapProvider,
    private apiStatusProvider: ApiStatusProvider,
    private carListProvider: CarListProvider,
    private myFamilyProvider: MyFamilyProvider,
    private modalCtrl: ModalController,
    private CarLocHomeProvider: CarLocationHomeProvider,
    private nativePageTransitions: NativePageTransitions,
  ) {
    console.log('car setting constructor called');
    this.lojackPhone = lojackPhone;
    this.lojackEmail = lojackEmail;
    /************ Status Component Events ***************/
    this.apiStatusProvider.removeAllRequests();
    events.subscribe('request:tryAgain', (obj) => {
      this.tryAgnain(obj);
    });
    events.subscribe('request:removeFailureRequest', (obj) => {
      this.removeRequest(obj, 'failure');
    });
    /*  events.subscribe('request:removeAllRequests', () => {
       this.removeAllRequests();
     }); */
    /************ Status Component Events ***************/
    events.subscribe('custom-user-events', (paramsVar) => {
      this.carSettingDetail.selectedCar = paramsVar.selectedDevice;
    });
    events.subscribe('place-update-event', () => {
      this.getGeoZones();
    });
    events.subscribe('network:change', (status) => {
      this.networkError = status;
    });
    this.currentUser = this.sharedAPIProvider.getUserInfo();
    this.loadCarSetting();
  }

  private carSettingDetail = {
    currentUserId: null,
    selectedCar: null,
    memberSince: null,
    expireOn: null,
    deviceEsn: null,
    collisionNotification: [],
    tripwireNotification: [],
    speedAlertNotification: [],
    placesNotification: [],
    dtcDealer: { userId: '', firstName: '', state: false, alertId: '', alertKey: '', deviceId: '' },
    preferredServiceCenter: null,
    serviceCenterPermission: null,
  };
  private networkError = this.sharedProvider.networkStatus;
  private lojackPhone;
  private lojackEmail;
  private currentUser;
  private assetDeviceId;
  private collisionNotification = [];
  private tripwireNotification = [];
  private speedAlertNotification = [];
  private placesNotification = [];
  private loginUserIsAdmin = false;
  private speedAlertEnabled = false;
  private speedAlertSubmitting = false;
  private authtoken;
  private deviceData;
  private deviceGeoZones = [];
  private geoZonesList = [];
  private alertList = [];
  private allZoneAlerts = [];
  private userList = [];
  private speederror = false;
  private iconsPath: string = 'assets/svg/places_icons';
  private maxDeviceGeozone: number = MAX_DEVICE_GEOZONE;
  private maxDeviceGeozoneMsg: string = 'Maximum number of Geozones reached.';

  /******** Status Component variables ************/
  private statusRequests = {
    submit: [],
    success: [],
    failure: [],
  };
  private requestCount: number = 0;
  private statusMessages = {
    crash: {
      submit: 'Submitting Collision notification updates…',
      success: 'Collision notification successfully updated',
      failure: 'Cannot connect to device. Your collision notifications were reverted.',
    },
    tripwire: {
      submit: 'Submitting Tripwire notification updates…',
      success: 'Tripwire notification successfully updated',
      failure: 'Cannot connect to device. Your tripwire notifications were reverted.',
    },
    speed: {
      submit: 'Submitting speed alert notification updates…',
      success: 'Speed alert notification successfully updated',
      failure: 'Cannot connect to device. Your speed alert notifications were reverted.',
    },
    speedAlert: {
      submit: 'Submitting speed alert updates…',
      success: 'Speed alert successfully updated',
      failure: 'Cannot connect to device. Your speed alert settings were reverted.',
    },
    places: {
      submit: 'Submitting places updates…',
      success: 'Places successfully updated',
      failure: 'Cannot connect to device. Places settings were reverted.',
    },
  };
  /******** Status Component variables ************/

  ionViewDidLoad() {
    const adminRole = this.myFamilyProvider.checkAdminRole(this.currentUser.response.user.roles);
    this.loginUserIsAdmin = adminRole !== undefined ? true : false;
    this.authtoken = this.sharedAPIProvider.getUserInfo().response.authToken;
  }

  ionViewDidLeave() {
    this.statusRequests = undefined;
    this.requestCount = undefined;
  }

  loadCarSetting() {
    this.carSettingDetail.currentUserId = this.currentUser.response.user.id;
    this.carSettingDetail.selectedCar = this.navParams.get('selectedDevice');
    // this.carCount = this.navParams.get('carCount');
    console.log(this.carSettingDetail.selectedCar);
    // tslint:disable-next-line:max-line-length
    const deviceHref = this.carSettingDetail.selectedCar.asset.devices.length > 0 ? this.carSettingDetail.selectedCar.asset.devices[0].href : '';
    // tslint:disable-next-line:max-line-length
    this.assetDeviceId = deviceHref ? deviceHref.substring(deviceHref.lastIndexOf('/') + 1) : 0; console.log('deviceId: ' + this.assetDeviceId);
    this.getDevice();
    this.speedAlertEnabled = this.getSpeedAlert();
    const dealership = this.carSettingDetail.selectedCar.asset.dealership;
    console.log(dealership);
    this.carSettingDetail.preferredServiceCenter = dealership ? {
      shopName: dealership.name ? dealership.name : '',
      shopAddress: dealership.address ? dealership.address : '',
      shopPhone: dealership.phone ? dealership.phone : '',
      shopWebsite: dealership.url ? dealership.url : '',
    }
      :
      null;
    this.carSettingDetail.serviceCenterPermission = '';
  }
  getDevice() {
    if (this.assetDeviceId === '' || this.assetDeviceId === 0) {
      if (this.loginUserIsAdmin) {
        this.getUserAlert();
      }
    } else {
      this.carListProvider.getDevice(this.assetDeviceId, this.currentUser.response.authToken).then(
        (res: any) => {
          if (res && res.response && res.response.results && res.response.results.length > 0) {
            this.deviceData = res.response.results[0];
            const since = this.deviceData.device.activationDate;
            this.carSettingDetail.memberSince = since ? moment(since).format('MMMM DD, YYYY') : '';
            this.carSettingDetail.expireOn = ''; // to be calculated or fetched from some field
            this.carSettingDetail.deviceEsn = this.deviceData.device.esn;
            if (this.loginUserIsAdmin) {
              this.getUserAlert();
            } else {
              this.sharedProvider.hideBusyIndicator();
            }
          }
          console.log(this.deviceData);
        },
        (err) => {
          if (this.loginUserIsAdmin) {
            this.getUserAlert();
          } else {
            this.sharedProvider.hideBusyIndicator();
          }
          const error = this.sharedAPIProvider.getErrorMessage(err);
          console.log(error);
        });
    }
  }
  getUserAlert() {
    this.carListProvider.getUsers(this.currentUser.response.authToken).then(
      (res) => {
        this.setUsersData(res, this.deviceData.device);
      },
      (err) => {
        console.log('error occurred while fetching users');
      });
  }
  /**************** Zones Start **************/
  getGeoZones() {
    this.lojackMapProvider.getDeviceGeoZones(this.assetDeviceId).then(
      (res: any) => {
        this.deviceGeoZones = res.response.results;
        if (this.deviceGeoZones.length === 0) {
          this.getUserSettings();
        } else {
          const zoneIdList = this.getGeoZoneIds(this.deviceGeoZones);
          this.searchGeoZones(zoneIdList);
        }
      },
      (err) => {
        this.getUserSettings();
        const error = this.sharedAPIProvider.getErrorMessage(err);
        console.log(error);
      });
  }
  getGeoZoneIds(geoZonesList) {
    const zoneIds = [];
    geoZonesList.forEach((item, index) => {
      const zoneHref = item.deviceGeozone.geozone.href;
      const zoneId = zoneHref.substring(zoneHref.lastIndexOf('/') + 1);
      zoneIds.push(zoneId);
    });
    return zoneIds.join(',');
  }
  searchGeoZones(zoneIdList) {
    this.lojackMapProvider.searchGeoZones(zoneIdList).then(
      (res: any) => {
        this.geoZonesList = res.response.results;
        this.getUserSettings();
      },
      (err) => {
        const error = this.sharedAPIProvider.getErrorMessage(err);
        console.log(error);
        this.getUserSettings();
      });
  }
  mapAlertsToZones() {
    this.allZoneAlerts = this.getAllZoneAlerts();
    console.log('All Zone Alerts'); console.log(this.allZoneAlerts);
    this.geoZonesList.forEach((item, index) => {
      const zoneId = item.geozone.id;
      item.deviceZone = this.getDeviceZone(zoneId);
      if (this.allZoneAlerts.length > 0) {
        item.userAlerts = this.getZonewiseAlerts(zoneId);
      } else {
        item.userAlerts = _.cloneDeep(this.placesNotification);
      }
    });
  }
  getAllZoneAlerts() {
    const allZoneAlerts = _.filter(this.alertList, (item) => {
      return item.alertConfiguration.alertDetails.alertName === 'ZONE';
    });
    return allZoneAlerts;
  }
  getZonewiseAlerts(zoneId) {
    const zoneAlerts = _.filter(this.allZoneAlerts, (alert) => {
      return zoneId === Number(alert.alertConfiguration.alertDetails.geozoneId);
    });
    if (zoneAlerts.length > 0) {
      return this.mapUsersToZone(zoneAlerts);
    }
    return _.cloneDeep(this.placesNotification);
  }
  mapUsersToZone(zoneAlerts) {
    const users = _.cloneDeep(this.placesNotification);
    users.forEach((userItem, userIndex) => {
      for (let i = 0; i < zoneAlerts.length; i += 1) {
        const alertConfiguration = zoneAlerts[i].alertConfiguration;
        if (userItem.userId === alertConfiguration.alertDetails.userId && this.assetDeviceId === alertConfiguration.alertDetails.deviceId) {
          userItem.state = alertConfiguration.status === 'Enabled' ? true : false;
          userItem.alertId = alertConfiguration.id;
          userItem.alertKey = alertConfiguration.alertType.title;
        }
      }
    });
    return users;
  }
  getDeviceZone(zoneId) {
    return _.find(this.deviceGeoZones, (zone) => {
      const id = this.sharedAPIProvider.entityId(zone.deviceGeozone.geozone.href);
      return zoneId === id;
    });
  }

  toggleGeoZones(placeInfo, userInfo) {
    const deploymentStatus = placeInfo.deviceZone.deviceGeozone.deploymentStatus;
    console.log(placeInfo); console.log(userInfo);
    if (userInfo.alertId !== '') {
      this.updateAlertSetting(userInfo, 'PLACES', placeInfo);
    } else {
      if (userInfo.state) {
        if (placeInfo.deviceZone.deviceGeozone.deploymentStatus !== 'COMPLETED') {
          // zone deployment status pending? deploy geozone for that user, after that create alerts for user, then update alert with status
          console.log('deploy geozone');
          this.createZoneAlert(placeInfo, userInfo);
        }
        if (placeInfo.deviceZone.deviceGeozone.deploymentStatus === 'COMPLETED') {
          // No alerts found for the user? create alerts for user, then update alert with status
          console.log('create alert');
          this.createZoneAlert(placeInfo, userInfo);
        }
      }
    }
  }
  createZoneAlert(placeInfo, userInfo) {
    const esn = this.deviceData.device.esn;
    let dealerEmail = this.carSettingDetail.selectedCar.asset.dealership ? (this.carSettingDetail.selectedCar.asset.dealership.email !== '' ? this.carSettingDetail.selectedCar.asset.dealership.email : '') : '';
    dealerEmail = dealerEmail !== '' ? dealerEmail : defaultDealerEmail;
    this.apiStatusProvider.addRequest(placeInfo.geozone.id, userInfo, 'PLACES', this.statusMessages.places.submit);
    this.updateAPIRequestCount();
    this.carListProvider.createAlert(userInfo, placeInfo.geozone.id, esn, dealerEmail).then(
      (res: any) => {
        if (res) {
          this.apiStatusProvider.updateRequest(placeInfo.geozone.id, userInfo, 'PLACES', this.statusMessages.places.success,
                                               'success');
          this.updateAPIRequestCount();
          this.setRequestTimer({ userInfo, id: placeInfo.geozone.id, type: 'PLACES', message: this.statusMessages.speedAlert.success },
                               'success');
          userInfo.alertId = this.getAlertId(res);
        }
      },
      (err) => {
        const error = this.sharedAPIProvider.getErrorMessage(err);
        console.log(error);
        this.apiStatusProvider.updateRequest(placeInfo.geozone.id, userInfo, 'PLACES', this.statusMessages.places.failure,
                                             'failure');
        this.updateAPIRequestCount();
        this.setRequestTimer({ userInfo, id: placeInfo.geozone.id, type: 'PLACES', message: this.statusMessages.places.failure },
                             'failure');
        this.revertZoneAlerts(placeInfo, userInfo);
      });
  }
  revertZoneAlerts(placeInfo, userInfo) {
    console.log(placeInfo);
    userInfo.state = !userInfo.state;
  }
  /**************** Zones End **************/
  getSpeedAlert() {
    const speedAlert = this.carSettingDetail.selectedCar.asset.speedSetting ?
      this.carSettingDetail.selectedCar.asset.speedSetting.status === 'ENABLED' : false;
    return speedAlert;
  }
  setUsersData(data, deviceData) {
    this.userList = data.response.results;
    const userLen = this.userList.length;
    const userData = [];
    for (let i = 0; i < userLen; i += 1) {
      const user = this.userList[i].user;
      const adminRole = this.myFamilyProvider.checkAdminRole(user.roles);
      if (this.currentUser.response.user.id == user.id || !(adminRole !== undefined ? true : false)) {
        userData.push({ userId: user.id, firstName: user.firstName, state: false, alertId: '', alertKey: '', deviceId: deviceData.id, deviceEsn: deviceData.esn });
      }
    }
    // console.log("user's list for setting");console.log(userData);
    this.collisionNotification = _.cloneDeep(userData);
    this.tripwireNotification = _.cloneDeep(userData);
    this.speedAlertNotification = _.cloneDeep(userData);
    this.placesNotification = _.cloneDeep(userData);
    this.getGeoZones();
    // this.getUserSettings();
  }

  getUserSettings() {
    this.carListProvider.getAllAlerts().then(
      (res: any) => {
        this.alertList = res.response.results;
        this.populateAlertData();
        if (this.geoZonesList.length > 0) {
          this.mapAlertsToZones();
        }
      },
      (err) => {
        console.log(err);
      });
  }

  populateAlertData() {
    for (let t = 0; t < this.speedAlertNotification.length; t += 1) {
      this.speedAlertNotification[t].alertKey = 'SPEED';
    }
    for (let t = 0; t < this.collisionNotification.length; t += 1) {
      this.collisionNotification[t].alertKey = 'CRASH';
    }
    for (let t = 0; t < this.tripwireNotification.length; t += 1) {
      this.tripwireNotification[t].alertKey = 'TRIPWIRE';
    }
    this.carSettingDetail.dtcDealer = { userId: this.carSettingDetail.currentUserId, firstName: '', state: false, alertId: '', alertKey: 'DTCDEALER', deviceId: this.assetDeviceId };

    for (let i = 0; i < this.alertList.length; i += 1) {
      const alertInfo = this.alertList[i].alertConfiguration;
      switch (alertInfo.alertDetails.alertName) {
        case 'SPEED':
          for (let t = 0; t < this.speedAlertNotification.length; t += 1) {
            // tslint:disable-next-line:max-line-length
            if (this.speedAlertNotification[t].userId == alertInfo.alertDetails.userId && this.speedAlertNotification[t].deviceId == alertInfo.alertDetails.deviceId) {
              this.speedAlertNotification[t].state = alertInfo.status === 'Enabled' ? true : false;
              this.speedAlertNotification[t].alertId = alertInfo.id;
            }
            // this.speedAlertNotification[t].alertKey = 'SPEED';
          }
          break;
        case 'CRASH':
          for (let t = 0; t < this.collisionNotification.length; t += 1) {
            // tslint:disable-next-line:max-line-length
            if (this.collisionNotification[t].userId == alertInfo.alertDetails.userId && this.collisionNotification[t].deviceId == alertInfo.alertDetails.deviceId) {
              this.collisionNotification[t].state = alertInfo.status === 'Enabled' ? true : false;
              this.collisionNotification[t].alertId = alertInfo.id;
            }
            // this.collisionNotification[t].alertKey = 'CRASH';
          }
          break;
        case 'TRIPWIRE':
          for (let t = 0; t < this.tripwireNotification.length; t += 1) {
            // tslint:disable-next-line:max-line-length
            if (this.tripwireNotification[t].userId === alertInfo.alertDetails.userId && this.tripwireNotification[t].deviceId == alertInfo.alertDetails.deviceId) {
              this.tripwireNotification[t].state = alertInfo.status === 'Enabled' ? true : false;
              this.tripwireNotification[t].alertId = alertInfo.id;
            }
            // this.tripwireNotification[t].alertKey = 'TRIPWIRE';
          }
          break;
        case 'DTCDEALER':
          // tslint:disable-next-line:max-line-length
          this.carSettingDetail.dtcDealer = { userId: this.carSettingDetail.currentUserId, firstName: '', state: false, alertId: '', alertKey: 'DTCDEALER', deviceId: this.assetDeviceId };
          if (this.carSettingDetail.currentUserId == alertInfo.alertDetails.userId && this.assetDeviceId == alertInfo.alertDetails.deviceId) {
            // tslint:disable-next-line:max-line-length
            this.carSettingDetail.dtcDealer = { userId: this.carSettingDetail.currentUserId, firstName: '', state: alertInfo.status === 'Enabled' ? true : false, alertId: alertInfo.id, alertKey: 'DTCDEALER', deviceId: this.assetDeviceId };
          }
          break;
      }
    }

    this.carSettingDetail.collisionNotification = _.cloneDeep(this.collisionNotification);
    this.carSettingDetail.tripwireNotification = _.cloneDeep(this.tripwireNotification);
    this.carSettingDetail.speedAlertNotification = _.cloneDeep(this.speedAlertNotification);
  }

  enableSpeedAlert() {
    const changeToStatus = this.speedAlertEnabled ? 'enable' : 'disable';
    const assetId = this.carSettingDetail.selectedCar.asset.id;
    const speedAlert = this.getSpeedAlert();
    if (speedAlert !== this.speedAlertEnabled) {
      this.toggleSpeedAlert(this.carSettingDetail.selectedCar.asset.id, changeToStatus);
    }
  }

  // This is example for api request call and adding to status array
  toggleSpeedAlert(assetId, status) {
    this.speedAlertSubmitting = true;
    
    // sending request to status component
    this.apiStatusProvider.addRequest(assetId, status, 'enableSpeedAlert', this.statusMessages.speedAlert.submit);
    this.updateAPIRequestCount();
    this.carListProvider.updateSpeedAlert(assetId, status).then(
      (res) => {
        if (!(this.carSettingDetail.selectedCar.asset.speedSetting && this.carSettingDetail.selectedCar.asset.speedSetting.speedThreshold)){
          this.getAssetById(assetId);
        }
        setTimeout(() => {
          this.speedAlertSubmitting = false;
        },         1000);
        // sending request to status component
        this.apiStatusProvider.updateRequest(assetId, status, 'enableSpeedAlert', this.statusMessages.speedAlert.success, 'success');
        this.updateAPIRequestCount();
        this.setRequestTimer({ id: assetId, request: status, type: 'enableSpeedAlert', message: this.statusMessages.speedAlert.success },
                             'success');
        if (this.carSettingDetail.selectedCar.asset.speedSetting && this.carSettingDetail.selectedCar.asset.speedSetting.status) {
          this.carSettingDetail.selectedCar.asset.speedSetting.status = this.speedAlertEnabled ? 'ENABLED' : 'DISABLED';
        }
     
        // Enable speed alert notification for login user
        if (this.speedAlertEnabled) {
          const currentUserId = this.carSettingDetail.currentUserId;
          const notifySpeedAlertNotification = _.find(this.carSettingDetail.speedAlertNotification, (item) => {
            return item.userId = currentUserId;
          });
          if (notifySpeedAlertNotification && !notifySpeedAlertNotification.state) {
            notifySpeedAlertNotification.state = true;
            this.updateAlertSetting(notifySpeedAlertNotification, 'SPEED', '');
          }
        }
        // tslint:disable-next-line:align
      },
      (err) => {
        this.speedAlertSubmitting = false;
        // sending request to status component
        this.apiStatusProvider.updateRequest(assetId, status, 'enableSpeedAlert', this.statusMessages.speedAlert.failure, 'failure');
        this.updateAPIRequestCount();
        this.setRequestTimer({ id: assetId, request: status, type: 'enableSpeedAlert', message: this.statusMessages.speedAlert.failure },
                             'failure');
        this.speedAlertEnabled = this.getSpeedAlert();
      });
  }

  setRequestTimer(apiRequest, action) {
    setTimeout(() => {
      this.removeRequest(apiRequest, action);
    },         5000);
  }

  changeInSetting(settingInfo, alertName) {
    this.updateAlertSetting(settingInfo, alertName, '');
  }

  formAlertRequestObject(settingInfo, alertName, esn){
    const alertKeyMap = new Map();
    alertKeyMap.set('CRASH', 'SDCTC_ICN_ALERT');
    alertKeyMap.set('TRIPWIRE', 'SDCTC_TRIPWIRE_ALERT');
    alertKeyMap.set('SPEED', 'SDCTC_SPEED_ALERT');
    alertKeyMap.set('DEALER', 'SDCTC_DTC_DEALER_ALERT');
    alertKeyMap.set('PLACES', 'SDCTC_IZN_ALERT');
    const authToken = this.sharedAPIProvider.getUserInfo().response.authToken;
    const localDeviceToken = this.sharedProvider.getLocalDeviceToken();
    const requestObj = {
      userId: settingInfo.userId,
      alertKey: alertKeyMap.get(settingInfo.alertKey),
      deviceEsn: esn,
      deviceId: settingInfo.deviceId,
      actionType: (settingInfo.dealerEmail && alertName === 'DTCDEALER') ? 'EMAIL' : 'MOBILE_PUSH',
      dealerEmail: settingInfo.dealerEmail,
      platform: this.sharedProvider.getPlatformName(),
      deviceToken: localDeviceToken,
      status: settingInfo.state ? 'Enabled' : 'Disabled',
    };
    return requestObj;
  }
  getAlertId(data) {
    return data ? data.alertId : '';
  }
  updateAlertSetting(settingInfo, alertName, placeInfo) {
    const esn = this.deviceData.device.esn;
    console.log(settingInfo);
    let dealerEmail = this.carSettingDetail.selectedCar.asset.dealership ? (this.carSettingDetail.selectedCar.asset.dealership.email !== '' ? this.carSettingDetail.selectedCar.asset.dealership.email : '') : '';
    dealerEmail = dealerEmail !== '' ? dealerEmail : defaultDealerEmail;
    settingInfo.dealerEmail = dealerEmail;
    const requestObj = this.formAlertRequestObject(settingInfo, alertName, esn);
    if (requestObj.deviceToken) {
      if (settingInfo.alertId === '' || settingInfo.alertId === undefined) {
        requestObj.status = 'Enabled';
        this.carListProvider.createAlertForUser(requestObj, alertName).then(
          (res) => {
            settingInfo.alertId = this.getAlertId(res);
            console.log('alert creation success');
          },
          (err) => {
            settingInfo.state = !settingInfo.state;
            console.log('alert creation failed');
          });
      } else {
        if (alertName === 'PLACES') {
          this.apiStatusProvider.addRequest(placeInfo.geozone.id, settingInfo, alertName, this.statusMessages.places.submit);
          this.updateAPIRequestCount();
        }
        this.carListProvider.updateNotificationSetting(requestObj, settingInfo.alertId, alertName).then(
          (res) => {
            console.log(res);
            if (alertName === 'PLACES') {
              this.apiStatusProvider.updateRequest(placeInfo.geozone.id, settingInfo, alertName, this.statusMessages.places.success,
                                                   'success');
              this.updateAPIRequestCount();
              this.setRequestTimer({ settingInfo, id: placeInfo.geozone.id, type: alertName, message: this.statusMessages.speedAlert.success },
                                   'success');
            }
          },
          (err) => {
            console.log(err);
            if (alertName === 'PLACES') {
              this.apiStatusProvider.updateRequest(placeInfo.geozone.id, settingInfo, alertName, this.statusMessages.places.failure,
                                                   'failure');
              this.updateAPIRequestCount();
              this.setRequestTimer({ settingInfo, id: placeInfo.geozone.id, type: alertName, message: this.statusMessages.places.failure },
                                   'failure');
              this.revertZoneAlerts(placeInfo, settingInfo);
            } else {
              settingInfo.state = !settingInfo.state;
            }
          });
      }
    } else {
      const clearTime = setTimeout(() => {
        settingInfo.state = !settingInfo.state;
        clearTimeout(clearTime);
      },                           1000);
    }
  }
  /************** Setting Global status for API request ************/
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
    if (apiRequest.type === 'enableSpeedAlert') {
      // remove request from failure array
      this.removeRequest(apiRequest, 'failure');
      // resend failed request (add request to submit array)
      this.toggleSpeedAlert(apiRequest.id, apiRequest.request);
    }
    if (apiRequest.type === 'PLACES') {
      const placeInfo = {
        geozone : {
          id: apiRequest.id,
        },
      };
      this.removeRequest(apiRequest, 'failure');
      if (apiRequest.request.alertId !== '') {
        this.updateAlertSetting(apiRequest.request, 'PLACES', placeInfo);
      } else {
        this.createZoneAlert(placeInfo, apiRequest.request);
      }
    }
  }
  /************** Setting Global status for API request ************/

  moveToPreviousPage() {
    const options: NativeTransitionOptions = rightAnimationOptions;
    this.nativePageTransitions.slide(options);
    this.navCtrl.pop();
    // if (this.carCount > 1) {
    //   this.navCtrl.pop();
    // } else {
    //   this.navCtrl.pop(); // CarLocationHomePageComponent
    //   this.navCtrl.pop();
    // }
  }

  gotoCarName() {
    const options: NativeTransitionOptions = leftAnimationOptions;
    this.nativePageTransitions.slide(options);
    this.navCtrl.push(CarNameComponent, { selectedDevice: this.carSettingDetail.selectedCar });
  }

  openServiceRequest() {
    // console.log('openServiceRequest');
    const profileModal = this.modalCtrl.create(RequestServiceComponent, { assetName: this.carSettingDetail.selectedCar });
    profileModal.present();
  }
  openMaxSpeedSettings() {
    console.log('openMaxSpeedSettings');
    const options: NativeTransitionOptions = leftAnimationOptions;
    this.nativePageTransitions.slide(options);
    this.navCtrl.push(SpeedSettingsComponent, { selectedDevice: this.carSettingDetail.selectedCar });

  }
  openURL(url) {
    if (!/^(f|ht)tps?:\/\//i.test(url)) {
      url = 'http://' + url;
    }
    console.log('opening url -> ' + url);
    window.open(encodeURI(url), '_system');
  }

  addNewPlace() {
    // console.log(this.carSettingDetail.selectedCar);
    // console.log(this.assetDeviceId);
    // console.log(this.carSettingDetail.selectedCar.asset.id);
    this.navCtrl.push(GeoZoneComponent, {
      assetDeviceId: this.assetDeviceId,
      assetId: this.carSettingDetail.selectedCar.asset.id,
      geoZoneId: 0,
    });
  }

  getAlertObj() {
    const esn = this.deviceData.device.esn;
    let dealerEmail = this.carSettingDetail.selectedCar.asset.dealership ? (this.carSettingDetail.selectedCar.asset.dealership.email !== '' ? this.carSettingDetail.selectedCar.asset.dealership.email : '') : '';
    dealerEmail = dealerEmail !== '' ? dealerEmail : defaultDealerEmail;
    return {
      esn,
      dealerEmail,
    };
  }
  placeDetails(place) {
    // console.log(place);
    /* const options: NativeTransitionOptions = leftAnimationOptions;
    this.nativePageTransitions.slide(options);
    this.navCtrl.push(GeoZoneDetailsComponent, { selectedPlace: place }); */
    this.navCtrl.push(GeoZoneComponent, {
      geoZone: place.geozone,
      assetDeviceId: this.assetDeviceId,
      assetId: this.carSettingDetail.selectedCar.asset.id || 0,
    });
  }

  getAssetById(assetId) {
    this.CarLocHomeProvider.getAssetbyId(assetId).then((res) => {
    // carSettingDetail.selectedCar.asset.speedSetting?carSettingDetail.selectedCar.asset.speedSetting.speedThreshold
      console.log((<any>res).response.results[0].asset.speedSetting.speedThreshold);
      if ((<any>res).response && (<any>res).response.results && (<any>res).response.results.length && (<any>res).response.results[0].asset && (<any>res).response.results[0].asset.speedSetting && (<any>res).response.results[0].asset.speedSetting.speedThreshold ){
        console.log('get speed');
        this.carSettingDetail.selectedCar.asset = (<any>res).response.results[0];
        this.carSettingDetail.selectedCar.asset.speedSetting = (<any>res).response.results[0].asset.speedSetting;
        this.speederror = false;
      } else {
        this.speederror = true;
        console.log('No speed');
      }

    },                                                 (err) => {
    });
  }

  updateSpeed(speed) {
    this.carListProvider.updateSpeedLimit(this.carSettingDetail.selectedCar.asset.id, speed).then((res) => {
      this.speederror = false;
      this.carSettingDetail.selectedCar.asset.speedSetting = {};
      this.carSettingDetail.selectedCar.asset.speedSetting.speedThreshold = speed ;
    // tslint:disable-next-line:align
    }, (err) => {
      this.speederror = true;
    });
  }

  getGeozoneAddress(addressObj) {
    let addressName = '';
    if (addressObj) {
      addressName += addressObj.street && addressObj.street !== 'null' ? `${addressObj.street}, ` : '';
      addressName += addressObj.city && addressObj.city !== 'null' ? `${addressObj.city}, ` : '';
      addressName += addressObj.stateProvince && addressObj.stateProvince !== 'null' ? `${addressObj.stateProvince}, ` : '';
      addressName += addressObj.country && addressObj.country !== 'null' ? `${addressObj.country}` : '';
    }
    return addressName;
  }
}
