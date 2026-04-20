import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translations Dictionary
const resources = {
  en: {
    translation: {
      // Navbar
      home: "Home",
      dashboard: "Dashboard",
      reports: "Reports",
      weather: "Weather",

      // Hero
      hero_title_1: "SMART CROP",
      hero_title_2: "PROTECTION AI",
      hero_desc: "Predict. Protect. Prosper. Transform your farming with real-time AI monitoring and early disease detection.",
      btn_start: "Start Detection",
      btn_demo: "Watch Demo",
      stats_farms: "Farms Supported",
      stats_farms_desc: "Across 120 countries.",
      stats_accuracy: "Detection Accuracy",
      stats_accuracy_desc: "Powered by advanced AI.",
      stats_monitoring: "AI Monitoring",
      stats_monitoring_desc: "Always active protection.",
      
      // Floating Labels
      lbl_humidity: "Humidity",
      lbl_rain: "Rain Chance",
      lbl_soil: "Soil Health",
      lbl_pest: "Pest Risk",
      lbl_ai: "AI Monitoring Active",
      lbl_good: "Good",
      lbl_low: "Low",

      // Info Card
      card_title: "System Status",
      card_online: "AI Core Online",
      card_metrics: "Core Metrics",
      card_temp: "Temperature",
      card_soil_moist: "Soil Moisture",
      card_health: "Crop Health",
      card_health_desc: "Optimal conditions detected",

      // Sidebar
      side_disease: "Disease Detection",
      side_pest: "Pest Heatmap",
      side_weather: "Weather Forecast",
      side_treatments: "Treatments",
      
      // Dashboard - Disease Detection
      dd_title: "Disease Detection",
      dd_subtitle: "Real-time local AI analysis & geo-spatial hotspot tracking",
      dd_clear: "Clear Data",
      dd_upload_title: "Upload & Analyze",
      dd_upload_text: "Tap to open camera or browse",
      dd_upload_sub: "Live data & hotspot detection active",
      dd_btn_run: "Run Agent",
      dd_btn_analyzing: "Analyzing...",
      dd_recent: "Recent Live Scans",
      dd_report_title: "Intelligence Report",
      dd_awaiting: "Awaiting live feed input...",
      dd_match: "Match",
      dd_severity: "Severity",
      dd_hotspot: "Hotspot Sector",
      dd_log_time: "Log Time",
      dd_profile: "Pathological Profile",
      dd_action: "Prescribed Action Plan",
    }
  },
  hi: {
    translation: {
      // Navbar
      home: "मुख्य पृष्ठ",
      dashboard: "डैशबोर्ड",
      reports: "रिपोर्ट",
      weather: "मौसम",

      // Hero
      hero_title_1: "स्मार्ट फसल",
      hero_title_2: "संरक्षण एआई",
      hero_desc: "भविष्यवाणी करें। रक्षा करें। समृद्ध हों। वास्तविक समय की एआई निगरानी से अपनी खेती को बदलें।",
      btn_start: "निगरानी शुरू करें",
      btn_demo: "डेमो देखें",
      stats_farms: "समर्थित खेत",
      stats_farms_desc: "120 देशों में।",
      stats_accuracy: "पहचान सटीकता",
      stats_accuracy_desc: "उन्नत एआई द्वारा संचालित।",
      stats_monitoring: "एआई निगरानी",
      stats_monitoring_desc: "हमेशा सक्रिय सुरक्षा।",

      // Floating Labels
      lbl_humidity: "नमी",
      lbl_rain: "बारिश की संभावना",
      lbl_soil: "मिट्टी का स्वास्थ्य",
      lbl_pest: "कीट जोखिम",
      lbl_ai: "एआई निगरानी सक्रिय",
      lbl_good: "अच्छा",
      lbl_low: "कम",

      // Info Card
      card_title: "सिस्टम स्थिति",
      card_online: "एआई कोर ऑनलाइन",
      card_metrics: "मुख्य मेट्रिक्स",
      card_temp: "तापमान",
      card_soil_moist: "मिट्टी की नमी",
      card_health: "फसल का स्वास्थ्य",
      card_health_desc: "अनुकूल स्थितियां पाई गईं",

      // Sidebar
      side_disease: "रोग की पहचान",
      side_pest: "कीट हीटमैप",
      side_weather: "मौसम का पूर्वानुमान",
      side_treatments: "उपचार",

      // Dashboard - Disease Detection
      dd_title: "रोग की पहचान",
      dd_subtitle: "वास्तविक समय स्थानीय एआई विश्लेषण और हॉटस्पॉट ट्रैकिंग",
      dd_clear: "डेटा साफ़ करें",
      dd_upload_title: "अपलोड और विश्लेषण करें",
      dd_upload_text: "कैमरा खोलने या ब्राउज़ करने के लिए टैप करें",
      dd_upload_sub: "लाइव डेटा और हॉटस्पॉट पहचान सक्रिय",
      dd_btn_run: "एजेंट चलाएं",
      dd_btn_analyzing: "विश्लेषण हो रहा है...",
      dd_recent: "हाल के लाइव स्कैन",
      dd_report_title: "खुफिया रिपोर्ट",
      dd_awaiting: "लाइव इनपुट की प्रतीक्षा है...",
      dd_match: "मैच",
      dd_severity: "गंभीरता",
      dd_hotspot: "हॉटस्पॉट सेक्टर",
      dd_log_time: "लॉग का समय",
      dd_profile: "रोग प्रोफ़ाइल",
      dd_action: "निर्धारित कार्य योजना",
    }
  },
  kok: {
    translation: {
      // Navbar
      home: "मुखेल पान",
      dashboard: "डॅशबोर्ड",
      reports: "अहवाल",
      weather: "हवामान",

      // Hero
      hero_title_1: "स्मार्ट पीक",
      hero_title_2: "संरक्षण एआय",
      hero_desc: "अंदाज करा. रक्षण करा. समृद्ध जायात. रियल-टाईम एआय तपासणी आनी रोगाची सुरवातीची वळख करून तुमची शेती बदला.",
      btn_start: "तपासणी सुरू करा",
      btn_demo: "डेमो पळयात",
      stats_farms: "तपासणी केल्ली शेतां",
      stats_farms_desc: "१२० देशांनी.",
      stats_accuracy: "तपासणीची अचूकता",
      stats_accuracy_desc: "प्रगत एआय आदारित.",
      stats_monitoring: "एआय तपासणी",
      stats_monitoring_desc: "सदांच सक्रिय सुरक्षा.",

      // Floating Labels
      lbl_humidity: "आर्द्रता",
      lbl_rain: "पावसाची शक्यताय",
      lbl_soil: "मातयेची भलाईकी",
      lbl_pest: "किडींचो धोको",
      lbl_ai: "एआय मॉनिटरिंग सक्रिय आसा",
      lbl_good: "बरी",
      lbl_low: "उणो",

      // Info Card
      card_title: "सिस्टम स्थिती",
      card_online: "एआय कोर ऑनलाईन",
      card_metrics: "मुख्य मेट्रिक्स",
      card_temp: "तापमान",
      card_soil_moist: "मातयेची ओलसाण",
      card_health: "पिकाची भलाईकी",
      card_health_desc: "उत्तम स्थिती मेळ्ळ्या",

      // Sidebar
      side_disease: "रोगाची वळख",
      side_pest: "किडींचो हीटमॅप",
      side_weather: "हवामानाचो अंदाज",
      side_treatments: "उपाय",

      // Dashboard - Disease Detection
      dd_title: "रोगाची वळख",
      dd_subtitle: "रियल-टाईम एआय अणभव आनी वाठार-ट्रॅकिंग",
      dd_clear: "डेटा काडून उडयात",
      dd_upload_title: "अपलोड आनी तपासणी",
      dd_upload_text: "कॅमेरा उकतुपाक वा फाईल वेंचपाक टॅप करा",
      dd_upload_sub: "थेट डेटा आनी हॉटस्पॉट तपासणी सुरू आसा",
      dd_btn_run: "एजंट चलोवयात",
      dd_btn_analyzing: "विश्लेषण चालू आसा...",
      dd_recent: "ताजे स्कॅन्स",
      dd_report_title: "माहिती अहवाल",
      dd_awaiting: "लाइव्ह इनपुटची वाट पळयता...",
      dd_match: "जुळवणी",
      dd_severity: "गंभीरता",
      dd_hotspot: "हॉटस्पॉट सुवात",
      dd_log_time: "लॉग वेळ",
      dd_profile: "पॅथॉलॉजिकल माहिती",
      dd_action: "सुचायिल्ली उपाय येवजण",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
