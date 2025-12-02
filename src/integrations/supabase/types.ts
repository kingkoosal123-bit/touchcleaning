export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          actual_cost: number | null
          actual_hours: number | null
          completed_at: string | null
          created_at: string
          customer_id: string
          email: string
          estimated_cost: number | null
          estimated_hours: number | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string
          preferred_date: string
          property_type: Database["public"]["Enums"]["property_type"]
          service_address: string
          service_location_lat: number | null
          service_location_lng: number | null
          service_type: Database["public"]["Enums"]["service_type"]
          staff_hours_worked: number | null
          staff_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          task_accepted_at: string | null
          task_started_at: string | null
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          actual_hours?: number | null
          completed_at?: string | null
          created_at?: string
          customer_id: string
          email: string
          estimated_cost?: number | null
          estimated_hours?: number | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone: string
          preferred_date: string
          property_type: Database["public"]["Enums"]["property_type"]
          service_address: string
          service_location_lat?: number | null
          service_location_lng?: number | null
          service_type: Database["public"]["Enums"]["service_type"]
          staff_hours_worked?: number | null
          staff_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          task_accepted_at?: string | null
          task_started_at?: string | null
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          actual_hours?: number | null
          completed_at?: string | null
          created_at?: string
          customer_id?: string
          email?: string
          estimated_cost?: number | null
          estimated_hours?: number | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string
          preferred_date?: string
          property_type?: Database["public"]["Enums"]["property_type"]
          service_address?: string
          service_location_lat?: number | null
          service_location_lng?: number | null
          service_type?: Database["public"]["Enums"]["service_type"]
          staff_hours_worked?: number | null
          staff_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          task_accepted_at?: string | null
          task_started_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      task_photos: {
        Row: {
          booking_id: string
          caption: string | null
          id: string
          photo_url: string
          staff_id: string
          uploaded_at: string
        }
        Insert: {
          booking_id: string
          caption?: string | null
          id?: string
          photo_url: string
          staff_id: string
          uploaded_at?: string
        }
        Update: {
          booking_id?: string
          caption?: string | null
          id?: string
          photo_url?: string
          staff_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_photos_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      booking_analytics: {
        Row: {
          active_staff: number | null
          avg_booking_value: number | null
          cancelled_count: number | null
          completed_count: number | null
          confirmed_count: number | null
          in_progress_count: number | null
          pending_count: number | null
          total_bookings: number | null
          total_customers: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "customer"
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
      property_type: "apartment" | "house" | "office" | "retail" | "industrial"
      service_type:
        | "residential"
        | "commercial"
        | "deep_clean"
        | "carpet_clean"
        | "window_clean"
        | "end_of_lease"
      task_status: "assigned" | "accepted" | "working" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "customer"],
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      property_type: ["apartment", "house", "office", "retail", "industrial"],
      service_type: [
        "residential",
        "commercial",
        "deep_clean",
        "carpet_clean",
        "window_clean",
        "end_of_lease",
      ],
      task_status: ["assigned", "accepted", "working", "completed"],
    },
  },
} as const
