# Firebase Migration Guide

## Setup Steps

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select existing project
3. Enter project name (e.g., "Jeng")
4. Accept defaults and create

### 2. Get Firebase Service Account Credentials
1. In Firebase Console, click **Settings** (⚙️) → **Project settings**
2. Go to **Service Accounts** tab
3. Click **Generate New Private Key**
4. Save the JSON file securely
5. Extract these values and add to `.env.local`:
   ```
   FIREBASE_PROJECT_ID: value of "project_id"
   FIREBASE_PRIVATE_KEY: value of "private_key" (keep the \n escape sequences)
   FIREBASE_CLIENT_EMAIL: value of "client_email"
   ```

### 3. Enable Firestore Database
1. In Firebase Console, go to **Firestore Database** (left sidebar)
2. Click **Create database**
3. Choose region (closest to your users) and start in **Production mode**
4. Firestore is now ready!

### 4. Set Firestore Security Rules (Development)
1. Go to **Firestore Database** → **Rules** tab
2. Replace with:
   ```firestore
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
3. Publish rules
   
   **⚠️ For production, use more restrictive rules!**

### 5. Update Environment Variables
Edit `.env.local` and fill in your Firebase credentials:
```env
FIREBASE_PROJECT_ID=your-project-id-here
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
```

### 6. Test the Connection
Run the dev server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and test signup/login.

## Collections Created Automatically

Better Auth will create these Firestore collections on first use:
- **users** - User accounts
- **sessions** - Active sessions
- **accounts** - OAuth provider links
- **verifications** - Email/password verification codes

## Removing MySQL Setup Scripts (Optional)

Once you've verified everything works, you can delete MySQL-related files:
```bash
rm setup-db.js setup-auth-tables.js create-tables.js
```

## Troubleshooting

**Error: "firebase-admin not initialized"**
- Check that `.env.local` has all three Firebase variables correctly filled

**Error: "Permission denied"**
- Verify Firestore security rules allow your app
- Check `BETTER_AUTH_SECRET` is set correctly

**Error: "PrivateKey format invalid"**
- Ensure `FIREBASE_PRIVATE_KEY` includes literal `\n` characters (not actual line breaks)
- Example: `-----BEGIN PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END PRIVATE KEY-----\n`

## Next Steps

- Update Google OAuth redirect URIs in Google Cloud Console to use correct domain
- Set up email verification (requires email service integration)
- Review Firestore security rules for production
