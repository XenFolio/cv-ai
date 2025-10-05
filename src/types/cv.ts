export interface PersonalSection {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  summary?: string;
}

export interface ExperienceItem {
  position?: string;
  title?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface EducationItem {
  degree?: string;
  diploma?: string;
  institution?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface SkillsSection {
  technical?: string[];
  soft?: string[];
}

export interface CVSection {
  id: string;
  type: string;
  title: string;
  content: unknown;
  visible: boolean;
}

export interface CVData {
  id?: string;
  name?: string;
  sections: CVSection[];
  template?: string;
  createdAt?: string;
  updatedAt?: string;
}
