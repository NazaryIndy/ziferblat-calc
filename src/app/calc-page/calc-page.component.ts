import { Component, ViewChild, ElementRef } from '@angular/core';

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
  @ViewChild('subMinutes') sm: ElementRef;

  public form: FormGroup;

  public isMeridian = false;
  public showSpinners = false;
  public cameTime: Date;
  public subtractMinutes: string;
  public price: number;
  public finalPrice: number;
  public minutesPast: number;
  public newMinutesPast: number;
  private today = new Date();
  private Holidays = require('date-holidays');
  private hd = new this.Holidays();


  private cameTimeG: any;
  private hoursNowG: number;
  private minutesNowG: number;
  private hoursCameG: number;
  private minutesCameG: number;
  private newTimeG: any;

  private cameTimeP: any;
  private nowP: any;
  private minutesPastP: number;
  private hoursCameP: number;
  private minutesCameP: number;
  private hoursNowP: number;
  private minutesNowP: number;

  private makeDataForMinutes(time, now): void {
    this.cameTimeG = moment(time);
    this.hoursNowG = now.hours();
    this.minutesNowG = now.minutes();
    this.hoursCameG = this.cameTimeG.hours();
    this.minutesCameG = this.cameTimeG.minutes();
    this.newTimeG = moment(time);
  }

  private makeDataForPrice(time): void {
    this.cameTimeP = moment(time, FORMAT);
    this.nowP = moment(this.today, FORMAT);
    this.minutesPastP = this.getMinutesFromTime(time);
    this.hoursCameP = this.cameTimeP.hours();
    this.minutesCameP = this.cameTimeP.minutes();
    this.hoursNowP = this.nowP.hours();
    this.minutesNowP = this.nowP.minutes();
  }

  public clear(): void {
    this.cameTime = void 0;
    this.finalPrice = null;
    this.price = null;
    this.minutesPast = null;
    this.newMinutesPast = null;
    this.subtractMinutes = null;
    this.tp.buildForm();
  }

  private formatDayMonth(value: string): string {
    if (value.length === 1) {
      return 0 + value;
    }
    return value;
  }

  public calcPrice(time): void {
    this.newMinutesPast = null;
    const day = this.formatDayMonth(this.today.getDate().toString());
    const month = this.formatDayMonth((this.today.getMonth() + 1).toString());
    const year = this.today.getFullYear().toString();

    this.cameTime = new Date(`${year}-${month}-${day}T${time.hours}:${time.minutes}:00+03:00`);

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
    this.makeDataForMinutes(time, now);

    if (!this.isAfterClose(this.hoursNowG, this.minutesNowG) && !this.isWeekend()) {
      return now.diff(this.newTimeG, 'minutes');
    } else if (this.isAfterClose(this.hoursNowG, this.minutesNowG)) {
      const totalMinutesBefore = (24 - this.hoursCameG) * 60 - this.minutesCameG;
      const totalMinutesAfter = this.hoursNowG * 60 + this.minutesNowG;

      return totalMinutesBefore + totalMinutesAfter;
    } else if (!this.isAfterCloseWeekday(this.hoursNowG, this.minutesNowG) && this.isWeekend()) {
      if (this.hoursCameG >= 0 && this.hoursCameG < 3) {
        return (this.hoursNowG - this.hoursCameG) * 60 + this.minutesNowG - this.minutesCameG;
      }
      const totalMinutesBefore = (24 - this.hoursCameG) * 60 - this.minutesCameG;
      const totalMinutesAfter = this.hoursNowG * 60 + this.minutesNowG;

      return totalMinutesBefore + totalMinutesAfter;
    } else if (this.isAfterCloseWeekday(this.hoursNowG, this.minutesNowG)) {
      let todayMinutes: number;
      if (this.hoursCameG >= 0 && this.hoursCameG < 3) {
        todayMinutes = (this.hoursNowG - this.hoursCameG) * 60 + this.minutesNowG - this.minutesCameG;
      } else {
        const totalMinutesBefore = (24 - this.hoursCameG) * 60 - this.minutesCameG;
        const totalMinutesAfter = this.hoursNowG * 60 + this.minutesNowG;
        todayMinutes = totalMinutesBefore + totalMinutesAfter;
      }

      return todayMinutes;
    }

  }

  private getPrice(time: Date): number {
    this.today = new Date();

    this.makeDataForPrice(time);

    if (!this.isAfterClose(this.hoursNowP, this.minutesNowP) && !this.isAfterCloseWeekday(this.hoursNowP, this.minutesNowP)) {
      if (this.isWeekend() || this.isHoliday() || this.cameTimeP.isAfter(CROSS_TIME)) {
        const result = +this.minutesPastP * 3;
        return result >= 480 ? 480 : result;
      } else if (this.nowP.isBefore(CROSS_TIME) && !this.isWeekend() && !this.isHoliday()) {
        const result = +this.minutesPastP * 2.5;

        return result >= 480 ? 480 : result;
      } else {
        const totalMinutesBefore = (19 - this.hoursCameP) * 60 - this.minutesCameP;
        const totalMinutesAfter = (this.hoursNowP - 19) * 60 + this.minutesNowP;
        const result = totalMinutesBefore * 2.5 + totalMinutesAfter * 3;

        return result >= 480 ? 480 : result;
      }
    } else if (this.isAfterClose(this.hoursNowP, this.minutesNowP) && !this.isAfterCloseWeekday(this.hoursNowP, this.minutesNowP)) {
      const totalMinutesBefore = ((24 - this.hoursCameP) * 60 - this.minutesCameP);
      let priceBefore = totalMinutesBefore * 3;
      priceBefore = priceBefore >= 480 ? 480 : priceBefore;
      const totalMinutesAfter = (this.hoursNowP * 60 + this.minutesNowP);
      const priceAfter = totalMinutesAfter * 3;

      return priceBefore + priceAfter;
    } else if (this.isAfterCloseWeekday(this.hoursNowP, this.minutesNowP)) {
      if (this.hoursCameP >= 0 && this.hoursCameP < 3) {
        const totalMinutesBefore = (3 - this.hoursCameP) * 60 + this.minutesNowP - this.minutesCameP;
        let priceBefore = totalMinutesBefore * 3;
        priceBefore = priceBefore >= 480 ? 480 : priceBefore;
        const totalMinutesAfter = (this.hoursNowP - this.hoursCameP) * 60 + this.minutesNowP - this.minutesCameP - totalMinutesBefore;
        const priceAfter = totalMinutesAfter * 3;

        return priceBefore + priceAfter;
      } else {
        const totalMinutesBefore = (24 - this.hoursCameP) * 60 - this.minutesCameP + 3 * 60;
        let priceBefore = totalMinutesBefore * 3;
        priceBefore = priceBefore >= 480 ? 480 : priceBefore;
        const totalMinutesAfter = (this.hoursNowP - 3) * 60 + this.minutesNowP;
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

  public subtract1(minutes: string): void {
    const minutesPast = this.getMinutesFromTime(this.cameTime);
    let newCameTime: any;

    if (minutesPast >= 180) {
      newCameTime = moment(this.today).subtract(180, 'minutes');
      newCameTime = moment(newCameTime).add(minutes, 'minutes');
    } else {
      newCameTime = moment(this.cameTime).add(minutes, 'minutes');
    }

    this.cameTime = new Date(newCameTime.format());
    this.minutesPast = this.minutesPast - +minutes;
    this.price = this.getPrice(newCameTime.toDate());
  }

  public clearInput(): void {
    this.sm.nativeElement.value = '';
  }

  public subtract(minutes: string): void {
    const minutesPast = this.getMinutesFromTime(this.cameTime);
    let newCameTime: any;

    if (!this.isAfterClose(this.hoursNowP, this.minutesNowP) && !this.isAfterCloseWeekday(this.hoursNowP, this.minutesNowP)) {
      if (this.isWeekend() || this.isHoliday() || this.cameTimeP.isAfter(CROSS_TIME)) {
        const result = +minutesPast * 3;
        if (result > 480) {
          const difference = (result - 480) / 3;
          newCameTime = this.makeNewCameTime(difference);
          newCameTime = moment(newCameTime).add(minutes, 'minutes');
        }
      } else if (this.nowP.isBefore(CROSS_TIME) && !this.isWeekend() && !this.isHoliday()) {
        const result = +minutesPast * 2.5;
        console.log('result', result)
        if (result > 480) {
          console.log('NOOOO')
          this.newMinutesPast = +minutesPast - ((result - 480)/ 2.5);
          newCameTime = this.makeNewCameTime(this.newMinutesPast);
          newCameTime = moment(newCameTime).add(minutes, 'minutes');
        } else {
          console.log('!!!!!!!!')
          newCameTime = moment(this.cameTime).add(minutes, 'minutes');
        }
      } else {
        const totalMinutesBefore = (19 - this.hoursCameP) * 60 - this.minutesCameP;
        const totalMinutesAfter = (this.hoursNowP - 19) * 60 + this.minutesNowP;
        const result = totalMinutesBefore * 2.5 + totalMinutesAfter * 3;


      }
    } else if (this.isAfterClose(this.hoursNowP, this.minutesNowP) && !this.isAfterCloseWeekday(this.hoursNowP, this.minutesNowP)) {
      const totalMinutesBefore = ((24 - this.hoursCameP) * 60 - this.minutesCameP);
      let priceBefore = totalMinutesBefore * 3;
      const totalMinutesAfter = (this.hoursNowP * 60 + this.minutesNowP);
      const priceAfter = totalMinutesAfter * 3;


    } else if (this.isAfterCloseWeekday(this.hoursNowP, this.minutesNowP)) {
      if (this.hoursCameP >= 0 && this.hoursCameP < 3) {
        const totalMinutesBefore = (3 - this.hoursCameP) * 60 + this.minutesNowP - this.minutesCameP;
        let priceBefore = totalMinutesBefore * 3;

        const totalMinutesAfter = (this.hoursNowP - this.hoursCameP) * 60 + this.minutesNowP - this.minutesCameP - totalMinutesBefore;
        const priceAfter = totalMinutesAfter * 3;

      } else {
        const totalMinutesBefore = (24 - this.hoursCameP) * 60 - this.minutesCameP + 3 * 60;
        let priceBefore = totalMinutesBefore * 3;
        const totalMinutesAfter = (this.hoursNowP - 3) * 60 + this.minutesNowP;
        const priceAfter = totalMinutesAfter * 3;


      }
    }

    this.cameTime = new Date(newCameTime.format());
    this.minutesPast = this.minutesPast - +minutes;
    if (this.newMinutesPast) {
      this.newMinutesPast = this.newMinutesPast - +minutes;
    }
    this.price = this.getPrice(newCameTime.toDate());
  }

  private makeNewCameTime(substractMinutes) {
    return moment(this.today).subtract(substractMinutes, 'minutes').toDate();
  }

}
