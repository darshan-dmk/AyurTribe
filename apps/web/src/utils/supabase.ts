// apps/web/src/utils/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      apikey: supabaseAnonKey
    }
  }
})

// Database Types based on your schema
export interface User {
  id: string;
  email?: string;
  phone?: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  role: 'patient' | 'practitioner' | 'admin' | 'receptionist';
  address?: string;
  emergency_contact?: string;
  emergency_name?: string;
  emergency_relation?: string;
  occupation?: string;
  chronic_conditions?: string[];
  current_medications?: string[];
  allergies?: string[];
  previous_surgeries?: string[];
  family_history?: string[];
  exercise_frequency?: string;
  sleep_pattern?: string;
  dietary_preferences?: string[];
  smoking_status?: string;
  alcohol_consumption?: string;
  stress_level?: number;
  previous_ayurvedic_treatment?: boolean;
  specific_concerns?: string[];
  treatment_goals?: string[];
  consent_given?: boolean;
  personal_details_completed?: boolean;
  questionnaire_completed?: boolean;
  onboarding_completed?: boolean;
  is_active?: boolean;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  is_on_duty?: boolean;
}

// Auth helper functions
// Auth helper functions
interface AuthService {
  getCurrentUser(providedSession?: any): Promise<User | null>;
  signOut(): Promise<void>;
  updateUserProfile(userId: string, updates: Partial<User>): Promise<any>;
  checkUserExists(identifier: { email?: string; phone?: string }): Promise<User | null>;
  getCurrentSession(): Promise<any>;
}

export const authService: AuthService = {
  async getCurrentUser(providedSession?: any): Promise<User | null> {
    try {
      // Get current session
      let session = providedSession;
      if (!session) {
        const { data } = await supabase.auth.getSession();
        session = data.session;
      }

      console.log('[authService] Current session user ID:', session?.user?.id);

      if (!session?.user?.id) {
        console.log('[authService] No active session');
        return null;
      }

      if (session && session.user?.id) {
        // RACE CONDITION FIX:
        // If we are currently registering, skip the DB fetch to avoid RLS recursion/deadlocks
        // while the backend is creating the profile.
        const isRegistering = localStorage.getItem('registration_in_progress') === 'true';
        if (isRegistering) {
          console.log('[authService] Registration in progress, skipping DB fetch to prevent race condition.');
          // We proceed to fallback logic (returning minimal user)
        } else {
          console.log('[authService] Session found, fetching user profile from DB...');
          let dbUser = null;
          try {
            // Add 3 second timeout to DB query to fail fast
            const dbQuery = supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            const { data, error } = await Promise.race([
              dbQuery,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Database query timed out')), 3000))
            ]) as any;

            if (error) throw error;
            dbUser = data;
          } catch (err) {
            console.warn('[authService] DB fetch failed or timed out:', err);
            // Don't throw, proceed to fallback
          }

          if (dbUser) {
            console.log('[authService] User profile fetched from DB:', dbUser.id);
            return dbUser;
          }
        }

        // --- FALLBACK LOGIC ---
        console.warn('[authService] No DB user found or DB unreachable. Constructing fail-safe user from Session.');

        // Determine role from metadata or email
        const metadata = session.user.user_metadata || {};
        let role = metadata.role || 'patient';

        // Hardcode admin check for safety if metadata is missing
        if (session.user.email?.includes('admin') || session.user.email === 'admin@ezbillify.com') {
          role = 'admin';
        }

        const fallbackUser: User = {
          id: session.user.id,
          email: session.user.email,
          phone: session.user.phone,
          first_name: metadata.first_name || 'User',
          last_name: metadata.last_name || '',
          role: role as any,
          // Add flag to indicate this is a temporary/fallback object
          is_active: true
        };

        console.log('[authService] Returning fallback user:', fallbackUser);
        return fallbackUser;
      }

      return null;
    } catch (error) {
      console.error('[authService] Error in getCurrentUser:', error);
      // Return null on error - let the app handle the unauthenticated state
      return null;
    }
  },

  async signOut() {
    console.log('[authService] Signing out...');

    // 1. Clear Supabase Session
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[authService] Sign out error:', error);
      // Continue clearing local state anyway
    }

    // 2. Clear all Local Storage artifacts
    // We clear every key we know relevant to the user session
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('registrationData');
    localStorage.removeItem('prakritiResults');
    localStorage.removeItem('pendingIdentifierType');
    localStorage.removeItem('pendingIdentifierValue');

    console.log('[authService] Sign out successful, local storage cleared');
  },

  async updateUserProfile(userId: string, updates: Partial<User>) {
    console.log('[authService] Updating user profile:', userId);
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[authService] Error updating user profile:', error);
      throw error;
    }

    console.log('[authService] Profile updated successfully');
    return data;
  },

  async checkUserExists(identifier: { email?: string; phone?: string }): Promise<User | null> {
    try {
      let query = supabase.from('users').select('*');

      if (identifier.email) {
        query = query.eq('email', identifier.email);
      } else if (identifier.phone) {
        query = query.eq('phone', identifier.phone);
      } else {
        return null;
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found - user doesn't exist
          return null;
        }
        console.error('[authService] Error checking user existence:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[authService] Error in checkUserExists:', error);
      return null;
    }
  },

  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[authService] Error getting session:', error);
      return null;
    }
    return session;
  }
};