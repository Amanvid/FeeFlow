export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string; // Should be hashed, but for sheets we might just store hash
  role: 'Pastor' | 'Department Head' | 'Treasurer' | 'Member' | 'Volunteer' | 'Admin';
  status: 'Active' | 'Inactive';
  created_at: string;
}

export interface Member {
  id: string;
  user_id: string;
  membership_status: 'Member' | 'Visitor' | 'Regular Attender';
  date_joined: string;
  department_id?: string;
  baptism_status: 'Baptized' | 'Not Baptized';
}

export interface NewConvert {
  id: string;
  member_id: string;
  date_converted: string;
  follow_up_status: 'Pending' | 'In Progress' | 'Completed';
  assigned_leader?: string;
}

export interface Department {
  id: string;
  name: string;
  leader_id?: string;
  description?: string;
}

export interface Event {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  department_id?: string;
  event_type: 'Service' | 'Program' | 'Conference' | 'Meeting';
}

export interface FinancialRecord {
  id: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  recorded_by: string;
  date: string;
  description?: string;
}

export interface Donation {
  id: string;
  member_id?: string;
  amount: number;
  method: 'Cash' | 'MoMo' | 'Bank';
  purpose: 'Tithe' | 'Offering' | 'Pledge' | 'Donation';
  date: string;
}

export interface Project {
  id: string;
  name: string;
  budget: number;
  status: 'Planned' | 'In Progress' | 'Completed';
  start_date: string;
  end_date?: string;
}
