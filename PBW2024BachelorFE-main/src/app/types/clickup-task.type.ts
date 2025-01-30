export type clickupTaskType = {
  taskHours: number;
  taskMinutes: number;
  formattedDate: string;
  dateLogged: string; // it should be number, but it throws "invalid date" when creating new date
  loggedBy: string; // email of the user who logged the task / completed it
  taskTitle: string;
  email: string;
};
