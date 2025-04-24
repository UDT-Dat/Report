# Google OAuth Integration Guide

This guide explains how to set up Google OAuth for user registration and login in the application.

## Prerequisites

- A Google Cloud Platform account
- Access to the Google Cloud Console

## Steps to Configure Google OAuth

1. **Create a Google Cloud Project**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Configure OAuth Consent Screen**
   - In the sidebar, navigate to "APIs & Services" > "OAuth consent screen"
   - Select "External" user type if this is a public application
   - Fill in required information (app name, support email, developer contact information)
   - Add scopes for email and profile
   - Save and continue

3. **Create OAuth Client ID**
   - In the sidebar, navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" and select "OAuth client ID"
   - Select "Web application" as the application type
   - Add a name for your OAuth client
   - Add authorized JavaScript origins (e.g., `http://localhost:3000` for local development)
   - Add authorized redirect URIs:
     - For local development: `http://localhost:3000/api/auth/google/callback`
     - For production: `https://your-domain.com/api/auth/google/callback`
   - Click "Create"
   - Note down the Client ID and Client Secret

4. **Configure Environment Variables**
   - Add the following variables to your `.env` file:
   ```
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
   ```
   - For production, set the callback URL to your production domain

5. **User Registration and Login Flow**
   - When a user clicks "Sign in with Google":
     - If it's their first time, they will be registered automatically (REGISTRATION)
     - If they've used Google auth before, they will simply log in (LOGIN)
   - All users registered through Google will have ACTIVE status automatically
   - Start your application and navigate to `/api/auth/google` to test

## Troubleshooting

- Make sure the callback URL in your Google Cloud Console exactly matches the callback URL in your environment variables
- Ensure you've enabled the "Google+ API" or "Google People API" in your Google Cloud Project
- Check your server logs for detailed error messages if the OAuth flow fails 