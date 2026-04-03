/**
 * Typed event definitions for all DVLMNT products
 * Shared across web and mobile clients
 */

// ============================================================================
// FREE FOR NONPROFITS Events
// ============================================================================

export interface FreeForNonprofitsEvents {
  tool_viewed: {
    tool_id: string;
    tool_name: string;
    category: string;
    view_duration?: number; // seconds
  };
  tool_submitted: {
    tool_id: string;
    tool_name: string;
    submission_type: 'single' | 'batch';
    num_items?: number;
    success: boolean;
    error?: string;
  };
  review_posted: {
    tool_id: string;
    review_rating: number; // 1-5
    review_length: number; // char count
    is_anonymous: boolean;
  };
  category_filtered: {
    category: string;
    num_results: number;
  };
  search_performed: {
    query: string;
    num_results: number;
    filters_applied: string[];
  };
}

// ============================================================================
// POCKET BREW Events
// ============================================================================

export interface PocketBrewEvents {
  beer_scanned: {
    upc: string;
    beer_name?: string;
    brewery?: string;
    success: boolean;
    error?: string;
  };
  tasting_note_created: {
    beer_id: string;
    beer_name: string;
    note_length: number; // char count
    rating: number; // 1-5
  };
  beer_rated: {
    beer_id: string;
    beer_name: string;
    rating: number; // 1-5
    prior_rating?: number;
  };
  brewery_visited: {
    brewery_id: string;
    brewery_name: string;
    location: string;
  };
  collection_created: {
    collection_name: string;
    collection_type: 'custom' | 'wishlist' | 'favorites' | 'visited';
    initial_size: number;
  };
  wishlist_added: {
    beer_id: string;
    beer_name: string;
    brewery: string;
    list_size_after: number;
  };
}

// ============================================================================
// BUD BADGE Events
// ============================================================================

export interface BudBadgeEvents {
  module_started: {
    module_id: string;
    module_name: string;
    course_id: string;
    course_name: string;
  };
  module_completed: {
    module_id: string;
    module_name: string;
    course_id: string;
    course_name: string;
    completion_time: number; // seconds
  };
  quiz_passed: {
    quiz_id: string;
    quiz_name: string;
    module_id: string;
    score: number; // percentage
    attempts: number;
  };
  quiz_failed: {
    quiz_id: string;
    quiz_name: string;
    module_id: string;
    score: number; // percentage
    attempts: number;
  };
  certificate_earned: {
    course_id: string;
    course_name: string;
    certification_type: 'completion' | 'excellence' | 'mastery';
    earned_date: string;
  };
  employee_invited: {
    inviter_id: string;
    invitee_email: string;
    company_id: string;
    invite_count_after: number;
  };
  plan_upgraded: {
    old_plan: string;
    new_plan: string;
    monthly_amount: number; // cents
    annual_discount_applied: boolean;
  };
}

// ============================================================================
// CHRISTIAN DEVELOPERS Events
// ============================================================================

export interface ChristianDevelopersEvents {
  job_viewed: {
    job_id: string;
    job_title: string;
    company_id: string;
    company_name: string;
    view_duration?: number; // seconds
  };
  job_applied: {
    job_id: string;
    job_title: string;
    company_id: string;
    company_name: string;
    application_type: 'standard' | 'quick';
    resume_attached: boolean;
  };
  forum_post_created: {
    post_id: string;
    category: string;
    is_question: boolean;
    post_length: number; // char count
    tags: string[];
  };
  prayer_request_submitted: {
    request_type: 'personal' | 'community' | 'ministry';
    request_length: number; // char count
    allow_public: boolean;
  };
  mentor_matched: {
    mentor_id: string;
    mentee_id: string;
    expertise_areas: string[];
    commitment_duration: string; // "3 months", "6 months", etc.
  };
  profile_updated: {
    profile_fields_updated: string[]; // array of field names
    is_complete: number; // percentage
    visibility_changed: boolean;
  };
}

// ============================================================================
// Common/Universal Events (all products)
// ============================================================================

export interface UniversalEvents {
  page_view: {
    path: string;
    title?: string;
    referrer?: string;
  };
  user_signup: {
    signup_method: 'email' | 'oauth' | 'invite';
    email?: string;
    referrer?: string;
  };
  user_login: {
    login_method: 'email' | 'oauth';
    is_first_login: boolean;
  };
  error_occurred: {
    error_code: string;
    error_message: string;
    error_context: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
  payment_initiated: {
    amount: number; // cents
    currency: string;
    payment_method: string;
  };
  payment_completed: {
    amount: number; // cents
    currency: string;
    payment_method: string;
    transaction_id: string;
  };
  payment_failed: {
    amount: number; // cents
    currency: string;
    payment_method: string;
    failure_reason: string;
  };
}

// ============================================================================
// Product Union Types
// ============================================================================

export type AllAnalyticsEvents = FreeForNonprofitsEvents &
  PocketBrewEvents &
  BudBadgeEvents &
  ChristianDevelopersEvents &
  UniversalEvents;

export type EventName = keyof AllAnalyticsEvents;

export interface AnalyticsEvent<T extends EventName = EventName> {
  name: T;
  properties: T extends keyof AllAnalyticsEvents ? AllAnalyticsEvents[T] : never;
  timestamp?: number;
}

// ============================================================================
// User Identification
// ============================================================================

export interface UserProperties {
  user_id: string;
  email?: string;
  name?: string;
  plan?: string;
  plan_annual: boolean;
  signup_date: string;
  // Product-specific user properties
  free_for_nonprofits?: {
    organization: string;
    organization_type: string;
  };
  pocket_brew?: {
    favorite_styles: string[];
    breweries_visited: number;
  };
  bud_badge?: {
    company: string;
    role: string;
    courses_enrolled: number;
    completion_rate: number;
  };
  christian_developers?: {
    expertise: string[];
    years_in_ministry: number;
    mentor_status: 'mentee' | 'mentor' | 'both' | 'none';
  };
}

// ============================================================================
// Cohort Definition
// ============================================================================

export interface UserCohort {
  cohort_id: string;
  cohort_name: string;
  cohort_type:
    | 'signup_date'
    | 'plan'
    | 'feature_usage'
    | 'geography'
    | 'custom';
  created_date: string;
}
