# CropGuard AI - Phone Setup Guide

## Required Changes for Android Phone

### 1. **Google Maps API Key** (REQUIRED)
The app uses Google Maps for the heatmap feature. You need to add your Google Maps API key:

**Steps:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a project or select existing one
- Enable "Maps SDK for Android"
- Create an API key for Android
- Open: `android/app/src/main/res/values/strings.xml`
- Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key

**Example:**
```xml
<string name="google_maps_api_key">AIzaSyD1234567890XXXXXXXXXXXXXXXX</string>
```

### 2. **App Name** ✅ (Already updated)
Changed from `cropguard_ai` to `CropGuard AI` in AndroidManifest.xml

### 3. **Permissions** ✅ (Already added)
The following permissions are now configured:
- 📷 Camera (for uploading crop photos)
- 🖼️ Photo/Gallery Access (for image picker)
- 📍 Location (for heatmap feature)
- 🌐 Internet (for maps and API calls)

### 4. **Testing on Phone**

**Connect your Android phone:**
```bash
flutter devices  # List connected devices
flutter run -d <device_id>  # Run on your phone
```

**Or build an APK:**
```bash
flutter build apk --release  # Creates app-release.apk
# Transfer to phone and install
```

## iOS (if you want to build for iPhone)

For iOS, you would also need:
- Similar API key configuration in `ios/Runner/Info.plist`
- Camera/Photo permissions in Info.plist
- Location permissions

**Current status:** iOS support can be added later if needed.

## Quick Checklist
- [ ] Get Google Maps API Key from Google Cloud Console
- [ ] Update `strings.xml` with your API key
- [ ] Run `flutter pub get` to ensure all packages are ready
- [ ] Connect your Android phone via USB (enable USB Debugging)
- [ ] Run `flutter run -d <device_id>` to test
- [ ] Grant permissions when app asks (Camera, Location, Photos)

## Notes
- The app uses dummy data - Gemini integration will be added later
- All features work offline except maps (which need internet)
- Tested and ready for Android 10+ devices
