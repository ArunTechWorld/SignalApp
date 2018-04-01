import { Component, OnInit, ViewChild, ElementRef, Renderer, Input, OnDestroy } from '@angular/core';
import { EsriLoaderService } from 'angular2-esri-loader';
import { NavController, NavParams, Content } from 'ionic-angular';
import { MapLoaderProvider } from '../../providers/map-loader/map-loader';
import { LojackMapProvider } from '../../providers/lojack-map/lojack-map';
import { SharedAPIProvider } from '../../providers/shared/sharedAPI';
import { SharedProvider } from '../../providers/shared/shared';
import * as moment from 'moment';
import { TripdetailsComponent } from '../tripdetails/tripdetails';
import { DateTimeProvider } from '../../providers/date-time/date-time';
/**
 * Generated class for the TripHistoryComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'trip-history',
  templateUrl: 'trip-history.html',
})
export class TripHistoryComponent implements OnInit, OnDestroy {

  @Input('carDetailsItem') carDetailsItem: any;
  @ViewChild(Content) content: Content;
  public tripHistory = [];
  constructor(private esriLoader: EsriLoaderService, private mapLoaderProvider: MapLoaderProvider,
    private lojackMapProvider: LojackMapProvider, private element: ElementRef,
    private sharedAPIProvider: SharedAPIProvider,
    private navController: NavController,
    private sharedProvider: SharedProvider,
    private dateTimeProvider: DateTimeProvider,
  ) {
    const userInfo = this.sharedAPIProvider.getUserInfo();
    this.authToken = userInfo.response.authToken;
  }

  private basemap = 'gray';
  private mode = '2D';
  private map;
  private count = 0;
  private view = [];
  private extent = [];
  private graphicResult = [];
  private polylineGraphic = [];
  // private extent;
  private authToken;
  private pageNumber = 1;
  private tripHistoryTitleArray = [];
  private isApiResponded: boolean = false;
  private isLoading: boolean = true;
  private mapLoadingStartID = 0; //this.tripHistory.length
  private markerSymbol = {
    type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
    color: [226, 119, 40],
    size: '12px',
    outline: { // autocasts as new SimpleLineSymbol()
      color: [255, 255, 255],
      width: 2,
    },
  };
  private bottomReached = 0;

  // Create a symbol for drawing the line
  private lineSymbol = {
    type: 'simple-line', // autocasts as SimpleLineSymbol()
    color: '#37618D', // [#37618D],
    width: 2,
  };

  ngOnInit() {
    console.log('init trips');
    this.initTrips();
    this.getTrips()
    // this.getTrips();
  }

  ngOnDestroy() {
    console.log('destroy trips');
    this.destroy();
  }
  onPageWillLeave() {
    console.log('destroy trips');
    this.destroy();
  }
  ionViewDidLeave() {
    console.log('ionViewDidLeave');
    this.destroy();
  }
  initTrips() {
    this.lojackMapProvider.setTripHistory('');
    this.tripHistory = [];
    this.count = 0;
    this.view = [];
    this.extent = [];
    this.map = {};
    this.isApiResponded = false;
    this.isLoading = true;
    this.tripHistoryTitleArray = [];
    this.polylineGraphic = [];
    this.bottomReached = 0;
    this.mapLoadingStartID = 0;
  }
  reSetAll(obj) {
    Object.keys(obj).forEach((k) => {
      obj[k] = null;
      // obj[k].destroy();
    });
  }
  destroy() {
    // this.player.nativeElement.load();
    // this.reSetAll(this.view);
    // this.reSetAll(this.polylineGraphic);
    // this.reSetAll(this.extent);

    for (let k = 0; k < this.mapLoadingStartID; k++) {
      if (this.view[k]) {
        this.view[k].graphics.remove();

        this.view[k].container = null;
        this.view[k].map = null;
        this.view[k].extent = null;
        this.extent[k] = null;
        this.polylineGraphic[k] = null;

        this.view[k].destroy();
      }

    }
    this.lojackMapProvider.setTripHistory('');
    this.tripHistory = undefined;
    this.count = undefined;
    this.view = undefined;
    this.extent = undefined;
    this.map = undefined;
    this.isApiResponded = false;
    this.isLoading = true;
    this.tripHistoryTitleArray = undefined;
    this.polylineGraphic = undefined;
    this.bottomReached = undefined;
    this.mapLoadingStartID = undefined;
    // console.log('destroyed THHHHH');
  }

  doRefresh(refresher, id) {
    // if (id === 1 || (id === 2 && this.bottomReached === 1)) {
    this.pageNumber = (id === 1) ? 1 : this.pageNumber + 1;
    this.bottomReached = 0;
    this.lojackMapProvider.setTripHistory('');
    setTimeout(() => {
      refresher.complete();
    }, 1000);
    this.getTrips();
    // }    else {
    //   this.bottomReached = this.bottomReached + 1;
    //   refresher.complete();
    // }
  }

  showTripDetails(tripInfo, id) {
    setTimeout(() => {
      this.sharedProvider.hideBusyIndicator();
    }, 30000);
    const tripDuration = this.getMomentTime(tripInfo.trip.durationInSecs);
    this.lojackMapProvider.getTripDetails(this.authToken, tripInfo.trip.uuid).then((tripDetails) => {
      this.successOfTripDetail(tripDetails, this.tripHistoryTitleArray[id] + ' - ' + tripDuration);
    }, (err) => {
      this.sharedProvider.hideBusyIndicator();
    });
  }
  successOfTripDetail(tripDetails, titleText) {
    this.sharedProvider.hideBusyIndicator();
    if (tripDetails.response.results) {
      this.navController.push(TripdetailsComponent, { currentTripDetails: tripDetails.response.results, title: titleText, carDetailsItem: this.carDetailsItem });
    } else {
      console.log('trip detail API response is not as expected');
    }

  }

  drawLojackMap() {
    // this.mapLoaderProvider.showMapLoader();
    if (this.mapLoadingStartID < 1) {
      this.sharedProvider.showBusyIndicator();
    }
    return this.esriLoader.load({
      // use a specific version of the API instead of the latest
      url: 'https://js.arcgis.com/4.6/',
    }).then(() => {
      this.esriLoader.loadModules([
        'esri/Map',
        // 'esri/config',
      ]).then(([
        Map,
        // esriConfig,
      ]) => {
        // esriConfig.request.corsEnabledServers.push('http://goweb2.calamp.com');
        this.map = new Map({
          basemap: this.basemap,
          minZoom: 8,
          maxZoom: 12,
        });
        // this.createTrips();
        setTimeout(() => { this.createTrips(); }, 0);
        // this.map
        //   .when(() => {
        // this.createTrips();
        // });
      });
    }, (err) => {
      console.log('Failed to load esri 4.6');
      this.sharedProvider.hideBusyIndicator();

    });
  }
  getTrips() {
    setTimeout(() => {
      this.sharedProvider.hideBusyIndicator();
    }, 30000);
    const triplist = this.lojackMapProvider.getStoredTripHistory();
    //     this.successOfTrips(triplist);
    this.content.scrollToTop();
    if (!triplist) {
      this.initiateTripsgetAPI();
    } else {
      this.sharedProvider.hideBusyIndicator();
      this.isLoading = false;
    }
  }

  initiateTripsgetAPI(infiniteScroll?) {
    this.sharedProvider.showBusyIndicator();
    this.lojackMapProvider.getTripHistory(this.authToken, this.carDetailsItem.assetId, this.pageNumber).then((trips) => {
      // const triplist = this.lojackMapProvider.getTripHistory(1);
      this.initTrips();
      // setTimeout(() => {
      this.isLoading = false;
      this.successOfTrips(trips);
      this.lojackMapProvider.setTripHistory(trips);
      if (infiniteScroll) { infiniteScroll.complete(); }
      // },1000);
    }, (err) => {
      console.log('Error in trip get API');
      this.sharedProvider.hideBusyIndicator();
      if (infiniteScroll) { infiniteScroll.complete(); }
    });
  }
  successOfTrips(triplist) {
    this.isApiResponded = true;
    console.log(triplist);
    this.tripHistory = triplist.response.results;
    if (this.tripHistory.length > 0) {
      for (let i = 0; i < this.tripHistory.length; i++) {
        this.tripHistory[i].durationHHMM = '';
        this.tripHistory[i].startTimeUtc = this.getMomentDateTime(this.tripHistory[i].trip.startTimeUtc);
        this.tripHistory[i].endTimeUtc = this.getMomentDateTime(this.tripHistory[i].trip.endTimeUtc);
        this.tripHistory[i].distanceInMeters = this.getMiles(this.tripHistory[i].trip.distanceInMeters);
        const temp = this.getMapTitleInfo(this.tripHistory[i].trip.endTimeUtc);
        this.tripHistoryTitleArray.push(temp);
        this.tripHistory[i].durationHHMM = this.dateTimeProvider.secondsToHoursMinsSecs(this.tripHistory[i].trip.durationInSecs);
      }
      this.drawLojackMap();
    } else {
      this.sharedProvider.hideBusyIndicator();
    }
  }


  showHeader(index) {
    if (index === 0) {
      return this.tripHistoryTitleArray[index];
    } else {
      if (this.tripHistoryTitleArray[index] === this.tripHistoryTitleArray[index - 1]) {
        return '';
      } else {
        return this.tripHistoryTitleArray[index];
      }
    }
  }
  createTrips() {
    return this.esriLoader.load({
      // use a specific version of the API instead of the latest
      url: 'https://js.arcgis.com/4.6/',
    }).then(() => {
      this.esriLoader.loadModules([
        // 'esri/Map',
        'esri/views/MapView',
        // 'esri/views/SceneView',
        'esri/layers/GraphicsLayer',
        'esri/Graphic',
        'dojo/_base/array',
        // 'dojo/on',
        // 'esri/core/urlUtils',
        // 'esri/request',
        // 'esri/config',
        // 'dojo/domReady!',
        'esri/symbols/PictureMarkerSymbol',
      ]).then(([
        // Map,
        MapView,
        // SceneView,
        GraphicsLayer,
        Graphic,
        arrayUtils,
        // on,
        // urlUtils,
        // esriRequest,
        // esriConfig,
        // dojo,
        PictureMarkerSymbol,
      ]) => {
        const tripData = this.tripHistory;
        const i = this.mapLoadingStartID;
        // for (let i = 0; i < 2; i++) { //this.tripHistory.length
        const data = tripData[i].trip;
        if(data.polyLine){
        const pointArray = this.lojackMapProvider.decodePolyline(data.polyLine); // this.decode(data.polyLine);

        const startpoint = { latitude: data.startLatitude, longitude: data.startLongitude };
        const endpoint = { latitude: data.stopLatitude, longitude: data.stopLongitude };
        //  pointArray.unshift(startpoint);
        // pointArray.push(endpoint);

        // var graphicResult = [];
        // First create a line geometry (this is the Keystone pipeline)
        const polyline = {
          type: 'polyline', // autocasts as new Polyline()
          paths: [],
        };
        // polyline.paths
        // Loop through each of the results and assign a symbol and PopupTemplate
        // to each so they may be visualized on the map
        let indexVal = 0;
        const itemsLength = pointArray.length;
        this.graphicResult[i] = arrayUtils.map(pointArray, (feature) => {
          // Sets the symbol of each resulting feature to a cone with a
          // fixed color and width. The height is based on the mountain's elevation
          // Create a graphic and add the geometry and symbol to it
          // Start point
          // const markerImg = new PictureMarkerSymbol({
          //   type: 'picture-marker',
          //   url: 'assets/imgs/tripHistory/Mini_Starting_Point.svg',
          //   height: 10,
          //   width: 10,
          // });

          const markerType = this.typeOfMarker(feature.longitude, feature.latitude, indexVal, itemsLength);
          indexVal = indexVal + 1;
          const markerImg = new PictureMarkerSymbol({
            type: 'picture-marker',
            url: 'assets/imgs/tripHistory/' + markerType.imgName,
            height: markerType.height,
            width: markerType.width,
          });

          const pointGraphic = new Graphic({
            geometry: {
              type: 'point',  // autocasts as new Point()
              longitude: feature.longitude,
              latitude: feature.latitude,
            },
            symbol: markerImg,
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
        this.polylineGraphic[i] = new Graphic({
          geometry: polyline,
          symbol: this.lineSymbol,
        });

        // const resultsLyr = new GraphicsLayer();

        this.polylineGraphic[i].geometry = polyline;
        // resultsLyr.addMany([polylineGraphic]);
        // resultsLyr.addMany(graphicResult);

        this.extent[i] = this.polylineGraphic[i].geometry.extent.expand(2);
        // this.extent.xmax=this.extent.xmax+0.0001;
        // this.extent.ymax=this.extent.ymax+0.0001;
        // this.extent.xmin=this.extent.xmin+0.0001;
        // this.extent.ymin=this.extent.ymin+0.0001;
        // this.extent = 10;
        const mapLoadingContainer = this.element.nativeElement.querySelector('#tripHistory' + i); // + data.id);
    
          // Create a 2D View
          this.view[i] = new MapView({
            container: mapLoadingContainer,
            map: this.map,
            // center: [-74.005973, 40.712775],
            extent: this.extent[i],
            ui: {
              components: ['attribution'],
            },
            // padding: {
            //   top: 200,
            //   left: 200,
            //   right: 200,
            //   bottom: 200,
            // },
            // margin: {
            //   top : 5,
            // },
          });
        this.view[i]
          .when((e) => {
            // setTimeout(() => {
            this.view[i].graphics.add(this.polylineGraphic[i]);
            this.view[i].graphics.addMany(this.graphicResult[i]);

            console.log('this.graphicResult[i].length   ' + this.graphicResult[i].length);
            if (this.graphicResult[i].length < 3) {
              this.view[i].goTo({ target: this.extent[i], zoom: 15 });
            }
            // setTimeout(() => { e.zoom = e.zoom - 0.5; }, 4000);
            // this.view[i].padding.left = 50;
            // e.zoom = e.zoom - 0.5;
            if (this.mapLoadingStartID < this.tripHistory.length - 1) {
              this.mapLoadingStartID = this.mapLoadingStartID + 1;
              this.createTrips();
            }
            this.sharedProvider.hideBusyIndicator();
            // setTimeout(() => {this.view[i].goTo(this.extent[i]);}, 4000);
            // }, 4000);
            //  this.view[i].goTo({
            //     target: this.graphicResult[i],
            //  });
          });
        }else{
          if (this.mapLoadingStartID < this.tripHistory.length - 1) {
            this.mapLoadingStartID = this.mapLoadingStartID + 1;
            this.createTrips();
          }
          this.sharedProvider.hideBusyIndicator();
        }
        // }
      });
      

    }, (err) => {
      console.log('Failed to load esri 4.6');
      this.sharedProvider.hideBusyIndicator();

    });
  }
  // moment(new Date()).add(1,'days')
  getMapTitleInfo(date) {
    // let temp=moment.utc("2018-02-10T12:06:41.000Z").format("x");
    let dayTitle;
    if ((moment(moment.unix(date / 1000))).isSame(moment(), 'day')) { // utc
      dayTitle = 'EARLIER TODAY';
    } else if (((moment(moment.unix(date / 1000))).add(1, 'days')).isSame(moment(), 'day')) { // utc
      dayTitle = 'YESTERDAY';
    } else {
      dayTitle = (moment(moment.unix(date / 1000))).format('dddd, MMM D'); // utc
    }
    return dayTitle;
  }
  pushTitletoArray(value) {
    let isRequiredToPush = true;
    for (let i = 1; i < this.tripHistoryTitleArray.length; i++) {
      if (this.tripHistoryTitleArray[i] === value) {
        isRequiredToPush = false;
        break;
      }
    }
    if (isRequiredToPush) {
      this.tripHistoryTitleArray.push(value);
    }
    return isRequiredToPush;
  }

  getMomentTime(secs) {
    const convertedTimeInMMHH = this.dateTimeProvider.secondsToHoursMinsSecs(secs);
    // const isMin = (secs / 60) > 1 ? ' mins' : ' min';
    // const isHour = ((secs / 60) / 60) > 1 ? ' hours' : ' hour';
    // const convertedTimeInMMHH = ((secs / 60) < 60) ? (secs / 60).toFixed(2) +
    //  isMin : (Number((secs / 60) / 60)).toFixed(2) + isHour;

    // let convertedTimeInMMHH = (Math.round(secs / 60) < 60) ? Math.round(secs / 60)
    // + ' mins' : (Number((secs / 60) / 60)).toFixed() + ' hours';
    return convertedTimeInMMHH;
  }
  getMomentDateTime(date) {
    let newDate;
    if (moment(moment.unix(date / 1000)).isSame(moment(), 'day')) { // utc
      newDate = moment(moment.unix(date / 1000)).format('h:mm A'); // utc
    } else {
      newDate = moment(moment.unix(date / 1000)).format('h:mm A'); // date = moment.utc(date / 1000).format('MMM D, YYYY hh:mm A') // utc
    }
    return newDate; // .replace(/\b0/g, '');
  }
  getMiles(meeters) {
    return (Math.round((meeters * 0.000621371192) * 10) / 10) + ' mi';
  }
  typeOfMarker(longitude, latitude, indexVal, itemsLength) {
    let marker;
    switch (indexVal) {
      case itemsLength - 1: marker = {
        imgName: 'Mini_Starting_Point.svg',
        height: 10,
        width: 10,
      };
        break;
      case 0: marker = {
        imgName: 'Mini_Finish_Point.svg',
        height: 12,
        width: 10,
      };
        break;
      default: marker = {
        imgName: 'Mini_Update_Point.svg',
        height: 10,
        width: 10,
      }; break;
    }
    return marker;
  }

  doInfinite(infiniteScroll, id) {
    console.log('Begin async infiniteScroll operation');
    infiniteScroll.complete();
    // if (this.pageNumber > 1) {
    //   infiniteScroll.complete();
    // } else {
    //   this.pageNumber = this.pageNumber + 1;
    //   this.lojackMapProvider.setTripHistory('');
    //   setTimeout(() => {
    //     this.getTrips();
    //     infiniteScroll.complete();
    //   },         500);
    // }

    // this.pageNumber = this.pageNumber + 1;
    // this.lojackMapProvider.setTripHistory('');
    // infiniteScroll.complete();
    // this.initTrips();
    // this.getTrips();

    // this.lojackMapProvider.getTripHistory(this.authToken, this.carDetailsItem.assetId, this.pageNumber).then((trips) => {
    //   // const triplist = this.lojackMapProvider.getTripHistory(1);
    //   this.isLoading = false;
    //   this.lojackMapProvider.setTripHistory(trips);
    //   console.log('completed');
    //   this.getTrips();
    //   infiniteScroll.complete();
    // },                                                                                                       (err) => {
    //   console.log('Error in trip get API');
    //   this.sharedProvider.hideBusyIndicator();
    //   infiniteScroll.complete();
    // });
    console.log('scrolling ');
  }
}
