"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
  useReducer,
  useMemo,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import EstateLoading from "@/components/loading";
import { Subscription, User, LoginInput, RegisterInput, UserStatus } from "@/types";
import authApi from "@/services/auth.api";


interface AuthState{
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  user: User | null;
  error: string | null;
}

type AuthAction =
  | { type: "INITIALIZE"; payload: AuthState }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_SESSION"; payload: Partial<AuthState> }
  | { type: "SIGN_OUT" };

interface AuthContextType extends AuthState {
  signIn: (input: LoginInput) => Promise<{ user: User | null; error?: { code: string; message: string } }>;
  signUp: (input: RegisterInput) => Promise<{user: User, subscription: Subscription}>;
  signOut: () => Promise<void>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  user: null,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "INITIALIZE":
      return { ...action.payload, isInitialized: true, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "UPDATE_SESSION":
      return { ...state, ...action.payload };
    case "SIGN_OUT":
      return { ...initialState, isInitialized: true, isLoading: false };
    default:
      return state;
  }
};


// --------------------
// Context & Provider
// --------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname?.startsWith("/auth/");
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        const sessionResponse = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
        });

        if (sessionResponse.redirected) {
          dispatch({ type: "SET_ERROR", payload: "Failed to fetch session" });
          dispatch({ type: "SET_LOADING", payload: false });
          if(isAuthPage) return;
          router.push(sessionResponse.url);
          return;
        }

        const session = await sessionResponse.json();

        if (session?.isSignedIn && sessionResponse.ok) {
          let userData = session.user;
          
          if (!userData) {
            console.log("Fetching user data from API");
            try {
              userData = (await authApi.getMe()).data;
            } catch (error: any) {
              console.error("Failed to fetch user data:", error);
              dispatch({
                type: "SET_ERROR",
                payload: "Failed to fetch user data"
              });
              return;
            }
          }

          if (userData) {
            console.log("User data:", userData);
            dispatch({
              type: "INITIALIZE",
              payload: {
                ...initialState,
                isAuthenticated: true,
                user: {
                  ...userData,
                },
                error: null,
                isLoading: false,
              },
            });

            if (isAuthPage){
              switch(userData.status){
                case UserStatus.TRIAL_ENDED: 
                  router.push("/trial-ended");
                  break;
                case UserStatus.SUSPENDED:
                  router.push('/suspended');
                  break;
                case UserStatus.DELETED:
                  router.push('/deleted');
                  break;
                case UserStatus.INACTIVE:
                  router.push('/inactive');
                  break;
                case UserStatus.ACTIVE:
                  router.push("/dashboard");
                  break;
                default:
                  router.push("/account/status");
                  break;
              }
            }
            return;
          }
        }

        // No valid session, initialize with default state and set loading to false
        dispatch({ type: "SET_LOADING", payload: false });

        if (!isAuthPage){
          toast.error('Session expired. Please sign in again.', { duration: 5000 });
          router.push('/auth/sign-in?redirectUrl=' + encodeURIComponent(window.location.pathname));
        }
      } catch (error: any) {
        console.error("Auth initialization error:", error);
        dispatch({
          type: "INITIALIZE",
          payload: { ...initialState, isLoading: false, error: error.message },
        });
        if (!isAuthPage) router.push("/auth/sign-in");
      }
    };

    if (!state.isInitialized && mounted) {
      initAuth();
    }
  }, [router, isAuthPage, state.isInitialized, mounted]);

  const signIn = useCallback(
    async (input: LoginInput): Promise<{ user: User | null; error?: { code: string; message: string } }> => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        // Check for rate limiting in localStorage
        const loginAttempts = JSON.parse(localStorage.getItem('loginAttempts') || '{"count": 0, "timestamp": 0}');
        const now = Date.now();
        const timeWindow = 15 * 60 * 1000; // 15 minutes
        
        // Reset attempts if time window has passed
        if (now - loginAttempts.timestamp > timeWindow) {
          loginAttempts.count = 0;
          loginAttempts.timestamp = now;
        }
        
        // Check if max attempts reached
        if (loginAttempts.count >= 4) {
          const remainingTime = Math.ceil((loginAttempts.timestamp + timeWindow - now) / 60000);
          dispatch({ type: "SET_LOADING", payload: false });
          return { 
            user: null, 
            error: { 
              code: 'RATE_LIMITED', 
              message: `Too many login attempts. Please try again in ${remainingTime} minutes.` 
            } 
          };
        }

        const { data } = await authApi.login(input);

        if (data) {
          // Reset login attempts on successful login
          localStorage.setItem('loginAttempts', JSON.stringify({ count: 0, timestamp: now }));
          
          // Store the login identifier type for future reference
          const identifierType = input.email ? 'email' : 'phone';
          localStorage.setItem('lastLoginIdentifierType', identifierType);
          
          dispatch({
            type: "UPDATE_SESSION",
            payload: {
              isAuthenticated: true,
              isLoading: false,
              user: data,
              error: null,
            },
          });
          return { user: data, error: undefined };
        }
        throw new Error("Sign in failed");
      } catch (error: any) {
        // Increment login attempts on failure
        const loginAttempts = JSON.parse(localStorage.getItem('loginAttempts') || '{"count": 0, "timestamp": 0}');
        const now = Date.now();
        
        // Reset if time window has passed
        if (now - loginAttempts.timestamp > 15 * 60 * 1000) {
          loginAttempts.count = 1;
          loginAttempts.timestamp = now;
        } else {
          loginAttempts.count += 1;
        }
        
        localStorage.setItem('loginAttempts', JSON.stringify(loginAttempts));
        
        // Handle specific error codes from GraphQL
        const graphQLError = error.graphQLErrors?.[0];
        const errorCode = graphQLError?.extensions?.code;
        const errorMessage = graphQLError?.message || error.message;
        
        dispatch({ type: "SET_LOADING", payload: false });
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        
        // Return structured error for the component to handle
        return { 
          user: null, 
          error: { 
            code: errorCode || 'UNKNOWN_ERROR', 
            message: errorMessage 
          } 
        };
      }
    },
    [authApi]
  );

  const signOut = useCallback(async () => {

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await authApi.signOut();
      dispatch({ type: "SIGN_OUT" });
      router.push("/auth/sign-in");
    } catch (error: any) {
      toast.error("Failed to sign out. Please try again.");
      console.error("Logout error:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to sign out" });
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [authApi, router]);

  const signUp = useCallback(async (input: RegisterInput): Promise<{ user: User, subscription: Subscription}> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const { data } = await authApi.signUp(input);
      return data;
    } catch (error: any) {
      toast.error(error.message);
      console.error("Sign up error:", error);
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [authApi]);

  const value = useMemo(
    () => ({
      ...state,
      signIn,
      signUp,
      signOut,
    }),
    [state, signIn, signUp, signOut]
  );

  if (!mounted) {
    return null;
  }

  if (!state.isInitialized && !isAuthPage) {
    return <EstateLoading />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}