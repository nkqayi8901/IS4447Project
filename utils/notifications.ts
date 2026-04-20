import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Trip Planner',
      body: "Don't forget to log today's activities!",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function sendTargetProgressNotification(
  targetName: string,
  percent: number
): Promise<void> {
  if (percent >= 80 && percent < 100) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Almost there!',
        body: `You're ${Math.round(percent)}% toward your "${targetName}" goal!`,
      },
      trigger: null,
    });
  } else if (percent >= 100) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Goal achieved!',
        body: `You've hit your "${targetName}" target!`,
      },
      trigger: null,
    });
  }
}
