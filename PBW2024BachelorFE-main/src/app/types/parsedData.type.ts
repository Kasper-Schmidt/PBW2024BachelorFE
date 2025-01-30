import { clickupTaskType } from './clickup-task.type';
import { teamupEventType } from './teamup-events.type';

export type ParsedData = {
  userEmail: '';
  userEvents: teamupEventType[];
  userTasks: clickupTaskType[];
};
