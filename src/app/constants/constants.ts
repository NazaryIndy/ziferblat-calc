import * as moment from 'moment';

export const FORMAT = 'HH:mm:ss';
export const CROSS_TIME = moment('19:00:00', FORMAT); // when price for 1 minute changes
export const MAX_PRICE = 590; // stop check
export const PRICE = 3; // price for 1 weekday minute
export const PRICE_WEEKEND = 3.5; // price for 1 weekend minute
