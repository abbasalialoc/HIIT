# Apple App Store Connect - Complete Form Filling Guide

## STEP 1: Create New App

### Initial App Creation Form
**URL**: https://appstoreconnect.apple.com → My Apps → "+" → New App

| Field | Value | Notes |
|-------|-------|-------|
| **Platforms** | ☑️ iOS | Check iOS only |
| **Name** | `Simple HIIT` | Exactly as you want it to appear |
| **Primary Language** | `English (U.S.)` | Default language |
| **Bundle ID** | `com.simplehiit.app` | Must match your app.json |
| **SKU** | `simplehiit2025` | Internal identifier (your choice) |
| **User Access** | `Full Access` | Default setting |

---

## STEP 2: App Information Tab

### General Information Section

| Field | Value |
|-------|-------|
| **Name** | `Simple HIIT` |
| **Bundle ID** | `com.simplehiit.app` (auto-filled) |
| **Primary Language** | `English (U.S.)` (auto-filled) |
| **Content Rights** | `No` *(you don't have third-party content)* |

### Localizable Information Section

| Field | Value |
|-------|-------|
| **Name** | `Simple HIIT` |
| **Subtitle** | `HIIT Timer with Custom Animations` |
| **Privacy Policy URL** | `https://your-website.com/privacy` *(create from privacy-policy.md)* |

---

## STEP 3: Pricing and Availability Tab

### Price Schedule Section

| Field | Value | Notes |
|-------|-------|-------|
| **Price** | `Free (Tier 0)` | Your app is free |
| **Availability** | `Available in all territories` | Default selection |

### App Distribution Section

| Field | Value |
|-------|-------|
| **App Store** | ☑️ Make this app available on the App Store | Check this |

---

## STEP 4: App Store Tab (Main Content)

### App Store Information Section

| Field | Value |
|-------|-------|
| **Promotional Text** *(170 chars max)* | `Get fit fast with Simple HIIT! Customizable interval timer with beautiful animations. Perfect for home workouts. No ads, no subscriptions - just results!` |
| **Description** | *Copy from app-store-description.md* |
| **Keywords** *(100 chars max)* | `hiit,workout,timer,fitness,exercise,interval,training,health,gym,cardio` |
| **Support URL** | `mailto:feedback@simplehiit.app` *(or your support page)* |
| **Marketing URL** | *(Leave blank or add your website)* |

### Category Section

| Field | Value |
|-------|-------|
| **Primary Category** | `Health & Fitness` |
| **Secondary Category** | `Lifestyle` *(optional)* |

### Rating Section
Click **"Edit"** and answer the questionnaire:

| Question | Answer | Result |
|----------|--------|---------|
| **Cartoon or Fantasy Violence** | No | Age 4+ |
| **Realistic Violence** | No | Age 4+ |
| **Prolonged Graphic Violence** | No | Age 4+ |
| **Profanity or Crude Humor** | No | Age 4+ |
| **Mature/Suggestive Themes** | No | Age 4+ |
| **Horror/Fear Themes** | No | Age 4+ |
| **Medical/Treatment Information** | No | Age 4+ |
| **Alcohol, Tobacco, Drug Use** | No | Age 4+ |
| **Simulated Gambling** | No | Age 4+ |
| **Sexual Content or Nudity** | No | Age 4+ |
| **Graphic Sexual Content** | No | Age 4+ |

**Final Rating**: 4+ *(Perfect for fitness app)*

---

## STEP 5: Version Information

### What's New in This Version
```
Version 1.0.8 - Initial Release

• Customizable HIIT timer with work/rest intervals
• 4 exercise types with beautiful animations  
• Audio countdown beeps and haptic feedback
• Personalized workout settings
• Screen stays awake during workouts
• User feedback system
• No ads, no subscriptions - completely free!

Perfect for home workouts, gym sessions, and quick fitness breaks.
```

### Build Section
- **Build**: *(Select the build uploaded via EAS)*
- **Export Compliance**: `No` *(your app doesn't use encryption)*

---

## STEP 6: App Screenshots & Media

### iPhone Screenshots *(Required)*
Upload screenshots in these exact sizes:

**iPhone 6.7" Display (iPhone 15 Pro Max)**
- **Size**: 1290 x 2796 pixels
- **Required**: At least 1 screenshot
- **Recommended**: 3-5 screenshots showing key features

**Screenshot Ideas:**
1. **Main Timer Screen** - Show the workout in progress
2. **Settings Screen** - Show customization options  
3. **Exercise Animation** - Show one of your balloon animations
4. **Workout Complete** - Show completion screen
5. **Ready to Start** - Show the initial ready state

### iPad Screenshots *(If supporting iPad)*
**iPad Pro 12.9" Display (6th generation)**
- **Size**: 2048 x 2732 pixels
- **Required**: At least 1 screenshot if iPad is supported

### App Preview *(Optional but Recommended)*
- **Video**: 15-30 second demo of your app
- **Shows**: Key features and user flow
- **Format**: .mov, .mp4, or .m4v

---

## STEP 7: App Review Information

### Contact Information
| Field | Value |
|-------|-------|
| **First Name** | `Your First Name` |
| **Last Name** | `Your Last Name` |
| **Phone Number** | `Your Phone Number` |
| **Email Address** | `your-email@example.com` |

### Demo Account *(Not needed for Simple HIIT)*
| Field | Value |
|-------|-------|
| **Demo Account Required** | `No` |
| **Username** | *(Leave blank)* |
| **Password** | *(Leave blank)* |

### Notes
```
Simple HIIT is a fitness timer app for high-intensity interval training. 

Key Features:
- Customizable work/rest intervals (5-60 seconds)
- 4 exercise types with animations
- Audio countdown beeps (works in silent mode)
- Haptic feedback for transitions
- Local storage for user preferences
- No login required, no personal data collected

The app is fully functional without any accounts or external dependencies. All features are accessible immediately upon launch.

Privacy: The app only stores user workout preferences locally on device. No data is transmitted or collected.
```

### Attachment *(Optional)*
Upload additional materials if needed (usually not required for simple apps)

---

## STEP 8: App Store Review Guidelines Compliance

### Before Submitting - Self-Check:

#### ✅ App Store Review Guidelines
- **2.1 App Completeness**: App is fully functional ✅
- **2.2 Beta Testing**: App is production-ready, not beta ✅  
- **2.3 Accurate Metadata**: Description matches functionality ✅
- **4.2 Minimum Functionality**: Provides clear value (fitness timer) ✅
- **5.1.1 Privacy**: Privacy policy covers data usage ✅
- **5.2.1 Data Collection**: Minimal data collection, stored locally ✅

#### ✅ Technical Requirements
- **Performance**: No crashes, fast loading ✅
- **UI Guidelines**: Follows iOS design principles ✅
- **Device Compatibility**: Works on all supported devices ✅
- **iOS Features**: Proper use of audio, haptics, screen wake ✅

---

## STEP 9: Submit for Review

### Final Submission Checklist
- [ ] All metadata fields completed
- [ ] Screenshots uploaded for all device sizes
- [ ] App icon uploaded (1024x1024px)
- [ ] Privacy policy URL working
- [ ] Build selected and processed
- [ ] Age rating completed (4+)
- [ ] Contact information provided
- [ ] Review notes written

### Submit Process
1. **Click "Submit for Review"** (blue button at top right)
2. **Answer Export Compliance**: Select "No" (no encryption)
3. **Answer Advertising Identifier**: Select "No" (no ads or tracking)
4. **Confirm Submission**: Click "Submit"

---

## STEP 10: Post-Submission

### What Happens Next
1. **"Waiting for Review"** status (within 48 hours)
2. **"In Review"** status (24-48 hours review time)
3. **"Pending Developer Release"** or **"Ready for Sale"**

### If Rejected
- Check rejection reasons carefully
- Address all mentioned issues
- Resubmit with fixes
- Response time: Usually 24-48 hours for re-review

### Monitor Your App
- **App Store Connect**: Check status daily
- **TestFlight**: Use for beta testing if needed
- **Analytics**: Monitor downloads and user behavior

---

## QUICK COPY-PASTE VALUES

### App Description (for copy-paste):
```
Transform Your Fitness with Simple HIIT - The Ultimate High-Intensity Interval Training Timer!

Simple HIIT is your perfect workout companion, designed to make high-intensity interval training simple, effective, and engaging. Whether you're a beginner or a fitness enthusiast, our app helps you maximize your workout results in minimal time.

✨ KEY FEATURES:

🎯 Customizable Workouts
• Adjust work and rest intervals (5-60 seconds)
• Set custom number of circuits (1-5)
• Choose sets per exercise (1-10)
• Select from 4 core exercises or create custom routines

🏃‍♂️ Engaging Visual Experience
• Beautiful custom animations for each exercise
• Push-ups, Squats, Jumping Jacks, Mountain Climbers
• Clear visual cues to keep you motivated
• Dark mode design optimized for workouts

🔊 Smart Audio & Haptic Feedback
• Audio countdown beeps for the last 3 seconds
• Haptic feedback for important transitions
• Works even in silent mode
• Optional sound controls

⚡ Powerful Timer Features
• Never miss a beat with precise timing
• Skip button for flexible workout flow
• Pause and resume functionality
• Screen stays awake during workouts

📱 User-Friendly Design
• Simple, intuitive interface
• One-handed operation friendly
• Progress tracking throughout workout
• Instant feedback system

🎨 Personalization
• Toggle exercises on/off
• Save your preferred settings
• Quick access to customization
• Seamless workout flow

PERFECT FOR:
• Home workouts
• Gym sessions
• Quick fitness breaks
• Travel workouts
• Beginner to advanced fitness levels

NO ADS, NO SUBSCRIPTIONS
Simple HIIT respects your workout time. No interruptions, no hidden costs - just pure fitness focus.

Download Simple HIIT today and discover how effective 20 minutes can be for your fitness journey!
```

### Keywords (100 characters max):
```
hiit,workout,timer,fitness,exercise,interval,training,health,gym,cardio
```

### Promotional Text (170 characters max):
```
Get fit fast with Simple HIIT! Customizable interval timer with beautiful animations. Perfect for home workouts. No ads, no subscriptions - just results!
```

---

**🎯 This guide covers every form field you'll encounter in App Store Connect. Follow it step-by-step for a smooth submission process!**