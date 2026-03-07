export type UserRole = 'member' | 'board' | 'admin' | 'alumni';
export type UserStatus = 'active' | 'left' | 'alumni';
export type ActivityStatus = 'open' | 'closed' | 'completed';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  academic_year: string;
  university_year: number;
  phone?: string;
  student_id?: string;
  department?: string;
  class_name?: string;
  birthday?: string;
  gender?: string;
  hometown?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  notes?: string;
  capacity: number | null;
  status: ActivityStatus;
  academic_year: string;
  google_form_link?: string;
  registration_deadline?: string;
  files?: string;
  image_url?: string;
  created_by: number;
  created_at: string;
  participant_count: number;
}

export interface Registration {
  id: number;
  user_id: number;
  activity_id: number;
  registered_at: string;
  attendance_status: 'pending' | 'present' | 'absent' | 'absent_with_permission' | 'absent_without_permission';
  note?: string;
  title?: string;
  date?: string;
  location?: string;
  activity_status?: ActivityStatus;
  full_name?: string;
  email?: string;
  student_id?: string;
  university_year?: number;
}

export interface AcademicYear {
  year: string;
  is_current: number;
  created_at: string;
}
