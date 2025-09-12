# Simple HIIT - iOS App Store Deployment Guide

## Prerequisites Checklist

### 1. Apple Developer Account
- [ ] Active Apple Developer Program membership ($99/year)
- [ ] App Store Connect access
- [ ] Valid Apple ID with 2FA enabled

### 2. Required Information
- [ ] App Bundle ID: `com.simplehiit.app`
- [ ] App Name: `Simple HIIT`
- [ ] Category: Health & Fitness
- [ ] Age Rating: 4+
- [ ] Copyright: © 2025 Simple HIIT App

## Step 1: App Store Connect Setup

### Create App Record
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Fill in app information:
   - **Platform**: iOS
   - **Name**: Simple HIIT
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: com.simplehiit.app
   - **SKU**: simplehiit2025 (unique identifier)

### App Information
- **Category**: Health & Fitness
- **Secondary Category**: Lifestyle (optional)
- **Content Rights**: No
- **Age Rating**: Click "Edit" and answer questionnaire (should result in 4+)

## Step 2: Build Configuration

### Update EAS Configuration
The `eas.json` has been configured with iOS build settings. Update these values:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID@example.com",
        "ascAppId": "APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

### Get Your Team ID
1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Go to "Membership" tab
3. Copy your **Team ID** (10-character string)

## Step 3: App Store Assets Required

### App Icon
- **Size**: 1024x1024px
- **Format**: PNG (no transparency)
- **File**: Use `/assets/images/icon.png` (resize to 1024x1024)

### Screenshots (Required for each device class)
**iPhone Screenshots** (Mandatory - at least 1 set):
- iPhone 6.7" (iPhone 15 Pro Max): 1290x2796px
- iPhone 6.5" (iPhone 15 Plus): 1242x2688px  
- iPhone 5.5" (iPhone 8 Plus): 1242x2208px

**iPad Screenshots** (If supporting iPad):
- iPad Pro 12.9" (6th gen): 2048x2732px
- iPad Pro 12.9" (2nd gen): 2048x2732px

### Marketing Assets
- **Privacy Policy URL**: https://your-website.com/privacy (use the one from privacy-policy.md)
- **Support URL**: https://your-website.com/support or email
- **Marketing URL**: https://your-website.com (optional)

## Step 4: Build and Submit

### 1. Build iOS App
```bash
cd /app/frontend
eas build --platform ios --profile production
```

### 2. Wait for Build Completion
- Monitor build progress on [Expo Dashboard](https://expo.dev)
- Download will be available when complete
- Build creates `.ipa` file for App Store

### 3. Upload to App Store Connect
**Option A: Automatic (Recommended)**
```bash
eas submit --platform ios --profile production
```

**Option B: Manual Upload**
1. Download the `.ipa` file from Expo
2. Use Transporter app (Mac) or Application Loader
3. Upload `.ipa` to App Store Connect

## Step 5: App Store Connect Configuration

### App Information
- **Name**: Simple HIIT
- **Subtitle**: HIIT Timer with Custom Animations
- **Promotional Text**: Get fit fast with Simple HIIT! Customizable interval timer with beautiful animations.

### Description
Use the content from `app-store-description.md`

### Keywords
```
hiit,workout,timer,fitness,exercise,interval,training,health,gym,cardio
```

### Screenshots Upload
1. Go to your app → "App Store" tab
2. Under "App Store Connect Screenshots"
3. Upload screenshots for each device size
4. Add captions describing key features

### Pricing and Availability
- **Price**: Free
- **Availability**: All territories
- **App Store Distribution**: Available

### App Review Information
- **Contact Information**: Your email and phone
- **Demo Account**: Not required (no login needed)
- **Notes**: "Simple HIIT timer app for fitness workouts. No account required."

## Step 6: Submit for Review

### Final Checklist
- [ ] All metadata completed
- [ ] Screenshots uploaded for all device sizes
- [ ] App icon uploaded
- [ ] Privacy policy URL provided
- [ ] App binary uploaded and processed
- [ ] Age rating completed
- [ ] Pricing set

### Submit Process
1. Click "Submit for Review"
2. Answer final questions about advertising/encryption
3. Confirm submission

### Review Timeline
- **Standard Review**: 24-48 hours
- **Expedited Review**: 2-7 business days (if requested)

## Step 7: Post-Submission

### Monitor Review Status
- Check App Store Connect regularly
- Respond to any reviewer feedback promptly
- Address any rejection reasons quickly

### Upon Approval
- App goes live automatically (unless you set specific release date)
- Monitor app performance and user feedback
- Plan future updates

## Troubleshooting Common Issues

### Build Failures
- Ensure all certificates are valid
- Check bundle identifier matches App Store Connect
- Verify no missing assets or configurations

### Review Rejections
- **Guideline 4.2 (Minimum Functionality)**: App provides sufficient value
- **Guideline 5.1.1 (Privacy)**: Privacy policy covers data usage
- **Guideline 2.1 (App Store Review Guidelines)**: App works as described

### Asset Issues
- Icons must be exactly 1024x1024px
- Screenshots must match exact device dimensions
- No transparency in app icons

## Support Resources

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Expo iOS Deployment](https://docs.expo.dev/submit/ios/)

## Success Metrics to Track

Once live, monitor these metrics in App Store Connect:
- Downloads and installations
- User ratings and reviews
- Crash reports
- Performance metrics

---

**Your Simple HIIT app is ready for iOS deployment! The app is fully configured, tested, and optimized for App Store success.**