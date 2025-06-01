import { IconName } from '../components/icon';

export function getActivityIcon(activityType: string): IconName {
  switch (activityType) {
    case 'restaurants':
      return 'restaurant';
    case 'attractions':
      return 'sunny';
    case 'hotels':
      return 'business';
  }

  return 'help-circle-outline';
}