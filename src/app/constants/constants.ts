import * as moment from 'moment';

export const FORMAT = 'HH:mm:ss';
export const CROSS_TIME = moment('19:00:00', FORMAT); // when price for 1 minute changes
export const MAX_PRICE = 480; // stop check
export const PRICE = 2.5; // price for 1 weekday minute
export const PRICE_WEEKEND = 3; // price for 1 weekend minute
