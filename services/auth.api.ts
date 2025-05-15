import { LoginInput, RegisterInput, Subscription, User, } from "@/types";
import { api } from "@/lib/axios";

const authApi = {
    
    login: async (credentials: LoginInput) => {
      return api.post<User>('/auth/sign-in', credentials);
    },
  
    signUp: async (data: RegisterInput) => {
      return api.post<{user: User, subscription: Subscription}>('/auth/sign-up', data);
    },
  
    signOut: async () => {
      return api.post('/auth/sign-out');
    },
  
    getMe: async () => {
      return api.get<User>('/auth/me');
    },

    resendVerificationEmail: async (email: string) => {
      return api.post('/auth/resend-verification-email', { email });
    },
  };

  export default authApi;