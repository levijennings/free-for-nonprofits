-- Fix logo URLs with reliable direct CDN / Wikipedia thumbnail URLs
-- These are tested working URLs that allow cross-origin image loading

UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/200px-Salesforce.com_logo.svg.png' WHERE slug = 'salesforce-nonprofit-cloud';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/HubSpot_Logo.svg/200px-HubSpot_Logo.svg.png' WHERE slug = 'hubspot-crm';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Mailchimp_Freddie_Icon.svg/200px-Mailchimp_Freddie_Icon.svg.png' WHERE slug = 'mailchimp';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png' WHERE slug = 'google-workspace-nonprofits';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png' WHERE slug = 'google-ad-grants';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png' WHERE slug = 'google-analytics';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/200px-Slack_icon_2019.svg.png' WHERE slug = 'slack';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Octicons-mark-github.svg/200px-Octicons-mark-github.svg.png' WHERE slug = 'github-nonprofits';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/200px-Notion-logo.svg.png' WHERE slug = 'notion';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Trello_Logo.svg/200px-Trello_Logo.svg.png' WHERE slug = 'trello';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Zoom_Communications_Logo.svg/200px-Zoom_Communications_Logo.svg.png' WHERE slug = 'zoom';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Notion_app_logo.png/200px-Notion_app_logo.png' WHERE slug = 'notion';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/200px-Amazon_logo.svg.png' WHERE slug = 'aws-nonprofit-credits';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopify_logo_2018.svg/200px-Shopify_logo_2018.svg.png' WHERE slug = 'shopify-nonprofit';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/200px-Stripe_Logo%2C_revised_2016.svg.png' WHERE slug = 'stripe';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/200px-PayPal.svg.png' WHERE slug = 'paypal';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Asana_logo.svg/200px-Asana_logo.svg.png' WHERE slug = 'asana';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Canva_Logo.svg/200px-Canva_Logo.svg.png' WHERE slug = 'canva';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Figma-logo.svg/200px-Figma-logo.svg.png' WHERE slug = 'figma';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Adobe_logo_%282017%29.svg/200px-Adobe_logo_%282017%29.svg.png' WHERE slug = 'adobe-creative-cloud';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/200px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png' WHERE slug = 'microsoft-365-nonprofits';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Google_Drive_icon_%282020%29.svg/200px-Google_Drive_icon_%282020%29.svg.png' WHERE slug = 'google-drive';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Logo_of_YouTube_%282015-2017%29.svg/200px-Logo_of_YouTube_%282015-2017%29.svg.png' WHERE slug = 'youtube-nonprofit';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/200px-Instagram_icon.png' WHERE slug = 'instagram';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/200px-Facebook_Logo_%282019%29.png' WHERE slug = 'facebook';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Twitter-logo.svg/200px-Twitter-logo.svg.png' WHERE slug = 'twitter';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/200px-LinkedIn_logo_initials.png' WHERE slug = 'linkedin';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Dropbox_logo_2017.svg/200px-Dropbox_logo_2017.svg.png' WHERE slug = 'dropbox';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Zendesk_Logo.svg/200px-Zendesk_Logo.svg.png' WHERE slug = 'zendesk-nonprofits';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Airtable_Logo.svg/200px-Airtable_Logo.svg.png' WHERE slug = 'airtable';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Twilio-logo-red.svg/200px-Twilio-logo-red.svg.png' WHERE slug = 'twilio-for-good';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Atlassian_Logo.svg/200px-Atlassian_Logo.svg.png' WHERE slug = 'atlassian-nonprofit';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Hootsuite_Logo.svg/200px-Hootsuite_Logo.svg.png' WHERE slug = 'hootsuite';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Tableau_Logo.png/200px-Tableau_Logo.png' WHERE slug = 'tableau';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/WordPress-Logo.svg/200px-WordPress-Logo.svg.png' WHERE slug = 'wordpress';
UPDATE tools SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/QuickBooks_Logo.svg/200px-QuickBooks_Logo.svg.png' WHERE slug = 'quickbooks-nonprofit';

-- For tools without a specific update, use Google Favicon via website_url domain as a good fallback
-- (The ToolLogo component will handle this automatically at display time)
