export type VendorStatus = 'pending' | 'surveyed' | 'approved' | 'rejected'
export type SubscriptionStatus = 'active' | 'expired' | 'pending'
export type SubscriptionPlan = 'free_1_month' | '1_month' | '3_month' | '6_month' | '1_year'
export type MediaType = 'image' | 'video' | 'thumb'

export interface Category {
  id: string
  name: string
  icon: string
  slug: string
  description?: string
}

export interface Vendor {
  id: string
  name: string
  owner_name: string
  phone: string
  category_id: string
  description: string
  maps_link?: string
  latitude?: number
  longitude?: number
  status: VendorStatus
  subscription_status: SubscriptionStatus
  subscription_start?: string
  subscription_end?: string
  created_at: string
  is_featured?: boolean
  categories?: Category
  media?: Media[]
  ratings?: Rating[]
  products?: Product[]
  services?: Service[]
  jobs?: Job[]
  hashtags?: string[]
  is_cod?: boolean
  address_detail?: string
}

export interface Product {
  id: string
  vendor_id: string
  name: string
  price: number
  description?: string
  image_url?: string
}

export interface Service {
  id: string
  vendor_id: string
  title: string
  description?: string
  price?: number
}

export interface Job {
  id: string
  vendor_id: string
  title: string
  company_name: string
  description?: string
  requirements?: string
  contact_info?: string
  salary_min?: number
  salary_max?: number
  location?: string
  type?: string
  expiry_date?: string
  created_at: string
}

export interface News {
  id: string
  title: string
  content: string
  image?: string
  created_at: string
  author?: string
  category?: string
}

export interface Media {
  id: string
  vendor_id: string
  type: MediaType
  url: string
  created_at: string
}

export interface Rating {
  id: string
  vendor_id: string
  quality_score: number
  cleanliness_score: number
  trust_score: number
  notes?: string
  created_at: string
}

export interface Subscription {
  id: string
  vendor_id: string
  plan: SubscriptionPlan
  start_date: string
  end_date: string
  status: SubscriptionStatus
  amount_paid?: number
  created_at: string
}

export interface VendorFormData {
  // Basic Info
  name: string
  owner_name: string
  phone: string
  category_id: string
  description: string
  // Location
  maps_link: string
  latitude: string
  longitude: string
  address_detail?: string
  // Category-specific
  vehicle_type?: string
  transport_plate?: string
  transport_merk?: string
  transport_year?: string
  transport_base_price?: string
  service_area?: string
  menus?: { name: string; price: string; description: string }[]
  products_list?: { name: string; price: string; description: string }[]
  services_list?: { title: string; price: string; description: string }[]
  job_title?: string
  job_description?: string
  job_requirements?: string
  // Subscription
  plan?: SubscriptionPlan
  // New features
  hashtags?: string[]
  is_cod?: boolean
}

export interface CommunityLink {
  id: string
  platform: 'whatsapp_group' | 'whatsapp_channel' | 'facebook_group'
  url: string
  is_active: boolean
}

