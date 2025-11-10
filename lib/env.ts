/**
 * Environment Variables Utility
 * Handles both NEXT_PUBLIC_SUPABASE_* and SUPABASE_* formats
 * Provides backward compatibility and flexibility
 */

export const ENV = {
  // Supabase URL - supports both formats
  SUPABASE_URL: 
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.SUPABASE_URL || 
    '',

  // Supabase Anon Key - supports both formats
  SUPABASE_ANON_KEY: 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    '',

  // Supabase Service Role Key - server-side only
  SUPABASE_SERVICE_ROLE_KEY: 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    '',

  // Check if Supabase is configured
  isSupabaseConfigured(): boolean {
    return !!(this.SUPABASE_URL && this.SUPABASE_ANON_KEY);
  },

  // Check if we're in build time
  isBuildTime(): boolean {
    return process.env.NODE_ENV === 'production' && 
           typeof window === 'undefined' && 
           !this.SUPABASE_URL;
  },

  // Get Supabase config or throw error
  getSupabaseConfig(): { url: string; anonKey: string } {
    if (!this.isSupabaseConfigured()) {
      if (this.isBuildTime()) {
        // Return placeholder during build time
        return {
          url: 'https://placeholder.supabase.co',
          anonKey: 'placeholder-anon-key'
        };
      }
      throw new Error(
        'Supabase credentials are required. Please set SUPABASE_URL and SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_*) in your environment variables.'
      );
    }
    return {
      url: this.SUPABASE_URL,
      anonKey: this.SUPABASE_ANON_KEY
    };
  },

  // Get Service Role config or throw error
  getServiceRoleConfig(): { url: string; serviceRoleKey: string } {
    const { url } = this.getSupabaseConfig();
    
    if (!this.SUPABASE_SERVICE_ROLE_KEY) {
      if (this.isBuildTime()) {
        return {
          url,
          serviceRoleKey: 'placeholder-service-key'
        };
      }
      throw new Error(
        'Supabase Service Role Key is required. Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables.'
      );
    }
    
    return {
      url,
      serviceRoleKey: this.SUPABASE_SERVICE_ROLE_KEY
    };
  }
};

// Export individual values for convenience
export const SUPABASE_URL = ENV.SUPABASE_URL;
export const SUPABASE_ANON_KEY = ENV.SUPABASE_ANON_KEY;
export const SUPABASE_SERVICE_ROLE_KEY = ENV.SUPABASE_SERVICE_ROLE_KEY;
