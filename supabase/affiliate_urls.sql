-- Affiliate URLs for tools
-- ============================================================
-- INSTRUCTIONS:
-- 1. Sign up for each affiliate program listed below (links in comments)
-- 2. Get your unique tracking link from the affiliate dashboard
-- 3. Replace the placeholder URL with your tracking link
-- 4. Run this SQL in Supabase SQL Editor
-- ============================================================

-- -------------------------------------------------------
-- MONDAY.COM
-- Sign up: https://monday.com/affiliate
-- Network: Impact.com | Commission: up to 100% first-year revenue
-- Your tracking link will look like: https://monday.com/?ref=YOUR_ID
-- -------------------------------------------------------
UPDATE tools SET affiliate_url = 'https://monday.com/affiliate'
WHERE slug = 'monday-com';

-- -------------------------------------------------------
-- HUBSPOT CRM
-- Sign up: https://www.hubspot.com/partners/affiliates
-- Network: Impact.com | Commission: 30% recurring for 12 months
-- Your tracking link will look like: https://hubspot.com/?via=YOUR_ID
-- -------------------------------------------------------
UPDATE tools SET affiliate_url = 'https://www.hubspot.com/partners/affiliates'
WHERE slug = 'hubspot-crm';

-- -------------------------------------------------------
-- CLICKUP
-- Sign up: https://clickup.partnerstack.com
-- Network: PartnerStack | Commission: $25/signup or 25% recurring
-- Your tracking link will look like: https://clickup.com/?fp_ref=YOUR_ID
-- -------------------------------------------------------
UPDATE tools SET affiliate_url = 'https://clickup.partnerstack.com'
WHERE slug = 'clickup';

-- -------------------------------------------------------
-- WIX FOR NONPROFITS
-- Sign up: https://www.wix.com/upgrade/website-affiliate-program
-- Commission: $100 per premium referral
-- Your tracking link provided after signup
-- -------------------------------------------------------
UPDATE tools SET affiliate_url = 'https://www.wix.com/upgrade/website-affiliate-program'
WHERE slug = 'wix-for-nonprofits';

-- -------------------------------------------------------
-- SQUARESPACE
-- Sign up: https://www.squarespace.com/affiliates
-- Network: Impact.com | Commission: $100–$200 per referral
-- Your tracking link will look like: https://squarespace.com/?channel=affiliate&subchannel=YOUR_ID
-- -------------------------------------------------------
UPDATE tools SET affiliate_url = 'https://www.squarespace.com/affiliates'
WHERE slug = 'squarespace';

-- -------------------------------------------------------
-- ZOOM
-- Sign up: https://explore.zoom.us/en/partner/
-- Network: Impact.com | Commission: varies by product
-- Your tracking link provided after approval
-- -------------------------------------------------------
UPDATE tools SET affiliate_url = 'https://explore.zoom.us/en/partner/'
WHERE slug = 'zoom';

-- -------------------------------------------------------
-- AIRTABLE
-- Sign up: https://airtable.com/partners
-- Commission: revenue share on referred accounts
-- -------------------------------------------------------
UPDATE tools SET affiliate_url = 'https://airtable.com/partners'
WHERE slug = 'airtable';

-- -------------------------------------------------------
-- WEBFLOW
-- Sign up: https://webflow.com/partners
-- Commission: 50% first year of subscription
-- -------------------------------------------------------
UPDATE tools SET affiliate_url = 'https://webflow.com/partners'
WHERE slug = 'webflow';

-- -------------------------------------------------------
-- NOTION
-- Sign up: https://www.notion.com/affiliates
-- Commission: 50% for 12 months (currently waitlisted — check periodically)
-- -------------------------------------------------------
UPDATE tools SET affiliate_url = 'https://www.notion.com/affiliates'
WHERE slug = 'notion';

-- -------------------------------------------------------
-- FRESHDESK / FRESHWORKS
-- Sign up: https://www.freshworks.com/partners/affiliate/
-- Commission: varies
-- -------------------------------------------------------
-- UPDATE tools SET affiliate_url = 'YOUR_FRESHWORKS_TRACKING_LINK'
-- WHERE slug = 'freshdesk';

-- -------------------------------------------------------
-- MAILERLITE
-- Sign up: https://www.mailerlite.com/affiliate-program
-- Commission: 30% recurring for life
-- -------------------------------------------------------
UPDATE tools SET affiliate_url = 'https://www.mailerlite.com/affiliate-program'
WHERE slug = 'mailerlite';
