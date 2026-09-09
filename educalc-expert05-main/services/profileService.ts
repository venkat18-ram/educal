import { StudentProfile, ExpertProfile, User } from '../types';

const getStudentKey = () => 'userProfile_student';
const getExpertKey = () => 'userProfile_expert';

export const getProfile = (role: 'student' | 'expert'): User | null => {
  try {
    const key = role === 'student' ? getStudentKey() : getExpertKey();
    const storedProfile = localStorage.getItem(key);
    return storedProfile ? JSON.parse(storedProfile) : null;
  } catch (error) {
    console.error(`Failed to retrieve ${role} profile from localStorage:`, error);
    return null;
  }
};

export const saveProfile = (role: 'student' | 'expert', profile: User): void => {
  try {
    const key = role === 'student' ? getStudentKey() : getExpertKey();
    localStorage.setItem(key, JSON.stringify(profile));
  } catch (error) {
    console.error(`Failed to save ${role} profile to localStorage:`, error);
  }
};

export const createDefaultStudent = (name: string): StudentProfile => {
  return {
    name,
    role: 'student',
    school: 'University of Engineering',
  };
};

export const createDefaultExpert = (name: string): ExpertProfile => {
  return {
    name,
    role: 'expert',
    expertise: 'Calculus, Linear Algebra, Physics',
    bio: 'Dedicated PhD with over 10 years of experience in tutoring and research in applied mathematics.',
  };
};