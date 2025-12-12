import { GoogleSheetsService } from './google-sheets';

export interface SBAConfig {
  campus: string;
  totalAttendance: string;
  closingTerm: string;
  nextTermBegins: string;
  semesterTerm: string;
  position: string;
  includePosition: boolean;
}

function parseBool(value: string): boolean {
  const v = value.trim().toLowerCase();
  return v === 'true' || v === 'yes' || v === 'y' || v === '1';
}

export async function getSBAConfig(): Promise<SBAConfig> {
  try {
    const sheets = new GoogleSheetsService();
    const result = await sheets.getSheetData('SBA Config', 'A1:A20', 'UNFORMATTED_VALUE');

    const rows: string[] = (result.data || []).map((r: any[]) => String(r[0] || ''));

    const getValue = (label: string) => {
      const row = rows.find((x) => x.toLowerCase().includes(label));
      if (!row) return '';
      const parts = row.split(':');
      if (parts.length > 1) return parts.slice(1).join(':').trim();
      const match = row.match(/\b([A-Za-z]+)\s*[:\-]?\s*(.*)$/);
      return match ? match[2].trim() : row.trim();
    };

    const campus = getValue('campus');
    const totalAttendance = getValue('attendance');
    const closingTerm = getValue('closing term');
    const nextTermBegins = getValue('next term begins');
    const semesterTerm = getValue('semester') || getValue('term');
    const position = getValue('position');
    const includePositionRaw = getValue('include position') || getValue('to include position');

    return {
      campus: campus || 'Radiant',
      totalAttendance: totalAttendance || '0',
      closingTerm: closingTerm || '',
      nextTermBegins: nextTermBegins || '',
      semesterTerm: semesterTerm || '',
      position: position || '',
      includePosition: parseBool(includePositionRaw || 'false'),
    };
  } catch (e) {
    return {
      campus: 'Radiant',
      totalAttendance: '0',
      closingTerm: '',
      nextTermBegins: '',
      semesterTerm: '',
      position: '',
      includePosition: false,
    };
  }
}

