import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Lang, Theme, User, Application, ApplicationStatus, STATUS_TRANSITIONS, Notification } from './types';
import { MOCK_USERS, MOCK_APPLICATIONS, MOCK_NOTIFICATIONS } from './data';

// State shape
interface AppState {
  lang: Lang;
  theme: Theme;
  currentUser: User | null;
  applications: Application[];
  notifications: Notification[];
  isAuthenticated: boolean;
}

// Actions
type Action =
  | { type: 'SET_LANG'; payload: Lang }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_APPLICATION_STATUS'; payload: { appId: string; newStatus: ApplicationStatus; note?: string } }
  | { type: 'ADD_APPLICATION'; payload: Application }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification };

const initialState: AppState = {
  lang: (localStorage.getItem('lang') as Lang) || 'ar',
  theme: (localStorage.getItem('theme') as Theme) || 'light',
  currentUser: null,
  applications: MOCK_APPLICATIONS,
  notifications: MOCK_NOTIFICATIONS,
  isAuthenticated: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LANG':
      localStorage.setItem('lang', action.payload);
      document.documentElement.lang = action.payload;
      document.documentElement.dir = action.payload === 'ar' ? 'rtl' : 'ltr';
      return { ...state, lang: action.payload };
    case 'SET_THEME':
      localStorage.setItem('theme', action.payload);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
      return { ...state, theme: action.payload };
    case 'LOGIN':
      return { ...state, currentUser: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, currentUser: null, isAuthenticated: false };
    case 'UPDATE_APPLICATION_STATUS': {
      const { appId, newStatus, note } = action.payload;
      return {
        ...state,
        applications: state.applications.map(app => {
          if (app.id !== appId) return app;
          const validTransitions = STATUS_TRANSITIONS[app.status];
          if (!validTransitions.includes(newStatus)) return app;
          return {
            ...app,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            statusHistory: [...app.statusHistory, {
              id: `ev-${Date.now()}`,
              applicationId: appId,
              fromStatus: app.status,
              toStatus: newStatus,
              actorId: state.currentUser?.id || 'system',
              actorRole: state.currentUser?.role || 'admin',
              note,
              timestamp: new Date().toISOString(),
            }],
          };
        }),
      };
    }
    case 'ADD_APPLICATION':
      return { ...state, applications: [...state.applications, action.payload] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n),
      };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  setLang: (lang: Lang) => void;
  setTheme: (theme: Theme) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateApplicationStatus: (appId: string, newStatus: ApplicationStatus, note?: string) => void;
  addApplication: (app: Application) => void;
  markNotificationRead: (id: string) => void;
  t: (ar: string, en: string) => string;
  isRTL: boolean;
  hasRole: (roles: string[]) => boolean;
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

  const updateApplicationStatus = useCallback((appId: string, newStatus: ApplicationStatus, note?: string) => {
    dispatch({ type: 'UPDATE_APPLICATION_STATUS', payload: { appId, newStatus, note } });
  }, []);

  const addApplication = useCallback((app: Application) => {
    dispatch({ type: 'ADD_APPLICATION', payload: app });
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  }, []);

  const t = useCallback((ar: string, en: string) => state.lang === 'ar' ? ar : en, [state.lang]);
  const isRTL = state.lang === 'ar';
  const hasRole = useCallback((roles: string[]) => {
    if (!state.currentUser) return false;
    return roles.includes(state.currentUser.role);
  }, [state.currentUser]);

  return (
    <AppContext.Provider value={{
      state, setLang, setTheme, login, logout,
      updateApplicationStatus, addApplication, markNotificationRead,
      t, isRTL, hasRole,
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
