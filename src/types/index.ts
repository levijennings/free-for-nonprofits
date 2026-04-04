export interface Tool {
  id: string
  name: string
  description: string
  category: string
  website_url: string
  affiliate_url?: string
  logo_url?: string
  pricing_model: 'free' | 'freemium' | 'nonprofit_discount'
  nonprofit_deal?: string
  rating_avg: number
  review_count: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  tool_count: number
}

export interface Review {
  id: string
  tool_id: string
  user_id: string
  rating: number
  title: string
  body: string
  org_size: 'small' | 'medium' | 'large'
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  display_name: string
  org_name?: string
  org_size?: 'small' | 'medium' | 'large'
  role?: string
  saved_tools: string[]
  created_at: string
}
