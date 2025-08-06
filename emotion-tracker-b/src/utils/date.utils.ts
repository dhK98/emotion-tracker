// src/utils/date.utils.ts

import { getDaysInMonth, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export const getFirstAndLastDayOfMonth = (year: number, month: number) => {
    const date = new Date(year, month - 1, 1);
    const firstDay = startOfMonth(date);
    const lastDay = endOfMonth(date);
    return { firstDay, lastDay };
};

export const getFirstAndLastDayOfYear = (year: number) => {
    const date = new Date(year, 0, 1);
    const firstDay = startOfYear(date);
    const lastDay = endOfYear(date);
    return { firstDay, lastDay };
};