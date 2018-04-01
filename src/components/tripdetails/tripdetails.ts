import { Component, OnInit, ViewChild, ElementRef, Renderer, Input, OnDestroy } from '@angular/core';
import { EsriLoaderService } from 'angular2-esri-loader';
import { NavController, NavParams } from 'ionic-angular';
import { MapLoaderProvider } from '../../providers/map-loader/map-loader';
import { LojackMapProvider } from '../../providers/lojack-map/lojack-map';
import { SharedAPIProvider } from '../../providers/shared/sharedAPI';
import { SharedProvider } from '../../providers/shared/shared';
import { GEO_ZONES_IMAGES, DEFAULT_RADIUS } from '../../helper/utils';
import * as moment from 'moment';
import { TripHistoryComponent } from '../trip-history/trip-history';
import { DateTimeProvider } from '../../providers/date-time/date-time';
import * as _ from 'lodash';
/**
 * Generated class for the TripdetailsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'tripdetails',
  templateUrl: 'tripdetails.html',
})
export class TripdetailsComponent implements OnInit,OnDestroy {
  zoom_center = '';
  public durationInSecs;
  public startTimeUtc;
  public endTimeUtc;
  public totalMiles;
  constructor(private NavPrms: NavParams,
    private esriLoader: EsriLoaderService, private mapLoaderProvider: MapLoaderProvider,
    private lojackMapProvider: LojackMapProvider, private element: ElementRef,
    private sharedAPIProvider: SharedAPIProvider,
    private navController: NavController,
    private sharedProvider: SharedProvider,
    private dateTimeProvider: DateTimeProvider) {
    console.log('Hello TripdetailsComponent Component');
    console.log('UserId', NavPrms.get('currentTripDetails'));
    console.log('Hello NotificationRecievedComponent Component');
    this.tripDetail = NavPrms.get('currentTripDetails');
    this.title = NavPrms.get('title');
    this.carDetailsItem = NavPrms.get('carDetailsItem');
    console.log('title', NavPrms.get('title'));
    console.log(this.tripDetail);
    this.title = (this.title.indexOf('EARLIER') !== -1) ? (this.title.replace('EARLIER', '')) : this.title;
    this.title = this.title.trim() + ' TRIP';
    this.drawLojackMap();
  }
  private tripDetail;
  private basemap = 'gray-vector';
  private mode = '2D';
  private map;
  private view;
  private extent;
  private title;
  private carDetailsItem;
  private markerSymbol = {
    type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
    color: [226, 119, 40],
    size: '12px',
    outline: { // autocasts as new SimpleLineSymbol()
      color: [255, 255, 255],
      width: 2,
    },
  };

  ngOnInit() {
    if (this.tripDetail && this.tripDetail.length > 0 && this.tripDetail[0].trip) {
      this.durationInSecs = this.getMomentTime(this.tripDetail[0].trip.durationInSecs);
      this.startTimeUtc = this.getMomentDateTime(this.tripDetail[0].trip.startTimeUtc);
      this.endTimeUtc = this.getMomentDateTime(this.tripDetail[0].trip.endTimeUtc);
      this.totalMiles = this.getMiles(this.tripDetail[0].trip.distanceInMeters);
      //    getMomentDateTime(tripDetail[0].trip.startTimeUtc)}} - {{getMomentDateTime(tripDetail[0].trip.endTimeUtc) 
    }
    this.loadSpeedSettings();
  }



  ionViewDidLoad() {

    this.loadSpeedSettings();

  }
  ngOnDestroy() {
    console.log('ionViewDidLeave');
    this.destroy();
  }
  reSetAll(obj) {
    Object.keys(obj).forEach((k) => {
      obj[k] = null;
    });
  }
  destroy() {
    // console.log('destroy..............TDDDDDDDDDDDDDDDDDDDDDDD');
    // this.reSetAll(this.view);
    // this.reSetAll(this.extent);
    // this.tripDetail = null;
    // for (let k = 0; k < this.view; k++) {

    // }
    if (this.view && this.view.container && this.view.map && this.view.extent) {
      this.view.container = null;
      this.view.map = null;
      this.view.extent = null;
    }
    this.basemap = null;
    this.mode = null;
    this.map = null;
    this.view = null;
    this.extent = null;
    this.title = null;
    this.carDetailsItem = null;
    this.markerSymbol = null;
    this.durationInSecs = null;
    this.startTimeUtc = null;
    this.endTimeUtc = null;
    this.totalMiles = null;
 }

  loadSpeedSettings() {
    (<any>window).Maxspeed = 75;
    this.loadScript('assets/libs/meter.js');

  }

  // Create a symbol for drawing the line
  private lineSymbol = {
    type: 'simple-line', // autocasts as SimpleLineSymbol()
    color: '#37618D', // [#37618D],
    width: 2,
  };
  public loadScript(url) {
    console.log('preparing to load...')
    let node = document.createElement('script');
    node.src = url;
    node.type = 'text/javascript';
    document.getElementsByTagName('div')[0].appendChild(node);
  }
  goToTrips() {
    this.navController.pop();
  }

  getMomentTime(secs) {
    const convertedTimeInMMHH = this.dateTimeProvider.secondsToHoursMinsSecs(secs);
    // const isMin = (secs / 60) > 1 ? ' mins' : ' min';
    // const isHour = ((secs / 60) / 60) > 1 ? ' hours' : ' hour';
    // const convertedTimeInMMHH = ((secs / 60) < 60) ? (secs / 60).toFixed(2) +
    //  isMin : (Number((secs / 60) / 60)).toFixed(2) + isHour;
    return convertedTimeInMMHH;
  }

  getMiles(meeters) {
    return (Math.round((meeters * 0.000621371192) * 10) / 10) + ' mi';
  }

  getMomentDateTime(date) {
    let paramDate = date;
    if (moment(new Date(date)).isSame(moment(), 'day')) { // utc
      paramDate = (moment(new Date(date))).format('h:mm A'); // utc
    } else {
      paramDate = (moment(new Date(date))).format('h:mm A'); // date = moment.utc(date).format('MMM D, YYYY hh:mm A') // utc
    }
    return paramDate; // .replace(/\b0/g, '');
  }

  drawLojackMap() {
    this.sharedProvider.showBusyIndicator();
    return this.esriLoader.load({
      // use a specific version of the API instead of the latest
      url: 'https://js.arcgis.com/4.6/',
    }).then(() => {
      this.esriLoader.loadModules([
        'esri/Map',
        'esri/config',
      ]).then(([
        Map, esriConfig,
      ]) => {
        esriConfig.request.corsEnabledServers.push('http://goweb2.calamp.com');
        this.map = new Map({
          basemap: this.basemap,
        });
        console.log('11111111111111111111111');
        // this.createTrips();
        // setTimeout(() => { this.createTrips(); }, 0);
        // this.map
        //   .when(() => {
        setTimeout(() => { this.createTrips(); }, 1000);
        // });
      });
    }, (err) => {
      console.log('Failed to load esri 4.6');
      this.sharedProvider.hideBusyIndicator();

    });
  }

  createTrips() {
    return this.esriLoader.load({
      // use a specific version of the API instead of the latest
      url: 'https://js.arcgis.com/4.6/',
    }).then(() => {
      this.esriLoader.loadModules([
        'esri/Map',
        'esri/views/MapView',
        'esri/views/SceneView',
        'esri/layers/GraphicsLayer',
        'esri/Graphic',
        'dojo/_base/array',
        'dojo/on',
        'esri/core/urlUtils',
        'esri/request',
        'esri/config',
        'dojo/domReady!',
        'esri/symbols/PictureMarkerSymbol',
      ]).then(([
        Map, MapView, SceneView, GraphicsLayer, Graphic, arrayUtils, on, urlUtils, esriRequest, esriConfig, dojo, PictureMarkerSymbol,
      ]) => {
        const tripData = this.tripDetail[0].trip;
        console.log('111111111133333333333333333');
        console.log(tripData);
        const pointArray = tripData.wayPoints;
        const startPoint = {
          tripId: '',
          wayPointId: '',
          timeZone: null,
          eventLabel: 'START',
          speedLimitUnits: 'kph',
          longitude: tripData.startLongitude,
          latitude: tripData.startLatitude,
          gpsSpeedCps: 0,
          gpsSpeed: 0,
          gpsMeterReading: 1733646,
          hdop: 1.6,
          messageSeqNumber: 2222,
          speedLimit: 50,
          eventCode: -10000,
          satelliteCount: 7,
          heading: 142,
          eventDateTime: '2018-02-12T05:30:01.000Z',
          accurate: false,
          valid: true,
        };
        const stopPoint = {
          tripId: '',
          wayPointId: '',
          timeZone: null,
          eventLabel: 'END',
          speedLimitUnits: 'kph',
          longitude: tripData.stopLongitude,
          latitude: tripData.stopLatitude,
          gpsSpeedCps: 0,
          gpsSpeed: 0,
          gpsMeterReading: 1733646,
          hdop: 1.6,
          messageSeqNumber: 2222,
          speedLimit: 50,
          eventCode: 10000,
          satelliteCount: 7,
          heading: 142,
          eventDateTime: '2018-02-12T05:30:01.000Z',
          accurate: false,
          valid: true,
        };
        //pointArray.unshift(startPoint);
        // pointArray.push(stopPoint);
        /* pointArray.push({ latitude: tripData.startLatitude, longitude: tripData.startLongitude });
         for (let i = 0; i < tripData.wayPoints.length; i++) {
           console.log('11111111114444444444444444444444');
           pointArray.push({ latitude: tripData.wayPoints[i].latitude, longitude: tripData.wayPoints[i].longitude });
         }
         pointArray.push({ latitude: tripData.stopLatitude, longitude: tripData.stopLongitude });*/
        // const data = tripData[i].trip;

        // const pointArray = this.lojackMapProvider.decodePolyline(data.polyLine); // this.decode(data.polyLine);

        //   let startpoint = { latitude: data.startLatitude, longitude: data.startLongitude };
        // let endpoint = { latitude: data.stopLatitude, longitude: data.stopLongitude };

        //var graphicResult = [];
        // First create a line geometry (this is the Keystone pipeline)
        const polyline = {
          type: 'polyline', // autocasts as new Polyline()
          paths: [],
        };
        //polyline.paths
        // Loop through each of the results and assign a symbol and PopupTemplate
        // to each so they may be visualized on the map
        let indexVal = 0;
        const itemsLength = pointArray.length;
        const graphicResult = arrayUtils.map(pointArray, (feature) => {
          // Sets the symbol of each resulting feature to a cone with a
          // fixed color and width. The height is based on the mountain's elevation
          // Create a graphic and add the geometry and symbol to it
          //Start point
          // const markerImg = new PictureMarkerSymbol({
          //   type: 'picture-marker',
          //   url: 'assets/imgs/tripHistory/Mini_Starting_Point.svg',
          //   height: 10,
          //   width: 10,
          // });

          const markerType = this.typeOfMarker(indexVal, feature.eventLabel, itemsLength);
          indexVal = indexVal + 1;
          const markerImg = new PictureMarkerSymbol({
            type: 'picture-marker',
            url: 'assets/imgs/tripHistory/' + markerType.imgName,
            height: markerType.height,
            width: markerType.width,
          });
          const tripTime = this.getMomentDateTime(feature.eventDateTime);
          const alertSpeed = this.carDetailsItem.speedThreshold ? this.carDetailsItem.speedThreshold : 'NA';
          const imgstring = feature.eventLabel == 'SPEED' ? '<img src="assets/svg/Tooltip_Alert_mini_Icon.svg" class="dangerimg" />' : '<img src="assets/svg/Tooltip_Alert_mini_Icon.svg" class="dangerimg" style="visibility:hidden"/>';
          const imglocalspeed =  feature.gpsSpeed > feature.speedLimit  ? '<img src="assets/svg/Tooltip_Alert_mini_Icon.svg" class="dangerimg" />' :  '<img src="assets/svg/Tooltip_Alert_mini_Icon.svg" class="dangerimg" style="visibility:hidden"/>';
          const localSpeed = feature.speedLimit ? ` <div class="details-row">
          <span class="count">` + feature.speedLimit + ` MPH</span><span class="text">Local Speed</span>
            ` + imglocalspeed + `
          </div> ` : '';



          const pointGraphic = new Graphic({
            geometry: {
              type: 'point',  // autocasts as new Point()
              longitude: feature.longitude,
              latitude: feature.latitude,
            },
            symbol: markerImg,
            popupTemplate: {
              content: `<div class="popup-custom">
              <test></test>
              <div class="slider"></div>
              <div class="left">
              <div class='arc'>
              <div class="mphvalue">` + feature.gpsSpeed + `</div>
              <div class="mphtext">MPH</div>
              <div class="drivetext">DRIVING</div>
              <div class="drivetext2">SPEED</div>
            </div>
            </div>
              <div class="right">
              <div class="content">
              <div class="details-row">
                <span class="count">` + alertSpeed + ` MPH</span><span class="text">Alert Speed</span>
                  ` + imgstring + `
                </div>
                ` + localSpeed + `
              </div>
              <div class="time">` + tripTime + `</div>
              </div>
              </div>`,
            },
          });


          // graphicResult.push(pointGraphic);

          polyline.paths.push([feature.longitude, feature.latitude]);
          return pointGraphic;
        });
        /*******************************************
         * Create a new graphic and add the geometry,
         * symbol, and attributes to it. You may also
         * add a simple PopupTemplate to the graphic.
         * This allows users to view the graphic's
         * attributes when it is clicked.
         ******************************************/
        const polylineGraphic = new Graphic({
          geometry: polyline,
          symbol: this.lineSymbol,
        });

        // const resultsLyr = new GraphicsLayer();

        polylineGraphic.geometry = polyline;
        // resultsLyr.addMany([polylineGraphic]);
        // resultsLyr.addMany(graphicResult);

        this.extent = polylineGraphic.geometry.extent.expand(2);
        // this.extent.xmax=this.extent.xmax+0.0001;
        // this.extent.ymax=this.extent.ymax+0.0001;
        // this.extent.xmin=this.extent.xmin+0.0001;
        // this.extent.ymin=this.extent.ymin+0.0001;
        // this.extent = 10;
        const mapLoadingContainer = this.element.nativeElement.querySelector('#tripHistoryMap'); // + data.id);

        if (this.mode === '3D') {
          // Create a 3D View
          this.view = new SceneView({
            container: mapLoadingContainer,
            map: this.map,
            extent: this.extent,
            ui: {
              components: ['attribution'],
            },
          });

        } else {
          // Create a 2D View
          this.view = new MapView({
            container: mapLoadingContainer,
            map: this.map,
            extent: this.extent,
            // center: [-74.005973, 40.712775],
            ui: {
              components: ['attribution'],
            }, popup: {
              dockEnabled: false,
              dockOptions: {
                // Disables the dock button from the popup
                buttonEnabled: false,
                // Ignore the default sizes that trigger responsive docking
                breakpoint: false,
              },
            },
            constraints: {
              rotationEnabled: false,
            },

            // padding: {
            //   top : '2',
            //   bottom : '2',
            // },
            // margin: {
            //   top : 5,
            // },
          });
          this.view.popup.on('trigger-action', (event) => {
            console.log('event from click');
          });

          this.view.on('drag', this.mapzPoint);
          this.view.popup.watch('visible', (visible) => {
            console.log("popup visible: ", visible);
            // var btn;
            // try {
            //   //view.popup.renderNow(); // seems to do bupkis
            //   btn = dom.byId("btnAddComment");
            //   console.log("watch btn is ", btn);
            //   on(dom.byId("btnAddComment"), "click", function() {
            //     console.log("clicky");
            //   });
            // } catch (err) {
            //   console.log(btn, err);
            // }
          });
        }
        this.view
          .when((e) => {
            // setTimeout(() => {
            this.view.graphics.add(polylineGraphic);
            this.view.graphics.addMany(graphicResult);

            if (graphicResult.length < 3) {
              this.view.goTo({ target: this.extent, zoom: 15 });
            }
            // e.zoom = e.zoom - 0.5;
            // this.view.goTo({
            //     target: graphicResult,
            //    //  spatialReference: { wkid: 4326 },
            //      zoom:11,
            //      //extent: ext,
            //  });
            console.log('22222222222222');
            this.getGeoZones(tripData.deviceId);
            // }, 4000);
          });
        // }
      });
      this.sharedProvider.hideBusyIndicator();
    }, (err) => {
      console.log('Failed to load esri 4.6');
      this.sharedProvider.hideBusyIndicator();

    });
  }
  mapzPoint = (evt) => {
    console.log(evt);
    if (evt.action === 'end') {
      const centerrr = true;
      // console.log(centerrr);
      this.zoom_center = 'Focus_Icon';
      // console.log(this.zoom_center);
    }
  }
  centerMarker() {
    this.view.goTo({ target: this.extent });
    this.zoom_center = '';
  }
  typeOfMarker(indexVal, eventLabel, itemsLength) {
    let marker;
    if (indexVal === 0) {
      marker = {
        imgName: 'Starting_Point.svg',
        height: 15,
        width: 15,
      };
    } else if (indexVal === itemsLength - 1) {
      marker = {
        imgName: 'trip_history_finish_point.svg',
        height: 30,
        width: 26,
      };
    } else if (eventLabel === 'SPEED') {
      marker = {
        imgName: 'Speeding_Point.svg',
        height: 20,
        width: 20,
      };
    } else {
      marker = {
        imgName: 'Finish_Point.svg',
        height: 15,
        width: 15,
      };
    }
    return marker;
  }

  getGeoZones(assetDeviceId) {
    this.sharedProvider.showBusyIndicator();
    this.lojackMapProvider.getDeviceGeoZones(assetDeviceId).then(
      (res: any) => {
        // this.deviceGeoZones = res.response.results;
        const zoneIdList = this.getGeoZoneIds(res.response.results);
        // console.log('this.pegZoneIndex');
        // console.log(this.pegZoneIndex);
        this.searchGeoZones(zoneIdList);
      },
      (err) => {
        this.sharedProvider.hideBusyIndicator();
        const error = this.sharedAPIProvider.getErrorMessage(err);
        console.log(error);
      });
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
        this.drawgeozone(res.response.results);
        this.sharedProvider.hideBusyIndicator();
        // this.mapAlertsToZones();
      },
      (err) => {
        this.sharedProvider.hideBusyIndicator();
        const error = this.sharedAPIProvider.getErrorMessage(err);
        console.log(error);
      });
  }

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
      // console.log('filterCircle.length');
      // console.log(filterCircle.length);
      for (let i = 0; i < filterCircle.length; i += 1) {
        const latLng = response[i].geozone.geoLocation.coordinates.split(' ');
        const longValue = parseFloat(latLng[0]);
        const latValue = parseFloat(latLng[1]);
        // console.log(parseFloat(latLng[0]));
        // console.log(Number(latLng[0]));
        const category = response[i].geozone.category || 'LOCATION';
        const geoZoneCategoryImage = _.find(GEO_ZONES_IMAGES, { key: category })['Image'];
        console.log(geoZoneCategoryImage);
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
        const polygonGraphic = new Graphic({
          symbol: symbolShow,
          geometry: circleGeometry,
        });
        const markerGraphic = new Graphic(new Point([latValue, longValue]), picSymbol);
        this.view.graphics.addMany([polygonGraphic, markerGraphic]);
      }
    });
  }

}
