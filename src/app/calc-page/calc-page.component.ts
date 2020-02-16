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
  finalPrice: number;

  constructor() { }

  ngOnInit(): void {
  }

  // TODO make update when something change

  clear(): void {
    this.myTime = void 0;
  }

  getMinutesFromTime(time: any): number {
    const newTime = moment(time);
    const now = moment();

    return now.diff(newTime, 'minutes');
  }

  getPrice(time: Date): number {
    const newTime = moment(time, FORMAT);
    const now = moment({}, FORMAT);
    const diff = this.getMinutesFromTime(time);

     // TODO add condition it is weekend or holiday

    if (now.isBefore(BEFORE_TIME)) {
      const result = +diff * 2.5;
      return result >= 480 ? 480 : result;
    } else if (newTime.isAfter(BEFORE_TIME)) {
      const result = +diff * 3;
      return result >= 480 ? 480 : result;
    } else {
      // TODO add condition if time before and after 19
    }
  }

  multiply(times: number): void {
    this.finalPrice =  times * this.getPrice(this.myTime);
  }

    // TODO add opportunity to substract the minutes

}
