import { Component, OnInit, ViewChild, ElementRef, Renderer, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { EsriLoaderService } from 'angular2-esri-loader';
import { NavController, NavParams, ActionSheetController, Events } from 'ionic-angular';
import { MapLoaderProvider } from '../../providers/map-loader/map-loader';
import { LojackMapProvider } from '../../providers/lojack-map/lojack-map';
import { SharedAPIProvider } from '../../providers/shared/sharedAPI';
import { SharedProvider } from '../../providers/shared/shared';
import { GEO_ZONES_IMAGES, DEFAULT_RADIUS, DEFAULT_LOCATION } from '../../helper/utils';
// import circle from '@turf/circle';
import { point } from '@turf/helpers';
import * as moment from 'moment';
import * as _ from 'lodash';

// export interface UpdateGetGeoZone {
//   id: string;
//   name: string;
//   address: string;
// }

/**
 * Generated class for the GeoZoneComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'app-geo-zone',
  templateUrl: 'geo-zone.html',
})
export class GeoZoneComponent  {

  @ViewChild('geoZoneMap') mapEl: ElementRef;
  constructor(
    private NavPrms: NavParams,
    private esriLoader: EsriLoaderService,
    private mapLoaderProvider: MapLoaderProvider,
    private lojackMapProvider: LojackMapProvider,
    private element: ElementRef,
    private sharedAPIProvider: SharedAPIProvider,
    private navController: NavController,
    private sharedProvider: SharedProvider,
    public actionSheetCtrl: ActionSheetController,
    public events: Events,
  ) {
    // this.drawLojackMap();
    // this.getGeoZones();
    this.assetId = NavPrms.get('assetId');
    this.assetDeviceId = NavPrms.get('assetDeviceId');
    this.updateGeoZoneObject = NavPrms.get('geoZone') || {};
    console.log('geoZone object');
    console.log(this.updateGeoZoneObject);
    this.updateGeoZoneId = this.updateGeoZoneObject.id ? this.updateGeoZoneObject.id : '0';
    this.updateGeoZonePlaceName = this.updateGeoZoneObject.name ? this.updateGeoZoneObject.name : '';
    this.placeName = this.updateGeoZonePlaceName;
    if (this.updateGeoZoneObject && this.updateGeoZoneObject.address) {
      let addressName = '';
      addressName += this.updateGeoZoneObject.address.street && this.updateGeoZoneObject.address.street !== 'null' ? `${this.updateGeoZoneObject.address.street}, ` : '';
      addressName += this.updateGeoZoneObject.address.city && this.updateGeoZoneObject.address.city !== 'null' ? `${this.updateGeoZoneObject.address.city}, ` : '';
      addressName += this.updateGeoZoneObject.address.stateProvince && this.updateGeoZoneObject.address.stateProvince !== 'null' ? `${this.updateGeoZoneObject.address.stateProvince}, ` : '';
      addressName += this.updateGeoZoneObject.address.country && this.updateGeoZoneObject.address.country !== 'null' ? `${this.updateGeoZoneObject.address.country}` : '';
      this.updateGeoZoneAddress = addressName;
    } else {
      this.updateGeoZoneAddress = '';
    }
  }
  private map;
  private view;
  private editToolbar;
  private zonesLayer;
  private initialZoomLevel = 13;
  private geoZoneRadious = 1;
  private currentPlaceIcon: string = 'State_Location';
  private mapPoint;
  private mapGeoZone;
  private markerGraphic;
  private saveGeoZoneObject;
  private currentPlaceAddress;
  private placeName;
  private newGeoZoneLayer;
  private circleGraphic;
  private esriMap;
  private zeoZoneMap;
  private assetId: string;
  private assetDeviceId: string;
  private selectedLat: any;
  private selectedLng: any;
  private isShowIconsList: boolean = false;
  private updateGeoZoneId: string = '0';
  private updateGeoZonePlaceName: string = '';
  private updateGeoZoneAddress: string = '';
  private pegZoneIndex: number = 0;
  private updateGeoZoneObject: any;
  private isGeozoneAdded: boolean = false;
  private errorMessage;
  private newPolygonGraphic;
  private newMarkerGraphic;
  private isInputFocus: boolean = true;

  ionViewDidLoad() {
    this.drawLojackMap();
    // this.getGeoZones();
  }
  
  ionViewDidLeave() {
    console.log('removing geozone memory');
    this.esriMap = null;
    // this.zeoZoneMap.graphics.removeAll();
    this.zeoZoneMap.map = null;
    this.zeoZoneMap.container = null;
    // this.zeoZoneMap.constraints = null;
    // this.zeoZoneMap  =null;
  }
  drawLojackMap() {
    this.sharedProvider.showBusyIndicator();
    return this.esriLoader.load(
      {
        url: 'https://js.arcgis.com/4.6/',
      },
    ).then(
      () => {
        this.esriLoader.loadModules([
          'esri/Map',
          'esri/views/MapView',
          // 'esri/WebMap',
          'esri/Graphic',
          'dojo/domReady!',
          'esri/layers/VectorTileLayer',
        ]).then(([
          Map, MapView,
          // WebMap,
          VectorTileLayer,
        ]) => {
          this.esriMap = new Map({
            basemap: 'gray-vector',
          });
          this.zeoZoneMap = new MapView({
            map: this.esriMap,
            container: this.mapEl.nativeElement,  // Reference to the DOM node that will contain the view
            center: [DEFAULT_LOCATION.long, DEFAULT_LOCATION.lat],
            zoom: this.initialZoomLevel,
            slider: false,
            constraints: {
              rotationEnabled: false,
            },
            ui: {
              components: ['attribution'],
            },
          });
          // const tileLyr = new VectorTileLayer({
          //   url: 'assets/json/root.json',
          // });
          this.zeoZoneMap
            .when(() => {
              // this.zeoZoneMap.add(tileLyr);
              this.getGeoZones();
            });
          this.sharedProvider.hideBusyIndicator();
        });
      },
      (err) => {
        console.log('Failed to load esri 4.6');
        this.sharedProvider.hideBusyIndicator();
      },
    );
  }
  getGeoZones() {
    this.sharedProvider.showBusyIndicator();
    this.lojackMapProvider.getDeviceGeoZones(this.assetDeviceId).then(
      (res: any) => {
        // this.deviceGeoZones = res.response.results;
        const zoneIdList = this.getGeoZoneIds(res.response.results);
        this.pegZoneIndex = this.getPegZoneIndex(res.response.results);
        console.log('this.pegZoneIndex');
        console.log(this.pegZoneIndex);
        this.searchGeoZones(zoneIdList);
      },
      (err) => {
        this.sharedProvider.hideBusyIndicator();
        const error = this.sharedAPIProvider.getErrorMessage(err);
        console.log(error);
      });
  }
  getPegZoneIndex(geoZonesList) {
    const pegZoneIndexArray = [];
    const geoZonesListLen = geoZonesList.length;
    // console.log('geoZonesListLen');
    // console.log(geoZonesListLen);
    // geoZonesListLen = 22;
    if (!geoZonesListLen) {
      // console.log(geoZonesListLen);
      return 0;
    }
    for (let i = 0; i < geoZonesListLen; i += 1) {
      if (geoZonesList[i] && geoZonesList[i].deviceGeozone && geoZonesList[i].deviceGeozone.pegZoneIndex >= 0) {
        pegZoneIndexArray.push(geoZonesList[i].deviceGeozone.pegZoneIndex);
        if (i >= geoZonesListLen - 1) {
          const pegZoneIndexArrayLen = pegZoneIndexArray.length;
          if (pegZoneIndexArray[0] !== 0) {
            return 0;
          }
          for (let j = 1; j < pegZoneIndexArrayLen; j += 1) {
            if ((pegZoneIndexArray[j] - pegZoneIndexArray[j - 1]) > 1) {
              return pegZoneIndexArray[j - 1] + 1;
            }
          }
          return pegZoneIndexArray.sort()[pegZoneIndexArrayLen - 1] + 1;
        }
      }
    }
  }

  getGeoZoneIds(geoZonesList) {
    const zoneIds = [];
    geoZonesList.forEach((item, index) => {
      if (item.deviceGeozone && item.deviceGeozone.geozone && item.deviceGeozone.geozone.href) {
        const zoneHref = item.deviceGeozone.geozone.href;
        const zoneId = zoneHref.substring(zoneHref.lastIndexOf('/') + 1);
        zoneIds.push(zoneId);
      }
    });
    return zoneIds.join(',');
  }
  searchGeoZones(zoneIdList) {
    this.lojackMapProvider.searchGeoZones(zoneIdList).then(
      (res: any) => {
        // this.geoZonesList = res.response.results;
        this.sharedProvider.hideBusyIndicator();
        this.drawgeozone(res.response.results);
        // this.mapAlertsToZones();
      },
      (err) => {
        this.sharedProvider.hideBusyIndicator();
        const error = this.sharedAPIProvider.getErrorMessage(err);
        console.log(error);
      });
  }
  // getGeoZones() {
  //   this.lojackMapProvider.getGeoZones(this.assetDeviceId).then(
  //     (response) => {
  //       console.log('getGeoZones');
  //       console.log(response);
  //       const responseObj: any = response;
  //       this.drawgeozone(responseObj.response.results);
  //     },
  //     (err) => {
  //       console.log(err);
  //     });
  // }

  drawgeozone(response) {
    const filterCircle = [];
    response.forEach((item) => {
      if (item.geozone.geoLocation.shape === 'CIRCLE') {
        filterCircle.push(item);
      }
    });
    const pointConstructgeoCircle = [];
    this.esriLoader.loadModules([
      'esri/geometry/Point',
      'esri/Graphic',
      'esri/symbols/PictureMarkerSymbol',
      'esri/geometry/Circle',
    ]).then(([
      Point,
      Graphic,
      PictureMarkerSymbol,
      Circle,
    ]) => {
      for (let i = 0; i < filterCircle.length; i += 1) {
        const latLng = response[i].geozone.geoLocation.coordinates.split(' ');
        const longValue = parseFloat(latLng[0]);
        const latValue = parseFloat(latLng[1]);
        const category = response[i].geozone.category || 'LOCATION';
        const geoZoneCategoryImage = _.find(GEO_ZONES_IMAGES, { key: category })['Image'];
        // console.log(geoZoneCategoryImage);
        // this.currentPlaceIcon = geoZoneCategoryImage;
        const picSymbol = new PictureMarkerSymbol({
          url: `assets/svg/places_icons/place_active/${geoZoneCategoryImage}.svg`,
          height: 36,
          width: 36,
          // type:  'esriPMS',
        });
        const pointObj = new Point([latValue, longValue]);
        const circleGeometry = new Circle(pointObj, {
          // radius: response[i].geozone.geoLocation.circleRadius || DEFAULT_RADIUS,
          radius: DEFAULT_RADIUS,
          geodesic: true,
        });
        // const symbol = {
        //   type: 'simple-fill',  // autocasts as new SimpleLineSymbol()
        //   color: [216, 216, 216, 0.4],
        //   width: '1px',
        //   style: 'STYLE_SOLID',
        // };
        // const symbol = {
        //   type: 'simple-fill',  // autocasts as new SimpleFillSymbol()
        //   color: [216, 216, 216, 0.4],
        // };
        const symbolShow = {
          type: 'simple-fill',  // autocasts as new SimpleFillSymbol()
          color: [216, 216, 216, 0.4],
          outline: {  // autocasts as new SimpleLineSymbol()
            color: [216, 216, 216, 0.4],
            width: 1,
          },
        };
        const symbolEdit = {
          type: 'simple-fill',  // autocasts as new SimpleFillSymbol()
          color: [55, 97, 141, 0.1],
          outline: {  // autocasts as new SimpleLineSymbol()
            color: [55, 97, 141],
            width: 1,
            style: 'dash',
          },
        };
        // console.log('this.updateGeoZoneId');
        // console.log(this.updateGeoZoneId);
        // console.log(response[i].geozone.id);
        if (response[i].geozone.id === this.updateGeoZoneId) {
          // console.log('goto edit');
          // console.log(latLng);
          // console.log(typeof latLng[0]);
          this.currentPlaceIcon = geoZoneCategoryImage;
          this.zeoZoneMap.goTo(
            {
              target: [latValue, longValue],
              zoom: this.initialZoomLevel,
            },
            {
              animate: true, duration: 100, easing: 'ease-in-out',
            },
          );
        }
        const polygonGraphic = new Graphic({
          symbol : response[i].geozone.id === this.updateGeoZoneId ? symbolEdit : symbolShow,
          geometry: circleGeometry,
        });
        const markerGraphic = new Graphic(new Point([latValue, longValue]), picSymbol);
        this.zeoZoneMap.graphics.addMany([polygonGraphic, markerGraphic]);
      }
    });
  }


  // getGeoZones1() {
  //   this.lojackMapProvider.getGeoZones().then(
  //     (response) => {
  //       // this.drawExistingZones(response);
  //       // this.geoFileds = response;
  //       // const pointConstructgeoCircle = [];
  //       // this.esriLoader.loadModules([
  //       //   'esri/geometry/Point',
  //       //   'esri/symbols/PictureMarkerSymbol',
  //       // ]).then(([
  //       //   Point,
  //       //   PictureMarkerSymbol,
  //       // ]) => {
  //       //   for (let i = 0; i < 12; i += 1) {
  //       //     if (response[i].geozone.geoLocation.shape === 'CIRCLE') {
  //       //       const latLng = response[i].geozone.geoLocation.coordinates.split(" ");
  //       //       console.log(latLng);
  //       //       pointConstructgeoCircle[i] = {
  //       //         geometry: new Point({
  //       //           x: latLng[1],
  //       //           y: latLng[0],
  //       //         }),
  //       //         symbol: new PictureMarkerSymbol({
  //       //           type: 'picture-marker',
  //       //           url: 'assets/svg/Oval_5.svg',
  //       //           height: 60,
  //       //           width: 60,
  //       //           // xoffset: 26,
  //       //           yoffset: 0,
  //       //         }),
  //       //         // select only the attributes you care about
  //       //         attributes: { feature: response[i].geozone, id: i },
  //       //       };
  //       //       // }
  //       //     }
  //       //   }
  //       //   // this.graphicsGeoZonescircle = pointConstructgeoCircle;
  //       //   // // if(this.navigatingMapState === 'default'){
  //       //   // this.createLayerGeoMarker(this.graphicsGeoZonescircle);
  //       // });

  //     },
  //     (err) => {
  //       console.log(err);
  //     });
  // }

  // createLayerGeoMarker(graphics) {
  //   this.esriLoader.loadModules([
  //     'esri/geometry/Point',
  //     'esri/layers/FeatureLayer',
  //     'esri/symbols/PictureMarkerSymbol',
  //   ]).then(([
  //     Point,
  //     FeatureLayer,
  //     PictureMarkerSymbol,
  //   ]) => {
  //     const layerGeoCircle = new FeatureLayer({
  //       supportsEditing: true,
  //       supportsAdd: true,
  //       supportExtent: true,
  //       source: this.graphicsGeoZonescircle, // autocast as an array of esri/Graphic
  //       // create an instance of esri/layers/support/Field for each field object
  //       fields: this.geoFileds, // this.fields, // This is required when creating a layer from Graphics
  //       objectIdField: 'ObjectID', // This must be defined when creating a layer from Graphics
  //       // renderer: this.pointsRenderer, // set the visualization on the layer
  //       spatialReference: {
  //         wkid: 4326
  //       },
  //       geometryType: 'point', // Must be set when creating a layer from Graphics
  //       // refreshInterval : 0.1667,
  //     });
  //     this.esriMap.add(layerGeoCircle);
  //     this.featureLayerGeocircleData = layerGeoCircle;
  //   });
  // }

  selectedPlaceAddress(address: any) {
    // console.log('address');
    // console.log(address);
    this.currentPlaceAddress = address;

    // this.removeGraphics();
    // this.drawMarkerSymbol(this.currentPlaceAddress.candidates[0].location.x, this.currentPlaceAddress.candidates[0].location.y);
    this.createCircleMarker(this.currentPlaceAddress.candidates[0].location.x, this.currentPlaceAddress.candidates[0].location.y);

    //   ' + this.currentPlaceAddress.candidates[0].location.x + ' '
    //                                                      + this.currentPlaceAddress.candidates[0].location.x
  }
  enteredPlaceName(placeName: any) {
    // console.log('test');
    // console.log(placeName);
    // console.log(placeName.length);
    this.placeName = placeName;
    // if (placeName.length > 0 && this.updateGeoZoneId === '0') {
    // if (this.updateGeoZoneId === '0') {
    this.isShowIconsList = true;
    // }
    // else {
    //   this.isShowIconsList = false;
    // }
  }
  inputFocus(value: boolean) {
    this.isInputFocus = !value;
  }

  // clculateRadious(ptB) {
  //   const ptA = this.mapPoint;
  //   console.log(Math.sqrt(Math.pow(ptA.x - ptB.x, 2) + Math.pow(ptA.y - ptB.y, 2)));
  // }
  // //    //Activate the toolbar when you click on a graphic
  // //     this.zeoZoneMap.graphics.on('click', function (evt) {
  // //       event.stop(evt);
  // //       activateToolbar(evt.graphic);
  // //     });
  // //     // deactivate the toolbar when you click outside a graphic
  // // this.map.on('click', function (evt) {
  // //       editToolbar.deactivate();
  // //     });
  // activateToolbar(graphic) {

  // }

  // drawMarkerSymbol(lng, lat) {
  //   this.esriLoader.loadModules([
  //     'esri/geometry/Point',
  //     'esri/geometry/Circle',
  //     'esri/symbols/PictureMarkerSymbol',
  //     'esri/symbols/TextSymbol',
  //     'esri/symbols/SimpleFillSymbol',
  //     'esri/Graphic',
  //     'esri/symbols/SimpleMarkerSymbol',
  //     'esri/layers/FeatureLayer',
  //   ]).then(([
  //     Point,
  //     Circle,
  //     PictureMarkerSymbol,
  //     TextSymbol,
  //     SimpleFillSymbol,
  //     Graphic,
  //     SimpleMarkerSymbol,
  //     FeatureLayer,
  //   ]) => {
  //     const picSymbol = new PictureMarkerSymbol({
  //       url: 'assets/svg/places_icons/place_active/State_Location.svg',
  //       height: 36,
  //       width: 36,
  //       type: 'esriPMS',
  //     });
  //     this.markerGraphic = new Graphic(new Point([this.currentPlaceAddress.candidates[0].location.x, this.currentPlaceAddress.candidates[0].location.y]), picSymbol);
  //     // this.circleGraphic = new Graphic(this.mapGeoZone, circleSymbol);
  //     // this.zeoZoneMap.graphics.add(this.circleGraphic);
  //     this.zeoZoneMap.graphics.add(this.markerGraphic);
  //     // this.initializeEditEvents();
  //   });
  // }

  createCircleMarker(lng, lat) {
    this.selectedLat = lat;
    this.selectedLng = lng;
    console.log(this.isGeozoneAdded);
    if (this.isGeozoneAdded) {
      console.log(this.zeoZoneMap.graphics.length);
      this.isGeozoneAdded = false;
      const graphicsCount = this.zeoZoneMap.graphics.length;
      console.log(this.zeoZoneMap.graphics.items);
      // this.zeoZoneMap.graphics.remove(this.zeoZoneMap.graphics.items[graphicsCount - 1]);
      // this.zeoZoneMap.graphics.remove(this.zeoZoneMap.graphics.items[graphicsCount - 1]);
      this.zeoZoneMap.graphics.removeMany([this.newPolygonGraphic, this.newMarkerGraphic]);
      // this.zeoZoneMap.graphics.items.splice(0, this.zeoZoneMap.graphics.items - 2);
    }
    console.log(this.zeoZoneMap.graphics.length);
    this.esriLoader.loadModules([
      'esri/symbols/PictureMarkerSymbol',
      'esri/Graphic',
      'esri/geometry/Point',
      'esri/geometry/Circle',
    ]).then(([
      PictureMarkerSymbol, Graphic, Point, Circle,
    ]) => {
      this.zeoZoneMap.goTo(
        {
          target: [lng, lat],
          zoom: this.initialZoomLevel,
        },
        {
          animate: true, duration: 100, easing: 'ease-in-out',
        },
      );
      const picSymbol = new PictureMarkerSymbol({
        url: `assets/svg/places_icons/place_active/${this.currentPlaceIcon}.svg`,
        height: 36,
        width: 36,
        // type:  'esriPMS',
      });
      const pointObj = new Point([lng, lat]);
      const circleGeometry = new Circle(pointObj, {
        radius: DEFAULT_RADIUS,
        geodesic: true,
      });
      // const polygon = {
      //   type: 'circle', // autocasts as new Polygon()
      //   rings: circleGeometry.rings,
      // };
      // var fillSymbol = {
      //   type: 'simple-fill', // autocasts as new SimpleFillSymbol()
      //   color: 'transparent',
      //   outline: { // autocasts as new SimpleLineSymbol()
      //     color: '#FF0000',
      //     width: 1,
      //     style: 'dash'
      //   }
      // };
      // const symbol = {
      //   type: 'simple-line',  // autocasts as new SimpleLineSymbol()
      //   color: 'red',
      //   width: '1px',
      //   style: 'dash',
      // };
      const symbol = {
        type: 'simple-fill',  // autocasts as new SimpleFillSymbol()
        color: [55, 97, 141, 0.1],
        outline: {  // autocasts as new SimpleLineSymbol()
          color: [55, 97, 141],
          width: 1,
          style: 'dash',
        },
      };
      // console.log(circleGeometry.rings);
      // let circleNew = new Circle({
      //   center:  this.esriMap.extent.getCenter(), //, //
      //   radius: 25,
      //   geodesic: true,
      // });
      this.newPolygonGraphic = new Graphic({
        symbol,
        geometry: circleGeometry,
      });
      this.newMarkerGraphic = new Graphic(new Point([lng, lat]), picSymbol);
      this.zeoZoneMap.graphics.addMany([this.newPolygonGraphic, this.newMarkerGraphic]);
      this.isGeozoneAdded = true;
      console.log(this.zeoZoneMap.graphics.length);
      // this.zeoZoneMap.graphics.add(markerGraphic);
      // this.zeoZoneMap.graphics.add(new Graphic(circleGeometry, picSymbol));
      // this.zeoZoneMap.graphics.add(new Graphic(new Point([lng, lat]), picSymbol));
    });
  }


  // drawMarkerInCircle(lng, lat) {
  //   // console.log('drawMarkerInCircle');
  //   // console.log(lng, lat);
  //   this.esriLoader.loadModules([
  //     'esri/geometry/Point',
  //     'esri/geometry/Circle',
  //     'esri/symbols/PictureMarkerSymbol',
  //     'esri/symbols/TextSymbol',
  //     'esri/symbols/SimpleFillSymbol',
  //     'esri/Graphic',
  //     'esri/symbols/SimpleMarkerSymbol',
  //     'esri/layers/FeatureLayer',
  //   ]).then(([
  //     Point,
  //     Circle,
  //     PictureMarkerSymbol,
  //     TextSymbol,
  //     SimpleFillSymbol,
  //     Graphic,
  //     SimpleMarkerSymbol,
  //     FeatureLayer,
  //   ]) => {
  //     // this.map.centerAt(new Point([this.currentPlaceAddress.candidates[0].location.x,
  //     //     this.currentPlaceAddress.candidates[0].location.y]));

  //     //    let polygonSymbol = new SimpleFillSymbol();

  //     //       let radiusValue = this.map.extent.getWidth() / 10;

  //     //       let circleNew = new Circle({
  //     //         center:  this.map.extent.getCenter(), //, //
  //     //         radius: radiusValue,
  //     //         geodesic: true,
  //     //       });

  //     //       this.zeoZoneMap.graphics.add(new Graphic(circleNew, polygonSymbol));

  //     //       return;
  //     // this.map.centerAt(new Point([lng, lat]));
  //     // this.map.setZoom(this.initialZoomLevel);
  //     // this.map.center = [this.currentPlaceAddress.candidates[0].location.x, this.currentPlaceAddress.candidates[0].location.y];
  //     const circleSymbol = new SimpleFillSymbol();
  //     // console.log(circleSymbol);
  //     circleSymbol.outline.width = 2;
  //     circleSymbol.outline.style = 'dot';
  //     circleSymbol.outline.color = '#2B648F';
  //     circleSymbol.type = 'simple-fill',  // autocasts as new SimpleFillSymbol()
  //       circleSymbol.color = 'transparent';

  //     // setTimeout(() => {
  //     // this.map.centerAt(new Point([this.currentPlaceAddress.candidates[0].location.x,
  //     // this.currentPlaceAddress.candidates[0].location.y]));
  //     // this.mapGeoZone = new Circle({
  //     //   center: this.map.extent.getCenter(),
  //     //   radius: this.geoZoneRadious,
  //     //   geodesic: true,
  //     //   radiusUnit: 'miles',
  //     // });
  //     this.circleGraphic = new Graphic(this.mapGeoZone, circleSymbol);
  //     this.zeoZoneMap.graphics.add(this.circleGraphic);
  //     this.drawMarkerSymbol(this.currentPlaceAddress.candidates[0].location.x, this.currentPlaceAddress.candidates[0].location.y);
  //     // }, 100);
  //   });
  // }
  // removeGraphics() {
  //   if (this.markerGraphic && this.circleGraphic) {
  //     this.zeoZoneMap.graphics.removeAll();
  //     /* this.zeoZoneMap.graphics.remove(this.markerGraphic);
  //     this.zeoZoneMap.graphics.remove(this.circleGraphic); */
  //   }
  // }
  selectedPlaceIcon(iconName: string) {
    // console.log('selectedPlaceIcon');
    // console.log(iconName);
    // const zeoZoneMapGraphicsLength = this.zeoZoneMap.graphics.length;
    // for (let i = 0; i < zeoZoneMapGraphicsLength; i += 1) {
    //   console.log('dd');
    //   console.log(this.zeoZoneMap.graphics[0].);
    // }
    this.currentPlaceIcon = iconName;
    if (this.selectedLng && this.selectedLat) {
      // console.log(this.zeoZoneMap.graphics.items);
      // console.log(this.zeoZoneMap.graphics.items[this.zeoZoneMap.graphics.items[this.zeoZoneMap.graphics.length - 1]]);
      this.zeoZoneMap.graphics.remove(this.zeoZoneMap.graphics.items[this.zeoZoneMap.graphics.length - 1]);
      this.esriLoader.loadModules([
        'esri/geometry/Point',
        'esri/geometry/Circle',
        'esri/symbols/PictureMarkerSymbol',
        'esri/symbols/TextSymbol',
        'esri/symbols/SimpleFillSymbol',
        'esri/Graphic',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/layers/FeatureLayer',
      ]).then(([
        Point,
        Circle,
        PictureMarkerSymbol,
        TextSymbol,
        SimpleFillSymbol,
        Graphic,
        SimpleMarkerSymbol,
        FeatureLayer,
      ]) => {
        const picSymbol = new PictureMarkerSymbol({
          url: 'assets/svg/places_icons/place_active/' + iconName + '.svg',
          height: 36,
          width: 36,
          // type:  'esriPMS',
        });
        // console.log(this.zeoZoneMap.graphics);
        // this.zeoZoneMap.graphics.remove(this.zeoZoneMap.graphics.items[0]);
        const markerGraphic = new Graphic(new Point([this.selectedLng, this.selectedLat]), picSymbol);
        this.zeoZoneMap.graphics.add(markerGraphic);
        /* console.log('geozoneMap', this.zeoZoneMap);
        console.log('symbolurlOld', this.zeoZoneMap.graphics.items[0].symbol.url);
        this.zeoZoneMap.graphics.items[0].symbol.url = 'assets/svg/places_icons/' + iconName + '.svg' ;
        console.log('symbolurlnew', this.zeoZoneMap.graphics.items[0].symbol.url); */
      });
    }
    // this.isShowIconsList = false;
  }
  saveGeoZoneClick() {
    if (this.updateGeoZoneId !== '0') {
      this.updateGeoZone(this.updateGeoZoneId);
    } else {
      this.saveGeoZone();
    }
  }
  saveGeoZone() {
    // let location;
    // if (this.updateGeoZoneId !== '0') {
    //   const latLng = this.updateGeoZoneObject.geoLocation.coordinates.split(' ');
    //   const longValue = parseFloat(latLng[0]);
    //   const latValue = parseFloat(latLng[1]);
    //   location = '' + latValue + ' ' + longValue;
    // } else {
    //   location = '' + this.currentPlaceAddress.candidates[0].location.y + ' '
    // + this.currentPlaceAddress.candidates[0].location.x;
    // }
    if (!this.currentPlaceAddress) {
      return;
    }
    const location = '' + this.currentPlaceAddress.candidates[0].location.y + ' '
      + this.currentPlaceAddress.candidates[0].location.x;
    // console.log('location');
    // console.log(location);
    // const selectedRadius: number = this.editToolbar._graphic ? this.editToolbar._graphic._extent.getWidth() / 2 : 1763.1707377173007;
    const geoZoneCategory = _.find(GEO_ZONES_IMAGES, { Image: this.currentPlaceIcon })['key'];
    // console.log('drawExistingZones');
    const savObj = this.lojackMapProvider.getSaveGeoZoneObj(
      this.placeName,
      moment().format(), // 2018-02-09T09:54:18.088Z
      location,
      DEFAULT_RADIUS,
      geoZoneCategory,
    );
    // console.log('savObj');
    // console.log(savObj);
    this.lojackMapProvider.saveGeoZone(savObj, this.assetDeviceId, this.pegZoneIndex).then(
      (res: any) => {
        this.errorMessage = '';
        this.placeUpdated();
      },
      (err) => {
        // console.log('error');
        // this.errorMessage = 'A geozone already exists with the given name.';
        if (err.error.response.errors[0].includes('geozone already exists')) {
          this.errorMessage = 'A geozone already exists with the given name.';
        } else {
          this.errorMessage = 'Internal Server Error.';
        }
        console.log(err);
        // this.handleError(err);
      });
    // console.log(savObj);
    // this.deleteGeoZone();
  }

  updateGeoZone(updateGeoZoneId) {
    let location;
    // console.log('this.currentPlaceAddress');
    // console.log(this.currentPlaceAddress);
    if (!this.currentPlaceAddress) {
      // console.log('enter 1');
      const latLng = this.updateGeoZoneObject.geoLocation.coordinates.split(' ');
      const longValue = parseFloat(latLng[0]);
      const latValue = parseFloat(latLng[1]);
      location = '' + longValue + ' ' + latValue;
    } else {
      // console.log('enter 222');
      location = '' + this.currentPlaceAddress.candidates[0].location.y + ' '
        + this.currentPlaceAddress.candidates[0].location.x;
    }
    // const latLng = this.updateGeoZoneObject.geoLocation.coordinates.split(' ');
    // const longValue = parseFloat(latLng[0]);
    // const latValue = parseFloat(latLng[1]);
    // const location = '' + latValue + ' ' + longValue;
    const geoZoneCategory = _.find(GEO_ZONES_IMAGES, { Image: this.currentPlaceIcon })['key'];
    // console.log('drawExistingZones');
    // const savObj = this.lojackMapProvider.getSaveGeoZoneObj(
    //   this.placeName,
    //   moment().format(), // 2018-02-09T09:54:18.088Z
    //   location,
    //   DEFAULT_RADIUS,
    //   geoZoneCategory,
    // );
    const modifiedDateTime = moment().format();
    // const updateGeoZoneObject = this.updateGeoZoneObject;
    const savObj = {
      ...this.updateGeoZoneObject,
      description: this.placeName,
      name: this.placeName,
      createdOn: modifiedDateTime,
      lastModifiedOn: modifiedDateTime,
      geoLocation: {
        coordinates: location,
        circleRadius: DEFAULT_RADIUS,
        shape: 'CIRCLE',
      },
      category: geoZoneCategory || 'LOCATION',
    };

    // console.log('savObj');
    // console.log(savObj);
    delete savObj.geozoneDeployments;
    // console.log('savObj');
    // console.log(savObj);
    this.lojackMapProvider.updateGeoZone(savObj , this.assetDeviceId, this.pegZoneIndex, this.updateGeoZoneId).then(
      (res: any) => {
        this.placeUpdated();
      },
      (err) => {
        // this.handleError(err);
      });
  }

  placeUpdated() {
    this.navController.pop().then(() => {
      // Trigger custom event and pass data to be send back
      this.events.publish('place-update-event');
    });
  }
  gotoBack() {
    this.navController.pop();
  }

  deleteGeoZone() {
    const actionSheet = this.actionSheetCtrl.create({
      cssClass: 'signOut-buttons-class',
      buttons: [
        {
          cssClass: 'signOut-buttons-class',
          text: 'Remove',
          role: 'destructive',
          handler: () => {
            // const savObj = {};
            this.lojackMapProvider.deleteGeoZone(this.updateGeoZoneId, this.assetDeviceId).then(
              (res) => {
                this.placeUpdated();
                this.sharedProvider.hideBusyIndicator();
              },
              (err) => {
                console.log(err);
                this.sharedProvider.hideBusyIndicator();
              });
          },
        }, {
          cssClass: 'signOut-buttons-class',
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
      ],
    });
    actionSheet.present();
  }
}

