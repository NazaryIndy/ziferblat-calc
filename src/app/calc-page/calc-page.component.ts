import { Component, ViewChild } from '@angular/core';

import * as moment from 'moment';
import { FormGroup } from '@angular/forms';
import { TimepickerComponent } from '../timepicker/timepicker.component';

const FORMAT = 'HH:mm:ss';
const CROSS_TIME = moment('19:00:00', FORMAT);

@Component({
  selector: 'app-calc-page',
  templateUrl: './calc-page.component.html',
  styleUrls: ['./calc-page.component.scss']
})
export class CalcPageComponent {

  @ViewChild('tp') tp: TimepickerComponent;

  public form: FormGroup;

  public isMeridian = false;
  public showSpinners = false;
  public cameTime: Date;
  public substractMinutes: string;
  public price: number;
  public finalPrice: number;
  public minutesPast: number;
  private today = new Date();
  private Holidays = require('date-holidays');
  private hd = new this.Holidays();

  public clear(): void {
    this.cameTime = void 0;
    this.finalPrice = null;
    this.price = null;
    this.minutesPast = null;
    this.substractMinutes = null;
    this.tp.buildForm();
  }

  private formatDayMonth(value: string): string {
    if (value.length === 1) {
      return 0 + value;
    }
    return value;
  }

  public calcPrice(time): void {
    const day = this.formatDayMonth(this.today.getDate().toString());
    const month = this.formatDayMonth((this.today.getMonth() + 1).toString());
    const year = this.today.getFullYear().toString();

    this.cameTime = new Date(`${year}-${month}-${day}T${time.hours}:${time.minutes}:00+0300`);

    if (this.cameTime && this.cameTime.getTime() > this.today.getTime()) {
      console.warn('You should enter time before now');
    } else if (this.cameTime) {
      this.finalPrice = null;
      this.price = this.getPrice(this.cameTime);
      this.minutesPast = this.getMinutesFromTime(this.cameTime);
    }
  }

  private getMinutesFromTime(time: any): number {
    const now = moment();
    const cameTime = moment(time);
    const hoursNow = now.hours();
    const minutesNow = now.minutes();
    const hoursCame = cameTime.hours();
    const minutesCame = cameTime.minutes();
    const newTime = moment(time);

    if (!this.isAfterClose(hoursNow, minutesNow) && !this.isWeekend()) {
      return now.diff(newTime, 'minutes');
    } else if (this.isAfterClose(hoursNow, minutesNow)) {
      const totalMinutesBefore = (24 - hoursCame) * 60 - minutesCame;
      const totalMinutesAfter = hoursNow * 60 + minutesNow;

      return totalMinutesBefore + totalMinutesAfter;
    } else if (!this.isAfterCloseWeekday(hoursNow, minutesNow) && this.isWeekend()) {
      if (hoursCame >= 0 && hoursCame < 3) {
        return (hoursNow - hoursCame) * 60 + minutesNow - minutesCame;
      }
      const totalMinutesBefore = (24 - hoursCame) * 60 - minutesCame;
      const totalMinutesAfter = hoursNow * 60 + minutesNow;

      return totalMinutesBefore + totalMinutesAfter;
    } else if (this.isAfterCloseWeekday(hoursNow, minutesNow)) {
      let todayMinutes: number;
      if (hoursCame >= 0 && hoursCame < 3) {
        todayMinutes = (hoursNow - hoursCame) * 60 + minutesNow - minutesCame;
      } else {
        const totalMinutesBefore = (24 - hoursCame) * 60 - minutesCame;
        const totalMinutesAfter = hoursNow * 60 + minutesNow;
        todayMinutes = totalMinutesBefore + totalMinutesAfter;
      }

      return todayMinutes;
    }
  }

  private getPrice(time: Date): number {
    const cameTime = moment(time, FORMAT);
    const now = moment(this.today, FORMAT);
    const minutesPast = this.getMinutesFromTime(time);

    const hoursCame = cameTime.hours();
    const minutesCame = cameTime.minutes();
    const hoursNow = now.hours();
    const minutesNow = now.minutes();

    if (!this.isAfterClose(hoursNow, minutesNow) && !this.isAfterCloseWeekday(hoursNow, minutesNow)) {
      if (this.isWeekend() || this.isHoliday() || cameTime.isAfter(CROSS_TIME)) {
        const result = +minutesPast * 3;

        return result >= 480 ? 480 : result;
      } else if (now.isBefore(CROSS_TIME) && !this.isWeekend() && !this.isHoliday()) {
        const result = +minutesPast * 2.5;

        return result >= 480 ? 480 : result;
      } else {
        const totalMinutesBefore = (19 - hoursCame) * 60 - minutesCame;
        const totalMinutesAfter = (hoursNow - 19) * 60 + minutesNow;
        const result = totalMinutesBefore * 2.5 + totalMinutesAfter * 3;

        return result >= 480 ? 480 : result;
      }
    } else if (this.isAfterClose(hoursNow, minutesNow) && !this.isAfterCloseWeekday(hoursNow, minutesNow)) {
      const totalMinutesBefore = ((24 - hoursCame) * 60 - minutesCame);
      let priceBefore = totalMinutesBefore * 3;
      priceBefore = priceBefore > 480 ? 480 : priceBefore;
      const totalMinutesAfter = (hoursNow * 60 + minutesNow);
      const priceAfter = totalMinutesAfter * 3;

      return priceBefore + priceAfter;
    } else if (this.isAfterCloseWeekday(hoursNow, minutesNow)) {
      if (hoursCame >= 0 && hoursCame < 3) {
        const totalMinutesBefore = (3 - hoursCame) * 60 + minutesNow - minutesCame;
        let priceBefore = totalMinutesBefore * 3;
        priceBefore = priceBefore > 480 ? 480 : priceBefore;
        const totalMinutesAfter = (hoursNow - hoursCame) * 60 + minutesNow - minutesCame - totalMinutesBefore;
        const priceAfter = totalMinutesAfter * 3;

        return priceBefore + priceAfter;
      } else {
        const totalMinutesBefore = (24 - hoursCame) * 60 - minutesCame + 3 * 60;
        let priceBefore = totalMinutesBefore * 3;
        priceBefore = priceBefore > 480 ? 480 : priceBefore;
        const totalMinutesAfter = (hoursNow - 3) * 60 + minutesNow;
        const priceAfter = totalMinutesAfter * 3;

        return priceBefore + priceAfter;
      }
    }
  }

  private isWeekend(): boolean {
    const weekday = moment(this.today).format('dddd');
    return weekday === 'Sunday' || weekday === 'Saturday';
  }

  private isHoliday(): boolean {
    return this.hd.isHoliday(this.today);
  }

  private isAfterClose(hoursNow, minutesNow): boolean {
    if (((hoursNow === 0 && minutesNow !== 0) || hoursNow === 1 || hoursNow === 2 || hoursNow === 3) && !this.isWeekend()) {
      return true;
    }
    return false;
  }

  private isAfterCloseWeekday(hoursNow, minutesNow): boolean {
    if (this.isWeekend() && ((hoursNow === 3 && minutesNow !== 0) || hoursNow === 4 || hoursNow === 5 || hoursNow === 6)) {
      return true;
    }
    return false;
  }

  public multiply(times: number, price: number): void {
    this.finalPrice = times * price;
  }

  public substract(minutes: string): void {
    const newCameTime = moment(this.cameTime).add(minutes, 'minutes');
    this.cameTime = new Date(newCameTime.format());
    this.minutesPast = this.minutesPast - +minutes;
    this.price = this.getPrice(newCameTime.toDate());
  }

}
