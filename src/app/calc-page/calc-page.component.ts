import { Component, OnInit } from '@angular/core';

import * as moment from 'moment';

const FORMAT = 'HH:mm:ss';
const BEFORE_TIME = moment('19:00:00', FORMAT);

@Component({
  selector: 'app-calc-page',
  templateUrl: './calc-page.component.html',
  styleUrls: ['./calc-page.component.scss']
})
export class CalcPageComponent implements OnInit {

  isMeridian = false;
  showSpinners = false;

  myTime: Date;
  price: number;
  finalPrice: number;
  diff: number;
  today = new Date();
  Holidays = require('date-holidays');
  hd = new this.Holidays()

  constructor() { }

  ngOnInit(): void {
    // this.today.setHours(0, 0);
    // this.myTime = this.today;
  }

  // TODO make update when something change
  // TODO add scenario when it is after 00:00 and after 03:00 and when working time till 03:00

  onInput(event): void {
    // console.log('event', event)
    // console.log('myTime', this.myTime)
    this.price = this.getPrice(event);
    this.diff = this.getMinutesFromTime(event);
  }

  clear(): void {
    this.myTime = void 0;
  }

  getMinutesFromTime(time: any): number {
    const newTime = moment(time);
    const now = moment();

    return now.diff(newTime, 'minutes');
  }

  isWeekend(): boolean {
    const weekday = moment(this.today).format('dddd'); // Monday ... Sunday
    return weekday === 'Sunday' || weekday === 'Saturday';
  }

  isHoliday(): boolean {
    return this.hd.isHoliday(new Date());
  }

  getPrice(time: Date): number {
    // console.log('GET PRICE')
    const newTime = moment(time, FORMAT);
    const now = moment(new Date(), FORMAT);
    const diff = this.getMinutesFromTime(time);

    // console.log('NOW', now)
    // console.log('BEFORE', BEFORE_TIME)
     // TODO add condition it is weekend or holiday
    // console.log('isHoliday', this.isHoliday());

    if (this.isWeekend() || this.isHoliday()) {
      const result = +diff * 3;
      return result >= 480 ? 480 : result;
    } else if (now.isBefore(BEFORE_TIME) && !this.isWeekend()) {
      const result = +diff * 2.5;
      return result >= 480 ? 480 : result;
    } else if (newTime.isAfter(BEFORE_TIME) && !this.isWeekend()) {
      const result = +diff * 3;
      return result >= 480 ? 480 : result;
    } else {
      // let timeBefore19 = ;
      console.log('else')
      // TODO add condition if time before and after 19
    }
  }

  multiply(times: number): void {
    this.finalPrice =  times * this.getPrice(this.myTime);
  }

    // TODO add opportunity to substract the minutes

}
