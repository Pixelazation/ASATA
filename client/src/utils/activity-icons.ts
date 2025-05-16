import { IconName } from '../components/icon';

export function getActivityIcon(activityType: string): IconName {
  switch (activityType) {
    case 'food':
      return 'restaurant';
    case 'leisure':
      return 'sunny';
    case 'accomodation':
      return 'business';
  }

  return 'help-circle-outline';
}