import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ENV } from '../../../environments/environment';
import { SharedAPIProvider } from '../../../providers/shared/sharedAPI';
import { SharedProvider } from '../../../providers/shared/shared';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/retry';
import * as moment from 'moment';

// import { loginProvider } from '../../login/login.provider';
/*
  Generated class for the CarLocationHomeProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CarLocationHomeProvider {

  constructor(public http: HttpClient, public sharedAPIProvider: SharedAPIProvider, public sharedProvider: SharedProvider) {
    const res = this.sharedAPIProvider.getUserInfo();
    this.authToken = res.response.authToken;
  }
  private authToken;
  private dateRange;
  private intervalSureDrive;
  private assets;
  private reportData;
  private ppToken;
  private pivotDate = moment().format('YYYY-MM-DD');
  private weekTracker = moment().format('YYYY-MM-DD');
  private monthTracker = moment().format('YYYY-MM-DD');
  private yearTracker = moment().format('YYYY-MM-DD');
  private allTracker = moment().format('YYYY-MM-DD');
  getLayerSpecification() {
    return [
      {
        name: 'ObjectID',
        alias: 'ObjectID',
        type: 'oid',
      }, {
        name: 'name',
        alias: 'name',
        type: 'string',
      },
      {
        name: 'lat',
        alias: 'lat',
        type: 'number',
      },
      {
        name: 'lng',
        alias: 'lng',
        type: 'number',
      }];
  }
  getCarData() {
    return [
      {
        carImage: 'tempCar.png',
        carName: '2017 Volvo V40',
        carLocation: '1267 Norfolk St',
        lastUpdate: 'Last updated: 06:18AM',
        since: '12:04 AM',
        longlat: '77.589517, 12.984716',
      },
      {
        carImage: 'tempCar2.jpg',
        carName: 'Tata X451',
        carLocation: '654 Preview St',
        lastUpdate: 'Last updated: 02:47PM',
        since: '10:26 AM',
        longlat: '77.647608, 12.908136',
      },
      {
        carImage: 'carImage3.jpg',
        carName: 'Hyundai Kona',
        carLocation: '1654 Main St',
        lastUpdate: 'Last updated: 11:58AM',
        since: '12:36 AM',
        longlat: '77.611284, 12.882805',
      },
      {
        carImage: 'carImage4.jpg',
        carName: 'Toyota Vios',
        carLocation: '8746 Norfolk St',
        lastUpdate: 'Last updated: 10:58PM',
        since: '06:20 AM',
        longlat: '77.568197, 12.942898',
      },
      {
        carImage: 'carImage5.jpg',
        carName: '2014 Lexus IS250 Jetta',
        carLocation: '563 N. 53rd St.',
        lastUpdate: '2 minutes ago',
        since: '11:42 AM',
        longlat: '77.693083, 12.938311',
      },
    ];
  }

  getEsriAPIContent(accId, assetIds, lastEsriCallDateTime) {
    // console.log('getEsriAPIContent');
    // console.log("assetIds");
    // console.log(assetIds);
    // const assetId = encodeURIComponent(`&where=assetId IN (${assetIds.toString()})`);
    const assetIdParam = ` AND assetId%20IN%20(${assetIds.toString()})`;
    const accountIdDbWriteTimeParam = encodeURIComponent(`accountid= ${accId}`);
    // const accountIdDbWriteTimeParam = encodeURIComponent(`accountid= ${accId} AND (dbWriteTime > '${lastEsriCallDateTime}')`);
    console.log(accountIdDbWriteTimeParam);
    return new Promise((resolve, reject) => {
      const url = ENV.esriApiUrl + "CVS_V2/MapServer/0/query" +
        "?where=" + accountIdDbWriteTimeParam + assetIdParam +
        "&outFields=*" +
        "&returnGeometry=true" +
        "&returnTrueCurves=false" +
        "&f=pjson";
      console.log(url);
      this.http.get(url, {
      })
        .subscribe(esriData => {
          //console.log(esriData);
          resolve(esriData);
        },         (err) => {
          reject(err);
        });
    });

  }

  constructCarsObject(deviceDetails, esriDetails, accId) {

    const deviceObj = [];
    for (let j = 0; j < esriDetails.features.length; j++) {
      for (let i = 0; i < deviceDetails.response.results.length; i++) {
        let  value = null;
        // console.log(esriDetails.features[j].attributes.assetId + '**********************************************' + deviceDetails.response.results[i].asset.id);
        if ((esriDetails.features[j].attributes.assetId === deviceDetails.response.results[i].asset.id)) { //  && deviceDetails.response.results[i].device.expanded && deviceDetails.response.results[i].device.expanded.asset.length > 0
          if (deviceDetails.response.results[i].asset.tripwire) {
            value = deviceDetails.response.results[i].asset.tripwire;
          }
          deviceObj.push(
            {
              userId: accId,
              name: '',
              deviceId: esriDetails.features[j].attributes.deviceId,
              lat: esriDetails.features[j].attributes.latitude,
              lng: esriDetails.features[j].attributes.longitude,
              status: esriDetails.features[j].attributes.ignition,
              carImage: (deviceDetails.response.results[i].asset.imageUrl) ? deviceDetails.response.results[i].asset.imageUrl : './assets/svg/default_Car.svg',
              carName: (deviceDetails.response.results[i].asset.name) ? deviceDetails.response.results[i].asset.name : '',
              carLocation: esriDetails.features[j].attributes.street + ', ' + esriDetails.features[j].attributes.city + ', ' + esriDetails.features[j].attributes.state,
              lastUpdate: this.getMomentDateTime(esriDetails.features[j].attributes.eventTime),
              since: Number(esriDetails.features[j].attributes.eventTime),
              vin: (deviceDetails.response.results[i].asset.vin) ? deviceDetails.response.results[i].asset.vin : '',
              assetId: Number(deviceDetails.response.results[i].asset.id ? deviceDetails.response.results[i].asset.id : ''),
              esnId: Number(esriDetails.features[j].attributes.deviceEsn),
              year: (deviceDetails.response.results[i].asset.year) ? deviceDetails.response.results[i].asset.year : '',
              make: (deviceDetails.response.results[i].asset.make) ? deviceDetails.response.results[i].asset.make : '',
              model: (deviceDetails.response.results[i].asset.model) ? deviceDetails.response.results[i].asset.model : '',
              tripwireBreach :  (value && value.isBreached) ? true : false,
              iscolision: {},
              collisionsupport : false,
              tripwireModal : true,
              tripwireBreachData : (deviceDetails.response.results[i].asset.tripwire) ? this.gettripwireData(deviceDetails.response.results[i].asset.tripwire) : { tripwireModal : false } ,
              dealerShipInfo: (deviceDetails.response.results[i].asset.dealership) ? (deviceDetails.response.results[i].asset.dealership.email) : false,
              tripwireStatus: this.sharedAPIProvider.getTripwireStatus(deviceDetails.response.results[i].asset) ,
              speedThreshold: (deviceDetails.response.results[i].asset.speedSetting && deviceDetails.response.results[i].asset.speedSetting.speedThreshold) ? deviceDetails.response.results[i].asset.speedSetting.speedThreshold : 0 ,
            },
          );
        }

      }
    }
    console.log(deviceObj);
    return deviceObj;
  }

  getMomentDateTime(date) {
    console.log('getMomentDateTime')
    if (moment.unix(date / 1000).isSame(moment(), 'day')) {
      date = moment.unix(date / 1000).format("hh:mm A");
    } else {
      date = moment.unix(date / 1000).format("MMM D, YYYY hh:mm A")
    }
    return date;
  }


  gettripwireData(tripwireData) {
    tripwireData.date = typeof tripwireData.date === 'number' ? this.getTripwireMomentDateTime(tripwireData.date) : ' ';
    return tripwireData;
  }
  constructMapObject(data) {
    const deviceObj = [];
    for (let i = 0; i < data.features.length; i++) {
      deviceObj.push(
        {
          ObjectID: data.features[i].attributes.OBJECTID,
          name: data[i].device.name,
          lat: data[i].device.lastKnownGoodAvlPosition.latitude,
          lng: data[i].device.lastKnownGoodAvlPosition.longitude,
        },
      );
    }
    // deviceObj.push({ObjectID: 1, name: "LMU3030", lat: 12.984716, lng: 77.589517});
    // deviceObj.push({ObjectID: 2, name: "LMU3032", lat: 12.908136, lng: 77.647608});
    // deviceObj.push({ObjectID: 3, name: "LMU3033", lat: 12.882805, lng: 77.611284});
    console.log(deviceObj);
    return deviceObj;
  }
  getTripwireMomentDateTime(date) {
    let newDate;
    if (moment(moment.unix(date / 1000)).isSame(moment(), 'day')) { // utc
      newDate = moment(moment.unix(date / 1000)).format('h:mm A'); // utc
    } else {
      newDate = moment(moment.unix(date / 1000)).format('h:mm A'); // date = moment.utc(date / 1000).format('MMM D, YYYY hh:mm A') // utc
    }
    return newDate; // .replace(/\b0/g, '');
  }
  fetchCollisionSummary(esnId) {
    console.log('esnId>>>>>>>'+ esnId);
    const res = this.sharedAPIProvider.getUserInfo();
    this.authToken = res.response.authToken;
    let requestBody: string;
    requestBody = '{"search": { "searchTerms": { "deviceId":"' + esnId + '", "severityCode":"VeryLight,Light,Moderate,Heavy,VeryHeavy" },"sort": ["-crashDate"]}}';
    return new Promise((resolve, reject) => {
      this.http.post(ENV.apiUrl + 'crash/search', requestBody, {
        headers: new HttpHeaders().set('authorization', this.authToken).set('Content-Type', 'application/json'),
      }).subscribe(res => {
        resolve(res);
      },           (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log('Error - ', err.error.message);
        } else {
          console.log('Error status - ${err.status}, and Error Detail - ${err.error}');
        }
      });
    });
  }
  getcollisiondetails(icnId) {
    const res = this.sharedAPIProvider.getUserInfo();
    this.authToken = res.response.authToken;
    return new Promise((resolve, reject) => {
      this.http.get(ENV.apiUrl + `crash/${icnId}`, {
        headers: new HttpHeaders().set('authorization', this.authToken).set('Content-Type', 'application/json'),
      }).subscribe(res => {
        resolve(res);
      },           (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log('Error - ', err.error.message);
        } else {
          console.log('Error status - ${err.status}, and Error Detail - ${err.error}');
        }
      })
    });
  }

  getLocateRequest(authtoken, deviceId) {
    return new Promise((resolve, reject) => {
      this.http.get(ENV.apiUrl + `devices/${deviceId}/locaterequest`, {
        headers: new HttpHeaders().set('authorization', authtoken),
      })
        .subscribe(LocateRequest => {
          console.log(LocateRequest);
          resolve(LocateRequest);
          // this.sharedProvider.hideBusyIndicator();
        },         (err) => {
          reject(err);
          // this.sharedProvider.hideBusyIndicator();
        });
    });

  }
  getTrackLocateRequest(authtoken, messageUuid) {
    return new Promise((resolve, reject) => {
      this.http.get(ENV.apiUrl + `devices/commands/${messageUuid}`, {
        headers: new HttpHeaders().set('authorization', authtoken),
      })
        .subscribe(TrackLocateRequest => {
          console.log(TrackLocateRequest);
          resolve(TrackLocateRequest);
          // this.sharedProvider.hideBusyIndicator();
        },         (err) => {
          reject(err);
          // this.sharedProvider.hideBusyIndicator();
        });
    });
  }

  cancelLocateRequest(authtoken, messageUuid) {
    return new Promise((resolve, reject) => {
      this.http.put(ENV.apiUrl + `devices/commands/${messageUuid}`, {}, {
        headers: new HttpHeaders().set('authorization', authtoken),
      })
        .subscribe(TrackLocateRequest => {
          console.log(TrackLocateRequest);
          resolve(TrackLocateRequest);
          // this.sharedProvider.hideBusyIndicator();
        },         (err) => {
          reject(err);
          // this.sharedProvider.hideBusyIndicator();
        });
    });
  }


  fetchTripwireATS(assetId) {
    console.log('fetchTripwireATS authToken ->' + this.authToken);
    const authToken = this.sharedAPIProvider.getUserInfo().response.authToken;
    console.log('new fetchTripwireATS authToken ->' + authToken);
   // this.getAssetbyId(assetId);
    return new Promise((resolve, reject) => {
      this.http.get(ENV.apiUrl + 'assets/' + assetId + '/tripwire', {
        headers: new HttpHeaders().set('authorization', authToken),
      })
        .subscribe((res) => {
          resolve(res);
        },         (err) => {
          reject(err);
        });
    });
  }


  getAssetbyId(assetId) {
    // const authToken = this.sharedAPIProvider.getUserInfo().response.authToken;
    const res = this.sharedAPIProvider.getUserInfo();
    this.authToken = res.response.authToken;
    return new Promise((resolve, reject) => {
      this.sharedAPIProvider.getAssetsById(this.authToken, assetId).then((res) => {
        resolve(res);
      },                                                                 (err) => {

        reject(err);

      }
     );

    });

  }


  putAssetbyId(assetId, requestBody) {
    const res = this.sharedAPIProvider.getUserInfo();
    this.authToken = res.response.authToken;
    const request = this.getRequestObject(requestBody);
    const requestObj = { asset : request };
    return new Promise((resolve, reject) => {
      this.sharedAPIProvider.putAssetsById(this.authToken, assetId, requestObj).then((result) => {
        resolve(result);
      },                                                                             (err) => {

        reject(err);

      }
     );

    });

  }

  getRequestObject(requestBody) {
    let  requestObj = {};
    if (requestBody && requestBody.response && requestBody.response.results && requestBody.response.results.length) {
      const asset = requestBody.response.results[0].asset;
      delete asset._self;
      delete asset.extendedAttribute;
      asset.tripwire.isBreached = false;
      requestObj = asset;
    }
    return requestObj;

  }

  updateTripwireATS(action, assetId) {
    const authToken = this.sharedAPIProvider.getUserInfo().response.authToken;
    let response;
    if (action) {
      return new Promise((resolve, reject) => {
        this.http.post(ENV.apiUrl + 'assets/' + assetId + '/tripwire', response, {
          headers: new HttpHeaders().set('authorization', authToken),
        })
          .subscribe((res) => {
            resolve(res);
          },         (err) => {
            reject(err);
          });
      });
    } else {
      return new Promise((resolve, reject) => {
        this.http.delete(ENV.apiUrl + 'assets/' + assetId + '/tripwire', {
          headers: new HttpHeaders().set('authorization', authToken),
        })
          .subscribe((res) => {
            resolve(res);
          },         (err) => {
            reject(err);
          });
      });
    }
  }
  clearTripwireATS(assetId) {
    const authToken = this.sharedAPIProvider.getUserInfo().response.authToken;
    return new Promise((resolve, reject) => {
      this.http.delete(ENV.apiUrl + 'assets/' + assetId + '/tripwire', {
        headers: new HttpHeaders().set('authorization', authToken),
      })
        .subscribe((res) => {
          resolve(res);
        },         (err) => {
          reject(err);
        });
    });
  }
  trackTripwireATS(messageUuid) {
    const authToken = this.sharedAPIProvider.getUserInfo().response.authToken;
    return new Promise((resolve, reject) => {
      this.http.get(ENV.apiUrl + `devices/commands/${messageUuid}`, {
        headers: new HttpHeaders().set('authorization', authToken),
      }).subscribe((res) => {
        console.log(res);
        resolve(res);
      },           (err) => {
        reject(err);
      });
    });
  }

  
  loadReportData(dataDirection, dataCategory, assetId) {
    return new Promise((resolve, reject) => {
      this.assets = assetId;
      this.intervalSureDrive = dataCategory;
      this.dateRange = this.dateRangeBuilder(dataDirection, dataCategory);
      this.getReportData(this.assets, this.intervalSureDrive, this.dateRange).then((res) => {
        resolve(res);
      },                                                                           (err) => {
        reject(err);
      });

    });
    // return this.reportData;
  }

  dateRangeBuilder(dataDirection, dataCategory) {
    let dt = '';
    switch (dataCategory) {
      case 1:
        dt = dataDirection == 0 ? moment().format('YYYY-MM-DD') : moment(this.weekTracker, "YYYY-MM-DD").add(dataDirection * 7, 'day').format("YYYY-MM-DD");
        this.weekTracker = dt;
        break;

      case 2:
        dt = dataDirection == 0 ? moment().format('YYYY-MM-DD') : moment(this.monthTracker, "YYYY-MM-DD").add(dataDirection, 'month').format("YYYY-MM-DD");
        this.monthTracker = dt;
        break;

      case 3:
        dt = dataDirection == 0 ? moment().format('YYYY-MM-DD') : moment(this.yearTracker, "YYYY-MM-DD").add(dataDirection, 'year').format("YYYY-MM-DD");
        this.yearTracker = dt;
        break;
      case 4:
        dt = dataDirection == 0 ? moment().format('YYYY-MM-DD') : moment(this.allTracker, "YYYY-MM-DD").add(dataDirection, 'year').format("YYYY-MM-DD");
        this.allTracker = dt;
        break;
    }
    return dt;
  }

  getReportData (assetId, intervalSureDrive, dateRange) {
    return new Promise((resolve, reject) => {
      let formedURL = ENV.REPORT_DATA_URL + "?pp=";
      this.queryForReportData(assetId, intervalSureDrive, dateRange).then((res) => {
        resolve(res);
      },                                                                  (err) => {
        reject(err);
      });
    });
  }

  isReportingSessionExpired() {
    return (this.sharedProvider.ppTokenTimestamp && moment.duration(moment().diff(this.sharedProvider.ppTokenTimestamp)).asMinutes() < ENV.REPORT_API_SESSION_AGE ) ? false: true;
  }

  setCookie = (cname, cvalue, exdays) => {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  
  queryForReportData (assetId, intervalSureDrive, dateRange) {
    let data;
    const res = this.sharedAPIProvider.getUserInfo();
    this.authToken = res.response.authToken;
    return new Promise((resolve, reject) => {
      console.log(res);
      if (this.isReportingSessionExpired()) {
        let accountId = this.sharedAPIProvider.entityId(res.response.user.account.href);
        this.http.get(ENV.apiUrl + 'reporting/token/' + accountId, {
          headers: new HttpHeaders().set('Authorization', this.authToken),
        }).subscribe(res => {
          this.ppToken = this.extractPPToken(res);
          console.log("acquired ppToken -> "+this.ppToken);
          let formedURL = ENV.REPORT_DATA_URL + "?pp=" + encodeURIComponent(this.ppToken) + "&assets=" + assetId + "&Interval_Suredrive=" + intervalSureDrive + "&date_range=" + dateRange;
          console.log(formedURL);
          this.fetchReportData(formedURL).then((res) => {
            console.log("parsing report data");
            data = this.reportDataParser(res, intervalSureDrive);
            resolve(data);
          },                                   (err) => {
            console.log(err);
            reject(err);
          });
          this.sharedProvider.ppTokenTimestamp = moment();
        },           (err) => {
          reject(err);
        });
      }else{
        let formedURL = ENV.REPORT_DATA_URL + "?pp=" + encodeURIComponent(this.ppToken) + "&assets=" + assetId + "&Interval_Suredrive=" + intervalSureDrive + "&date_range=" + dateRange;
        console.log(formedURL);
        this.fetchReportData(formedURL).then((res) => {
          console.log("parsing report data");
          data = this.reportDataParser(res, intervalSureDrive);
          resolve(data);
        },                                   (err) => {
          console.log(err);
          reject(err);
        });
      }
    });
  }

  extractPPToken(data) {
    return data.results.token;
  }

  fetchReportData(urlEncodedRequest) {
    console.log("fetchReportData urlEncodedRequest ->" + urlEncodedRequest);
    return new Promise((resolve, reject) => {
      this.http.get(urlEncodedRequest, {
        // headers: new HttpHeaders().set('authorization', this.authToken),
      })
        .subscribe(res => {
          resolve(res);
        },         (err) => {
          reject(err);
        })
    });
  }

  reportDataParser(reportData, dataCategory) {
    console.log("data parsing started..."); console.log(reportData);
    let parsedReportData = [];
    if (reportData) {
      switch (dataCategory) {
        case 1:
          for (let i = 0; i < reportData.length; i++) {
            var dateOfDay = reportData[i].date_of_day;
            this.pivotDate = moment(dateOfDay, "YYYYMMDD").format('YYYY-MM-DD');
            var dayDate = moment(dateOfDay).isSame(moment(), 'day') ? "TODAY" : moment(dateOfDay, "YYYYMMDD").format('ddd').toUpperCase();
            var tipDate = moment(dateOfDay, "YYYYMMDD").format('MMMM D');
            var dateRange = (moment(reportData[0].date_of_day, "YYYYMMDD").format('MMM D - ') + moment(reportData[reportData.length - 1].date_of_day, "YYYYMMDD").format('MMM D, YYYY')).toUpperCase();
            parsedReportData.push({
              letter: dayDate,
              tipDate: tipDate,
              frequency: reportData[i].distance_driven,
              totalDistance: reportData[i].total_distance,
              distanceUnit: reportData[i].distanceUnit,
              dateRange: dateRange,
              responseDate: reportData[i].date_of_day
            });
          }
          break;
        case 2:
          for (let i = 0; i < reportData.length; i++) {
            var dateOfDay = reportData[i].date_of_day; // moment('12, 2018', 'M, YYYY')
            this.pivotDate = moment(dateOfDay, 'YYYY-MM-DD').format('YYYY-MM-DD');
            var tipDate = moment(dateOfDay, 'YYYY-MM-DD').format('MMMM D');
            var dayDate = moment(dateOfDay, 'YYYY-MM-DD').format('D');
            var dateRange = moment(reportData[0].date_of_day, 'YYYY-MM-DD').format('MMM YYYY').toUpperCase();
            parsedReportData.push({
              letter: dayDate,
              tipDate: tipDate,
              frequency: reportData[i].distance_driven,
              totalDistance: reportData[i].total_distance,
              distanceUnit: reportData[i].distanceUnit,
              dateRange: dateRange,
              responseDate: reportData[i].date_of_day
            });
          }
          break;
        case 3:
          for (let i = 0; i < reportData.length; i++) {
            var dateOfDay = reportData[i].date_of_day; // moment('12, 2018', 'M, YYYY')
            this.pivotDate = moment(dateOfDay, 'M, YYYY').format('YYYY-MM-DD');
            var tipDate = moment(dateOfDay, 'M, YYYY').format('MMM');
            var dayDate = moment(dateOfDay, 'M, YYYY').format('M');
            var dateRange = moment(reportData[0].date_of_day, 'M, YYYY').format('YYYY');
            parsedReportData.push({
              letter: dayDate,
              tipDate: tipDate,
              frequency: reportData[i].distance_driven,
              totalDistance: reportData[i].total_distance,
              distanceUnit: reportData[i].distanceUnit,
              dateRange: dateRange,
              responseDate: reportData[i].date_of_day
            });
          }
          break;
        case 4:
          for (let i = 0; i < reportData.length; i++) {
            var dateOfDay = reportData[i].date_of_day;
            this.pivotDate = moment(dateOfDay, 'M, YYYY').format('YYYY-MM-DD');
            var tipDate = moment(dateOfDay, 'M, YYYY').format('MMM YYYY');
            var dayDate = moment(dateOfDay, 'M, YYYY').format('M-MMM');
            var dateRange = (moment(reportData[0].date_of_day, 'M, YYYY').format('MMM YYYY') + " - " + moment(reportData[reportData.length - 1].date_of_day, 'M, YYYY').format('MMM YYYY')).toUpperCase();
            parsedReportData.push({
              letter: dayDate,
              tipDate: tipDate,
              frequency: reportData[i].distance_driven,
              totalDistance: reportData[i].total_distance,
              distanceUnit: reportData[i].distanceUnit,
              dateRange: dateRange,
              responseDate: reportData[i].date_of_day
            });
          }
          break;
      }
    }
    console.log(parsedReportData);
    return parsedReportData;
  }
}
