// TODO: real data — all copy, phone numbers, hours and URLs below are
// production placeholders to be replaced with verified clinic data.

export const CLINIC = {
  name: "کلینیک دامپزشکی باران",
  brand: "باران",
  tagline: "کلینیک دامپزشکی",
  phone: "۰۲۱-۲۲۰۰۰۰۰۰",
  phoneHref: "tel:+982122000000",
  emergencyPhone: "۰۲۱-۲۲۰۰۰۰۰۰",
  emergencyPhoneHref: "tel:+982122000000",
  email: "info@baran-vet.ir",
  address: "تهران، خیابان ولیعصر، کوچه باران، پلاک ۱۲",
  hours: "هر روز، ۸ صبح تا ۱۰ شب",
};

export const ABOUT = {
  // TODO: real data — mission statement to be reviewed with the clinic.
  eyebrow: "آشنایی با باران",
  statement: [
    "هر حیوان خانگی،",
    "یک عضوِ خانواده است؛",
    "و ما همین‌طور با او رفتار می‌کنیم.",
  ],
  body:
    "کلینیک دامپزشکی باران از سال ۱۳۸۹ با تیمی از دامپزشکان متخصص، تجهیزات مدرن و عشق به حیوانات، همراهِ خانواده‌های ایرانی بوده است؛ از نخستین معاینه تا جراحی‌های پیشرفته.",
  signature: "تیم دامپزشکان کلینیک باران",
  image: {
    src: "/images/about-vet.jpg",
    alt: "دامپزشک در حال معاینه حیوان خانگی در کلینیک دامپزشکی باران",
  },
};

export const WHY = {
  // TODO: real data — the process of care to be confirmed with the clinic.
  eyebrow: "چرا باران؟",
  headline: ["مسیر درمان،", "شفاف و قدم‌به‌قدم"],
  intro:
    "در باران، اول با دقت گوش می‌دهیم و بعد تصمیم می‌گیریم. هر مرحله از درمان را با زبان ساده برای شما توضیح می‌دهیم تا همیشه بدانید چه اتفاقی در حال رخ دادن است.",
  steps: [
    {
      number: "۰۱",
      title: "مشاوره و پذیرش",
      text: "در محیطی آرام، شرح حال حیوان شما به‌طور کامل ثبت می‌شود.",
    },
    {
      number: "۰۲",
      title: "معاینه و تشخیص",
      text: "معاینه بالینی و در صورت نیاز آزمایش و تصویربرداری برای تشخیص دقیق.",
    },
    {
      number: "۰۳",
      title: "درمان و مراقبت",
      text: "برنامه درمانی شفاف، همراه با توضیح کامل روند و هزینه برای شما.",
    },
    {
      number: "۰۴",
      title: "پیگیری و بهبودی",
      text: "حتی پس از درمان نیز همراه شما هستیم تا بهبودی کامل حاصل شود.",
    },
  ],
  image: {
    src: "/images/why-baran.jpg",
    alt: "دقت و آرامش در معاینه حیوانات در کلینیک دامپزشکی باران",
  },
};

export type AnimalCategory = {
  key: "dog" | "cat" | "bird" | "exotic" | "other";
  name: string;
  image: string;
  alt: string;
  title: string;
  text: string;
};

export const ANIMALS: {
  eyebrow: string;
  headline: string[];
  intro: string;
  categories: AnimalCategory[];
} = {
  // TODO: real data — category copy to be replaced with verified clinic info.
  eyebrow: "تجربه بیماران",
  headline: ["هر بیمار کوچک،", "دنیای خودش را دارد"],
  intro:
    "سگ‌ها، گربه‌ها، پرندگان و دیگر حیوانات خانگی از نظر ظاهری شبیه‌اند اما ترس‌ها، علاقه‌ها و نیازهایشان بسیار متفاوت است. رفتار ما با هر بیمار دقیقاً مطابق همین تفاوت‌هاست.",
  categories: [
    {
      key: "dog",
      name: "سگ",
      image: "/images/animal-dog.jpg",
      alt: "سگ در انتظار معاینه در کلینیک دامپزشکی باران",
      title: "مهارت با سگ‌ها",
      text: "از واکسیناسیون و درمان بیماری‌ها تا رفتارشناسی و مشاوره تغذیه؛ تمام نیازهای سگ شما در یکجا.",
    },
    {
      key: "cat",
      name: "گربه",
      image: "/images/animal-cat.jpg",
      alt: "گربه‌ای آرام در کلینیک دامپزشکی باران",
      title: "محیطی بی‌استرس برای گربه‌ها",
      text: "گربه‌ها مهمان‌های حساسی هستند؛ معاینه با آرامش و کمترین استرس، دقیقاً همان چیزی که نیاز دارند.",
    },
    {
      key: "bird",
      name: "پرندگان",
      image: "/images/animal-bird.jpg",
      alt: "پرنده خانگی در کلینیک دامپزشکی باران",
      title: "پرندگان حساس و زیبا",
      text: "از تغذیه تخصصی تا درمان پرندگان خانگی و زینتی، در محیطی بی‌سروصدا و امن.",
    },
    {
      key: "exotic",
      name: "اگزوتیک",
      image: "/images/animal-exotic.jpg",
      alt: "حیوان اگزوتیک در معاینه کلینیک دامپزشکی باران",
      title: "تخصصِ حیوانات خاص",
      text: "خرگوش، خوکچه هندی و دیگر همراهان دوست‌داشتنی — مراقبتی تخصصی برای هر گونه.",
    },
    {
      key: "other",
      name: "سایر",
      image: "/images/animal-other.jpg",
      alt: "حیوان خانگی دیگر در کلینیک دامپزشکی باران",
      title: "هر عضو دیگری از خانواده",
      text: "هر حیوان دیگری که عضوی از خانواده شماست، همان دقت و مراقبت را از ما دریافت می‌کند.",
    },
  ],
};

export const MARQUEE = {
  // TODO: real data — teaser tags; reconcile with the Step 7.6 services list.
  label: "خدمات کلینیک",
  items: [
    "واکسیناسیون",
    "جراحی تخصصی",
    "بیماری‌های داخلی",
    "دندانپزشکی",
    "تصویربرداری",
    "اورژانس ۲۴ ساعته",
    "آزمایشگاه",
    "تغذیه و رژیم‌درمانی",
  ],
};

export type ServiceAccent = "yellow" | "coral" | "green" | "lavender";

export type Service = {
  key: string;
  numeral: string;
  name: string;
  tagline: string;
  title: string;
  text: string;
  image: string;
  alt: string;
  accent: ServiceAccent;
};

export const SERVICES: {
  eyebrow: string;
  headline: string[];
  intro: string;
  items: Service[];
} = {
  // TODO: real data — service list reconciled with the Step 7.2 MARQUEE tags;
  // to be confirmed against the clinic's actual service catalog. Facility
  // images reused as placeholders (7.7 treats them cinematically full-bleed).
  eyebrow: "خدمات باران",
  headline: ["از واکسنِ ساده تا", "جراحیِ پیچیده؛"],
  intro:
    "خانواده‌ای کامل از خدمات دامپزشکی زیر یک سقف — روی هر مورد بمانید یا با جهت‌های فلش حرکت کنید تا جزئیاتش را ببینید.",
  items: [
  {
    key: "vaccination",
    numeral: "۰۱",
    name: "واکسیناسیون",
    tagline: "واکسن‌های ضروری با برنامه‌ای دقیق",
    title: "واکسیناسیون کامل",
    text: "واکسن‌های ضروری برای هر گونه، طبق برنامه‌ی سنی، سبک زندگی و سلامت حیوان شما.",
    image: "/images/hero-dog.jpg",
    alt: "سگ در حال واکسیناسیون در کلینیک دامپزشکی باران",
    accent: "yellow",
  },
  {
    key: "surgery",
    numeral: "۰۲",
    name: "جراحی تخصصی",
    tagline: "اتاق عمل مجهز و مراقبت کامل",
    title: "جراحی تخصصی",
    text: "جراحی‌های بافت نرم و تخصصی در اتاق عمل مجهز، همراه با بیهوشی ایمن و مراقبت‌های پس از عمل.",
    image: "/images/service-surgery.jpg",
    alt: "تیم جراحی آماده در اتاق عمل کلینیک دامپزشکی باران",
    accent: "coral",
  },
  {
    key: "medicine",
    numeral: "۰۳",
    name: "بیماری‌های داخلی",
    tagline: "تشخیص دقیق بیماری‌های مزمن",
    title: "بیماری‌های داخلی",
    text: "تشخیص و درمان بیماری‌های داخلی با معاینه دقیق، آزمایش و روش‌های نوین تصویربرداری.",
    image: "/images/about-vet.jpg",
    alt: "معاینه دقیق حیوان خانگی در کلینیک دامپزشکی باران",
    accent: "green",
  },
  {
    key: "dentistry",
    numeral: "۰۴",
    name: "دندانپزشکی",
    tagline: "سلامت دهان و دندان برای همه",
    title: "دندانپزشکی حیوانات",
    text: "جرم‌گیری، کشیدن دندان و درمان بیماری‌های دهان و دندان با آرامش کامل و بی‌حسی ایمن.",
    image: "/images/service-dental.jpg",
    alt: "دندانپزشکی تخصصی حیوانات در کلینیک دامپزشکی باران",
    accent: "lavender",
  },
  {
    key: "imaging",
    numeral: "۰۵",
    name: "تصویربرداری",
    tagline: "دید دقیق‌تر با رادیوگرافی",
    title: "تصویربرداری و رادیولوژی",
    text: "رادیوگرافی و تصویربرداری دیجیتال برای تشخیص دقیق آسیب‌ها و بیماری‌های داخلی، بدون استرس برای بیمار.",
    image: "/images/facility-xray.jpg",
    alt: "تصویربرداری رادیولوژی حیوانات در کلینیک دامپزشکی باران",
    accent: "yellow",
  },
  {
    key: "emergency",
    numeral: "۰۶",
    name: "اورژانس ۲۴ ساعته",
    tagline: "هر ساعتی که نیاز باشد",
    title: "اورژانس ۲۴ ساعته",
    text: "تیمی آماده در تمام ساعات شبانه‌روز برای شرایط حاد و نیاز فوری حیوان شما.",
    image: "/images/facility-icu.jpg",
    alt: "بخش مراقبت‌های ویژه اورژانس در کلینیک دامپزشکی باران",
    accent: "coral",
  },
  {
    key: "laboratory",
    numeral: "۰۷",
    name: "آزمایشگاه",
    tagline: "جواب‌های سریع و مطمئن",
    title: "آزمایشگاه تخصصی",
    text: "آزمایش‌های خون، ادرار و تخصصی با دستگاه‌های مدرن و جواب‌دهی سریع.",
    image: "/images/service-lab.jpg",
    alt: "آزمایشگاه تخصصی کلینیک دامپزشکی باران",
    accent: "green",
  },
  {
    key: "nutrition",
    numeral: "۰۸",
    name: "تغذیه و رژیم‌درمانی",
    tagline: "برنامه غذایی متناسب با بیمار",
    title: "تغذیه و رژیم‌درمانی",
    text: "برنامه‌ای تغذیه و رژیم‌درمانی متناسب با نژاد، سن و شرایط پزشکی حیوان شما.",
    image: "/images/why-baran.jpg",
    alt: "برنامه تغذیه و رژیم‌درمانی حیوانات در کلینیک دامپزشکی باران",
    accent: "lavender",
  },
  ],
};

export type Facility = {
  key: string;
  name: string;
  title: string;
  text: string;
  image: string;
  alt: string;
};

export const FACILITIES: {
  eyebrow: string;
  headline: string[];
  intro: string;
  items: Facility[];
} = {
  // TODO: real data — facility descriptions to be confirmed with the clinic.
  eyebrow: "فضاهای کلینیک",
  headline: ["جایی که تجهیزات،", "آرامش را ملاقات می‌کند"],
  intro:
    "هر بخش کلینیک باران برای آسایش حیوان شما طراحی شده — از اتاق عمل مجهز تا بخش مراقبت‌های ویژه.",
  items: [
    {
      key: "surgery",
      name: "اتاق عمل",
      title: "اتاق عمل مجهز",
      text: "اتاق عمل استریل با تجهیزات مدرن جراحی، بیهوشی ایمن و مانیتورینگ لحظه‌ای.",
      image: "/images/facility-op.jpg",
      alt: "اتاق عمل مجهز کلینیک دامپزشکی باران",
    },
    {
      key: "icu",
      name: "مراقبت‌های ویژه",
      title: "بخش مراقبت‌های ویژه",
      text: "monitoring ۲۴ ساعته برای بیماران بدحال، با تیمی از دامپزشکان متخصص.",
      image: "/images/facility-icu.jpg",
      alt: "بخش مراقبت‌های ویژه کلینیک دامپزشکی باران",
    },
    {
      key: "lab",
      name: "آزمایشگاه",
      title: "آزمایشگاه تخصصی",
      text: "دستگاه‌های مدرن آزمایشگاهی برای جواب‌دهی سریع و دقیق.",
      image: "/images/facility-lab.jpg",
      alt: "آزمایشگاه تخصصی کلینیک دامپزشکی باران",
    },
    {
      key: "xray",
      name: "تصویربرداری",
      title: "مرکز تصویربرداری",
      text: "رادیوگرافی و سونوگرافی دیجیتال با کیفیت بالا و بدون استرس.",
      image: "/images/facility-xray.jpg",
      alt: "مرکز تصویربرداری کلینیک دامپزشکی باران",
    },
  ],
};

export type Doctor = {
  key: string;
  name: string;
  role: string;
  image: string;
  alt: string;
  slug: string;
};

export const DOCTORS: {
  eyebrow: string;
  headline: string[];
  intro: string;
  items: Doctor[];
} = {
  // TODO: real data — doctor profiles to be confirmed with the clinic.
  eyebrow: "تیم پزشکان",
  headline: ["متخصصانی که", "به حیوان شما عشق می‌ورزند"],
  intro:
    "هر یک از دامپزشکان باران سال‌ها تجربه و تخصص در حوزه خاص خود دارند — از جراحی تا داخلی، از تصویربرداری تا اورژانس.",
  items: [
    {
      key: "dr-1",
      name: "دکتر سارا احمدی",
      role: "جراح عمومی و ارتوپدی",
      image: "/images/doctor-1.jpg",
      alt: "دکتر سارا احمدی، جراح عمومی و ارتوپدی کلینیک دامپزشکی باران",
      slug: "dr-sara-ahmadi",
    },
    {
      key: "dr-2",
      name: "دکتر علی رضایی",
      role: "بیماری‌های داخلی و گوارش",
      image: "/images/doctor-2.jpg",
      alt: "دکتر علی رضایی، متخصص بیماری‌های داخلی کلینیک دامپزشکی باران",
      slug: "dr-ali-rezaei",
    },
    {
      key: "dr-3",
      name: "دکتر مریم کریمی",
      role: "تصویربرداری و رادیولوژی",
      image: "/images/doctor-3.jpg",
      alt: "دکتر مریم کریمی، متخصص تصویربرداری کلینیک دامپزشکی باران",
      slug: "dr-maryam-karimi",
    },
    {
      key: "dr-4",
      name: "دکتر حسین محمدی",
      role: "اورژانس و مراقبت‌های ویژه",
      image: "/images/doctor-4.jpg",
      alt: "دکتر حسین محمدی، متخصص اورژانس کلینیک دامپزشکی باران",
      slug: "dr-hossein-mohammadi",
    },
  ],
};

export const EMERGENCY = {
  eyebrow: "اورژانس",
  headline: ["تیم اورژانس،", "همیشه در کنارِ شماست"],
  intro: "برای شرایط حاد و نیاز فوری به پزشک، تیم ما در تمام ساعات شبانه‌روز در دسترس شماست.",
  phone: "۰۲۱-۲۲۰۰۰۰۰۰",
  hours: "هر روز، ۸ صبح تا ۱۰ شب",
  phoneHref: "tel:+982122000000",
};

export const TRUST = {
  // TODO: real data — no fabricated claims. Real client feedback will be
  // reviewed with the clinic before publication; the placeholders below are
  // explicit "sample" markers so nothing false ships to visitors.
  eyebrow: "اعتماد شما",
  headline: ["حرفِ خانواده‌ها،", "افتخارِ باران"],
  intro:
    "در این بخش، بازخورد واقعیِ مراجعین باران نمایش داده می‌شود؛ از نظر نگه‌داشتن تا رضایت از درمان. متن‌های فعلی نمونه است و تا تأیید نهایی کلینیک، جایگزین می‌شود.",
  items: [
    {
      key: "t-1",
      quote: "نمونه: بازخورد واقعی مراجعین باران در اینجا نمایش داده می‌شود.",
      author: "نام صاحبِ حیوان خانگی",
      context: "مثلاً: گربهٔ ۴ساله، واکسیناسیون",
    },
    {
      key: "t-2",
      quote: "نمونه: بازخورد واقعی مراجعین باران در اینجا نمایش داده می‌شود.",
      author: "نام صاحبِ حیوان خانگی",
      context: "مثلاً: سگ، جراحی تخصصی",
    },
    {
      key: "t-3",
      quote: "نمونه: بازخورد واقعی مراجعین باران در اینجا نمایش داده می‌شود.",
      author: "نام صاحبِ حیوان خانگی",
      context: "مثلاً: پرنده، معاینه دوره‌ای",
    },
  ],
  note: "تأییدِ نهایی: این متن‌ها نمونه است و پس از بازبینی با کلینیک، با بازخورد واقعی جایگزین می‌شود.",
};

export type AppointmentStepKey = "service" | "animal" | "date" | "contact";

export type AppointmentStep = {
  key: AppointmentStepKey;
  label: string;
  title: string;
  hint: string;
};

export const APPOINTMENT: {
  eyebrow: string;
  headline: string[];
  intro: string;
  note: string;
  steps: AppointmentStep[];
  timeSlots: { key: string; label: string }[];
} = {
  // TODO: real data — booking-flow copy to be confirmed with the clinic;
  // time slots are samples until the real availability calendar is wired.
  // The flow itself is booking-API-ready (see AppointmentCTA handleSubmit).
  eyebrow: "رزرو نوبت",
  headline: ["یک نوبتِ ساده،", "برای آرامشِ شما"],
  intro:
    "در چهار گامِ کوتاه، نوبت موردنظرتان را ثبت کنید؛ همکاران ما برای تأییدِ نهایی با شما تماس می‌گیرند.",
  note: "نوبتِ شما پس از تماسِ تأییدیِ تیمِ کلینیک، قطعی می‌شود.",
  steps: [
    {
      key: "service",
      label: "خدمت",
      title: "کدام خدمت را نیاز دارید؟",
      hint: "یکی از خدماتِ کلینیک را انتخاب کنید.",
    },
    {
      key: "animal",
      label: "حیوان",
      title: "بیمارِ ما کیست؟",
      hint: "نوعِ حیوانِ خانگی را انتخاب کنید.",
    },
    {
      key: "date",
      label: "تاریخ",
      title: "چه روز و ساعتی مناسب شماست؟",
      hint: "یک روز و یک بازهٔ زمانی را انتخاب کنید.",
    },
    {
      key: "contact",
      label: "تماس",
      title: "راهِ ارتباطی را ثبت کنید",
      hint: "برای هماهنگیِ نهایی با شما تماس می‌گیریم.",
    },
  ],
  timeSlots: [
    { key: "morning", label: "۹:۰۰ صبح" },
    { key: "midday", label: "۱۳:۰۰" },
    { key: "evening", label: "۱۷:۰۰" },
    { key: "night", label: "۲۰:۰۰" },
  ],
};

export const HERO = {
  eyebrow: "کلینیک دامپزشکی باران",
  // Split into display lines for the split-lines reveal (Step 7.1).
  headline: ["سلامتِ همراهِ کوچکت،", "مأموریتِ بزرگِ ماست"],
  subhead:
    "از نخستین واکسن تا جراحی‌های پیشرفته؛ تیمی از دامپزشکان متخصص و تجهیزاتی مدرن، همیشه کنار شما و حیوان عزیزتان هستند.",
  cta: {
    primary: { label: "رزرو نوبت آنلاین", href: "#appointment" },
    secondary: { label: "آشنایی با خدمات", href: "#services" },
  },
  meta: [
    { key: "hours" as const, text: "هر روز، ۸ صبح تا ۱۰ شب" },
    { key: "emergency" as const, text: "اورژانس ۲۴ ساعته" },
    { key: "location" as const, text: "تهران، ولیعصر" },
  ],
  image: { dog: "/images/hero-dog.jpg", cat: "/images/hero-cat.jpg" },
};