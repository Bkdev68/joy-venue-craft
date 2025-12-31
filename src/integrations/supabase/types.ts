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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          billing_city: string | null
          billing_company: string | null
          billing_country: string | null
          billing_name: string | null
          billing_street: string | null
          billing_vat_id: string | null
          billing_zip: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          date: string
          event_type: string
          id: string
          message: string | null
          package_id: string | null
          package_name: string
          package_price: number
          service_id: string | null
          service_name: string
          status: string
          updated_at: string
        }
        Insert: {
          billing_city?: string | null
          billing_company?: string | null
          billing_country?: string | null
          billing_name?: string | null
          billing_street?: string | null
          billing_vat_id?: string | null
          billing_zip?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          date: string
          event_type: string
          id?: string
          message?: string | null
          package_id?: string | null
          package_name: string
          package_price: number
          service_id?: string | null
          service_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          billing_city?: string | null
          billing_company?: string | null
          billing_country?: string | null
          billing_name?: string | null
          billing_street?: string | null
          billing_vat_id?: string | null
          billing_zip?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          date?: string
          event_type?: string
          id?: string
          message?: string | null
          package_id?: string | null
          package_name?: string
          package_price?: number
          service_id?: string | null
          service_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          category_id: string | null
          created_at: string
          description: string
          expense_date: string
          gross_amount: number
          id: string
          is_paid: boolean | null
          net_amount: number
          notes: string | null
          paid_date: string | null
          receipt_file_path: string | null
          receipt_number: string | null
          receipt_url: string | null
          recurring_expense_id: string | null
          updated_at: string
          vat_amount: number | null
          vat_rate: number | null
          vendor: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description: string
          expense_date?: string
          gross_amount?: number
          id?: string
          is_paid?: boolean | null
          net_amount?: number
          notes?: string | null
          paid_date?: string | null
          receipt_file_path?: string | null
          receipt_number?: string | null
          receipt_url?: string | null
          recurring_expense_id?: string | null
          updated_at?: string
          vat_amount?: number | null
          vat_rate?: number | null
          vendor: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string
          expense_date?: string
          gross_amount?: number
          id?: string
          is_paid?: boolean | null
          net_amount?: number
          notes?: string | null
          paid_date?: string | null
          receipt_file_path?: string | null
          receipt_number?: string | null
          receipt_url?: string | null
          recurring_expense_id?: string | null
          updated_at?: string
          vat_amount?: number | null
          vat_rate?: number | null
          vendor?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_recurring_expense"
            columns: ["recurring_expense_id"]
            isOneToOne: false
            referencedRelation: "recurring_expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          question: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          question: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          question?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          alt: string
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          src: string
          updated_at: string
        }
        Insert: {
          alt: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          src: string
          updated_at?: string
        }
        Update: {
          alt?: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          src?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          billing_city: string | null
          billing_company: string | null
          billing_country: string | null
          billing_street: string | null
          billing_vat_id: string | null
          billing_zip: string | null
          booking_id: string | null
          created_at: string
          customer_address: string | null
          customer_email: string | null
          customer_name: string
          customer_number: string | null
          customer_phone: string | null
          deposit_amount: number | null
          deposit_due_date: string | null
          deposit_paid: boolean | null
          deposit_paid_date: string | null
          description: string
          due_date: string | null
          gross_amount: number
          id: string
          invoice_date: string
          invoice_number: string
          kilometer_amount: number | null
          kilometer_rate: number | null
          kilometers: number | null
          net_amount: number
          notes: string | null
          payment_status: string
          pdf_url: string | null
          remaining_amount: number | null
          remaining_paid: boolean | null
          remaining_paid_date: string | null
          service_name: string | null
          updated_at: string
          vat_amount: number | null
          vat_rate: number | null
        }
        Insert: {
          billing_city?: string | null
          billing_company?: string | null
          billing_country?: string | null
          billing_street?: string | null
          billing_vat_id?: string | null
          billing_zip?: string | null
          booking_id?: string | null
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_name: string
          customer_number?: string | null
          customer_phone?: string | null
          deposit_amount?: number | null
          deposit_due_date?: string | null
          deposit_paid?: boolean | null
          deposit_paid_date?: string | null
          description: string
          due_date?: string | null
          gross_amount?: number
          id?: string
          invoice_date?: string
          invoice_number: string
          kilometer_amount?: number | null
          kilometer_rate?: number | null
          kilometers?: number | null
          net_amount?: number
          notes?: string | null
          payment_status?: string
          pdf_url?: string | null
          remaining_amount?: number | null
          remaining_paid?: boolean | null
          remaining_paid_date?: string | null
          service_name?: string | null
          updated_at?: string
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Update: {
          billing_city?: string | null
          billing_company?: string | null
          billing_country?: string | null
          billing_street?: string | null
          billing_vat_id?: string | null
          billing_zip?: string | null
          booking_id?: string | null
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_number?: string | null
          customer_phone?: string | null
          deposit_amount?: number | null
          deposit_due_date?: string | null
          deposit_paid?: boolean | null
          deposit_paid_date?: string | null
          description?: string
          due_date?: string | null
          gross_amount?: number
          id?: string
          invoice_date?: string
          invoice_number?: string
          kilometer_amount?: number | null
          kilometer_rate?: number | null
          kilometers?: number | null
          net_amount?: number
          notes?: string | null
          payment_status?: string
          pdf_url?: string | null
          remaining_amount?: number | null
          remaining_paid?: boolean | null
          remaining_paid_date?: string | null
          service_name?: string | null
          updated_at?: string
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          base_price: number | null
          created_at: string
          description: string | null
          duration: string | null
          features: Json | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          price: number
          service_id: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          base_price?: number | null
          created_at?: string
          description?: string | null
          duration?: string | null
          features?: Json | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          price: number
          service_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          base_price?: number | null
          created_at?: string
          description?: string | null
          duration?: string | null
          features?: Json | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          price?: number
          service_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "packages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_expenses: {
        Row: {
          amount: number
          auto_create: boolean | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          interval: string
          is_active: boolean | null
          name: string
          next_due_date: string
          updated_at: string
          vendor: string
        }
        Insert: {
          amount?: number
          auto_create?: boolean | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          interval?: string
          is_active?: boolean | null
          name: string
          next_due_date: string
          updated_at?: string
          vendor: string
        }
        Update: {
          amount?: number
          auto_create?: boolean | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          interval?: string
          is_active?: boolean | null
          name?: string
          next_due_date?: string
          updated_at?: string
          vendor?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: string
          image_url: string | null
          is_active: boolean | null
          price_from: number | null
          short_description: string | null
          slug: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price_from?: number | null
          short_description?: string | null
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price_from?: number | null
          short_description?: string | null
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content_type: string
          created_at: string
          id: string
          image_url: string | null
          json_value: Json | null
          key: string
          section: string
          text_value: string | null
          updated_at: string
        }
        Insert: {
          content_type?: string
          created_at?: string
          id?: string
          image_url?: string | null
          json_value?: Json | null
          key: string
          section: string
          text_value?: string | null
          updated_at?: string
        }
        Update: {
          content_type?: string
          created_at?: string
          id?: string
          image_url?: string | null
          json_value?: Json | null
          key?: string
          section?: string
          text_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          company: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          rating: number | null
          role: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          rating?: number | null
          role?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          rating?: number | null
          role?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor"
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
      app_role: ["admin", "editor"],
    },
  },
} as const
