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
      admin_activity_logs: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          description: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          description: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          description?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_details: {
        Row: {
          admin_level: string | null
          can_edit_settings: boolean | null
          can_manage_admins: boolean | null
          can_manage_bookings: boolean | null
          can_manage_customers: boolean | null
          can_manage_payments: boolean | null
          can_manage_staff: boolean | null
          can_view_reports: boolean | null
          created_at: string
          department: string | null
          id: string
          last_login_at: string | null
          login_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_level?: string | null
          can_edit_settings?: boolean | null
          can_manage_admins?: boolean | null
          can_manage_bookings?: boolean | null
          can_manage_customers?: boolean | null
          can_manage_payments?: boolean | null
          can_manage_staff?: boolean | null
          can_view_reports?: boolean | null
          created_at?: string
          department?: string | null
          id?: string
          last_login_at?: string | null
          login_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_level?: string | null
          can_edit_settings?: boolean | null
          can_manage_admins?: boolean | null
          can_manage_bookings?: boolean | null
          can_manage_customers?: boolean | null
          can_manage_payments?: boolean | null
          can_manage_staff?: boolean | null
          can_view_reports?: boolean | null
          created_at?: string
          department?: string | null
          id?: string
          last_login_at?: string | null
          login_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      cms_blog_posts: {
        Row: {
          author_id: string | null
          category: string
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          published_at: string | null
          read_time: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_enquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          notes: string | null
          phone: string | null
          responded_at: string | null
          responded_by: string | null
          service_interest: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          notes?: string | null
          phone?: string | null
          responded_at?: string | null
          responded_by?: string | null
          service_interest?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          notes?: string | null
          phone?: string | null
          responded_at?: string | null
          responded_by?: string | null
          service_interest?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cms_gallery: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_locations: {
        Row: {
          area_name: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          suburbs: string[] | null
          updated_at: string
        }
        Insert: {
          area_name: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          suburbs?: string[] | null
          updated_at?: string
        }
        Update: {
          area_name?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          suburbs?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      cms_services: {
        Row: {
          created_at: string
          description: string
          display_order: number | null
          features: string[] | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          short_description: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          display_order?: number | null
          features?: string[] | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          short_description?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number | null
          features?: string[] | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          short_description?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_site_settings: {
        Row: {
          category: string | null
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      cms_team_members: {
        Row: {
          bio: string | null
          created_at: string
          display_order: number | null
          email: string | null
          expertise: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_leadership: boolean | null
          linkedin_url: string | null
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_order?: number | null
          email?: string | null
          expertise?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_leadership?: boolean | null
          linkedin_url?: string | null
          name: string
          role: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_order?: number | null
          email?: string | null
          expertise?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_leadership?: boolean | null
          linkedin_url?: string | null
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_details: {
        Row: {
          access_instructions: string | null
          allergies_sensitivities: string | null
          average_rating_given: number | null
          billing_address: string | null
          created_at: string
          customer_tier: string | null
          first_booking_date: string | null
          id: string
          is_active: boolean | null
          last_booking_date: string | null
          loyalty_points: number | null
          notes: string | null
          pets_info: string | null
          preferred_contact_method: string | null
          preferred_time_slot: string | null
          property_count: number | null
          referral_code: string | null
          referred_by: string | null
          special_instructions: string | null
          total_bookings: number | null
          total_spent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_instructions?: string | null
          allergies_sensitivities?: string | null
          average_rating_given?: number | null
          billing_address?: string | null
          created_at?: string
          customer_tier?: string | null
          first_booking_date?: string | null
          id?: string
          is_active?: boolean | null
          last_booking_date?: string | null
          loyalty_points?: number | null
          notes?: string | null
          pets_info?: string | null
          preferred_contact_method?: string | null
          preferred_time_slot?: string | null
          property_count?: number | null
          referral_code?: string | null
          referred_by?: string | null
          special_instructions?: string | null
          total_bookings?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_instructions?: string | null
          allergies_sensitivities?: string | null
          average_rating_given?: number | null
          billing_address?: string | null
          created_at?: string
          customer_tier?: string | null
          first_booking_date?: string | null
          id?: string
          is_active?: boolean | null
          last_booking_date?: string | null
          loyalty_points?: number | null
          notes?: string | null
          pets_info?: string | null
          preferred_contact_method?: string | null
          preferred_time_slot?: string | null
          property_count?: number | null
          referral_code?: string | null
          referred_by?: string | null
          special_instructions?: string | null
          total_bookings?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_details_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "customer_details"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notes: {
        Row: {
          admin_id: string
          content: string
          created_at: string
          customer_id: string
          id: string
          is_resolved: boolean | null
          note_type: string
          priority: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          content: string
          created_at?: string
          customer_id: string
          id?: string
          is_resolved?: boolean | null
          note_type: string
          priority?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          content?: string
          created_at?: string
          customer_id?: string
          id?: string
          is_resolved?: boolean | null
          note_type?: string
          priority?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_details"
            referencedColumns: ["id"]
          },
        ]
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
      staff_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          staff_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          staff_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          staff_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_availability_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_details"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_details: {
        Row: {
          average_rating: number | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_bsb: string | null
          created_at: string
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          employee_id: string | null
          employment_type: string | null
          has_drivers_license: boolean | null
          hire_date: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          late_arrival_count: number | null
          license_expiry: string | null
          max_weekly_hours: number | null
          no_show_count: number | null
          notes: string | null
          police_check_date: string | null
          police_check_expiry: string | null
          preferred_areas: string[] | null
          rating_count: number | null
          superannuation_fund: string | null
          superannuation_member_number: string | null
          tax_file_number: string | null
          termination_date: string | null
          total_earnings: number | null
          total_hours_worked: number | null
          total_tasks_completed: number | null
          transport_type: string | null
          uniform_size: string | null
          updated_at: string
          user_id: string
          wwcc_expiry: string | null
          wwcc_number: string | null
        }
        Insert: {
          average_rating?: number | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_bsb?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          employee_id?: string | null
          employment_type?: string | null
          has_drivers_license?: boolean | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          late_arrival_count?: number | null
          license_expiry?: string | null
          max_weekly_hours?: number | null
          no_show_count?: number | null
          notes?: string | null
          police_check_date?: string | null
          police_check_expiry?: string | null
          preferred_areas?: string[] | null
          rating_count?: number | null
          superannuation_fund?: string | null
          superannuation_member_number?: string | null
          tax_file_number?: string | null
          termination_date?: string | null
          total_earnings?: number | null
          total_hours_worked?: number | null
          total_tasks_completed?: number | null
          transport_type?: string | null
          uniform_size?: string | null
          updated_at?: string
          user_id: string
          wwcc_expiry?: string | null
          wwcc_number?: string | null
        }
        Update: {
          average_rating?: number | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_bsb?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          employee_id?: string | null
          employment_type?: string | null
          has_drivers_license?: boolean | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          late_arrival_count?: number | null
          license_expiry?: string | null
          max_weekly_hours?: number | null
          no_show_count?: number | null
          notes?: string | null
          police_check_date?: string | null
          police_check_expiry?: string | null
          preferred_areas?: string[] | null
          rating_count?: number | null
          superannuation_fund?: string | null
          superannuation_member_number?: string | null
          tax_file_number?: string | null
          termination_date?: string | null
          total_earnings?: number | null
          total_hours_worked?: number | null
          total_tasks_completed?: number | null
          transport_type?: string | null
          uniform_size?: string | null
          updated_at?: string
          user_id?: string
          wwcc_expiry?: string | null
          wwcc_number?: string | null
        }
        Relationships: []
      }
      staff_leave: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          rejection_reason: string | null
          staff_id: string
          start_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date: string
          id?: string
          leave_type: string
          reason?: string | null
          rejection_reason?: string | null
          staff_id: string
          start_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          rejection_reason?: string | null
          staff_id?: string
          start_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_leave_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_details"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_payroll: {
        Row: {
          bonus: number | null
          bonus_reason: string | null
          created_at: string
          created_by: string
          deductions: number | null
          gross_pay: number
          hourly_rate: number
          hours_worked: number
          id: string
          net_pay: number
          notes: string | null
          pay_period_end: string
          pay_period_start: string
          payment_date: string | null
          payment_reference: string | null
          payment_status: string | null
          staff_id: string
          superannuation: number | null
          tax_withheld: number | null
          updated_at: string
        }
        Insert: {
          bonus?: number | null
          bonus_reason?: string | null
          created_at?: string
          created_by: string
          deductions?: number | null
          gross_pay: number
          hourly_rate: number
          hours_worked?: number
          id?: string
          net_pay: number
          notes?: string | null
          pay_period_end: string
          pay_period_start: string
          payment_date?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          staff_id: string
          superannuation?: number | null
          tax_withheld?: number | null
          updated_at?: string
        }
        Update: {
          bonus?: number | null
          bonus_reason?: string | null
          created_at?: string
          created_by?: string
          deductions?: number | null
          gross_pay?: number
          hourly_rate?: number
          hours_worked?: number
          id?: string
          net_pay?: number
          notes?: string | null
          pay_period_end?: string
          pay_period_start?: string
          payment_date?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          staff_id?: string
          superannuation?: number | null
          tax_withheld?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_payroll_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_details"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_reviews: {
        Row: {
          admin_response: string | null
          booking_id: string | null
          comment: string | null
          created_at: string
          customer_id: string | null
          id: string
          is_public: boolean | null
          professionalism_rating: number | null
          punctuality_rating: number | null
          quality_rating: number | null
          rating: number
          staff_id: string
        }
        Insert: {
          admin_response?: string | null
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          is_public?: boolean | null
          professionalism_rating?: number | null
          punctuality_rating?: number | null
          quality_rating?: number | null
          rating: number
          staff_id: string
        }
        Update: {
          admin_response?: string | null
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          is_public?: boolean | null
          professionalism_rating?: number | null
          punctuality_rating?: number | null
          quality_rating?: number | null
          rating?: number
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_reviews_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_details"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_skills: {
        Row: {
          certification_name: string | null
          certification_number: string | null
          created_at: string
          expiry_date: string | null
          id: string
          is_verified: boolean | null
          issued_date: string | null
          skill_level: string | null
          skill_name: string
          staff_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          certification_name?: string | null
          certification_number?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_verified?: boolean | null
          issued_date?: string | null
          skill_level?: string | null
          skill_name: string
          staff_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          certification_name?: string | null
          certification_number?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_verified?: boolean | null
          issued_date?: string | null
          skill_level?: string | null
          skill_name?: string
          staff_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_skills_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_details"
            referencedColumns: ["id"]
          },
        ]
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
