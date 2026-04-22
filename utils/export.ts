import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

type ExportActivity = {
  name: string;
  date: string;
  durationMinutes: number;
  count: number;
  notes: string | null;
  category: string;
};

export async function exportActivitiesToCSV(
  tripName: string,
  activities: ExportActivity[]
): Promise<void> {
  const header = 'Name,Date,Duration (min),Count,Category,Notes\n';
  const rows = activities
    .map(a =>
      [
        `"${a.name}"`,
        a.date,
        a.durationMinutes,
        a.count,
        `"${a.category}"`,
        `"${a.notes ?? ''}"`,
      ].join(',')
    )
    .join('\n');

  const csv = header + rows;
  const fileName = `${tripName.replace(/\s+/g, '_')}_activities.csv`;
  const path = FileSystem.documentDirectory + fileName;

  await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: `Export ${tripName}` });
  }
}
