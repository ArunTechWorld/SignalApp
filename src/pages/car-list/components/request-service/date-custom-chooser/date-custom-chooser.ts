import { Component, ElementRef, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { DAY_NAMES } from '../../../../../helper/utils';

@Component({
  selector: 'app-date-custom-chooser',
  templateUrl: 'date-custom-chooser.html',
})
export class DateCustomChooserComponent {

  @Output() selectedDate = new EventEmitter();

  serviceCenterDates = [];
  dateDisplay;
  todayDate;
  dateCreateCount: number = 60;
  isLeftDisabled: boolean = true;
  isFirstSelected: boolean = true;
  serviceCenterDatesPlain = [];

  constructor(
    public element: ElementRef,
  ) {
    this.dateDisplay = moment();
    this.todayDate = moment().format();
    // console.log(this.todayDate);
    this.generateDates();
  }
  private dateCompWidth: number = 0;
  ionViewDidEnter() {
    const drawerComp = this.element.nativeElement.querySelector('#dateCustomField');
    this.dateCompWidth = drawerComp.clientWidth;
  }
  generateDates() {
    // const serviceCenterDatesTemp = [];
    for (let i = 0; i < this.dateCreateCount; i += 1) {
      const obj = {
        date: this.dateDisplay.format('D'),
        month: this.dateDisplay.format('MMM'),
        monthYear: this.dateDisplay.format('MMM-YYYY'),
        day: DAY_NAMES[this.dateDisplay.day()],
        dateObj: this.dateDisplay.format(),
        isSelected: this.dateDisplay.format() === this.todayDate,
      };
      // console.log(obj);
      // this.items.push( this.items.length );
      this.serviceCenterDatesPlain.push(obj);
      // this.serviceCenterDates.push(obj);
      this.dateDisplay.add(1, 'days');
      if (i >= this.dateCreateCount - 1) {
        // console.log(this.serviceCenterDatesPlain);
        const result = _.chain(this.serviceCenterDatesPlain)
          .groupBy('monthYear')
          .toPairs()
          .map(pair => _.zipObject(['monthYear', 'allDates'], pair))
          .value();
        // console.log(result);
        this.serviceCenterDates = [];
        this.serviceCenterDates.push(...result);
      }
    }
  }

  itemSelected(item) {
    // console.log('item');
    // console.log(item);
    const datesGroupLen = this.serviceCenterDates.length;
    for (let i = 0; i < datesGroupLen; i += 1) {
      // console.log(this.serviceCenterDates[i]);
      const datesLen = this.serviceCenterDates[i].allDates.length;
      for (let j = 0; j < datesLen; j += 1) {
        // console.log(this.serviceCenterDates[i].allDates[j]);
        if (item === this.serviceCenterDates[i].allDates[j]) {
          this.serviceCenterDates[i].allDates[j].isSelected = true;
        } else {
          this.serviceCenterDates[i].allDates[j].isSelected = false;
        }
      }
    }
    this.isFirstSelected = false;
    this.selectedDate.emit(item);
  }

  dateScroll(event) {
    // console.log(event);
    if (event.srcElement.scrollWidth < event.srcElement.scrollLeft + (event.srcElement.clientWidth * 2)) {
      // console.log('date Updated');
      this.generateDates();
    }
    if (event.srcElement.scrollLeft === 0) {
      this.isLeftDisabled = true;
    } else if (this.isLeftDisabled) {
      this.isLeftDisabled = false;
    }
  }

  prevDates() {
    // console.log('prevDates');
    const drawerComp = this.element.nativeElement.querySelector('#dateCustomField');
    // console.log(drawerComp.clientWidth);
    // console.log(document.getElementById('dateCustomField').scrollLeft);
    const currentLeftPos = document.getElementById('dateCustomField').scrollLeft;
    // console.log(currentLeftPos);
    const newLeftPos = currentLeftPos - drawerComp.clientWidth + 8;
    // console.log(newLeftPos);
    document.getElementById('dateCustomField').scrollLeft = newLeftPos;
    if (newLeftPos <= 0) {
      this.isLeftDisabled = true;
    }
  }
  nextDates() {
    console.log('next');
    this.isLeftDisabled = false;
    const drawerComp = this.element.nativeElement.querySelector('#dateCustomField');
    // console.log(drawerComp.clientWidth);
    // console.log(document.getElementById('dateCustomField').scrollLeft);
    const currentLeftPos = document.getElementById('dateCustomField').scrollLeft;
    // console.log(this.dateCompWidth);
    // console.log(currentLeftPos);
    const newLeftPos = currentLeftPos + drawerComp.clientWidth - 8;
    // console.log(newLeftPos);
    document.getElementById('dateCustomField').scrollLeft = newLeftPos;
  }

  monthNameSplit(value: string) {
    return value.split('-')[0];
  }

}
