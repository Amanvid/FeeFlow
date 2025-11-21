import { redirect } from 'next/navigation';

export default function TeacherHomePage() {
  // Redirect to classes page as the main teacher dashboard
  redirect('/teacher/classes');
}