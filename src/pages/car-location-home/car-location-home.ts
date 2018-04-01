import { Component, OnInit, ViewChild, ElementRef, Renderer, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, Slides, Platform, Events } from 'ionic-angular';

import { EsriLoaderService } from 'angular2-esri-loader';


import { LoginProvider } from '../../pages/login/login.provider';
// import { EsriLoaderService } from '../../app/core/esri-map/esri-loader.service';
import { AccSetupProvider } from '../../pages/account-setup/components/acc-setup-steps/acc-setup-provider';
import { NotificationPage } from '../notification/notification';
import { LojackMapProvider } from '../../providers/lojack-map/lojack-map';
import { CarLocationHomeProvider } from '../car-location-home/provider/car-location-home';
import { SharedAPIProvider } from '../../providers/shared/sharedAPI';

import { MapLoaderProvider } from '../../providers/map-loader/map-loader';
import { PushNotificationsProvider } from '../../providers/push-notifications/push-notifications';
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { TripHistoryComponent } from '../../components/trip-history/trip-history';
import { SharedProvider } from '../../providers/shared/shared';
import * as moment from 'moment';
import { ApiStatusProvider } from '../../components/api-status/api-status.provider';
import { DragCarDetailsComponent } from './components/drag-car-details/drag-car-details';
import { lojackPhone, DEFAULT_LOCATION,EXPAND_FACTOR, DEFAULT_RADIUS, lojackEmail, initialZoomLevel, leftAnimationOptions, rightAnimationOptions, GEO_ZONES_IMAGES, defaultDealerEmail } from '../../helper/utils';
import * as _ from 'lodash';

@IonicPage({
  name: 'car-location-home',
  segment: 'car-location-home',
})
@Component({
  selector: 'app-page-car-location-home',
  templateUrl: 'car-location-home.html',
  providers: [EsriLoaderService],
})
export class CarLocationHomePageComponent implements OnInit,OnDestroy {

  @ViewChild('mapPane') mapEl: ElementRef;
  @ViewChild(Slides) carSlider: Slides;
  // @ViewChild(TripHistoryComponent) tripsComp: TripHistoryComponent;
  @ViewChild(DragCarDetailsComponent) dragCarDetailsComp: DragCarDetailsComponent;
  carLocationMap: any;
  public statusRequests = {
    submit: [],
    success: [],
    failure: [],
  };
  public requestCount: number = 0;
  public statusTimeout;
  public graphicObject: any;
  public carDetails = [{
    deviceId: '',
    userId: '',
    name: '',
    lat: 12.984716,
    lng: 77.589517,
    status: '',
    carImage: './assets/svg/default_Car.svg',
    carName: '',
    carLocation: '',
    lastUpdate: '',
    since: '',
    assetId: '',
    esnId: '',
    vin: '',
    year: '',
    make: '',
    model: '',
    tripwireBreach: false,
    tripwireModal: true,
    tripwireStatus: false,
    tripwireBreachData: {},
    collisionsupport: false,
    iscolision: {},
    dealerShipInfo: false,
  }];
  public crashDetails = [{
    date: '',
    dateonly: '',
    level: '',
    address: '',
    latlong: [],
    time: '',
    carename: '',
    stepcolorid: '',
    deviceid: '',
  }];
  public updatecrashdetails = '';
  public crashesndetail = this.updatecrashdetails;
  public crashdetailsdata = this.crashDetails[0];
  public collisionObj = [];
  public collisiondata = {};
  public localcollisiondetails = JSON.parse(localStorage.getItem('iscolisiondetaildata'));
  public tripwireBreach = false;
  public collisionsupport = false;
  public tripwireModal = true;
  public tripwireBreachData = {};
  public currentPlaceIcon: string = 'State_Location';
  public iscolision = {};
  public iscolisiondetail = {};
  // private iscolision = [{  lat: 12.984716,
  //   lng: 77.589517 }];
  public res: any;
  public hideWelcomeSlip = true;
  public currentCarItem = this.carDetails[0];
  drawerOptions: any;
  name: string;
  public zoom_Fit = false;
  public zoom_image_val = 'Zoom_Fit_Button';
  public zoomFitEnable = true;
  public geoFileds;
  zoom_center = '';
  zoom_false = 'true';
  drag_false = 'true';
  // map fields
  public featureLayerData;
  public graphicscircle;
  public featureLayerGeocircleData;
  public graphicsGeoZonescircle;
  public featureLayerTxtData;
  public legend;
  public Carsdata;
  public graphics;
  public graphicsText;
  public featureLayercircleData;
  public fields;
  public pointsRenderer;
  onSuccess: any;
  onError: any;
  public esriMapData;
  public carSlliderIndex = 0;
  public initialZoomLevel = initialZoomLevel;
  public tripDetail = false;
  /*multicar*/
  public graphicsPoint: any;
  public isShowDetail = false;
  isShowCarSlider: boolean = true;
  drawerValues: object;
  public reloadingMap;
  public sessionApi;
  public reloadingLocationCounter = 0;
  public tripwireStatus = false;
  public networkError = this.sharedProvider.networkStatus;
  public isTripDetail = false;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public esriLoader: EsriLoaderService,
    public menuCtrl: MenuController,
    public loginProvider: LoginProvider,
    public accountSetupProvider: AccSetupProvider,
    public element: ElementRef,
    public renderer: Renderer,
    public carLocationHomeProvider: CarLocationHomeProvider,
    public sharedAPIProvider: SharedAPIProvider,
    public platform: Platform,
    public lojackMapProvider: LojackMapProvider,
    public events: Events,
    public mapLoaderProvider: MapLoaderProvider,
    public pushNotificationsProvider: PushNotificationsProvider,
    public nativePageTransitions: NativePageTransitions,
    public sharedProvider: SharedProvider,
    public apiStatusProvider: ApiStatusProvider,
  ) {
    this.pushNotificationsProvider.initPushNotification(true, true);
    // this.getUpdateLoaction();

    this.menuCtrl.enable(true, 'lojackMenu');
    // this.currentCarItem = this.carDetails[this.carSlliderIndex];
    this.drawerValues = {
      drawerHeightValue: 0,
    };
    events.subscribe('user:updateLocation', () => {
      this.updateLocation();
    });
    events.subscribe('dissmis:collisiondissmis', () => {
      this.dismiscollision(); 
    });
    events.subscribe('assets:refesh', (obj) => {
      this.upadeAssets(obj.selectedAsset);
    });
    events.subscribe('tripwireState', (status, assetId) => {
      this.tripWireUpdate(status, assetId);
    });
    events.subscribe('network:change', (status) => {
      this.networkError = status;
    });
    /************ Status Component Events ***************/
    this.apiStatusProvider.removeAllRequests();
    events.subscribe('request:tryAgain', (obj) => {
      this.tryAgnain(obj);
    });
    events.subscribe('request:removeFailureRequest', (obj) => {
      this.removeRequest(obj, 'failure');
    });
    /************ Status Component Events ***************/
    this.sharedProvider.updateStatusBar('home');
  }



  public sliderHeight: number = 0;
  public carSliderIndex: number = 0;
  public esriMap;
  public topDrawerOpenSpace: number = 0;
  public tempNotifiId = 0;
  public navigatingMapState = 'default';
  public mapLayersStack = [];
  public reloadingLocation;
  public apiLoadCount = 0;
  public deviceDetails;
  public userInfo;
  public lastEsriCallDateTime: string = new Date().toISOString();
  private isDetailsScrollEnd: boolean = false;

  ionViewDidEnter() {
    // const hammer = new window['Hammer'](this.element.nativeElement);
    // hammer.get('pan').set({ direction: window['Hammer'].DIRECTION_VERTICAL });
    // hammer.on('pan', (ev) => {
    //   if (ev.additionalEvent === 'panup' && !this.tripDetail && !this.isShowDetail) {
    //     this.slideTap();
    //   }
    // });
    this.initialteLojackMapUpdate();
    this.firstTimeWelcomeAnimation();
    this.sliderHeight = this.carSlider.container.clientHeight;
    this.drawerValues = {
      drawerHeightValue: this.sliderHeight + 18,
    };
    const carDetailsSpace = this.element.nativeElement.querySelector('app-car-details-drawer-comp .car-details-space');
    this.topDrawerOpenSpace = this.platform.height() / 3 - 90;
    if (carDetailsSpace) {
      this.renderer.setElementStyle(carDetailsSpace, 'height', this.topDrawerOpenSpace + 'px');
    }
    this.checkUnreadNotifications();

  }
  
  firstTimeWelcomeAnimation() {
    this.userInfo = this.sharedAPIProvider.getUserInfo(); // this.loginProvider.getUserInfo(); response.user.passwordUpdated
    const prevState = localStorage.getItem('welcomePOpupState');
    this.hideWelcomeSlip = (this.userInfo.response.user.passwordUpdated || prevState === 'true') ? true : false;
  }
  // ionViewWillUnload() {
  //   console.log('ionViewWillUnload');
  //   clearInterval(this.reloadingMap);
  //   clearInterval(this.reloadingLocation);
  // }
  ionViewDidLeave() {
    console.log('ionViewDidLeave clearInterval');
    clearInterval(this.reloadingMap);
    clearInterval(this.reloadingLocation);
    clearInterval(this.sessionApi);
  }
 
  ngOnDestroy() {
   this.destroy();
  }
  destroy() {
    // console.log('destroy.........................car-home');
    this.events.unsubscribe('request:removeFailureRequest');
    this.events.unsubscribe('request:tryAgain');
    this.events.unsubscribe('network:change');
    this.events.unsubscribe('tripwireState');
    this.events.unsubscribe('assets:refesh');
    this.events.unsubscribe('dissmis:collisiondissmis');
    this.events.unsubscribe('user:updateLocation');
    // this.carLocationMap.graphics.removeAll();
    // this.featureLayerData = null;
    // this.graphicscircle = null;
    // this.featureLayerGeocircleData = null;
    // this.graphicsGeoZonescircle = null;
    // this.featureLayerTxtData = null;
    // this.legend = null;
    // this.Carsdata = null;
    // this.graphics = null;
    // this.graphicsText = null;
    // this.featureLayercircleData = null;
    // this.fields = null;
    // this.pointsRenderer = null;

    // this.esriMapData = null;
    // this.esriMap = null;
    // this.carLocationMap.container = null;
    // this.carLocationMap.map = null;
    // this.carLocationMap = null;
    // this.carLocationMap.extent = null;
    // this.carLocationMap.destroy();
    // this.statusRequests = null;
    // this.requestCount = null;
    // this.statusTimeout = null;
    // this.graphicObject = null;
    // // this.carDetails = null;
    // // this.crashDetails = null;
    // this.updatecrashdetails = null;
    // this.crashesndetail = null;
    // this.crashdetailsdata = null;
    // this.collisionObj = null;
    // this.collisiondata = null;
    // this.localcollisiondetails = null;
    // // this.tripwireBreachData = null;
    // this.iscolision = null;
    // this.iscolisiondetail = null;
    //     // private iscolision = [{  lat: 12.984716,
    // //   lng: 77.589517 }];
    // this.res = null;
    // this.currentCarItem = null;
    // this.graphicsPoint = null;
    // this.geoFileds = null;
    // // for (let k = 0; k < this.graphicsPoint.length; k++) {
    // //   this.graphicsPoint[k] = null;
    // // }
  }
  initialteLojackMapUpdate() {
    console.log('initialteLojackMapUpdate');
    this.reloadingMap = setInterval(() => {
      this.navigatingMapState = 'interval';
      this.loadSliderContent();
      // const newPoint = { latitude : 32.5978853 , longitude : -117.700635 };
      // const deviceId = 16993;
      // this.updateEsriPoint(deviceId, newPoint);
      console.log('initialteLojackMapUpdate');
    }, 120000);

    this.sessionApi = setInterval(() => {
      console.log('session alive api');
      this.sessionAliveApi();
    }, 1800000);
  }
  sessionAliveApi() {
    this.sharedAPIProvider.getAlertSearchableproperties(this.userInfo.response.authToken).then(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      });
  }
  mainMenuOpen() {
    const options: NativeTransitionOptions = {
      direction: 'right',
      duration: 100,
      iosdelay: 200,
      androiddelay: 150,
    };
    this.nativePageTransitions.slide(options);
    this.menuCtrl.open('lojackMenu');
  }
  notiMenuOpen() {
    this.navCtrl.push(NotificationPage);
  }
  closePopUp() {
    this.hideWelcomeSlip = !this.hideWelcomeSlip;
    localStorage.setItem('welcomePOpupState', 'true');
  }

  getTheGraphicPoint(assetId) {
    for (let i = 0; i < this.graphics.length; i += 1) {
      if (assetId === this.graphics[i].attributes.feature.assetId) {
        return this.graphics[i].symbol;
      }
    }
  }
  getTheGraphicText(assetId) {
    for (let i = 0; i < this.graphics.length; i += 1) {
      if (assetId === this.graphics[i].attributes.feature.assetId) {
        return this.graphicsText[i].symbol;
      }
    }
  }
  slideChanged() {
    if (this.carSlider.realIndex >= this.carSlider.length()) {
      return;
    }
    // Get the Tripwire status for a selected car
    //
    this.carLocationMap.popup.visible = false;
    this.carSliderIndex = this.carSlider.realIndex;
    this.carSliderIndex = (this.carSliderIndex < this.carSlider.length()) ? this.carSliderIndex : this.carSlider.length() - 1;
    // console.log(this.carSliderIndex + '   mmmmmmmmmm  ' + this.carSlider.realIndex);
    /*  console.log(this.carDetails);
     console.log(this.graphics);
     console.log(this.tripwireStatus); */
    /*  this.carSliderIndex = this.carSlider.realIndex;
      // console.log(this.carSlider.realIndex);
      // this.drawerHeightValue = 100; // this.carSlider.realIndex;
      this.currentCarItem = this.carDetails[this.carSliderIndex];
      const pointIs = (this.carSliderIndex % 2 === 0) ? 0 : 1; */
    this.esriLoader.loadModules([
      'esri/geometry/Point',
      'esri/symbols/PictureMarkerSymbol',
    ]).then(([
      Point,
      PictureMarkerSymbol,
    ]) => {
      const currentGraphicIndex = 0;
      if (this.carLocationMap && this.carDetails[this.carSliderIndex]) {
        this.currentCarItem = this.carDetails[this.carSliderIndex];
        // this.carLocationMap.setZoom(10);
        if (this.localcollisiondetails !== null) {

          // for (let i = 0; i < this.localcollisiondetails.length; i++) {
          //   if (JSON.parse(this.localcollisiondetails[i].deviceid) === this.currentCarItem.esnId) {
          //     this.crashesndetail = JSON.parse(this.localcollisiondetails[i].deviceid);
          //     this.collisiondatapass(this.localcollisiondetails[i]);
          //   }
          // }
        }
        const pointConstructgraph = [];
        for (let i = 0; i < this.esriMapData.features.length; i += 1) {
          if (this.esriMapData.features.length > 1) {

            pointConstructgraph[i] = this.lojackMapProvider.getDistanceFromLatLonInKm(
              this.carDetails[this.carSliderIndex].lng,
              this.carDetails[this.carSliderIndex].lat,
              this.esriMapData.features[i].attributes.longitude,
              this.esriMapData.features[i].attributes.latitude, i);
          }
          const newGeoMetric = this.getTheGraphicPoint(this.carDetails[i].assetId); // this.graphics[i].symbol;
          // console.log(newGeoMetric);
          const newGeoMetricText = this.getTheGraphicText(this.carDetails[i].assetId);
          const textval = i === this.carSliderIndex ? '' : this.carDetails[i].carName;
          //  const height =  i === this.carSliderIndex  ? 58 : 24 ;
          // const width =  i === this.carSliderIndex  ? 54 : 20 ;
          // this.currentCarItem.tripwireBreach
          // (this.currentCarItem.assetId == this.carDetails[this.carSliderIndex].assetId && this.currentCarItem.tripwireBreach)
          const height = i === this.carSliderIndex ? this.carDetails[i].tripwireBreach ? 0 : 58 : 24;
          const width = i === this.carSliderIndex ? this.carDetails[i].tripwireBreach ? 0 : 54 : 20;
          let statusImageUrl;
          if (!this.currentCarItem.collisionsupport) {
            statusImageUrl = i === this.carSliderIndex ?
              ((this.esriMapData.features[i].attributes.ignition === 'true') ? 'assets/imgs/car_awareness/Blue_Car_Pin.svg' : 'assets/imgs/car_awareness/Black_Car_Pin_Icon.svg')
              : 'assets/imgs/car_awareness/car_and_arrow.svg';
          } else {
            statusImageUrl = i === this.carSliderIndex ? 'assets/imgs/car_awareness/Red_Car_Pin_Icon.svg' : 'assets/imgs/car_awareness/car_and_arrow.svg';
          }
          newGeoMetric.url = statusImageUrl;
          newGeoMetric.height = height;
          newGeoMetric.width = width;
          newGeoMetricText.text = textval;
        }
        if (this.zoom_Fit === true) {
          this.esriLoader.loadModules([
            'dojo/_base/array',
            'esri/Graphic',
          ]).then(([
            arrayUtils,
            Graphic,
          ]) => {
            const polyline = {
              type: 'polyline', // autocasts as new Polyline()
              paths: [],
            };
            const graphicResult = arrayUtils.map(this.esriMapData.features , (feature) => {
              // console.log(feature);
              // Sets the symbol of each resulting feature to a cone with a
              // fixed color and width. The height is based on the mountain's elevation
              // Create a graphic and add the geometry and symbol to it
              // graphicResult.push(pointGraphic);
              polyline.paths.push([feature.geometry.x, feature.geometry.y]);
              return null;
            });
            const polylineGraphic = new Graphic({
              geometry: polyline,
              // symbol: lineSymbol
            });
            console.log('PolyLine', polylineGraphic.geometry.extent);
            this.carLocationMap.extent = polylineGraphic.geometry.extent.expand(-4);
            /* this.carLocationMap.when(() => {
              return  this.carLocationMap.queryExtent();
            }).then((response) => {
              this.carLocationMap.goTo(response.extent);
            }).catch((error) => {
              console.log(error);
            }); */
          });
        } else if (this.zoom_Fit === false) {
          this.carLocationMap.goTo({
            target: [this.carDetails[this.carSliderIndex].lng, this.carDetails[this.carSliderIndex].lat],
            zoom: this.initialZoomLevel,
          },
            { animate: false, duration: 0, easing: 'ease-out' },
          );
        }
        this.graphicsPoint = pointConstructgraph;
      }
    });

    if (this.currentCarItem.assetId !== this.carDetails[this.carSliderIndex].assetId) {
      this.getTripwireData(this.carDetails[this.carSliderIndex]);
      /* this.carLocationMap.graphics.removeAll();
      this.mapGeoZones(this.carDetails[this.carSliderIndex].deviceId); */
    }
    this.zoom_center = '';
  }
  mapGeoZones(deviceId) {
    this.lojackMapProvider.getDeviceGeoZones(deviceId).then(
      (response: any) => {
        this.mapGeoZonesResponse(response);
      },
      (err) => {
        console.log(err);
      });
  }

  mapGeoZonesResponse(response) {
    if (response && response.response) {
      const deviceResponse: any = response.response.results;
      if (deviceResponse.length > 0) {
        const zoneId = this.lojackMapProvider.getGeoZoneIds(deviceResponse);
        if (zoneId.length > 0) {
          this.lojackMapProvider.searchGeoZones(zoneId).then(
            (res) => {
              const responseObj: any = res;
              this.drawgeozone(responseObj.response.results);
            },
            (err) => {
              console.log(err);
            });
        }
      }
    }
  }
  getGeoZones() {
    this.lojackMapProvider.getGeoZonesZoomFit().then(
      (response) => {
        const responseObj: any = response;
        this.drawgeozone(responseObj.response.results);
      },
      (err) => {
        console.log(err);
      });
  }
  drawgeozone(response) {
    this.geoFileds = response;
    const filterCircle = [];
    if (response.length > 0) {
      response.forEach((item) => {
        if (item.geozone.geoLocation.shape === 'CIRCLE' && item.geozone.geozoneDeployments !== null) {
          filterCircle.push(item);
        }
      });
      this.graphicObject = filterCircle;
      const pointConstructgeoCircle = [];
      this.esriLoader.loadModules([
        'esri/geometry/Point',
        'esri/symbols/PictureMarkerSymbol',
        'esri/geometry/Circle',
        'esri/Graphic',
        'esri/PopupTemplate',
      ]).then(([
        Point,
        PictureMarkerSymbol,
        Circle,
        Graphic,
        PopupTemplate,
      ]) => {
        for (let i = 0; i <= filterCircle.length; i += 1) {
          if (filterCircle[i] !== undefined) {
            const geoZoneCategory = _.find(GEO_ZONES_IMAGES, { key: filterCircle[i].geozone.category });
            this.currentPlaceIcon = geoZoneCategory !== undefined ? geoZoneCategory.Image : this.currentPlaceIcon;
            const latLng = filterCircle[i].geozone.geoLocation.coordinates.split(' ');
            const lng = parseFloat(latLng[0]);
            const lat = parseFloat(latLng[1]);
            const picSymbol = new PictureMarkerSymbol({
              url: 'assets/svg/places_icons/place_active/' + this.currentPlaceIcon + '.svg',
              height: 20,
              width: 20,
              // type:  'esriPMS',
            });
            const pointObj = new Point([lat, lng]);
            const circleGeometry = new Circle(pointObj, {
              radius: DEFAULT_RADIUS,
              geodesic: true,
            });
            const symbol = {
              type: 'simple-fill',  // autocasts as new SimpleFillSymbol()
              color: [216, 216, 216, 0.5],
              outline: {  // autocasts as new SimpleLineSymbol()
                color: [216, 216, 216, 0.4],
                width: 1,
              },
            };
            const ttt = filterCircle[i].geozone.name;
            const template = new PopupTemplate({
              title: `<span class="popup-custom">${ttt}</span>`,
            });
            const polygonGraphic = new Graphic({
              symbol,
              popupTemplate: template,
              geometry: circleGeometry,
            });
            const markerGraphic = new Graphic(new Point([lat, lng]), picSymbol);
            this.carLocationMap.graphics.addMany([polygonGraphic, markerGraphic]);
          }
        }
      });
    }
  }
  centerMarker() {
    this.carLocationMap.goTo({
      target: [this.carDetails[this.carSliderIndex].lng, this.carDetails[this.carSliderIndex].lat],
      zoom: this.initialZoomLevel,
    },
      { animate: false, duration: 10, easing: 'ease-in-out' },
    );
    this.zoom_center = '';
  }
  mapLayerChange() {
    if (this.zoom_Fit === false) {
      this.carLocationMap.popup.visible = false;
      // const geoJson = this.esriMapData;
      // const pointConstructgraph = [];
      this.esriLoader.loadModules([
        'dojo/_base/array',
        'esri/Graphic',
      ]).then(([
        arrayUtils,
        Graphic,
      ]) => {
        const polyline = {
          type: 'polyline', // autocasts as new Polyline()
          paths: [],
        };
        const graphicResult = arrayUtils.map(this.esriMapData.features , (feature) => {
          // console.log(feature);
          // Sets the symbol of each resulting feature to a cone with a
          // fixed color and width. The height is based on the mountain's elevation
          // Create a graphic and add the geometry and symbol to it
          // graphicResult.push(pointGraphic);
          polyline.paths.push([feature.geometry.x, feature.geometry.y]);
          return null;
        });
        const polylineGraphic = new Graphic({
          geometry: polyline,
          // symbol: lineSymbol
        });
        console.log('PolyLine', polylineGraphic.geometry.extent);
        this.carLocationMap.extent = polylineGraphic.geometry.extent.expand(-4);
        /* this.carLocationMap.when(() => {
          return  this.carLocationMap.queryExtent();
        }).then((response) => {
          this.carLocationMap.goTo(response.extent);
        }).catch((error) => {
          console.log(error);
        }); */
      });
      if (this.graphicscircle !== undefined) {
        this.graphicscircle.map((item) => {
          item.symbol.height = 22;
          item.symbol.width = 22;
        });
      }
      this.zoom_Fit = true;
      this.zoom_image_val = 'Zoom_Out_Button';
      // this.getGeoZones();
    } else {
      if (this.graphicscircle !== undefined) {
        this.graphicscircle.map((item) => {
          if (this.currentCarItem.tripwireBreach === true) {
            item.symbol.height = 50;
            item.symbol.width = 50;
          } else {
            item.symbol.height = 140;
            item.symbol.width = 140;
          }
        });
      }
      this.slideChanged();
      this.zoom_Fit = false;
      this.zoom_image_val = 'Zoom_Fit_Button';
    }
  }
  slideTap() {
    // console.log('slideTap' + this.carSlider.realIndex);
    // console.log(this.carDetails[this.carSlider.realIndex]);
    // console.log(this.carDetails[this.carSlider.realIndex]);
    // console.log('slide tap event ' + this.isShowDetail);
    // if(this.carDetails && this.carDetails[this.carSlider.realIndex]){

    
    this.currentCarItem = this.carDetails[this.carSlider.realIndex];
    this.isDetailsScrollEnd = true;

    const index = this.carSlider.realIndex;
    const hammer = new window['Hammer'](this.element.nativeElement);
    hammer.get('pan').set({ direction: window['Hammer'].DIRECTION_VERTICAL });
    hammer.on('pan', (ev) => {
      if (ev.additionalEvent === 'pandown' && !this.tripDetail) {
        this.panDownDetails();
      }
    });
    if (this.carDetails[this.carSlider.realIndex].tripwireBreach) {
      // this.removeCircleMarker();
      // this.createCircleMarker();
      // this.carDetails[this.carSlider.realIndex].tripwireBreachData.tripwireModal  = false;
      this.tripwireModal = false;
      this.carDetails[this.carSlider.realIndex].tripwireModal = this.tripwireModal;
      // this.removeCarMarker();
    } 
    // else {
    //   // this.createGraphics();
    // }
    this.hideWelcomeSlip = true;
    
    this.visibleDrawer();
    // this.renderer.setElementStyle(drawerComp, 'top', '0');
    this.openHeader(0);
    const carSliderContainer = this.element.nativeElement.querySelector('.car-slider-container');
    this.renderer.setElementStyle(carSliderContainer, 'visibility', 'hidden');
    this.drawerValues = {
      drawerHeightValue: this.sliderHeight + 18,
      isSlideTap: true,
    };
    
    // this.drawerValues = {
    //   isSlideTap: true,
    // };
  // }
  }
  // gettingScrollEndData(value) {
  //   if (value) {
  //     this.closeHeader();
  //   }
  // }
  // TODO: Pan up event
  // panUpEvent() {
  //   this.slideTap();
  // }
  panDownDetails() {
    // console.log('panDownDetails');
    if (this.isDetailsScrollEnd) {
      this.isDetailsScrollEnd = false;
      this.closeHeader();
    }
    // console.log(event);
  }
  contentScroll(event) {
    // console.log('contentScroll');
    // console.log(event.scrollTop);
    if (event.scrollTop <= 0) {
      this.isDetailsScrollEnd = true;
    } else {
      this.isDetailsScrollEnd = false;
    }
  }
  toogleTabs(id) {
    if (id === 1) {
      // this.openHeader(0);
      this.tripDetail = true;
      this.isTripDetail = true;
      // this.tripsComp.getTrips();
    } else {
      this.tripDetail = false;
    }
  }
  visibleDrawer() {
    const drawerComp = this.element.nativeElement.querySelector('app-car-details-drawer-comp');
    if (drawerComp) {
      this.renderer.setElementStyle(drawerComp, 'visibility', 'visible');
    }
  }
  openHeader(height) {
    // this.tripsComp.initTrips();
    this.slideHeaderAnimation(height);
  }
  
  slideHeaderAnimation(height) {
    this.isShowDetail = true;
    this.tripDetail = false;
    const drawerHeader = this.element.nativeElement.querySelector('.car-details-header');
    if (drawerHeader) {
      this.renderer.setElementStyle(drawerHeader, 'transition', 'all 0.3s ease 0s');
      this.renderer.setElementStyle(drawerHeader, 'top', height + 'px');
    }
    const mapPane = this.element.nativeElement.querySelector('#mapPane');
    this.renderer.setElementStyle(mapPane, 'transition', 'all 0.3s ease 0s');
    this.renderer.setElementStyle(mapPane, 'bottom', this.topDrawerOpenSpace - 70 - height + 'px');

    const drawerComp = this.element.nativeElement.querySelector('app-car-details-drawer-comp');
    if (drawerComp) {
      this.renderer.setElementStyle(drawerComp, 'top', 90 + height + 'px');
    }
    this.sharedProvider.hideBusyIndicator();
  }
  closeHeader() {
    // console.log('Current car itrem ' + JSON.stringify(this.currentCarItem));
    setTimeout(() => {this.isTripDetail = false; }, 500);
    this.isShowDetail = true;
    const carSliderContainer = this.element.nativeElement.querySelector('.car-slider-container');
    this.renderer.setElementStyle(carSliderContainer, 'visibility', 'visible');
    if (this.requestCount > 0) {
      this.dragCarDetailsComp.cancelToggleTripwire();
      this.apiStatusProvider.removeAllRequests();
      this.updateAPIRequestCount();
    }

    this.isShowDetail = false;
    this.sharedProvider.hideBusyIndicator();
    const drawerHeader = this.element.nativeElement.querySelector('.car-details-header');
    if (drawerHeader) {
      this.renderer.setElementStyle(drawerHeader, 'transition', 'all 0.3s ease 0s');
      this.renderer.setElementStyle(drawerHeader, 'top', '-90px');
      this.drawerValues = {
        drawerHeightValue: this.sliderHeight + 18,
        isDrawerClose: true,
      };
    }
    const mapPane = this.element.nativeElement.querySelector('#mapPane');
    this.renderer.setElementStyle(mapPane, 'transition', 'all 0.3s ease 0s');
    this.renderer.setElementStyle(mapPane, 'bottom', '0');

    const drawerComp = this.element.nativeElement.querySelector('app-car-details-drawer-comp');
    if (drawerComp) {
      this.renderer.setElementStyle(drawerComp, 'top', '0px');
    }

    if (this.currentCarItem.tripwireBreach) {
      // console.log('removing marker');
      const tripWireRemove = this.getTheGraphicPoint(this.carDetails[this.carSliderIndex].assetId);
      // console.log(tripWireRemove);
      tripWireRemove.height = 0;
      tripWireRemove.width = 0;
      this.removeCircleMarker();
      this.tripwireModal = true;
      this.carDetails[this.carSliderIndex].tripwireModal = this.tripwireModal
    }
  }
  // ionViewDidLoad() {
  //   this.res = this.loginProvider.getUserInfo();
  //   // if(this.res.response.user.username ==)
  //   // console.log('this.res');
  //   // console.log(this.res);
  //   // console.log(this.res.response.user.username);
  //   let isSingleCar = false;
  //   if (this.res.response.user.username === 'suredrive.test@gmail.com') {
  //     isSingleCar = true;
  //   }
  //   this.loadSliderContent(isSingleCar);
  // }

  loadSliderContent() {
    this.apiLoadCount = 0;
    this.loadDeviceData();
    // this.loadMapContent();
  }

  loadDeviceData() {
    this.sharedAPIProvider.getDeviceDetails(this.userInfo.response.authToken).then((deviceDetails) => {
      const accId = (this.userInfo.response.user.account.href).split('/');
      this.sharedAPIProvider.setDeviceDetails(deviceDetails);
      this.deviceDetails = deviceDetails;
      this.apiLoadCount = this.apiLoadCount + 1;
      this.loadMapContent();
      // this.successOfDeviceAndMapContent();
    }, (err) => {
      console.log(' there is problem in getDeviceDetails API');
      this.mapLoaderProvider.hideMapLoader();
    });
  }
  loadMapContent() {
    const assetIds = this.getAssetIds(this.deviceDetails);
    const accId = (this.userInfo.response.user.account.href).split('/');
    this.carLocationHomeProvider.getEsriAPIContent(accId[accId.length - 1], assetIds, this.lastEsriCallDateTime).then((esriDetails) => {
      this.esriMapData = esriDetails;
      if (esriDetails) {
        this.apiLoadCount = this.apiLoadCount + 1;
        this.successOfDeviceAndMapContent();
      } else {
        // this.successOfDeviceAndMapContent(); if esri wont returen data needs to be handled
      }

    }, (err) => {
      console.log(' there is problem in getEsriAPIContent API');
      this.mapLoaderProvider.hideMapLoader();
      // this.successOfDeviceAndMapContent(); if esri wont returen data needs to be handled
    });
  }
  getAssetIds(deviceDetails) {
    const deviceObj = [];
    const deviceDetailsLen = deviceDetails.response.results.length;
    for (let i = 0; i < deviceDetailsLen; i += 1) {
      if (deviceDetails.response.results[i].asset) {
        deviceObj.push(
          Number(deviceDetails.response.results[i].asset.id ? deviceDetails.response.results[i].asset.id : ''),
        );
      }
      if (i >= deviceDetailsLen - 1) {
        return deviceObj;
      }
    }
  }

  successOfDeviceAndMapContent() {
    console.log('successOfDeviceAndMapContent function');
    // if (this.apiLoadCount > 1) {
    const accId = (this.userInfo.response.user.account.href).split('/');
    this.loadCardInfo(this.deviceDetails, this.esriMapData, accId[accId.length - 1]);
    this.zoomFitEnable = this.carDetails.length > 1 ? true : false;
    this.createGraphics();
    this.mapLoaderProvider.hideMapLoader();
    // }
  }

  getUpdateLoaction() {
    clearInterval(this.reloadingLocation);
    const info = 'LOADING';
    this.mapLoaderProvider.showMapLoader(info);
    const userInfo = this.sharedAPIProvider.getUserInfo(); // this.loginProvider.getUserInfo();
    this.sharedAPIProvider.getDeviceDetails(userInfo.response.authToken).then((deviceDetails) => {
      this.sharedAPIProvider.setDeviceDetails(deviceDetails);
      this.getLocateApi(userInfo, deviceDetails);
    },
      (err) => {
        console.log(' there is problem in getDeviceDetails API');
        this.mapLoaderProvider.hideMapLoader();
      });
    setTimeout(() => {
      clearInterval(this.reloadingLocation);
      this.mapLoaderProvider.hideMapLoader();
    }, 30000);
  }

  // getCurrentDeviceId() {
  //   // currentCarItem = this.carDetails[0];
  //   const deviceDetailsLen = deviceDetails.response.results.length;
  //   for (let i = 0; i < deviceDetailsLen; i += 1) {
  //     if (deviceDetails.response.results[i].asset) {
  //       deviceObj.push(
  //         Number(deviceDetails.response.results[i].asset.id ? deviceDetails.response.results[i].asset.id : ''),
  //       );
  //     }
  //     if (i >= deviceDetailsLen - 1) {
  //       return deviceObj;
  //     }
  //   }
  // }

  getLocateApi(userInfo, deviceDetails) {
    const getCurrentDeviceId = this.currentCarItem.deviceId;
    this.carLocationHomeProvider.getLocateRequest(userInfo.response.authToken, getCurrentDeviceId).then(
      (LocateDetails) => {
        this.reloadingLocationCounter = 0;
        this.reloadingLocation = setInterval(() => {
          this.reloadingLocationCounter = this.reloadingLocationCounter + 1;
          // if (this.reloadingLocationCounter >= 10) {
          //   clearInterval(this.reloadingLocation);
          //   this.cancelLocate(userInfo, LocateDetails);
          // } else
          // {
          this.getTrackLocateApi(userInfo, LocateDetails, this.reloadingLocationCounter);
          // }
        },                                   2000);
      },
      (err) => {
        clearInterval(this.reloadingLocation);
        console.log(' there is problem in getTrackLocate API');
        this.mapLoaderProvider.hideMapLoader();
      });
  }

  getTrackLocateApi(userInfo, LocateDetails, locationInterval) {
    this.carLocationHomeProvider.getTrackLocateRequest(userInfo.response.authToken, LocateDetails.response.results[0].deviceCommandEvent.messageUuid).then((trackLocate) => {
      this.stopInterval(trackLocate, locationInterval, userInfo, LocateDetails);
    }, (err) => {
      clearInterval(this.reloadingLocation);
      console.log(' there is problem in getLocateRequest API');
      this.mapLoaderProvider.hideMapLoader();
    });

  }

  stopInterval(trackLocate, locationInterval, userInfo, LocateDetails) {
    if (trackLocate.response.results[0].deviceCommandEvent.status === 'COMPLETED') {
      console.log('update location COMPLETED');
      clearInterval(this.reloadingLocation);
      // this.cancelLocate(userInfo, LocateDetails);
      this.navigatingMapState = 'update';
      this.mapLoaderProvider.hideMapLoader();
      // this.loadSliderContent();
      this.changeTheUpdatedCarInfo(trackLocate.response.results[0].deviceCommandEvent);
    }
    else if (locationInterval >= 10) {
      clearInterval(this.reloadingLocation);
      console.log('cancelLocate the update interval')
      this.cancelLocate(userInfo, LocateDetails);
    }

  }

  changeTheUpdatedCarInfo(updatedLocation) {
    this.apiLoadCount = 2;
    for (let j = 0; j < this.esriMapData.features.length; j += 1) {
      if ((this.esriMapData.features[j].attributes.deviceId === updatedLocation.deviceId)) {
        this.esriMapData.features[j].attributes.latitude = updatedLocation.response.locateReportResponse.address.addressLatitude;
        this.esriMapData.features[j].attributes.longitude = updatedLocation.response.locateReportResponse.address.addressLongitude;
        this.esriMapData.features[j].attributes.ignition = (updatedLocation.response.locateReportResponse.inputs.ignition).toString();
        this.esriMapData.features[j].attributes.street = updatedLocation.response.locateReportResponse.address.crossStreet;
        // this.esriMapData.features[j].attributes.dataPumpPullTime=updatedLocation.response.locateReportResponse.address.;
        const updateTime = moment(new Date(updatedLocation.response.locateReportResponse.updateTime)).format('x'); // 'h:mm A'
        this.esriMapData.features[j].attributes.eventTime = updateTime;
      }
    }
    this.successOfDeviceAndMapContent();
  }
  cancelLocate(userInfo, LocateDetails) {
    this.mapLoaderProvider.hideMapLoader();
    this.carLocationHomeProvider.cancelLocateRequest(userInfo.response.authToken, LocateDetails.response.results[0].deviceCommandEvent.messageUuid).then((trackLocate) => {
    },                                                                                                                                                   (err) => {
      console.log(' there is problem in cancelLocateRequest API');
    });
  }

  loadCardInfo(deviceDetails, esriDetails, accId) {
    const sliderIndex = (this.carSlider.realIndex > 0) ? this.carSlider.realIndex : 0;
    const allCards = this.carLocationHomeProvider.constructCarsObject(deviceDetails, esriDetails, accId);
    this.parseLoadCardInfo(allCards, sliderIndex);
    this.checkCollision(allCards);

    /*  Get tripwire brach api data */
    this.localcollisiondetails = JSON.parse(localStorage.getItem('iscolisiondetaildata'));
    /*  Get tripwire brach api data */
    // this.tripwireBreachdata = JSON.parse(localStorage.getItem('tripwireBreachdata'));
    /*this.carLocationHomeProvider.constructCarsObject(deviceDetails, esriDetails, accId).then((deviceObj) => {
      this.parseLoadCardInfo(deviceObj, sliderIndex);
    // if (sliderIndex > 0) {
    //   for (let ele = 0; ele <= allCards.length; ele++){
    //     this.carDetails[ele] = allCards[ele];
    //   }
    // } else {
    //   this.carDetails = allCards;
    // }


    },                                                                                       (err) => {

      console.log('Failed to load the assets and devices');
    });*/
  }



  parseLoadCardInfo(allCards, sliderIndex) {
    if (allCards.length > 0 && allCards[sliderIndex]) {
      if (sliderIndex < 1 || this.navigatingMapState === 'default') {
        this.carDetails = allCards;
        this.sliderReset();
        this.currentCarItem = this.carDetails[sliderIndex];
        setTimeout(
          () => {
            // console.log(' updateupdateupdateupdate');
            this.sliderHeight = this.carSlider.container.clientHeight;
            // console.log('this.sliderHeight');
            // console.log(this.sliderHeight);
            // this.carSlider.update();
            this.carSlider.slideTo(sliderIndex, 100);
          },
          200,
        );
      } else {
        // for (let ele = 0; ele <= allCards.length; ele++){
        //   this.carDetails[ele] = allCards[ele];
        // }
        this.carDetails = allCards;
        this.currentCarItem = this.carDetails[sliderIndex];
      }
    } else {
      console.log('Failed to load the assets and devices');
    }
    this.getTripwireData(this.currentCarItem);
    /* get asset id */
  }



  getTripwireData(assetObj) {
    console.log('insideTripWire', assetObj);
    this.tripwireStatus = assetObj.tripwireStatus;
    // this.tripwireStatus = true;
    if (this.tripwireStatus) {
      this.removeCircleMarker();
      this.createCircleMarker();
    } else {
      this.removeCircleMarker();
    }
  }


  checktripwireBreach(result) {
    let retvalue = false;
    if (result && result.response && result.response.results && result.response.results.length && result.response.results[0] && result.response.results[0].asset && result.response.results[0].asset.tripwire && result.response.results[0].asset.tripwire.isSet) {
      retvalue = result.response.results[0].asset.tripwire;
    }
    return retvalue;

  }

  setTripwirebreachdata(asset, tripwireBreachData) {
    this.removeCircleMarker();
    this.tripwireBreach = true;
    this.tripwireBreachData = tripwireBreachData.response.results[0].asset.tripwire;
    /* Assetid check*/
    for (let i = 0; i < this.carDetails.length; i++) {
      if (asset == this.carDetails[i].assetId) {
        this.carDetails[i].tripwireBreach = true;
        this.carDetails[i].tripwireBreachData = tripwireBreachData.response.results[0].asset.tripwire;
      }
    }
    //this.currentCarItem.tripwireBreach = true;
    // this.currentCarItem.tripwireBreachData = this.tripwireBreachData;


    console.log();

  }

  checkCollision(allCards) {
    if (this.localcollisiondetails == null) {
      for (let i = 0; i < allCards.length; i++) {
        this.getCollisionData(allCards[i].esnId);
      }

    } // else {
    //   for (let i = 0; i < this.localcollisiondetails.length; i++) {
    //     if (JSON.parse(this.localcollisiondetails[i].deviceid) != this.currentCarItem.esnId) {
    //       this.getCollisionData(allCards[i].esnId);
    //     }
    //   }

    // }

  }
  collisiondatapass(localcollisiondetails) {
    this.iscolision = localcollisiondetails;
    //  this.crashdetailsdata == localcollisiondetails;
  }
  getCollisionData(esnId) {
    this.carLocationHomeProvider.fetchCollisionSummary(esnId).then((res) => {
      this.collisionSummary(res);

    }, (err) => {
      this.sharedProvider.parseResponse(err);
      //  this.collisionAPICount++;
    });

  }


  collisionSummary(res) {
    if (res.response.results.length === 0) {

    } else {
      this.carLocationHomeProvider.getcollisiondetails(res.response.results[0].crash.icnId).then((collisiondatas) => {
        this.collisionSummarydetails(collisiondatas);
        this.iscolisiondetail = this.collisionObj;
        localStorage.setItem('iscolisiondetaildata', JSON.stringify(this.iscolisiondetail));
        this.localcollisiondetails = JSON.parse(localStorage.getItem('iscolisiondetaildata'));
        if (localStorage.getItem('iscolisiondetaildata') !== null) {
          for (let i = 0; i < this.localcollisiondetails.length; i++) {
            for (let j = 0; j < this.carDetails.length; j++) {
              if (JSON.parse(this.carDetails[j].esnId) === JSON.parse(this.localcollisiondetails[i].deviceid)) {
                this.carDetails[j].collisionsupport = true;
                this.carDetails[j].iscolision = this.localcollisiondetails[i];
              }

            }

            // if (JSON.parse(this.localcollisiondetails[i].deviceid) == this.currentCarItem.esnId) {
            //   this.crashesndetail = this.localcollisiondetails[i].deviceid;
            //   //  this.updatecrashdetails = this.localcollisiondetails[i].deviceid;
            //   this.carDetails[i].collisionsupport = true;
            //   this.carDetails[i].iscolision = this.localcollisiondetails[i];
            //   this.collisiondatapass(this.localcollisiondetails[i]);
            //   console.log('localcollisiondetails123' + JSON.stringify(this.localcollisiondetails[i]));
            // } else {
            //   this.carDetails[i].collisionsupport = false;

            //   this.carDetails[i].iscolision = {};

            // }
          }
          this.createGraphics();
        }
        //   this.loadSliderContent();
      }, (err) => {
        console.log(err);
        this.sharedProvider.parseResponse(err);
      });

    }


  }



  collisionSummarydetails(collisiondatas) {

    for (let j = 0; j < this.esriMapData.features.length; j++) {
      if ((this.esriMapData.features[j].attributes.deviceEsn === collisiondatas.response.results[0].crashDetails.deviceId)) {
        this.collisionObj.push({
          date: moment(collisiondatas.response.results[0].crashDetails.crashDate).format('MMMM D, YYYY'),
          dateonly: moment(collisiondatas.response.results[0].crashDetails.crashDate).format('MMMM D'),
          time: moment(collisiondatas.response.results[0].crashDetails.crashDate).format('h : hh A'),
          level: collisiondatas.response.results[0].crashDetails.severityCode,
          latlong: [collisiondatas.response.results[0].crashDetails.longitude, collisiondatas.response.results[0].crashDetails.latitude],
          carename: collisiondatas.response.results[0].crashDetails.year + ' ' + collisiondatas.response.results[0].crashDetails.make + ' ' + collisiondatas.response.results[0].crashDetails.model,
          // this.crashdetailsdata.stepcolorid = this.maskCollisionSeverityCode(collisiondatas.response.results[0].crashDetails.severityCode);
          address: collisiondatas.response.results[0].crashDetails.street1 + ', ' + collisiondatas.response.results[0].crashDetails.city + ', ' + collisiondatas.response.results[0].crashDetails.stateProvince,
          deviceid: collisiondatas.response.results[0].crashDetails.deviceId, //this.currentCarItem.esnId

        });
      }
    }
    this.iscolision = this.collisionObj;
    //    =
  }
  removeCircleMarker() {
    this.esriMap.remove(this.featureLayercircleData);
  }


  removeCarMarker() {
    // this.esriMap.remove(this.featureLayerData);
  }
  sliderReset() {
    if (this.carDetails.length <= 1) {
      this.carSlider.loop = false;
      this.carSlider.slidesPerView = 1;
    } else {
      this.carSlider.loop = false;
      this.carSlider.slidesPerView = 1.1;
      this.carSlider.spaceBetween = 8;
    }
  }

  ngOnInit() {
    this.drawLojackMap();
    this.sliderReset();
  }
  drawLojackMap() {
    this.mapLoaderProvider.showMapLoader();
    return this.esriLoader.load({
      // use a specific version of the API instead of the latest
      url: 'https://js.arcgis.com/4.6/',
    }).then(() => {
      this.esriLoader.loadModules([
        'dojo/dom-construct',
        'esri/Map',
        'esri/views/MapView',
        'esri/layers/VectorTileLayer',
        'esri/layers/FeatureLayer',
        'esri/Graphic',
        'esri/geometry/Point',
        'esri/symbols/PictureMarkerSymbol',
        'esri/core/watchUtils',
      ]).then(([
        domConstruct,
        Map,
        MapView,
        VectorTileLayer,
        FeatureLayer,
        Graphic,
        Point,
        PictureMarkerSymbol,
        watchUtils,
      ]) => {
        this.esriMap = new Map({
          basemap: 'gray-vector',
        });
        this.carLocationMap = new MapView({
          map: this.esriMap,
          container: this.mapEl.nativeElement,  // Reference to the DOM node that will contain the view
          center: [DEFAULT_LOCATION.long, DEFAULT_LOCATION.lat],
          zoom: this.initialZoomLevel,
          slider: false,
          padding: {
            bottom: '166',
          },
          constraints: {
            rotationEnabled: false,
          },
          popup: {
            dockEnabled: false,
            dockOptions: {
              // Disables the dock button from the popup
              buttonEnabled: false,
              // Ignore the default sizes that trigger responsive docking
              breakpoint: false,
            },
          },
        });
        const tileLyr = new VectorTileLayer({
          url: 'assets/json/root.json',
        });
        this.esriMap.add(tileLyr);
        this.carLocationMap.on('drag', this.mapzPoint);
        // this.carLocationMap.on('update-end', mapLoaded);
        // let self=this;
        //  setTimeout(() => {
        //   this.drawLayersOnMap();
        //  }, 10000);
        this.carLocationMap
          .when(() => {
            this.loadSliderContent();
          });
      }, (reason) => {
        // rejection
        console.log('Failed to load esri 4.6' + reason);
        setTimeout(() => {
          this.drawLojackMap();
        }, 5000);
      });
    }, (err) => {
      console.log('Failed to load esri 4.6' + err);
      this.mapLoaderProvider.hideMapLoader();
      setTimeout(() => {
        this.drawLojackMap();
      }, 5000);
    });
  }
  mapzPoint = (evt) => {
    if ((this.zoom_Fit === false && evt.action === 'update' || evt.action === 'end') && (evt.x && evt.y)) {
      const pointt = this.carLocationMap.toMap({ x: evt.x, y: evt.y });
      const pointConstructgraph = [];
      for (let i = 0; i < this.esriMapData.features.length; i += 1) {
        const selectedCard = this.esriMapData.features[i].attributes.longitude !== this.carDetails[this.carSliderIndex].lng;
        if (this.esriMapData.features.length > 1) {
          pointConstructgraph[i] = selectedCard === true ? this.lojackMapProvider.getDistanceFromLatLonInKm(
            pointt.longitude, pointt.latitude,
            this.esriMapData.features[i].attributes.longitude,
            this.esriMapData.features[i].attributes.latitude,
            i) : '';
        }
        /*   if (evt.action === 'end') {
          this.carLocationMap.watch('extent', (newValue, oldValue) => {
              if (newValue.extent.contains(this.graphics[i].geometry) && selectedCard === true) {
                if (this.graphicsPoint[i].longitude === this.graphics[i].geometry.longitude) {
                  this.graphicsPoint[i].angle = '';
                }
              } else {
                if (this.esriMapData.features.length > 1) {
                  pointConstructgraph[i] =  selectedCard === true ?
                    this.lojackMapProvider.getDistanceFromLatLonInKm(pointt.longitude, pointt.latitude,
                                                                     this.esriMapData.features[i].attributes.longitude,
                                                                     this.esriMapData.features[i].attributes.latitude, i) :'';
                }
                if (typeof pointConstructgraph !== 'undefined' && pointConstructgraph.length > 0) {
                  this.graphicsPoint[i] = pointConstructgraph[i];
                }
              }
          });
        } */
      }
      this.graphicsPoint = pointConstructgraph;
    }
    if (evt.action === 'end' && this.zoom_Fit !== true) {
      const centerrr = true;
      // console.log(centerrr);
      this.zoom_center = 'Focus_Icon';
      // console.log(this.zoom_center);
    }
  }

  processDeviceData() {

    // this.Carsdata = this.carLocationHomeProvider.constructMapObject(data);
    /// console.log(this.esriMap);
    // this.carLocationMap.goTo([this.Carsdata[0].lng, this.Carsdata[0].lat], { animate: true, duration: 1000, easing: 'ease-in-out' });
    this.createGraphics();
  }

  /**************************************************
     * Create graphics with returned geojson data
     **************************************************/
  createGraphics() {
    // raw GeoJSON data
    const geoJson = this.esriMapData;
    const pointConstruct = [];
    const pointConstructgraph = [];
    this.esriLoader.loadModules([
      'esri/geometry/Point',
      'esri/symbols/PictureMarkerSymbol',
      'esri/symbols/TextSymbol',
    ]).then(([
      Point,
      PictureMarkerSymbol,
      TextSymbol,
    ]) => {
      //let statusImageUrl;
      const sliderIndex = (this.carSliderIndex > 0) ? this.carSliderIndex : 0;
      for (let i = 0; i < this.esriMapData.features.length; i += 1) {
        if (this.esriMapData.features.length > 1) {
          pointConstructgraph[i] =
            this.lojackMapProvider.getDistanceFromLatLonInKm(
              this.esriMapData.features[sliderIndex].attributes.longitude,
              this.esriMapData.features[sliderIndex].attributes.latitude,
              this.esriMapData.features[i].attributes.longitude,
              this.esriMapData.features[i].attributes.latitude, i);
        }
        // console.log('..........navigatingMapState........' + this.navigatingMapState);
        // console.log('.......sliderIndex...........' + sliderIndex);
        // console.log('..................' + this.navigatingMapState);
        if (i === sliderIndex && (this.navigatingMapState === 'update' || this.navigatingMapState === 'default')) {

          this.carLocationMap.goTo({
            target: [this.esriMapData.features[i].attributes.longitude, this.esriMapData.features[i].attributes.latitude],
            zoom: this.initialZoomLevel,
          },
            { animate: true, duration: 1000, easing: 'ease-in-out' });
        }
        this.localcollisiondetails = JSON.parse(localStorage.getItem('iscolisiondetaildata'));
        if (localStorage.getItem('iscolisiondetaildata') !== null) {
          for (let i = 0; i < this.localcollisiondetails.length; i++) {
            for (let j = 0; j < this.carDetails.length; j++) {
              if (JSON.parse(this.carDetails[j].esnId) === JSON.parse(this.localcollisiondetails[i].deviceid)) {
                this.carDetails[j].collisionsupport = true;
                this.carDetails[j].iscolision = this.localcollisiondetails[i];
              }

            }
          }

        }
        /* if (this.navigatingMapState === 'interval') {
          statusImageUrl = i === sliderIndex ?
          ((this.esriMapData.features[i].attributes.ignition === 'true') ? 'assets/imgs/car_awareness/Blue_Car_Pin.svg' : 'assets/imgs/car_awareness/Black_Car_Pin_Icon.svg')
          : 'assets/imgs/car_awareness/car_and_arrow.svg';
          /* if (!this.currentCarItem.collisionsupport) {
            statusImageUrl = i === sliderIndex ?
              ((this.esriMapData.features[i].attributes.ignition === 'true') ? 'assets/imgs/car_awareness/Blue_Car_Pin.svg' : 'assets/imgs/car_awareness/Black_Car_Pin_Icon.svg')
              : 'assets/imgs/car_awareness/car_and_arrow.svg';
          } else {
            statusImageUrl = i === sliderIndex ? 'assets/imgs/car_awareness/Red_Car_Pin_Icon.svg' : 'assets/imgs/car_awareness/car_and_arrow.svg';
          } */
        /* pointConstruct[i] = {
          geometry: new Point({
            x: this.esriMapData.features[i].attributes.longitude,
            y: this.esriMapData.features[i].attributes.latitude,
          }),
          symbol: new PictureMarkerSymbol({
            type: 'picture-marker',
            url: 'assets/imgs/car_awareness/' + statusImageUrl,
            height: i === sliderIndex ? this.currentCarItem.tripwireBreach ? 0 : 58 : 24,
            width: i === sliderIndex ? this.currentCarItem.tripwireBreach ? 0 : 54 : 20,
            xoffset: 0,
            yoffset: 20,
          }),
          // select only the attributes you care about
          attributes: { feature: this.esriMapData.features[i].attributes, id: i },
        }; */
        // }
        /*  } else {
           statusImageUrl = i === sliderIndex ?
               ((this.esriMapData.features[i].attributes.ignition === 'true') ? 'assets/imgs/car_awareness/Blue_Car_Pin.svg' : 'assets/imgs/car_awareness/Black_Car_Pin_Icon.svg')
               : 'assets/imgs/car_awareness/car_and_arrow.svg'; */
        /* if (!this.currentCarItem.collisionsupport) {
          
        } else if (this.currentCarItem.collisionsupport) {
          statusImageUrl = i === 0 ? 'assets/imgs/car_awareness/Red_Car_Pin_Icon.svg' : 'assets/imgs/car_awareness/car_and_arrow.svg';
        } else {
          statusImageUrl = i === 0 ?
            ((this.esriMapData.features[i].attributes.ignition === 'true') ? 'assets/imgs/car_awareness/Blue_Car_Pin.svg' : 'assets/imgs/car_awareness/Black_Car_Pin_Icon.svg')
            : 'assets/imgs/car_awareness/car_and_arrow.svg';
        } */
        /*  pointConstruct[i] = {
           geometry: new Point({
             x: this.esriMapData.features[i].attributes.longitude,
             y: this.esriMapData.features[i].attributes.latitude,
           }),
           symbol: new PictureMarkerSymbol({
             type: 'picture-marker',
             url: 'assets/imgs/car_awareness/' + statusImageUrl,
             height: i === 0 ? 58 : 24,
             width: i === 0 ? 54 : 20,
             // xoffset: 26,
             yoffset: 20,
           }),
           // select only the attributes you care about
           attributes: { feature: this.esriMapData.features[i].attributes, id: i },
         }; */
        //} 
        // console.log(statusImageUrl);
        /* if (this.currentCarItem.collisionsupport) {
          pointConstruct[i] = {
            geometry: new Point({
              x: this.esriMapData.features[i].attributes.longitude,
              y: this.esriMapData.features[i].attributes.latitude,
            }),
            symbol: new PictureMarkerSymbol({
              type: 'picture-marker',
              url: 'assets/imgs/car_awareness/Red_Car_Pin_Icon.svg',
              height: i === sliderIndex ? 58 : 24,
              width: i === sliderIndex ? 54 : 20,
              xoffset: 0,
              yoffset: 20,
            }),
            // select only the attributes you care about
            attributes: { feature: this.esriMapData.features[i].attributes, id: i },
          };
        } */
        // }
        if (this.navigatingMapState === 'interval') {
          console.log('carDetail Interver', this.carDetails);
          const statusImageUrl = i === sliderIndex ? this.currentCarItem.collisionsupport ? 'Red_Car_Pin_Icon.svg' :
            ((this.esriMapData.features[i].attributes.ignition === 'true') ? 'Blue_Car_Pin.svg' : 'Black_Car_Pin_Icon.svg')
            : 'car_and_arrow.svg';
          pointConstruct[i] = {
            geometry: new Point({
              x: this.esriMapData.features[i].attributes.longitude,
              y: this.esriMapData.features[i].attributes.latitude,
            }),
            symbol: new PictureMarkerSymbol({
              type: 'picture-marker',
              url: 'assets/imgs/car_awareness/' + statusImageUrl,
              // height: i === sliderIndex ? this.currentCarItem.tripwireBreach ? 0 : 58 : 24,
              // width: i === sliderIndex ? this.currentCarItem.tripwireBreach ? 0 : 54 : 20,
              height: i === this.carSliderIndex ? this.carDetails[this.carSliderIndex].tripwireBreach ? 0 : 58 : 24,
              width: i === this.carSliderIndex ? this.carDetails[this.carSliderIndex].tripwireBreach ? 0 : 54 : 20,

              // height: i === sliderIndex ? 58 : 24,
              // width: i === sliderIndex ? 54 : 20,
              // height: i === sliderIndex ? 58 : 24,
              // width: i === sliderIndex ? 54 : 20,
              xoffset: 0,
              yoffset: 20,
            }),
            // select only the attributes you care about
            attributes: { feature: this.esriMapData.features[i].attributes, id: i },
          };
          // }
        } else {
          const statusImageUrl = i === sliderIndex ? this.currentCarItem.collisionsupport ? 'Red_Car_Pin_Icon.svg' :
            ((this.esriMapData.features[i].attributes.ignition === 'true') ? 'Blue_Car_Pin.svg' : 'Black_Car_Pin_Icon.svg')
            : 'car_and_arrow.svg';
          pointConstruct[i] = {
            geometry: new Point({
              x: this.esriMapData.features[i].attributes.longitude,
              y: this.esriMapData.features[i].attributes.latitude,
            }),
            symbol: new PictureMarkerSymbol({
              type: 'picture-marker',
              url: 'assets/imgs/car_awareness/' + statusImageUrl,
              height: i === sliderIndex ? this.currentCarItem.tripwireBreach && !this.currentCarItem.collisionsupport ? 0 : 58 : 24,
              width: i === sliderIndex ? this.currentCarItem.tripwireBreach && !this.currentCarItem.collisionsupport ? 0 : 54 : 20,
              // height: i === 0 ? 58 : 24,
              // width: i === 0 ? 54 : 20,
              // xoffset: 26,
              yoffset: 20,
            }),
            // select only the attributes you care about
            attributes: { feature: this.esriMapData.features[i].attributes, id: i },
          };
        }
        // }
      }
      this.graphics = pointConstruct;
      this.graphicsPoint = pointConstructgraph;
      // if(this.navigatingMapState === 'default'){
      this.createLayer(this.graphics);
    });
    this.createGraphicsText();
  }
  createGraphicsText() {
    // raw GeoJSON data
    const geoJson = this.esriMapData;
    const pointConstructTextgr = [];
    const pointConstructText = [];
    this.esriLoader.loadModules([
      'esri/geometry/Point',
      'esri/symbols/TextSymbol',
    ]).then(([
      Point,
      TextSymbol,
    ]) => {
      const sliderIndex = (this.carSliderIndex > 0) ? this.carSliderIndex : 0;
      for (let i = 0; i < this.esriMapData.features.length; i += 1) {
        const textValu = i === this.carSliderIndex ?
          '' : this.esriMapData.features[i].attributes.assetName;
        pointConstructTextgr[i] = {
          geometry: new Point({
            x: this.esriMapData.features[i].attributes.longitude,
            y: this.esriMapData.features[i].attributes.latitude,
          }),
          symbol: new TextSymbol({
            type: 'text',  // autocasts as new TextSymbol()
            color: '#212121',
            text: textValu,
            xoffset: 0,
            yoffset: 0,
            font: {  // autocast as new Font()
              size: 7,
              family: 'Neo Sans Std',
              weight: 'bolder',
            },
          }),
          // select only the attributes you care about
          attributes: { feature: this.esriMapData.features[i].attributes, id: i },
        };
        // }
      }
      this.graphicsText = pointConstructTextgr;
      // if(this.navigatingMapState === 'default'){
      this.createLayerText(this.graphicsText);
    });
  }
  createCircleMarker() {
    // raw GeoJSON data
    const geoJson = this.esriMapData;
    const pointConstructTextgra = [];
    const pointConstructText = [];
    this.esriLoader.loadModules([
      'esri/geometry/Point',
      'esri/symbols/PictureMarkerSymbol',
    ]).then(([
      Point,
      PictureMarkerSymbol,
    ]) => {
      const sliderIndex = (this.carSliderIndex > 0) ? this.carSliderIndex : 0;
      for (let i = 0; i < this.esriMapData.features.length; i += 1) {
        pointConstructTextgra[i] = {
          geometry: new Point({
            x: this.carDetails[this.carSliderIndex].lng,
            y: this.carDetails[this.carSliderIndex].lat,
          }),
          symbol: new PictureMarkerSymbol({
            type: 'picture-marker',
            url: 'assets/svg/Oval_TripWire.svg',
            height: this.carDetails[this.carSliderIndex].tripwireBreach ? 50 : this.zoom_Fit === true ?  22 : 140,
            width: this.carDetails[this.carSliderIndex].tripwireBreach ? 50 : this.zoom_Fit === true ? 22 : 140,
            // xoffset: 26,
            yoffset: 0,
          }),
          // select only the attributes you care about
          attributes: { feature: this.esriMapData.features[i].attributes, id: i },
        };
        // }
      }
      this.graphicscircle = pointConstructTextgra;
      // if(this.navigatingMapState === 'default'){
      this.createLayercircleMarker(this.graphicscircle);
    });
  }
  redirectToLocation(locationInfo) {
    locationInfo.sliderIndex = (locationInfo.sliderIndex) ? locationInfo.sliderIndex : 0;
    setTimeout(() => {
      this.carLocationMap.goTo({
        target: [locationInfo.longitude, locationInfo.latitude],
        zoom: this.initialZoomLevel,
      },
        { animate: true, duration: 1000, easing: 'ease-in-out' });
    });
    this.carSlider.slideTo(locationInfo.sliderIndex, 100);
  }
  /**************************************************
        * Create a FeatureLayer with the array of graphics
        **************************************************/
  createLayer(graphics) {
    // if (this.esriMap && this.esriMap.layers.length>0) {
    // this.esriMap.featureLayer.graphics.clear();
    // console.log("this.esriMap.featureLayerthis.esriMap.featureLayerthis.esriMap.featureLayer");
    // console.log(this.esriMap.featureLayer);
    // this.esriMap.layers.remove();
    // }
    // this.esriMap.eachLayer((layer) => {
    //   this.esriMap.removeLayer(layer);
    // });
    this.esriLoader.loadModules([
      'esri/geometry/Point',
      'esri/layers/FeatureLayer',
      'esri/core/watchUtils',
    ]).then(([
      Point,
      FeatureLayer,
      watchUtils,
    ]) => {
      const layer = new FeatureLayer({
        supportsEditing: true,
        supportsAdd: true,
        fieldAliases: this.esriMapData.fieldAliases,
        source: this.graphics, // autocast as an array of esri/Graphic
        // create an instance of esri/layers/support/Field for each field object
        fields: this.esriMapData.fields, // this.fields, // This is required when creating a layer from Graphics
        objectIdField: 'ObjectID', // This must be defined when creating a layer from Graphics
        // renderer: this.pointsRenderer, // set the visualization on the layer
        spatialReference: {
          wkid: 4326,
        },
        geometryType: 'point', // Must be set when creating a layer from Graphics
        // refreshInterval : 0.1667,
      });
      //  if(this.featureLayerData){
      //   this.esriMap.removeLayer(layer);
      //  }
      if (this.esriMap && this.esriMap.layers.length > 0) {
        this.esriMap.remove(this.featureLayerData);
        // console.log('clearrrrrrrrrrrrrrrrrrrrrrrrr');
      }
      this.esriMap.add(layer);
      this.carLocationMap.watch('extent', (newValue, oldValue) => {
        if (this.esriMapData.features.length > 1) {
          const pointConstructgraph = [];
          for (let i = 0; i < this.esriMapData.features.length; i += 1) {
            const selectedCard = this.graphics[i].geometry.longitude !== this.carDetails[this.carSliderIndex].lng;
            if (newValue.extent.contains(this.graphics[i].geometry) && selectedCard === true && this.zoom_Fit === false) {
              if (this.graphicsPoint[i].longitude === this.graphics[i].geometry.longitude) {
                this.graphicsPoint[i].angle = 'none';
              }
            } else {
              if (this.esriMapData.features.length > 1) {
                pointConstructgraph[i] =
                  this.lojackMapProvider.getDistanceFromLatLonInKm(
                    this.esriMapData.features[this.carSliderIndex].attributes.longitude,
                    this.esriMapData.features[this.carSliderIndex].attributes.latitude,
                    this.esriMapData.features[i].attributes.longitude,
                    this.esriMapData.features[i].attributes.latitude, i);
              }
              this.graphicsPoint[i] = pointConstructgraph[i];
            }
          }
        }
      });
      this.carLocationMap.on('click', (evt) => {
        if (this.zoom_Fit === true) {
          this.carLocationMap.hitTest(evt.screenPoint).then((response) => {
            if (response.results[0].graphic.attributes !== undefined && response.results[0].graphic.symbol !== null) {
              setTimeout(() => {
                this.carSliderIndex = response.results[0].graphic.attributes.id;
                this.slideChanged();
                this.carSlider.slideTo(response.results[0].graphic.attributes.id, 100);
              });
              // this.carSlider.slideTo(response.results[0].graphic.attributes.id, 100);
              /* console.log(response);
              this.carSlider.slideTo(response.results[0].graphic.attributes.id, 100); */
            }
          });
        }
      });
      this.featureLayerData = layer;
      // console.log('this.esriMap.featureLayer');
      // console.log(this.esriMap);
      // this.slideChanged();
      /*required for updating specific location
       const newPoint = { latitude : 32.5978853 , longitude : -117.700635 };
       const deviceId = 16993;
       this.updateEsriPoint(deviceId, newPoint);*/
    });
    if (!this.graphicObject) {
      this.getGeoZones();
    }
  }
  createLayerText(graphics) {
    // if (this.esriMap && this.esriMap.layers.length>0) {
    // this.esriMap.featureLayer.graphics.clear();
    // console.log("this.esriMap.featureLayerthis.esriMap.featureLayerthis.esriMap.featureLayer");
    // console.log(this.esriMap.featureLayer);
    // this.esriMap.layers.remove();
    // }
    // this.esriMap.eachLayer((layer) => {
    //   this.esriMap.removeLayer(layer);
    // });
    this.esriLoader.loadModules([
      'esri/geometry/Point',
      'esri/layers/FeatureLayer',
      'esri/geometry/Extent',
      'esri/geometry/SpatialReference',
      'esri/symbols/TextSymbol',
    ]).then(([
      Point,
      FeatureLayer,
      Extent,
      TextSymbol,
      SpatialReference,
    ]) => {
      const layertxt = new FeatureLayer({
        supportsEditing: true,
        supportsAdd: true,
        supportExtent: true,
        fieldAliases: this.esriMapData.fieldAliases,
        source: this.graphicsText, // autocast as an array of esri/Graphic
        // create an instance of esri/layers/support/Field for each field object
        fields: this.esriMapData.fields, // this.fields, // This is required when creating a layer from Graphics
        objectIdField: 'ObjectID', // This must be defined when creating a layer from Graphics
        // renderer: this.pointsRenderer, // set the visualization on the layer
        spatialReference: {
          wkid: 4326,
        },
        geometryType: 'point', // Must be set when creating a layer from Graphics
        // refreshInterval : 0.1667,
      });
      //  if(this.featureLayerData){
      //   this.esriMap.removeLayer(layer);
      //  }
      /*    if (this.esriMap && this.esriMap.layers.length>1) {
          this.esriMap.remove(this.featureLayerData);
          console.log('clearrrrrrrrrrrrrrrrrrrrrrrrr');
        } */
      if (this.esriMap && this.esriMap.layers.length > 0) {
        this.esriMap.remove(this.featureLayerTxtData);
      }
      this.esriMap.add(layertxt);

      this.featureLayerTxtData = layertxt;
      /*required for updating specific location
       const newPoint = { latitude : 32.5978853 , longitude : -117.700635 };
       const deviceId = 16993;
       this.updateEsriPoint(deviceId, newPoint);*/
    });
  }
  createLayercircleMarker(graphics) {
    // if (this.esriMap && this.esriMap.layers.length>0) {
    // this.esriMap.featureLayer.graphics.clear();
    // console.log("this.esriMap.featureLayerthis.esriMap.featureLayerthis.esriMap.featureLayer");
    // console.log(this.esriMap.featureLayer);
    // this.esriMap.layers.remove();
    // }
    // this.esriMap.eachLayer((layer) => {
    //   this.esriMap.removeLayer(layer);
    // });
    this.esriLoader.loadModules([
      'esri/geometry/Point',
      'esri/layers/FeatureLayer',
      'esri/symbols/PictureMarkerSymbol',
    ]).then(([
      Point,
      FeatureLayer,
      PictureMarkerSymbol,
    ]) => {
      const layercircle = new FeatureLayer({
        supportsEditing: true,
        supportsAdd: true,
        supportExtent: true,
        fieldAliases: this.esriMapData.fieldAliases,
        source: this.graphicscircle, // autocast as an array of esri/Graphic
        // create an instance of esri/layers/support/Field for each field object
        fields: this.esriMapData.fields, // this.fields, // This is required when creating a layer from Graphics
        objectIdField: 'ObjectID', // This must be defined when creating a layer from Graphics
        // renderer: this.pointsRenderer, // set the visualization on the layer
        spatialReference: {
          wkid: 4326,
        },
        geometryType: 'point', // Must be set when creating a layer from Graphics
        // refreshInterval : 0.1667,
      });
      //  if(this.featureLayerData){
      //   this.esriMap.removeLayer(layer);
      //  }
      /*    if (this.esriMap && this.esriMap.layers.length>1) {
          this.esriMap.remove(this.featureLayerData);
          console.log('clearrrrrrrrrrrrrrrrrrrrrrrrr');
        } */
      if (this.esriMap && this.esriMap.layers.length > 0) {
        this.esriMap.remove(this.featureLayercircleData);
      }
      this.esriMap.add(layercircle);
      /*  if (this.esriMap && this.esriMap.layers.length > 0) {
         this.esriMap.remove(this.featureLayerTxtData);
         console.log('clearrrrrrrrrrrrrrrrrrrrrrrrr');
       } */
      this.featureLayercircleData = layercircle;
      /*required for updating specific location
       const newPoint = { latitude : 32.5978853 , longitude : -117.700635 };
       const deviceId = 16993;
       this.updateEsriPoint(deviceId, newPoint);*/
    });
  }
  updateEsriPoint(deviceId, newPoint) {
    setTimeout(() => {
      this.esriLoader.loadModules([
        'esri/geometry/Point',
        'esri/symbols/PictureMarkerSymbol',
      ]).then(([
        Point,
        PictureMarkerSymbol,
      ]) => {
        let currentGraphicIndex = 0;
        for (let k = 0; k < this.esriMap.layers.items[0].source.items.length; k += 1) {
          if (Number(deviceId) === Number(this.esriMap.layers.items[0].source.items[k].attributes.deviceId)) {
            currentGraphicIndex = k;
            // return;
          }
        }

        // const newGeoMetric = {
        //   geometry: new Point({
        //     x: newPoint.longitude,
        //     y: newPoint.latitude,
        //   }),
        //   symbol: new PictureMarkerSymbol({
        //     type: 'picture-marker',
        //     url: 'assets/imgs/car_awareness/Blue_Car_Pin.svg',
        //     height: 58,
        //     width: 54,
        //   }),
        //   // select only the attributes you care about
        //   attributes: this.esriMap.layers.items[0].source.items[currentGraphicIndex].attributes,
        //   layer: this.esriMap.layers.items[0].source.items[currentGraphicIndex].layer,
        // };

        const newGeoMetric = this.esriMap.layers.items[0].source.items[currentGraphicIndex];

        newGeoMetric.geometry.x = newPoint.longitude;
        newGeoMetric.geometry.y = newPoint.latitude;
        newGeoMetric.geometry.latitude = newPoint.latitude;
        newGeoMetric.geometry.longitude = newPoint.longitude;
        if (this.currentCarItem.collisionsupport) {
          newGeoMetric.symbol = new PictureMarkerSymbol({
            type: 'picture-marker',
            url: 'assets/imgs/car_awareness/Red_Car_Pin_Icon.svg',
            height: 58,
            width: 54,
          });
        } else {
          newGeoMetric.symbol = new PictureMarkerSymbol({
            type: 'picture-marker',
            url: 'assets/imgs/car_awareness/Blue_Car_Pin.svg',
            height: 58,
            width: 54,
          });

        }

        this.esriMap.layers[0].source = newGeoMetric;

        // this.graphics[currentGraphicIndex].symbol = '';
        this.graphics[currentGraphicIndex] = newGeoMetric;
        this.esriMap.layers.items[0].source.items[0] = '';
        this.esriMap.layers.items[0].source.items[0] = newGeoMetric;
        // this.esriMap.layers.items[0].source.items[currentGraphicIndex].geometry = new Point({
        //   x: newPoint.longitude,
        //   y: newPoint.latitude,
        // });
        // this.esriMap.layers.items[0].source.items[currentGraphicIndex].symbol = new PictureMarkerSymbol({
        //   type: 'picture-marker',
        //   url: 'assets/imgs/car_awareness/Blue_Car_Pin.svg',
        //   height: 58,
        //   width: 54,
        // });
        this.carLocationMap.goTo({
          // target: [this.esriMap.layers.items[0].source.items[0].geometry.longitude,
          // this.esriMap.layers.items[0].source.items[0].geometry.latitude],
          target: [newPoint.longitude, newPoint.latitude],
          zoom: this.initialZoomLevel,
        },
                                 { animate: true, duration: 1000, easing: 'ease-in-out' });


      });

    },         10000);
  }
  // updateGeometry(view, graphic, newGeometry){
  //    // get layer.  either the graphic is in its own layer or it's
  //    // on the view' graphic layer
  //    var lyr = this.esriMap.layer;

  //    // clone old graphic and edit geometry
  //    var newGraphic = graphic.clone();
  //    newGraphic.geometry = newGeometry;

  //    // remove old graphic, add new graphic
  //    lyr.remove(graphic);
  //    lyr.add(newGraphic);
  // }
  drawLayersOnMap() {
    // console.log('drawLayersOnMap');

    this.esriLoader.loadModules([
      'esri/layers/FeatureLayer',
      'esri/layers/support/Field',
      'esri/geometry/Point',
      'esri/renderers/SimpleRenderer',
      'esri/symbols/SimpleMarkerSymbol',
      'esri/Graphic',
      'esri/symbols/PictureMarkerSymbol',
    ]).then(([
      FeatureLayer,
      Field,
      Point,
      SimpleRenderer,
      SimpleMarkerSymbol,
      Graphic,
      PictureMarkerSymbol,
    ]) => {


      /**************************************************
    * Define the specification for each field to create
    * in the layer
    **************************************************/

      this.fields = this.carLocationHomeProvider.getLayerSpecification();
      this.pointsRenderer = new SimpleRenderer({
        symbol: new PictureMarkerSymbol({
          type: 'picture-marker',
          url: 'assets/imgs/car_awareness/Black_Car_Pin_Icon.svg',
          height: 58,
          width: 54,
        }),
      });
      this.processDeviceData();
      // this.carLocationHomeProvider.getDeviceData().then((responseData) => {
      //  if(responseData) {
      //    this.processDeviceData(responseData.response.results);
      //  }
      // }, (err) => {
      //   if(err) {
      //     this.processDeviceData(err.response.results);
      //   }
      // });


    });

  }

  // Slider animation functions
  movingSlider(types) {
    let nextSlideIndex = 0;
    if (this.carSlider.realIndex >= this.carSlider.length()) {
      return;
    }
    if (this.carSlider._touches.diff > 0) {

      if (this.carSlider.realIndex === 0) {
        nextSlideIndex = 0;
      } else {
        nextSlideIndex = this.carSlider.realIndex - 1;
      }
    } else {
      if (this.carSlider.realIndex >= (this.carSlider.length() - 1)) {
        nextSlideIndex = this.carSlider.length() - 1;
      } else {
        nextSlideIndex = this.carSlider.realIndex + 1;
      }
    }
    if (this.carSlider) {
      const touchDIstence = (this.carSlider._touches.diff > 0) ? this.carSlider._touches.diff : (this.carSlider._touches.diff * -1);
      const percentageMoved = (touchDIstence / window.innerWidth) * 100;
      if ((nextSlideIndex >= this.carSlider.length() - 1) || this.carSlider.realIndex > this.carSlider.realIndex) {
        nextSlideIndex = this.carSlider.length() - 1;
      }
      // this.carLocationMap.setZoom(10);
      if (this.carDetails[this.carSlider.realIndex] && this.carDetails[nextSlideIndex]) {
        if (this.zoom_Fit === true) {
          this.carSliderIndex = this.carSlider.realIndex;
          this.slideChanged();
        } else {
          this.carSliderIndex = this.carSlider.realIndex;
          this.slideChanged();
          // this.moveMap([this.carDetails[this.carSlider.realIndex].lat, this.carDetails[this.carSlider.realIndex].lng], [this.carDetails[nextSlideIndex].lat, this.carDetails[nextSlideIndex].lng], percentageMoved);
        }
      }
    }
  }
  slideEventComplente(typesAre) {
  }
  panEnd() {
    if (this.carSlider.realIndex >= this.carSlider.length()) {
      return;
    }
    const sliderIndex = this.carSlider.realIndex; // this.carSlider.realIndex < this.carSlider.length() ? this.carSlider.realIndex : this.carSlider.length() - 1;
    if (this.zoom_Fit === true) {
      this.carSliderIndex = sliderIndex;
      this.slideChanged();
    } else {
      /*  this.carLocationMap.goTo({
         target: [this.carDetails[sliderIndex].lng, this.carDetails[sliderIndex].lat], // [this.esriMapData.features[sliderIndex].attributes.longitude, this.esriMapData.features[sliderIndex].attributes.latitude],
         zoom: this.initialZoomLevel,
       },
                                { animate: true, duration: 100, easing: 'ease-in-out' }); */
      this.carSliderIndex = sliderIndex;
      this.slideChanged();
    }
  }
  moveMap(locationA, locationB, percentage) {
    const lat1 = Number(locationA.toString().split(',')[0]);
    const long1 = Number(locationA.toString().split(',')[1]);
    const lat2 = Number(locationB.toString().split(',')[0]);
    const long2 = Number(locationB.toString().split(',')[1]);
    // percentage=(percentage)>100?100:(percentage);
    const lat3 = lat1 + (lat2 - lat1) / 100 * (percentage + 50);
    const long3 = long1 + (long2 - long1) / 100 * (percentage + 50);
    this.carLocationMap.goTo({
      target: [long3, lat3],
      zoom: this.initialZoomLevel,
    },
                             { animate: true, duration: 100, easing: 'ease-in-out' });
  }
  updateLocation() {
    this.getUpdateLoaction();
    // this.mapLoaderProvider.showMapLoader();
    // setTimeout(() => {
    //   this.mapLoaderProvider.hideMapLoader();
    // }, 3500);

    // setTimeout(() => {
    //   this.triggerPushNotification();
    // }, 15000);
  }
  dismiscollision() {
    this.currentCarItem.collisionsupport = false;
    localStorage.removeItem('iscolisiondetaildata');
    this.slideChanged();
  }
  triggerPushNotification() {

    const notificationData = [
      {
        type: 'tripwire-alert',
        title: 'Volvo V40 breached the TripWire.',
        time: '8:48 AM',
      },
      {
        type: 'battery-alert',
        title: 'Volvo V40 needs a battery replacement.',
        time: '8:48 AM',
      },
      {
        type: 'arrived-alert',
        title: 'Night Fury arrived at School.',
        time: '8:48 AM',
      },
    ];
    if (this.tempNotifiId < 3) {
      this.pushNotificationsProvider.showNotification(notificationData[this.tempNotifiId]);
    }
    this.tempNotifiId = this.tempNotifiId + 1;
  }

  /************** Setting Global status for Tripwire API request ************/
  updateAPIRequestCount() {
    const requestsObj = this.apiStatusProvider.getRequests();
    // this.requestRaised(requestsObj);
    this.requestRaised({ requestsObj });
  }
  removeRequest(apiRequest, action) {
    if (this.requestCount > 0) {
      if (action === 'failure') {
        this.apiStatusProvider.removeFailureRequest(apiRequest);
      }
      if (action === 'success') {
        this.apiStatusProvider.removeSuccessRequest(apiRequest);
      }
      clearTimeout(this.statusTimeout);
      this.updateAPIRequestCount();
    }
  }
  tryAgnain(apiRequest) {
    if (apiRequest.type === 'toggleTripwire') {
      // remove request from failure array
      this.removeRequest(apiRequest, 'failure');
      // resend failed request (add request to submit array)
      this.dragCarDetailsComp.toggleTripwireATS(apiRequest.request);
    }
  }
  setRequestTimer(apiRequest, action) {
    this.statusTimeout = setTimeout(() => {
      this.removeRequest(apiRequest, action);
    },                              5000);
  }

  requestRaised(obj) {
    // console.log('tripwire status bar');
    this.statusRequests = obj.requestsObj.statusRequests;
    this.requestCount = obj.requestsObj.requestCount;
    this.showStatusBar();
    if (this.statusRequests.success.length > 0) {
      this.setRequestTimer(this.statusRequests.success[0], 'success');
    } else if (this.statusRequests.failure.length > 0) {
      this.setRequestTimer(this.statusRequests.failure[0], 'failure');
    }
    if (obj.updateRequired === true) {
      this.tripwireStatus = obj.status;
      if (obj.status) {
        this.removeCircleMarker();
        this.createCircleMarker();
      } else {
        this.removeCircleMarker();
      }
    }
  }
  tripWireUpdate (status, assetobj) {
    this.tripwireStatus = status;
    const assetIndexDeviceDetail = _.findIndex(this.deviceDetails.response.results, { asset: { id:  assetobj.assetId } });
    const assetIndexcarDetail = _.findIndex(this.carDetails, { assetId : assetobj.assetId });
    if (assetIndexcarDetail > -1) {
      this.carDetails[assetIndexcarDetail].tripwireStatus =  status;
    }
    if (assetIndexDeviceDetail > -1) {
      if (this.deviceDetails.response.results[assetIndexDeviceDetail].asset.tripwire) {
        this.deviceDetails.response.results[assetIndexDeviceDetail].asset.tripwire.isSet = status;
      }
    }
    // console.log('getcarDetails', this.carDetails);
    // if(this.carDetails.assetId === this.carDetails)
    // this.upadeAssets(assetId, 'Tripwire');
    // this.upadeAssets(status, 'Tripwire');
    if (status) {
      this.removeCircleMarker();
      this.createCircleMarker();
    } else {
      this.removeCircleMarker();
    }
  }
  showStatusBar() {
    const statusBar = this.element.nativeElement.querySelector('app-api-status');
    let height;
    if (this.statusRequests.submit.length > 0 || this.statusRequests.success.length > 0) {
      height = 30;
    } else if (this.statusRequests.failure.length > 0) {
      height = 70;
    } else {
      height = 0;
    }
    if (statusBar) {
      this.renderer.setElementStyle(statusBar, 'transition', 'all 0.3s ease 0s');
      this.renderer.setElementStyle(statusBar, 'top', '0px');
    }
    if (this.isShowDetail) {
      this.slideHeaderAnimation(height);
      this.sharedProvider.hideBusyIndicator();
    }
  }

  /************** Setting Global status for Tripwire API request ************/

  extractAlertIds(data) {
    let alertIds = '';
    this.sharedProvider.hideBusyIndicator();
    if (data) {
      data.alertId ? alertIds = data.alertId : alertIds = '';
    }
    return alertIds;
  }
  checkUnreadNotifications() {
    console.log('cheking unread notifications');
    const currentUser = this.sharedAPIProvider.getUserInfo();
    if (!this.sharedProvider.getAlertIds()) {
      this.sharedProvider.getAlertId(currentUser.response.authToken, currentUser.response.user.id).then((res) => {
        const alertIds = this.extractAlertIds(res);
        if (alertIds) {
          this.sharedProvider.setAlertIds(res);
          this.sharedProvider.fetchNotification(currentUser, alertIds, 1).then((alertRes) => {
            this.updateBellIcon(alertRes);
          },                                                                   (alertErr) => {
            console.log('API failed to get notifications, hence can\'t update bell icon'); console.log(alertErr);
          });
        } else {
          console.log('alertId not found for this user');
        }
      },                                                                                                (err) => {
        console.log('API failed to provide alertIds for notifications'); console.log(err);
      });
    } else {
      this.sharedProvider.fetchNotification(currentUser, this.extractAlertIds(this.sharedProvider.getAlertIds()), 1).then((alertRes) => {
        this.updateBellIcon(alertRes);
      },                                                                                                                  (alertErr) => {
        console.log('API failed to get notifications, hence can\'t update bell icon'); console.log(alertErr);
      });
    }
  }
  updateBellIcon(data) {
    if (data && data.response && data.response.results) {
      const d = data.response.results;
      for (let i = 0; i < d.length; i += 1) {
        if (d[i].alertsFired.isAcknowledged === false) {
          this.sharedProvider.setUnreadMessage(true);
          break;
        }
      }
    }
  }

  upadeAssets(assetObj) {
    const assetIndex = _.findIndex(this.carDetails, { assetId: assetObj.asset.id });
    const assetIndex2 = _.findIndex(this.deviceDetails.response.results, { asset: { id: assetObj.asset.id } });
    if (assetIndex > -1) {
      this.carDetails[assetIndex].carName = assetObj.asset.name;
    }
    if (assetIndex2 > -1) {
      this.deviceDetails.response.results[assetIndex2] = assetObj;
    }
  }

  tripwireDismissed(carDetailsItem) {
    this.reDrawMarker(carDetailsItem);

    this.carLocationHomeProvider.getAssetbyId(carDetailsItem.assetId).then((res) => {
      this.carLocationHomeProvider.putAssetbyId(carDetailsItem.assetId, res).then((result) => {
      },                                                                          (errorData) => {

      });

    },                                                                     (err) => {

    });
  }
  reDrawMarker(carDetailsItem) {
    this.slideChanged();
  }
}
