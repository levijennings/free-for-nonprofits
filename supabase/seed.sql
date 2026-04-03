-- Free For NonProfits: Seed Data
-- Sample categories and tools for testing and demonstration
-- Created: 2026-04-03

-- ============================================================================
-- 1. SEED CATEGORIES
-- ============================================================================

INSERT INTO categories (name, slug, description, icon, display_order) VALUES
-- Core Categories
('CRM & Donor Management', 'crm-donor-management', 'Customer relationship management and donor tracking systems', '📋', 1),
('Fundraising & Payments', 'fundraising-payments', 'Tools for fundraising campaigns, donations, and payment processing', '💰', 2),
('Email Marketing', 'email-marketing', 'Email communication and marketing automation platforms', '✉️', 3),
('Project Management', 'project-management', 'Task tracking, collaboration, and project planning tools', '✅', 4),
('Accounting & Finance', 'accounting-finance', 'Bookkeeping, accounting, and financial management software', '💳', 5),
('Website & CMS', 'website-cms', 'Website builders, content management systems, and hosting', '🌐', 6),
('Communication & Chat', 'communication-chat', 'Team messaging, video conferencing, and communication tools', '💬', 7),
('Design & Graphics', 'design-graphics', 'Graphic design, image editing, and visual content tools', '🎨', 8),
('Volunteer Management', 'volunteer-management', 'Volunteer scheduling, coordination, and management', '🤝', 9),
('Data & Analytics', 'data-analytics', 'Data analysis, reporting, and business intelligence tools', '📊', 10),
('Document Management', 'document-management', 'Document storage, management, and collaboration', '📄', 11),
('Social Media', 'social-media', 'Social media management and content scheduling', '📱', 12);


-- ============================================================================
-- 2. SEED SAMPLE TOOLS
-- ============================================================================

WITH category_ids AS (
  SELECT id, slug FROM categories
)
INSERT INTO tools (
  name,
  slug,
  description,
  long_description,
  category_id,
  website_url,
  logo_url,
  pricing_model,
  nonprofit_deal,
  features,
  tags,
  is_verified,
  is_featured,
  created_at
) SELECT
  'Salesforce Nonprofit Cloud',
  'salesforce-nonprofit-cloud',
  'Enterprise CRM platform designed specifically for nonprofits with discounted pricing',
  'Salesforce Nonprofit Cloud is a comprehensive CRM solution built for nonprofit organizations. It includes donor management, volunteer tracking, grants management, and constituent relationship management. Nonprofits receive up to 10 licenses free annually.',
  cat.id,
  'https://www.salesforce.com/solutions/nonprofit/nonprofit-cloud/',
  'https://www.salesforce.com/content/dam/web/en_us/www/logos/salesforce-logo.svg',
  'nonprofit_discount'::pricing_model,
  '10 free licenses per year, up to 90% discount on additional licenses',
  '["Donor Management", "Volunteer Tracking", "Grants Management", "Reporting", "API Access", "Custom Fields"]'::jsonb,
  ARRAY['crm', 'nonprofit', 'donor', 'volunteer', 'enterprise'],
  true,
  true,
  NOW()
FROM category_ids cat WHERE cat.slug = 'crm-donor-management'

UNION ALL SELECT
  'Donorbox',
  'donorbox',
  'Nonprofit-friendly donation platform with low fees and flexible integrations',
  'Donorbox is a powerful donation management platform that makes it easy to collect donations online. Features include recurring donations, peer-to-peer fundraising, and fundraising campaigns. Designed specifically for nonprofits with transparent, low pricing.',
  cat.id,
  'https://donorbox.org/',
  'https://assets.donorbox.org/images/donorbox-logo.png',
  'freemium'::pricing_model,
  'Pay what you want pricing model - no minimum fees, transparent costs',
  '["Online Donations", "Recurring Giving", "Peer-to-Peer Fundraising", "Payment Processing", "Multi-Currency", "Reporting"]'::jsonb,
  ARRAY['fundraising', 'payments', 'donations', 'nonprofit', 'freemium'],
  true,
  true,
  NOW()
FROM category_ids cat WHERE cat.slug = 'fundraising-payments'

UNION ALL SELECT
  'Mailchimp',
  'mailchimp',
  'Email marketing and automation platform with free tier for nonprofits',
  'Mailchimp is an intuitive email marketing platform trusted by millions. It offers email campaigns, automation, audience segmentation, and detailed analytics. Nonprofits can use the free plan indefinitely with unlimited contacts.',
  cat.id,
  'https://mailchimp.com/',
  'https://upload.wikimedia.org/wikipedia/commons/9/9e/Mailchimp_logo.svg',
  'free'::pricing_model,
  'Free plan for nonprofits with unlimited contacts and basic features',
  '["Email Campaigns", "Marketing Automation", "Audience Segmentation", "Analytics", "A/B Testing", "Templates"]'::jsonb,
  ARRAY['email', 'marketing', 'automation', 'free', 'nonprofit'],
  true,
  true,
  NOW()
FROM category_ids cat WHERE cat.slug = 'email-marketing'

UNION ALL SELECT
  'Asana',
  'asana',
  'Project management and team collaboration platform with nonprofit pricing',
  'Asana is a comprehensive work management platform that helps teams organize, track, and manage their work. Features include task management, timelines, portfolios, and team collaboration tools. Nonprofits get special pricing and dedicated support.',
  cat.id,
  'https://asana.com/',
  'https://luna.asana.biz/assets/img/logos/asana-logo-dark.svg',
  'nonprofit_discount'::pricing_model,
  '80% discount on Premium and Business plans for qualifying nonprofits',
  '["Task Management", "Timelines", "Portfolios", "Team Collaboration", "Custom Fields", "API Access"]'::jsonb,
  ARRAY['project-management', 'collaboration', 'nonprofit', 'teams'],
  true,
  false,
  NOW()
FROM category_ids cat WHERE cat.slug = 'project-management'

UNION ALL SELECT
  'Wave Accounting',
  'wave-accounting',
  'Free accounting software for nonprofits and small organizations',
  'Wave Accounting is completely free accounting software designed for small businesses and nonprofits. It includes invoicing, expense tracking, income statements, and balance sheets. No limits on users or transactions.',
  cat.id,
  'https://www.waveapps.com/',
  'https://www.waveapps.com/favicon-196.png',
  'free'::pricing_model,
  'Completely free accounting and invoicing software for nonprofits',
  '["Invoicing", "Expense Tracking", "Accounting Reports", "Tax Preparation", "Multi-User Access", "Receipt Scanning"]'::jsonb,
  ARRAY['accounting', 'finance', 'free', 'nonprofit', 'invoicing'],
  true,
  true,
  NOW()
FROM category_ids cat WHERE cat.slug = 'accounting-finance'

UNION ALL SELECT
  'Wix for Nonprofits',
  'wix-nonprofits',
  'Free website builder and hosting for qualifying nonprofit organizations',
  'Wix provides nonprofit organizations with a free website and domain. Create professional, mobile-responsive websites without coding. Includes hosting, SSL security, and access to premium templates.',
  cat.id,
  'https://www.wix.com/en-us/nonprofits',
  'https://www.wix.com/favicon.ico',
  'free'::pricing_model,
  'Free website, domain, and premium templates for eligible nonprofits',
  '["Website Builder", "Domain Name", "SSL Security", "Mobile Responsive", "Templates", "SEO Tools"]'::jsonb,
  ARRAY['website', 'cms', 'free', 'nonprofit', 'hosting'],
  true,
  false,
  NOW()
FROM category_ids cat WHERE cat.slug = 'website-cms'

UNION ALL SELECT
  'Slack',
  'slack',
  'Team communication platform with nonprofit discounts available',
  'Slack is a powerful messaging platform for team communication and collaboration. Organize conversations in channels, integrations with hundreds of apps, and searchable message history. Special pricing available for nonprofits.',
  cat.id,
  'https://slack.com/',
  'https://a.slack-edge.com/80588/marketing/downloads/logos/downloads/Slack_Logo.png',
  'freemium'::pricing_model,
  '50% discount on annual subscription for qualifying nonprofits',
  '["Team Messaging", "File Sharing", "App Integrations", "Search History", "Video Calls", "Channels"]'::jsonb,
  ARRAY['communication', 'chat', 'collaboration', 'nonprofit'],
  true,
  false,
  NOW()
FROM category_ids cat WHERE cat.slug = 'communication-chat'

UNION ALL SELECT
  'Canva',
  'canva',
  'Graphic design platform with free tools for nonprofits',
  'Canva is an easy-to-use design platform that lets anyone create professional graphics without design experience. Templates for social media, presentations, documents, and more. Canva for Nonprofits offers free premium access.',
  cat.id,
  'https://www.canva.com/',
  'https://www.canva.com/favicon.ico',
  'freemium'::pricing_model,
  'Free access to Canva Teams and premium features for nonprofits',
  '["Design Templates", "Photo Library", "Brand Kit", "Team Collaboration", "Export Options", "Social Media Tools"]'::jsonb,
  ARRAY['design', 'graphics', 'free', 'nonprofit', 'nonprofit-friendly'],
  true,
  false,
  NOW()
FROM category_ids cat WHERE cat.slug = 'design-graphics'

UNION ALL SELECT
  'Google Workspace for Nonprofits',
  'google-workspace-nonprofits',
  'Free productivity suite including Gmail, Docs, Sheets, and Drive',
  'Google Workspace for Nonprofits provides qualifying organizations with free access to Gmail, Google Docs, Sheets, Slides, Drive, and Meet. Includes 100 accounts and 5TB storage per user.',
  cat.id,
  'https://www.google.com/nonprofits/',
  'https://www.google.com/favicon.ico',
  'free'::pricing_model,
  'Free Google Workspace account with up to 100 users for qualifying nonprofits',
  '["Email (Gmail)", "Docs", "Sheets", "Slides", "Drive", "Meet Video Conferencing"]'::jsonb,
  ARRAY['productivity', 'free', 'nonprofit', 'email', 'collaboration'],
  true,
  true,
  NOW()
FROM category_ids cat WHERE cat.slug = 'communication-chat'

UNION ALL SELECT
  'Microsoft 365 for Nonprofits',
  'microsoft-365-nonprofits',
  'Free Office 365 subscription including Word, Excel, and Teams',
  'Microsoft 365 for Nonprofits provides free subscriptions including Office apps, Exchange Online, Teams, and SharePoint. Support for up to 300 office users, plus additional benefits and discounts.',
  cat.id,
  'https://www.microsoft.com/en-us/nonprofits/microsoft-365',
  'https://www.microsoft.com/favicon.ico',
  'free'::pricing_model,
  'Free Microsoft 365 subscriptions for up to 300 office users',
  '["Word", "Excel", "PowerPoint", "Teams", "OneNote", "SharePoint"]'::jsonb,
  ARRAY['productivity', 'free', 'nonprofit', 'office'],
  true,
  false,
  NOW()
FROM category_ids cat WHERE cat.slug = 'document-management';
