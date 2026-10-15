import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type { Lang, Theme, User, Application, ApplicationStatus, Notification, UserPreferences } from './types';
import { STATUS_TRANSITIONS } from './types';
import { MOCK_USERS, MOCK_APPLICATIONS, MOCK_NOTIFICATIONS } from './data';

interface AppState {
  lang: Lang;
  theme: Theme;
  currentUser: User | null;
  applications: Application[];
  notifications: Notification[];
  isAuthenticated: boolean;
  preferences: UserPreferences;
  hasSeenWelcome: boolean;
}

type Action =
  | { type: 'SET_LANG'; payload: Lang }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_STATUS'; payload: { appId: string; status: ApplicationStatus; note?: string } }
  | { type: 'ADD_APP'; payload: Application }
  | { type: 'READ_NOTIF'; payload: string }
  | { type: 'SET_PREFERENCES'; payload: UserPreferences }
  | { type: 'SET_WELCOME_SEEN' };

// Load preferences from localStorage
function loadPreferences(): UserPreferences {
  const saved = localStorage.getItem('user_preferences');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return { country: 'SA', currency: 'SAR', language: 'ar' };
}

function loadWelcomeSeen(): boolean {
  return localStorage.getItem('welcome_seen') === 'true';
}

const initialPreferences = loadPreferences();
const initialLang = initialPreferences.language || (localStorage.getItem('lang') as Lang) || 'ar';

const initialState: AppState = {
  lang: initialLang,
  theme: (localStorage.getItem('theme') as Theme) || 'light',
  currentUser: null,
  applications: MOCK_APPLICATIONS,
  notifications: MOCK_NOTIFICATIONS,
  isAuthenticated: false,
  preferences: initialPreferences,
  hasSeenWelcome: loadWelcomeSeen(),
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LANG':
      localStorage.setItem('lang', action.payload);
      document.documentElement.lang = action.payload;
      document.documentElement.dir = action.payload === 'ar' ? 'rtl' : 'ltr';
      const newPrefs = { ...state.preferences, language: action.payload };
      localStorage.setItem('user_preferences', JSON.stringify(newPrefs));
      return { ...state, lang: action.payload, preferences: newPrefs };
    case 'SET_THEME':
      localStorage.setItem('theme', action.payload);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(action.payload);
      return { ...state, theme: action.payload };
    case 'LOGIN': {
      // Load user preferences if they exist
      const userPrefs = action.payload.preferences || state.preferences;
      localStorage.setItem('user_preferences', JSON.stringify(userPrefs));
      document.documentElement.lang = userPrefs.language;
      document.documentElement.dir = userPrefs.language === 'ar' ? 'rtl' : 'ltr';
      return { 
        ...state, 
        currentUser: action.payload, 
        isAuthenticated: true,
        lang: userPrefs.language,
        preferences: userPrefs,
        hasSeenWelcome: true,
      };
    }
    case 'LOGOUT':
      return { ...state, currentUser: null, isAuthenticated: false };
    case 'UPDATE_STATUS': {
      const { appId, status, note } = action.payload;
      return {
        ...state,
        applications: state.applications.map(app => {
          if (app.id !== appId) return app;
          if (!STATUS_TRANSITIONS[app.status].includes(status)) return app;
          return {
            ...app, status, updatedAt: new Date().toISOString(),
            statusHistory: [...app.statusHistory, {
              id: `ev-${Date.now()}`, applicationId: appId, fromStatus: app.status, toStatus: status,
              actorId: state.currentUser?.id || 'system', actorRole: state.currentUser?.role || 'admin',
              note, timestamp: new Date().toISOString(),
            }],
          };
        }),
      };
    }
    case 'ADD_APP':
      return { ...state, applications: [...state.applications, action.payload] };
    case 'READ_NOTIF':
      return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };
    case 'SET_PREFERENCES':
      localStorage.setItem('user_preferences', JSON.stringify(action.payload));
      document.documentElement.lang = action.payload.language;
      document.documentElement.dir = action.payload.language === 'ar' ? 'rtl' : 'ltr';
      localStorage.setItem('lang', action.payload.language);
      // If user is logged in, update their preferences too
      if (state.currentUser) {
        return {
          ...state,
          preferences: action.payload,
          lang: action.payload.language,
          currentUser: { ...state.currentUser, preferences: action.payload },
        };
      }
      return { ...state, preferences: action.payload, lang: action.payload.language };
    case 'SET_WELCOME_SEEN':
      localStorage.setItem('welcome_seen', 'true');
      return { ...state, hasSeenWelcome: true };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  setLang: (lang: Lang) => void;
  setTheme: (theme: Theme) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateApplicationStatus: (appId: string, status: ApplicationStatus, note?: string) => void;
  addApplication: (app: Application) => void;
  markNotificationRead: (id: string) => void;
  setPreferences: (prefs: UserPreferences) => void;
  markWelcomeSeen: () => void;
  t: (ar: string, en: string) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setLang = useCallback((lang: Lang) => dispatch({ type: 'SET_LANG', payload: lang }), []);
  const setTheme = useCallback((theme: Theme) => dispatch({ type: 'SET_THEME', payload: theme }), []);

  const login = useCallback((email: string, _password: string): boolean => {
    const user = Object.values(MOCK_USERS).find(u => u.email === email);
    if (user) { 
      dispatch({ type: 'LOGIN', payload: user }); 
      return true; 
    }
    return false;
  }, []);

  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);
  const updateApplicationStatus = useCallback((appId: string, status: ApplicationStatus, note?: string) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { appId, status, note } });
  }, []);
  const addApplication = useCallback((app: Application) => dispatch({ type: 'ADD_APP', payload: app }), []);
  const markNotificationRead = useCallback((id: string) => dispatch({ type: 'READ_NOTIF', payload: id }), []);
  const setPreferences = useCallback((prefs: UserPreferences) => dispatch({ type: 'SET_PREFERENCES', payload: prefs }), []);
  const markWelcomeSeen = useCallback(() => dispatch({ type: 'SET_WELCOME_SEEN' }), []);
  const t = useCallback((ar: string, en: string) => state.lang === 'ar' ? ar : en, [state.lang]);

  return (
    <AppContext.Provider value={{ 
      state, setLang, setTheme, login, logout, 
      updateApplicationStatus, addApplication, markNotificationRead,
      setPreferences, markWelcomeSeen, t 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
