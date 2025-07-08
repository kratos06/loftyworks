import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// 服务端客户端（仅在服务端使用）
export const supabaseAdmin = typeof window === 'undefined' 
  ? createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null

// 数据库类型定义
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          name: string
          avatar_url: string | null
          initials: string | null
          role: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          avatar_url?: string | null
          initials?: string | null
          role?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string | null
          initials?: string | null
          role?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          address: string
          city: string
          postcode: string
          reference: string
          type: string
          status: string
          manager_id: string | null
          image_url: string | null
          description: string | null
          bedrooms: number | null
          bathrooms: number | null
          square_feet: number | null
          monthly_rent: number | null
          deposit_amount: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          address: string
          city: string
          postcode: string
          reference: string
          type: string
          status?: string
          manager_id?: string | null
          image_url?: string | null
          description?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          monthly_rent?: number | null
          deposit_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          address?: string
          city?: string
          postcode?: string
          reference?: string
          type?: string
          status?: string
          manager_id?: string | null
          image_url?: string | null
          description?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          monthly_rent?: number | null
          deposit_amount?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          type: string
          avatar_url: string | null
          initials: string | null
          address: string | null
          company: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          type: string
          avatar_url?: string | null
          initials?: string | null
          address?: string | null
          company?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          type?: string
          avatar_url?: string | null
          initials?: string | null
          address?: string | null
          company?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          type: string
          type_color: string
          date: string
          due_time: string | null
          address: string
          task_number: string
          priority: string
          status: string
          is_completed: boolean
          property_id: string | null
          tenancy_id: string | null
          created_by: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: string
          type_color?: string
          date: string
          due_time?: string | null
          address: string
          task_number: string
          priority?: string
          status?: string
          is_completed?: boolean
          property_id?: string | null
          tenancy_id?: string | null
          created_by?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: string
          type_color?: string
          date?: string
          due_time?: string | null
          address?: string
          task_number?: string
          priority?: string
          status?: string
          is_completed?: boolean
          property_id?: string | null
          tenancy_id?: string | null
          created_by?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          file_name: string
          file_type: string
          file_size: number | null
          file_url: string
          property: string
          property_id: string | null
          document_type: string
          valid_until: string | null
          status: string
          sharing: any
          create_date: string
          uploaded_by: string | null
          folder_path: string | null
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          file_name: string
          file_type: string
          file_size?: number | null
          file_url: string
          property: string
          property_id?: string | null
          document_type: string
          valid_until?: string | null
          status?: string
          sharing?: any
          create_date?: string
          uploaded_by?: string | null
          folder_path?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          file_name?: string
          file_type?: string
          file_size?: number | null
          file_url?: string
          property?: string
          property_id?: string | null
          document_type?: string
          valid_until?: string | null
          status?: string
          sharing?: any
          create_date?: string
          uploaded_by?: string | null
          folder_path?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}