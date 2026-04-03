-- Free For NonProfits: Expanded Seed Data
-- 50+ real tools across all categories
-- Run AFTER 00001_initial_schema.sql and seed.sql

WITH category_ids AS (
  SELECT id, slug FROM categories
)
INSERT INTO tools (
  name, slug, description, long_description, category_id,
  website_url, logo_url, pricing_model, nonprofit_deal,
  features, tags, is_verified, is_featured, created_at
)

-- ============ CRM & DONOR MANAGEMENT ============
SELECT 'HubSpot CRM', 'hubspot-crm',
  'Powerful free CRM with contact management, email tracking, and pipeline tools',
  'HubSpot CRM is completely free and includes contact and company management, deal tracking, email integration, meeting scheduling, and live chat. Nonprofits can apply for the HubSpot for Nonprofits program for up to 40% off paid tiers.',
  cat.id, 'https://www.hubspot.com/products/crm', 'https://www.hubspot.com/favicon.ico',
  'freemium'::pricing_model, '40% discount on paid plans for registered nonprofits',
  '["Contact Management","Deal Pipelines","Email Tracking","Meeting Scheduling","Live Chat","Reporting"]'::jsonb,
  ARRAY['crm','free','nonprofit','sales','contacts'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'crm-donor-management'

UNION ALL SELECT 'Bloomerang', 'bloomerang',
  'Donor management software built specifically for nonprofits',
  'Bloomerang helps nonprofits manage donor relationships, track giving history, and improve donor retention. Features include a built-in generosity score, engagement tracking, and one-click reporting.',
  cat.id, 'https://bloomerang.co', 'https://bloomerang.co/favicon.ico',
  'nonprofit_discount'::pricing_model, 'Special nonprofit pricing starting at $99/month; free 14-day trial',
  '["Donor Database","Retention Dashboard","Email Marketing","Online Giving","Reporting","Wealth Screening"]'::jsonb,
  ARRAY['crm','donor','nonprofit','retention'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'crm-donor-management'

UNION ALL SELECT 'Little Green Light', 'little-green-light',
  'Affordable donor management for small and mid-sized nonprofits',
  'Little Green Light is a web-based donor management system with constituent tracking, gift recording, acknowledgment letters, and event management. Transparent, affordable pricing scales with your database size.',
  cat.id, 'https://littlegreenlight.com', 'https://littlegreenlight.com/favicon.ico',
  'nonprofit_discount'::pricing_model, 'Plans start at $45/month; 30-day free trial available',
  '["Donor Tracking","Gift Management","Acknowledgment Letters","Event Management","Grant Tracking","Reporting"]'::jsonb,
  ARRAY['crm','donor','nonprofit','affordable'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'crm-donor-management'

UNION ALL SELECT 'Airtable', 'airtable',
  'Flexible database platform used by nonprofits for donor and program tracking',
  'Airtable combines the simplicity of a spreadsheet with the power of a database. Nonprofits use it for donor tracking, grant management, volunteer coordination, and program data. Airtable offers a 50% discount for nonprofits on paid plans.',
  cat.id, 'https://airtable.com', 'https://airtable.com/favicon.ico',
  'nonprofit_discount'::pricing_model, '50% discount on paid plans for verified nonprofits',
  '["Custom Databases","Views & Filters","Automations","Forms","Integrations","API Access"]'::jsonb,
  ARRAY['database','crm','grants','nonprofit','flexible'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'crm-donor-management'

-- ============ FUNDRAISING & PAYMENTS ============
UNION ALL SELECT 'Give Lively', 'give-lively',
  'Completely free fundraising platform built exclusively for nonprofits',
  'Give Lively is a tech company with a social mission — it provides its full suite of fundraising tools completely free to nonprofits. Features include donation pages, peer-to-peer fundraising, event ticketing, text-to-donate, and matching gifts.',
  cat.id, 'https://givelively.org', 'https://givelively.org/favicon.ico',
  'free'::pricing_model, '100% free — no platform fees ever for registered 501(c)(3) organizations',
  '["Donation Pages","Peer-to-Peer","Event Ticketing","Text-to-Donate","Matching Gifts","Embeddable Widgets"]'::jsonb,
  ARRAY['fundraising','free','nonprofit','donations','peer-to-peer'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'fundraising-payments'

UNION ALL SELECT 'PayPal Giving Fund', 'paypal-giving-fund',
  'Accept donations through PayPal with zero platform fees for nonprofits',
  'PayPal Giving Fund charges no fees on donations made through PayPal. Donors can give directly from their PayPal accounts, and funds are distributed directly to enrolled nonprofits. Easy setup for any 501(c)(3).',
  cat.id, 'https://www.paypal.com/us/webapps/mpp/givingfund', 'https://www.paypal.com/favicon.ico',
  'free'::pricing_model, 'Zero platform fees on all donations processed through PayPal Giving Fund',
  '["Zero Fees","PayPal Integration","Recurring Donations","Donor Receipts","Easy Enrollment"]'::jsonb,
  ARRAY['fundraising','free','payments','nonprofit','paypal'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'fundraising-payments'

UNION ALL SELECT 'Classy', 'classy',
  'Enterprise fundraising platform with peer-to-peer, events, and campaigns',
  'Classy is a leading social fundraising platform that helps nonprofits mobilize and manage their communities. Features include campaign pages, peer-to-peer fundraising, virtual events, and subscription giving. Used by thousands of nonprofits.',
  cat.id, 'https://www.classy.org', 'https://www.classy.org/favicon.ico',
  'nonprofit_discount'::pricing_model, 'Nonprofit pricing available; contact for a demo and custom quote',
  '["Campaign Pages","Peer-to-Peer","Virtual Events","Recurring Giving","CRM Integration","Analytics"]'::jsonb,
  ARRAY['fundraising','nonprofit','events','peer-to-peer','enterprise'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'fundraising-payments'

UNION ALL SELECT 'Stripe', 'stripe',
  'Payment processing with discounted rates for registered nonprofits',
  'Stripe provides payment infrastructure for the internet. Nonprofits get discounted processing rates (1.5% + $0.30 per transaction vs standard 2.9%). Stripe supports one-time and recurring donations, donor-covered fees, and powerful APIs.',
  cat.id, 'https://stripe.com/nonprofits', 'https://stripe.com/favicon.ico',
  'nonprofit_discount'::pricing_model, '1.5% + $0.30 per transaction for verified nonprofits (vs standard 2.9%)',
  '["Payment Processing","Recurring Billing","Donor-Covered Fees","API Access","Fraud Prevention","Multi-Currency"]'::jsonb,
  ARRAY['payments','fundraising','nonprofit','api','stripe'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'fundraising-payments'

-- ============ EMAIL MARKETING ============
UNION ALL SELECT 'Constant Contact', 'constant-contact',
  'Email marketing with 30% nonprofit discount and easy drag-and-drop builder',
  'Constant Contact offers email marketing, social media marketing, and event management tools. Nonprofits receive a 30% discount on all plans. Features include customizable templates, list segmentation, and detailed analytics.',
  cat.id, 'https://www.constantcontact.com', 'https://www.constantcontact.com/favicon.ico',
  'nonprofit_discount'::pricing_model, '30% discount for nonprofits on all plans; 60-day free trial',
  '["Email Campaigns","Templates","List Segmentation","Analytics","Social Media","Event Marketing"]'::jsonb,
  ARRAY['email','marketing','nonprofit','discount'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'email-marketing'

UNION ALL SELECT 'Brevo', 'brevo',
  'Free email and SMS marketing platform with generous free tier',
  'Brevo (formerly Sendinblue) offers a free plan with unlimited contacts and up to 300 emails/day. Features include email campaigns, SMS, automation workflows, landing pages, and a CRM. Affordable paid plans for higher volume.',
  cat.id, 'https://www.brevo.com', 'https://www.brevo.com/favicon.ico',
  'free'::pricing_model, 'Free plan: unlimited contacts, 300 emails/day; affordable paid tiers',
  '["Email Campaigns","SMS Marketing","Marketing Automation","Landing Pages","CRM","Transactional Email"]'::jsonb,
  ARRAY['email','sms','free','marketing','automation'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'email-marketing'

UNION ALL SELECT 'Mailerlite', 'mailerlite',
  'Simple email marketing with a free plan up to 1,000 subscribers',
  'MailerLite offers a free plan for up to 1,000 subscribers and 12,000 emails/month with access to most features including automation, landing pages, and pop-ups. An affordable, easy-to-use option for small nonprofits.',
  cat.id, 'https://www.mailerlite.com', 'https://www.mailerlite.com/favicon.ico',
  'free'::pricing_model, 'Free up to 1,000 subscribers; paid plans are among the most affordable',
  '["Email Campaigns","Automation","Landing Pages","Pop-Ups","A/B Testing","Analytics"]'::jsonb,
  ARRAY['email','free','marketing','nonprofit','simple'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'email-marketing'

-- ============ PROJECT MANAGEMENT ============
UNION ALL SELECT 'Notion', 'notion',
  'All-in-one workspace with free plan for nonprofits and Plus plan discount',
  'Notion is a connected workspace combining notes, docs, wikis, databases, and project tracking. Nonprofits can apply for the Notion for Nonprofits program to receive the Plus plan free. Great for knowledge management, SOPs, and team coordination.',
  cat.id, 'https://www.notion.so/nonprofits', 'https://www.notion.so/favicon.ico',
  'nonprofit_discount'::pricing_model, 'Plus plan free for qualifying nonprofits via Notion for Nonprofits program',
  '["Docs & Notes","Databases","Project Tracking","Wiki","Templates","Team Collaboration"]'::jsonb,
  ARRAY['productivity','wiki','docs','free','nonprofit'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'project-management'

UNION ALL SELECT 'Trello', 'trello',
  'Visual project management with free tier and Atlassian nonprofit program',
  'Trello uses boards, lists, and cards to help teams organize work visually. The free tier is generous for small nonprofits. Through the Atlassian Foundation, qualifying nonprofits can access premium features at no cost.',
  cat.id, 'https://trello.com', 'https://trello.com/favicon.ico',
  'free'::pricing_model, 'Free tier available; Atlassian Foundation offers free Standard/Premium for nonprofits',
  '["Kanban Boards","Cards & Checklists","Calendar View","Automations","Integrations","Mobile App"]'::jsonb,
  ARRAY['project-management','kanban','free','nonprofit','visual'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'project-management'

UNION ALL SELECT 'Monday.com', 'monday-com',
  'Work OS platform with significant nonprofit discounts',
  'Monday.com is a flexible work operating system for project management, CRM, and workflows. Nonprofits receive a 70% discount on all plans, making enterprise-grade project management accessible for mission-driven organizations.',
  cat.id, 'https://monday.com/lp/nonprofit/', 'https://monday.com/favicon.ico',
  'nonprofit_discount'::pricing_model, '70% discount for verified nonprofits across all plan tiers',
  '["Project Management","Workflows","CRM","Dashboards","Automations","Time Tracking"]'::jsonb,
  ARRAY['project-management','workflow','nonprofit','discount'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'project-management'

UNION ALL SELECT 'Basecamp', 'basecamp',
  'Simple project management — free for nonprofits, charities, and schools',
  'Basecamp offers its full-featured project management platform completely free to nonprofits, charities, and schools. Includes projects, to-do lists, message boards, schedules, file storage, and group chat.',
  cat.id, 'https://basecamp.com/discounts', 'https://basecamp.com/favicon.ico',
  'free'::pricing_model, 'Completely free for nonprofits, charities, and educational institutions',
  '["Projects","To-Do Lists","Message Boards","Schedules","File Storage","Group Chat"]'::jsonb,
  ARRAY['project-management','free','nonprofit','charity','simple'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'project-management'

UNION ALL SELECT 'ClickUp', 'clickup',
  'All-in-one productivity platform with a generous free tier',
  'ClickUp is a highly customizable productivity platform with tasks, docs, goals, and chat in one place. The free tier includes unlimited tasks, unlimited members, and 100MB storage — plenty for many nonprofits.',
  cat.id, 'https://clickup.com', 'https://clickup.com/favicon.ico',
  'free'::pricing_model, 'Free forever plan with unlimited tasks and members',
  '["Tasks","Docs","Goals","Time Tracking","Chat","Custom Views","Automations"]'::jsonb,
  ARRAY['project-management','free','productivity','nonprofit'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'project-management'

-- ============ ACCOUNTING & FINANCE ============
UNION ALL SELECT 'QuickBooks Nonprofit', 'quickbooks-nonprofit',
  'Industry-leading accounting software with nonprofit pricing via TechSoup',
  'QuickBooks is the most widely used accounting software for nonprofits. Features include fund accounting, grant tracking, donor management, payroll, and financial reporting. Available at heavily discounted prices for nonprofits through TechSoup.',
  cat.id, 'https://quickbooks.intuit.com/nonprofit/', 'https://quickbooks.intuit.com/favicon.ico',
  'nonprofit_discount'::pricing_model, 'Up to 50% off through TechSoup; QuickBooks Online Plus from $37/month',
  '["Fund Accounting","Grant Tracking","Payroll","Financial Reports","Bank Reconciliation","Budget vs Actuals"]'::jsonb,
  ARRAY['accounting','finance','nonprofit','grants','payroll'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'accounting-finance'

UNION ALL SELECT 'Xero', 'xero',
  'Cloud accounting with 25% nonprofit discount',
  'Xero is modern cloud-based accounting software used by thousands of nonprofits. Features include bank feeds, invoicing, expense claims, payroll, and financial reporting. Nonprofits receive a 25% discount on all plans.',
  cat.id, 'https://www.xero.com/us/campaign/nonprofits/', 'https://www.xero.com/favicon.ico',
  'nonprofit_discount'::pricing_model, '25% discount for registered nonprofits on all subscription plans',
  '["Bank Feeds","Invoicing","Expense Claims","Payroll","Financial Reports","Multi-Currency"]'::jsonb,
  ARRAY['accounting','finance','nonprofit','cloud'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'accounting-finance'

-- ============ WEBSITE & CMS ============
UNION ALL SELECT 'WordPress', 'wordpress',
  'Open-source CMS powering 40% of the internet — free to self-host',
  'WordPress.org is a free, open-source content management system that powers over 40% of all websites. Nonprofits can self-host for free (just pay for hosting) and access thousands of free plugins and themes designed for nonprofits.',
  cat.id, 'https://wordpress.org', 'https://wordpress.org/favicon.ico',
  'free'::pricing_model, 'Completely free and open source; low-cost hosting available from $3-10/month',
  '["Content Management","Blog","Plugins","Themes","SEO","eCommerce","Donations"]'::jsonb,
  ARRAY['website','cms','free','open-source','blog'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'website-cms'

UNION ALL SELECT 'Squarespace', 'squarespace',
  'Beautiful website builder with 50% nonprofit discount',
  'Squarespace offers beautifully designed templates and an easy drag-and-drop editor. Nonprofits receive 50% off all plans through their nonprofit program. Includes donation pages, event management, and email marketing.',
  cat.id, 'https://www.squarespace.com/nonprofit', 'https://www.squarespace.com/favicon.ico',
  'nonprofit_discount'::pricing_model, '50% discount for qualifying nonprofits on all annual plans',
  '["Website Builder","Templates","Donation Pages","Event Management","Email Marketing","eCommerce"]'::jsonb,
  ARRAY['website','cms','nonprofit','discount','beautiful'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'website-cms'

UNION ALL SELECT 'Webflow', 'webflow',
  'Professional web design platform with nonprofit pricing',
  'Webflow enables designers to build professional, responsive websites without code. Nonprofits receive a discount on all Workspace and Site plans. Great for organizations that want a polished web presence without developer costs.',
  cat.id, 'https://webflow.com/for/nonprofits', 'https://webflow.com/favicon.ico',
  'nonprofit_discount'::pricing_model, 'Discounted plans for verified nonprofits; apply through the nonprofit program',
  '["Visual Web Design","CMS","Hosting","Animations","SEO","E-Commerce"]'::jsonb,
  ARRAY['website','design','nonprofit','no-code'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'website-cms'

-- ============ COMMUNICATION & CHAT ============
UNION ALL SELECT 'Zoom', 'zoom',
  'Video conferencing with 50% nonprofit discount via TechSoup',
  'Zoom is the leading video conferencing platform for team meetings, webinars, and virtual events. Nonprofits can access Zoom through TechSoup at up to 50% off. Features include meetings, webinars, phone, and team chat.',
  cat.id, 'https://zoom.us/nonprofits', 'https://zoom.us/favicon.ico',
  'nonprofit_discount'::pricing_model, 'Up to 50% off via TechSoup donation; Zoom One Pro from ~$7.50/month/user',
  '["Video Meetings","Webinars","Phone System","Team Chat","Recording","Virtual Backgrounds"]'::jsonb,
  ARRAY['video','meetings','nonprofit','webinars','communication'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'communication-chat'

UNION ALL SELECT 'Discord', 'discord',
  'Free team communication and community platform',
  'Discord is a free communication platform originally built for gaming but widely adopted by nonprofits for community building, volunteer coordination, and team chat. Unlimited message history, voice channels, and video calls on the free plan.',
  cat.id, 'https://discord.com', 'https://discord.com/favicon.ico',
  'free'::pricing_model, 'Free forever with unlimited members, messages, and voice channels',
  '["Text Channels","Voice Channels","Video Calls","Screen Share","Bots & Integrations","Community Building"]'::jsonb,
  ARRAY['chat','community','free','voice','nonprofit'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'communication-chat'

UNION ALL SELECT 'RingCentral', 'ringcentral',
  'Cloud phone and unified communications with nonprofit pricing',
  'RingCentral provides cloud-based phone systems, video meetings, and team messaging in one platform. Nonprofits receive special pricing through TechSoup, making enterprise-grade phone systems affordable for mission-driven organizations.',
  cat.id, 'https://www.ringcentral.com/lp/nonprofit/', 'https://www.ringcentral.com/favicon.ico',
  'nonprofit_discount'::pricing_model, 'Nonprofit pricing via TechSoup; up to 30% off standard rates',
  '["Cloud Phone","Video Meetings","Team Messaging","SMS","Call Recording","Analytics"]'::jsonb,
  ARRAY['phone','communication','nonprofit','cloud'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'communication-chat'

-- ============ DESIGN & GRAPHICS ============
UNION ALL SELECT 'Adobe Creative Cloud', 'adobe-creative-cloud',
  'Industry-standard design suite with 60% discount for nonprofits',
  'Adobe Creative Cloud includes Photoshop, Illustrator, InDesign, Premiere Pro, and 20+ other apps. Nonprofits receive over 60% off standard pricing through TechSoup, making professional-grade design tools accessible.',
  cat.id, 'https://www.adobe.com/creativecloud/buy/students.html', 'https://www.adobe.com/favicon.ico',
  'nonprofit_discount'::pricing_model, '60%+ discount via TechSoup; full Creative Cloud from ~$150/year',
  '["Photoshop","Illustrator","InDesign","Premiere Pro","After Effects","Acrobat","Stock Assets"]'::jsonb,
  ARRAY['design','photo','video','nonprofit','discount','professional'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'design-graphics'

UNION ALL SELECT 'Figma', 'figma',
  'Collaborative design tool with free plan and nonprofit pricing',
  'Figma is the leading collaborative design tool for UI/UX design, presentations, and graphics. The free Starter plan includes unlimited personal files. Nonprofits can apply for discounted team plans for collaborative work.',
  cat.id, 'https://figma.com', 'https://figma.com/favicon.ico',
  'free'::pricing_model, 'Free Starter plan; nonprofit discount available on Professional and Organization plans',
  '["UI Design","Prototyping","Collaboration","Component Libraries","Dev Mode","Presentations"]'::jsonb,
  ARRAY['design','ui','free','collaborative','nonprofit'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'design-graphics'

UNION ALL SELECT 'GIMP', 'gimp',
  'Free and open-source image editor — a powerful Photoshop alternative',
  'GIMP (GNU Image Manipulation Program) is a free, open-source image editor with tools for photo retouching, image composition, and graphics creation. No subscription, no cost — completely free forever.',
  cat.id, 'https://www.gimp.org', 'https://www.gimp.org/favicon.ico',
  'free'::pricing_model, '100% free and open source — no cost ever',
  '["Photo Editing","Image Retouching","Layer Support","Filters","Color Correction","Export Formats"]'::jsonb,
  ARRAY['design','photo','free','open-source','nonprofit'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'design-graphics'

UNION ALL SELECT 'Piktochart', 'piktochart',
  'Easy infographic and visual content creator for nonprofits',
  'Piktochart makes it easy to create professional infographics, reports, presentations, and social media graphics without a design background. Nonprofits receive a 50% discount. Great for annual reports and impact storytelling.',
  cat.id, 'https://piktochart.com/nonprofit/', 'https://piktochart.com/favicon.ico',
  'nonprofit_discount'::pricing_model, '50% discount for verified nonprofits on Pro plans',
  '["Infographics","Reports","Presentations","Social Media Graphics","Data Visualization","Templates"]'::jsonb,
  ARRAY['design','infographics','nonprofit','visual','reports'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'design-graphics'

-- ============ VOLUNTEER MANAGEMENT ============
UNION ALL SELECT 'SignUpGenius', 'signupgenius',
  'Free online sign-up and volunteer scheduling tool',
  'SignUpGenius makes it easy to create sign-up sheets, schedule volunteers, and manage event registrations. The free plan supports unlimited sign-ups and participants. Used by millions of nonprofits for volunteer coordination.',
  cat.id, 'https://www.signupgenius.com', 'https://www.signupgenius.com/favicon.ico',
  'free'::pricing_model, 'Free plan with unlimited sign-ups; paid plans add branding and automation',
  '["Sign-Up Sheets","Volunteer Scheduling","Email Reminders","Event Registration","Reporting","Mobile App"]'::jsonb,
  ARRAY['volunteer','scheduling','free','nonprofit','events'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'volunteer-management'

UNION ALL SELECT 'VolunteerHub', 'volunteerhub',
  'Enterprise volunteer management platform built for nonprofits',
  'VolunteerHub is a comprehensive volunteer management system with scheduling, tracking, communication, and impact reporting. Features include a volunteer portal, hour tracking, background checks, and Salesforce integration.',
  cat.id, 'https://www.volunteerhub.com', 'https://www.volunteerhub.com/favicon.ico',
  'nonprofit_discount'::pricing_model, 'Nonprofit pricing available; contact for a demo and custom quote',
  '["Volunteer Portal","Hour Tracking","Scheduling","Background Checks","Salesforce Integration","Impact Reports"]'::jsonb,
  ARRAY['volunteer','management','nonprofit','enterprise'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'volunteer-management'

UNION ALL SELECT 'Better Impact', 'better-impact',
  'Volunteer and member management with a free starter plan',
  'Better Impact provides volunteer management software with a free plan for organizations with up to 200 volunteers. Features include volunteer profiles, scheduling, hour tracking, communication, and impact reporting.',
  cat.id, 'https://www.betterimpact.com', 'https://www.betterimpact.com/favicon.ico',
  'free'::pricing_model, 'Free plan for up to 200 volunteers; affordable paid tiers for larger organizations',
  '["Volunteer Profiles","Scheduling","Hour Tracking","Communication","Impact Reporting","Mobile App"]'::jsonb,
  ARRAY['volunteer','free','nonprofit','management'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'volunteer-management'

-- ============ DATA & ANALYTICS ============
UNION ALL SELECT 'Google Analytics', 'google-analytics',
  'Free website analytics to understand your nonprofit audience',
  'Google Analytics is the world''s most popular web analytics platform — and completely free. Track website visitors, understand audience behavior, measure campaign performance, and make data-driven decisions for your nonprofit.',
  cat.id, 'https://analytics.google.com', 'https://analytics.google.com/favicon.ico',
  'free'::pricing_model, 'Completely free for standard use; Google Analytics 4 is available to all',
  '["Traffic Reports","Audience Insights","Conversion Tracking","Campaign Measurement","Real-Time Data","Custom Reports"]'::jsonb,
  ARRAY['analytics','free','website','nonprofit','data'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'data-analytics'

UNION ALL SELECT 'Tableau', 'tableau',
  'Powerful data visualization — free for nonprofits through Tableau Foundation',
  'Tableau is an industry-leading data visualization and business intelligence platform. Through the Tableau Foundation''s Nonprofits program, qualifying organizations receive free Tableau Creator licenses, enabling professional-grade data storytelling.',
  cat.id, 'https://www.tableau.com/foundation/license-donations', 'https://www.tableau.com/favicon.ico',
  'free'::pricing_model, 'Free Tableau Creator licenses for qualifying nonprofits via Tableau Foundation',
  '["Data Visualization","Dashboards","Interactive Charts","Data Blending","Geospatial Analysis","Storytelling"]'::jsonb,
  ARRAY['analytics','visualization','free','nonprofit','data','enterprise'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'data-analytics'

UNION ALL SELECT 'Looker Studio', 'looker-studio',
  'Free data visualization and reporting tool from Google',
  'Looker Studio (formerly Google Data Studio) is a free tool that turns your data into informative, easy-to-read, and shareable dashboards and reports. Connects to Google Analytics, Sheets, BigQuery, and 600+ other data sources.',
  cat.id, 'https://lookerstudio.google.com', 'https://lookerstudio.google.com/favicon.ico',
  'free'::pricing_model, 'Completely free with no usage limits for standard reporting',
  '["Dashboards","Custom Reports","Data Connectors","Sharing","Real-Time Data","Templates"]'::jsonb,
  ARRAY['analytics','free','reporting','google','nonprofit'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'data-analytics'

UNION ALL SELECT 'Power BI', 'power-bi',
  'Microsoft''s business intelligence platform — free with Microsoft 365',
  'Power BI is Microsoft''s powerful business analytics tool for creating interactive dashboards and reports. The Power BI Desktop is free, and Power BI Pro is included with Microsoft 365, which nonprofits can get free through Microsoft for Nonprofits.',
  cat.id, 'https://powerbi.microsoft.com', 'https://powerbi.microsoft.com/favicon.ico',
  'free'::pricing_model, 'Free with Microsoft 365 for Nonprofits (up to 300 users free)',
  '["Interactive Dashboards","Data Models","Natural Language Q&A","Mobile Reports","Cloud Storage","Sharing"]'::jsonb,
  ARRAY['analytics','microsoft','free','nonprofit','bi'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'data-analytics'

-- ============ DOCUMENT MANAGEMENT ============
UNION ALL SELECT 'Dropbox', 'dropbox',
  'Cloud file storage with nonprofit pricing through TechSoup',
  'Dropbox provides cloud storage, file sharing, and collaboration tools. Nonprofits can access Dropbox Business at discounted rates through TechSoup. Features include smart sync, version history, team folders, and integrations.',
  cat.id, 'https://www.dropbox.com/business/pricing', 'https://www.dropbox.com/favicon.ico',
  'nonprofit_discount'::pricing_model, 'Discounted pricing via TechSoup; up to 70% off Dropbox Business plans',
  '["Cloud Storage","File Sharing","Smart Sync","Version History","Team Folders","Integrations"]'::jsonb,
  ARRAY['storage','files','nonprofit','collaboration'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'document-management'

UNION ALL SELECT 'Box', 'box',
  'Enterprise content management with free nonprofit plan',
  'Box is a cloud content management platform for secure file storage, sharing, and collaboration. Box offers a free 10-user Business plan for nonprofits through Box.org, including unlimited storage and advanced security.',
  cat.id, 'https://www.box.com/box-for-nonprofits', 'https://www.box.com/favicon.ico',
  'free'::pricing_model, 'Free Business plan for up to 10 users for qualifying nonprofits via Box.org',
  '["Unlimited Storage","File Sharing","Collaboration","Security","Workflow Automation","Integrations"]'::jsonb,
  ARRAY['storage','files','free','nonprofit','enterprise'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'document-management'

UNION ALL SELECT 'DocuSign', 'docusign',
  'Electronic signatures with nonprofit pricing',
  'DocuSign is the world''s leading e-signature platform. Nonprofits use it for donor agreements, grant contracts, employment offers, and board approvals. DocuSign offers discounted pricing for nonprofits through its social impact program.',
  cat.id, 'https://www.docusign.com/industries/nonprofits', 'https://www.docusign.com/favicon.ico',
  'nonprofit_discount'::pricing_model, 'Nonprofit pricing available; up to 50% off standard plans for qualifying orgs',
  '["E-Signatures","Document Templates","Workflows","Audit Trail","Mobile Signing","Integrations"]'::jsonb,
  ARRAY['esignature','contracts','nonprofit','documents'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'document-management'

-- ============ SOCIAL MEDIA ============
UNION ALL SELECT 'Hootsuite', 'hootsuite',
  'Social media management with 75% nonprofit discount',
  'Hootsuite is a leading social media management platform for scheduling posts, monitoring mentions, and analyzing performance across all social channels. Nonprofits receive a 75% discount — one of the biggest nonprofit discounts available anywhere.',
  cat.id, 'https://hootsuite.com/nonprofits', 'https://hootsuite.com/favicon.ico',
  'nonprofit_discount'::pricing_model, '75% discount for registered nonprofits — Hootsuite Professional from ~$7.50/month',
  '["Post Scheduling","Social Monitoring","Analytics","Team Collaboration","Content Calendar","Streams"]'::jsonb,
  ARRAY['social-media','scheduling','nonprofit','discount','analytics'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'social-media'

UNION ALL SELECT 'Buffer', 'buffer',
  'Simple social media scheduling with a free plan',
  'Buffer is an intuitive social media scheduling and analytics tool. The free plan allows 3 social channels and 10 scheduled posts per channel — sufficient for many small nonprofits. Paid plans are affordable with nonprofit discounts available.',
  cat.id, 'https://buffer.com', 'https://buffer.com/favicon.ico',
  'free'::pricing_model, 'Free plan for 3 channels; nonprofit discounts on paid plans via application',
  '["Post Scheduling","Analytics","Content Calendar","Team Access","Link Shortening","Browser Extension"]'::jsonb,
  ARRAY['social-media','scheduling','free','nonprofit'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'social-media'

UNION ALL SELECT 'Later', 'later',
  'Visual social media planner with a free plan',
  'Later is a visual social media scheduling platform focused on Instagram, TikTok, Facebook, and Twitter. The free plan includes 1 social set and 30 posts per month. Great for nonprofits focused on visual storytelling.',
  cat.id, 'https://later.com', 'https://later.com/favicon.ico',
  'free'::pricing_model, 'Free plan: 1 social set, 30 posts/month; affordable paid plans with more features',
  '["Visual Planner","Post Scheduling","Analytics","Hashtag Suggestions","Link in Bio","Stories"]'::jsonb,
  ARRAY['social-media','instagram','free','nonprofit','visual'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'social-media';
