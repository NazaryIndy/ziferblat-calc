import * as moment from 'moment';

interface IData {
  arrivalTime: moment.Moment;
  currentHours: number;
  currentMinutes: number;
  arrivalHours: number;
  arrivalMinutes: number;
  currentDate: moment.Moment;
}

export interface IMinutesData extends IData {
  newTime: moment.Moment;
}

export interface IPriceData extends IData {
  minutesPast: number;
}

export interface ITime {
  hours: string,
  minutes: string;
}
