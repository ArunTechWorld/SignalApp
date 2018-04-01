import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the DateTimeProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DateTimeProvider {

  constructor(public http: HttpClient) {
    console.log('Hello DateTimeProvider Provider');
  }

  secondsToHoursMinsSecs(seconds) {
    // console.log('seconds ' + seconds);
    // const seconds = 7600;
    const sec = Number(seconds);
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round(seconds % 3600 / 60);
    const scs = Math.floor(seconds % 3600 % 60);

    // const hDisplay = hours > 0 ? hours + (hours === 1 ? ' hour, ' : ' hours, ') : '';
    // const mDisplay = mins > 0 ? mins + (mins === 1 ? ' minute, ' : ' minutes, ') : '';
    // const sDisplay = scs > 0 ? scs + (scs === 1 ? ' second' : ' seconds') : '';
    const hrsTxt = (hours === 1 && mins === 0) ? ' hour' : ' hours';
    const minsTxt = (mins === 1) ? ' min' : ' mins';
    const displayValue = (hours > 0) ? hours + '.' + mins + hrsTxt : mins +  minsTxt;
    // console.log('displayValue ' + displayValue);
    return displayValue; // hDisplay + mDisplay + sDisplay;
  }
}
