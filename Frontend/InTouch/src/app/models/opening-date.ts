export interface OpeningDate {
    id?: number
    idDay: number
    day: string
    openHour: string
    closeHour: string
    breakStart: string
    breakEnd: string
    isOpen: boolean
    company: number
}

export interface dataOpeningDate {
  lstDays: number[];
  OpeningDays: Map<string, string>;
}

export enum OpeningDayEnum {
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  PAUSE_START = 'pauseStart',
  PAUSE_END = 'pauseEnd'
}

export interface Day {
  id: number,
  name: string
}

export const DAYS: Day[] = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
  { id: 7, name: 'Sunday' }
]