// SmartBhaarat Civic Platform Javascript Core

// State Management & Constants
const DEFAULT_COORDINATES = [12.9719, 77.6412]; // Indira Nagar, Bengaluru
let mapInstance = null;
let currentMarker = null;
let activeTheme = 'dark';
let activeLanguage = 'en';
let activeView = 'dashboard';
let isVoiceReadoutEnabled = false;

// Mock database initialized in LocalStorage if not present
const INITIAL_COMPLAINTS = [
  {
    id: "COMP-101",
    category: "Potholes / Road Repair",
    description: "Deep pothole near the intersection of 8th Cross and 12th Main Road. Vehicles are swerving dangerously.",
    latitude: 12.9723,
    longitude: 77.6421,
    address: "8th Cross, 12th Main Rd, Indira Nagar, Bengaluru",
    status: "review",
    urgency: "High",
    impact: 1400,
    timestamp: "2026-07-06T15:20:00Z"
  },
  {
    id: "COMP-102",
    category: "Street Light Failure",
    description: "Entire line of street lights not working since last week. Extremely dark and unsafe for pedestrians.",
    latitude: 12.9708,
    longitude: 77.6405,
    address: "5th Main Road, Sector 3, Indira Nagar, Bengaluru",
    status: "pending",
    urgency: "Medium",
    impact: 600,
    timestamp: "2026-07-07T08:10:00Z"
  },
  {
    id: "COMP-103",
    category: "Water Leakage / Drainage",
    description: "Sewage water flooding onto the main footpath near the metro station extension.",
    latitude: 12.9735,
    longitude: 77.6398,
    address: "Metro Station Exit A Footpath, Bengaluru",
    status: "resolved",
    urgency: "Critical",
    impact: 3200,
    timestamp: "2026-07-05T09:30:00Z"
  }
];

// Document Packs Configuration
const DOCUMENT_PACKS = {
  aadhaar_update: {
    name: "Aadhaar Address Update",
    docs: [
      { id: "proof_identity", name: "Proof of Identity (PAN/Passport)", status: "Pending Verification", verified: false, file: null },
      { id: "proof_address", name: "Proof of Address (Rent Agreement/Utility Bill)", status: "Pending Verification", verified: false, file: null },
      { id: "aadhaar_declaration", name: "Self-Declaration Form", status: "Verified & Approved", verified: true, file: "declaration_template.pdf" }
    ]
  },
  business_license: {
    name: "Business Registration License",
    docs: [
      { id: "pan_card", name: "Company PAN Card copy", status: "Pending Verification", verified: false, file: null },
      { id: "address_proof", name: "Commercial Space Lease Agreement", status: "Pending Verification", verified: false, file: null },
      { id: "municipal_noc", name: "Municipal NOC certificate", status: "Pending Verification", verified: false, file: null },
      { id: "owner_photo", name: "Owner Passport Photo", status: "Verified & Approved", verified: true, file: "photo.jpg" }
    ]
  },
  senior_pension: {
    name: "Senior Citizen Pension",
    docs: [
      { id: "age_proof", name: "Age Verification Document (Aadhaar/School Certificate)", status: "Pending Verification", verified: false, file: null },
      { id: "income_cert", name: "Income Certificate (Annual income < 3 Lakhs)", status: "Pending Verification", verified: false, file: null },
      { id: "bank_passbook", name: "Bank Account Passbook Cover copy", status: "Verified & Approved", verified: true, file: "bank_frontpage.jpg" }
    ]
  }
};

// Bureaucracy Translation Dictionary / Rules
const TRANSLATION_TEMPLATES = {
  pension: {
    title: "Pension Rules Clause",
    jargon: "Pursuant to Clause 14(a) of the Municipal Pension Bylaws, all applicants must submit verified affidavits in duplicate, failing which the petition stands rejected, subject to the proviso that the competent authority may allow cure periods not exceeding thirty (30) days from gazette notification date.",
    translation: {
      en: "<h3>Simplified Summary:</h3><p>Here is what this means in simple language:</p><ul><li>You must submit <strong>two copies</strong> of your verified legal affidavit form.</li><li>If you forget or make a mistake, your application will be rejected.</li><li><strong>Cure Period:</strong> You get a <strong>30-day grace period</strong> from the notice date to fix any errors without penalty.</li></ul>",
      hi: "<h3>सरल सारांश:</h3><p>इसका आसान भाषा में यह अर्थ है:</p><ul><li>आपको सत्यापित शपथ पत्र (Affidavit) की <strong>दो प्रतियां</strong> जमा करनी होंगी।</li><li>यदि आप भूल जाते हैं या कोई त्रुटि होती है, तो आपका आवेदन अस्वीकार कर दिया जाएगा।</li><li><strong>त्रुटि सुधार अवधि:</strong> अधिसूचना तिथि से आपको त्रुटियों को सुधारने के लिए <strong>30 दिनों की छूट अवधि</strong> दी जाएगी।</li></ul>",
      ta: "<h3>எளிமையான சுருக்கம்:</h3><ul><li>நீங்கள் சரிபார்க்கப்பட்ட வாக்குமூலப் படிவத்தின் <strong>இரண்டு பிரதிகளை</strong> சமர்ப்பிக்க வேண்டும்.</li><li>நீங்கள் சமர்ப்பிக்கத் தவறினால், உங்கள் விண்ணப்பம் நிராகரிக்கப்படும்.</li><li><strong>திருத்தக் காலம்:</strong> பிழைகளைச் சரிசெய்ய அறிவிப்புத் தேதியிலிருந்து <strong>30 நாட்கள் அவகாசம்</strong> வழங்கப்படும்.</li></ul>",
      bn: "<h3>সহজ সারসংক্ষেপ:</h3><ul><li>আপনাকে যাচাইকৃত হলফনামার <strong>দুটি কপি</strong> জমা দিতে হবে।</li><li>জমা না দিলে আবেদন বাতিল হয়ে যাবে।</li><li><strong>ত্রুটি সংশোধনের সময়সীমা:</strong> নোটিশের তারিখ থেকে ভুল সংশোধনের জন্য <strong>৩০ দিনের অতিরিক্ত সময়</strong> পাবেন।</li></ul>"
    }
  },
  land: {
    title: "Land Conversion Proviso",
    jargon: "Where the agricultural land use modification is requested under Section 95(2), the collector shall, within forty-five days of receipt thereof, verify the non-encumbrance status, provided always that in the event of failure to dispose of such application within said period, usage permissions are deemed granted, subject to remittance of statutory conversion fees.",
    translation: {
      en: "<h3>Simplified Summary:</h3><p>Here is what this means in simple language:</p><ul><li>The District Collector has exactly <strong>45 days</strong> to check if your land is free from disputes (non-encumbrance status).</li><li><strong>Deemed Approval:</strong> If the government does not reply within 45 days, your land conversion is <strong>automatically approved</strong>.</li><li>You still have to pay the standard conversion fees to complete the process.</li></ul>",
      hi: "<h3>सरल सारांश:</h3><ul><li>जिला कलेक्टर के पास आपकी भूमि के विवाद-मुक्त होने की जांच करने के लिए <strong>45 दिन</strong> का समय है।</li><li><strong>मान्य स्वीकृति (Deemed Approval):</strong> यदि सरकार 45 दिनों में कोई उत्तर नहीं देती है, तो आपकी भूमि परिवर्तन <strong>स्वचालिक रूप से स्वीकृत</strong> मान ली जाएगी।</li><li>प्रक्रिया पूरी करने के लिए आपको अभी भी मानक परिवर्तन शुल्क का भुगतान करना होगा।</li></ul>",
      ta: "<h3>எளிமையான சுருக்கம்:</h3><ul><li>உங்கள் நிலம் சர்ச்சையற்றதா எனச் சரிபார்க்க மாவட்ட ஆட்சியருக்கு சரியாக <strong>45 நாட்கள்</strong> அவகாசம் உள்ளது.</li><li><strong>தானியங்கி ஒப்புதல்:</strong> அரசு 45 நாட்களுக்குள் பதிலளிக்கவில்லை எனில், நிலமாற்றம் <strong>தானாகவே அங்கீகரிக்கப்படும்</strong>.</li><li>நீங்கள் இன்னும் அதற்கான கட்டணத்தைச் செலுத்த வேண்டும்.</li></ul>",
      bn: "<h3>সহজ সারসংক্ষেপ:</h3><ul><li>আপনার জমিটি কোনো বিরোধ বা মামলা-মুক্ত কি না তা পরীক্ষা করার জন্য জেলা কালেক্টরের কাছে ঠিক <strong>৪৫ দিন</strong> সময় আছে।</li><li><strong>স্বয়ংক্রিয় অনুমোদন:</strong> সরকার যদি ৪৫ দিনের মধ্যে কোনো উত্তর না দেয়, তবে জমি রূপান্তর <strong>স্বয়ংক্রিয়ভাবে অনুমোদিত</strong> বলে গণ্য হবে।</li><li>সম্পূর্ণ প্রক্রিয়াটির জন্য আপনাকে প্রযোজ্য ফি প্রদান করতে হবে।</li></ul>"
    }
  },
  tender: {
    title: "Sewerage Tender Terms",
    jargon: "The contractor shall hold the municipality indemnified against all claims, liquidated damages, and liabilities arising out of subterranean sewerage structural collapses or water contamination, under absolute liability doctrines, save for force majeure conditions as certified by the Superintending Engineer.",
    translation: {
      en: "<h3>Simplified Summary:</h3><p>Here is what this means in simple language:</p><ul><li><strong>Contractor Responsibility:</strong> The contractor is 100% responsible for any damage, leaks, or water contamination during the sewer line work.</li><li>The municipality will not pay for any lawsuits, losses, or cleanup costs.</li><li>The only exception is natural disasters (force majeure), which must be officially certified by the Superintending Engineer.</li></ul>",
      hi: "<h3>सरल सारांश:</h3><ul><li><strong>ठेकेदार की जिम्मेदारी:</strong> सीवर लाइन के काम के दौरान होने वाले किसी भी नुकसान, रिसाव या पानी के दूषण के लिए ठेकेदार शत-प्रतिशत जिम्मेदार है।</li><li>नगर पालिका किसी भी मुकदमों, नुकसान या सफाई की लागत का भुगतान नहीं करेगी।</li><li>एकमात्र अपवाद प्राकृतिक आपदाएं हैं, जिन्हें मुख्य अभियंता द्वारा प्रमाणित किया जाना चाहिए।</li></ul>",
      ta: "<h3>எளிமையான சுருக்கம்:</h3><ul><li><strong>ஒப்பந்ததாரர் பொறுப்பு:</strong> பாதாள சாக்கடைப் பணியின் போது ஏற்படும் சேதங்கள் அல்லது நீர் மாசுபாட்டிற்கு ஒப்பந்ததாரரே முழுப் பொறுப்பு.</li><li>நகராட்சி எந்தவொரு வழக்கு அல்லது இழப்பீட்டுத் தொகையையும் செலுத்தாது.</li><li>இயற்கை பேரிடர்கள் மட்டுமே இதற்கு விதிவிலக்கு, இதை முதன்மைப் பொறியாளர் சான்றளிக்க வேண்டும்।</li></ul>",
      bn: "<h3>সহজ সারসংক্ষেপ:</h3><ul><li><strong>ঠিকাদারের দায়িত্ব:</strong> নর্দমার কাজের সময় হওয়া যেকোনো ক্ষতি, ফুটো বা পানি দূষণের জন্য ঠিকাদার ১০০% দায়ী থাকবেন।</li><li>পৌরসভা কোনো মামলা বা ক্ষতিপূরণের ব্যয় বহন করবে না।</li><li>একমাত্র ব্যতিক্রম হলো প্রাকৃতিক দুর্যোগ, যা অধীক্ষক প্রকৌশলী দ্বারা প্রত্যয়িত হতে হবে।</li></ul>"
    }
  }
};

// UI Translations for Languages
const TRANSLATIONS = {
  en: {
    greeting: "Namaste, Citizen",
    subtitle: "Welcome to your intelligent, transparent connection to local governance.",
    verifiedBadge: "Verified (Aadhaar Linked)",
    resolvedIssues: "Resolved Issues",
    avgTime: "Avg. Resolution Time",
    satisfaction: "Citizen Satisfaction",
    efficiency: "Efficiency Ranking",
    chartTitle1: "Monthly Grievance Resolution Trend",
    chartSubtitle1: "Real-time status comparison of reported vs resolved municipal logs",
    chartTitle2: "Service Allocation Breakdown",
    chartSubtitle2: "Volume distribution by civic categories",
    feedLeft: "Community Complaint Feed (500m radius)",
    feedRight: "My Submitted Grievances",
    fileNew: "File New",
    lifeStages: "Select Your Current Life Stage",
    stageNewborn: "Newborn Child",
    stageBusiness: "Starting a Business",
    stageMarriage: "Just Married",
    stageSenior: "Senior Citizen / Pension",
    stageMoving: "Moving City",
    wizardTitle: "Smart Scheme Eligibility Assessment",
    back: "Back",
    next: "Next",
    recomHeader: "Recommended Schemes & Services",
    compHeader: "Submit Civic Grievance",
    selectCat: "Select a Category",
    submitBtn: "File Official Complaint",
    aiIntelHeader: "AI Complaint Intelligence",
    dupWarningTitle: "Duplicate Alert:",
    dupWarningDesc: "A citizen has already filed a complaint about this issue 120m away. Your report will be appended to support urgency.",
    urgencyLabel: "Urgency Level",
    popLabel: "Estimated Affected Pop.",
    letterTitle: "Auto-Generated Municipal Letter",
    letterSubtitle: "GenAI drafted petition based on official circulars:",
    packServiceHeader: "Select Target Service",
    readinessLabel: "Ready Status Pack Score",
    missingAlert: "Missing critical documents",
    packDetailTitle: "Required Document Checklist",
    transInputTitle: "Complex Government Circular",
    transInputSubtitle: "Paste complex legal/bureaucratic terms here, or select a template:",
    transOutputTitle: "Citizen-Friendly Summary",
    transPlaceholder: "Click 'Simplify Language' to translate bureaucratic sentences into clear, direct instructions.",
    evaName: "Seva Sathi",
    evaStatus: "AI Assistant (Online)",
    evaWelcome: "Namaste! I am Seva Sathi, your civic AI companion. I can help you check schemes, verify documents, report issues, and translate legal notices. How may I assist you today?"
  },
  hi: {
    greeting: "नमस्ते, नागरिक",
    subtitle: "स्थानीय शासन के साथ आपके बुद्धिमान, पारदर्शी जुड़ाव में आपका स्वागत है।",
    verifiedBadge: "सत्यापित (आधार लिंक्ड)",
    resolvedIssues: "हल किए गए मामले",
    avgTime: "औसत समाधान समय",
    satisfaction: "नागरिक संतुष्टि",
    efficiency: "दक्षता रैंकिंग",
    chartTitle1: "मासिक शिकायत निवारण रुझान",
    chartSubtitle1: "रिपोर्ट किए गए बनाम हल किए गए नगर निगम लॉग की वास्तविक समय तुलना",
    chartTitle2: "सेवा आवंटन विवरण",
    chartSubtitle2: "नागरिक श्रेणियों द्वारा सेवा वितरण",
    feedLeft: "सामुदायिक शिकायत फीड (500 मीटर दायरा)",
    feedRight: "मेरी प्रस्तुत शिकायतें",
    fileNew: "नया दर्ज करें",
    lifeStages: "अपने वर्तमान जीवन स्तर का चयन करें",
    stageNewborn: "नवजात शिशु",
    stageBusiness: "व्यवसाय शुरू करना",
    stageMarriage: "नवविवाहित",
    stageSenior: "वरिष्ठ नागरिक / पेंशन",
    stageMoving: "नया शहर स्थानांतरण",
    wizardTitle: "स्मार्ट योजना पात्रता मूल्यांकन",
    back: "पीछे",
    next: "आगे",
    recomHeader: "अनुशंसित योजनाएं एवं सेवाएं",
    compHeader: "नागरिक शिकायत दर्ज करें",
    selectCat: "एक श्रेणी चुनें",
    submitBtn: "आधिकारिक शिकायत दर्ज करें",
    aiIntelHeader: "एआई शिकायत बुद्धिमत्ता",
    dupWarningTitle: "डुप्लिकेट चेतावनी:",
    dupWarningDesc: "एक नागरिक ने पहले ही 120 मीटर दूर इस समस्या की शिकायत दर्ज की है। आपकी रिपोर्ट को इसकी गंभीरता बढ़ाने के लिए जोड़ दिया जाएगा।",
    urgencyLabel: "तत्कालता स्तर",
    popLabel: "अनुमानित प्रभावित आबादी",
    letterTitle: "स्वचालित रूप से उत्पन्न नगर निगम पत्र",
    letterSubtitle: "सरकारी परिपत्रों के आधार पर एआई द्वारा तैयार याचिका:",
    packServiceHeader: "लक्षित सेवा का चयन करें",
    readinessLabel: "दस्तावेज़ तैयारी स्कोर",
    missingAlert: "महत्वपूर्ण दस्तावेज़ गायब हैं",
    packDetailTitle: "आवश्यक दस्तावेज़ चेकलिस्ट",
    transInputTitle: "जटिल सरकारी परिपत्र",
    transInputSubtitle: "यहाँ जटिल कानूनी/अधिकारी शब्द पेस्ट करें, या एक टेम्पलेट चुनें:",
    transOutputTitle: "नागरिक-अनुकूल सारांश",
    transPlaceholder: "नौकरशाही वाक्यों को स्पष्ट, सीधे निर्देशों में अनुवाद करने के लिए 'भाषा सरल करें' पर क्लिक करें।",
    evaName: "सेवा साथी",
    evaStatus: "एआई सहायक (ऑनलाइन)",
    evaWelcome: "नमस्ते! मैं आपका सेवा साथी नागरिक एआई सहायक हूँ। मैं योजनाओं की जांच करने, दस्तावेज़ों को सत्यापित करने, शिकायतें दर्ज करने और कानूनी सूचनाओं का अनुवाद करने में आपकी मदद कर सकता हूँ। आज मैं आपकी क्या सेवा करूँ?"
  },
  ta: {
    greeting: "வணக்கம், குடிமகன்",
    subtitle: "உள்ளூர் நிர்வாகத்துடனான உங்களது புத்திசாலித்தனமான மற்றும் வெளிப்படையான தொடர்புக்கு வரவேற்கிறோம்.",
    verifiedBadge: "சரிபார்க்கப்பட்டது (ஆதார் இணைக்கப்பட்டது)",
    resolvedIssues: "தீர்வு காணப்பட்ட புகார்கள்",
    avgTime: "சராசரி தீர்வு நேரம்",
    satisfaction: "குடிமக்கள் திருப்தி",
    efficiency: "செயல்திறன் தரவரிசை",
    chartTitle1: "மாதாந்திர புகார் தீர்வு போக்கு",
    chartSubtitle1: "பதிவு செய்யப்பட்ட மற்றும் தீர்க்கப்பட்ட நகராட்சி புகார்களின் நிகழ்நேர ஒப்பீடு",
    chartTitle2: "சேவை ஒதுக்கீட்டு விவரம்",
    chartSubtitle2: "பிரிவுகள் வாரியாக புகார்களின் பரவல்",
    feedLeft: "சமூகப் புகார்கள் ஊட்டம் (500 மீ சுற்றளவு)",
    feedRight: "எனது புகார்கள்",
    fileNew: "புதிய புகார்",
    lifeStages: "உங்கள் தற்போதைய வாழ்க்கை நிலையைத் தேர்ந்தெடுக்கவும்",
    stageNewborn: "புதிதாகப் பிறந்த குழந்தை",
    stageBusiness: "தொழில் தொடங்குதல்",
    stageMarriage: "புதிதாக திருமணமானவர்",
    stageSenior: "மூத்த குடிமகன் / ஓய்வூதியம்",
    stageMoving: "வேறு நகருக்கு மாறுதல்",
    wizardTitle: "தகுதியான திட்டங்களை கண்டறிதல்",
    back: "பின்னால்",
    next: "அடுத்து",
    recomHeader: "பரிந்துரைக்கப்படும் அரசுத் திட்டங்கள்",
    compHeader: "குடிமக்கள் புகாரைப் பதிவு செய்யவும்",
    selectCat: "ஒரு பிரிவைத் தேர்ந்தெடுக்கவும்",
    submitBtn: "அதிகாரப்பூர்வ புகாரை சமர்ப்பி",
    aiIntelHeader: "செயற்கை நுண்ணறிவு பகுப்பாய்வு",
    dupWarningTitle: "நகல் எச்சரிக்கை:",
    dupWarningDesc: "120 மீட்டர் தொலைவில் மற்றொரு குடிமகன் ஏற்கனவே இதே புகாரைப் பதிவு செய்துள்ளார். உங்கள் புகாரும் முன்னுரிமைக்காக இதனுடன் சேர்க்கப்படும்.",
    urgencyLabel: "முன்னுரிமை நிலை",
    popLabel: "பாதிக்கப்பட்ட மக்கள் தொகை",
    letterTitle: "தானியங்கி நகராட்சி கடிதம்",
    letterSubtitle: "அரசாங்க சுற்றறிக்கைகளின் அடிப்படையில் உருவாக்கப்பட்டது:",
    packServiceHeader: "இலக்கு சேவையைத் தேர்ந்தெடுக்கவும்",
    readinessLabel: "ஆவணங்களின் தயார் நிலை",
    missingAlert: "முக்கிய ஆவணங்கள் விடுபட்டுள்ளன",
    packDetailTitle: "தேவையான ஆவணங்களின் பட்டியல்",
    transInputTitle: "சிக்கலான அரசாங்க சுற்றறிக்கை",
    transInputSubtitle: "அரசாங்க கடிதங்கள் அல்லது சட்ட சொற்களை இங்கே ஒட்டவும், அல்லது ஒரு மாதிரியை தேர்வு செய்யவும்:",
    transOutputTitle: "எளிமையான விளக்கம்",
    transPlaceholder: "அரசு கடிதங்களை எளிய தமிழில் சுருக்கமாக பெற 'விளக்கத்தை எளிமையாக்கு' என்பதை கிளிக் செய்யவும்.",
    evaName: "சேவை சாதி",
    evaStatus: "செயலில் உள்ளது",
    evaWelcome: "வணக்கம்! நான் உங்களது சேவை சாதி உதவியாளர். திட்டங்களை அறிய, ஆவணங்களை சரிபார்க்க மற்றும் புகார்களை பதிவு செய்ய நான் உங்களுக்கு உதவுவேன். இன்று நான் உங்களுக்கு எவ்வாறு உதவ வேண்டும்?"
  },
  bn: {
    greeting: "নমস্কার, নাগরিক",
    subtitle: "স্থানীয় প্রশাসনের সাথে আপনার বুদ্ধিমান ও স্বচ্ছ সংযোগে স্বাগত।",
    verifiedBadge: "যাচাইকৃত (আধার সংযুক্ত)",
    resolvedIssues: "সমাধানকৃত অভিযোগ",
    avgTime: "গড় সমাধানের সময়",
    satisfaction: "নাগরিক সন্তুষ্টি",
    efficiency: "দক্ষতা র‌্যাঙ্কিং",
    chartTitle1: "মাসিক অভিযোগ সমাধানের প্রবণতা",
    chartSubtitle1: "পৌরসভার অভিযোগ ও সমাধানের রিয়েল-টাইম তুলনা",
    chartTitle2: "পরিষেবা বরাদ্দের বিন্যাস",
    chartSubtitle2: "অভিযোগের বিভাগভিত্তিক বিবরণ",
    feedLeft: "পার্শ্ববর্তী অভিযোগ ফিড (৫০০ মিটার ব্যাসার্ধ)",
    feedRight: "আমার দাখিলকৃত অভিযোগ",
    fileNew: "নতুন দাখিল করুন",
    lifeStages: "আপনার বর্তমান জীবন স্তর নির্বাচন করুন",
    stageNewborn: "নবজাতক শিশু",
    stageBusiness: "ব্যবসা শুরু করা",
    stageMarriage: "সদ্য বিবাহিত",
    stageSenior: "প্রবীণ নাগরিক / পেনশন",
    stageMoving: "শহর পরিবর্তন",
    wizardTitle: "স্মার্ট স্কিম যোগ্যতা মূল্যায়ন",
    back: "পেছনে",
    next: "পরবর্তী",
    recomHeader: "সুপারিশকৃত সরকারি স্কিমসমূহ",
    compHeader: "নাগরিক অভিযোগ জমা দিন",
    selectCat: "একটি বিভাগ নির্বাচন করুন",
    submitBtn: "অফিসিয়াল অভিযোগ জমা দিন",
    aiIntelHeader: "অভিযোগের এআই বিশ্লেষণ",
    dupWarningTitle: "অনুরূপ অভিযোগ সতর্কতা:",
    dupWarningDesc: "একই সমস্যা নিয়ে ১২০ মিটার দূরে একজন নাগরিক ইতিপূর্বে অভিযোগ দাখিল করেছেন। আপনার অভিযোগটি দ্রুত সমাধানের জন্য এতে যুক্ত করা হবে।",
    urgencyLabel: "জরুরিতা স্তর",
    popLabel: "আনুমানিক প্রভাবিত জনসংখ্যা",
    letterTitle: "স্বয়ংক্রিয় পৌরসভা পত্র",
    letterSubtitle: "অফিসিয়াল বিজ্ঞপ্তির ভিত্তিতে এআই খসড়া আবেদনপত্র:",
    packServiceHeader: "লক্ষ্য পরিষেবা নির্বাচন করুন",
    readinessLabel: "নথিপত্র প্রস্তুতি স্কোর",
    missingAlert: "গুরুত্বপূর্ণ নথিপত্র অনুপস্থিত",
    packDetailTitle: "প্রয়োজনীয় নথিপত্র তালিকা",
    transInputTitle: "জটিল সরকারি নোটিশ",
    transInputSubtitle: "এখানে জটিল আইনি বা নোটিশের ভাষা পেস্ট করুন, অথবা একটি টেমপ্লেট নির্বাচন করুন:",
    transOutputTitle: "সহজ সারসংক্ষেপ",
    transPlaceholder: "আইনি ভাষা সহজ বাক্যে রূপান্তর করতে 'ভাষা সহজ করুন' বাটনে ক্লিক করুন।",
    evaName: "সেবা সাথী",
    evaStatus: "অনলাইন সাহায্যকারী",
    evaWelcome: "নমস্কার! আমি আপনার সেবা সাথী নাগরিক এআই সহযোগী। আমি আপনাকে স্কিম চেক করতে, নথি যাচাই করতে এবং অভিযোগ নথিভুক্ত করতে সাহায্য করতে পারি। আজ কীভাবে সাহায্য করতে পারি?"
  },
  // Expanded Indian Languages fallback dictionaries
  te: { greeting: "నమస్తే, పౌరుడు", subtitle: "స్థానిక పరిపాలనకు మీ తెలివైన, పారదర్శక అనుసంధానం.", verifiedBadge: "ధృవీకరించబడింది (ఆధార్ అనుసంధానం)", resolvedIssues: "పరిష్కరించబడిన సమస్యలు", avgTime: "సగటు పరిష్కార సమయం", satisfaction: "పౌరుల సంతృప్తి", efficiency: "సామర్థ్య ర్యాంకింగ్", chartTitle1: "నెలవారీ సమస్యల పరిష్కార ధోరణి", feedLeft: "స్థానిక ఫిర్యాదుల ఫీడ్", feedRight: "నా ఫిర్యాదులు", lifeStages: "మీ ప్రస్తుత జీవిత దశను ఎంచుకోండి", stageNewborn: "నవజాత శిశువు", stageBusiness: "వ్యాపారం ప్రారంభించడం", stageMarriage: "కొత్తగా వివాహం", stageSenior: "సీనియర్ సిటిజన్ / పెన్షన్", stageMoving: "నగరం మారడం", wizardTitle: "స్మార్ట్ పథకం అర్హత అంచనా", back: "వెనుకకు", next: "తరువాత", recomHeader: "సిఫార్సు చేయబడిన పథకాలు", compHeader: "ఫిర్యాదు దాఖలు చేయండి", selectCat: "ఒక వర్గాన్ని ఎంచుకోండి", submitBtn: "అధికారిక ఫిర్యాదు దాఖలు చేయండి", aiIntelHeader: "AI ఫిర్యాదు విశ్లేషణ", dupWarningTitle: "నకలు హెచ్చరిక:", dupWarningDesc: "మరొక పౌరుడు ఇప్పటికే ఈ సమస్యపై ఫిర్యాదు చేసారు. మీ నివేదిక కూడా దీనికి జత చేయబడుతుంది.", urgencyLabel: "అవసరత స్థాయి", popLabel: "ప్రభావిత జనాభా", letterTitle: "స్వయం చాలిత మున్సిపల్ లేఖ", packServiceHeader: "టార్గెట్ సర్వీస్ ఎంచుకోండి", readinessLabel: "ప్యాక్ సంసిద్ధత స్కోర్", missingAlert: "కీలక పత్రాలు లేవు", packDetailTitle: "కావలసిన పత్రాల తనిఖీ జాబితా", transInputTitle: "సంక్లిష్ట ప్రభుత్వ ఉత్తర్వులు", transPlaceholder: "భాషను సరళీకృతం చేయడానికి 'భాషను సులభతరం చేయి' క్లిక్ చేయండి.", evaName: "సేవా సాథి", evaStatus: "ఆన్‌లైన్ సహాయకుడు", evaWelcome: "నమస్తే! నేను సేవా సాథి. పథకాలు, పత్రాల తనిఖీ మరియు ఫిర్యాదుల నమోదులో నేను మీకు సహాయం చేస్తాను. ఈ రోజు నేను మీకు ఎలా సహాయం చేయగలను?" },
  mr: { greeting: "नमस्ते, नागरिक", subtitle: "स्थानिक प्रशासनाशी आपल्या बुद्धिमान, पारदर्शक जोडणीमध्ये आपले स्वागत आहे.", verifiedBadge: "सत्यापित (आधार जोडलेले)", resolvedIssues: "सोडवलेल्या तक्रारी", avgTime: "सरासरी निवारण वेळ", satisfaction: "नागरिक समाधान", efficiency: "कार्यक्षमता क्रमवारी", chartTitle1: "मासिक तक्रार निवारण कल", feedLeft: "स्थानिक तक्रार फीड", feedRight: "माझ्या तक्रारी", lifeStages: "आपल्या सद्य जीवन टप्प्याची निवड करा", stageNewborn: "नवजात मूल", stageBusiness: "नवीन व्यवसाय सुरू करणे", stageMarriage: "नवोदित जोडपे", stageSenior: "ज्येष्ठ नागरिक / पेन्शन", stageMoving: "नवीन शहरात स्थलांतर", wizardTitle: "स्मार्ट योजना पात्रता मूल्यमापन", back: "मागे", next: "पुढे", recomHeader: "शिफारस केलेल्या योजना", compHeader: "तक्रार नोंदवा", selectCat: "श्रेणी निवडा", submitBtn: "अधिकृत तक्रार दाखल करा", aiIntelHeader: "तक्रार बुद्धिमत्ता", dupWarningTitle: "डुप्लिकेट चेतावणी:", dupWarningDesc: "एका नागरिकाने आधीच या समस्येबद्दल तक्रार केली आहे. आपल्या तक्रारीलाही प्राधान्य दिले जाईल.", urgencyLabel: "तात्कालिकता पातळी", popLabel: "प्रभावित लोकसंख्या", letterTitle: "स्वयंचलित मनपा पत्र", packServiceHeader: "लक्षित सेवा निवडा", readinessLabel: "कागदपत्रे तयारी धावसंख्या", missingAlert: "महत्त्वपूर्ण कागदपत्रे गहाळ आहेत", packDetailTitle: "आवश्यक कागदपत्रांची यादी", transInputTitle: "क्लिष्ट सरकारी आदेश", transPlaceholder: "अधिकृत भाषा सुलभ करण्यासाठी 'भाषा सोपी करा' वर क्लिक करा.", evaName: "सेवा साथी", evaStatus: "सहाय्यक सक्रिय", evaWelcome: "नमस्ते! मी तुमचा सेवा साथी नागरिक सहाय्यक आहे. मी योजना, कागदपत्रे तपासणी आणि तक्रार दाखल करण्यात मदत करू शकतो. आज मी काय मदत करू?" },
  gu: { greeting: "નમસ્તે, નાગરિક", subtitle: "સ્થાનિક શાસન સાથે તમારા બુદ્ધિશાળీ અને પારદર્શક જોડાણમાં આપનું સ્વાગત છે.", verifiedBadge: "વેરિફાઇડ (આધાર લિંક્ડ)", resolvedIssues: "ઉકેલાયેલી ફરિયાદો", avgTime: "સરેરાશ ઉકેલ સમય", satisfaction: "નાગરિક સંતોષ", efficiency: "કાર્યક્ષમતા રેન્કિંગ", chartTitle1: "માસિક ફરિયાદ નિવારણ વલણ", feedLeft: "સ્થાનિક ફરિયાદ ફીડ", feedRight: "મારી ફરિયાદો", lifeStages: "તમારા વર્તમાન જીવન તબક્કાની પસંદગી કરો", stageNewborn: "નવજાત બાળક", stageBusiness: "નવો વ્યવસાય શરૂ કરવો", stageMarriage: "નવપરિણીત", stageSenior: "વરિષ્ઠ નાગરિક / પેન્શન", stageMoving: "નવા શહેરમાં સ્થળાંતર", wizardTitle: "સ્માર્ટ યોજના પાત્રતા મૂલ્યાંકન", back: "પાછળ", next: "આગળ", recomHeader: "ભલામણ કરેલ યોજનાઓ", compHeader: "ફરિયાદ દાખલ કરો", selectCat: "શ્રેણી પસંદ કરો", submitBtn: "સત્તાવાર ફરિયાદ દાખલ કરો", aiIntelHeader: "ફરિયાદ વિશ્લેષણ", dupWarningTitle: "ડુપ્લિકેટ ચેતવણી:", dupWarningDesc: "કોઈ અન્ય નાગરિકે આ સમસ્યા વિશે ફરિયાદ કરેલી છે. તમારી અરજી પણ તેની સાથે જોડવામાં આવશે.", urgencyLabel: "તાકીદ સ્તર", popLabel: "અસરગ્રસ્ત વસ્તી", letterTitle: "સ્વયં સંચાલિત સરકારી પત્ર", packServiceHeader: "લક્ષ્ય સેવા પસંદ કરો", readinessLabel: "દસ્તાવેજ તૈયારી સ્કોર", missingAlert: "મહત્વપૂર્ણ દસ્તાવેજો ખૂટે છે", packDetailTitle: "જરૂરી દસ્તાવેજો ચેકલિસ્ટ", transInputTitle: "જટિલ સરકારી નોટિસ", transPlaceholder: "ભાષાને સરળ બનાવવા માટે 'સરળ અનુવાદ' પર ક્લિક કરો.", evaName: "સેવા સાથી", evaStatus: "ઓનલાઇન સહાયક", evaWelcome: "નમસ્તે! હું સેવા સાથી છું. યોજનાઓની યોગ્યતા, દસ્તાવેજ ચકાસણી અને ફરિયાદો દાખલ કરવામાં હું તમારી મદદ કરી શકું છું. આજે હું તમારી શું સેવા કરું?" },
  kn: { greeting: "ನಮಸ್ತೆ, ನಾಗರಿಕ", subtitle: "ಸ್ಥಳೀಯ ಆಡಳಿತದೊಂದಿಗೆ ನಿಮ್ಮ ಬುದ್ಧಿವಂತ, ಪಾರದರ್ಶಕ ಸಂಪರ್ಕಕ್ಕೆ ಸ್ವಾಗತ.", verifiedBadge: "ದೃಢೀಕರಿಸಲಾಗಿದೆ (ಆಧಾರ್ ಲಿಂಕ್ಡ್)", resolvedIssues: "ಪರಿಹರಿಸಲಾದ ದೂರುಗಳು", avgTime: "ಸರಾಸರಿ ಪರಿಹಾರ ಸಮಯ", satisfaction: "ನಾಗರಿಕರ ತೃಪ್ತಿ", efficiency: "ದಕ್ಷತೆ ಶ್ರೇಯಾಂಕ", chartTitle1: "ಮಾಸಿಕ ದೂರು ಪರಿಹಾರ ಪ್ರವೃತ್ತಿ", feedLeft: "ಸ್ಥಳೀಯ ದೂರುಗಳ ಫೀಡ್", feedRight: "ನನ್ನ ಸಲ್ಲಿಕೆಗಳು", lifeStages: "ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಜೀವನ ಹಂತವನ್ನು ಆರಿಸಿ", stageNewborn: "ನವಜಾತ ಶಿಶು", stageBusiness: "ಹೊಸ ಉದ್ಯಮ ಪ್ರಾರಂಭ", stageMarriage: "ನವವಿವಾಹಿತರು", stageSenior: "ಹಿರಿಯ ನಾಗರಿಕರು / ಪೆನ್ಷನ್", stageMoving: "ಬೇರೆ ನಗರಕ್ಕೆ ಸ್ಥಳಾಂತರ", wizardTitle: "ಸ್ಮಾರ್ಟ್ ಯೋಜನೆ ಅರ್ಹತೆ ಮೌಲ್ಯಮಾಪನ", back: "ಹಿಂದಕ್ಕೆ", next: "ಮುಂದಕ್ಕೆ", recomHeader: "ಶಿಫಾರಸು ಮಾಡಲಾದ ಯೋಜನೆಗಳು", compHeader: "ದೂರನ್ನು ದಾಖಲಿಸಿ", selectCat: "ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ", submitBtn: "ಅಧಿಕೃತ ದೂರು ದಾಖಲಿಸಿ", aiIntelHeader: "ದೂರು ಬುದ್ಧಿಮತ್ತೆ", dupWarningTitle: "ನಕಲು ಎಚ್ಚರಿಕೆ:", dupWarningDesc: "ಇದೇ ಸಮಸ್ಯೆಯ ಬಗ್ಗೆ ಈಗಾಗಲೇ ದೂರು ದಾಖಲಾಗಿದೆ. ನಿಮ್ಮ ವರದಿಯನ್ನು ಸಹ ಆದ್ಯತೆಗಾಗಿ ಸೇರಿಸಲಾಗುತ್ತದೆ.", urgencyLabel: "ತುರ್ತು ಮಟ್ಟ", popLabel: "ಬಾಧಿತ ಜನಸಂಖ್ಯೆ", letterTitle: "ಸ್ವಯಂಚಾಲಿತ ಮುನ್ಸಿಪಲ್ ಪತ್ರ", packServiceHeader: "ಟಾರ್ಗೆಟ್ ಸೇವೆ ಆರಿಸಿ", readinessLabel: "ಪ್ಯಾಕ್ ಸಿದ್ಧತಾ ಸ್ಕೋರ್", missingAlert: "ಪ್ರಮುಖ ದಾಖಲೆಗಳು ಕಾಣೆಯಾಗಿವೆ", packDetailTitle: "ಅಗತ್ಯ ದಾಖಲೆಗಳ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ", transInputTitle: "ಕ್ಲಿಷ್ಟ ಸರ್ಕಾರಿ ಸುತ್ತೋಲೆ", transPlaceholder: "ಭಾಷೆಯನ್ನು ಸರಳಗೊಳಿಸಲು 'ಭಾಷೆ ಸರಳಗೊಳಿಸಿ' ಕ್ಲಿಕ್ ಮಾಡಿ.", evaName: "ಸೇವಾ ಸಾಥಿ", evaStatus: "ಸಹಾಯ ಕೇಂದ್ರ ಸಕ್ರಿಯ", evaWelcome: "ನಮಸ್ತೆ! ನಾನು ಸೇವಾ ಸಾಥಿ. ಯೋಜನೆಗಳ ಪರಿಶೀಲನೆ, ದಾಖಲೆಗಳ ದೃಢೀಕರಣ ಮತ್ತು ದೂರು ದಾಖಲಿಸಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?" },
  ml: { greeting: "നമസ്തേ, പൗരൻ", subtitle: "പ്രാദേശിക ഭരണകൂടവുമായുള്ള നിങ്ങളുടെ സ്മാർട്ട്, സുതാര്യമായ കണക്ഷനിലേക്ക് സ്വാഗതം.", verifiedBadge: "സ്ഥിരീകരിച്ചു (ആധാർ ലിങ്ക് ചെയ്തു)", resolvedIssues: "പരിഹരിച്ച പരാതികൾ", avgTime: "ശരാശരി പരിഹാര സമയം", satisfaction: "പൗരന്മാരുടെ തൃപ്തി", efficiency: "കാര്യക്ഷമത റാങ്കിംഗ്", chartTitle1: "പ്രതിമാസ പരാതി പരിഹാര പ്രവണത", feedLeft: "പ്രാദേശിക പരാതി ഫീഡ്", feedRight: "എന്റെ പരാതികൾ", lifeStages: "നിങ്ങളുടെ നിലവിലെ ജീവിത ഘട്ടം തിരഞ്ഞെടുക്കുക", stageNewborn: "നവജാത ശിശു", stageBusiness: "ബിസിനസ്സ് ആരംഭിക്കുക", stageMarriage: "നവദമ്പതികൾ", stageSenior: "മുതിർന്ന പൗരൻ / പെൻഷൻ", stageMoving: "മറ്റൊരു നഗരത്തിലേക്ക് മാറുക", wizardTitle: "അർഹതാ നിർണ്ണയം", back: "പിന്നിലേക്ക്", next: "അടുത്തത്", recomHeader: "ശുപാർശ ചെയ്യുന്ന പദ്ധതികൾ", compHeader: "പരാതി സമർപ്പിക്കുക", selectCat: "വിഭാഗം തിരഞ്ഞെടുക്കുക", submitBtn: "ഔദ്യോഗിക പരാതി ഫയൽ ചെയ്യുക", aiIntelHeader: "പരാതി അപഗ്രഥനം", dupWarningTitle: "ഡ്യൂപ്ലിക്കേറ്റ് മുന്നറിയിപ്പ്:", dupWarningDesc: "മറ്റൊരു പൗരൻ ഇതിനകം ഈ പരാതി സമർപ്പിച്ചിട്ടുണ്ട്. പരിഹാരത്തിനായി നിങ്ങളുടെ അപേക്ഷ ഇതിലേക്ക് ചേർക്കും.", urgencyLabel: "അടിയന്തിര പ്രാധാന്യം", popLabel: "ബാധിക്കപ്പെടുന്ന ജനസംഖ്യ", letterTitle: "തയ്യാറാക്കിയ മുനിസിപ്പൽ കത്ത്", packServiceHeader: "ലക്ഷ്യ സേവനം തിരഞ്ഞെടുക്കുക", readinessLabel: "ആവരണ സന്നദ്ധത സ്കോർ", missingAlert: "പ്രധാന രേഖകൾ ലഭ്യമല്ല", packDetailTitle: "ആവശ്യമായ രേഖകളുടെ പട്ടിക", transInputTitle: "സങ്കീർണ്ണ സർക്കാർ ഉത്തരവുകൾ", transPlaceholder: "ഭാഷ ലളിതമാക്കാൻ 'ഭാഷ ലളിതമാക്കുക' ക്ലിക്ക് ചെയ്യുക.", evaName: "സേവാ സാഥി", evaStatus: "ഓൺലൈൻ സഹായി", evaWelcome: "നമസ്തേ! ഞാൻ സേവാ സാഥി. പദ്ധതികളുടെ പരിശോധന, രേഖകളുടെ തരംതിരിക്കൽ, പരാതികൾ നൽകൽ എന്നിവയിൽ ഞാൻ സഹായിക്കാം. ഇന്ന് ഞാൻ എങ്ങനെ സഹായിക്കണം?" },
  pa: { greeting: "ਨਮਸਤੇ, ਨਾਗਰਿਕ", subtitle: "ਸਥਾਨਕ ਪ੍ਰਸ਼ਾਸਨ ਨਾਲ ਤੁਹਾਡੇ ਬੁੱਧੀਮਾਨ, ਪਾਰਦਰਸ਼ੀ ਸੰਪਰਕ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ।", verifiedBadge: "ਪ੍ਰਮਾਣਿਤ (ਆਧਾਰ ਲਿੰਕਡ)", resolvedIssues: "ਹੱਲ ਕੀਤੀਆਂ ਸ਼ਿਕਾਇਤਾਂ", avgTime: "ਔਸਤ ਹੱਲ ਸਮਾਂ", satisfaction: "ਨਾਗਰਿਕ ਸੰਤੁਸ਼ਟੀ", efficiency: "ਕਾਰਜਕੁਸ਼ਲਤਾ ਰੈਂਕਿੰਗ", chartTitle1: "ਮਾਸਿਕ ਸ਼ਿਕਾਇਤ ਨਿਵਾਰਣ ਰੁਝਾਨ", feedLeft: "ਸਥਾਨਕ ਸ਼ਿਕਾਇਤ ਫੀਡ", feedRight: "ਮੇਰੀਆਂ ਸ਼ਿਕਾਇਤਾਂ", lifeStages: "ਆਪਣੇ ਮੌਜੂਦਾ ਜੀਵਨ ਪੜਾਅ ਦੀ ਚੋਣ ਕਰੋ", stageNewborn: "ਨਵਜੰਮਿਆ ਬੱਚਾ", stageBusiness: "ਕਾਰੋਬਾਰ ਸ਼ੁਰੂ ਕਰਨਾ", stageMarriage: "ਨਵਾਂ ਵਿਆਹਿਆ ਜੋੜਾ", stageSenior: "ਸੀਨੀਅਰ ਸਿਟੀਜ਼ਨ / ਪੈਨਸ਼ਨ", stageMoving: "ਸ਼ਹਿਰ ਬਦਲਣਾ", wizardTitle: "ਸਮਾਰਟ ਯੋਜਨਾ ਯੋਗਤਾ ਮੁਲਾਂਕਣ", back: "ਪਿੱਛੇ", next: "ਅੱਗੇ", recomHeader: "ਸਿਫਾਰਸ਼ ਕੀਤੀਆਂ ਸਕੀਮਾਂ", compHeader: "ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ", selectCat: "ਸ਼੍ਰੇਣੀ ਚੁਣੋ", submitBtn: "ਅਧਿਕਾਰਤ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰੋ", aiIntelHeader: "ਸ਼ਿਕਾਇਤ ਬੁੱਧੀਮਤਾ", dupWarningTitle: "ਡੁਪਲੀਕੇਟ ਚੇਤਾਵਨੀ:", dupWarningDesc: "ਇੱਕ ਹੋਰ ਨਾਗਰਿਕ ਪਹਿਲਾਂ ਹੀ ਇਸ ਮੁੱਦੇ ਦੀ ਸ਼ਿਕਾਇत ਕਰ ਚੁੱਕਾ ਹੈ। ਤੁਹਾਡੀ ਰਿਪੋਰਟ ਵੀ ਇਸ ਨਾਲ ਜੋੜ ਦਿੱਤੀ ਜਾਵੇਗੀ।", urgencyLabel: "ਤਤਕਾਲਤਾ ਪੱਧਰ", popLabel: "ਪ੍ਰਭਾਵਿਤ ਆਬਾਦੀ", letterTitle: "ਸਵੈ-ਚਾਲਿਤ ਸਰਕਾਰੀ ਪੱਤਰ", packServiceHeader: "ਨਿਸ਼ਾਨਾ ਸੇਵਾ ਚੁਣੋ", readinessLabel: "ਦਸਤਾਵੇਜ਼ ਤਿਆਰੀ ਸਕੋਰ", missingAlert: "ਮਹੱਤਵਪੂਰਨ ਦਸਤਾਵੇਜ਼ ਗਾਇਬ ਹਨ", packDetailTitle: "ਲੋੜੀਂਦੇ ਦਸತಾਵੇਜ਼ਾਂ ਦੀ ਸੂਚੀ", transInputTitle: "ਗੁੰਝਲਦਾਰ ਸਰਕਾਰੀ ਨੋਟਿਸ", transPlaceholder: "ਭਾਸ਼ਾ ਨੂੰ ਸਰਲ ਬਣਾਉਣ ਲਈ 'ਭਾਸ਼ਾ ਆਸਾਨ ਕਰੋ' ਤੇ ਕਲਿੱਕ ਕਰੋ।", evaName: "ਸੇਵਾ ਸਾਥੀ", evaStatus: "ਸਹਾਇਕ ਸਰਗਰਮ", evaWelcome: "ਨਮਸਤੇ! ਮੈਂ ਸੇਵਾ ਸਾਥੀ ਹਾਂ। ਯੋਜਨਾਵਾਂ ਦੀ ਯੋਗਤਾ, ਦਸਤਾਵੇਜ਼ਾਂ ਦੀ ਜਾਂਚ ਅਤੇ ਸ਼ਿਕਾਇਤਾਂ ਦਰਜ ਕਰਨ ਵਿੱਚ ਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਅੱਜ ਮੈਂ ਕੀ ਸੇਵਾ ਕਰਾਂ?" },
  or: { greeting: "ନମସ୍କାର, ନାଗରିକ", subtitle: "ସ୍ଥାନୀୟ ପ୍ରଶାସନ ସହ ଆପଣଙ୍କ ବୁଦ୍ଧିମାନ ଓ ସ୍ୱଚ୍ଛ ସଂଯୋଗ।", verifiedBadge: "ସତ୍ୟାପିତ (ଆଧାର ସଂଯୁକ୍ତ)", resolvedIssues: "ସମାଧାନ ହୋଇଥିବା ଅଭିଯୋଗ", avgTime: "ହାରାହାରି ସମାଧାନ ସମୟ", satisfaction: "ନାଗରିକ ସନ୍ତୋଷ", efficiency: "ଦକ୍ଷତା ମାନ୍ୟତା", chartTitle1: "ମାସିକ ଅଭିଯୋଗ ସମାଧାନ ପ୍ରବୃତ୍ତି", feedLeft: "ସାମୁଦାୟିକ ଅଭିଯୋଗ ଫିଡ", feedRight: "ମୋର ଅଭିଯୋଗ", lifeStages: "ଆପଣଙ୍କ ବର୍ତ୍ତମାନର ଜୀବନ ସ୍ତର ଚୟନ କରନ୍ତୁ", stageNewborn: "ନବଜାତ ଶିଶୁ", stageBusiness: "ବ୍ୟବସାୟ ଆରମ୍ଭ କରିବା", stageMarriage: "ନବବିବାହିତ", stageSenior: "ବରିଷ୍ଠ ନାଗରିକ / ପେନସନ", stageMoving: "ନୂତନ ସହର ସ୍ଥାନାନ୍ତର", wizardTitle: "ସ୍ମାର୍ଟ ଯୋଜନା ଯୋଗ୍ୟତା ଆକଳନ", back: "ପଛକୁ", next: "ଆଗକୁ", recomHeader: "ସୁପାରିଶକୃତ ଯୋଜନା", compHeader: "ଅଭିଯୋਗ ଦାଖଲ କରନ୍ତୁ", selectCat: "ବିଭାଗ ଚୟନ କରନ୍ତୁ", submitBtn: "ଅଧିକାରିକ ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ", aiIntelHeader: "ଅଭିଯୋଗର ଏଆଇ ବିଶ୍ଳେଷଣ", dupWarningTitle: "ନକଲି ସତର୍କତା:", dupWarningDesc: "ଜଣେ ନାଗରିକ ପୂର୍ବରୁ ଏହି ସମସ୍ୟା ବିଷୟରେ ଅଭିଯୋਗ କରିଛନ୍ତି। ଆପଣଙ୍କ ଆବେଦନ ମଧ୍ୟ ଏହା ସହିତ ଯୋଡି ଦିଆଯିବ।", urgencyLabel: "ଜରୁରୀ ସ୍ତର", popLabel: "ପ୍ରଭାବିତ ଜନସଂଖ୍ୟା", letterTitle: "ସ୍ୱୟଂଚାଳିତ ମ୍ୟୁନିସିପାଲିଟି ଚିଠି", packServiceHeader: "ଟାର୍ଗେଟ ସେବା ବାଛନ୍ତୁ", readinessLabel: "ଦସ୍ତାବିଜ ପ୍ରସ୍ତୁତି ସ୍କୋର", missingAlert: "ମହତ୍ତ୍ୱପୂର୍ଣ୍ଣ ଦସ୍ତାବିଜ ଅନୁପସ୍ଥିତ ଅଛି", packDetailTitle: "ଆବଶ୍ୟକୀୟ ଦସ୍ତାବିଜ ଯାଞ୍ଚ ତାଲିକା", transInputTitle: "ଜଟିଳ ସରକାରୀ ବିଜ୍ଞପ୍ତି", transPlaceholder: "ଭାଷାକୁ ସରଳ କରିବା ପାଇଁ 'ଭାଷା ସରଳ କରନ୍ତୁ' କ୍ଲିକ୍ କରନ୍ତୁ।", evaName: "ସେବା ସାଥୀ", evaStatus: "ସହାୟକ ସକ୍ରିୟ", evaWelcome: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କ ସେବା ସାଥୀ ନାଗରିକ ଏଆଇ ସହାୟକ। ଯୋଜନା ଯାଞ୍ଚ କରିବା, ଦସ୍ତାବିଜ ସତ୍ୟାପନ ଏବଂ ଅଭିଯୋਗ ଦାଖଲରେ ମୁଁ ସାହାଯ್ಯ କରିପାରିବି। ଆଜି ମୁଁ କିପରି ସାହାଯ್ಯ କରିବି?" },
  as: { greeting: "নমস্কাৰ, নাগৰিক", subtitle: "স্থানীয় প্ৰশাসনৰ সৈতে আপোনাৰ বুদ্ধিমত্তাপূৰ্ণ আৰু স্বচ্ছ সংযোগলৈ আদৰণি জনাইছোঁ।", verifiedBadge: "যাচাইকৃত (আধাৰ সংযোগ)", resolvedIssues: "সমাধান কৰা অভিযোগ", avgTime: "গড় সমাধান সময়", satisfaction: "নাগৰিক সন্তুষ্টি", efficiency: "দক্ষতা স্থান", chartTitle1: "মাহিলী অভিযোগ সমাধানৰ ধাৰা", feedLeft: "স্থানীয় অভিযোগ ফীড", feedRight: "মোৰ অভিযোগসমূহ", lifeStages: "আপোনাৰ বৰ্তমান জীৱনৰ স্তৰ বাছনি কৰক", stageNewborn: "নৱজাত শিশু", stageBusiness: "নতুন ব্যৱসায় আৰম্ভ কৰা", stageMarriage: "নৱবিবাহিত", stageSenior: "জ্যেষ্ঠ নাগৰিক / পেঞ্চন", stageMoving: "নতুন চহৰলৈ স্থানান্তৰ", wizardTitle: "স্মাৰ্ট আঁচনি অৰ্হতা নিৰ্ধাৰণ", back: "পিছলৈ", next: "আগলৈ", recomHeader: "সুপাৰিশ কৰা আঁচনিসমূহ", compHeader: "অভিযোগ দাখিল কৰক", selectCat: "শ্ৰেণী বাছনি কৰক", submitBtn: "আনুষ্ঠানিক অভিযোগ দাখিল কৰক", aiIntelHeader: "অভিযোগৰ এআই বিশ্লেষণ", dupWarningTitle: "অনুলিপি সতৰ্কতা:", dupWarningDesc: "আন এজন নাগৰিকে ইতিমধ্যে এই সমস্যাৰ সন্দৰ্ভত অভিযোগ কৰিছে। আপোনাৰ আবেদনো ইয়াৰ লগত যোগ কৰা হব।", urgencyLabel: "জৰুৰী স্তৰ", popLabel: "প্ৰভাవిత জনসংখ্যা", letterTitle: "স্বয়ংক্ৰিয় চৰকাৰী পত্ৰ", packServiceHeader: "লক্ষ্য সেৱা বাছনি কৰক", readinessLabel: "নথিপত্ৰ প্ৰস্তুতি স্কোৰ", missingAlert: "গুৰুত্বপূৰ্ণ নথিপত্ৰ নাই", packDetailTitle: "প্ৰয়োজনীয় নথিপত্ৰৰ তালিকা", transInputTitle: "জটিল চৰকাৰী জাননী", transPlaceholder: "ভাষাটো সহজ কৰিবলৈ 'সহজ কৰক' বুটামত ক্লিক কৰক।", evaName: "সেৱা সাথী", evaStatus: "অনলাইন সহায়ক", evaWelcome: "নমস্কাৰ! মই আপোনাৰ সেৱা সাথী এআই সহযোগী। আঁচনি পৰীক্ষা কৰা, নথিপত্ৰৰ বৈধতা আৰু অভিযোগ পঞ্জীয়নত মই সহায় কৰিব পাৰোঁ। আজি কেনেকৈ সহায় কৰিব পাৰোঁ?" }
};

// Wizard Config
let currentWizardStage = 'newborn';
let wizardCurrentStep = 1;
const WIZARD_ANSWERS = {};
const WIZARD_SCHEMES = {
  newborn: {
    schemes: [
      { name: "Pradhan Mantri Matru Vandana Yojana (PMMVY)", dept: "Ministry of Women & Child Development", benefit: "₹5,000 Direct Cash Benefit", desc: "Maternity benefit scheme for pregnant & lactating mothers for the first living child.", reqs: ["Mother's Aadhaar", "Child Birth Certificate", "MCP Card copy"] },
      { name: "Janani Suraksha Yojana (JSY)", dept: "National Health Mission", benefit: "Cash assistance for Institutional Delivery", desc: "Promotes institutional delivery among poor pregnant women to reduce maternal mortality.", reqs: ["BPL Card", "Aadhaar Card", "Government Hospital Discharge slip"] }
    ],
    questions: [
      { step: 1, text: "Is this the mother's first living child?", options: [{ label: "Yes", val: "first" }, { label: "No", val: "multiple" }] },
      { step: 2, text: "Was the delivery performed at a government hospital or accredited private facility?", options: [{ label: "Yes, Government facility", val: "gov" }, { label: "No, Private facility", val: "private" }] },
      { step: 3, text: "Do you hold a Valid Below Poverty Line (BPL) card?", options: [{ label: "Yes", val: "bpl" }, { label: "No", val: "apl" }] }
    ]
  },
  business: {
    schemes: [
      { name: "Startup India Registration & Tax Holiday", dept: "DPIIT, Ministry of Commerce", benefit: "3 Years Income Tax Exemption & Patents rebate", desc: "A flagship initiative intended to build a strong eco-system for nurturing innovation and Startups.", reqs: ["Incorporation Certificate", "PAN Card", "Writeup of innovation"] },
      { name: "Pradhan Mantri Mudra Yojana (PMMY) - Shishu Loan", dept: "Ministry of Finance", benefit: "Collateral-Free Loan up to ₹50,000", desc: "Provides microloans to non-corporate, non-farm small/micro enterprises.", reqs: ["Business ID Proof", "Lease agreement", "Equipment quotation"] }
    ],
    questions: [
      { step: 1, text: "What is your startup concept style?", options: [{ label: "Innovative product/service with proprietary tech", val: "innovative" }, { label: "Standard retail shop or trading business", val: "standard" }] },
      { step: 2, text: "What scale of funding capital is required immediately?", options: [{ label: "Micro credit (Less than ₹50,000)", val: "micro" }, { label: "Commercial funding (Above ₹50,000)", val: "large" }] },
      { step: 3, text: "Do you have commercial zoning permission/NOC for the operating address?", options: [{ label: "Yes, NOC cleared", val: "yes" }, { label: "No, residential address", val: "no" }] }
    ]
  },
  marriage: {
    schemes: [
      { name: "Compulsory Marriage Registration Scheme", dept: "State Revenue Department", benefit: "Official Legal Certificate in 15 days", desc: "Legally registers marriage to protect rights and facilitate joint account/visa requirements.", reqs: ["Aadhaar of Groom & Bride", "Wedding Card & Photos", "3 Witness Affidavits"] }
    ],
    questions: [
      { step: 1, text: "Do both partners have official birth records confirming age eligibility (21/18)?", options: [{ label: "Yes", val: "eligible" }, { label: "No", val: "ineligible" }] },
      { step: 2, text: "What is the groom's current state of legal residency?", options: [{ label: "Karnataka Resident", val: "local" }, { label: "Other Indian State", val: "outside" }] },
      { step: 3, text: "Are you applying for a joint bank account as well?", options: [{ label: "Yes", val: "yes" }, { label: "No", val: "no" }] }
    ]
  },
  senior: {
    schemes: [
      { name: "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)", dept: "Ministry of Rural Development", benefit: "Monthly pension of ₹600 - ₹1000 direct transfer", desc: "Provides financial social security to older citizens belonging to BPL households.", reqs: ["Age Certificate (60+)", "BPL Card Copy", "Bank Passbook Linked Aadhaar"] }
    ],
    questions: [
      { step: 1, text: "Is the applicant's age 60 years or above?", options: [{ label: "Yes, verified via ID", val: "yes" }, { label: "No", val: "no" }] },
      { step: 2, text: "Does the family possess an active BPL Ration Card?", options: [{ label: "Yes", val: "bpl" }, { label: "No", val: "apl" }] },
      { step: 3, text: "Is the applicant receiving any other government pension scheme benefits?", options: [{ label: "Yes", val: "yes" }, { label: "No", val: "no" }] }
    ]
  },
  moving: {
    schemes: [
      { name: "One Nation One Ration Card (ONORC) Migration", dept: "Ministry of Consumer Affairs", benefit: "Access subsidized food grains in Bengaluru", desc: "Allows migrant citizens to buy subsidized food grains from any Fair Price Shop in Bengaluru.", reqs: ["Original Ration Card", "Aadhaar Card copy", "Migration address proof"] }
    ],
    questions: [
      { step: 1, text: "Do you possess an active ration card from your home state?", options: [{ label: "Yes", val: "yes" }, { label: "No", val: "no" }] },
      { step: 2, text: "Are all family members' Aadhaar numbers linked to the home ration card?", options: [{ label: "Yes, linked", val: "linked" }, { label: "No, pending", val: "pending" }] },
      { step: 3, text: "What is the primary reason for city relocation?", options: [{ label: "Employment / Job transfer", val: "job" }, { label: "Family / Personal reasons", val: "personal" }] }
    ]
  }
};

// Seva Sathi Bot Knowledgebase for response simulations
const AI_KNOWLEDGEBASE = {
  ration: "To apply for a new Ration Card in Bengaluru: 1) Go to the Food Civil Supplies Portal. 2) You need Aadhaar card, income certificate, and residence proof. 3) Select BPL or APL based on your income limits (BPL threshold is generally ₹1.2 Lakhs annual income).",
  pension: "Old age pension (IGNOAPS) requires the applicant to be 60+ years old and hold a BPL card. Monthly cash transfers of ₹600-1000 are deposited directly. Documents: Age certificate, bank account detail, and Aadhaar.",
  pothole: "For pothole complaints: SmartBhaarat checks duplicates instantly. The city corporation usually dispatches road contractors to repair holes within 4-7 days depending on priority. Check the Civic Twin Dashboard to see local resolution curves.",
  aadhaar: "Aadhaar update requires a Proof of Address (Rent agreement, electricity bill, or passport) or Proof of Identity. Updates are processed within 10-15 business days. You can monitor your Auto-Pack readiness score in the Document tab."
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  // Sync complaints list in LocalStorage
  if (!localStorage.getItem("sb_complaints")) {
    localStorage.setItem("sb_complaints", JSON.stringify(INITIAL_COMPLAINTS));
  }
  
  // Sync document packs in LocalStorage
  if (!localStorage.getItem("sb_doc_packs")) {
    localStorage.setItem("sb_doc_packs", JSON.stringify(DOCUMENT_PACKS));
  }
  
  // Check user session
  checkActiveSession();

  // Load Document Pack
  selectServicePack('aadhaar_update');

  // Trigger Language Translation
  changeLanguage('en');
  
  console.log("SmartBhaarat Civic Platform fully initialized.");
});

// View Routing Manager
function switchView(viewName) {
  activeView = viewName;
  
  // Update view panel classes
  document.querySelectorAll(".view-panel").forEach(panel => {
    panel.classList.remove("active-view");
  });
  
  const targetPanel = document.getElementById(`view-${viewName}`);
  if (targetPanel) {
    targetPanel.classList.add("active-view");
  }

  // Update navigation items active class
  document.querySelectorAll(".nav-menu .nav-item").forEach(item => {
    item.classList.remove("active");
  });
  const activeNavItem = document.getElementById(`tab-${viewName}`);
  if (activeNavItem) {
    activeNavItem.classList.add("active");
  }

  // Handle map resizing when switching to the issue tab
  if (viewName === 'issue') {
    setTimeout(() => {
      if (mapInstance) {
        mapInstance.invalidateSize();
      }
    }, 100);
  }
  
  // Update profile tab view specifically
  if (viewName === 'profile') {
    populateProfileData();
  }

  console.log(`Routed to view: ${viewName}`);
}

// Theme Switcher (Sleek Transition)
function toggleTheme() {
  const htmlEl = document.documentElement;
  const currentTheme = htmlEl.getAttribute("data-theme");
  const iconEl = document.getElementById("themeIcon");
  
  if (currentTheme === "dark") {
    htmlEl.setAttribute("data-theme", "light");
    activeTheme = 'light';
    iconEl.className = "fa-solid fa-moon";
  } else {
    htmlEl.setAttribute("data-theme", "dark");
    activeTheme = 'dark';
    iconEl.className = "fa-solid fa-sun";
  }
}

// Multilingual Manager
function changeLanguage(langCode) {
  activeLanguage = langCode;
  document.getElementById("langSelect").value = langCode;
  
  // Look up translation table
  const dict = TRANSLATIONS[langCode];
  if (!dict) return;

  // Translate static UI tags
  safeSetText("txt-greeting", dict.greeting);
  safeSetText("txt-subtitle", dict.subtitle);
  safeSetText("txt-verified-badge", dict.verifiedBadge);
  safeSetText("txt-metric-resolved", dict.resolvedIssues);
  safeSetText("txt-metric-time", dict.avgTime);
  safeSetText("txt-metric-satisfaction", dict.satisfaction);
  safeSetText("txt-metric-efficiency", dict.efficiency);
  
  safeSetText("txt-chart1-title", dict.chartTitle1 || dict.chartTitle1);
  safeSetText("txt-chart1-subtitle", dict.chartSubtitle1);
  safeSetText("txt-chart2-title", dict.chartTitle2);
  safeSetText("txt-chart2-subtitle", dict.chartSubtitle2);
  
  safeSetText("txt-feed-header-left", dict.feedLeft);
  safeSetText("txt-feed-header-right", dict.feedRight);
  safeSetText("txt-new-complaint-btn", dict.fileNew);
  
  safeSetText("txt-life-stages-label", dict.lifeStages);
  safeSetText("txt-stage-newborn", dict.stageNewborn);
  safeSetText("txt-stage-business", dict.stageBusiness);
  safeSetText("txt-stage-marriage", dict.stageMarriage);
  safeSetText("txt-stage-senior", dict.stageSenior);
  safeSetText("txt-stage-moving", dict.stageMoving);
  safeSetText("txt-wizard-title", dict.wizardTitle);
  safeSetText("txt-back", dict.back);
  safeSetText("txt-next", dict.next);
  safeSetText("txt-recommendations-label", dict.recomHeader);
  
  safeSetText("txt-complaint-header", dict.compHeader);
  safeSetText("lbl-issue-type", (dict.compHeader ? dict.compHeader.replace("Submit ", "") : "Complaint") + " " + "Category");
  safeSetText("txt-select-cat", dict.selectCat);
  safeSetText("txt-submit-btn", dict.submitBtn);
  safeSetText("txt-ai-intel-header", dict.aiIntelHeader);
  safeSetText("txt-dup-warning-title", dict.dupWarningTitle);
  safeSetText("txt-impact-title", "AI Impact Assessment");
  safeSetText("txt-lbl-urgency", dict.urgencyLabel);
  safeSetText("txt-lbl-pop", dict.popLabel);
  safeSetText("txt-letter-title", dict.letterTitle);
  safeSetText("txt-letter-subtitle", dict.letterSubtitle);
  
  safeSetText("txt-pack-service-header", dict.packServiceHeader);
  safeSetText("txt-readiness-label", dict.readinessLabel);
  safeSetText("txt-pack-detail-title", dict.packDetailTitle);
  
  safeSetText("txt-translator-input-title", dict.transInputTitle);
  safeSetText("txt-translator-input-subtitle", dict.transInputSubtitle);
  safeSetText("txt-translator-output-title", dict.transOutputTitle);
  
  safeSetText("txt-seva-name", dict.evaName);
  safeSetText("txt-seva-status", dict.evaStatus);
  safeSetText("txt-nav-profile", dict.greeting ? dict.greeting.split(", ")[0] + " Profile" : "My Profile");

  // Welcome bubble update
  const welcomeBubble = document.getElementById("eva-welcome-bubble");
  if (welcomeBubble) {
    welcomeBubble.innerHTML = dict.evaWelcome;
  }

  // Update categories descriptions in selection
  const selectEl = document.getElementById("form-category");
  if (selectEl && selectEl.options.length > 1) {
    selectEl.options[1].text = dict.stageBusiness === "व्यवसाय शुरू करना" ? "सड़क के गड्ढे और सड़क की मरम्मत" : "Potholes & Road Damage";
    selectEl.options[2].text = dict.stageBusiness === "व्यवसाय शुरू करना" ? "पानी का रिसाव और जल निकासी" : "Water Leakage & Sewage Block";
    selectEl.options[3].text = dict.stageBusiness === "व्यवसाय शुरू करना" ? "कचरा और स्वच्छता" : "Garbage Pile & Cleanliness";
    selectEl.options[4].text = dict.stageBusiness === "व्यवसाय शुरू करना" ? "स्ट्रीट लाइट बंद होना" : "Street Light Outage";
    selectEl.options[5].text = dict.stageBusiness === "व्यवसाय शुरू करना" ? "सार्वजनिक सुरक्षा चिंता" : "Public Safety Concern";
  }

  // Re-run elements
  renderDashboard();
  renderWizardQuestion();
  renderDocumentSlots();
}

function safeSetText(id, text) {
  const el = document.getElementById(id);
  if (el && text) {
    el.innerHTML = text;
  }
}

// Onboarding Controller (Sign Up / Login Flows)
function toggleOnboardingTab(tab) {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const loginBtn = document.getElementById("tab-login-btn");
  const signupBtn = document.getElementById("tab-signup-btn");

  if (tab === 'login') {
    loginForm.classList.add("active");
    signupForm.classList.remove("active");
    loginBtn.classList.add("active");
    signupBtn.classList.remove("active");
  } else {
    loginForm.classList.remove("active");
    signupForm.classList.add("active");
    loginBtn.classList.remove("active");
    signupBtn.classList.add("active");
  }
  
  // Clear error messages
  document.getElementById("login-error-msg").style.display = "none";
  document.getElementById("signup-error-msg").style.display = "none";
}

function handleSignUp() {
  const name = document.getElementById("signup-name").value.trim();
  const aadhaar = document.getElementById("signup-aadhaar").value.trim();
  const phone = document.getElementById("signup-phone").value.trim();
  const state = document.getElementById("signup-state").value.trim();
  const district = document.getElementById("signup-district").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const errorEl = document.getElementById("signup-error-msg");

  // Validate lengths
  if (aadhaar.length !== 12 || isNaN(aadhaar)) {
    errorEl.innerText = "Aadhaar must be exactly 12 digits.";
    errorEl.style.display = "block";
    return;
  }
  if (phone.length !== 10 || isNaN(phone)) {
    errorEl.innerText = "Phone number must be exactly 10 digits.";
    errorEl.style.display = "block";
    return;
  }
  if (password.length < 6) {
    errorEl.innerText = "Password must be at least 6 characters.";
    errorEl.style.display = "block";
    return;
  }

  // Create profile database
  const profile = { name, aadhaar, phone, state, district, password };
  localStorage.setItem("sb_user_profile", JSON.stringify(profile));

  // Hide onboarding
  document.getElementById("onboardingScreen").style.opacity = "0";
  setTimeout(() => {
    document.getElementById("onboardingScreen").style.display = "none";
  }, 400);

  // Initialize view
  checkActiveSession();
  initMap();
}

function handleLogin() {
  const identifier = document.getElementById("login-identifier").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const errorEl = document.getElementById("login-error-msg");

  // Look up profile database
  const savedProfile = JSON.parse(localStorage.getItem("sb_user_profile"));
  
  if (savedProfile && (identifier === savedProfile.aadhaar || identifier === savedProfile.phone) && password === savedProfile.password) {
    // Hide onboarding overlay
    document.getElementById("onboardingScreen").style.opacity = "0";
    setTimeout(() => {
      document.getElementById("onboardingScreen").style.display = "none";
    }, 400);

    checkActiveSession();
    initMap();
  } else {
    // Check fallback default credentials if db empty
    if (!savedProfile && (identifier === "123456789012" || identifier === "9876543210") && password === "citizen") {
      const defaultProfile = {
        name: "Rudraksh Sharma",
        aadhaar: "123456789012",
        phone: "9876543210",
        state: "Karnataka",
        district: "Bengaluru",
        password: "citizen"
      };
      localStorage.setItem("sb_user_profile", JSON.stringify(defaultProfile));
      document.getElementById("onboardingScreen").style.display = "none";
      checkActiveSession();
      initMap();
    } else {
      errorEl.style.display = "block";
    }
  }
}

function checkActiveSession() {
  const savedProfile = JSON.parse(localStorage.getItem("sb_user_profile"));
  
  if (savedProfile) {
    document.getElementById("onboardingScreen").style.display = "none";
    
    // Set greeting details
    safeSetText("txt-greeting", `${activeLanguage === 'hi' ? 'नमस्ते' : 'Namaste'}, ${savedProfile.name}`);
    
    // Set location badges
    const locBadge = document.getElementById("txt-location-badge");
    if (locBadge) {
      locBadge.innerText = `${savedProfile.district}, ${savedProfile.state}`;
    }
    
    populateProfileData();
    renderDashboard();
  } else {
    // Show onboarding
    document.getElementById("onboardingScreen").style.display = "flex";
    document.getElementById("onboardingScreen").style.opacity = "1";
  }
}

function handleLogout() {
  localStorage.removeItem("sb_user_profile");
  checkActiveSession();
}

// Profile Page Management
function populateProfileData() {
  const profile = JSON.parse(localStorage.getItem("sb_user_profile"));
  if (!profile) return;

  safeSetText("profile-display-name", profile.name);
  safeSetText("profile-val-name", profile.name);
  safeSetText("profile-val-phone", profile.phone);
  safeSetText("profile-val-aadhaar", maskAadhaar(profile.aadhaar));
  
  document.getElementById("profile-input-state").value = profile.state;
  document.getElementById("profile-input-district").value = profile.district;
}

function saveProfileChanges() {
  const profile = JSON.parse(localStorage.getItem("sb_user_profile"));
  if (!profile) return;

  const stateVal = document.getElementById("profile-input-state").value.trim();
  const districtVal = document.getElementById("profile-input-district").value.trim();

  if (stateVal && districtVal) {
    profile.state = stateVal;
    profile.district = districtVal;
    localStorage.setItem("sb_user_profile", JSON.stringify(profile));

    // Update location badges instantly
    document.getElementById("txt-location-badge").innerText = `${districtVal}, ${stateVal}`;
  }
}

function maskAadhaar(aadhaar) {
  if (aadhaar.length < 4) return aadhaar;
  const last4 = aadhaar.substring(aadhaar.length - 4);
  return `XXXX - XXXX - ${last4}`;
}

// Leaflet Map Initialization
function initMap() {
  if (mapInstance || document.getElementById("onboardingScreen").style.display !== "none") return;

  // Initialize map centered at Bengaluru, zoom level 15
  mapInstance = L.map('map-selector', {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView(DEFAULT_COORDINATES, 15);

  // Use a Voyager tile layer for modern aesthetics
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(mapInstance);

  // Setup click handler to place pin
  mapInstance.on('click', (e) => {
    placeMarker(e.latlng.lat, e.latlng.lng);
  });

  // Load existing mock complaints as static markers
  const complaints = JSON.parse(localStorage.getItem("sb_complaints")) || [];
  complaints.forEach(item => {
    L.circleMarker([item.latitude, item.longitude], {
      radius: 8,
      fillColor: item.status === 'resolved' ? '#10b981' : '#fbbf24',
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(mapInstance)
      .bindPopup(`<strong>${item.category}</strong><br>${item.description.substring(0, 50)}...`);
  });

  // Place initial marker at center
  placeMarker(DEFAULT_COORDINATES[0], DEFAULT_COORDINATES[1], "Indira Nagar Central Metro");
}

function placeMarker(lat, lng, label = "") {
  document.getElementById("form-lat").value = lat.toFixed(6);
  document.getElementById("form-lng").value = lng.toFixed(6);
  
  // Set mock address label
  const mockAddress = label || getMockAddressForCoords(lat, lng);
  document.getElementById("form-address").value = mockAddress;

  if (currentMarker) {
    currentMarker.setLatLng([lat, lng]);
  } else {
    currentMarker = L.marker([lat, lng], { draggable: true }).addTo(mapInstance);
    currentMarker.on('dragend', function (event) {
      const position = currentMarker.getLatLng();
      placeMarker(position.lat, position.lng);
    });
  }
  
  // Pan to marker
  mapInstance.panTo([lat, lng]);

  // Trigger complaint intel (duplicate check)
  runAIComplaintIntel();
}

function getMockAddressForCoords(lat, lng) {
  const dLat = lat - DEFAULT_COORDINATES[0];
  const dLng = lng - DEFAULT_COORDINATES[1];
  
  if (Math.abs(dLat) < 0.001 && Math.abs(dLng) < 0.001) {
    return "12th Main Road, Indira Nagar, Bengaluru";
  }
  if (dLat > 0 && dLng > 0) {
    return "Phase 2, Indira Nagar, Near ESI Hospital, Bengaluru";
  }
  if (dLat < 0 && dLng < 0) {
    return "Domlur Layout 4th Cross, Bengaluru";
  }
  return "Appaswamy Road, Sector 3, Halasuru, Bengaluru";
}

// Calculate distance in meters using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in meters
}

// AI Complaint Intelligence
function runAIComplaintIntel() {
  const category = document.getElementById("form-category").value;
  const description = document.getElementById("form-description").value;
  const lat = parseFloat(document.getElementById("form-lat").value);
  const lng = parseFloat(document.getElementById("form-lng").value);

  if (!lat || !lng) return;

  // 1. Duplicate Detection
  const complaints = JSON.parse(localStorage.getItem("sb_complaints")) || [];
  let duplicateFound = false;
  let duplicateDist = 9999;
  
  complaints.forEach(item => {
    if (category && item.category === category) {
      const dist = calculateDistance(lat, lng, item.latitude, item.longitude);
      if (dist < 400) { // within 400 meters
        duplicateFound = true;
        if (dist < duplicateDist) {
          duplicateDist = Math.round(dist);
        }
      }
    }
  });

  const dupAlertPanel = document.getElementById("duplicateAlertPanel");
  if (duplicateFound && category) {
    dupAlertPanel.style.display = "block";
    const descText = activeLanguage === 'hi' 
      ? `एक नागरिक ने पहले ही ${duplicateDist} मीटर दूर इस समस्या की शिकायत दर्ज की है। आपकी रिपोर्ट को इसकी गंभीरता बढ़ाने के लिए जोड़ दिया जाएगा।`
      : `A citizen has already filed a complaint about this issue ${duplicateDist}m away. Your report will be appended to support urgency.`;
    document.getElementById("txt-dup-warning-desc").innerText = descText;
  } else {
    dupAlertPanel.style.display = "none";
  }

  // 2. Impact Prediction & Urgency Simulation
  let urgency = "Low";
  let affectedPop = 150;

  if (category) {
    if (category.includes("Water") || category.includes("Safety")) {
      urgency = "Critical";
      affectedPop = 2800;
    } else if (category.includes("Potholes")) {
      urgency = "High";
      affectedPop = 1200;
    } else {
      urgency = "Medium";
      affectedPop = 450;
    }
  }

  // Boost metrics if description has critical keywords
  if (description) {
    const descLower = description.toLowerCase();
    if (descLower.includes("accident") || descLower.includes("flooding") || descLower.includes("broken bone") || descLower.includes("leakage")) {
      urgency = "Critical";
      affectedPop = Math.round(affectedPop * 1.5);
    }
  }

  document.getElementById("intel-urgency").innerText = urgency;
  document.getElementById("intel-urgency").style.color = urgency === 'Critical' ? '#ef4444' : (urgency === 'High' ? '#f59e0b' : '#3b82f6');
  document.getElementById("intel-impact").innerText = `${affectedPop} Citizens`;

  // 3. Draft Official Letter to Commissioner
  let letter = "";
  if (category && description) {
    const address = document.getElementById("form-address").value || "Indira Nagar, Bengaluru";
    const dept = category.split(" / ")[0];
    const profile = JSON.parse(localStorage.getItem("sb_user_profile")) || { name: "Citizen" };
    
    letter = `PETITION TO THE MUNICIPAL COMMISSIONER
Date: ${new Date().toLocaleDateString()}
Location reference: ${address} (Coords: ${lat.toFixed(4)}, ${lng.toFixed(4)})
Subject: Official Grievance regarding ${dept} failure

Dear Commissioner,

I, ${profile.name}, a registered resident of Bengaluru, write to formally petition your office under Section 112 of the Municipal Corporation Act. We are experiencing critical issues pertaining to ${category} which is impacting local safety and infrastructure.

Details:
${description}

According to civic circular standard SLA-14, the average response timeframe for this failure is 48 hours. This issue presents an estimated public safety threat to over ${affectedPop} citizens in the vicinity.

We urge immediate remedial dispatch to local maintenance.

Sincerely,
${profile.name} (ID: Verified Aadhaar Link)`;
  }
  document.getElementById("intel-letter-text").value = letter;
}

// Submit Civic Grievance
function submitGrievance() {
  const category = document.getElementById("form-category").value;
  const description = document.getElementById("form-description").value;
  const lat = parseFloat(document.getElementById("form-lat").value);
  const lng = parseFloat(document.getElementById("form-lng").value);
  const address = document.getElementById("form-address").value;

  if (!category || !description || !lat || !lng) {
    alert("Please fill all fields and pin the location.");
    return;
  }

  const complaints = JSON.parse(localStorage.getItem("sb_complaints")) || [];
  const newId = `COMP-${100 + complaints.length + 1}`;

  const newGrievance = {
    id: newId,
    category: category,
    description: description,
    latitude: lat,
    longitude: lng,
    address: address,
    status: "pending",
    urgency: document.getElementById("intel-urgency").innerText,
    impact: parseInt(document.getElementById("intel-impact").innerText),
    timestamp: new Date().toISOString()
  };

  complaints.unshift(newGrievance);
  localStorage.setItem("sb_complaints", JSON.stringify(complaints));

  // Reset form
  document.getElementById("grievanceForm").reset();
  document.getElementById("upload-preview-container").style.display = "none";
  placeMarker(DEFAULT_COORDINATES[0], DEFAULT_COORDINATES[1]);

  alert("Complaint registered successfully! Retrievable inside Dashboard.");
  
  // Route to Dashboard
  switchView('dashboard');
  renderDashboard();
}

// Photo Upload Mockups for issue
function simulateGrievancePhotoUpload() {
  document.getElementById("form-file").click();
}

function onGrievancePhotoSelected(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("upload-preview").src = e.target.result;
      document.getElementById("upload-preview-container").style.display = "block";
      
      // Trigger short scanner overlay to verify image metadata
      triggerDocScanner("Verifying issue photography...", "Scanning EXIF metadata & GPS verification", () => {
        alert("Image verification complete. Coordinates match the pinned map location!");
      });
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Dashboard Renderer
function renderDashboard() {
  const complaints = JSON.parse(localStorage.getItem("sb_complaints")) || [];
  
  // Render metrics
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length + 480; // offset for mock numbers
  const countEl = document.getElementById("metric-resolved-count");
  if (countEl) countEl.innerText = resolvedCount;
  
  // Render feeds
  const communityList = document.getElementById("community-feed-list");
  const myList = document.getElementById("my-feed-list");

  if (!communityList || !myList) return;

  communityList.innerHTML = "";
  myList.innerHTML = "";

  // Render community feed (all complaints)
  complaints.forEach((c, idx) => {
    const itemHtml = `
      <div class="feed-item">
        <div class="feed-status-icon status-${c.status}">
          <i class="fa-solid ${c.status === 'resolved' ? 'fa-check' : (c.status === 'review' ? 'fa-user-clock' : 'fa-clock')}"></i>
        </div>
        <div class="feed-details">
          <div class="feed-title">${c.category}</div>
          <div class="feed-desc">${c.description.substring(0, 75)}...</div>
          <div class="feed-meta">
            <span><i class="fa-solid fa-location-dot"></i> ${c.address}</span>
            <span>${timeAgo(c.timestamp)}</span>
          </div>
        </div>
      </div>
    `;

    if (idx < 5) {
      communityList.insertAdjacentHTML("beforeend", itemHtml);
    }
  });

  // Render My submissions
  const myComplaints = complaints.slice(0, 3);
  myComplaints.forEach(c => {
    const itemHtml = `
      <div class="feed-item">
        <div class="feed-status-icon status-${c.status}">
          <i class="fa-solid ${c.status === 'resolved' ? 'fa-check' : (c.status === 'review' ? 'fa-user-clock' : 'fa-clock')}"></i>
        </div>
        <div class="feed-details">
          <div class="feed-title">${c.category}</div>
          <div class="feed-desc">Urgency: <strong>${c.urgency}</strong> | Affected: ${c.impact} Citizens</div>
          <div class="feed-meta">
            <span>Ticket: ${c.id}</span>
            <span>Status: <strong style="text-transform: capitalize;">${c.status}</strong></span>
          </div>
        </div>
      </div>
    `;
    myList.insertAdjacentHTML("beforeend", itemHtml);
  });

  // Render SVG charts
  renderTrendChart();
  renderDistributionChart();
}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// SVG Chart Draw Helpers (Pure, Clean Portability)
function renderTrendChart() {
  const container = document.getElementById("trendChartContainer");
  if (!container) return;

  const width = container.clientWidth || 500;
  const height = 300;
  
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const reported = [45, 62, 54, 78, 65, 88];
  const resolved = [38, 51, 49, 72, 60, 84];

  let pointsReported = "";
  let pointsResolved = "";
  
  const xOffset = 50;
  const yOffset = 40;
  const chartW = width - xOffset - 20;
  const chartH = height - yOffset - 30;

  for (let i = 0; i < labels.length; i++) {
    const x = xOffset + (i * (chartW / (labels.length - 1)));
    const yr = height - yOffset - (reported[i] * (chartH / 100));
    const ys = height - yOffset - (resolved[i] * (chartH / 100));
    
    pointsReported += `${x},${yr} `;
    pointsResolved += `${x},${ys} `;
  }

  let gridLines = "";
  for (let val = 0; val <= 100; val += 20) {
    const y = height - yOffset - (val * (chartH / 100));
    gridLines += `<line x1="${xOffset}" y1="${y}" x2="${width - 20}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4,4"/>
                  <text class="chart-text" x="${xOffset - 12}" y="${y + 4}" text-anchor="end">${val}</text>`;
  }

  let textLabels = "";
  for (let i = 0; i < labels.length; i++) {
    const x = xOffset + (i * (chartW / (labels.length - 1)));
    textLabels += `<text class="chart-text" x="${x}" y="${height - 10}" text-anchor="middle">${labels[i]}</text>`;
  }

  const svgContent = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="reportedGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff7b39" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#ff7b39" stop-opacity="0.0"/>
        </linearGradient>
        <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      
      ${gridLines}
      ${textLabels}
      
      <polygon points="${xOffset},${height - yOffset} ${pointsReported} ${width - 20},${height - yOffset}" fill="url(#reportedGrad)" />
      <polygon points="${xOffset},${height - yOffset} ${pointsResolved} ${width - 20},${height - yOffset}" fill="url(#resolvedGrad)" />
      
      <polyline points="${pointsReported}" fill="none" stroke="#ff7b39" stroke-width="3" stroke-linecap="round" />
      <polyline points="${pointsResolved}" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" />
      
      <g transform="translate(${width - 200}, 20)">
        <circle cx="10" cy="10" r="5" fill="#ff7b39" />
        <text class="chart-text" x="20" y="14">Reported</text>
        <circle cx="100" cy="10" r="5" fill="#10b981" />
        <text class="chart-text" x="110" y="14">Resolved</text>
      </g>
    </svg>
  `;

  container.innerHTML = svgContent;
}

function renderDistributionChart() {
  const container = document.getElementById("distributionChartContainer");
  if (!container) return;

  const width = container.clientWidth || 300;
  const height = 300;

  const data = [
    { label: "Potholes", val: 40, color: "#4f6ef2" },
    { label: "Water", val: 25, color: "#00f2fe" },
    { label: "Sanitation", val: 20, color: "#10b981" },
    { label: "Lights", val: 15, color: "#fbbf24" }
  ];

  const cx = width / 2;
  const cy = height / 2 - 10;
  const r = 70;
  const innerR = 45;

  let total = 0;
  data.forEach(d => total += d.val);

  let currentAngle = -Math.PI / 2;
  let paths = "";
  let legend = "";

  data.forEach((d, idx) => {
    const angle = (d.val / total) * 2 * Math.PI;
    
    const x1 = cx + r * Math.cos(currentAngle);
    const y1 = cy + r * Math.sin(currentAngle);
    const x2 = cx + r * Math.cos(currentAngle + angle);
    const y2 = cy + r * Math.sin(currentAngle + angle);

    const ix1 = cx + innerR * Math.cos(currentAngle + angle);
    const iy1 = cy + innerR * Math.sin(currentAngle + angle);
    const ix2 = cx + innerR * Math.cos(currentAngle);
    const iy2 = cy + innerR * Math.sin(currentAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    paths += `<path d="M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z" 
                    fill="${d.color}" stroke="var(--bg-secondary)" stroke-width="2"/>`;

    legend += `
      <g transform="translate(${(idx % 2) * (width / 2) + 15}, ${height - 40 + Math.floor(idx / 2) * 20})">
        <rect width="12" height="12" rx="3" fill="${d.color}" />
        <text class="chart-text" x="18" y="10">${d.label} (${d.val}%)</text>
      </g>
    `;

    currentAngle += angle;
  });

  const svgContent = `
    <svg width="${width}" height="${height}">
      ${paths}
      <circle cx="${cx}" cy="${cy}" r="${innerR - 2}" fill="var(--bg-secondary)" />
      <text class="chart-text" x="${cx}" y="${cy}" text-anchor="middle" font-weight="700" font-size="14px" fill="var(--text-primary)">Civic</text>
      <text class="chart-text" x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="10px">Twin AI</text>
      ${legend}
    </svg>
  `;

  container.innerHTML = svgContent;
}

// 2. Services & Life Stage Recommendations
function selectLifeEvent(eventCode) {
  currentWizardStage = eventCode;
  
  document.querySelectorAll(".life-events-grid .event-card").forEach(card => {
    card.classList.remove("selected");
  });
  document.getElementById(`event-${eventCode}`).classList.add("selected");

  document.getElementById("scheme-wizard-panel").style.display = "block";
  document.getElementById("schemes-recommendations-box").style.display = "none";
  
  wizardCurrentStep = 1;
  Object.keys(WIZARD_ANSWERS).forEach(key => delete WIZARD_ANSWERS[key]);

  renderWizardQuestion();
  document.getElementById("scheme-wizard-panel").scrollIntoView({ behavior: 'smooth' });
}

function renderWizardQuestion() {
  const wizardBox = WIZARD_SCHEMES[currentWizardStage];
  if (!wizardBox) return;

  const currentQuestionObj = wizardBox.questions[wizardCurrentStep - 1];
  const container = document.getElementById("wizard-questions-container");

  for (let s = 1; s <= 3; s++) {
    const node = document.getElementById(`step-node-${s}`);
    node.className = "step-node";
    if (s < wizardCurrentStep) {
      node.classList.add("completed");
      node.innerHTML = `<i class="fa-solid fa-check"></i>`;
    } else if (s === wizardCurrentStep) {
      node.classList.add("active");
      node.innerHTML = s;
    } else {
      node.innerHTML = s;
    }
  }

  let optionsHtml = "";
  currentQuestionObj.options.forEach(opt => {
    const isSelected = WIZARD_ANSWERS[wizardCurrentStep] === opt.val;
    optionsHtml += `
      <div class="wizard-option ${isSelected ? 'selected' : ''}" onclick="selectWizardAnswer(${wizardCurrentStep}, '${opt.val}')">
        <i class="fa-solid ${isSelected ? 'fa-circle-dot' : 'fa-circle'}"></i>
        <span>${opt.label}</span>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="wizard-question">${currentQuestionObj.text}</div>
    <div class="wizard-options">${optionsHtml}</div>
  `;

  document.getElementById("btn-wizard-prev").style.visibility = wizardCurrentStep > 1 ? "visible" : "hidden";
  
  const nextBtnText = document.getElementById("btn-wizard-next");
  if (wizardCurrentStep === 3) {
    nextBtnText.innerHTML = activeLanguage === 'hi' ? `अनुशंसाएं प्राप्त करें <i class="fa-solid fa-wand-magic-sparkles"></i>` : `Get Recommendations <i class="fa-solid fa-wand-magic-sparkles"></i>`;
  } else {
    nextBtnText.innerHTML = (activeLanguage === 'hi' ? 'अगला ' : 'Next ') + `<i class="fa-solid fa-arrow-right"></i>`;
  }
}

function selectWizardAnswer(step, value) {
  WIZARD_ANSWERS[step] = value;
  renderWizardQuestion();
}

function wizardPrev() {
  if (wizardCurrentStep > 1) {
    wizardCurrentStep--;
    renderWizardQuestion();
  }
}

function wizardNext() {
  if (!WIZARD_ANSWERS[wizardCurrentStep]) {
    alert("Please select an answer to continue.");
    return;
  }

  if (wizardCurrentStep < 3) {
    wizardCurrentStep++;
    renderWizardQuestion();
  } else {
    showSchemeRecommendations();
  }
}

function showSchemeRecommendations() {
  document.getElementById("scheme-wizard-panel").style.display = "none";
  
  const recommendationBox = document.getElementById("schemes-recommendations-box");
  const container = document.getElementById("schemes-list-container");
  
  recommendationBox.style.display = "flex";
  container.innerHTML = "";

  const schemes = WIZARD_SCHEMES[currentWizardStage].schemes;

  schemes.forEach(s => {
    let reqTags = "";
    s.reqs.forEach(r => {
      reqTags += `<span class="req-tag">${r}</span>`;
    });

    const cardHtml = `
      <div class="scheme-card">
        <div class="scheme-header">
          <div>
            <div class="scheme-name">${s.name}</div>
            <div class="scheme-dept">${s.dept}</div>
          </div>
          <span class="scheme-benefit">${s.benefit}</span>
        </div>
        <div class="scheme-desc">${s.desc}</div>
        <div style="font-size: 11.5px; font-weight:600; margin-bottom: 6px; color: var(--text-muted);">Required Documents Checklist:</div>
        <div class="scheme-requirements">
          ${reqTags}
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-primary" onclick="applyScheme('${s.name}')">Apply Online</button>
          <button class="btn btn-secondary" onclick="addToDocumentPack('${currentWizardStage}')">Generate Doc Pack</button>
        </div>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", cardHtml);
  });

  recommendationBox.scrollIntoView({ behavior: 'smooth' });
}

function applyScheme(schemeName) {
  alert(`Routing to unified state portal for: ${schemeName}. Pinned coordinates automatically parsed to speed up form completion.`);
}

function addToDocumentPack(stage) {
  let targetPack = "aadhaar_update";
  if (stage === 'business') targetPack = "business_license";
  if (stage === 'senior') targetPack = "senior_pension";

  selectServicePack(targetPack);
  switchView('pack');
  alert("Matching Document Auto-Pack generated. Upload the missing items to check readiness!");
}

// 4. Document Auto-Pack & OCR check
let activePackId = 'aadhaar_update';

function selectServicePack(packId) {
  activePackId = packId;
  
  document.querySelectorAll(".pack-service-option").forEach(card => {
    card.classList.remove("active");
  });
  document.getElementById(`pack-${packId}`).classList.add("active");

  renderDocumentSlots();
}

function renderDocumentSlots() {
  const packs = JSON.parse(localStorage.getItem("sb_doc_packs")) || DOCUMENT_PACKS;
  const activePack = packs[activePackId];
  if (!activePack) return;

  const container = document.getElementById("document-slots-container");
  container.innerHTML = "";

  activePack.docs.forEach(doc => {
    const slotHtml = `
      <div class="document-slot ${doc.verified ? 'verified' : ''}">
        <div class="document-slot-info">
          <div class="document-slot-icon">
            <i class="fa-solid ${doc.verified ? 'fa-file-shield' : 'fa-file-circle-question'}"></i>
          </div>
          <div>
            <div class="document-slot-name">${doc.name}</div>
            <div class="document-slot-status">${doc.verified ? (activeLanguage === 'hi' ? 'सत्यापित और स्वीकृत' : 'Verified & Approved') : (activeLanguage === 'hi' ? 'सत्यापन लंबित' : 'Pending Verification')}</div>
          </div>
        </div>
        <div class="document-slot-actions">
          ${doc.verified ? 
            `<button class="btn btn-secondary" style="padding:6px 12px; font-size:12px;" onclick="downloadMockDoc('${doc.file}')"><i class="fa-solid fa-download"></i> View</button>` : 
            `<button class="btn btn-primary" style="padding:6px 12px; font-size:12px;" onclick="triggerScanSlot('${doc.id}')"><i class="fa-solid fa-qrcode"></i> Upload & Scan</button>
             <input type="file" id="input-${doc.id}" class="file-input-hidden" onchange="runMockOCR('${doc.id}')">`
          }
        </div>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", slotHtml);
  });

  recalculateReadinessScore(packs);
}

function triggerScanSlot(slotId) {
  document.getElementById(`input-${slotId}`).click();
}

function triggerDocScanner(mainText, subText, callback) {
  const overlay = document.getElementById("scannerOverlay");
  const txt = document.getElementById("scannerText");
  const sub = document.getElementById("scannerSubtext");

  txt.innerText = mainText;
  sub.innerText = subText;
  overlay.style.display = "flex";

  setTimeout(() => {
    overlay.style.display = "none";
    if (callback) callback();
  }, 2200);
}

function runMockOCR(docId) {
  const fileInput = document.getElementById(`input-${docId}`);
  if (fileInput.files && fileInput.files[0]) {
    const fileName = fileInput.files[0].name;
    
    triggerDocScanner("AI OCR Document Scanner running...", `Analyzing parameters on ${fileName}`, () => {
      const packs = JSON.parse(localStorage.getItem("sb_doc_packs")) || DOCUMENT_PACKS;
      const activePack = packs[activePackId];
      
      const doc = activePack.docs.find(d => d.id === docId);
      if (doc) {
        doc.verified = true;
        doc.file = fileName;
        doc.status = "Verified & Approved";
      }

      localStorage.setItem("sb_doc_packs", JSON.stringify(packs));
      renderDocumentSlots();
      alert(`GenAI Verification Successful: ${doc.name} matches required citizen profile metadata!`);
    });
  }
}

function downloadMockDoc(fileName) {
  alert(`Opening secure encrypted view of document: ${fileName}`);
}

function recalculateReadinessScore(packs) {
  const activePack = packs[activePackId];
  if (!activePack) return;

  const total = activePack.docs.length;
  const verifiedCount = activePack.docs.filter(d => d.verified).length;
  
  const scorePercent = Math.round((verifiedCount / total) * 100);
  
  document.getElementById("pack-score-percent").innerText = `${scorePercent}%`;
  document.getElementById("pack-progress-bar").style.width = `${scorePercent}%`;
  
  const missingCount = total - verifiedCount;
  const alertText = document.getElementById("pack-missing-alert");
  if (missingCount === 0) {
    alertText.innerText = activeLanguage === 'hi' ? "सभी दस्तावेज़ सत्यापित हैं! आवेदन जमा करने के लिए तैयार है।" : "All documents verified! Pack is ready for submission.";
    alertText.style.color = "var(--green-modern)";
  } else {
    alertText.innerText = activeLanguage === 'hi' ? `${missingCount} महत्वपूर्ण दस्तावेज़ गायब हैं` : `Missing ${missingCount} critical documents`;
    alertText.style.color = "var(--saffron-modern)";
  }
}

// 5. Bureaucracy Translator
function loadJargonTemplate(tmplKey) {
  const tmpl = TRANSLATION_TEMPLATES[tmplKey];
  if (tmpl) {
    document.getElementById("jargon-input").value = tmpl.jargon;
    runBureaucracyTranslation();
  }
}

function runBureaucracyTranslation() {
  const input = document.getElementById("jargon-input").value;
  const outputBox = document.getElementById("jargon-output-box");

  if (!input.trim()) {
    alert("Please paste some legal terms first.");
    return;
  }

  let matchedHtml = "";
  
  Object.keys(TRANSLATION_TEMPLATES).forEach(key => {
    const item = TRANSLATION_TEMPLATES[key];
    if (input.includes(item.jargon.substring(0, 30))) {
      matchedHtml = item.translation[activeLanguage] || item.translation['en'];
    }
  });

  if (matchedHtml) {
    outputBox.innerHTML = matchedHtml;
  } else {
    const clauses = input.split(", ");
    let items = "";
    clauses.forEach(c => {
      if (c.trim().length > 10) {
        items += `<li><strong>Auto-Simplified:</strong> ${c.replace("provided always that", "Note:").replace("Pursuant to", "Under")}</li>`;
      }
    });

    outputBox.innerHTML = `
      <h3>Simplified Summary (GenAI generated):</h3>
      <p>Your uploaded text contains complex legalese. Here are the core actions extracted:</p>
      <ul>
        ${items || "<li>Verify dates and names mentioned in circular to ensure timeliness.</li><li>Ensure you submit identical copies to avoid official cures.</li>"}
      </ul>
      <p style="font-size:11px; color: var(--text-muted);">Self-directed GenAI rules summary applied.</p>
    `;
  }
}

// Seva Sathi Floating AI Chat Engine
function toggleEvaPanel() {
  const panel = document.getElementById("evaPanel");
  const mainContent = document.getElementById("mainContent");
  
  panel.classList.toggle("expanded");
  mainContent.classList.toggle("chat-expanded");
}

function sendEvaChatMessage() {
  const inputEl = document.getElementById("evaInputBox");
  const messageText = inputEl.value.trim();
  
  if (!messageText) return;

  appendChatBubble(messageText, "user");
  inputEl.value = "";

  const indicator = document.getElementById("evaTypingIndicator");
  indicator.style.display = "flex";
  document.getElementById("evaSuggestions").style.display = "none";

  setTimeout(() => {
    indicator.style.display = "none";
    const reply = generateAIResponseText(messageText);
    appendChatBubble(reply, "ai");

    if (isVoiceReadoutEnabled) {
      speakAloud(reply);
    }
  }, 1200);
}

function handleSuggestedPrompt(key) {
  let promptText = "";
  if (key === 'ration') promptText = activeLanguage === 'hi' ? "राशन कार्ड के लिए आवेदन कैसे करें?" : "How do I apply for a Ration Card?";
  if (key === 'pension') promptText = activeLanguage === 'hi' ? "पेंशन पात्रता के नियम क्या हैं?" : "What are pension eligibility rules?";
  if (key === 'pothole') promptText = activeLanguage === 'hi' ? "मेरे गड्ढे की शिकायत कैसे चल रही है?" : "How is my pothole complaint progressing?";

  document.getElementById("evaInputBox").value = promptText;
  sendEvaChatMessage();
}

function appendChatBubble(text, sender) {
  const chatHistory = document.getElementById("evaChatHistory");
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble chat-bubble-${sender}`;
  bubble.innerHTML = text;
  chatHistory.appendChild(bubble);
  
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function generateAIResponseText(userText) {
  const query = userText.toLowerCase();
  let response = "I'm sorry, I'm still analyzing government circular databases to answer that specifically. Try asking about 'Ration card', 'Pension rules', or 'Pothole repairs'!";

  if (query.includes("ration") || query.includes("राशन")) {
    response = AI_KNOWLEDGEBASE.ration;
  } else if (query.includes("pension") || query.includes("पेंशन")) {
    response = AI_KNOWLEDGEBASE.pension;
  } else if (query.includes("pothole") || query.includes("गड्ढे") || query.includes("доро")) {
    response = AI_KNOWLEDGEBASE.pothole;
  } else if (query.includes("aadhaar") || query.includes("आधार")) {
    response = AI_KNOWLEDGEBASE.aadhaar;
  } else if (query.includes("namaste") || query.includes("hello") || query.includes("नमस्ते")) {
    response = activeLanguage === 'hi' 
      ? "नमस्ते! मैं आपका सेवा साथी एआई हूँ। मैं आपकी सहायता कैसे कर सकता हूँ?" 
      : "Namaste! I am your Seva Sathi AI. How can I help you today?";
  }

  // Multilingual fallback responses
  if (activeLanguage !== 'en') {
    const dict = TRANSLATIONS[activeLanguage];
    if (response === AI_KNOWLEDGEBASE.ration) {
      response = dict.stageBusiness === "व्यवसाय शुरू करना" 
        ? "ಬೆಂಗಳೂರಿನಲ್ಲಿ ಹೊಸ ರೇಷನ್ ಕಾರ್ಡ್ ಪಡೆಯಲು: 1) ಆಹಾರ ಇಲಾಖೆಯ ವೆಬ್‌ಸೈಟ್‌ಗೆ ಭೇಟಿ ನೀಡಿ. 2) ಆಧಾರ್ ಕಾರ್ಡ್, ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ ಬೇಕಾಗುತ್ತದೆ. 3) ಬಿಪಿಎಲ್ ಸೀಮೆ ₹1.2 ಲಕ್ಷ ಆದಾಯ ಮಿತಿ ಹೊಂದಿದೆ."
        : "ಬೆಂಗಳೂರಿನಲ್ಲಿ ಹೊಸ ರೇಷನ್ ಕಾರ್ಡ್ ಪಡೆಯಲು: 1) ಆಹಾರ ಇಲಾಖೆಯ ವೆಬ್‌ಸೈಟ್‌ಗೆ ಭೇಟಿ ನೀಡಿ. 2) ಆಧಾರ್ ಕಾರ್ಡ್, ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ ಬೇಕಾಗುತ್ತದೆ. 3) ಬಿಪಿಎಲ್ ಸೀಮೆ ₹1.2 ಲಕ್ಷ ಆದಾಯ ಮಿತಿ ಹೊಂದಿದೆ.";
    }
  }

  return response;
}

// Speech Recognition & Synthesis (multilingual voice support)
function toggleVoiceReadout() {
  isVoiceReadoutEnabled = !isVoiceReadoutEnabled;
  const btn = document.getElementById("voiceReadoutToggleBtn");
  const icon = document.getElementById("voiceReadoutIcon");

  if (isVoiceReadoutEnabled) {
    btn.style.background = "var(--saffron-modern)";
    btn.style.color = "white";
    alert("Voice Readout Enabled: Seva Sathi will vocalize responses.");
  } else {
    btn.style.background = "var(--bg-tertiary)";
    btn.style.color = "var(--text-primary)";
    alert("Voice Readout Disabled.");
  }
}

function speakAloud(text) {
  if (!('speechSynthesis' in window)) {
    console.log("Web Speech Synthesis not supported in this browser.");
    return;
  }

  window.speechSynthesis.cancel();
  const cleanText = text.replace(/<[^>]*>/g, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Set accents dynamically
  if (activeLanguage === 'hi') utterance.lang = 'hi-IN';
  else if (activeLanguage === 'ta') utterance.lang = 'ta-IN';
  else if (activeLanguage === 'te') utterance.lang = 'te-IN';
  else if (activeLanguage === 'kn') utterance.lang = 'kn-IN';
  else if (activeLanguage === 'mr') utterance.lang = 'mr-IN';
  else if (activeLanguage === 'gu') utterance.lang = 'gu-IN';
  else if (activeLanguage === 'bn') utterance.lang = 'bn-IN';
  else utterance.lang = 'en-IN';

  window.speechSynthesis.speak(utterance);
}

function startSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech Recognition is not supported by your browser. Please try Chrome/Edge.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  
  if (activeLanguage === 'hi') {
    recognition.lang = 'hi-IN';
  } else if (activeLanguage === 'te') {
    recognition.lang = 'te-IN';
  } else if (activeLanguage === 'kn') {
    recognition.lang = 'kn-IN';
  } else {
    recognition.lang = 'en-IN';
  }

  const micBtn = document.getElementById("evaMicBtn");
  micBtn.classList.add("active");

  recognition.start();

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("evaInputBox").value = transcript;
    micBtn.classList.remove("active");
    sendEvaChatMessage();
  };

  recognition.onerror = function(event) {
    console.error("Speech recognition error:", event.error);
    micBtn.classList.remove("active");
  };

  recognition.onend = function() {
    micBtn.classList.remove("active");
  };
}
