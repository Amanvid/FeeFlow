import { NextRequest, NextResponse } from 'next/server';
import { getAllStudents, getTeacherUsers, getNonTeacherUsers, getSchoolConfig } from '@/lib/data';
import { sendSms } from '@/lib/actions';

function normalizeGhanaPhone(input: string): string | null {
  let p = (input || '').trim().replace(/[\s\-\(\)\.]/g, '');
  if (!p) return null;
  if (p.startsWith('+')) p = p.substring(1);
  if (p.startsWith('0') && p.length === 10) return '233' + p.substring(1);
  if (p.startsWith('233') && p.length === 12) return p;
  if (p.length === 10 && /^[0-9]{10}$/.test(p)) return '233' + p;
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message: string = String(body.message || '').trim();
    const groups: string[] = Array.isArray(body.groups) ? body.groups : [];
    const customNumbers: string[] = Array.isArray(body.customNumbers) ? body.customNumbers : [];
    const classes: string[] = Array.isArray(body.classes) ? body.classes : [];
    const departments: string[] = Array.isArray(body.departments) ? body.departments : [];
    const messagesByGroup: Record<string, string> = body.messagesByGroup || {};

    if (!message && !Object.values(messagesByGroup).some(m => (m || '').trim().length > 0)) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const config = await getSchoolConfig();
    if (!config.notifications?.smsEnabled) {
      return NextResponse.json({ success: false, error: 'SMS notifications are disabled' }, { status: 400 });
    }

    const destinations: { destination: string; message: string; msgid: string }[] = [];

    if (groups.includes('parents') || groups.includes('students')) {
      const students = await getAllStudents();
      students
        .filter(s => classes.length === 0 || classes.includes(s.class))
        .forEach(s => {
          const normalized = normalizeGhanaPhone(s.guardianPhone);
          if (normalized) {
          const msg = (messagesByGroup['parents'] || messagesByGroup['students'] || message);
          destinations.push({ destination: normalized, message: msg, msgid: `bulk-${s.id}` });
          }
      });
    }

    if (groups.includes('teachers') || groups.includes('staff')) {
      const teachers = await getTeacherUsers();
      teachers
        .filter(t => classes.length === 0 || classes.includes(t.class))
        .forEach(t => {
          const normalized = normalizeGhanaPhone(String(t.phone || t.contact || ''));
          if (normalized) {
          const msg = (messagesByGroup['teachers'] || message);
          destinations.push({ destination: normalized, message: msg, msgid: `bulk-teacher-${t.id}` });
          }
      });
      const nonTeachers = await getNonTeacherUsers();
      nonTeachers
        .filter(t => departments.length === 0 || departments.includes(t.department))
        .forEach(t => {
          const normalized = normalizeGhanaPhone(String(t.phone || t.contact || ''));
          if (normalized) {
          const msg = (messagesByGroup['staff'] || message);
          destinations.push({ destination: normalized, message: msg, msgid: `bulk-staff-${t.id}` });
          }
      });
    }

    if (groups.includes('custom') && customNumbers.length > 0) {
      customNumbers.forEach((raw, idx) => {
        const normalized = normalizeGhanaPhone(String(raw));
        if (normalized) {
          const msg = (messagesByGroup['custom'] || message);
          destinations.push({ destination: normalized, message: msg, msgid: `bulk-custom-${idx}` });
        }
      });
    }

    const unique = new Map<string, { destination: string; message: string; msgid: string }>();
    destinations.forEach(d => {
      if (!unique.has(d.destination)) unique.set(d.destination, d);
    });
    const finalList = Array.from(unique.values());

    if (finalList.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid recipients found' }, { status: 400 });
    }

    const result = await sendSms(finalList, config.senderId);
    if (result.success) {
      return NextResponse.json({ success: true, sent: finalList.length });
    }
    return NextResponse.json({ success: false, error: result.error || 'Failed to send SMS' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
