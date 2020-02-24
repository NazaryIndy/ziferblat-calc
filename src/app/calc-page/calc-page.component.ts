import { Component, OnInit } from '@angular/core';

import * as moment from 'moment';

const FORMAT = 'HH:mm:ss';
const CROSS_TIME = moment('19:00:00', FORMAT);

@Component({
  selector: 'app-calc-page',
  templateUrl: './calc-page.component.html',
  styleUrls: ['./calc-page.component.scss']
})
export class CalcPageComponent implements OnInit {

  public isMeridian = false;
  public showSpinners = false;

  public cameTime: Date;
  public price: number;
  public finalPrice: number;
  public minutesPast: number;
  private today = new Date();
  private Holidays = require('date-holidays');
  private hd = new this.Holidays()

  constructor() { }

  ngOnInit(): void {
    // this.today.setHours(0, 0);
    // this.myTime = this.today;
  }

  // TODO make update when something change
  // TODO add scenario when it is after 00:00 and after 03:00 and when working time till 03:00

  // onInput(event): void {
  //   // console.log('event', event)
  //   // console.log('myTime', this.myTime)
  //   this.price = this.getPrice(event);
  //   this.minutesPast = this.getMinutesFromTime(event);
  // }

  public clear(): void {
    this.cameTime = void 0;
    this.finalPrice = null;
  }

  public calcPrice(event): void {
    this.finalPrice = null;
    this.price = this.getPrice(event);
    this.minutesPast = this.getMinutesFromTime(event);
  }

  private getMinutesFromTime(time: any): number {
    const newTime = moment(time);
    const now = moment();

    return now.diff(newTime, 'minutes');
  }

  private isWeekend(): boolean {
    const weekday = moment(this.today).format('dddd');
    return weekday === 'Sunday' || weekday === 'Saturday';
  }

  private isHoliday(): boolean {
    return this.hd.isHoliday(new Date());
  }

  private getPrice(time: Date): number {
    const cameTime = moment(time, FORMAT);
    const now = moment(new Date(), FORMAT);
    const diff = this.getMinutesFromTime(time);

    if (this.isWeekend() || this.isHoliday()) {
      const result = +diff * 3;
      return result >= 480 ? 480 : result;
    } else if (now.isBefore(CROSS_TIME) && !this.isWeekend()) {
      const result = +diff * 2.5;
      return result >= 480 ? 480 : result;
    } else if (cameTime.isAfter(CROSS_TIME) && !this.isWeekend()) {
      const result = +diff * 3;
      return result >= 480 ? 480 : result;
    } else {
      const hoursCame = cameTime.hours();
      const minutesCame = cameTime.minutes();
      const hoursNow = now.hours();
      const minutesNow = now.minutes();

      const totalMinutesBefore = (19 - hoursCame) * 60 - minutesCame;
      const totalMinutesAfter = (hoursNow - 19) * 60 + minutesNow;

      const result = totalMinutesBefore * 2.5 + totalMinutesAfter * 3;
      return result >= 480 ? 480 : result;
    }
  }

  public multiply(times: number): void {
    this.finalPrice = times * this.getPrice(this.cameTime);
  }

    // TODO add opportunity to substract the minutes

}
