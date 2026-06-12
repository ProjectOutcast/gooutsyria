/**
 * Demo dataset for Go Out Syria — fictional Damascus restaurants, reviews,
 * offers, and collections, shared by the CLI seed and the admin
 * "generate demo data" button.
 *
 * seedDemoData() is idempotent and non-destructive: taxonomy and demo users
 * are upserted, restaurants/collections that already exist (by slug) are
 * skipped, and nothing is ever deleted.
 */
import bcrypt from "bcryptjs";
import type { PrismaClient } from "../generated/prisma/client";
import { slugify } from "./slug";

type Hours = Record<string, { open: string; close: string } | null>;

const HOURS_STANDARD: Hours = {
  "0": { open: "11:00", close: "23:30" },
  "1": { open: "11:00", close: "23:30" },
  "2": { open: "11:00", close: "23:30" },
  "3": { open: "11:00", close: "23:30" },
  "4": { open: "11:00", close: "01:00" },
  "5": { open: "11:00", close: "01:00" },
  "6": { open: "11:00", close: "23:30" },
};
const HOURS_CAFE: Hours = {
  "0": { open: "08:00", close: "00:00" },
  "1": { open: "08:00", close: "00:00" },
  "2": { open: "08:00", close: "00:00" },
  "3": { open: "08:00", close: "00:00" },
  "4": { open: "08:00", close: "02:00" },
  "5": { open: "08:00", close: "02:00" },
  "6": { open: "08:00", close: "00:00" },
};

const NEIGHBORHOODS = [
  "المالكي", "أبو رمانة", "الشعلان", "المزة", "باب توما", "القصاع",
  "الميدان", "ساروجة", "المهاجرين", "كفرسوسة", "الصالحية", "ركن الدين",
  "باب شرقي", "القيمرية", "شارع بغداد", "عرنوس", "البرامكة", "دمر",
];

const CUISINES: [string, string, string][] = [
  ["شامي أصيل", "shami", "🥙"],
  ["مشاوي", "mashawi", "🍢"],
  ["إيطالي", "italian", "🍕"],
  ["وجبات سريعة", "fast-food", "🍔"],
  ["كافيه", "cafe", "☕"],
  ["حلويات", "desserts", "🍰"],
  ["مأكولات بحرية", "seafood", "🦐"],
  ["آسيوي", "asian", "🍜"],
  ["فطور", "breakfast", "🍳"],
  ["معجنات", "pastries", "🥖"],
  ["عالمي", "international", "🍽️"],
  ["عصائر ومشروبات", "juices", "🥤"],
];

const FEATURES: [string, string, string][] = [
  ["واي فاي", "wifi", "📶"],
  ["جلسة خارجية", "outdoor", "🌿"],
  ["صالة عائلات", "family", "👨‍👩‍👧"],
  ["أركيلة", "shisha", "💨"],
  ["موقف سيارات", "parking", "🅿️"],
  ["خدمة توصيل", "delivery", "🛵"],
  ["مناسب للأطفال", "kids", "🧒"],
  ["موسيقى حية", "live-music", "🎶"],
  ["بيت دمشقي قديم", "old-house", "🏛️"],
  ["إطلالة", "view", "🏞️"],
];

const REVIEWERS: [string, string][] = [
  ["لين الجابري", "user@gooutsyria.com"],
  ["سامر الحمصي", "samer@example.com"],
  ["رنا الشامية", "rana@example.com"],
  ["خالد العبد الله", "khaled@example.com"],
  ["نور حداد", "nour@example.com"],
  ["مجد السباعي", "majd@example.com"],
];

const REVIEW_TEXTS: [number, string][] = [
  [5, "تجربة رائعة بكل المقاييس — الأكل طازة والخدمة سريعة والقعدة حلوة كتير. رح نرجع أكيد!"],
  [4, "الأكل ممتاز والأسعار معقولة مقارنة بالجودة. الملاحظة الوحيدة إنو في شوية ازدحام بالويكند."],
  [5, "من أفضل الأماكن يلي جربتها بدمشق. الطعم أصيل والمكان نظيف والموظفين محترمين."],
  [3, "الأكل منيح بس الانتظار طول شوي. بتمنى يحسنوا سرعة الخدمة."],
  [4, "قعدة حلوة وأجواء مريحة. الأسعار مقبولة والكمية كويسة."],
  [5, "ما في أطيب من هيك! كل شي كان مثالي من الاستقبال للحساب."],
  [2, "للأسف التجربة كانت أقل من المتوقع، الطلب وصل بارد. ممكن كانت ليلة سيئة بس ما رح كرر قريباً."],
  [4, "مكان نظيف وأكل طيب. جربوا الأطباق المميزة عندهم."],
];

type Item = [string, number, string?, boolean?];
type SectionDef = { name: string; items: Item[] };
type RestDef = {
  nameAr: string;
  nameEn?: string;
  desc: string;
  nbName: string;
  cuisineSlugs: string[];
  featureSlugs: string[];
  price: "CHEAP" | "MODERATE" | "EXPENSIVE" | "LUXURY";
  phone: string;
  whatsapp?: string;
  address: string;
  lat: number;
  lng: number;
  hours: Hours;
  photos: number[];
  menu: SectionDef[];
  verified?: boolean;
  pro?: boolean;
  owned?: boolean;
};

const RESTAURANTS: RestDef[] = [
  {
    nameAr: "بيت الياسمين الشامي",
    nameEn: "Beit Al Yasmine",
    desc: "بيت دمشقي قديم في قلب ساروجة، يقدّم المائدة الشامية الكاملة من الكبة اللبنية إلى الفتة الشامية، مع جلسة أصيلة حول البحرة وعبق الياسمين.",
    nbName: "ساروجة",
    cuisineSlugs: ["shami"],
    featureSlugs: ["old-house", "family", "outdoor", "wifi"],
    price: "EXPENSIVE",
    phone: "+963 11 231 4567",
    whatsapp: "+963944111222",
    address: "ساروجة، خلف جامع الورد، دمشق",
    lat: 33.5165, lng: 36.3015,
    hours: HOURS_STANDARD,
    photos: [1, 2, 3],
    verified: true, pro: true, owned: true,
    menu: [
      { name: "المقبلات", items: [["حمص بيروتي", 15000], ["متبل باذنجان", 15000], ["كبة مقلية (٤ قطع)", 35000, "كبة برغل محشوة لحمة وصنوبر", true], ["فتوش", 18000]] },
      { name: "الأطباق الرئيسية", items: [["فتة شامية باللحمة", 55000, "مع سمنة عربية أصلية", true], ["كبة لبنية", 60000], ["شيخ المحشي", 58000], ["يبرق (٢٠ ورقة)", 65000]] },
      { name: "الحلويات", items: [["مهلبية بالقشطة", 20000], ["بقلاوة مشكلة", 30000]] },
    ],
  },
  {
    nameAr: "مشاوي الميدان",
    nameEn: "Mashawi Al Midan",
    desc: "أشهر مشاوي الميدان منذ ١٩٧٨ — كباب حلبي، شقف، وريش غنم على الفحم، مع خبز تنور ساخن ومقبلات بلدية.",
    nbName: "الميدان",
    cuisineSlugs: ["mashawi", "shami"],
    featureSlugs: ["family", "delivery", "parking"],
    price: "MODERATE",
    phone: "+963 11 884 2233",
    whatsapp: "+963933444555",
    address: "الميدان، شارع الجزماتية، دمشق",
    lat: 33.4925, lng: 36.2972,
    hours: HOURS_STANDARD,
    photos: [4, 5, 2],
    verified: true, owned: true,
    menu: [
      { name: "المشاوي", items: [["كباب حلبي (كيلو)", 180000, "لحم غنم بلدي مفروم مع بهارات حلبية", true], ["شقف مشوي (كيلو)", 200000], ["ريش غنم (كيلو)", 220000], ["شيش طاووق (سيخ)", 30000]] },
      { name: "المقبلات", items: [["محمرة حلبية", 16000], ["سلطة بندورة بدبس الرمان", 14000], ["كبة نية", 40000]] },
    ],
  },
  {
    nameAr: "ترّاس الشام",
    nameEn: "Terrace Al Sham",
    desc: "كافيه ومطعم بإطلالة بانورامية على دمشق من جبل قاسيون — أراكيل، مشروبات ساخنة وباردة، وأطباق خفيفة حتى ساعات الفجر.",
    nbName: "المهاجرين",
    cuisineSlugs: ["cafe", "international"],
    featureSlugs: ["view", "shisha", "outdoor", "wifi", "live-music"],
    price: "EXPENSIVE",
    phone: "+963 11 371 8899",
    address: "طريق قاسيون، المهاجرين، دمشق",
    lat: 33.5354, lng: 36.2882,
    hours: HOURS_CAFE,
    photos: [6, 1, 5],
    pro: true,
    menu: [
      { name: "المشروبات الساخنة", items: [["قهوة عربية", 12000], ["شاي بالنعناع (بكرج)", 15000], ["سحلب بالقرفة", 18000]] },
      { name: "الأراكيل", items: [["أركيلة تفاحتين", 35000, undefined, true], ["أركيلة عنب نعناع", 35000]] },
      { name: "الأطباق الخفيفة", items: [["سندويش حلومي مشوي", 28000], ["بطاطا مقلية بالكزبرة والثوم", 18000]] },
    ],
  },
  {
    nameAr: "بيتزا روما الشعلان",
    nameEn: "Pizza Roma",
    desc: "بيتزا إيطالية على الحطب وباستا طازجة يومياً في قلب الشعلان — عجينة تختمر ٤٨ ساعة ومكونات مستوردة.",
    nbName: "الشعلان",
    cuisineSlugs: ["italian", "fast-food"],
    featureSlugs: ["delivery", "wifi", "kids"],
    price: "MODERATE",
    phone: "+963 11 332 1144",
    whatsapp: "+963955666777",
    address: "الشعلان، شارع عمان، دمشق",
    lat: 33.5189, lng: 36.2891,
    hours: HOURS_STANDARD,
    photos: [7, 8],
    verified: true,
    menu: [
      { name: "البيتزا", items: [["مارغريتا", 45000, "صلصة بندورة، موزاريلا، ريحان", true], ["بيتزا الخضار المشوية", 55000], ["بيبروني", 65000], ["كواترو فورماجي", 70000]] },
      { name: "الباستا", items: [["سباغيتي بولونيز", 50000], ["فيتوتشيني ألفريدو", 55000], ["بيني أرابياتا", 45000]] },
    ],
  },
  {
    nameAr: "كافيه الرواق",
    nameEn: "Al Riwaq Cafe",
    desc: "كافيه ثقافي في باب توما — قهوة مختصة، مكتبة صغيرة، وأمسيات موسيقية كل خميس. المكان المفضل لطلاب الجامعات والفنانين.",
    nbName: "باب توما",
    cuisineSlugs: ["cafe", "desserts"],
    featureSlugs: ["wifi", "live-music", "old-house"],
    price: "CHEAP",
    phone: "+963 11 542 7700",
    address: "باب توما، حارة الزيتون، دمشق",
    lat: 33.5142, lng: 36.3175,
    hours: HOURS_CAFE,
    photos: [9, 6],
    owned: true,
    menu: [
      { name: "القهوة المختصة", items: [["إسبريسو", 14000], ["لاتيه", 20000, undefined, true], ["V60", 25000], ["آيس لاتيه", 24000]] },
      { name: "الحلويات", items: [["تشيز كيك توت", 28000], ["براونيز", 22000], ["كوكيز", 12000]] },
    ],
  },
  {
    nameAr: "سمكة المزة",
    nameEn: "Samket Al Mazzeh",
    desc: "أطيب سمك ومأكولات بحرية طازجة يومياً من الساحل — سلطات بحرية، صيادية، وجمبري مشوي، مع جلسات عائلية.",
    nbName: "المزة",
    cuisineSlugs: ["seafood"],
    featureSlugs: ["family", "parking", "delivery"],
    price: "LUXURY",
    phone: "+963 11 662 5500",
    whatsapp: "+963988111333",
    address: "المزة، أوتوستراد المزة، دمشق",
    lat: 33.5021, lng: 36.2569,
    hours: HOURS_STANDARD,
    photos: [10, 3],
    menu: [
      { name: "الأسماك", items: [["سمك سلطان إبراهيم (كيلو)", 350000, "مقلي أو مشوي", true], ["صيادية", 180000], ["فيليه هامور مشوي", 250000]] },
      { name: "المقبلات البحرية", items: [["جمبري بالثوم والليمون", 150000], ["كاليماري مقلي", 120000], ["سلطة بحرية", 90000]] },
    ],
  },
  {
    nameAr: "شاورما أبو العز",
    desc: "شاورما عالفحم بخبز الصاج — وجهة سهرات دمشق منذ ٢٠٠٥. عرض دائم: سندويشتين + بطاطا + مشروب.",
    nbName: "البرامكة",
    cuisineSlugs: ["fast-food"],
    featureSlugs: ["delivery"],
    price: "CHEAP",
    phone: "+963 11 213 9988",
    whatsapp: "+963966222444",
    address: "البرامكة، مقابل كلية الحقوق، دمشق",
    lat: 33.5118, lng: 36.2832,
    hours: HOURS_CAFE,
    photos: [13, 4],
    menu: [
      { name: "الشاورما", items: [["سندويشة شاورما دجاج", 18000, undefined, true], ["سندويشة شاورما لحمة", 25000], ["صحن شاورما دجاج", 45000], ["عربي شاورما بالصاج", 30000]] },
      { name: "الإضافات", items: [["بطاطا مقلية", 12000], ["ثومية إضافية", 3000]] },
    ],
  },
  {
    nameAr: "حلويات قصر الشام",
    nameEn: "Qasr Al Sham Sweets",
    desc: "حلويات شامية فاخرة منذ ١٩٥٢ — بقلاوة، بللورية، حلاوة الجبن على الطريقة الحموية، وبوظة عربية بالقشطة والفستق.",
    nbName: "الصالحية",
    cuisineSlugs: ["desserts"],
    featureSlugs: ["family", "kids"],
    price: "MODERATE",
    phone: "+963 11 223 5566",
    address: "الصالحية، شارع العابد، دمشق",
    lat: 33.5198, lng: 36.2945,
    hours: HOURS_CAFE,
    photos: [11, 12],
    verified: true,
    menu: [
      { name: "الحلويات العربية", items: [["بقلاوة فستق (كيلو)", 220000, undefined, true], ["بللورية (كيلو)", 240000], ["حلاوة الجبن (كيلو)", 130000], ["معمول مد بالفستق", 180000]] },
      { name: "البوظة", items: [["بوظة عربية بالفستق", 30000, "مدقوقة على الطريقة الشامية", true], ["بوظة قشطة بالعسل", 28000]] },
    ],
  },
  {
    nameAr: "نودلز هاوس",
    nameEn: "Noodles House",
    desc: "أول مطعم آسيوي متخصص في دمشق — نودلز ووك، سوشي رول، ودجاج كونغ باو، بنكهات أصلية ومكونات طازجة.",
    nbName: "أبو رمانة",
    cuisineSlugs: ["asian", "international"],
    featureSlugs: ["delivery", "wifi"],
    price: "EXPENSIVE",
    phone: "+963 11 333 7788",
    whatsapp: "+963999888777",
    address: "أبو رمانة، شارع الجلاء، دمشق",
    lat: 33.5172, lng: 36.2801,
    hours: HOURS_STANDARD,
    photos: [14, 8],
    pro: true,
    menu: [
      { name: "النودلز", items: [["نودلز دجاج بالخضار", 60000, undefined, true], ["نودلز جمبري حار", 85000], ["باد تاي", 70000]] },
      { name: "السوشي", items: [["كاليفورنيا رول (٨ قطع)", 90000], ["سبايسي تونا رول", 100000]] },
    ],
  },
  {
    nameAr: "فطور عالطريقة الشامية",
    nameEn: "Shami Breakfast",
    desc: "فول، فتة حمص، مسبحة، وقلاية بندورة — فطور شامي كامل من السادسة صباحاً، مع خبز مشروح طازج من الفرن المجاور.",
    nbName: "القيمرية",
    cuisineSlugs: ["breakfast", "shami"],
    featureSlugs: ["old-house"],
    price: "CHEAP",
    phone: "+963 11 541 2211",
    address: "القيمرية، قرب مقهى النوفرة، دمشق",
    lat: 33.5108, lng: 36.3082,
    hours: {
      "0": { open: "06:00", close: "16:00" }, "1": { open: "06:00", close: "16:00" },
      "2": { open: "06:00", close: "16:00" }, "3": { open: "06:00", close: "16:00" },
      "4": { open: "06:00", close: "16:00" }, "5": { open: "06:00", close: "17:00" },
      "6": { open: "06:00", close: "16:00" },
    },
    photos: [15, 9],
    menu: [
      { name: "الفطور", items: [["صحن فول بزيت الزيتون", 15000, undefined, true], ["فتة حمص", 20000], ["مسبحة", 18000], ["قلاية بندورة بالبيض", 22000], ["صحن مشكل (لشخصين)", 50000, "فول + مسبحة + قلاية + مخللات", true]] },
      { name: "المشروبات", items: [["شاي عالفحم", 5000], ["عيران", 7000]] },
    ],
  },
  {
    nameAr: "معجنات وفطائر الضيعة",
    desc: "مناقيش زعتر وجبنة على الصاج، فطائر سبانخ ولحم بعجين — كل شي طازة من الفرن من الصباح الباكر.",
    nbName: "ركن الدين",
    cuisineSlugs: ["pastries", "breakfast"],
    featureSlugs: ["delivery", "kids"],
    price: "CHEAP",
    phone: "+963 11 273 4455",
    address: "ركن الدين، الشيخ خالد، دمشق",
    lat: 33.5302, lng: 36.2951,
    hours: HOURS_CAFE,
    photos: [16, 10],
    menu: [
      { name: "المناقيش", items: [["منقوشة زعتر", 8000, undefined, true], ["منقوشة جبنة", 15000], ["نص نص", 12000], ["لحم بعجين", 18000]] },
      { name: "الفطائر", items: [["فطيرة سبانخ", 10000], ["فطيرة جبنة وزيتون", 16000]] },
    ],
  },
  {
    nameAr: "عصير تايم",
    nameEn: "Juice Time",
    desc: "عصائر طبيعية ١٠٠٪ وكوكتيلات فواكه طازجة مع طبقة قشطة وعسل — وجهة شارع الحمرا الأشهر للعصير الطازج.",
    nbName: "الشعلان",
    cuisineSlugs: ["juices"],
    featureSlugs: ["delivery"],
    price: "CHEAP",
    phone: "+963 11 331 6677",
    address: "شارع الحمرا، دمشق",
    lat: 33.5176, lng: 36.2922,
    hours: HOURS_CAFE,
    photos: [12, 16],
    menu: [
      { name: "العصائر الطبيعية", items: [["عصير برتقال طازج", 15000], ["كوكتيل فواكه بالقشطة", 30000, undefined, true], ["عصير رمان", 25000], ["موز حليب", 20000]] },
    ],
  },
  {
    nameAr: "بيت وردة الدمشقي",
    nameEn: "Beit Warda",
    desc: "مطعم فاخر في بيت دمشقي مرمم من القرن الثامن عشر — مطبخ شامي راقٍ مع لمسة معاصرة، وأمسيات عود وقانون.",
    nbName: "باب شرقي",
    cuisineSlugs: ["shami", "international"],
    featureSlugs: ["old-house", "live-music", "family", "view"],
    price: "LUXURY",
    phone: "+963 11 543 8800",
    whatsapp: "+963944999000",
    address: "باب شرقي، الشارع المستقيم، دمشق",
    lat: 33.5125, lng: 36.3198,
    hours: HOURS_STANDARD,
    photos: [2, 1, 6],
    verified: true, pro: true,
    menu: [
      { name: "المقبلات الراقية", items: [["كبة سماقية", 45000], ["محمرة بالجوز الطازج", 30000], ["سلطة الرمان والجرجير", 28000]] },
      { name: "الأطباق الرئيسية", items: [["خروف محشي عالطريقة الدمشقية", 150000, "للشخصين", true], ["دجاج محشي فريكة", 95000], ["سمك حرّة بالطحينة", 120000]] },
    ],
  },
  {
    nameAr: "برغر فاكتوري",
    nameEn: "Burger Factory",
    desc: "سماش برغر أنغوس مع صوصات سرية وبطاطا مقرمشة — أسرع نمواً بين مطاعم البرغر بدمشق، يفتح حتى ٣ فجراً.",
    nbName: "كفرسوسة",
    cuisineSlugs: ["fast-food", "international"],
    featureSlugs: ["delivery", "parking", "wifi"],
    price: "MODERATE",
    phone: "+963 11 214 3322",
    whatsapp: "+963933000111",
    address: "كفرسوسة، البوليفارد، دمشق",
    lat: 33.4988, lng: 36.2715,
    hours: {
      "0": { open: "12:00", close: "03:00" }, "1": { open: "12:00", close: "03:00" },
      "2": { open: "12:00", close: "03:00" }, "3": { open: "12:00", close: "03:00" },
      "4": { open: "12:00", close: "04:00" }, "5": { open: "12:00", close: "04:00" },
      "6": { open: "12:00", close: "03:00" },
    },
    photos: [13, 7],
    menu: [
      { name: "البرغر", items: [["كلاسيك سماش", 50000, undefined, true], ["دبل تشيز", 70000], ["ماشروم سويس", 65000], ["برغر دجاج مقرمش", 55000]] },
      { name: "الإضافات", items: [["بطاطا فاكتوري", 20000, "مع صوص الجبنة"], ["حلقات بصل", 18000]] },
    ],
  },
  {
    nameAr: "مقهى النخبة",
    desc: "مقهى شعبي عريق في عرنوس — طاولة زهر، ورق، أركيلة معسل بلدي، ومباريات كرة القدم على الشاشة الكبيرة.",
    nbName: "عرنوس",
    cuisineSlugs: ["cafe"],
    featureSlugs: ["shisha", "wifi"],
    price: "CHEAP",
    phone: "+963 11 444 1100",
    address: "ساحة عرنوس، دمشق",
    lat: 33.5223, lng: 36.2935,
    hours: HOURS_CAFE,
    photos: [5, 9],
    menu: [
      { name: "المشروبات", items: [["قهوة مرة", 8000], ["شاي", 6000], ["متة", 10000, undefined, true]] },
      { name: "الأراكيل", items: [["أركيلة معسل", 25000], ["أركيلة عجمي", 20000]] },
    ],
  },
  {
    nameAr: "تكية أبو شاكر",
    desc: "أكل بيتي شامي باليوم والطبخة — كل يوم طبخة: ملوخية، بامية، مقلوبة، ومحاشي. وجبة كاملة بسعر عادل.",
    nbName: "الميدان",
    cuisineSlugs: ["shami"],
    featureSlugs: ["family", "delivery"],
    price: "CHEAP",
    phone: "+963 11 885 6611",
    address: "الميدان، شارع الدقاق، دمشق",
    lat: 33.4951, lng: 36.3001,
    hours: {
      "0": { open: "11:00", close: "17:00" }, "1": { open: "11:00", close: "17:00" },
      "2": { open: "11:00", close: "17:00" }, "3": { open: "11:00", close: "17:00" },
      "4": { open: "11:00", close: "17:00" }, "5": null, "6": { open: "11:00", close: "17:00" },
    },
    photos: [3, 15],
    menu: [
      { name: "طبخة اليوم", items: [["ملوخية بالدجاج مع رز", 35000, "يوم الأحد والأربعاء", true], ["مقلوبة باذنجان", 35000, "يوم الاثنين والخميس"], ["بامية باللحمة", 40000, "يوم الثلاثاء والسبت"]] },
      { name: "الإضافات", items: [["سلطة يومية", 10000], ["لبن خاثر", 8000]] },
    ],
  },
];

const OFFERS: [number, string, string][] = [
  [1, "خصم 20% على كل المشاوي", "العرض ساري من الأحد للخميس على الطلبات داخل الصالة"],
  [3, "قهوة ثانية مجاناً", "اطلب أي قهوة مختصة والتانية ع حسابنا — يومياً قبل الظهر"],
  [6, "وجبة شاورما عائلية بـ 99 ألف", "٤ سندويشات + بطاطا كبيرة + مشروبات"],
  [8, "عرض الفطور الكامل لشخصين", "صحن مشكل + مشروبات ساخنة بـ 60 ألف فقط"],
  [13, "سماش برغر + بطاطا + مشروب بـ 75 ألف", "يومياً بعد منتصف الليل"],
];

const COLLECTIONS: [string, string, string, number[], string[]][] = [
  [
    "أفضل بيوت دمشق القديمة",
    "old-damascus-houses",
    "جلسات لا تُنسى في بيوت شامية عمرها مئات السنين — حيث الأصالة تلتقي بأطيب المأكولات",
    [0, 12, 4, 9],
    ["بيت ساروجي عريق بأجواء ياسمين", "فخامة القرن الثامن عشر بلمسة معاصرة", "كافيه ثقافي بروح شبابية", "فطور شامي بقلب المدينة القديمة"],
  ],
  [
    "وين أحلى فطور بدمشق؟",
    "best-breakfast-damascus",
    "من الفول والمسبحة للمناقيش الساخنة — دليلك لأحلى صباحات دمشق",
    [9, 10, 4],
    ["الفول والفتة على الأصول", "مناقيش عالصاج من الفرن مباشرة", "قهوة مختصة وحلويات بيتية"],
  ],
  [
    "سهرات ما بتخلص",
    "late-night-damascus",
    "أماكن مفتوحة لساعات متأخرة — للسهرات الطويلة مع الأصدقاء",
    [2, 13, 6, 14],
    ["إطلالة قاسيون الساحرة حتى الفجر", "برغر بعد منتصف الليل", "شاورما السهرة الأشهر", "زهر وأركيلة وماتش"],
  ],
];

export type SeedResult = {
  createdRestaurants: number;
  skippedRestaurants: number;
  createdCollections: number;
};

export async function seedDemoData(db: PrismaClient): Promise<SeedResult> {
  const inDays = (d: number) => new Date(Date.now() + d * 86400000);

  // --- taxonomy (upserts — safe on existing data) ---
  const damascus = await db.city.upsert({
    where: { slug: "damascus" },
    update: {},
    create: { slug: "damascus", nameAr: "دمشق" },
  });

  const neighborhoods = await Promise.all(
    NEIGHBORHOODS.map((nameAr) =>
      db.neighborhood.upsert({
        where: { cityId_slug: { cityId: damascus.id, slug: slugify(nameAr) } },
        update: {},
        create: { nameAr, slug: slugify(nameAr), cityId: damascus.id },
      })
    )
  );
  const nb = (name: string) => neighborhoods.find((n) => n.nameAr === name)!.id;

  const cuisines = await Promise.all(
    CUISINES.map(([nameAr, slug, icon]) =>
      db.cuisine.upsert({
        where: { slug },
        update: {},
        create: { nameAr, slug, icon },
      })
    )
  );
  const cu = (slug: string) => cuisines.find((c) => c.slug === slug)!.id;

  const features = await Promise.all(
    FEATURES.map(([nameAr, slug, icon]) =>
      db.feature.upsert({
        where: { slug },
        update: {},
        create: { nameAr, slug, icon },
      })
    )
  );
  const ft = (slug: string) => features.find((f) => f.slug === slug)!.id;

  // --- demo users (upserts; password only set on first creation) ---
  const owner = await db.user.upsert({
    where: { email: "owner@gooutsyria.com" },
    update: {},
    create: {
      name: "أبو محمد",
      email: "owner@gooutsyria.com",
      passwordHash: await bcrypt.hash("Owner1234!", 10),
      role: "OWNER",
    },
  });

  const reviewers = await Promise.all(
    REVIEWERS.map(([name, email]) =>
      db.user.upsert({
        where: { email },
        update: {},
        create: {
          name,
          email,
          passwordHash: bcrypt.hashSync("User1234!", 10),
        },
      })
    )
  );

  // --- restaurants (skip any slug that already exists) ---
  let created = 0;
  let skipped = 0;
  const createdIdx: number[] = [];
  const bySlug = new Map<string, { id: string }>();

  for (let i = 0; i < RESTAURANTS.length; i++) {
    const def = RESTAURANTS[i];
    const slug = slugify(def.nameEn ?? def.nameAr);
    const existing = await db.restaurant.findUnique({ where: { slug } });
    if (existing) {
      bySlug.set(slug, existing);
      skipped++;
      continue;
    }

    const r = await db.restaurant.create({
      data: {
        slug,
        nameAr: def.nameAr,
        nameEn: def.nameEn,
        description: def.desc,
        phone: def.phone,
        whatsapp: def.whatsapp,
        address: def.address,
        cityId: damascus.id,
        neighborhoodId: nb(def.nbName),
        lat: def.lat,
        lng: def.lng,
        priceBand: def.price,
        openingHours: def.hours,
        status: "APPROVED",
        verified: def.verified ?? false,
        tier: def.pro ? "PRO" : "FREE",
        ownerId: def.owned ? owner.id : null,
        viewCount: 150 + i * 87,
        callClicks: 12 + i * 5,
        whatsappClicks: 8 + i * 3,
        directionClicks: 5 + i * 2,
        cuisines: { create: def.cuisineSlugs.map((s) => ({ cuisineId: cu(s) })) },
        features: { create: def.featureSlugs.map((s) => ({ featureId: ft(s) })) },
        photos: {
          create: def.photos.map((p, pi) => ({
            url: `/placeholders/p${p}.svg`,
            alt: def.nameAr,
            kind: pi === 0 ? "EXTERIOR" : pi === 1 ? "INTERIOR" : "FOOD",
            sortOrder: pi,
          })),
        },
        menuSections: {
          create: def.menu.map((section, si) => ({
            nameAr: section.name,
            sortOrder: si,
            items: {
              create: section.items.map(([nameAr, priceSyp, descAr, popular], ii) => ({
                nameAr,
                priceSyp,
                descAr: descAr ?? null,
                popular: popular ?? false,
                sortOrder: ii,
              })),
            },
          })),
        },
      },
    });
    bySlug.set(slug, r);
    createdIdx.push(i);
    created++;

    // reviews for new restaurants only
    const count = 3 + (i % 5);
    for (let j = 0; j < count && j < reviewers.length; j++) {
      const [rating, text] = REVIEW_TEXTS[(i + j) % REVIEW_TEXTS.length];
      await db.review.create({
        data: {
          restaurantId: r.id,
          userId: reviewers[j].id,
          rating,
          text,
          status: "APPROVED",
          createdAt: new Date(Date.now() - (j + 1) * 86400000 * 3),
        },
      });
    }
    const agg = await db.review.aggregate({
      where: { restaurantId: r.id, status: "APPROVED" },
      _avg: { rating: true },
      _count: true,
    });
    await db.restaurant.update({
      where: { id: r.id },
      data: { avgRating: agg._avg.rating ?? 0, ratingCount: agg._count },
    });
  }

  const restaurantId = (idx: number) =>
    bySlug.get(slugify(RESTAURANTS[idx].nameEn ?? RESTAURANTS[idx].nameAr))?.id;

  // --- offers (only attached to newly created restaurants) ---
  for (const [idx, titleAr, descAr] of OFFERS) {
    const rid = restaurantId(idx);
    if (!rid || !createdIdx.includes(idx)) continue;
    await db.offer.create({
      data: { restaurantId: rid, titleAr, descAr, startsAt: inDays(-2), endsAt: inDays(14) },
    });
  }

  // --- collections (skip existing slugs) ---
  let createdCollections = 0;
  let sortOrder = 0;
  for (const [titleAr, slug, descAr, items, blurbs] of COLLECTIONS) {
    const exists = await db.collection.findUnique({ where: { slug } });
    if (exists) {
      sortOrder++;
      continue;
    }
    const itemIds = items
      .map((idx, j) => ({ rid: restaurantId(idx), blurb: blurbs[j] }))
      .filter((x): x is { rid: string; blurb: string } => Boolean(x.rid));
    await db.collection.create({
      data: {
        slug,
        titleAr,
        descAr,
        cityId: damascus.id,
        published: true,
        sortOrder: sortOrder++,
        coverImage: `/placeholders/p${items[0] + 1}.svg`,
        items: {
          create: itemIds.map((x, j) => ({
            restaurantId: x.rid,
            blurbAr: x.blurb,
            sortOrder: j,
          })),
        },
      },
    });
    createdCollections++;
  }

  // --- featured placements + sponsor (only when none are active) ---
  const activeFeatured = await db.featuredPlacement.count({
    where: { endsAt: { gte: new Date() } },
  });
  if (activeFeatured === 0) {
    const placements = [
      { idx: 0, slot: "HOME" as const },
      { idx: 12, slot: "HOME" as const },
      { idx: 8, slot: "SEARCH" as const },
      { idx: 3, slot: "CUISINE" as const, cuisineId: cu("italian") },
    ];
    for (const p of placements) {
      const rid = restaurantId(p.idx);
      if (!rid) continue;
      await db.featuredPlacement.create({
        data: {
          restaurantId: rid,
          slot: p.slot,
          cuisineId: "cuisineId" in p ? p.cuisineId : null,
          startsAt: inDays(-5),
          endsAt: inDays(25),
          notes: "بيانات تجريبية",
        },
      });
    }
  }

  const activeSponsor = await db.sponsorSlot.count({
    where: { placement: "HOME_BANNER", endsAt: { gte: new Date() } },
  });
  if (activeSponsor === 0) {
    await db.sponsorSlot.create({
      data: {
        name: "بنك الشام — تقسيط مشترياتك من المطاعم",
        placement: "HOME_BANNER",
        linkUrl: "https://example.com",
        startsAt: inDays(-5),
        endsAt: inDays(40),
      },
    });
  }

  // --- daily metrics for the owner-dashboard demo (first 3 new restaurants) ---
  for (const idx of createdIdx.slice(0, 3)) {
    const rid = restaurantId(idx);
    if (!rid) continue;
    for (let d = 0; d < 14; d++) {
      const date = new Date(new Date(Date.now() - d * 86400000).toISOString().slice(0, 10));
      await db.metricDaily.upsert({
        where: { restaurantId_date: { restaurantId: rid, date } },
        update: {},
        create: {
          restaurantId: rid,
          date,
          views: 20 + ((d * 7) % 35),
          calls: 1 + (d % 4),
          whatsapps: d % 3,
          directions: d % 2,
        },
      });
    }
  }

  return { createdRestaurants: created, skippedRestaurants: skipped, createdCollections };
}
