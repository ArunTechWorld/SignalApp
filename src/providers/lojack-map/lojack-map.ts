import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import bearing from '@turf/bearing';
import distance from '@turf/distance';
import { point } from '@turf/helpers';
import { Observable } from 'rxjs/Rx';
import { SharedProvider } from '../../providers/shared/shared';
import { SharedAPIProvider } from '../../providers/shared/sharedAPI';
import { ENV } from '../../environments/environment';
import * as moment from 'moment';
import * as _ from 'lodash';

export interface GetGeoZoneResponse {
  results: any;
}

export interface GetGeoZone {
  response: GetGeoZoneResponse;
}


/* 
  Generated class for the LojackMapProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LojackMapProvider {
  constructor(public http: HttpClient, public sharedProvider: SharedProvider, public sharedAPIProvider: SharedAPIProvider) { }
  private tripHistory;
  private retryCount;
  // private retryInterval;
  loadLojackMap() {
    return new Promise((resolve, reject) => {

    });
  }
  getDistanceFromLatLonInKm(lon1, lat1, lon2, lat2, index) {
    const point1 = point([lon1, lat1]);
    const point2 = point([lon2, lat2]);
    let finalval = '';
    const bearingvalue = bearing(point1, point2);
    const distanceval = distance(point1, point2);
    if (distanceval === 0) {
      finalval = 'none';
    } else if (distanceval > 2 && bearingvalue > -15 && bearingvalue <= -0) {
      finalval = 'Top';
    } else if (distanceval > 2 && bearingvalue >= 0 && bearingvalue <= 15) {
      finalval = 'Top';
    } else if (distanceval > 2 && bearingvalue > 15 && bearingvalue <= 81) {
      finalval = 'RightTop';
    } else if (distanceval > 2 && bearingvalue > 81 && bearingvalue <= 87) {
      finalval = 'Right';
    } else if (distanceval > 2 && bearingvalue > 87 && bearingvalue <= 173) {
      finalval = 'RightBottom';
    } else if (distanceval > 2 && bearingvalue > 173 && bearingvalue <= 180) {
      finalval = 'Bottom';
    } else if (distanceval > 2 && bearingvalue > -180 && bearingvalue <= -155) {
      finalval = 'Bottom';
    } else if (distanceval > 2 && bearingvalue > -155 && bearingvalue <= -93) {
      finalval = 'LeftBottom';
    } else if (distanceval > 2 && bearingvalue > -93 && bearingvalue <= -86) {
      finalval = 'Left';
    } else if (distanceval > 2 && bearingvalue > -86 && bearingvalue <= -15) {
      finalval = 'LeftTop';
    } else {
      finalval = 'False Case Issue';
    }
    const locationInfo = { latitude: lat2, longitude: lon2, angle: finalval, sliderIndex: index };
    return locationInfo;
  }

  decodePolyline(encoded) {
    // array that holds the points
    const points = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;
    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {

        b = encoded.charAt(index++).charCodeAt(0) - 63; // finds ascii                                                                                    //and substract it by 63
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);


      const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({ latitude: (lat / 1E5), longitude: (lng / 1E5) });

    }
    return points;
  }
  getTripHistory(authToken, assetId, pageNo) {
    const createFromDate = '2017-11-10'; // TO 2018-02-29]";
    const createToDate = moment().add(1, 'days').format('YYYY-MM-DD');
    const betweenDates = [];
    betweenDates.push((createFromDate + ' TO ' + createToDate).toString());
    return new Promise((resolve, reject) => {
      const assets = [];
      assets.push(assetId);
      // if (this.tripHistory) {
      //   resolve(this.tripHistory);
      // } else {
        console.log(authToken);
        // this.sharedProvider.showBusyIndicator();

        const requestObj = {
          search: {
            // maxResults: 10,
            sort: ['-createdOn'],
            searchTerms: {
              // "createdOn": betweenDates, // "[2017-11-10 TO 2018-02-29]",
              assetId: assets.toString(),
            },
          },
        };
        // ?pg='+pageNo+'&pgsize=10&sort=-createdOn ?pg=' + pageNumber + '&pgsize=' + ENV.MAX_PAGE_SIZE
        this.http.post(ENV.apiUrl + 'trips/search?pg=' + pageNo + '&pgsize=' + 20, requestObj, {
          headers: new HttpHeaders().set('authorization', authToken),
        })
          .subscribe(res => {
            resolve(res);
            // this.sharedProvider.hideBusyIndicator();
          },         (err) => {
            reject(err);
            // this.sharedProvider.hideBusyIndicator();
          });
      // }
    });


  }
  getTripDetails(authToken, uuid) {
    this.sharedProvider.showBusyIndicator();
    return new Promise((resolve, reject) => {
      this.http.get(ENV.apiUrl + 'trips/' + uuid, {
        headers: new HttpHeaders().set('authorization', authToken),
      })
        .subscribe(res => {
          resolve(res);
          this.sharedProvider.hideBusyIndicator();
        },         (err) => {
          reject(err);
          this.sharedProvider.hideBusyIndicator();
        });

    });
  }
  setTripHistory(value) {
    this.tripHistory = value;
  }
  getStoredTripHistory() {
    return this.tripHistory;
  }
  getGeoZones(assetDeviceId) {
    const userInfo = this.sharedAPIProvider.getUserInfo();
    const deployUrl: string = `${ENV.apiUrl}devices/${assetDeviceId}/geozones`;
    this.sharedProvider.showBusyIndicator();
    return new Promise((resolve, reject) => {
      this.http.get(deployUrl, {
        headers: new HttpHeaders().set('authorization', userInfo.response.authToken),
      })
        .subscribe(
          (res) => {
            resolve(res);
            this.sharedProvider.hideBusyIndicator();
          },
          (err) => {
            reject(err);
            this.sharedProvider.hideBusyIndicator();
          });
    });
  }
  getGeoZonesZoomFit() {
    const userInfo = this.sharedAPIProvider.getUserInfo();
    // const authToken= userInfo"TVBpcWlIWjc4SGM5YWxybDNOWjB4dz09OmpsUnBQRk8rd1lNcnNCMjJKWEJvM0E9PQ";
    // this.sharedProvider.showBusyIndicator();
    return new Promise((resolve, reject) => {
      this.http.get(ENV.apiUrl + 'geozones', {
        headers: new HttpHeaders().set('authorization', userInfo.response.authToken),
      })
        .subscribe(
          (res) => {
            resolve(res);
           // this.sharedProvider.hideBusyIndicator();
          },
          (err) => {
            reject(err);
            // this.sharedProvider.hideBusyIndicator();
          });
    });
  }
  getSaveGeoZoneObj(desc, createdDate, coordinates, circleRadius, geoZoneCategory = 'LOCATION') {
    const userInfo = this.sharedAPIProvider.getUserInfo();
    return {
      description: desc,
      active: true,
      account: userInfo.response.user.account,
      hysteresis: 5,
      inheritable: false,
      createdOn: createdDate,
      lastModifiedOn: createdDate,
      category: geoZoneCategory,
      geozoneDeployments: null,
      geoLocation: {
        coordinates,
        circleRadius,
        shape: 'CIRCLE',
      },
      name: desc,
      type: 'GEOZONE',
      version: 68,
      status: 'Enabled',
    };
  }
  saveGeoZone(saveObj, assetDeviceId, pegZoneIndex) {
    const userInfo = this.sharedAPIProvider.getUserInfo();
    // const authToken= userInfo"TVBpcWlIWjc4SGM5YWxybDNOWjB4dz09OmpsUnBQRk8rd1lNcnNCMjJKWEJvM0E9PQ";
    this.sharedProvider.showBusyIndicator();
    return new Promise((resolve, reject) => {
      this.http.post(ENV.apiUrl + 'geozones', { geozone: saveObj }, {
        headers: new HttpHeaders().set('authorization', userInfo.response.authToken),
      })
        .subscribe(
          (res: GetGeoZone) => {
            // console.log(res);
            // resolve(res);
            if (res.response && res.response.results[0] && res.response.results[0].geozone && res.response.results[0].geozone.id) {
              // _result(res.response, 'res.response.results[0].geozone.id');
              const savedGeoZoneId = res.response.results[0].geozone.id;
              this.deployGeoZone(savedGeoZoneId, assetDeviceId, userInfo, pegZoneIndex).then(
                (resDeployGeoZone: any) => {
                  resolve(resDeployGeoZone);
                },
                (err) => {
                  console.log(err);
                });
              // this.retryCount = 0;
              // console.log('1111');
              // Observable.timer(ENV.DEPLOY_GEOZONE_RETRY_DELAY, ENV.DEPLOY_GEOZONE_RETRY_DELAY)
              // .timeInterval()
              // .take(10).subscribe(() => {
              //   this.deployGeoZone(savedGeoZoneId, assetDeviceId, userInfo, pegZoneIndex);
              // });
              // this.retryInterval = setTimeout(
              //   () => {
              //     console.log('this.retryCount');
              //     console.log(this.retryCount);
              //     if (this.retryCount >= ENV.CRITICAL_PRIORITY_API_RETRY) {
              //       clearInterval(this.retryInterval);
              //       this.cancelRequest();
              //     } else {
              //       this.deployGeoZone(savedGeoZoneId, assetDeviceId, userInfo, pegZoneIndex);
              //     }
              //     this.retryCount = this.retryCount + 1;
              //   },
              //   ENV.DEPLOY_GEOZONE_RETRY_DELAY);
            }
            // this.sharedProvider.hideBusyIndicator();
          },
          (err) => {
            // this.cancelRequest();
            console.log(err);
            reject(err);
            this.sharedProvider.hideBusyIndicator();
          });
    });
  }

  updateGeoZone(saveObj, assetDeviceId, pegZoneIndex, updateGeoZoneId) {
    console.log('updateGeoZone');
    console.log(saveObj);
    const userInfo = this.sharedAPIProvider.getUserInfo();
    this.sharedProvider.showBusyIndicator();
    const updateGeoZoneUrl: string = `${ENV.apiUrl}geozones/${updateGeoZoneId}`;
    return new Promise((resolve, reject) => {
      this.http.put(updateGeoZoneUrl, { geozone: saveObj }, {
        headers: new HttpHeaders().set('authorization', userInfo.response.authToken),
      })
        .subscribe(
          (res: GetGeoZone) => {
            // console.log(res);
            resolve(res);
            // if (res.response && res.response.results[0] && res.response.results[0].geozone && res.response.results[0].geozone.id) {
            //   // _result(res.response, 'res.response.results[0].geozone.id');
            //   const savedGeoZoneId = res.response.results[0].geozone.id;
            //   this.deployGeoZone(savedGeoZoneId, assetDeviceId, userInfo, pegZoneIndex).then(
            //     (resDeployGeoZone: any) => {
            //       resolve(resDeployGeoZone);
            //     },
            //     (err) => {
            //       console.log(err);
            //     });
            // }
          },
          (err) => {
            // this.cancelRequest();
            console.log(err);
            // reject(err);
            this.sharedProvider.hideBusyIndicator();
          });
    });
  }
  // cancelRequest() {
  //   clearInterval(this.retryInterval);
  // }
  deployGeoZone(savedGeoZoneId, assetDeviceId, userInfo, pegZoneIndex) {
    this.sharedProvider.showBusyIndicator();
    const deployUrl: string = `${ENV.apiUrl}geozones/${savedGeoZoneId}/deploy`;
    const deplyObj = {
      zoneParameterIndexes: [
        {
          reportType: 'ENTRY_EXIT',
          parameterIndex: pegZoneIndex,
          geozoneId: savedGeoZoneId,
        },
      ],
      deviceId: assetDeviceId,
    };
    return new Promise((resolve, reject) => {
      this.http.post(deployUrl, { ...deplyObj }, {
        headers: new HttpHeaders().set('authorization', userInfo.response.authToken),
      })
        .subscribe(
          (res: any) => {
            // console.log('deployGeoZone');
            // console.log(res);
            if (res && res.response && res.response.results[0] && res.response.results[0].deviceCommandEvent && res.response.results[0].deviceCommandEvent.messageUuid) {

              const timerObservable = Observable.timer(ENV.DEPLOY_GEOZONE_RETRY_DELAY, ENV.DEPLOY_GEOZONE_RETRY_DELAY)
              .timeInterval()
              .take(ENV.CRITICAL_PRIORITY_API_RETRY).subscribe(
                () => {
                  // console.log('calling');
                  this.checkDeployStatus(userInfo.response.authToken, res.response.results[0].deviceCommandEvent.messageUuid).then(
                    (statusRes: any) => {
                      if (statusRes && statusRes.response && statusRes.response.results[0] && statusRes.response.results[0].deviceCommandEvent && statusRes.response.results[0].deviceCommandEvent.status) {
                        // console.log('status');
                        // console.log(res.response.results[0].deviceCommandEvent.status);
                        if (statusRes.response.results[0].deviceCommandEvent.status === 'COMPLETED') {
                          // console.log('compl');
                          timerObservable.unsubscribe();
                          this.sharedProvider.hideBusyIndicator();
                          resolve(res);
                        }
                        // return false;
                      }
                      // console.log('currentStatus');
                      // console.log(currentStatus);
                      // if (currentStatus) {
                      //   resolve(res);
                      //   this.sharedProvider.hideBusyIndicator();
                      //   // observer.onCompleted();
                      // }
                    },
                    (err) => {
                      const error = this.sharedAPIProvider.getErrorMessage(err);
                      console.log(error);
                    });
                },
                (err) => {
                  console.log('Error: ' + err);
                },
                () => {
                  console.log('Finished');
                  this.sharedProvider.hideBusyIndicator();
                  resolve(res);
                });
            // this.sharedProvider.hideBusyIndicator();
            }
          },
          (err) => {
            console.log(err);
            // reject(err);
            this.sharedProvider.hideBusyIndicator();
          });
    });
  }

  checkDeployStatus(authToken, messageUuid) {
    const deployStatusUrl: string = `${ENV.apiUrl}devices/commands/${messageUuid}`;
    return new Promise((resolve, reject) => {
      this.http.get(deployStatusUrl, {
        headers: new HttpHeaders().set('authorization', authToken),
      })
        .subscribe(
          (res: any) => {
            // console.log('checkDeployStatus');
            // if (res && res.response && res.response.results[0] && res.response.results[0].deviceCommandEvent && res.response.results[0].deviceCommandEvent.status) {
            //   console.log('status');
            //   console.log(res.response.results[0].deviceCommandEvent.status);
            //   if (res.response.results[0].deviceCommandEvent.status === 'COMPLETED') {
            //     return true;
            //   }
            //   return false;
            // }
            // console.log(res);
            resolve(res);
          },
          (err) => {
            // reject(err);
          });
    });
    // {{baseUrl}}/devices/commands/2a976745-5db5-43ff-b58b-069ed0274436
    // this.deployGeoZone(savedGeoZoneId, assetDeviceId, userInfo, pegZoneIndex);
  }

  deleteGeoZone(deleteGeozoneId, assetDeviceId) {
    const userInfo = this.sharedAPIProvider.getUserInfo();
    const deleteGeoZoneUrl: string = `${ENV.apiUrl}geozones/${deleteGeozoneId}`;
    this.sharedProvider.showBusyIndicator();
    return new Promise((resolve, reject) => {
      this.http.delete(deleteGeoZoneUrl, {
        headers: new HttpHeaders().set('authorization', userInfo.response.authToken),
      })
        .subscribe(
          (res) => {
            this.deleteUnlinkGeoZone(deleteGeozoneId, assetDeviceId, userInfo).then(
              (unlinkRes: any) => {
                resolve(res);
              },
              (err) => {
                const error = this.sharedAPIProvider.getErrorMessage(err);
                console.log(error);
              });
            // resolve(res);
            // this.sharedProvider.hideBusyIndicator();
          },
          (err) => {
            // console.log(err);
            reject(err);
            this.sharedProvider.hideBusyIndicator();
          });
    });
  }

  deleteUnlinkGeoZone(deleteGeozoneId, assetDeviceId, userInfo) {
    const deleteUnlinkGeoZoneUrl: string = `${ENV.apiUrl}devices/${assetDeviceId}/geozones/${deleteGeozoneId}`;
    this.sharedProvider.showBusyIndicator();
    return new Promise((resolve, reject) => {
      this.http.delete(deleteUnlinkGeoZoneUrl, {
        headers: new HttpHeaders().set('authorization', userInfo.response.authToken),
      })
        .subscribe(
          (res) => {
            resolve(res);
            this.sharedProvider.hideBusyIndicator();
          },
          (err) => {
            // console.log(err);
            reject(err);
            this.sharedProvider.hideBusyIndicator();
          });
    });
  }

  getDeviceGeoZones(deviceId) {
    // this.sharedProvider.showBusyIndicator();
    const userInfo = this.sharedAPIProvider.getUserInfo();
    const deployUrl: string = (deviceId !== 0)
      ? `${ENV.apiUrl}devices/${deviceId}/geozones?status=Enabled`
      : `${ENV.apiUrl}geozones/`;
    return new Promise((resolve, reject) => {
      this.http.get(deployUrl, {
        headers: new HttpHeaders().set('authorization', userInfo.response.authToken),
      })
        .subscribe(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          });
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
    const userInfo = this.sharedAPIProvider.getUserInfo();
    const requestObj = { search: { maxResults: 1000, searchTerms: { id: zoneIdList } } };
    const deployUrl: string = `${ENV.apiUrl}geozones/search`;
    return new Promise((resolve, reject) => {
      this.http.post(ENV.apiUrl + 'geozones/search', requestObj, {
        headers: new HttpHeaders().set('authorization', userInfo.response.authToken),
      })
        .subscribe(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          });
    });
  }
}
