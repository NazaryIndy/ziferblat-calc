import { Component, ViewChild, ElementRef } from '@angular/core';

import * as moment from 'moment';
import { TimepickerComponent } from '../timepicker/timepicker.component';
import { FORMAT, CROSS_TIME, MAX_PRICE, PRICE, PRICE_WEEKEND } from '../constants/constants';
import { IMinutesData, IPriceData, ITime } from '../models/data.interface';

@Component({
  selector: 'app-calc-page',
  templateUrl: './calc-page.component.html',
  styleUrls: ['./calc-page.component.scss']
})
export class CalcPageComponent {

  @ViewChild('tp') tp: TimepickerComponent;
  @ViewChild('deducated') dm: ElementRef;

  public isWrongTime: boolean;

  public arrivalTime: Date;
  public deducatedMinutes: string;
  public price: number;
  public totalPrice: number;
  public minutesPast: number;
  public minutesCounted: number;

  private today = new Date();
  private Holidays = require('date-holidays');
  private hd = new this.Holidays();

  private dataM = {} as IMinutesData;
  private dataP = {} as IPriceData;

  private makeDataForMinutes(time: Date): void {
    this.dataM.currentDate = moment();
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
    this.isWrongTime = false;
    this.tp.buildForm();
  }

  private formatDayMonth(value: string): string {
    if (value.length === 1) {
      return 0 + value;
    }
    return value;
  }

  private makeCorrectDateFromTime(time: ITime, today: Date): Date {
    if (time.hours.length === 2 && time.minutes.length === 2) {
      const day = this.formatDayMonth(today.getDate().toString());
      const month = this.formatDayMonth((today.getMonth() + 1).toString());
      const year = today.getFullYear().toString();

      return new Date(`${year}-${month}-${day}T${time.hours}:${time.minutes}:00+03:00`);
    }
  }

  public calculatePrice(time: ITime): void {
    this.isWrongTime = false;
    this.minutesCounted = null;
    this.arrivalTime = this.makeCorrectDateFromTime(time, this.today);

    if (this.arrivalTime && this.today.getHours() < 6 &&
       (!this.isWeekend() || (this.isWeekend() && +time.hours > 8))) {
      const today = new Date();
      today.setDate(today.getDate() - 1);
      this.arrivalTime = this.makeCorrectDateFromTime(time, today);
    } else if (this.arrivalTime && this.today.getHours() < 6 && this.isWeekend() && +time.hours < 4) {
      // TODO
    }
    if (this.arrivalTime && this.arrivalTime.getTime() > this.today.getTime() &&
        this.arrivalTime.getDay() === this.today.getDay() ) {
      this.isWrongTime = true;
      console.warn('You should enter time before now');
    } else if (this.arrivalTime) {
      this.totalPrice = null;
      this.price = this.getPrice(this.arrivalTime);
      this.minutesPast = this.getMinutesFromTime(this.arrivalTime);
    }
  }

  private getMinutesFromTime(arrivalTime: Date): number {
    this.makeDataForMinutes(arrivalTime);

    if ((!this.isAfterClose(this.dataM.currentHours, this.dataM.currentMinutes))) {
      return this.dataM.currentDate.diff(this.dataM.newTime, 'minutes');
    } else if (this.isAfterClose(this.dataM.currentHours, this.dataM.currentMinutes)) {
      return this.minutesBeforeTime(this.dataM.arrivalHours, this.dataM.arrivalMinutes, 24) +
             this.minutesAfterTime(this.dataM.currentHours, this.dataM.currentMinutes);
    }
  }

  private getPrice(arrivalTime: Date): number {
    this.today = new Date();
    this.makeDataForPrice(arrivalTime);

    if (!this.isAfterClose(this.dataP.currentHours, this.dataP.currentMinutes)) {
      if (this.isWeekend() || this.isHoliday() || this.dataP.arrivalTime.isAfter(CROSS_TIME)) {
        const result = +this.dataP.minutesPast * PRICE_WEEKEND;

        return result >= MAX_PRICE ? MAX_PRICE : result;
      } else if (this.dataP.currentDate.isBefore(CROSS_TIME) && !this.isWeekend() && !this.isHoliday()) {
        const result = +this.dataP.minutesPast * PRICE;

        return result >= MAX_PRICE ? MAX_PRICE : result;
      } else {
        const result = this.minutesBeforeTime(this.dataP.arrivalHours, this.dataP.arrivalMinutes, 19) * PRICE +
                       this.minutesAfterTime(this.dataP.currentHours, this.dataP.currentMinutes, 19) * PRICE_WEEKEND;

        return result >= MAX_PRICE ? MAX_PRICE : result;
      }
    } else if (this.isAfterClose(this.dataP.currentHours, this.dataP.currentMinutes)) {
      let priceBefore = this.minutesBeforeTime(this.dataP.arrivalHours, this.dataP.arrivalMinutes, 24) * PRICE_WEEKEND;
      priceBefore = priceBefore >= MAX_PRICE ? MAX_PRICE : priceBefore;
      const priceAfter = this.minutesAfterTime(this.dataP.currentHours, this.dataP.currentMinutes) * PRICE_WEEKEND;

      return priceBefore + priceAfter;
    }
  }

  public subtract(minutes: string): void {
    const minutesPast = this.getMinutesFromTime(this.arrivalTime);
    let newArrivalTime: any;

    if (!this.isAfterClose(this.dataP.currentHours, this.dataP.currentMinutes)) {
      if (this.isWeekend() || this.isHoliday() || this.dataP.arrivalTime.isAfter(CROSS_TIME)) {
        const result = +minutesPast * PRICE_WEEKEND;
        if (result > MAX_PRICE) {
          this.minutesCounted = +minutesPast - ((result - MAX_PRICE) / PRICE_WEEKEND);
          newArrivalTime = this.makeNewArrivalTime(this.minutesCounted);
          newArrivalTime = moment(newArrivalTime).add(minutes, 'minutes');
        } else {
          newArrivalTime = moment(this.arrivalTime).add(minutes, 'minutes');
        }
      } else if (this.dataP.currentDate.isBefore(CROSS_TIME) && !this.isWeekend() && !this.isHoliday()) {
        const result = +minutesPast * PRICE;
        if (result > MAX_PRICE) {
          this.minutesCounted = +minutesPast - ((result - MAX_PRICE) / PRICE);
          newArrivalTime = this.makeNewArrivalTime(this.minutesCounted);
          newArrivalTime = moment(newArrivalTime).add(minutes, 'minutes');
        } else {
          newArrivalTime = moment(this.arrivalTime).add(minutes, 'minutes');
        }
      } else {
        let totalMinutesBefore = this.minutesBeforeTime(this.dataP.arrivalHours, this.dataP.arrivalHours, 19);
        let totalMinutesAfter = this.minutesAfterTime(this.dataP.currentHours, this.dataP.currentMinutes, 19);
        let result = totalMinutesBefore * PRICE + totalMinutesAfter * PRICE_WEEKEND;

        if (totalMinutesBefore * PRICE > MAX_PRICE) {
          totalMinutesBefore = totalMinutesBefore - ((totalMinutesBefore * PRICE - MAX_PRICE) / PRICE);
          this.minutesCounted = totalMinutesBefore + totalMinutesAfter;
        }
        result = totalMinutesBefore * PRICE + totalMinutesAfter * PRICE_WEEKEND;

        if (result > MAX_PRICE) {
          if (totalMinutesAfter * PRICE_WEEKEND > MAX_PRICE) {
            totalMinutesAfter = totalMinutesAfter - ((totalMinutesAfter * PRICE_WEEKEND - MAX_PRICE) / PRICE_WEEKEND);
            this.minutesCounted = totalMinutesBefore + totalMinutesAfter;
          }
          result = totalMinutesBefore * PRICE + totalMinutesAfter * PRICE_WEEKEND;
        }

        if (result > MAX_PRICE) {
          for (let res = result; result >= MAX_PRICE; res--) {
            totalMinutesBefore -= 1;
            result = totalMinutesBefore * PRICE + totalMinutesAfter * PRICE_WEEKEND;
            if (totalMinutesBefore <= 0) { break; }
          }

          if (result > MAX_PRICE) {
            for (let res = result; result >= MAX_PRICE; res--) {
              totalMinutesAfter -=  1;
              result = totalMinutesBefore * PRICE + totalMinutesAfter * PRICE_WEEKEND;
              if (totalMinutesAfter <= 0) { break; }
            }
          }
        }

        this.minutesCounted = totalMinutesBefore + totalMinutesAfter;
        newArrivalTime = this.makeNewArrivalTime(this.minutesCounted);
        newArrivalTime = moment(newArrivalTime).add(minutes, 'minutes');
      }
    } else if (this.isAfterClose(this.dataP.currentHours, this.dataP.currentMinutes)) {
      // TODO
    }

    this.arrivalTime = new Date(newArrivalTime.format());
    this.minutesPast = this.minutesPast - +minutes;
    if (this.minutesCounted) {
      this.minutesCounted = this.minutesCounted - +minutes;
    }
    this.price = this.getPrice(newArrivalTime.toDate());
  }

  private minutesBeforeTime(arrivalHours: number, arrivalMinutes: number, crossHour: number): number {
    return (crossHour - arrivalHours) * 60 - arrivalMinutes;
  }

  private minutesAfterTime(currentHours: number, currentMinutes: number, crossHour?: number): number {
    if (crossHour) {
      return (currentHours - crossHour) * 60 + currentMinutes;
    }
    return currentHours * 60 + currentMinutes;
  }

  private isWeekend(): boolean {
    const weekday = moment(this.today).format('dddd');
    return weekday === 'Sunday' || weekday === 'Saturday';
  }

  private isHoliday(): boolean {
    return this.hd.isHoliday(this.today);
  }

  private isAfterClose(currentHours: number, currentMinutes: number): boolean {
    if (((currentHours === 0 && currentMinutes !== 0) ||
         (currentHours > 0 && currentHours < 7))) {
      return true;
    }
    return false;
  }

  private makeNewArrivalTime(substractMinutes) {
    return moment(this.today).subtract(substractMinutes, 'minutes').toDate();
  }

  public round(value: number): number {
    if (value < 0) { return 0; }
    return Math.floor(value);
  }

  public multiply(times: number, price: number): void {
    this.totalPrice = times * price;
  }

  public clearInput(): void {
    this.dm.nativeElement.value = '';
  }

}
