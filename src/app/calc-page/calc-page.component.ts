import { Component, ViewChild, ElementRef } from '@angular/core';

import * as moment from 'moment';
import { TimepickerComponent } from '../timepicker/timepicker.component';
import { FORMAT, CROSS_TIME, MAX_PRICE } from '../constants/constants';
import { IMinutesData, IPriceData, ITime } from '../models/data.interface';

@Component({
  selector: 'app-calc-page',
  templateUrl: './calc-page.component.html',
  styleUrls: ['./calc-page.component.scss']
})
export class CalcPageComponent {

  @ViewChild('tp') tp: TimepickerComponent;
  @ViewChild('deducated') dm: ElementRef;

  public arrivalTime: Date;
  public deducatedMinutes: string;
  public price: number;
  public totalPrice: number;
  public minutesPast: number;
  public minutesCounted: number;

  private today = new Date();
  // private today = new Date('Fri Jul 24 2020 22:00:00 GMT+0300');
  private Holidays = require('date-holidays');
  private hd = new this.Holidays();

  private dataM = {} as IMinutesData;
  private dataP = {} as IPriceData;

  private makeDataForMinutes(time: Date): void {
    this.dataM.currentDate = moment();
        // this.dataM.currentDate = moment(this.today);
    this.dataM.arrivalTime = moment(time);
    this.dataM.currentHours = this.dataM.currentDate.hours();
    this.dataM.currentMinutes = this.dataM.currentDate.minutes();
    this.dataM.arrivalHours = this.dataM.arrivalTime.hours();
    this.dataM.arrivalMinutes = this.dataM.arrivalTime.minutes();
    this.dataM.newTime = moment(time);
  }

  private makeDataForPrice(time: Date): void {
    this.dataP.arrivalTime = moment(time, FORMAT);
    this.dataP.currentDate = moment(this.today, FORMAT);
    this.dataP.arrivalHours = this.dataP.arrivalTime.hours();
    this.dataP.arrivalMinutes = this.dataP.arrivalTime.minutes();
    this.dataP.currentHours = this.dataP.currentDate.hours();
    this.dataP.currentMinutes = this.dataP.currentDate.minutes();
    this.dataP.minutesPast = this.getMinutesFromTime(time);
  }

  public clear(): void {
    this.arrivalTime = void 0;
    this.totalPrice = null;
    this.price = null;
    this.minutesPast = null;
    this.minutesCounted = null;
    this.deducatedMinutes = null;
    this.tp.buildForm();
  }

  private formatDayMonth(value: string): string {
    if (value.length === 1) {
      return 0 + value;
    }
    return value;
  }

  private makeCorrectDateFromTime(time: ITime): Date {
    if (time.hours.length === 2 && time.minutes.length === 2) {
      const day = this.formatDayMonth(this.today.getDate().toString());
      const month = this.formatDayMonth((this.today.getMonth() + 1).toString());
      const year = this.today.getFullYear().toString();

      return new Date(`${year}-${month}-${day}T${time.hours}:${time.minutes}:00+03:00`);
    }
  }

  public calculatePrice(time: ITime): void {
    this.minutesCounted = null;
    this.arrivalTime = this.makeCorrectDateFromTime(time);
    if (this.arrivalTime && this.arrivalTime.getTime() > this.today.getTime()) {
      console.warn('You should enter time before now');
    } else if (this.arrivalTime) {
      this.totalPrice = null;
      this.price = this.getPrice(this.arrivalTime);
      this.minutesPast = this.getMinutesFromTime(this.arrivalTime);
    }
  }

  private getMinutesFromTime(arrivalTime: Date): number {
    let pastMinutes: number;
    this.makeDataForMinutes(arrivalTime);

    if ((!this.isAfterCloseWeekday(this.dataM.currentHours, this.dataM.currentMinutes) && !this.isWeekend()) ||
       (!this.isAfterCloseWeekend(this.dataM.currentHours, this.dataM.currentMinutes) && this.isWeekend())) {
      pastMinutes =  this.dataM.currentDate.diff(this.dataM.newTime, 'minutes');
    } else if (this.isAfterCloseWeekday(this.dataM.currentHours, this.dataM.currentMinutes)) {
      const totalMinutesBefore = (24 - this.dataM.arrivalHours) * 60 - this.dataM.arrivalMinutes;
      const totalMinutesAfter = this.dataM.currentHours * 60 + this.dataM.currentMinutes;
      pastMinutes =  totalMinutesBefore + totalMinutesAfter;
    } else if (this.isAfterCloseWeekend(this.dataM.currentHours, this.dataM.currentMinutes)) {
      if (this.dataM.arrivalHours >= 0 && this.dataM.arrivalHours < 3) {
        pastMinutes = (this.dataM.currentHours - this.dataM.arrivalHours) * 60 + this.dataM.currentMinutes - this.dataM.arrivalMinutes;
      } else {
        const totalMinutesBefore = (24 - this.dataM.arrivalHours) * 60 - this.dataM.arrivalMinutes;
        const totalMinutesAfter = this.dataM.currentHours * 60 + this.dataM.currentMinutes;
        pastMinutes = totalMinutesBefore + totalMinutesAfter;
      }
    }

    return pastMinutes;
  }

  private getPrice(arrivalTime: Date): number {
    this.today = new Date();
    // this.today = new Date('Fri Jul 24 2020 22:00:00 GMT+0300');
    this.makeDataForPrice(arrivalTime);

    if (!this.isAfterCLose(this.dataP.currentHours, this.dataP.currentMinutes)) {
      if (this.isWeekend() || this.isHoliday() || this.dataP.arrivalTime.isAfter(CROSS_TIME)) {
        const result = +this.dataP.minutesPast * 3;

        return result >= MAX_PRICE ? MAX_PRICE : result;
      } else if (this.dataP.currentDate.isBefore(CROSS_TIME) && !this.isWeekend() && !this.isHoliday()) {
        const result = +this.dataP.minutesPast * 2.5;

        return result >= MAX_PRICE ? MAX_PRICE : result;
      } else {
        const totalMinutesBefore = (19 - this.dataP.arrivalHours) * 60 - this.dataP.arrivalMinutes;
        const totalMinutesAfter = (this.dataP.currentHours - 19) * 60 + this.dataP.currentMinutes;
        const result = totalMinutesBefore * 2.5 + totalMinutesAfter * 3;

        return result >= MAX_PRICE ? MAX_PRICE : result;
      }
    } else if (this.isAfterCloseWeekday(this.dataP.currentHours, this.dataP.currentMinutes) &&
              !this.isAfterCloseWeekend(this.dataP.currentHours, this.dataP.currentMinutes)) {
      const totalMinutesBefore = ((24 - this.dataP.arrivalHours) * 60 - this.dataP.arrivalMinutes);
      let priceBefore = totalMinutesBefore * 3;
      priceBefore = priceBefore >= MAX_PRICE ? MAX_PRICE : priceBefore;
      const totalMinutesAfter = (this.dataP.currentHours * 60 + this.dataP.currentMinutes);
      const priceAfter = totalMinutesAfter * 3;

      return priceBefore + priceAfter;
    } else if (this.isAfterCloseWeekend(this.dataP.currentHours, this.dataP.currentMinutes)) {
      if (this.dataP.arrivalHours >= 0 && this.dataP.arrivalHours < 3) {
        const totalMinutesBefore = (3 - this.dataP.arrivalHours) * 60 + this.dataP.currentMinutes - this.dataP.arrivalMinutes;
        let priceBefore = totalMinutesBefore * 3;
        priceBefore = priceBefore >= MAX_PRICE ? MAX_PRICE : priceBefore;
        const totalMinutesAfter = (this.dataP.currentHours - this.dataP.arrivalHours) * 60 + this.dataP.currentMinutes - this.dataP.arrivalMinutes - totalMinutesBefore;
        const priceAfter = totalMinutesAfter * 3;

        return priceBefore + priceAfter;
      } else {
        const totalMinutesBefore = (24 - this.dataP.arrivalHours) * 60 - this.dataP.arrivalMinutes + 3 * 60;
        let priceBefore = totalMinutesBefore * 3;
        priceBefore = priceBefore >= MAX_PRICE ? MAX_PRICE : priceBefore;
        const totalMinutesAfter = (this.dataP.currentHours - 3) * 60 + this.dataP.currentMinutes;
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

  private isAfterCLose(currentHours: number, currentMinutes: number) {
    return this.isAfterCloseWeekday(currentHours, currentMinutes) &&
           this.isAfterCloseWeekend(currentHours, currentMinutes);
  }

  private isAfterCloseWeekday(currentHours: number, currentMinutes: number): boolean {
    if (((currentHours === 0 && currentMinutes !== 0) ||
         (currentHours > 0 && currentHours < 6)) &&
         !this.isWeekend()) {
      return true;
    }
    return false;
  }

  private isAfterCloseWeekend(currentHours: number, currentMinutes: number): boolean {
    if (this.isWeekend() &&
       ((currentHours === 3 && currentMinutes !== 0) ||
       (currentHours > 3 && currentHours < 7 ))) {
      return true;
    }
    return false;
  }

  public multiply(times: number, price: number): void {
    this.totalPrice = times * price;
  }

  public clearInput(): void {
    this.dm.nativeElement.value = '';
  }

  public subtract(minutes: string): void {
    const minutesPast = this.getMinutesFromTime(this.arrivalTime);
    let newArrivalTime: any;

    if (!this.isAfterCloseWeekday(this.dataP.currentHours, this.dataP.currentMinutes) &&
        !this.isAfterCloseWeekend(this.dataP.currentHours, this.dataP.currentMinutes)) {
      if (this.isWeekend() || this.isHoliday() || this.dataP.arrivalTime.isAfter(CROSS_TIME)) {
        const result = +minutesPast * 3;
        if (result > MAX_PRICE) {
          this.minutesCounted = +minutesPast - ((result - MAX_PRICE) / 3);
          newArrivalTime = this.makeNewArrivalTime(this.minutesCounted);
          newArrivalTime = moment(newArrivalTime).add(minutes, 'minutes');
        } else {
          newArrivalTime = moment(this.arrivalTime).add(minutes, 'minutes');
        }
      } else if (this.dataP.currentDate.isBefore(CROSS_TIME) && !this.isWeekend() && !this.isHoliday()) {
        const result = +minutesPast * 2.5;
        if (result > MAX_PRICE) {
          this.minutesCounted = +minutesPast - ((result - MAX_PRICE) / 2.5);
          newArrivalTime = this.makeNewArrivalTime(this.minutesCounted);
          newArrivalTime = moment(newArrivalTime).add(minutes, 'minutes');
        } else {
          newArrivalTime = moment(this.arrivalTime).add(minutes, 'minutes');
        }
      } else {
        let totalMinutesBefore = (19 - this.dataP.arrivalHours) * 60 - this.dataP.arrivalMinutes;
        let totalMinutesAfter = (this.dataP.currentHours - 19) * 60 + this.dataP.currentMinutes;
        let result = totalMinutesBefore * 2.5 + totalMinutesAfter * 3;

        if (totalMinutesBefore * 2.5 > MAX_PRICE) {
          totalMinutesBefore = totalMinutesBefore - ((totalMinutesBefore * 2.5 - MAX_PRICE) / 2.5);
          this.minutesCounted = totalMinutesBefore + totalMinutesAfter;
        }
        result = totalMinutesBefore * 2.5 + totalMinutesAfter * 3;

        if (result > MAX_PRICE) {
          if (totalMinutesAfter * 3 > MAX_PRICE) {
            totalMinutesAfter = totalMinutesAfter - ((totalMinutesAfter * 3 - MAX_PRICE) / 3);
            this.minutesCounted = totalMinutesBefore + totalMinutesAfter;
          }
          result = totalMinutesBefore * 2.5 + totalMinutesAfter * 3;
        }

        if (result > MAX_PRICE) {
          for (let res = result; result >= MAX_PRICE; res--) {
            totalMinutesBefore = totalMinutesBefore - 1;
            result = totalMinutesBefore * 2.5 + totalMinutesAfter * 3;
            if (totalMinutesBefore <= 0) { break; }
          }

          if (result > MAX_PRICE) {
            for (let res = result; result >= MAX_PRICE; res--) {
              totalMinutesAfter = totalMinutesAfter - 1;
              result = totalMinutesBefore * 2.5 + totalMinutesAfter * 3;
              if (totalMinutesAfter <= 0) { break; }
            }
          }
        }

        this.minutesCounted = totalMinutesBefore + totalMinutesAfter;
        newArrivalTime = this.makeNewArrivalTime(this.minutesCounted);
        newArrivalTime = moment(newArrivalTime).add(minutes, 'minutes');
      }
    } else if (this.isAfterCloseWeekday(this.dataP.currentHours, this.dataP.currentMinutes) &&
              !this.isAfterCloseWeekend(this.dataP.currentHours, this.dataP.currentMinutes)) {
      // const totalMinutesBefore = ((24 - this.arrivalHoursP) * 60 - this.arrivalMinutesP);
      // let priceBefore = totalMinutesBefore * 3;
      // const totalMinutesAfter = (this.currentHoursP * 60 + this.currentMinutesP);
      // const priceAfter = totalMinutesAfter * 3;


    } else if (this.isAfterCloseWeekend(this.dataP.currentHours, this.dataP.currentMinutes)) {
      // if (this.arrivalHoursP >= 0 && this.arrivalHoursP < 3) {
      //   const totalMinutesBefore = (3 - this.arrivalHoursP) * 60 + this.currentMinutesP - this.arrivalMinutesP;
      //   let priceBefore = totalMinutesBefore * 3;

      //   const totalMinutesAfter = (this.currentHoursP - this.arrivalHoursP) * 60 + this.currentMinutesP - this.arrivalMinutesP - totalMinutesBefore;
      //   const priceAfter = totalMinutesAfter * 3;

      // } else {
      //   const totalMinutesBefore = (24 - this.arrivalHoursP) * 60 - this.arrivalMinutesP + 3 * 60;
      //   let priceBefore = totalMinutesBefore * 3;
      //   const totalMinutesAfter = (this.hoursNowP - 3) * 60 + this.currentMinutesP;
      //   const priceAfter = totalMinutesAfter * 3;

      // }
    }

    this.arrivalTime = new Date(newArrivalTime.format());
    this.minutesPast = this.minutesPast - +minutes;
    if (this.minutesCounted) {
      this.minutesCounted = this.minutesCounted - +minutes;
    }
    this.price = this.getPrice(newArrivalTime.toDate());
  }

  private makeNewArrivalTime(substractMinutes) {
    return moment(this.today).subtract(substractMinutes, 'minutes').toDate();
  }

  public round(number): number {
    return Math.floor(number);
  }

}
