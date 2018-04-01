import { Component, Output, Input, EventEmitter } from '@angular/core';

import * as moment from 'moment';


@Component({
  selector: 'app-time-custom-chooser',
  templateUrl: 'time-custom-chooser.html',
})
export class TimeCustomChooserComponent {

  @Output() selectedTime = new EventEmitter();
  // @Input('selectedDate') selectedDate: any;

  serviceCenterTimes = [];
  dateCreateCount: number = 30;
  currentDate: any = moment();

  constructor() {
    // this.generateTimes();
  }
  private timeLoopCount: number = 48;

  @Input()
  set selectedDate(selectedDate: any) {
    // console.log('selectedDate');
    // console.log(selectedDate);
    this.currentDate = selectedDate;
    this.generateTimes();
  }
  generateTimes() {
    const serviceCenterTimesTemp = [];
    // console.log(moment(this.currentDate).isSame(moment(), 'day'));
    for (let i = 0; i < this.timeLoopCount; i += 1) {
      const now = moment().startOf('day').add(i / 2, 'hour');
      // console.log(this.currentDate.isBefore(now));
      const obj = {
        time: now.format('h:mm A'),
        isValidTime: moment(this.currentDate).isSame(moment(), 'day') ? this.currentDate.isBefore(now) : true,
        dateObj: now.format(),
        isSelected: false,
      };
      serviceCenterTimesTemp.push(obj);
      if (i >= this.timeLoopCount - 1) {
        this.serviceCenterTimes = [];
        this.serviceCenterTimes.push(...serviceCenterTimesTemp);
      }
    }
  }
  itemSelected(item) {
    const timesLen = this.serviceCenterTimes.length;
    for (let i = 0; i < timesLen; i += 1) {
      if (item === this.serviceCenterTimes[i]) {
        this.serviceCenterTimes[i].isSelected = true;
      } else {
        this.serviceCenterTimes[i].isSelected = false;
      }
    }
    // console.log(item);
    this.selectedTime.emit(item);
  }
  // dateScroll(event) {
  //   if (event.srcElement.scrollWidth < event.srcElement.scrollLeft + (event.srcElement.clientWidth * 2)) {
  //     // console.log('date Updated');
  //     // this.createDates();
  //   }
  // }
}
