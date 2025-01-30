export type teamupEventType = {
  id: string;
  subcalenderId: number;
  all_day: boolean;
  rrule: string;
  title: string;
  timezone: string;
  startDate: string;
  endDate: string;
  custom: {
    email: string;
  };
};
