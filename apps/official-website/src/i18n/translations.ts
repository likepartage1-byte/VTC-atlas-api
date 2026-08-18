export type SupportedLang = 'AR' | 'FR' | 'EN' | 'ES';

export interface JournalArticle {
  slug: string;
  category: 'passenger' | 'driver' | 'services' | 'news';
  title: string;
  excerpt: string;
  readingTime: number;
  date: string;
  content: string;
}

export interface TranslationDictionary {
  nav: {
    home: string;
    howItWorks: string;
    appShowcase: string;
    experiences: string;
    services: string;
    safety: string;
    journal: string;
    about: string;
    contact: string;
    downloadApp: string;
    faq: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    subtext: string;
    downloadApp: string;
    exploreExperience: string;
    trustOtp: string;
    trustNoHidden: string;
    trustLive: string;
  };
  oneApp: {
    badge: string;
    title: string;
    subtitle: string;
    passengerTab: string;
    driverTab: string;
    passengerTitle: string;
    passengerDesc: string;
    driverTitle: string;
    driverDesc: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
  };
  howItWorks: {
    badge: string;
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    step5Title: string;
    step5Desc: string;
    step6Title: string;
    step6Desc: string;
    step7Title: string;
    step7Desc: string;
  };
  passengerExperience: {
    badge: string;
    title: string;
    subtitle: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    feature4Title: string;
    feature4Desc: string;
  };
  driverExperience: {
    badge: string;
    title: string;
    subtitle: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    feature4Title: string;
    feature4Desc: string;
  };
  services: {
    badge: string;
    title: string;
    subtitle: string;
    rideTitle: string;
    rideDesc: string;
    intercityTitle: string;
    intercityDesc: string;
    negotiationTitle: string;
    negotiationDesc: string;
    nohiddenTitle: string;
    nohiddenDesc: string;
  };
  safety: {
    badge: string;
    title: string;
    subtitle: string;
    otpTitle: string;
    otpDesc: string;
    verificationTitle: string;
    verificationDesc: string;
    ratingTitle: string;
    ratingDesc: string;
    trackingTitle: string;
    trackingDesc: string;
    supportTitle: string;
    supportDesc: string;
    sharedTitle: string;
    sharedDesc: string;
  };
  journal: {
    badge: string;
    title: string;
    subtitle: string;
    allLabel: string;
    passengerLabel: string;
    driverLabel: string;
    servicesLabel: string;
    newsLabel: string;
    readMore: string;
    readingTime: string;
    backToJournal: string;
    articles: JournalArticle[];
  };
  appDownload: {
    badge: string;
    title: string;
    subtitle: string;
    appTitle: string;
    appDesc: string;
    googlePlay: string;
    appStore: string;
    oneAppSubtitle: string;
  };
  faq: {
    badge: string;
    title: string;
    subtitle: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
    q4: string;
    a4: string;
    q5: string;
    a5: string;
  };
  footer: {
    tagline: string;
    quickLinks: string;
    forPassengers: string;
    forDrivers: string;
    legal: string;
    terms: string;
    privacy: string;
    support: string;
    rights: string;
    madeWith: string;
  };
}

export const Translations: Record<SupportedLang, TranslationDictionary> = {
  AR: {
    nav: {
      home: 'الرئيسية',
      howItWorks: 'كيف تعمل الرحلة',
      appShowcase: 'التطبيق',
      experiences: 'التجربة',
      services: 'الخدمات',
      safety: 'الأمان',
      journal: 'المجلة',
      about: 'من نحن',
      contact: 'اتصل بنا',
      downloadApp: 'حمّل التطبيق',
      faq: 'الأسئلة الشائعة',
    },
    hero: {
      badge: 'Yalla VTC — منصة التنقل الذكي',
      title: 'طريقة أذكى\nللتنقل.',
      subtitle: 'تطبيق واحد يجمع الراكب والسائق في تجربة تنقل بسيطة ومرنة.',
      subtext: 'اقترح سعرك، استقبل عروض السائقين، واختر ما يناسبك بحرية وشفافية متكاملة.',
      downloadApp: 'حمّل تطبيق Yalla VTC',
      exploreExperience: 'اكتشف كيف يعمل',
      trustOtp: 'رمز OTP آمن لكل رحلة',
      trustNoHidden: 'بدون أسعار مفروضة',
      trustLive: 'تتبع مباشر لحظي',
    },
    oneApp: {
      badge: 'منصة موحدة',
      title: 'تجربتان في تطبيق واحد.',
      subtitle: 'سواء كنت راكباً تبحث عن رحلة مريحة أو سائقاً تسعى لدخل مرن، يمنحك Yalla VTC التجربة الكاملة من تطبيق واحد.',
      passengerTab: '👤 وضع الراكب',
      driverTab: '🚗 وضع السائق',
      passengerTitle: 'طلب الرحلة واقترح سعرك العادل',
      passengerDesc: 'أدخل وجهتك واقترح السعر المناسب لك. تظهر لك عروض السائقين القريبين لتختار الأنسب لك بناءً على التقييم والسعر ونوع السيارة.',
      driverTitle: 'استقبل الطلبات وقدم عروضك بحرية',
      driverDesc: 'تصفح طلبات الرحلات القريبة، واقبل السعر المعروض أو قدم عرضك المضاد، وحدد أوقات عملك براد كامل وحرية تامة.',
      feature1Title: 'تغيير النمط بضغطة زر',
      feature1Desc: 'التنقل في نفس التطبيق بين حجز الرحلات كراكب وتوفير الرحلات كسائق.',
      feature2Title: 'تفاوض مباشر وشفاف',
      feature2Desc: 'الوصول إلى اتفاق عادل بدون خوارزميات تسعير تعسفية أو خفية.',
      feature3Title: 'حماية متكاملة بـ OTP',
      feature3Desc: 'تبدأ الرحلة رسمياً بعد إدخال رمز التأكيد السري لضمان حق الطرفين.',
    },
    howItWorks: {
      badge: 'كيف تعمل الرحلة؟',
      title: 'من الطلب حتى الوصول',
      subtitle: 'سبع خطوات مبسطة تجعل كل رحلة آمنة وعادلة وشفافة للجميع.',
      step1Title: 'تحديد نقطة الانطلاق والوجهة',
      step1Desc: 'حدد موقعك الحالي ووجهتك المطلوبة على الخريطة التفاعلية.',
      step2Title: 'اختيار فئة المركبة',
      step2Desc: 'اختر الفئة المناسبة: Standard أو Comfort أو Van حسب حاجتك.',
      step3Title: 'اقترح سعرك المباشر',
      step3Desc: 'أدخل السعر الذي تراه عادلاً لرحلتك دون تسعير قسري تلقائي.',
      step4Title: 'استقبال عروض السائقين',
      step4Desc: 'يشاهد السائقون القريبون طلبك ويقدمون عروضهم المباشرة.',
      step5Title: 'مقارنة واختيار العرض المناسب',
      step5Desc: 'قارن بين السائقين من حيث السعر والتقييم والسيارة واقرر العرض الأفضل.',
      step6Title: 'متابعة الوصول المباشر',
      step6Desc: 'تتبع حركة السائق على الخريطة لحظة بلحظة حتى وصوله.',
      step7Title: 'رمز OTP للبدء الآمن',
      step7Desc: 'شارك رمز التأكيد OTP مع السائق عند الركوب لبدء الرحلة بأمان.',
    },
    passengerExperience: {
      badge: 'تجربة الراكب',
      title: 'تنقل بمرونة وراحة بال',
      subtitle: 'كل ما تحتاجه للوصول إلى وجهتك بأسعار عادلة واختيار كامل.',
      feature1Title: 'حرية اقتراح السعر',
      feature1Desc: 'أنت من يحدد قيمة الرحلة المبدئية بناءً على تقديرك المباشر.',
      feature2Title: 'خيارات متعددة بين السائقين',
      feature2Desc: 'استقبل عدة عروض واختر السائق الأنسب لك بدون إجبار.',
      feature3Title: 'تتبع زمني دقيق',
      feature3Desc: 'شاهد مسار رحلتك ووصول السائق في الوقت الفعلي.',
      feature4Title: 'أمان مؤكد عبر OTP',
      feature4Desc: 'رمز سري مكون من 4 أرقام يضمن ركوبك مع السائق المحدد فقط.',
    },
    driverExperience: {
      badge: 'تجربة السائق',
      title: 'قد واستقبل الرحلات بشروطك',
      subtitle: 'منصة تمنحك الاستقلالية والتحكم الكامل في رحلاتك ودخلك.',
      feature1Title: 'قبول أو التقديم بعرض مضاد',
      feature1Desc: 'شاهد الطلب وسعره واقبل فوراً أو اقترح السعر الذي يناسبك.',
      feature2Title: 'رؤية كاملة قبل القبول',
      feature2Desc: 'المسافة والوجهة والسعر المعتمد واضحة قبل البدء.',
      feature3Title: 'تفعيل سريع ومباشر',
      feature3Desc: 'مراجعة مرنة للوثائق لتنطلق في أسرع وقت ممكن.',
      feature4Title: 'تحكم كامل بساعات العمل',
      feature4Desc: 'اتصل أو افصل وضع العمل في أي وقت يناسب جدولك.',
    },
    services: {
      badge: 'خدمات المنصة',
      title: 'حلول تنقل متكاملة',
      subtitle: 'خدمات مصممة لتلبية كافة احتياجات التنقل اليومية والبعيدة.',
      rideTitle: 'Yalla Ride — الرحلات المدينة',
      rideDesc: 'تنقل سريع وآمن داخل المدينة مع خيارات فئات مركبات متعددة وتفاوض مباشر على السعر.',
      intercityTitle: 'Yalla Intercity — بين المدن',
      intercityDesc: 'رحلات مريحة ومخططة بين المدن بأسعار متفق عليها مسبقاً وبأعلى درجات الراحة.',
      negotiationTitle: 'تفاوض مباشر عادل',
      negotiationDesc: 'اتفاق شفاف بين الراكب والسائق دون خوارزميات تسعير مفروضة.',
      nohiddenTitle: 'شفافية كاملة بغير رسوم مخفية',
      nohiddenDesc: 'السعر الاتفاقي النهائي هو ما يتم دفعه بدون مفاجآت عند الوصول.',
    },
    safety: {
      badge: 'الأمان والثقة',
      title: 'منظومة حماية متكاملة',
      subtitle: 'نضع سلامتك وراحة بالك في مقدمة أسرار تصميم منصة Yalla VTC.',
      otpTitle: 'نظام التحقق الآمن OTP',
      otpDesc: 'رمز سرّي يتوليد تلقائياً لكل رحلة، يضمن ركوب الراكب الصحيح مع السائق الصحيح ولا تبدأ الرحلة رسمياً إلا بإدخاله.',
      verificationTitle: 'توثيق السائقين والمركبات',
      verificationDesc: 'مراجعة صارمة للوثائق ورخص القيادة وأوراق المركبة لضمان أعلى معايير السلامة.',
      ratingTitle: 'نظام تقييم متبادل',
      ratingDesc: 'تقييم شامل بعد كل رحلة للحفاظ على بيئة تنقل راقية وموثوقة.',
      trackingTitle: 'تتبع جغرافي مباشر',
      trackingDesc: 'متابعة مسار الرحلة على الخريطة في الوقت الفعلي من البداية وحتى الوصول.',
      supportTitle: 'دعم ومساعدة مستمرة',
      supportDesc: 'فريق دعم متواجد للإجابة عن استفساراتك ومساعدتك خلال رحلاتك.',
      sharedTitle: 'مشاركة تفاصيل الرحلة',
      sharedDesc: 'إمكانية مشاركة مسار الرحلة الحية مع أفراد العائلة والأصدقاء.',
    },
    journal: {
      badge: 'Yalla VTC Journal',
      title: 'المجلة الرسمية\nYalla VTC',
      subtitle: 'أدلة عملية، نصائح ومحتوى يساعد الركاب والسائقين على الاستفادة القصوى من المنصة والتطبيق.',
      allLabel: 'الكل',
      passengerLabel: 'للركاب',
      driverLabel: 'للسائقين',
      servicesLabel: 'الخدمات',
      newsLabel: 'الأخبار',
      readMore: 'اقرأ المقال',
      readingTime: 'دقائق قراءة',
      backToJournal: 'العودة إلى المجلة',
      articles: [
        {
          slug: 'how-yalla-vtc-works',
          category: 'passenger',
          title: 'كيف يعمل Yalla VTC؟ — دليل كامل للراكب',
          excerpt: 'شرح مفصل لطريقة استخدام تطبيق Yalla VTC من تحديد الوجهة وحتى إتمام الرحلة والتفاوض على السعر.',
          readingTime: 5,
          date: '2025-01-20',
          content: `# كيف يعمل Yalla VTC؟ — دليل كامل للراكب\n\nYalla VTC هي منصة تنقل مبنية على فكرة **التفاوض المباشر** بين الراكب والسائق. بدلاً من أن تُفرض عليك آلية أسعار ثابتة، أنت من يقترح السعر الذي يناسبك.\n\n## الخطوة الأولى: تحديد موقعك ووجهتك\nعند فتح التطبيق، ستجد خريطة تفاعلية. حدد نقطة انطلاقك (يمكنك استخدام موقعك الحالي مباشرة) ثم أدخل وجهتك.\n\n## الخطوة الثانية: اختيار فئة المركبة\nيتيح لك Yalla VTC الاختيار بين:\n- **Standard** — سيارة عادية مريحة\n- **Comfort** — سيارة أكبر وأكثرراحة\n- **Van** — مناسبة للعائلات أو الأمتعة الكبيرة\n\n## الخطوة الثالثة: اقترح سعر الرحلة\nهنا يكمن الفرق الجوهري. بدلاً من قبول سعر مفروض، تُدخل أنت السعر الذي تراه عادلاً. لديك فكرة عن المسافة؟ قَدّر سعرك بحرية.\n\n## الخطوة الرابعة: استقبال عروض السائقين\nبمجرد إرسال طلبك، يتلقى السائقون القريبون عرضك. يمكنهم قبوله فوراً أو تقديم **عرض مضاد**.\n\n## الخطوة الخامسة: اختر السائق المناسب\nتظهر لك قائمة بالعروض المتاحة. قارن بين السائقين حسب:\n- السعر المفضل\n- تقييم السائق (مثلاً 4.9★)\n- نوع السيارة وموديلها\n- الوقت المتوقع للوصول\n\n## الخطوة السادسة: رمز OTP للبدء الآمن\nعند وصول السائق، سيطلب منك رمز **OTP مكون من 4 أرقام** يظهر على شاشتك. بعد أدخال السائق للرمز، تبدأ الرحلة رسمياً.\n\n--- \n\n**خلاصة**: Yalla VTC يمنحك التحكم الكامل في رحلتك وسعرك وأمانك.`
        },
        {
          slug: 'choosing-the-right-driver',
          category: 'passenger',
          title: 'كيف تختار السائق المناسب في Yalla VTC؟',
          excerpt: 'نصائح عملية لاختيار أفضل عرض من عروض السائقين بناءً على التقييم والسعر ونوع المركبة.',
          readingTime: 4,
          date: '2025-01-18',
          content: `# كيف تختار السائق المناسب في Yalla VTC؟\n\nعند طلب رحلة على Yalla VTC، قد تصلك عدة عروض في وقت قصير. كيف تختار العرض الأفضل لك؟\n\n## 1. التقييم وعدد الرحلات\nتقييم السائق (من 1 إلى 5 نجوم) يعبر عن تجربة الركاب السابقين معه. السائق ذو التقييم العالي (4.8 فأكثر) يضمن لك عادة تجربة ممتازة.\n\n## 2. السعر المناسب ليزانيتك\nقارن بين العروض. ليس بالضرورة أن تختار السعر الأرخص دائماً؛ أحياناً يكون فارق بسيط في السعر يقابله سيارة أحدث أو وصول أسرع.\n\n## 3. وقت الوصول المتوقع (ETA)\nإذا كنت مستعجلاً، اختر السائق الأقرب إليك والذي يستغرق وقتاً أقل للوصول إلى موقعك.\n\n## 4. نوع السيارة وفئتها\nتأكد من أن موديل السيارة وفئتها تناسب عدد الركاب والأمتعة التي تحملها معك.`
        },
        {
          slug: 'what-is-otp-and-why-it-matters',
          category: 'passenger',
          title: 'ما هو OTP ولماذا هو مهم في Yalla VTC؟',
          excerpt: 'شرح مبسط لنظام رمز التحقق OTP وكيف يحمي رحلتك ويضمن ركوبك مع السائق المحدد.',
          readingTime: 3,
          date: '2025-01-15',
          content: `# ما هو OTP ولماذا هو مهم في Yalla VTC؟\n\nرمز **OTP** اختصار لـ **One-Time Password** — أي رمز لمرة واحدة.\n\n## كيف يعمل في Yalla VTC؟\nعند تأكيد رحلتك، يُنشئ التطبيق تلقائياً رمزاً سرياً من 4 أرقام. هذا الرمز يظهر لك فقط في التطبيق.\nعندما يصل السائق، يطلب منك إخباره بهذا الرمز. يُدخله في تطبيق السائق، وعندها فقط تبدأ الرحلة رسمياً.\n\n## لماذا هو مهم؟\n1. **يضمن أن السائق الصحيح هو من ينقلك** — لا يمكن لأي سائق آخر بدء رحلتك بدون الرمز\n2. **يمنع الاحتيال** — لا يمكن تسجيل رحلة وهمية أو ادعاء إتمامها بدون الرمز\n3. **يمنحك سيطرة كاملة** — إذا شعرت بعدم الارتياح، لا تعطِ الرمز وتواصل مع الدعم`
        },
        {
          slug: 'getting-started-as-a-driver',
          category: 'driver',
          title: 'كيف تبدأ العمل واستقبال الرحلات في Yalla VTC؟',
          excerpt: 'دليل خطوة بخطوة للسائقين الشركاء: من التسجيل وتوثيق الوثائق حتى استقبال أول طلب وإتمام الرحلة.',
          readingTime: 6,
          date: '2025-01-12',
          content: `# كيف تبدأ العمل واستقبال الرحلات في Yalla VTC؟\n\nالانضمام كـ **سائق شريك** في Yalla VTC يمنحك حرية كاملة في تحديد أوقات عملك ودخلك.\n\n## الخطوات الأولى:\n1. **تحميل تطبيق Yalla VTC** والتبديل لوضع السائق\n2. **إنشاء حسابك** وإدخال المعلومات الأساسية\n3. **رفع الوثائق المطلوبة** (رخصة القيادة، أوراق المركبة، الفحص)\n4. **انتظار التفعيل** بعد مراجعة الوثائق\n\n## كيف تستقبل الطلبات؟\n- افتح التطبيق وفّعل **وضع الاتصال**\n- تظهر لك الطلبات القريبة مع المسافة والسعر المقترح والوجهة\n- يمكنك قبول الطلب فوراً أو تقديم **عرض مضاد** بالسعر الذي تراه مناسباً\n- عند القبول، تتوجه لموقع الراكب، وتطلب منه رمز **OTP** لبدء الرحلة\n\n## مميزات العمل مع Yalla VTC:\n- لا تسعير قسري عليك\n- حرية كاملة في اختيار الرحلات التي تناسبك\n- سحب سريع ومباشر لأرباحك`
        },
        {
          slug: 'yalla-intercity-travel-guide',
          category: 'services',
          title: 'خدمات التنقل بين المدن (Yalla Intercity)',
          excerpt: 'تعرف على خدمة التنقل بين المدن بأسعار مريحة ومتفق عليها مسبقاً.',
          readingTime: 4,
          date: '2025-01-10',
          content: `# خدمات التنقل بين المدن (Yalla Intercity)\n\nتتيح خدمة **Yalla Intercity** حجز رحلات مريحة بين المدن المختلفة بأسعار متفق عليها مسبقاً وبدون مفاجآت الطرقات.\n\n## مميزات الخدمة:\n- **سيارات مريحة** مناسبة للمسافات الطويلة\n- **اتفاق مسبق على السعر** شاملاً كافة تفاصيل الرحلة\n- **سائقون موثوقون** ومجربون للرحلات الطويلة\n- **مرونة في المواعيد** ونقاط الانطلاق والوصول`
        },
        {
          slug: 'yalla-vtc-global-vision',
          category: 'news',
          title: 'الرؤية والمنصة: Yalla VTC طريقة أذكى للتنقل',
          excerpt: 'تعرف على فلسفة Yalla VTC في بناء منصة تنقل عالمية مرنة تعتمد على العدالة والشفافية والتكنولوجيا.',
          readingTime: 5,
          date: '2025-01-05',
          content: `# الرؤية والمنصة: Yalla VTC طريقة أذكى للتنقل\n\nتأسست Yalla VTC بهدف إعادة تعريف تجربة النقل والتنقل الرقمي.\n\n## الفلسفة الجوهرية:\nنؤمن بأن **التنقل العادل** يبدأ بإلغاء الوساطة التعسفية والخوارزميات المغلقة. عندما يتفق الراكب والسائق مباشرة، تتحقق العدالة للطرفين.\n\n## التكنولوجيا والأمان:\nنجمع بين أحدث تقنيات الخرائط والتتبع الزمني مع أعلى معايير الأمان مثل **رمز OTP** وتوثيق الوثائق الحازم.\n\nتطبيق واحد، منصة واحدة، وتجربة فريدة تجمع الجميع.`
        }
      ]
    },
    appDownload: {
      badge: 'حمّل التطبيق الان',
      title: 'Yalla VTC في جيبك\nأينما كنت.',
      subtitle: 'تطبيق واحد يمنحك تجربة التنقل الكاملة كراكب أو فسائق على الأندرويد والآيفون.',
      appTitle: 'تطبيق Yalla VTC الموحد',
      appDesc: 'حمل التطبيق الآن واكتشف طريقة أذكى وأعدل للتنقل أو العمل وبثوان معدودة.',
      googlePlay: 'Google Play',
      appStore: 'App Store',
      oneAppSubtitle: 'تطبيق واحد للراكب والسائق على جميع الأجهزة',
    },
    faq: {
      badge: 'الأسئلة الشائعة',
      title: 'كل ما تريد معرفته عن Yalla VTC',
      subtitle: 'إجابات عن الأسالئة الأكثر تكراراً حول المنصة والتطبيق وكيفية الاستخدام.',
      q1: 'ما هو Yalla VTC وكيف يختلف عن التطبيقات الأخرى؟',
      a1: 'Yalla VTC هو تطبيق تنقل موحد يتيح للراكب والسائق التفاوض المباشر على أسعار الرحلات دون خوارزميات تسعير مفروضة أو رسوم خفية.',
      q2: 'هل يتطلب استخدام السائق والراكب تطبيقين مختلفين؟',
      a2: 'لا، Yalla VTC هو تطبيق واحد موحد يجمع تجربتي الراكب والسائق. يمكنك التبديل بين وضع الراكب ووضع السائق داخل نفس التطبيق.',
      q3: 'كيف يضمن نظام OTP أمان الرحلة؟',
      a3: 'رمز OTP هو رمز سري مكون من 4 أرقام يظهر في تطبيق الراكب، ولا تبدأ الرحلة رسمياً في تطبيق السائق إلا بعد إدخال هذا الرمز لضمان سلامة وركوب الطرفين الصحيحين.',
      q4: 'كيف يتم تحديد سعر الرحلة؟',
      a4: 'يقترح الراكب السعر المبدئي للرحلة عند الطلب، ويشاهد السائقون القريبون الطلب ويمكنهم قبوله فوراً أو إرسال عرض مضاد حتى يتم التوافق التام.',
      q5: 'ما هي فئات المركبات المتاحة؟',
      a5: 'تتوفر فئات متنوعة تناسب مختلف الاحتياجات: Standard للرحلات اليومية، Comfort للرحلات الأكثر راحة، و Van للرحلات العائلية أو الأمتعة الكبيرة.',
    },
    footer: {
      tagline: 'Yalla VTC — طريقة أذكى للتنقل. منصة تنقل رقمية موحدة تجمع الراكب والسائق في تجربة واحدة.',
      quickLinks: 'روابط سريعة',
      forPassengers: 'للركاب',
      forDrivers: 'للسائقين',
      legal: 'الشروط والخصوصية',
      terms: 'شروط الاستخدام',
      privacy: 'سياسة الخصوصية',
      support: 'الدعم والمساعدة',
      rights: '© 2025 Yalla VTC. جميع الحقوق محفوظة.',
      madeWith: 'منصة تنقل عالمية موحدة',
    },
  },

  FR: {
    nav: {
      home: 'Accueil',
      howItWorks: 'Comment ça marche',
      appShowcase: 'Application',
      experiences: 'Expérience',
      services: 'Services',
      safety: 'Sécurité',
      journal: 'Journal',
      about: 'À propos',
      contact: 'Contact',
      downloadApp: 'Télécharger',
      faq: 'FAQ',
    },
    hero: {
      badge: 'Yalla VTC — Plateforme de Mobilité Intelligente',
      title: 'Une façon plus intelligente\nde se déplacer.',
      subtitle: 'Une seule application réunissant passagers et chauffeurs dans une expérience fluide.',
      subtext: 'Proposez votre prix, recevez des offres de chauffeurs et choisissez librement en toute transparence.',
      downloadApp: 'Télécharger Yalla VTC',
      exploreExperience: 'Découvrir le fonctionnement',
      trustOtp: 'Sécurité OTP par course',
      trustNoHidden: 'Sans tarifs imposés',
      trustLive: 'Suivi en temps réel',
    },
    oneApp: {
      badge: 'Plateforme Unifiée',
      title: 'Une Application.\nDeux Expériences.',
      subtitle: 'Que vous soyez passager à la recherche d’un trajet confortable ou chauffeur recherchant des revenus flexibles, Yalla VTC vous offre l’expérience complète dans une seule application.',
      passengerTab: '👤 Mode Passager',
      driverTab: '🚗 Mode Chauffeur',
      passengerTitle: 'Demandez votre trajet et proposez votre prix',
      passengerDesc: 'Entrez votre destination et proposez votre tarif. Recevez les offres des chauffeurs à proximité et choisissez la meilleure selon la note, le tarif et le véhicule.',
      driverTitle: 'Recevez les demandes et proposez vos tarifs librement',
      driverDesc: 'Consultez les demandes de trajet à proximité, acceptez le tarif proposé ou faites une contre-offre avec une liberté totale d’horaires.',
      feature1Title: 'Changement de mode en un clic',
      feature1Desc: 'Basculez dans la même application entre la réservation de trajets et la conduite.',
      feature2Title: 'Négociation directe et équitable',
      feature2Desc: 'Trouvez un accord juste sans algorithmes de prix imposés ou cachés.',
      feature3Title: 'Protection intégrale par OTP',
      feature3Desc: 'Le trajet ne commence officiellement qu’après la saisie du code secret OTP.',
    },
    howItWorks: {
      badge: 'Comment ça marche ?',
      title: 'De la demande à l’arrivée',
      subtitle: 'Sept étapes simples pour rendre chaque trajet sûr, équitable et transparent.',
      step1Title: 'Définir le départ et la destination',
      step1Desc: 'Indiquez votre position actuelle et votre destination sur la carte interactive.',
      step2Title: 'Choisir la catégorie de véhicule',
      step2Desc: 'Sélectionnez la catégorie adaptée : Standard, Comfort ou Van.',
      step3Title: 'Proposer votre tarif direct',
      step3Desc: 'Entrez le prix que vous estimez juste sans tarification automatique imposée.',
      step4Title: 'Recevoir les offres des chauffeurs',
      step4Desc: 'Les chauffeurs à proximité voient votre demande et soumettent leurs offres.',
      step5Title: 'Comparer et choisir la meilleure offre',
      step5Desc: 'Comparez le prix, la note du chauffeur et le véhicule avant de valider.',
      step6Title: 'Suivre l’arrivée du chauffeur',
      step6Desc: 'Suivez le déplacement du chauffeur sur la carte en temps réel.',
      step7Title: 'Code OTP pour démarrer en sécurité',
      step7Desc: 'Partagez le code OTP secret avec le chauffeur au moment d’embarquer.',
    },
    passengerExperience: {
      badge: 'Expérience Passager',
      title: 'Déplacez-vous avec liberté et sérénité',
      subtitle: 'Tout ce dont vous avez besoin pour arriver à destination à un tarif équitable.',
      feature1Title: 'Liberté de proposer son prix',
      feature1Desc: 'Vous fixez le prix initial du trajet selon votre estimation.',
      feature2Title: 'Choix parmi plusieurs chauffeurs',
      feature2Desc: 'Recevez plusieurs offres et sélectionnez le chauffeur idéal sans contrainte.',
      feature3Title: 'Suivi précis du trajet',
      feature3Desc: 'Visualisez l’itinéraire et l’arrivée du chauffeur en temps réel.',
      feature4Title: 'Sécurité garantie par OTP',
      feature4Desc: 'Code secret à 4 chiffres garantissant l’embarquement avec le bon chauffeur.',
    },
    driverExperience: {
      badge: 'Expérience Chauffeur',
      title: 'Conduisez selon vos propres conditions',
      subtitle: 'Une plateforme qui vous offre autonomie et contrôle total sur vos trajets et revenus.',
      feature1Title: 'Accepter ou faire une contre-offre',
      feature1Desc: 'Voyez la demande et le tarif, acceptez immédiatement ou proposez votre prix.',
      feature2Title: 'Transparence totale avant acceptation',
      feature2Desc: 'Distance, destination et tarif proposé sont clairs dès le départ.',
      feature3Title: 'Activation simple et rapide',
      feature3Desc: 'Validation rapide des documents pour démarrer au plus vite.',
      feature4Title: 'Contrôle total des horaires',
      feature4Desc: 'Connectez-vous ou déconnectez-vous selon votre propre emploi du temps.',
    },
    services: {
      badge: 'Nos Services',
      title: 'Solutions de Mobilité Intégrées',
      subtitle: 'Des services conçus pour répondre à tous vos besoins de déplacements urbains et interurbains.',
      rideTitle: 'Yalla Ride — Courses Urbaines',
      rideDesc: 'Déplacements urbains rapides et sûrs avec choix de catégories de véhicules et négociation directe du prix.',
      intercityTitle: 'Yalla Intercity — Trajets Longue Distance',
      intercityDesc: 'Voyages confortables entre villes à des tarifs convenus à l’avance.',
      negotiationTitle: 'Négociation Équitable',
      negotiationDesc: 'Accord transparent entre passager et chauffeur sans prix algorithmiques imposés.',
      nohiddenTitle: 'Transparence Sans Frais Cachés',
      nohiddenDesc: 'Le prix convenu est le prix payé à l’arrivée, sans mauvaise surprise.',
    },
    safety: {
      badge: 'Sécurité & Confiance',
      title: 'Un Système de Protection Intégré',
      subtitle: 'Votre sécurité est au cœur de la conception de la plateforme Yalla VTC.',
      otpTitle: 'Système de Vérification OTP',
      otpDesc: 'Code secret généré automatiquement pour chaque course, garantissant la bonne mise en relation.',
      verificationTitle: 'Vérification Rigoureuse',
      verificationDesc: 'Contrôle strict des documents du chauffeur et du véhicule.',
      ratingTitle: 'Évaluation Mutuelle',
      ratingDesc: 'Notes et avis après chaque course pour maintenir un environnement de confiance.',
      trackingTitle: 'Géolocalisation en Temps Réel',
      trackingDesc: 'Suivi de l’itinéraire en direct sur la carte du départ à l’arrivée.',
      supportTitle: 'Assistance Continue',
      supportDesc: 'Une équipe de support disponible pour répondre à vos questions.',
      sharedTitle: 'Partage de Trajet',
      sharedDesc: 'Possibilité de partager le trajet en direct avec vos proches.',
    },
    journal: {
      badge: 'Yalla VTC Journal',
      title: 'Le Journal Officiel\nYalla VTC',
      subtitle: 'Guides pratiques, conseils et informations pour tirer le meilleur parti de l’application.',
      allLabel: 'Tous',
      passengerLabel: 'Passagers',
      driverLabel: 'Chauffeurs',
      servicesLabel: 'Services',
      newsLabel: 'Actualités',
      readMore: 'Lire l’article',
      readingTime: 'min de lecture',
      backToJournal: 'Retour au Journal',
      articles: [
        {
          slug: 'how-yalla-vtc-works',
          category: 'passenger',
          title: 'Comment fonctionne Yalla VTC ? — Guide complet passager',
          excerpt: 'Guide détaillé pour utiliser l’application Yalla VTC de la réservation à l’arrivée.',
          readingTime: 5,
          date: '2025-01-20',
          content: `# Comment fonctionne Yalla VTC ? — Guide complet passager\n\nYalla VTC est une plateforme fondée sur la **négociation directe** entre passagers et chauffeurs...`
        },
        {
          slug: 'choosing-the-right-driver',
          category: 'passenger',
          title: 'Comment choisir le bon chauffeur sur Yalla VTC ?',
          excerpt: 'Conseils pratiques pour sélectionner la meilleure offre selon la note, le tarif et le véhicule.',
          readingTime: 4,
          date: '2025-01-18',
          content: `# Comment choisir le bon chauffeur sur Yalla VTC ?\n\nRecevez plusieurs offres et choisissez le chauffeur idéal selon la note, le véhicule et le tarif...`
        },
        {
          slug: 'what-is-otp-and-why-it-matters',
          category: 'passenger',
          title: 'Qu’est-ce que l’OTP et pourquoi est-il essentiel ?',
          excerpt: 'Explication simple du code de sécurité OTP qui protège chaque trajet.',
          readingTime: 3,
          date: '2025-01-15',
          content: `# Qu’est-ce que l’OTP et pourquoi est-il essentiel ?\n\nLe code OTP garantit que vous embarquez avec le bon chauffeur en toute sécurité...`
        },
        {
          slug: 'getting-started-as-a-driver',
          category: 'driver',
          title: 'Comment commencer à conduire avec Yalla VTC ?',
          excerpt: 'Guide étape par étape pour les chauffeurs partenaires.',
          readingTime: 6,
          date: '2025-01-12',
          content: `# Comment commencer à conduire avec Yalla VTC ?\n\nInscrivez-vous, faites valider vos documents et commencez à recevoir des trajets à vos propres tarifs...`
        },
        {
          slug: 'yalla-intercity-travel-guide',
          category: 'services',
          title: 'Guide des voyages interurbains (Yalla Intercity)',
          excerpt: 'Découvrez les trajets entre villes à tarifs convenus d’avance.',
          readingTime: 4,
          date: '2025-01-10',
          content: `# Guide des voyages interurbains (Yalla Intercity)\n\nVoyagez d’une ville à l’autre en toute sérénité avec Yalla Intercity...`
        },
        {
          slug: 'yalla-vtc-global-vision',
          category: 'news',
          title: 'Vision et Plateforme : Yalla VTC la mobilité intelligente',
          excerpt: 'La philosophie Yalla VTC pour une mobilité équitable, transparente et technologique.',
          readingTime: 5,
          date: '2025-01-05',
          content: `# Vision et Plateforme : Yalla VTC la mobilité intelligente\n\nNotre mission est d’offrir une plateforme unifiée et équitable pour tous...`
        }
      ]
    },
    appDownload: {
      badge: 'Télécharger l’Application',
      title: 'Yalla VTC dans votre poche\noù que vous soyez.',
      subtitle: 'Une seule application pour passagers et chauffeurs disponible sur iOS et Android.',
      appTitle: 'Application Unifiée Yalla VTC',
      appDesc: 'Téléchargez maintenant et découvrez une mobilité plus intelligente et équitable.',
      googlePlay: 'Google Play',
      appStore: 'App Store',
      oneAppSubtitle: 'Une application unique pour tous vos besoins de mobilité',
    },
    faq: {
      badge: 'Foire Aux Questions',
      title: 'Tout savoir sur Yalla VTC',
      subtitle: 'Réponses aux questions les plus fréquentes sur l’application et le fonctionnement.',
      q1: 'Qu’est-ce que Yalla VTC et en quoi est-il différent ?',
      a1: 'Yalla VTC est une application unifiée permettant la négociation directe du prix de la course sans tarifs imposés.',
      q2: 'Faut-il deux applications séparées pour passager et chauffeur ?',
      a2: 'Non, Yalla VTC est une seule application unifiée. Vous pouvez basculer entre le mode passager et le mode chauffeur dans la même application.',
      q3: 'Comment le code OTP assure-t-il la sécurité ?',
      a3: 'Le code à 4 chiffres généré sur l’écran du passager doit être saisi par le chauffeur pour démarrer la course.',
      q4: 'Comment le prix de la course est-il fixé ?',
      a4: 'Le passager propose un prix initial, les chauffeurs soumettent leurs offres ou contre-offres jusqu’à l’accord parfait.',
      q5: 'Quelles catégories de véhicules sont disponibles ?',
      a5: 'Plusieurs catégories sont disponibles : Standard, Comfort et Van.',
    },
    footer: {
      tagline: 'Yalla VTC — Une façon plus intelligente de se déplacer. Une plateforme unifiée réunissant passagers et chauffeurs.',
      quickLinks: 'Liens rapides',
      forPassengers: 'Passagers',
      forDrivers: 'Chauffeurs',
      legal: 'Mentions légales',
      terms: 'Conditions d’utilisation',
      privacy: 'Politique de confidentialité',
      support: 'Assistance',
      rights: '© 2025 Yalla VTC. Tous droits réservés.',
      madeWith: 'Plateforme de Mobilité Unifiée',
    },
  },

  EN: {
    nav: {
      home: 'Home',
      howItWorks: 'How it works',
      appShowcase: 'App',
      experiences: 'Experience',
      services: 'Services',
      safety: 'Safety',
      journal: 'Journal',
      about: 'About Us',
      contact: 'Contact Us',
      downloadApp: 'Get the App',
      faq: 'FAQ',
    },
    hero: {
      badge: 'Yalla VTC — Smart Mobility Platform',
      title: 'A Smarter Way\nto Get Around.',
      subtitle: 'One single app uniting passengers and drivers in a seamless experience.',
      subtext: 'Name your price, receive driver offers, and choose what works for you with complete transparency.',
      downloadApp: 'Download Yalla VTC App',
      exploreExperience: 'Explore How It Works',
      trustOtp: 'OTP security per ride',
      trustNoHidden: 'No forced dynamic surge',
      trustLive: 'Real-time live tracking',
    },
    oneApp: {
      badge: 'Unified Platform',
      title: 'One App.\nTwo Experiences.',
      subtitle: 'Whether you are a passenger seeking a comfortable ride or a driver looking for flexible earnings, Yalla VTC provides the complete experience in a single app.',
      passengerTab: '👤 Passenger Mode',
      driverTab: '🚗 Driver Mode',
      passengerTitle: 'Request a Ride and Name Your Price',
      passengerDesc: 'Enter your destination and propose a fair price. View nearby driver offers and pick the best one based on rating, price, and vehicle.',
      driverTitle: 'Receive Requests and Counter Offer Freely',
      driverDesc: 'Browse nearby ride requests, accept the proposed price or make a counter-offer with full schedule freedom.',
      feature1Title: 'One-Tap Mode Switch',
      feature1Desc: 'Switch within the same app between booking rides and driving.',
      feature2Title: 'Direct Fair Negotiation',
      feature2Desc: 'Reach a fair deal without forced or hidden algorithms.',
      feature3Title: 'Full OTP Protection',
      feature3Desc: 'Trips only officially start after verifying the secret OTP code.',
    },
    howItWorks: {
      badge: 'How It Works',
      title: 'From Booking to Destination',
      subtitle: 'Seven straightforward steps making every trip safe, fair, and transparent.',
      step1Title: 'Set Pickup and Destination',
      step1Desc: 'Pin your location and destination on the interactive map.',
      step2Title: 'Choose Vehicle Category',
      step2Desc: 'Select Standard, Comfort, or Van based on your needs.',
      step3Title: 'Propose Your Price',
      step3Desc: 'Enter the price you consider fair without forced surge algorithms.',
      step4Title: 'Receive Driver Offers',
      step4Desc: 'Nearby drivers view your request and submit direct offers.',
      step5Title: 'Compare and Choose the Best Offer',
      step5Desc: 'Compare drivers by price, rating, and car model before picking.',
      step6Title: 'Track Arrival in Real Time',
      step6Desc: 'Follow your driver’s location on the live map until pickup.',
      step7Title: 'OTP Code for Safe Start',
      step7Desc: 'Share your 4-digit secret OTP with the driver upon entering.',
    },
    passengerExperience: {
      badge: 'Passenger Experience',
      title: 'Ride with Freedom and Peace of Mind',
      subtitle: 'Everything you need to reach your destination fairly and safely.',
      feature1Title: 'Freedom to Name Your Price',
      feature1Desc: 'You set the initial ride fare based on your estimate.',
      feature2Title: 'Multiple Driver Options',
      feature2Desc: 'Receive multiple offers and select your preferred driver.',
      feature3Title: 'Accurate Live Tracking',
      feature3Desc: 'Monitor the route and driver arrival in real time.',
      feature4Title: 'Guaranteed OTP Security',
      feature4Desc: 'A 4-digit code ensures you get into the correct vehicle.',
    },
    driverExperience: {
      badge: 'Driver Experience',
      title: 'Drive and Earn on Your Own Terms',
      subtitle: 'A platform empowering independence and total control over your schedule and income.',
      feature1Title: 'Accept or Counter Offer',
      feature1Desc: 'View requests and prices, accept instantly or propose your counter fare.',
      feature2Title: 'Total Upfront Transparency',
      feature2Desc: 'Distance, destination, and fare are clear before accepting.',
      feature3Title: 'Fast Activation Process',
      feature3Desc: 'Quick document verification to get you on the road fast.',
      feature4Title: 'Full Control Over Working Hours',
      feature4Desc: 'Go online or offline whenever it fits your lifestyle.',
    },
    services: {
      badge: 'Platform Services',
      title: 'Integrated Mobility Solutions',
      subtitle: 'Services designed to fulfill all your daily and long-distance travel needs.',
      rideTitle: 'Yalla Ride — City Rides',
      rideDesc: 'Fast, safe urban transportation with multiple vehicle classes and direct fare negotiation.',
      intercityTitle: 'Yalla Intercity — Long Distance',
      intercityDesc: 'Comfortable trips between cities at pre-agreed fares.',
      negotiationTitle: 'Direct Fair Negotiation',
      negotiationDesc: 'Transparent agreement between passenger and driver without middleman surge.',
      nohiddenTitle: 'Full Transparency & No Hidden Fees',
      nohiddenDesc: 'The agreed fare is the final price paid with zero surprises.',
    },
    safety: {
      badge: 'Safety & Trust',
      title: 'Integrated Security Architecture',
      subtitle: 'Your peace of mind is engineered into every feature of Yalla VTC.',
      otpTitle: 'OTP Verification System',
      otpDesc: 'Auto-generated 4-digit secret code for every trip ensuring correct pickup before starting.',
      verificationTitle: 'Vetted Drivers & Vehicles',
      verificationDesc: 'Rigorous inspection of driver licenses and vehicle documentation.',
      ratingTitle: 'Mutual Rating System',
      ratingDesc: 'Post-trip ratings maintain high community standards and trust.',
      trackingTitle: 'Live GPS Tracking',
      trackingDesc: 'Monitor your trip location in real time from start to finish.',
      supportTitle: 'Dedicated Support',
      supportDesc: 'Support team ready to assist with any inquiry during your rides.',
      sharedTitle: 'Share Trip Details',
      sharedDesc: 'Share live trip status and route with family and friends.',
    },
    journal: {
      badge: 'Yalla VTC Journal',
      title: 'The Official\nYalla VTC Journal',
      subtitle: 'Guides, tips, and articles helping passengers and drivers get the most out of the platform.',
      allLabel: 'All',
      passengerLabel: 'Passengers',
      driverLabel: 'Drivers',
      servicesLabel: 'Services',
      newsLabel: 'News',
      readMore: 'Read Article',
      readingTime: 'min read',
      backToJournal: 'Back to Journal',
      articles: [
        {
          slug: 'how-yalla-vtc-works',
          category: 'passenger',
          title: 'How Yalla VTC Works — Full Passenger Guide',
          excerpt: 'Detailed guide to using Yalla VTC from setting destination to direct fare negotiation.',
          readingTime: 5,
          date: '2025-01-20',
          content: `# How Yalla VTC Works — Full Passenger Guide\n\nYalla VTC is a mobility platform built on **direct negotiation** between riders and drivers...`
        },
        {
          slug: 'choosing-the-right-driver',
          category: 'passenger',
          title: 'How to Choose the Right Driver on Yalla VTC',
          excerpt: 'Practical tips on selecting driver offers based on rating, fare, and vehicle.',
          readingTime: 4,
          date: '2025-01-18',
          content: `# How to Choose the Right Driver on Yalla VTC\n\nCompare offers by rating, price, and vehicle category to pick the best ride for you...`
        },
        {
          slug: 'what-is-otp-and-why-it-matters',
          category: 'passenger',
          title: 'What is OTP and Why Does it Matter?',
          excerpt: 'Simple explanation of the 4-digit OTP security code safeguarding your ride.',
          readingTime: 3,
          date: '2025-01-15',
          content: `# What is OTP and Why Does it Matter?\n\nOTP guarantees you step into the correct vehicle with the assigned driver...`
        },
        {
          slug: 'getting-started-as-a-driver',
          category: 'driver',
          title: 'Getting Started as a Partner Driver on Yalla VTC',
          excerpt: 'Step-by-step onboarding guide for partner drivers.',
          readingTime: 6,
          date: '2025-01-12',
          content: `# Getting Started as a Partner Driver on Yalla VTC\n\nRegister, upload documents, go online, and accept ride requests on your own terms...`
        },
        {
          slug: 'yalla-intercity-travel-guide',
          category: 'services',
          title: 'Yalla Intercity Travel Guide',
          excerpt: 'Discover long-distance intercity rides at pre-agreed transparent fares.',
          readingTime: 4,
          date: '2025-01-10',
          content: `# Yalla Intercity Travel Guide\n\nTravel comfortably between cities with pre-agreed fares and verified drivers...`
        },
        {
          slug: 'yalla-vtc-global-vision',
          category: 'news',
          title: 'Vision & Platform: Yalla VTC Smarter Mobility',
          excerpt: 'The Yalla VTC philosophy for fair, transparent, and technology-driven mobility.',
          readingTime: 5,
          date: '2025-01-05',
          content: `# Vision & Platform: Yalla VTC Smarter Mobility\n\nBuilding a fair unified platform empowering riders and drivers alike...`
        }
      ]
    },
    appDownload: {
      badge: 'Download the App',
      title: 'Yalla VTC in Your Pocket\nWherever You Go.',
      subtitle: 'One unified app providing the complete mobility experience for riders and drivers.',
      appTitle: 'Unified Yalla VTC App',
      appDesc: 'Download now and experience a smarter, fairer way to ride or drive in seconds.',
      googlePlay: 'Google Play',
      appStore: 'App Store',
      oneAppSubtitle: 'One app for passengers and drivers across all devices',
    },
    faq: {
      badge: 'Frequently Asked Questions',
      title: 'Everything You Need to Know',
      subtitle: 'Answers to the most common questions about Yalla VTC platform and app.',
      q1: 'What is Yalla VTC and how does it work?',
      a1: 'Yalla VTC is a unified mobility app allowing riders and drivers to negotiate fares directly with zero forced algorithms.',
      q2: 'Are there separate apps for passengers and drivers?',
      a2: 'No, Yalla VTC is one unified app. You can switch between Passenger Mode and Driver Mode within the same app.',
      q3: 'How does OTP ensure ride safety?',
      a3: 'The 4-digit code generated on the passenger screen must be entered by the driver to officially start the ride.',
      q4: 'How is the ride fare determined?',
      a4: 'The passenger proposes an initial fare, and nearby drivers can accept or submit counter-offers until an agreement is reached.',
      q5: 'What vehicle categories are available?',
      a5: 'Standard, Comfort, and Van vehicle categories are available.',
    },
    footer: {
      tagline: 'Yalla VTC — A Smarter Way to Get Around. One unified platform bringing riders and drivers together.',
      quickLinks: 'Quick Links',
      forPassengers: 'For Passengers',
      forDrivers: 'For Drivers',
      legal: 'Legal',
      terms: 'Terms of Use',
      privacy: 'Privacy Policy',
      support: 'Support',
      rights: '© 2025 Yalla VTC. All rights reserved.',
      madeWith: 'Global Unified Mobility Platform',
    },
  },

  ES: {
    nav: {
      home: 'Inicio',
      howItWorks: 'Cómo funciona',
      appShowcase: 'Aplicación',
      experiences: 'Experiencia',
      services: 'Servicios',
      safety: 'Seguridad',
      journal: 'Diario',
      about: 'Sobre Nosotros',
      contact: 'Contacto',
      downloadApp: 'Descargar App',
      faq: 'Preguntas frecuentes',
    },
    hero: {
      badge: 'Yalla VTC — Plataforma de Movilidad Inteligente',
      title: 'Una forma más inteligente\nde desplazarse.',
      subtitle: 'Una sola aplicación que une a pasajeros y conductores en una experiencia fluida.',
      subtext: 'Propón tu precio, recibe ofertas de conductores y elige libremente con total transparencia.',
      downloadApp: 'Descargar Yalla VTC App',
      exploreExperience: 'Descubrir cómo funciona',
      trustOtp: 'Seguridad OTP por viaje',
      trustNoHidden: 'Sin precios forzados',
      trustLive: 'Seguimiento en tiempo real',
    },
    oneApp: {
      badge: 'Plataforma Unificada',
      title: 'Una Aplicación.\nDos Experiencias.',
      subtitle: 'Tanto si eres pasajero como si eres conductor, Yalla VTC te ofrece la experiencia completa en una sola app.',
      passengerTab: '👤 Modo Pasajero',
      driverTab: '🚗 Modo Conductor',
      passengerTitle: 'Solicita tu viaje y propón tu precio',
      passengerDesc: 'Introduce tu destino y propón una tarifa justa. Recibe ofertas de conductores cercanos y elige la mejor opción.',
      driverTitle: 'Recibe solicitudes y haz contraofertas libremente',
      driverDesc: 'Examina solicitudes cercanas, acepta el precio o haz una contraoferta con total libertad de horarios.',
      feature1Title: 'Cambio de modo en un toque',
      feature1Desc: 'Alterna en la misma aplicación entre solicitar viajes y conducir.',
      feature2Title: 'Negociación directa y justa',
      feature2Desc: 'Llega a un acuerdo justo sin algoritmos de precios impuestos.',
      feature3Title: 'Protección integral con OTP',
      feature3Desc: 'El viaje solo comienza tras introducir el código secreto OTP.',
    },
    howItWorks: {
      badge: '¿Cómo funciona?',
      title: 'Desde la solicitud hasta el destino',
      subtitle: 'Siete sencillos pasos para que cada viaje sea seguro, justo y transparente.',
      step1Title: 'Fijar origen y destino',
      step1Desc: 'Selecciona tu ubicación y destino en el mapa interactivo.',
      step2Title: 'Elegir categoría de vehículo',
      step2Desc: 'Elige entre Standard, Comfort o Van según tus necesidades.',
      step3Title: 'Proponer tu precio directo',
      step3Desc: 'Introduce la tarifa que consideres justa sin tarifas automáticas forzadas.',
      step4Title: 'Recibir ofertas de conductores',
      step4Desc: 'Los conductores cercanos ven tu solicitud y envían sus ofertas.',
      step5Title: 'Comparar y elegir la mejor opción',
      step5Desc: 'Compara conductores por tarifa, valoración y vehículo antes de seleccionar.',
      step6Title: 'Seguir la llegada en tiempo real',
      step6Desc: 'Sigue el trayecto del conductor en el mapa en tiempo real.',
      step7Title: 'Código OTP para inicio seguro',
      step7Desc: 'Comparte el código secreto OTP de 4 dígitos con el conductor al subir.',
    },
    passengerExperience: {
      badge: 'Experiencia Pasajero',
      title: 'Muévete con libertad y tranquilidad',
      subtitle: 'Todo lo que necesitas para llegar a tu destino a un precio justo.',
      feature1Title: 'Libertad de proponer tu precio',
      feature1Desc: 'Tú fijas el precio inicial del viaje según tu estimación.',
      feature2Title: 'Múltiples opciones de conductores',
      feature2Desc: 'Recibe varias ofertas y elige a tu conductor preferido.',
      feature3Title: 'Seguimiento preciso en tiempo real',
      feature3Desc: 'Visualiza la ruta y la llegada del conductor al instante.',
      feature4Title: 'Seguridad garantizada por OTP',
      feature4Desc: 'Un código secreto de 4 dígitos garantiza tu subida al vehículo correcto.',
    },
    driverExperience: {
      badge: 'Experiencia Conductor',
      title: 'Conduce y gana bajo tus propias condiciones',
      subtitle: 'Una plataforma que te otorga independencia y control total.',
      feature1Title: 'Aceptar o hacer contraoferta',
      feature1Desc: 'Observa la solicitud y la tarifa, acepta o propone tu precio.',
      feature2Title: 'Transparencia total por adelantado',
      feature2Desc: 'Distancia, destino y tarifa están claros desde el principio.',
      feature3Title: 'Activación rápida y sencilla',
      feature3Desc: 'Revisión ágil de documentos para empezar rápidamente.',
      feature4Title: 'Control total de tus horarios',
      feature4Desc: 'Conéctate o desconéctate cuando mejor te convenga.',
    },
    services: {
      badge: 'Nuestros Servicios',
      title: 'Soluciones de Movilidad Integradas',
      subtitle: 'Servicios diseñados para cubrir todas tus necesidades de transporte.',
      rideTitle: 'Yalla Ride — Viajes Urbanos',
      rideDesc: 'Transporte urbano rápido y seguro con categorías de vehículos y negociación directa.',
      intercityTitle: 'Yalla Intercity — Entre Ciudades',
      intercityDesc: 'Viajes confortables entre ciudades a tarifas acordadas con antelación.',
      negotiationTitle: 'Negociación Directa Justa',
      negotiationDesc: 'Acuerdo transparente entre pasajero y conductor sin tarifas impuestas.',
      nohiddenTitle: 'Transparencia Sin Tarifas Ocultas',
      nohiddenDesc: 'La tarifa acordada es el precio final que se paga sin sorpresas.',
    },
    safety: {
      badge: 'Seguridad y Confianza',
      title: 'Arquitectura de Seguridad Integrada',
      subtitle: 'Tu tranquilidad está integrada en cada función de Yalla VTC.',
      otpTitle: 'Sistema de Verificación OTP',
      otpDesc: 'Código secreto de 4 dígitos generado automáticamente para cada viaje.',
      verificationTitle: 'Conductores y Vehículos Verificados',
      verificationDesc: 'Inspección rigurosa de licencias y documentación.',
      ratingTitle: 'Valoración Mutua',
      ratingDesc: 'Puntuaciones tras cada viaje para mantener la confianza de la comunidad.',
      trackingTitle: 'Seguimiento GPS en Directo',
      trackingDesc: 'Monitoriza tu ubicación en el mapa en tiempo real de principio a fin.',
      supportTitle: 'Asistencia Continua',
      supportDesc: 'Equipo de soporte disponible para ayudarte en tus viajes.',
      sharedTitle: 'Compartir Detalles del Viaje',
      sharedDesc: 'Comparte tu ruta en tiempo real con familiares y amigos.',
    },
    journal: {
      badge: 'Yalla VTC Journal',
      title: 'El Diario Oficial\nYalla VTC',
      subtitle: 'Guías y consejos para que pasajeros y conductores aprovechen al máximo la plataforma.',
      allLabel: 'Todos',
      passengerLabel: 'Pasajeros',
      driverLabel: 'Conductores',
      servicesLabel: 'Servicios',
      newsLabel: 'Noticias',
      readMore: 'Leer Artículo',
      readingTime: 'min de lectura',
      backToJournal: 'Volver al Diario',
      articles: [
        {
          slug: 'how-yalla-vtc-works',
          category: 'passenger',
          title: '¿Cómo funciona Yalla VTC? — Guía completa para el pasajero',
          excerpt: 'Guía detallada sobre cómo usar Yalla VTC desde fijar el destino hasta negociar el precio.',
          readingTime: 5,
          date: '2025-01-20',
          content: `# ¿Cómo funciona Yalla VTC? — Guía completa para el pasajero\n\nYalla VTC es una plataforma basada en la **negociación directa** entre pasajeros y conductores...`
        },
        {
          slug: 'choosing-the-right-driver',
          category: 'passenger',
          title: '¿Cómo elegir al conductor adecuado en Yalla VTC?',
          excerpt: 'Consejos prácticos para seleccionar ofertas según valoración, precio y vehículo.',
          readingTime: 4,
          date: '2025-01-18',
          content: `# ¿Cómo elegir al conductor adecuado en Yalla VTC?\n\nCompara ofertas y selecciona la mejor opción para tu trayecto...`
        },
        {
          slug: 'what-is-otp-and-why-it-matters',
          category: 'passenger',
          title: '¿Qué es el código OTP y por qué es fundamental?',
          excerpt: 'Explicación sencilla del código de seguridad OTP de 4 dígitos.',
          readingTime: 3,
          date: '2025-01-15',
          content: `# ¿Qué es el código OTP y por qué es fundamental?\n\nEl OTP garantiza tu subida al vehículo correcto con el conductor asignado...`
        },
        {
          slug: 'getting-started-as-a-driver',
          category: 'driver',
          title: 'Cómo empezar a conducir con Yalla VTC',
          excerpt: 'Guía paso a paso para conductores colaboradores.',
          readingTime: 6,
          date: '2025-01-12',
          content: `# Cómo empezar a conducir con Yalla VTC\n\nRegístrate, sube tus documentos y empieza a recibir viajes a tus propias tarifas...`
        },
        {
          slug: 'yalla-intercity-travel-guide',
          category: 'services',
          title: 'Guía de viajes entre ciudades (Yalla Intercity)',
          excerpt: 'Descubre trayectos de larga distancia a precios transparentes previamente acordados.',
          readingTime: 4,
          date: '2025-01-10',
          content: `# Guía de viajes entre ciudades (Yalla Intercity)\n\nViaja cómodamente entre ciudades a precios fijos acordados previamente...`
        },
        {
          slug: 'yalla-vtc-global-vision',
          category: 'news',
          title: 'Visión y Plataforma: Yalla VTC Movilidad Inteligente',
          excerpt: 'La filosofía de Yalla VTC para una movilidad justa, transparente y tecnológica.',
          readingTime: 5,
          date: '2025-01-05',
          content: `# Visión y Plataforma: Yalla VTC Movilidad Inteligente\n\nConstruyendo una plataforma unificada para pasajeros y conductores...`
        }
      ]
    },
    appDownload: {
      badge: 'Descargar la App',
      title: 'Yalla VTC en tu bolsillo\ndondequiera que vayas.',
      subtitle: 'Una sola aplicación con la experiencia completa para pasajeros y conductores.',
      appTitle: 'Aplicación Unificada Yalla VTC',
      appDesc: 'Descárgala ahora y descubre una forma más inteligente y justa de moverte.',
      googlePlay: 'Google Play',
      appStore: 'App Store',
      oneAppSubtitle: 'Una app para pasajeros y conductores en todos los dispositivos',
    },
    faq: {
      badge: 'Preguntas Frecuentes',
      title: 'Todo lo que necesitas saber',
      subtitle: 'Respuestas a las preguntas más habituales sobre la aplicación y la plataforma.',
      q1: '¿Qué es Yalla VTC y cómo funciona?',
      a1: 'Yalla VTC es una app de movilidad unificada donde pasajeros y conductores negocian tarifas directamente.',
      q2: '¿Se requieren dos aplicaciones separadas para pasajero y conductor?',
      a2: 'No, Yalla VTC es una sola app unificada. Puedes alternar entre el Modo Pasajero y el Modo Conductor en la misma app.',
      q3: '¿Cómo garantiza el sistema OTP la seguridad?',
      a3: 'El código de 4 dígitos generado en la pantalla del pasajero debe introducirlo el conductor para iniciar el viaje.',
      q4: '¿Cómo se determina la tarifa del viaje?',
      a4: 'El pasajero propone una tarifa inicial y los conductores cercanos pueden aceptarla o enviar contraofertas.',
      q5: '¿Qué categorías de vehículos están disponibles?',
      a5: 'Standard, Comfort y Van están disponibles.',
    },
    footer: {
      tagline: 'Yalla VTC — Una forma más inteligente de desplazarse. Una plataforma unificada que une a pasajeros y conductores.',
      quickLinks: 'Enlaces rápidos',
      forPassengers: 'Pasajeros',
      forDrivers: 'Conductores',
      legal: 'Legal',
      terms: 'Términos de uso',
      privacy: 'Política de privacidad',
      support: 'Soporte',
      rights: '© 2025 Yalla VTC. Todos los derechos reservados.',
      madeWith: 'Plataforma Global de Movilidad Unificada',
    },
  },
};
