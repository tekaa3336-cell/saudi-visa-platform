import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import type { Lang, Theme, User, Application, ApplicationStatus, Notification, UserPreferences } from './types';
import { STATUS_TRANSITIONS } from './types';
import { MOCK_APPLICATIONS, MOCK_NOTIFICATIONS } from './data';
import { supabase } from './lib/supabaseClient';
import { signInWithEmail, verifyAdminOtp, signOutLocal, toAppUser, type SignInResult, type OtpResult } from './lib/auth';
import { usedEmailOtp } from './lib/session';

interface AppState {
  lang: Lang;
  theme: Theme;
  currentUser: User | null;
  applications: Application[];
  notifications: Notification[];
  isAuthenticated: boolean;
  /** false until the saved Supabase session has been checked; protected routes wait for it */
  authReady: boolean;
  preferences: UserPreferences;
  hasSeenWelcome: boolean;
}

type Action =
  | { type: 'SET_LANG'; payload: Lang }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'AUTH_READY' }
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
  authReady: false,
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
      // The auth listener re-dispatches LOGIN for the same session; keep an admin role that the server
      // confirmed (an admin who is only in the database allowlist is not recognised by toAppUser alone)
      let user = action.payload;
      if (state.currentUser?.id === user.id && state.currentUser.role === 'admin' && user.role !== 'admin') {
        user = { ...user, role: 'admin' };
      }
      // Load user preferences if they exist
      const userPrefs = user.preferences || state.preferences;
      localStorage.setItem('user_preferences', JSON.stringify(userPrefs));
      document.documentElement.lang = userPrefs.language;
      document.documentElement.dir = userPrefs.language === 'ar' ? 'rtl' : 'ltr';
      return { 
        ...state, 
        currentUser: user, 
        isAuthenticated: true,
        authReady: true,
        lang: userPrefs.language,
        preferences: userPrefs,
        hasSeenWelcome: true,
      };
    }
    case 'LOGOUT':
      return { ...state, currentUser: null, isAuthenticated: false, authReady: true };
    case 'AUTH_READY':
      return state.authReady ? state : { ...state, authReady: true };
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
  login: (email: string, password: string) => Promise<SignInResult>;
  verifyOtp: (email: string, code: string) => Promise<OtpResult>;
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

  // Keep the UI in sync with the Supabase session: restores the login after a page reload and signs the
  // user in after they click the email confirmation link (Supabase puts the session in the URL).
  useEffect(() => {
    // Safety net: never leave protected routes waiting forever if the session check hangs (e.g. offline)
    const readyTimer = setTimeout(() => dispatch({ type: 'AUTH_READY' }), 4000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT' });
        return;
      }
      if (session?.user?.email_confirmed_at && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')) {
        const appUser = toAppUser(session.user);
        // Admins only count as signed in after the emailed one-time code (step 2). A password-only session
        // (for example one left over from an earlier visit) is ignored and dropped, so it cannot open /admin.
        if (appUser.role === 'admin' && !usedEmailOtp(session.access_token)) {
          if (event === 'INITIAL_SESSION') setTimeout(() => void signOutLocal(), 0);
        } else {
          dispatch({ type: 'LOGIN', payload: appUser });
        }
      }
      if (event === 'INITIAL_SESSION') dispatch({ type: 'AUTH_READY' });
    });

    return () => {
      clearTimeout(readyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    const result = await signInWithEmail(email, password);
    // Admins get { otpRequired } here and are logged in only by verifyOtp
    if (result.ok && 'user' in result) dispatch({ type: 'LOGIN', payload: result.user });
    return result;
  }, []);

  const verifyOtp = useCallback(async (email: string, code: string): Promise<OtpResult> => {
    const result = await verifyAdminOtp(email, code);
    if (result.ok) dispatch({ type: 'LOGIN', payload: result.user });
    return result;
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    void signOutLocal();
  }, []);
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
      state, setLang, setTheme, login, verifyOtp, logout, 
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
