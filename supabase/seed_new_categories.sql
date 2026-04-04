-- Free For NonProfits: New Non-SaaS Resource Categories
-- Adds 4 categories beyond SaaS tools:
--   1. Grant Research & Funding
--   2. Learning & Training
--   3. Pro Bono Services
--   4. Advertising & Media Programs
-- Run AFTER initial schema and seed files

-- ============ CATEGORIES ============

INSERT INTO categories (name, slug, description, icon, display_order)
VALUES
  (
    'Grant Research & Funding',
    'grant-research-funding',
    'Databases, directories, and tools to find grants, funders, and funding opportunities for nonprofits',
    '🔍',
    13
  ),
  (
    'Learning & Training',
    'learning-training',
    'Free and discounted courses, webinars, certifications, and professional development for nonprofit staff and boards',
    '📚',
    14
  ),
  (
    'Pro Bono Services',
    'pro-bono-services',
    'Free professional services from skilled volunteers and firms in areas like legal, consulting, marketing, HR, and finance',
    '🤝',
    15
  ),
  (
    'Advertising & Media Programs',
    'advertising-media',
    'Free advertising credits, media programs, and public awareness opportunities exclusively for nonprofits',
    '📣',
    16
  )
ON CONFLICT (slug) DO NOTHING;


-- ============ TOOLS ============

WITH category_ids AS (
  SELECT id, slug FROM categories
)

-- ============ GRANT RESEARCH & FUNDING ============
INSERT INTO tools (
  name, slug, description, long_description, category_id,
  website_url, logo_url, pricing_model, nonprofit_deal,
  features, tags, is_verified, is_featured, created_at
)

SELECT 'Candid (Foundation Directory)', 'candid-foundation-directory',
  'The gold-standard database for finding U.S. foundation grants, corporate giving programs, and 990 data',
  'Candid (formerly Foundation Center + GuideStar) is the most comprehensive source for grant research. Foundation Directory Online indexes 140,000+ U.S. foundations, their giving priorities, and past grants. The full database is free to access at 1,200+ public libraries and Candid Community partner locations — no subscription needed. Nonprofits can also access limited free searches and 990 data directly on the Candid website.',
  cat.id, 'https://candid.org', 'https://www.google.com/s2/favicons?domain=candid.org&sz=128',
  'freemium'::pricing_model, 'Full database free at 1,200+ public libraries and community foundations nationwide; limited free searches available online',
  '["Foundation Search","Grant History","990 Data","Funder Profiles","Giving Trends","RFP Alerts"]'::jsonb,
  ARRAY['grants','foundations','funding','research','990'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'grant-research-funding'

UNION ALL SELECT 'Grants.gov', 'grants-gov',
  'The official U.S. government portal for finding and applying to federal grant opportunities',
  'Grants.gov is the single access point for over 1,000 grant programs from 26 federal grant-making agencies, representing hundreds of billions of dollars in funding. Nonprofits can search opportunities by category, agency, or eligibility, and submit applications directly through the platform. Registration and use are completely free.',
  cat.id, 'https://grants.gov', 'https://www.google.com/s2/favicons?domain=grants.gov&sz=128',
  'free'::pricing_model, '100% free — official U.S. government grant portal open to all eligible nonprofits',
  '["Federal Grant Search","Application Submission","Grant Alerts","Eligibility Filters","Agency Directory","Grant Forecasts"]'::jsonb,
  ARRAY['grants','federal','government','funding','free'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'grant-research-funding'

UNION ALL SELECT 'ProPublica Nonprofit Explorer', 'propublica-nonprofit-explorer',
  'Free database of 2.9 million nonprofit 990 tax filings for researching organizations and funders',
  'ProPublica Nonprofit Explorer is a completely free tool that provides access to IRS Form 990 filings for over 2.9 million nonprofit organizations. Nonprofits use it to research potential funders, understand a foundation''s giving patterns, review financials of peer organizations, and find key personnel. No login required.',
  cat.id, 'https://projects.propublica.org/nonprofits', 'https://www.google.com/s2/favicons?domain=propublica.org&sz=128',
  'free'::pricing_model, '100% free — no account required to search or download 990 filings',
  '["990 Search","Financial Data","Executive Compensation","Giving History","Organization Search","Bulk Data Downloads"]'::jsonb,
  ARRAY['990','irs','tax-filings','funder-research','free'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'grant-research-funding'

UNION ALL SELECT 'Philanthropy News Digest (PND)', 'philanthropy-news-digest',
  'Free daily news and curated RFP listings from foundations and corporations seeking nonprofit partners',
  'Philanthropy News Digest (PND), published by Candid, is a free daily online publication that covers philanthropic news, foundation announcements, and RFPs (Requests for Proposals). The RFPdb section is one of the most valuable free grant-finding tools available — it lists active funding opportunities from foundations and corporations, searchable by subject area and region. No subscription required.',
  cat.id, 'https://philanthropynewsdigest.org', 'https://www.google.com/s2/favicons?domain=philanthropynewsdigest.org&sz=128',
  'free'::pricing_model, '100% free — includes RFP listings, news, and job postings for the nonprofit sector',
  '["RFP Listings","Philanthropic News","Foundation Announcements","Job Postings","Newsletter","Subject Filters"]'::jsonb,
  ARRAY['grants','rfp','funding','news','foundations','free'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'grant-research-funding'

UNION ALL SELECT 'GrantWatch', 'grantwatch',
  'Searchable grant database with thousands of active opportunities for nonprofits, government, and individuals',
  'GrantWatch is a searchable database of active grants from federal, state, local, and foundation sources. It covers grants for nonprofits, individuals, businesses, and government agencies across hundreds of categories. A free account gives limited daily searches; a subscription unlocks full access with grant alerts and application deadlines.',
  cat.id, 'https://www.grantwatch.com', 'https://www.google.com/s2/favicons?domain=grantwatch.com&sz=128',
  'freemium'::pricing_model, 'Free limited searches; nonprofit membership discounts available; free trial for new organizations',
  '["Grant Search","Grant Alerts","Application Deadlines","Category Filters","State & Federal Grants","Foundation Grants"]'::jsonb,
  ARRAY['grants','funding','database','nonprofit','search'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'grant-research-funding'

-- ============ LEARNING & TRAINING ============

UNION ALL SELECT 'NonprofitReady', 'nonprofitready',
  'Free online learning platform with 500+ courses built specifically for nonprofit professionals',
  'NonprofitReady is a free online professional development platform exclusively for nonprofit staff, volunteers, and board members. It offers 500+ free courses across fundraising, grant writing, leadership, finance, marketing, and more. Courses are self-paced and certificate-eligible. Over 600,000 nonprofit professionals have used the platform.',
  cat.id, 'https://www.nonprofitready.org', 'https://www.google.com/s2/favicons?domain=nonprofitready.org&sz=128',
  'free'::pricing_model, '100% free for all nonprofit staff, volunteers, and board members — no payment required',
  '["500+ Free Courses","Fundraising Training","Grant Writing","Leadership Development","Finance & Accounting","Certificates"]'::jsonb,
  ARRAY['training','education','courses','free','professional-development','fundraising'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'learning-training'

UNION ALL SELECT 'Candid Learning', 'candid-learning',
  'Free courses, webinars, and resources from Candid on fundraising, grant writing, and nonprofit management',
  'Candid Learning provides free and low-cost training for nonprofit professionals. Offerings include live webinars, on-demand courses, grant writing workshops, and a searchable knowledge base covering topics from starting a nonprofit to advanced fundraising strategy. Many sessions are completely free; others are offered on a sliding scale.',
  cat.id, 'https://learning.candid.org', 'https://www.google.com/s2/favicons?domain=candid.org&sz=128',
  'free'::pricing_model, 'Many courses and webinars are free; sliding-scale pricing available for all others',
  '["Live Webinars","On-Demand Courses","Grant Writing Workshops","Knowledge Base","Nonprofit Startup Guides","Certificates"]'::jsonb,
  ARRAY['training','webinars','grant-writing','education','nonprofit','free'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'learning-training'

UNION ALL SELECT 'Nonprofit Learning Lab', 'nonprofit-learning-lab',
  'Free live webinars and recorded sessions on fundraising, data, DEI, and nonprofit leadership',
  'Nonprofit Learning Lab offers free live webinars led by nonprofit practitioners and consultants. Topics span fundraising, data analytics, diversity equity and inclusion, leadership, and communications. All live sessions include Q&A and are free to attend. Recordings are available to members.',
  cat.id, 'https://www.nonprofitlearninglab.org', 'https://www.google.com/s2/favicons?domain=nonprofitlearninglab.org&sz=128',
  'freemium'::pricing_model, 'Live webinars are free to attend; membership unlocks recorded sessions and additional resources',
  '["Free Live Webinars","Expert-Led Sessions","Q&A Access","Fundraising Training","DEI Resources","Leadership Development"]'::jsonb,
  ARRAY['training','webinars','free','dei','fundraising','leadership'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'learning-training'

UNION ALL SELECT 'CharityHowTo', 'charityhowto',
  'On-demand webinar training platform for nonprofit professionals covering grants, fundraising, and operations',
  'CharityHowTo offers a large library of live and recorded webinars for nonprofit professionals. Topics include grant writing, individual giving, major gifts, board development, and nonprofit marketing. Some sessions are free; others are available individually or through an affordable subscription. Free webinars are offered regularly.',
  cat.id, 'https://www.charityhowto.com', 'https://www.google.com/s2/favicons?domain=charityhowto.com&sz=128',
  'freemium'::pricing_model, 'Regular free webinars available; subscription plans for full library access; individual recordings purchasable',
  '["Grant Writing Webinars","Fundraising Training","Board Development","Major Gifts","Marketing","On-Demand Library"]'::jsonb,
  ARRAY['training','webinars','grant-writing','fundraising','nonprofit'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'learning-training'

UNION ALL SELECT 'Google for Nonprofits Training', 'google-for-nonprofits-training',
  'Free training resources and certification programs from Google to help nonprofits use technology effectively',
  'Google for Nonprofits offers free access to Google Workspace, Ad Grants, YouTube, and Maps tools — plus a rich library of training resources and Skillshop certification courses. Topics include Google Analytics, Google Ads, Google Workspace administration, data studio, and YouTube for nonprofits. All training is free for enrolled nonprofits.',
  cat.id, 'https://www.google.com/nonprofits', 'https://www.google.com/s2/favicons?domain=google.com&sz=128',
  'free'::pricing_model, 'Free for all nonprofits enrolled in the Google for Nonprofits program (501(c)(3) required)',
  '["Google Workspace Training","Google Analytics","Google Ads Certification","YouTube Training","Data Studio","Skillshop Courses"]'::jsonb,
  ARRAY['training','google','certification','free','analytics','ads'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'learning-training'

-- ============ PRO BONO SERVICES ============

UNION ALL SELECT 'Taproot Foundation', 'taproot-foundation',
  'Connects nonprofits with skilled professionals who donate expertise in marketing, HR, finance, strategy, and tech',
  'Taproot Foundation is a national nonprofit that connects social-sector organizations with business professionals who donate their expertise pro bono. Through the Taproot Plus platform, nonprofits can post service requests and be matched with volunteers across marketing, HR, finance, strategy, IT, and legal. The platform is completely free for nonprofits.',
  cat.id, 'https://taprootfoundation.org', 'https://www.google.com/s2/favicons?domain=taprootfoundation.org&sz=128',
  'free'::pricing_model, 'Completely free for nonprofits — post projects and get matched with skilled pro bono professionals',
  '["Marketing Support","HR Consulting","Finance & Accounting","Strategy Consulting","IT & Technology","Legal Services"]'::jsonb,
  ARRAY['pro-bono','volunteers','consulting','free','marketing','hr','finance'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'pro-bono-services'

UNION ALL SELECT 'Catchafire', 'catchafire',
  'Skills-based volunteer platform matching nonprofits with professionals for short-term pro bono projects',
  'Catchafire matches nonprofits with skilled professionals for time-limited pro bono projects. Volunteers donate their expertise in areas like graphic design, web development, financial planning, video production, strategic planning, and more. Nonprofits post a project or request; Catchafire matches them with vetted professionals. Many foundation partners subsidize access for their grantees at no cost.',
  cat.id, 'https://www.catchafire.org', 'https://www.google.com/s2/favicons?domain=catchafire.org&sz=128',
  'freemium'::pricing_model, 'Free for nonprofits subsidized by foundation partners; otherwise membership plans available; always free to browse',
  '["Design Projects","Web Development","Financial Planning","Video Production","Strategic Planning","Writing & Editing"]'::jsonb,
  ARRAY['pro-bono','volunteers','design','consulting','nonprofit','skills'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'pro-bono-services'

UNION ALL SELECT 'Compass Pro Bono', 'compass-pro-bono',
  'Free strategic consulting for nonprofits from teams of experienced business professionals',
  'Compass Pro Bono provides free, in-depth strategic consulting engagements to nonprofits. Teams of experienced business professionals are matched with nonprofits for multi-month consulting projects addressing strategic planning, financial sustainability, organizational effectiveness, and program evaluation. Projects typically span 3–6 months and are completely free.',
  cat.id, 'https://compassprobono.org', 'https://www.google.com/s2/favicons?domain=compassprobono.org&sz=128',
  'free'::pricing_model, '100% free — multi-month strategic consulting engagements at no cost to nonprofits',
  '["Strategic Planning","Financial Sustainability","Organizational Design","Program Evaluation","Board Development","Multi-Month Engagements"]'::jsonb,
  ARRAY['pro-bono','consulting','strategy','free','planning'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'pro-bono-services'

UNION ALL SELECT 'SCORE', 'score',
  'Free business mentoring and workshops from retired executives and entrepreneurs for nonprofits and small businesses',
  'SCORE is a nonprofit resource partner of the SBA that provides free, confidential mentoring and education to small businesses and nonprofits. Volunteers are retired executives, entrepreneurs, and business professionals. Nonprofits can get one-on-one mentoring on financial planning, marketing, operations, and leadership — all at no cost.',
  cat.id, 'https://www.score.org', 'https://www.google.com/s2/favicons?domain=score.org&sz=128',
  'free'::pricing_model, 'Free mentoring, workshops, and business resources for nonprofits — SBA resource partner',
  '["One-on-One Mentoring","Business Planning","Financial Guidance","Marketing Help","Free Workshops","Online Resources"]'::jsonb,
  ARRAY['mentoring','pro-bono','business','free','coaching','planning'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'pro-bono-services'

UNION ALL SELECT 'Law School Clinics & Bar Pro Bono', 'law-school-bar-pro-bono',
  'Free legal services for nonprofits through law school clinics and local bar association pro bono programs',
  'Many law school clinics and bar association pro bono programs provide free legal assistance to nonprofits, covering areas like incorporation, 501(c)(3) status, employment law, contract review, intellectual property, real estate, and corporate governance. Organizations like Lawyers Clearinghouse and the National Association of Pro Bono Professionals can connect nonprofits to local legal help.',
  cat.id, 'https://lawyersclearinghouse.org', 'https://www.google.com/s2/favicons?domain=lawyersclearinghouse.org&sz=128',
  'free'::pricing_model, 'Free legal services for qualifying nonprofits — availability varies by location and specialty',
  '["Incorporation","501(c)(3) Filing","Employment Law","Contract Review","Intellectual Property","Corporate Governance"]'::jsonb,
  ARRAY['legal','pro-bono','free','law','contracts','nonprofit'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'pro-bono-services'

-- ============ ADVERTISING & MEDIA PROGRAMS ============

UNION ALL SELECT 'Google Ad Grants', 'google-ad-grants',
  '$10,000/month in free Google Search advertising for eligible 501(c)(3) nonprofits',
  'Google Ad Grants gives eligible nonprofits up to $10,000 USD per month — $120,000 per year — in free Google Search advertising. Ads appear on Google Search when people look for topics related to the nonprofit''s mission, driving traffic, donations, volunteer sign-ups, and awareness. Nonprofits must maintain a 5% click-through rate and link to a quality website. The program has supported 115,000+ nonprofits since 2003.',
  cat.id, 'https://www.google.com/grants', 'https://www.google.com/s2/favicons?domain=google.com&sz=128',
  'free'::pricing_model, '$10,000/month in free Google Search ad credits — up to $120,000/year for eligible 501(c)(3) organizations',
  '["$10K/Month Ad Credit","Google Search Ads","Keyword Targeting","Donor Acquisition","Volunteer Recruitment","Performance Reporting"]'::jsonb,
  ARRAY['advertising','google','grants','free','search-ads','marketing'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'advertising-media'

UNION ALL SELECT 'Meta for Nonprofits', 'meta-for-nonprofits',
  'Free tools and ad credits from Meta (Facebook & Instagram) to help nonprofits fundraise and reach supporters',
  'Meta for Nonprofits provides eligible nonprofits with fundraising tools on Facebook and Instagram, including donation buttons, fundraiser creation, and peer-to-peer fundraising — all with no platform fee. Meta also periodically offers ad credits and runs matching campaigns. Nonprofits can connect with millions of potential donors on the world''s largest social platforms.',
  cat.id, 'https://www.facebook.com/nonprofits', 'https://www.google.com/s2/favicons?domain=facebook.com&sz=128',
  'free'::pricing_model, 'Zero platform fees on donations; free fundraising tools; periodic ad credits and matching campaigns',
  '["Donation Buttons","Facebook Fundraisers","Instagram Giving","Peer-to-Peer","No Platform Fees","Matching Campaigns"]'::jsonb,
  ARRAY['advertising','facebook','instagram','social-media','fundraising','free'], true, true, NOW()
FROM category_ids cat WHERE cat.slug = 'advertising-media'

UNION ALL SELECT 'YouTube Nonprofit Program', 'youtube-nonprofit-program',
  'Free tools for nonprofits on YouTube including donation cards, live fundraising, and creator support',
  'The YouTube Nonprofit Program gives eligible nonprofits special features to amplify their mission and raise funds directly on YouTube. Features include donation cards on videos and livestreams, the ability to add a giving button, access to YouTube Giving features, and dedicated creator support. YouTube also waives the 30% fee it normally charges on Super Chats for nonprofit fundraising streams.',
  cat.id, 'https://support.google.com/youtube/answer/9457362', 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
  'free'::pricing_model, 'Free program for eligible nonprofits — includes donation cards, live fundraising tools, and no fee on Super Chats',
  '["Donation Cards","Live Fundraising","Giving Button","Creator Support","Fee Waiver","YouTube Studio Access"]'::jsonb,
  ARRAY['advertising','youtube','video','fundraising','free','streaming'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'advertising-media'

UNION ALL SELECT 'Spotify Ad Studio for Nonprofits', 'spotify-ad-studio-nonprofits',
  'Free audio and video ad campaigns on Spotify for registered nonprofits through the Ad Studio program',
  'Spotify Ad Studio offers registered nonprofits free or heavily discounted audio and video advertising on Spotify. Nonprofits can reach targeted audiences based on age, location, interests, and listening habits. Spotify provides free ad creation tools including a script writer and AI voice generation, making it accessible without a creative agency.',
  cat.id, 'https://ads.spotify.com', 'https://www.google.com/s2/favicons?domain=spotify.com&sz=128',
  'nonprofit_discount'::pricing_model, 'Free ad credits and discounted campaigns for registered nonprofits through Spotify Ad Studio',
  '["Audio Ads","Video Ads","Audience Targeting","Free Ad Creation","AI Voice Generation","Campaign Reporting"]'::jsonb,
  ARRAY['advertising','spotify','audio','marketing','nonprofit'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'advertising-media'

UNION ALL SELECT 'Microsoft Advertising for Nonprofits', 'microsoft-advertising-nonprofits',
  'Free Bing search ad credits for nonprofits through the Microsoft Advertising for Nonprofits program',
  'Microsoft Advertising for Nonprofits (formerly Bing Ads for Nonprofits) provides eligible nonprofits with free advertising credits on the Microsoft Search Network, which includes Bing, Yahoo, AOL, and partner sites. The program offers up to $3,000/month in free search ad credits. Nonprofits can reach audiences that may not be captured by Google Search alone.',
  cat.id, 'https://about.ads.microsoft.com/en/resources/tools/microsoft-advertising-for-nonprofits', 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=128',
  'free'::pricing_model, 'Up to $3,000/month in free Microsoft Search Network ad credits for eligible nonprofits',
  '["Bing Search Ads","Yahoo & AOL Network","$3K/Month Credits","Keyword Targeting","Audience Targeting","Performance Reports"]'::jsonb,
  ARRAY['advertising','bing','microsoft','search-ads','free','marketing'], true, false, NOW()
FROM category_ids cat WHERE cat.slug = 'advertising-media';
