-- High-value tools with full claim instructions
-- These are the tools that make nonprofits sign up

WITH category_ids AS (SELECT id, slug FROM categories)

INSERT INTO tools (
  name, slug, description, long_description, category_id,
  website_url, logo_url, pricing_model, nonprofit_deal,
  features, tags, is_verified, is_featured, created_at
)

-- ============ HIGH-VALUE HIDDEN GEMS ============
SELECT 'Google Ad Grants', 'google-ad-grants',
  '$10,000/month in free Google Search advertising for nonprofits',
  'Google Ad Grants gives eligible nonprofits $10,000 USD per month — $120,000 per year — in free Google Search advertising. Use it to recruit volunteers, attract donors, raise awareness, and drive traffic to your website. Most eligible nonprofits don''t know they qualify. To apply: (1) Sign up for Google for Nonprofits at google.com/nonprofits and verify via Goodstack. (2) Once approved, apply for Ad Grants from your Google for Nonprofits dashboard. (3) Wait 3–15 business days for approval. (4) Set up your first campaign targeting keywords related to your mission. Requirements: Must be a 501(c)(3), have an HTTPS website with a clear mission, and maintain a 5% click-through rate monthly.',
  cat.id,
  'https://www.google.com/grants/',
  'https://www.google.com/favicon.ico',
  'free'::pricing_model,
  '$10,000/month ($120,000/year) in free Google Search ads — no strings attached',
  '["$10K/Month in Search Ads","Volunteer Recruitment","Donor Acquisition","Mission Awareness","Keyword Targeting","Monthly Renewal"]'::jsonb,
  ARRAY['advertising','google','free','grants','marketing','search','$10k'],
  true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'data-analytics'

UNION ALL SELECT 'Twilio for Good', 'twilio-for-good',
  'Free SMS, voice, and WhatsApp messaging credits for nonprofits',
  'Twilio for Good offers nonprofits a $500 kickstart credit plus ongoing discounted rates on SMS, voice calls, WhatsApp messages, and email via SendGrid. Use Twilio to send donation confirmations, event reminders, volunteer alerts, and emergency notifications. To apply: (1) Create a Twilio account at twilio.com. (2) Visit twilio.com/for-good and apply with your 501(c)(3) documentation. (3) Receive $500 in free credits upon approval. Twilio powers communication for thousands of nonprofits including disaster relief organizations and crisis hotlines.',
  cat.id,
  'https://www.twilio.com/en-us/for-good',
  'https://www.twilio.com/favicon.ico',
  'nonprofit_discount'::pricing_model,
  '$500 in free credits for new nonprofits plus ongoing discounted rates',
  '["SMS Messaging","Voice Calls","WhatsApp","Email via SendGrid","Automated Alerts","Crisis Communications","API Access"]'::jsonb,
  ARRAY['sms','messaging','communications','api','nonprofit','free-credits'],
  true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'communication-chat'

UNION ALL SELECT 'Zendesk for Nonprofits', 'zendesk-nonprofits',
  'Free customer support software for nonprofits — up to $100K in value',
  'Zendesk offers eligible nonprofits free access to its customer support suite including ticketing, live chat, a help center, and reporting — valued at up to $100,000. Use it for donor support, volunteer inquiries, program participant assistance, and constituent services. To apply: (1) Visit zendesk.com/nonprofit and click "Apply Now." (2) Complete the application with your 501(c)(3) details. (3) Receive approval within 2–3 weeks. Includes up to 3 free agent licenses with ability to add more at 50% off.',
  cat.id,
  'https://www.zendesk.com/nonprofit/',
  'https://www.zendesk.com/favicon.ico',
  'free'::pricing_model,
  'Free access for up to 3 agents; additional agents at 50% off — up to $100K in value',
  '["Help Desk Ticketing","Live Chat","Help Center","Reporting","Email Support","Automation","Knowledge Base"]'::jsonb,
  ARRAY['support','helpdesk','nonprofit','free','donor-support'],
  true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'communication-chat'

UNION ALL SELECT 'Miro', 'miro',
  'Free collaborative whiteboard for nonprofit teams and workshops',
  'Miro is the leading collaborative whiteboard platform used by nonprofits for strategic planning, board workshops, program design, and team collaboration. Nonprofits receive free access to the Starter plan with unlimited team members. To apply: (1) Create a Miro account at miro.com. (2) Navigate to miro.com/nonprofits and submit your 501(c)(3) documentation. (3) Receive upgraded access within 5 business days. Perfect for virtual board retreats, logic model development, and strategic planning sessions.',
  cat.id,
  'https://miro.com/nonprofits/',
  'https://miro.com/favicon.ico',
  'free'::pricing_model,
  'Free Starter plan for nonprofits with unlimited team members and boards',
  '["Infinite Whiteboard","Strategic Planning","Workshop Facilitation","Mind Mapping","Templates","Real-Time Collaboration","Video Chat"]'::jsonb,
  ARRAY['whiteboard','collaboration','strategy','free','nonprofit','planning'],
  true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'project-management'

UNION ALL SELECT 'Loom', 'loom',
  'Free async video messaging for nonprofit teams',
  'Loom lets you record and share video messages instantly — great for training volunteers, onboarding staff, communicating with distributed boards, and creating donor impact videos. Nonprofits get the Business plan free. To apply: (1) Go to loom.com/education-and-nonprofits. (2) Apply with proof of nonprofit status. (3) Get approved within a few days. Includes unlimited video recording, custom branding, and viewer analytics — essential for remote nonprofit teams.',
  cat.id,
  'https://www.loom.com/education-and-nonprofits',
  'https://www.loom.com/favicon.ico',
  'free'::pricing_model,
  'Free Business plan for nonprofits — unlimited video recording and sharing',
  '["Video Messaging","Screen Recording","Volunteer Training","Board Communications","Viewer Analytics","Custom Branding","Captions"]'::jsonb,
  ARRAY['video','communication','training','free','nonprofit','async'],
  true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'communication-chat'

UNION ALL SELECT 'Esri ArcGIS', 'esri-arcgis',
  'Professional mapping and GIS software free for nonprofits',
  'Esri is the world leader in geographic information systems (GIS). Through the Esri Nonprofit Organization Program, qualifying nonprofits receive ArcGIS Online, ArcGIS Pro, and other Esri software at no cost — normally worth thousands per year. Use it for mapping service areas, visualizing community needs, and presenting geographic impact data to funders. To apply: (1) Visit esri.com/nonprofit. (2) Complete the application and submit 501(c)(3) documentation. (3) Approval typically takes 2–4 weeks.',
  cat.id,
  'https://www.esri.com/en-us/industries/nonprofit/nonprofit-program',
  'https://www.esri.com/favicon.ico',
  'free'::pricing_model,
  'Free ArcGIS Online and ArcGIS Pro licenses for qualifying nonprofits',
  '["Mapping","GIS Analysis","Service Area Visualization","Community Needs Mapping","Funder Reports","Data Visualization","Demographics"]'::jsonb,
  ARRAY['gis','mapping','data','nonprofit','free','impact'],
  true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'data-analytics'

UNION ALL SELECT 'Okta for Good', 'okta-for-good',
  'Free identity and access management for nonprofits',
  'Okta is the leading identity platform for secure logins, single sign-on (SSO), and multi-factor authentication. Through Okta for Good, qualifying nonprofits receive free access to Okta''s Workforce Identity platform — normally $2–15 per user per month. Secure your staff logins, enable SSO across all your tools, and protect donor data. To apply: (1) Visit okta.com/okta-for-good. (2) Apply with your nonprofit documentation. Includes up to 500 monthly active users free.',
  cat.id,
  'https://www.okta.com/okta-for-good/',
  'https://www.okta.com/favicon.ico',
  'free'::pricing_model,
  'Free Workforce Identity for nonprofits — up to 500 monthly active users',
  '["Single Sign-On","Multi-Factor Authentication","Secure Logins","User Management","Zero Trust Security","SAML/OIDC","Lifecycle Management"]'::jsonb,
  ARRAY['security','identity','sso','mfa','nonprofit','free'],
  true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'document-management'

UNION ALL SELECT 'AWS for Nonprofits', 'aws-nonprofits',
  'Free cloud credits and services for nonprofits from Amazon',
  'Amazon Web Services offers nonprofits $1,000 in AWS credits through AWS Imagine Grant and ongoing free tier access to 100+ cloud services. Use it for hosting websites, storing data, running applications, and powering machine learning. To apply: (1) Visit aws.amazon.com/government-education/nonprofits and create an AWS account. (2) Apply for AWS Imagine Grant credits. (3) Access the AWS Free Tier immediately with 12-month free access to core services. Additional credits available through TechSoup.',
  cat.id,
  'https://aws.amazon.com/government-education/nonprofits/',
  'https://aws.amazon.com/favicon.ico',
  'free'::pricing_model,
  '$1,000 in AWS credits via Imagine Grant plus ongoing free tier access',
  '["Cloud Hosting","Data Storage","Databases","Machine Learning","Email (SES)","CDN","Security Tools"]'::jsonb,
  ARRAY['cloud','hosting','aws','nonprofit','credits','infrastructure'],
  true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'website-cms'

UNION ALL SELECT 'Salesforce.org Einstein', 'salesforce-einstein-nonprofits',
  'Free AI tools for nonprofits built into Salesforce Nonprofit Cloud',
  'Salesforce includes Einstein AI capabilities within the free Nonprofit Cloud licenses — giving nonprofits access to AI-powered donor scoring, program outcome prediction, and automated communications. Combined with the 10 free Salesforce licenses, nonprofits get enterprise-grade AI at zero cost. Einstein can predict donor churn, score grant opportunities, and automate outreach.',
  cat.id,
  'https://www.salesforce.com/solutions/nonprofit/',
  'https://www.salesforce.com/favicon.ico',
  'free'::pricing_model,
  'Included free with the 10 Salesforce Nonprofit Cloud licenses every eligible nonprofit receives',
  '["AI Donor Scoring","Outcome Prediction","Automated Outreach","Churn Prevention","Grant Scoring","Natural Language Insights"]'::jsonb,
  ARRAY['ai','crm','salesforce','nonprofit','free','donor'],
  true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'crm-donor-management'

UNION ALL SELECT 'GitHub for Nonprofits', 'github-nonprofits',
  'Free GitHub Team plan for nonprofit organizations',
  'GitHub offers free GitHub Team plan access to nonprofits — normally $4/user/month. This includes private repositories, GitHub Actions (CI/CD), project management boards, and Codespaces. Nonprofits use GitHub for managing websites, storing data, and version-controlling documents. To apply: (1) Visit github.com/nonprofits. (2) Apply with your organization details and 501(c)(3) status. (3) Receive free Team plan access within a few business days.',
  cat.id,
  'https://github.com/nonprofit',
  'https://github.com/favicon.ico',
  'free'::pricing_model,
  'Free GitHub Team plan for nonprofits — includes private repos, Actions, and Codespaces',
  '["Private Repositories","GitHub Actions","Project Boards","Code Review","Codespaces","Security Scanning","Wikis"]'::jsonb,
  ARRAY['code','github','developer','nonprofit','free','devops'],
  true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'document-management'

UNION ALL SELECT 'Atlassian for Nonprofits', 'atlassian-nonprofits',
  'Free Jira, Confluence, and Trello for nonprofits',
  'The Atlassian Foundation offers free licenses for Jira Software, Confluence, Jira Service Management, and Trello to qualifying nonprofits. Jira is the industry standard for project tracking. Confluence is the leading team wiki and documentation tool. Together they give nonprofits enterprise-grade operations infrastructure at zero cost. To apply: (1) Visit atlassian.com/teams/nonprofits. (2) Apply with your 501(c)(3) and describe your work. (3) Receive free Standard licenses within 2 weeks.',
  cat.id,
  'https://www.atlassian.com/teams/nonprofits',
  'https://www.atlassian.com/favicon.ico',
  'free'::pricing_model,
  'Free Jira, Confluence, and Jira Service Management for qualifying nonprofits',
  '["Jira Project Tracking","Confluence Wiki","Jira Service Desk","Trello","Roadmaps","Sprints","Documentation"]'::jsonb,
  ARRAY['project-management','jira','confluence','nonprofit','free','wiki'],
  true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'project-management'

UNION ALL SELECT 'SurveyMonkey for Nonprofits', 'surveymonkey-nonprofits',
  '25% off SurveyMonkey plans for nonprofits',
  'SurveyMonkey is the world''s most popular survey platform. Nonprofits receive a 25% discount on all paid plans. Use it for program evaluation, donor feedback, community needs assessments, volunteer satisfaction surveys, and board self-assessments. To claim: (1) Go to surveymonkey.com and choose a plan. (2) Apply the nonprofit discount code during checkout. (3) Verify your nonprofit status. Free plan also available with limited features.',
  cat.id,
  'https://www.surveymonkey.com/mp/nonprofit-surveys/',
  'https://www.surveymonkey.com/favicon.ico',
  'nonprofit_discount'::pricing_model,
  '25% discount for verified nonprofits on all paid plans',
  '["Online Surveys","Program Evaluation","Donor Feedback","Needs Assessments","Logic Branching","Analytics","Templates"]'::jsonb,
  ARRAY['surveys','evaluation','nonprofit','discount','feedback'],
  true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'data-analytics'

UNION ALL SELECT 'Mailchimp Nonprofit', 'mailchimp-nonprofit-discount',
  '15% discount on Mailchimp paid plans for nonprofits',
  'Beyond its free plan, Mailchimp offers nonprofits a 15% discount on all paid plans. When you outgrow the free tier (500 contacts), this discount makes Mailchimp''s Standard and Essentials plans significantly more affordable. To claim: (1) Log into Mailchimp and go to Account → Billing. (2) Contact Mailchimp support and provide your nonprofit documentation. (3) Discount is applied to your account going forward. Paid plans add automation workflows, advanced segmentation, and A/B testing.',
  cat.id,
  'https://mailchimp.com/pricing/',
  'https://mailchimp.com/favicon.ico',
  'nonprofit_discount'::pricing_model,
  '15% discount on all paid plans plus free plan up to 500 contacts',
  '["Email Campaigns","Marketing Automation","Segmentation","A/B Testing","Landing Pages","Analytics","E-Commerce"]'::jsonb,
  ARRAY['email','marketing','nonprofit','discount','automation'],
  true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'email-marketing'

UNION ALL SELECT 'Zoom for Nonprofits', 'zoom-nonprofits',
  'Zoom meetings and webinars at 50% off for verified nonprofits',
  'Zoom offers nonprofits a 50% discount on Zoom One Pro, Business, and Business Plus plans through TechSoup. This is one of the best deals available — cutting your monthly Zoom bill in half while unlocking unlimited meeting duration, 300-person capacity, and webinar features. To claim: (1) Register on TechSoup at techsoup.org and verify your 501(c)(3) status. (2) Search for "Zoom" in the TechSoup product catalog. (3) Purchase at the discounted rate (~$75/year per host vs $150 standard).',
  cat.id,
  'https://zoom.us/buy?plan=pro&from=zoom',
  'https://zoom.us/favicon.ico',
  'nonprofit_discount'::pricing_model,
  '50% off Zoom Pro and Business plans via TechSoup — ~$75/year per host',
  '["Unlimited Meetings","300 Participants","Webinars","Cloud Recording","Breakout Rooms","Polls","Captions"]'::jsonb,
  ARRAY['video','meetings','webinars','nonprofit','50-percent-off'],
  true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'communication-chat'

UNION ALL SELECT 'Calendly', 'calendly',
  'Free scheduling software with nonprofit pricing on paid plans',
  'Calendly eliminates back-and-forth scheduling for donor meetings, volunteer interviews, program intakes, and board 1:1s. The free plan supports 1 event type with unlimited bookings. Nonprofits receive discounted access to Standard and Teams plans. To get started: simply create a free account at calendly.com — no application required. Upgrade to a paid plan and contact support with your 501(c)(3) for nonprofit pricing.',
  cat.id,
  'https://calendly.com/',
  'https://calendly.com/favicon.ico',
  'free'::pricing_model,
  'Free forever plan; nonprofit discounts available on Standard and Teams paid plans',
  '["Meeting Scheduling","Calendar Integration","Automated Reminders","Round Robin","Group Events","Intake Forms","Zoom Integration"]'::jsonb,
  ARRAY['scheduling','calendar','free','nonprofit','meetings'],
  true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'project-management'

UNION ALL SELECT 'Typeform', 'typeform',
  'Beautiful forms and surveys with nonprofit pricing',
  'Typeform creates conversational forms that feel human — great for program applications, donor surveys, volunteer sign-ups, event registrations, and impact assessments. Nonprofits receive a 30% discount on paid plans. Free plan available with 10 questions and 10 responses per month. To claim the nonprofit discount: (1) Email nonprofits@typeform.com with your 501(c)(3) determination letter. (2) Receive a discount code within a few business days.',
  cat.id,
  'https://www.typeform.com/',
  'https://www.typeform.com/favicon.ico',
  'nonprofit_discount'::pricing_model,
  '30% discount for nonprofits — email nonprofits@typeform.com with your 501(c)(3)',
  '["Conversational Forms","Program Applications","Surveys","Logic Branching","File Upload","Payment Collection","Analytics"]'::jsonb,
  ARRAY['forms','surveys','nonprofit','discount','applications'],
  true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'data-analytics'

UNION ALL SELECT 'Asure Payroll', 'gusto-nonprofits',
  'Free payroll and HR software for nonprofits — first 6 months free',
  'Gusto is a leading payroll and HR platform that offers nonprofits their first 6 months of payroll processing completely free, then significantly discounted ongoing rates. Features include automated payroll, benefits administration, time tracking, onboarding, and compliance. Ideal for nonprofits with 2–200 employees. To claim: (1) Visit gusto.com and start a free trial. (2) During setup, indicate you are a nonprofit. (3) Contact support to activate the nonprofit discount.',
  cat.id,
  'https://gusto.com/go/nonprofit',
  'https://gusto.com/favicon.ico',
  'free'::pricing_model,
  'First 6 months free for nonprofits; discounted rates ongoing',
  '["Payroll Processing","Benefits Administration","Time Tracking","Onboarding","HR Compliance","W-2/1099 Filing","Direct Deposit"]'::jsonb,
  ARRAY['payroll','hr','nonprofit','free','employees','benefits'],
  true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'accounting-finance'

UNION ALL SELECT 'Sprout Social', 'sprout-social-nonprofits',
  'Social media management with 20% nonprofit discount',
  'Sprout Social is an enterprise social media management platform with publishing, monitoring, analytics, and CRM features. Nonprofits receive a 20% discount on all plans. The Standard plan includes 5 social profiles, publishing calendar, and reporting. To claim: (1) Start a free trial at sproutsocial.com. (2) Before subscribing, email billing@sproutsocial.com with your nonprofit documentation to receive the 20% discount code.',
  cat.id,
  'https://sproutsocial.com/',
  'https://sproutsocial.com/favicon.ico',
  'nonprofit_discount'::pricing_model,
  '20% nonprofit discount — email billing@sproutsocial.com with your 501(c)(3)',
  '["Social Publishing","Monitoring","Analytics","CRM Integration","Team Collaboration","Reporting","Scheduling"]'::jsonb,
  ARRAY['social-media','nonprofit','discount','analytics','publishing'],
  true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'social-media'

UNION ALL SELECT 'Asana for Nonprofits', 'asana-nonprofits-full',
  '50% off Asana Premium and Business for qualifying nonprofits',
  'Asana''s nonprofit program offers up to 50% off Premium and Business plans for qualifying 501(c)(3) organizations. The discounted Business plan ($~6/user/month vs $24.99) includes portfolios, goals, workload management, and advanced reporting — transforming how your team tracks programs and outcomes. To apply: (1) Visit asana.com/nonprofits. (2) Submit your organization details and 501(c)(3) EIN. (3) Receive approval and discount code within 5–7 business days.',
  cat.id,
  'https://asana.com/nonprofits',
  'https://asana.com/favicon.ico',
  'nonprofit_discount'::pricing_model,
  'Up to 50% off Premium and Business plans — Business from ~$6/user/month',
  '["Project Management","Portfolios","Goals Tracking","Workload Management","Timeline","Automation","Reporting"]'::jsonb,
  ARRAY['project-management','nonprofit','50-percent-off','programs','outcomes'],
  true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'project-management';
