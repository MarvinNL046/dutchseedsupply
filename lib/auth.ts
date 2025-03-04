import { supabase } from './supabase';

export type SignUpCredentials = {
  email: string;
  password: string;
  full_name: string;
};

export type SignInCredentials = {
  email: string;
  password: string;
};

/**
 * Sign up a new user
 */
export async function signUp({ email, password, full_name }: SignUpCredentials) {
  console.log('Attempting to sign up user:', email);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
      },
    });
    
    if (error) {
      console.error('Sign up error:', error);
    } else {
      console.log('Sign up successful for user:', email);
    }
    
    return { data, error };
  } catch (err) {
    console.error('Unexpected error during sign up:', err);
    return { 
      data: null, 
      error: err instanceof Error 
        ? err 
        : new Error('An unexpected error occurred during sign up') 
    };
  }
}

/**
 * Sign in an existing user
 */
export async function signIn({ email, password }: SignInCredentials) {
  console.log('Attempting to sign in user:', email);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
    } else {
      console.log('Sign in successful for user:', email);
    }
    
    return { data, error };
  } catch (err) {
    console.error('Unexpected error during sign in:', err);
    return { 
      data: null, 
      error: err instanceof Error 
        ? err 
        : new Error('An unexpected error occurred during sign in') 
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  console.log('Signing out user...');
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
    } else {
      console.log('Sign out successful');
    }
    
    return { error };
  } catch (err) {
    console.error('Unexpected error during sign out:', err);
    return { 
      error: err instanceof Error 
        ? err 
        : new Error('An unexpected error occurred during sign out') 
    };
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  console.log('Getting current user session...');
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return { user: null, error: sessionError };
    }
    
    if (!session) {
      console.log('No active session found');
      return { user: null, error: null };
    }
    
    console.log('Session found, getting user details...');
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        return { user: null, error: userError };
      }
      
      if (!user) {
        console.log('No user found despite having a session');
        return { user: null, error: new Error('No user found despite having a session') };
      }
      
      console.log('User found:', user.email);
      return { user, error: null };
    } catch (userErr) {
      console.error('Unexpected error getting user:', userErr);
      return { 
        user: null, 
        error: userErr instanceof Error 
          ? userErr 
          : new Error('An unexpected error occurred while getting user') 
      };
    }
  } catch (err) {
    console.error('Unexpected error getting session:', err);
    return { 
      user: null, 
      error: err instanceof Error 
        ? err 
        : new Error('An unexpected error occurred while getting session') 
    };
  }
}
