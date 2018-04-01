import { Component, ElementRef, Injectable } from '@angular/core';
import { NavController, ModalController, NavParams } from 'ionic-angular';
import { CollisionSupportPage } from '../collision-support';
import { EsriLoaderService } from 'angular2-esri-loader';
import { CollisionImpactTooltipComponent } from '../collision-impact-tooltip/collision-impact-tooltip';
import * as moment from 'moment';


/**
 * Generated class for the CollisionDetailsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'collision-details',
  templateUrl: 'collision-details.html',
})
@Injectable()
export class CollisionDetailsComponent{

  text: string;
  public collisiondatadetails: any;
  public crashDetails = [{
    date: '',
    level: '',
    address: '',
    latlong: [],
    time: '',
    carename: '',
    stepcolorid: '',
  }];
  public crashdetailsdata = this.crashDetails[0];

  constructor(public navCtrl: NavController, private esriLoader: EsriLoaderService, private element: ElementRef, public modalCtrl: ModalController,
              public navParams: NavParams,

  ) {
    console.log('Hello CollisionDetailsComponent Component');
    this.text = 'Hello World';
    this.collisiondata = navParams.get('data');
    this.collisiondatadetails = navParams.get('datadtails');
    if (this.collisiondatadetails !== undefined) {
      this.crashdetailsdata.date = this.collisiondatadetails.date;// moment(this.collisiondatadetails.crashDate).format('MMMM D, YYYY');
      this.crashdetailsdata.time = this.collisiondatadetails.time;//moment(this.collisiondatadetails.time).format('h : hh A');
      this.crashdetailsdata.level = this.collisiondatadetails.level;
      this.crashdetailsdata.latlong = this.collisiondatadetails.latlong;
      this.crashdetailsdata.carename = this.collisiondatadetails.carename;
      this.crashdetailsdata.stepcolorid = this.maskCollisionSeverityCode(this.collisiondatadetails.level);
      this.crashdetailsdata.address = this.collisiondatadetails.address;
    }
    if (this.collisiondata === undefined) {
     // this.crashdetailsdata.latlong = [-117.7012388, 33.609518999999999];
     // this.crashdetailsdata.stepcolorid = '0';

    } else {
      this.crashdetailsdata.date = moment(this.collisiondata.response.results[0].crashDetails.crashDate).format('MMMM D, YYYY');
      this.crashdetailsdata.time = moment(this.collisiondata.response.results[0].crashDetails.crashDate).format('h : hh A');
      this.crashdetailsdata.level = this.collisiondata.response.results[0].crashDetails.severityCode;
      this.crashdetailsdata.latlong = [this.collisiondata.response.results[0].crashDetails.longitude, this.collisiondata.response.results[0].crashDetails.latitude];
      this.crashdetailsdata.carename = this.collisiondata.response.results[0].crashDetails.year + ' ' + this.collisiondata.response.results[0].crashDetails.make + ' ' + this.collisiondata.response.results[0].crashDetails.model;
      this.crashdetailsdata.stepcolorid = this.maskCollisionSeverityCode(this.collisiondata.response.results[0].crashDetails.severityCode);
      this.crashdetailsdata.address = this.collisiondata.response.results[0].crashDetails.street1 + ', ' + this.collisiondata.response.results[0].crashDetails.city + ', ' + this.collisiondata.response.results[0].crashDetails.stateProvince;
    }
  }
  private map;
  private view;
  private collisiondata: any;
  ionViewDidLoad() {
    this.drawLojackMap();
  }

   ionViewDidLeave() {
    console.log('removing collision  memory');
    this.map = null;
    // this.zeoZoneMap.graphics.removeAll();
    this.view.map = null;
    this.view.container = null;
    // this.zeoZoneMap.constraints = null;
    // this.zeoZoneMap  =null;
  }

  maskCollisionSeverityCode(severityCode) {
    let maskedValue;
    switch (severityCode) {
      case 'VeryLight': maskedValue = 0; break;
      case 'Light': maskedValue = 1; break;
      case 'Moderate': maskedValue = 2; break;
      case 'Heavy': maskedValue = 3; break;
      case 'VeryHeavy': maskedValue = 4; break;
      default: maskedValue = severityCode; break;
    }
    return maskedValue;
  }
  backtocollisian() {
    //this.navCtrl.setRoot(CollisionSupportPage);
    this.navCtrl.pop();

  }
  presentTooltip() {
    console.log('inside presentProfileModel');
    const profileModal = this.modalCtrl.create(CollisionImpactTooltipComponent, {
      image: 'assets/imgs/collisionsupport/Red_Accident.svg',
      title: 'Collision Impact Level',
      // tslint:disable-next-line:max-line-length
    });
    profileModal.present();
  }

  drawLojackMap() {
    //  this.mapLoaderProvider.showMapLoader();
    //this.sharedProvider.showBusyIndicator();

    // 'esri/Map',
    //     'esri/views/MapView',
    //     'esri/views/SceneView',
    //     'esri/layers/GraphicsLayer',
    //     'esri/Graphic',
    //     'dojo/_base/array',
    //     'dojo/on',
    //     'esri/core/urlUtils',
    //     'esri/request',
    //     'esri/config',
    //     'dojo/domReady!',
    //     'esri/symbols/PictureMarkerSymbol',
    //   ]).then(([
    //     Map, MapView, SceneView, GraphicsLayer, Graphic, arrayUtils, on, urlUtils, esriRequest, esriConfig, dojo, PictureMarkerSymbol,
    return this.esriLoader.load({
      // use a specific version of the API instead of the latest
      url: 'https://js.arcgis.com/4.6/',
    }).then(() => {
      this.esriLoader.loadModules([
        'esri/Map',
        'esri/views/MapView',
        'esri/Graphic',
        'esri/config',
        'esri/geometry/Point',
        'esri/symbols/PictureMarkerSymbol',
      ]).then(([
        Map, MapView, Graphic, esriConfig, Point, PictureMarkerSymbol,
      ]) => {
        // esriConfig.request.corsEnabledServers.push('http://goweb2.calamp.com');
        this.map = new Map({
          basemap: 'gray',
        });
        const mapLoadingContainer = this.element.nativeElement.querySelector('#map'); // + data.id);
        this.view = new MapView({
          container: mapLoadingContainer,
          map: this.map,
          zoom: 12,
          center: this.crashdetailsdata.latlong, //[-117.7012388, 33.609518999999999],
          padding: {
            bottom: '50',
          },
        });
        setTimeout(() => {
          const picSymbol = new PictureMarkerSymbol({
            url: 'assets/imgs/collisionsupport/Red_Accident.svg',
            height: 52,
            width: 52,
            // type:  'esriPMS',
          });
          const markerGraphic = new Graphic(new Point(this.crashdetailsdata.latlong), picSymbol);
          this.view.graphics.add(markerGraphic);
          ///  Graphic.add(markerGraphic);
          // add(markerGraphic);
          // graphics
        }, 2000);
      });

    }, (err) => {
      console.log('Failed to load esri 4.6');

    });
  }

}
