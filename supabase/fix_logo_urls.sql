-- Fix logo URLs: replace unreliable favicon/CDN URLs with Clearbit Logo API
-- Clearbit provides clean, high-res square logos for any domain

UPDATE tools SET logo_url = 'https://logo.clearbit.com/salesforce.com' WHERE slug = 'salesforce-nonprofit-cloud';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/hubspot.com' WHERE slug = 'hubspot-crm';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/mailchimp.com' WHERE slug = 'mailchimp';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/donorbox.org' WHERE slug = 'donorbox';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/google.com' WHERE slug = 'google-workspace-nonprofits';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/google.com' WHERE slug = 'google-ad-grants';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/google.com' WHERE slug = 'google-analytics';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/waveapps.com' WHERE slug = 'wave-accounting';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/quickbooks.intuit.com' WHERE slug = 'quickbooks-nonprofit';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/slack.com' WHERE slug = 'slack';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/zoom.us' WHERE slug = 'zoom';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/notion.so' WHERE slug = 'notion';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/asana.com' WHERE slug = 'asana';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/trello.com' WHERE slug = 'trello';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/basecamp.com' WHERE slug = 'basecamp';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/figma.com' WHERE slug = 'figma';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/canva.com' WHERE slug = 'canva';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/adobe.com' WHERE slug = 'adobe-creative-cloud';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/stripe.com' WHERE slug = 'stripe';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/paypal.com' WHERE slug = 'paypal';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/givelively.org' WHERE slug = 'give-lively';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/classy.org' WHERE slug = 'classy';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/wordpress.com' WHERE slug = 'wordpress';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/wix.com' WHERE slug = 'wix';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/squarespace.com' WHERE slug = 'squarespace';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/hootsuite.com' WHERE slug = 'hootsuite';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/buffer.com' WHERE slug = 'buffer';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/mailerlite.com' WHERE slug = 'mailerlite';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/constantcontact.com' WHERE slug = 'constant-contact';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/typeform.com' WHERE slug = 'typeform';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/surveymonkey.com' WHERE slug = 'surveymonkey';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/dropbox.com' WHERE slug = 'dropbox';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/box.com' WHERE slug = 'box';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/zendesk.com' WHERE slug = 'zendesk-nonprofits';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/freshdesk.com' WHERE slug = 'freshdesk';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/loom.com' WHERE slug = 'loom';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/miro.com' WHERE slug = 'miro';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/discord.com' WHERE slug = 'discord';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/twilio.com' WHERE slug = 'twilio-for-good';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/okta.com' WHERE slug = 'okta-for-good';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/atlassian.com' WHERE slug = 'atlassian-nonprofit';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/github.com' WHERE slug = 'github-nonprofits';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/aws.amazon.com' WHERE slug = 'aws-nonprofit-credits';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/tableau.com' WHERE slug = 'tableau';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/signupgenius.com' WHERE slug = 'signupgenius';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/esri.com' WHERE slug = 'esri-arcgis';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/microsoft.com' WHERE slug = 'microsoft-365-nonprofits';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/airtable.com' WHERE slug = 'airtable';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/monday.com' WHERE slug = 'monday-com';
UPDATE tools SET logo_url = 'https://logo.clearbit.com/clickup.com' WHERE slug = 'clickup';

-- Catch-all: replace any remaining favicon.ico or Wikipedia URLs with Clearbit
UPDATE tools
SET logo_url = 'https://logo.clearbit.com/' ||
  regexp_replace(
    regexp_replace(logo_url, '^https?://(www\.)?', ''),
    '/.*$', ''
  )
WHERE logo_url LIKE '%favicon.ico%'
   OR logo_url LIKE '%wikipedia.org%'
   OR logo_url LIKE '%upload.wikimedia%';
