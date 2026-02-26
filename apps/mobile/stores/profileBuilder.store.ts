import { create } from 'zustand';
import api from '../services/api';
import type {
  School,
  Language,
  SchnupperlehreEntry,
  Zeugnis,
  LanguageProficiency,
} from '../types/profile.types';

interface ProfileBuilderState {
  currentStep: number;

  // Step 1: Personal info
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  canton: string;
  city: string;
  homeAddress: string;
  school: string;
  nationality: string;

  // Step 2: Video
  videoUri: string | null;

  // Step 3: Motivation letter
  motivationLetter: string;

  // Step 4: Education
  schools: School[];

  // Step 5: Schnupperlehre
  schnupperlehren: SchnupperlehreEntry[];

  // Step 6: Languages & Skills
  languages: Language[];
  skills: string[];
  hobbies: string[];

  // Step 7: Documents
  documents: Zeugnis[];

  // Loading state
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateField: <K extends keyof ProfileBuilderState>(field: K, value: ProfileBuilderState[K]) => void;

  // Step 4: Schools
  addSchool: () => void;
  removeSchool: (index: number) => void;
  updateSchool: (index: number, field: keyof School, value: string | number | boolean) => void;

  // Step 5: Schnupperlehre
  addSchnupperlehre: () => void;
  removeSchnupperlehre: (index: number) => void;
  updateSchnupperlehre: (index: number, field: keyof SchnupperlehreEntry, value: string) => void;

  // Step 6: Languages
  addLanguage: () => void;
  removeLanguage: (index: number) => void;
  updateLanguage: (index: number, field: keyof Language, value: string) => void;

  // Step 6: Skills & Hobbies
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  addHobby: (hobby: string) => void;
  removeHobby: (hobby: string) => void;

  // Step 7: Documents
  addDocument: (doc: Zeugnis) => void;
  removeDocument: (index: number) => void;

  // Persistence
  saveProfile: () => Promise<void>;
  loadExisting: () => Promise<void>;
  getCompletionPercentage: () => number;
  reset: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

const initialState = {
  currentStep: 0,
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  canton: '',
  city: '',
  homeAddress: '',
  school: '',
  nationality: '',
  videoUri: null as string | null,
  motivationLetter: '',
  schools: [] as School[],
  schnupperlehren: [] as SchnupperlehreEntry[],
  languages: [] as Language[],
  skills: [] as string[],
  hobbies: [] as string[],
  documents: [] as Zeugnis[],
  isSaving: false,
  isLoading: false,
  error: null as string | null,
};

export const useProfileBuilderStore = create<ProfileBuilderState>((set, get) => ({
  ...initialState,

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < 6) {
      set({ currentStep: currentStep + 1 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  goToStep: (step: number) => {
    if (step >= 0 && step <= 6) {
      set({ currentStep: step });
    }
  },

  updateField: (field, value) => {
    set({ [field]: value } as Partial<ProfileBuilderState>);
  },

  // Schools
  addSchool: () => {
    const { schools } = get();
    const newSchool: School = {
      id: generateId(),
      name: '',
      level: 'Sekundarschule',
      startYear: new Date().getFullYear(),
      isCurrent: false,
    };
    set({ schools: [...schools, newSchool] });
  },

  removeSchool: (index: number) => {
    const { schools } = get();
    set({ schools: schools.filter((_, i) => i !== index) });
  },

  updateSchool: (index: number, field: keyof School, value: string | number | boolean) => {
    const { schools } = get();
    const updated = schools.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    set({ schools: updated });
  },

  // Schnupperlehre
  addSchnupperlehre: () => {
    const { schnupperlehren } = get();
    const newEntry: SchnupperlehreEntry = {
      id: generateId(),
      companyName: '',
      beruf: '',
      canton: '',
      date: '',
      notes: '',
    };
    set({ schnupperlehren: [...schnupperlehren, newEntry] });
  },

  removeSchnupperlehre: (index: number) => {
    const { schnupperlehren } = get();
    set({ schnupperlehren: schnupperlehren.filter((_, i) => i !== index) });
  },

  updateSchnupperlehre: (index: number, field: keyof SchnupperlehreEntry, value: string) => {
    const { schnupperlehren } = get();
    const updated = schnupperlehren.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    );
    set({ schnupperlehren: updated });
  },

  // Languages
  addLanguage: () => {
    const { languages } = get();
    const newLang: Language = {
      id: generateId(),
      name: '',
      proficiency: 'a1' as LanguageProficiency,
    };
    set({ languages: [...languages, newLang] });
  },

  removeLanguage: (index: number) => {
    const { languages } = get();
    set({ languages: languages.filter((_, i) => i !== index) });
  },

  updateLanguage: (index: number, field: keyof Language, value: string) => {
    const { languages } = get();
    const updated = languages.map((l, i) =>
      i === index ? { ...l, [field]: value } : l
    );
    set({ languages: updated });
  },

  // Skills
  addSkill: (skill: string) => {
    const { skills } = get();
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      set({ skills: [...skills, trimmed] });
    }
  },

  removeSkill: (skill: string) => {
    const { skills } = get();
    set({ skills: skills.filter((s) => s !== skill) });
  },

  // Hobbies
  addHobby: (hobby: string) => {
    const { hobbies } = get();
    const trimmed = hobby.trim();
    if (trimmed && !hobbies.includes(trimmed)) {
      set({ hobbies: [...hobbies, trimmed] });
    }
  },

  removeHobby: (hobby: string) => {
    const { hobbies } = get();
    set({ hobbies: hobbies.filter((h) => h !== hobby) });
  },

  // Documents
  addDocument: (doc: Zeugnis) => {
    const { documents } = get();
    set({ documents: [...documents, doc] });
  },

  removeDocument: (index: number) => {
    const { documents } = get();
    set({ documents: documents.filter((_, i) => i !== index) });
  },

  // Persistence
  saveProfile: async () => {
    const state = get();
    set({ isSaving: true, error: null });
    try {
      const payload = {
        firstName: state.firstName,
        lastName: state.lastName,
        dateOfBirth: state.dateOfBirth,
        canton: state.canton,
        city: state.city,
        school: state.school,
        nationality: state.nationality,
        videoUri: state.videoUri,
        motivationLetter: state.motivationLetter,
        schools: state.schools,
        schnupperlehren: state.schnupperlehren,
        languages: state.languages,
        skills: state.skills,
        hobbies: state.hobbies,
        documents: state.documents,
      };
      await api.put('/students/me', payload);
      set({ isSaving: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Profil konnte nicht gespeichert werden';
      set({ isSaving: false, error: message });
      throw new Error(message);
    }
  },

  loadExisting: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/students/me');
      const data = response.data;
      set({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        dateOfBirth: data.dateOfBirth || '',
        canton: data.canton || '',
        city: data.city || '',
        school: data.school || '',
        nationality: data.nationality || '',
        videoUri: data.videoUri || null,
        motivationLetter: data.motivationLetter || '',
        schools: data.schools || [],
        schnupperlehren: data.schnupperlehren || [],
        languages: data.languages || [],
        skills: data.skills || [],
        hobbies: data.hobbies || [],
        documents: data.documents || [],
        isLoading: false,
      });
    } catch (error: any) {
      // If 404, profile doesn't exist yet — that's fine
      if (error.response?.status !== 404) {
        set({ error: error.response?.data?.message || 'Profil konnte nicht geladen werden' });
      }
      set({ isLoading: false });
    }
  },

  getCompletionPercentage: () => {
    const state = get();
    let completed = 0;
    const total = 7;

    // Step 1: Personal info — at least firstName, lastName, canton filled
    if (state.firstName && state.lastName && state.canton) completed++;

    // Step 2: Video
    if (state.videoUri) completed++;

    // Step 3: Motivation letter (at least 50 chars)
    if (state.motivationLetter.length >= 50) completed++;

    // Step 4: At least one school
    if (state.schools.length > 0 && state.schools.some((s) => s.name)) completed++;

    // Step 5: At least one Schnupperlehre
    if (state.schnupperlehren.length > 0 && state.schnupperlehren.some((s) => s.companyName)) completed++;

    // Step 6: At least one language
    if (state.languages.length > 0 && state.languages.some((l) => l.name)) completed++;

    // Step 7: At least one document
    if (state.documents.length > 0) completed++;

    return Math.round((completed / total) * 100);
  },

  reset: () => {
    set(initialState);
  },
}));
