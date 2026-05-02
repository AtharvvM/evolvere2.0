import { useState, useEffect, useRef } from "react";
import { signInWithGoogle } from "./firebaseConfig";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { jsPDF } from "jspdf";
import {
  LayoutDashboard,
  Lightbulb,
  BookMarked,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Zap,
  Target,
  ChevronRight,
  Download,
  ArrowLeft,
  LogOut,
  LogIn,
  Star,
  Flame,
  X,
  Lock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface IPData {
  country_code: string;
  country_name: string;
  currency: string;
  city: string;
}

interface PricingInfo {
  scholar: number;
  sage: number;
  symbol: string;
  currency: string;
  isIndia: boolean;
}

type NavTab = "dashboard" | "generate" | "blueprints" | "course";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_SCHOLAR_INR = 90;
const BASE_SAGE_INR = 180;

const CURRENCY_RATES: Record<string, { rate: number; symbol: string; name: string }> = {
  USD: { rate: 0.012, symbol: "$", name: "US Dollar" },
  AED: { rate: 0.044, symbol: "د.إ", name: "UAE Dirham" },
  GBP: { rate: 0.0095, symbol: "£", name: "British Pound" },
  EUR: { rate: 0.011, symbol: "€", name: "Euro" },
  SGD: { rate: 0.016, symbol: "S$", name: "Singapore Dollar" },
  AUD: { rate: 0.018, symbol: "A$", name: "Australian Dollar" },
  CAD: { rate: 0.016, symbol: "C$", name: "Canadian Dollar" },
  SAR: { rate: 0.045, symbol: "﷼", name: "Saudi Riyal" },
  QAR: { rate: 0.044, symbol: "QR", name: "Qatari Riyal" },
  MYR: { rate: 0.056, symbol: "RM", name: "Malaysian Ringgit" },
};

const NICHES = [
  // ── PARENTING ──
  { id: "digital-detox-parenting", label: "📵 Digital Detox Parenting", desc: "Raising screen-free kids in a tech-obsessed world", color: "from-blue-500 to-indigo-600", tag: "Trending", score: 70, interest: "Rising", category: "Parenting", audience: "Parents concerned about excessive screen time", difficulty: "Medium", competition: "Med Competition", searchVol: "~12,000", queries: ["screen time kids limit", "how to reduce child phone use", "digital detox for children guide"] },
  { id: "mindful-parenting", label: "🧡 Mindful Parenting", desc: "Raising emotionally intelligent children", color: "from-orange-400 to-rose-500", tag: "Hot", score: 82, interest: "High Interest", category: "Parenting", audience: "Parents interested in emotional development of children", difficulty: "Medium", competition: "Med Competition", searchVol: "~9,500", queries: ["emotional intelligence kids", "mindful parenting techniques", "raising empathetic child"] },
  { id: "eco-parenting", label: "🌱 Eco-Friendly Parenting", desc: "Sustainable practices for raising green kids", color: "from-green-500 to-emerald-600", tag: "New", score: 65, interest: "Rising", category: "Parenting", audience: "Eco-conscious parents aiming to instill sustainability", difficulty: "Medium", competition: "Med Competition", searchVol: "~8,000", queries: ["eco friendly baby products", "sustainable parenting tips", "green lifestyle kids"] },
  { id: "positive-discipline", label: "🌟 Positive Discipline", desc: "Non-punitive techniques for well-behaved children", color: "from-yellow-400 to-amber-500", tag: "Trending", score: 74, interest: "High Interest", category: "Parenting", audience: "Parents seeking alternatives to punishment-based discipline", difficulty: "Easy", competition: "Low Competition", searchVol: "~11,000", queries: ["positive discipline methods", "non punitive parenting", "gentle parenting techniques"] },
  { id: "single-parent", label: "💪 Single Parent Survival", desc: "Thriving as a solo parent — financially & emotionally", color: "from-purple-500 to-violet-600", tag: "Hot", score: 88, interest: "High Interest", category: "Parenting", audience: "Single parents needing practical daily guidance", difficulty: "Easy", competition: "Low Competition", searchVol: "~14,000", queries: ["single parent tips", "solo parenting stress", "single mom budget guide"] },
  { id: "teen-communication", label: "🗣️ Teen Communication", desc: "Bridge the gap between parents and teenagers", color: "from-sky-500 to-cyan-600", tag: "Viral", score: 79, interest: "Rising", category: "Parenting", audience: "Parents struggling to connect with their teenagers", difficulty: "Medium", competition: "Med Competition", searchVol: "~7,800", queries: ["how to talk to teenager", "teen parent communication", "understanding adolescent behavior"] },

  // ── FITNESS ──
  { id: "home-workout", label: "🏠 Home Workout Mastery", desc: "Full body transformation with zero equipment", color: "from-red-500 to-orange-500", tag: "Hot", score: 91, interest: "High Interest", category: "Fitness", audience: "Busy professionals wanting gym results at home", difficulty: "Easy", competition: "High Competition", searchVol: "~45,000", queries: ["home workout no equipment", "bodyweight fitness routine", "calisthenics for beginners"] },
  { id: "veggie-muscle", label: "🥦 Muscle Gain for Vegetarians", desc: "Plant-based protocols for serious muscle building", color: "from-green-400 to-teal-500", tag: "Trending", score: 84, interest: "Rising", category: "Fitness", audience: "Vegetarians and vegans serious about building muscle", difficulty: "Medium", competition: "Low Competition", searchVol: "~18,000", queries: ["vegetarian muscle gain diet", "plant based protein for muscle", "vegan bodybuilding plan"] },
  { id: "over-40-fitness", label: "🏃 Fitness After 40", desc: "Science-backed training for aging bodies", color: "from-blue-500 to-sky-600", tag: "Hot", score: 87, interest: "High Interest", category: "Fitness", audience: "Adults 40+ wanting sustainable fitness without injury", difficulty: "Easy", competition: "Med Competition", searchVol: "~22,000", queries: ["fitness over 40 beginners", "workout routine after 40", "strength training middle age"] },
  { id: "hiit-fat-loss", label: "⚡ HIIT Fat Loss Blueprint", desc: "20-minute protocols for maximum calorie burn", color: "from-red-400 to-pink-600", tag: "Viral", score: 76, interest: "High Interest", category: "Fitness", audience: "Time-crunched individuals wanting rapid fat loss", difficulty: "Medium", competition: "High Competition", searchVol: "~31,000", queries: ["HIIT workout fat loss", "20 minute cardio burn", "interval training weight loss"] },
  { id: "yoga-anxiety", label: "🧘 Yoga for Anxiety", desc: "Daily poses and breathwork to calm a wired nervous system", color: "from-violet-400 to-purple-600", tag: "Trending", score: 80, interest: "Rising", category: "Fitness", audience: "Anxious individuals seeking mind-body movement practices", difficulty: "Easy", competition: "Med Competition", searchVol: "~16,500", queries: ["yoga poses for anxiety", "calming yoga routine", "yoga breathwork stress relief"] },

  // ── MONEY ──
  { id: "micro-hustle", label: "⚡ Micro-Side Hustles", desc: "Launch a digital product in 48 hours", color: "from-pink-500 to-rose-600", tag: "Hot", score: 96, interest: "High Interest", category: "Money", audience: "Employed professionals wanting extra income streams", difficulty: "Easy", competition: "Med Competition", searchVol: "~28,000", queries: ["side hustle ideas 2025", "passive income digital products", "make money online fast"] },
  { id: "frugal-millionaire", label: "💰 Frugal Millionaire Path", desc: "Building wealth on an average salary", color: "from-yellow-500 to-amber-600", tag: "Trending", score: 89, interest: "Rising", category: "Money", audience: "Middle-income earners wanting to build long-term wealth", difficulty: "Medium", competition: "Med Competition", searchVol: "~19,000", queries: ["save money on low income", "frugal living wealth building", "how to become millionaire average salary"] },
  { id: "debt-freedom", label: "🔓 Debt-Free Blueprint", desc: "Step-by-step system to eliminate all debt in 24 months", color: "from-emerald-500 to-green-600", tag: "Hot", score: 93, interest: "High Interest", category: "Money", audience: "Individuals overwhelmed by credit card and student debt", difficulty: "Easy", competition: "Med Competition", searchVol: "~24,000", queries: ["how to pay off debt fast", "debt snowball method", "get out of debt plan"] },
  { id: "crypto-beginner", label: "₿ Crypto for Beginners", desc: "Navigating Web3 without losing your shirt", color: "from-orange-500 to-yellow-500", tag: "Viral", score: 71, interest: "Emerging", category: "Money", audience: "Curious beginners wanting to invest in crypto safely", difficulty: "Hard", competition: "High Competition", searchVol: "~38,000", queries: ["how to buy bitcoin safely", "crypto investing for beginners", "best crypto wallets 2025"] },
  { id: "invest-twenties", label: "📈 Investing in Your 20s", desc: "Compound wealth from your first paycheck", color: "from-blue-500 to-indigo-600", tag: "New", score: 86, interest: "Rising", category: "Money", audience: "Young adults (22-30) starting their investment journey", difficulty: "Easy", competition: "Med Competition", searchVol: "~17,500", queries: ["how to start investing 20s", "index funds for beginners", "Roth IRA young adults"] },

  // ── RELATIONSHIPS ──
  { id: "attachment", label: "💞 Attachment Style Healing", desc: "Improving modern relationships through self-awareness", color: "from-red-500 to-pink-600", tag: "New", score: 78, interest: "Emerging", category: "Relationships", audience: "Adults recognizing unhealthy relationship patterns", difficulty: "Medium", competition: "Low Competition", searchVol: "~11,000", queries: ["anxious attachment healing", "avoidant attachment style", "secure attachment adults"] },
  { id: "modern-dating", label: "💘 Modern Dating Decoded", desc: "Navigating apps, ghosting, and genuine connection", color: "from-rose-500 to-pink-500", tag: "Viral", score: 82, interest: "High Interest", category: "Relationships", audience: "Single adults 24-35 frustrated with modern dating", difficulty: "Easy", competition: "Med Competition", searchVol: "~20,000", queries: ["dating app tips 2025", "how to stop being ghosted", "find genuine connection online"] },
  { id: "marriage-rekindled", label: "🔥 Reignite Your Marriage", desc: "Practical tools for long-term relationship satisfaction", color: "from-amber-500 to-orange-500", tag: "Hot", score: 85, interest: "Rising", category: "Relationships", audience: "Married couples experiencing emotional distance", difficulty: "Medium", competition: "Med Competition", searchVol: "~13,500", queries: ["how to reignite marriage", "relationship advice long term", "emotional intimacy couples"] },
  { id: "toxic-relationships", label: "🛡️ Escaping Toxic Patterns", desc: "Recognize, exit, and recover from harmful relationships", color: "from-slate-500 to-gray-600", tag: "Trending", score: 90, interest: "High Interest", category: "Relationships", audience: "People recovering from emotionally abusive relationships", difficulty: "Easy", competition: "Low Competition", searchVol: "~16,000", queries: ["signs of toxic relationship", "how to leave toxic partner", "healing after narcissistic abuse"] },

  // ── PETS ──
  { id: "dog-training", label: "🐕 Dog Training Mastery", desc: "Transform a chaotic dog into a calm companion", color: "from-amber-500 to-yellow-600", tag: "Hot", score: 88, interest: "High Interest", category: "Pets", audience: "New dog owners struggling with basic obedience", difficulty: "Easy", competition: "High Competition", searchVol: "~41,000", queries: ["dog training basics", "how to stop dog barking", "puppy training schedule"] },
  { id: "cat-behavior", label: "🐱 Cat Behavior Guide", desc: "Decode your cat's signals and build real bond", color: "from-purple-400 to-violet-500", tag: "Trending", score: 72, interest: "Rising", category: "Pets", audience: "Cat owners wanting deeper understanding of feline behavior", difficulty: "Easy", competition: "Med Competition", searchVol: "~12,000", queries: ["why does my cat do that", "cat body language guide", "understanding cat behavior"] },
  { id: "raw-feeding", label: "🥩 Raw Feeding Pets", desc: "Biologically appropriate nutrition for dogs and cats", color: "from-red-500 to-rose-500", tag: "New", score: 68, interest: "Emerging", category: "Pets", audience: "Health-conscious pet owners exploring alternatives to kibble", difficulty: "Hard", competition: "Low Competition", searchVol: "~8,500", queries: ["raw diet for dogs", "BARF diet pets", "is raw food good for dogs"] },

  // ── LIFESTYLE ──
  { id: "nomad", label: "🌍 Remote Nomad Logistics", desc: "Tax & lifestyle guide for digital nomads", color: "from-sky-500 to-blue-600", tag: "Hot", score: 92, interest: "Rising", category: "Lifestyle", audience: "Remote workers wanting to travel while working full-time", difficulty: "Medium", competition: "Med Competition", searchVol: "~15,000", queries: ["digital nomad visa 2025", "how to travel and work remotely", "best countries for digital nomads"] },
  { id: "minimalism", label: "🏡 Minimalist Living", desc: "Declutter your space, simplify your life", color: "from-zinc-400 to-slate-600", tag: "Trending", score: 79, interest: "Rising", category: "Lifestyle", audience: "Overwhelmed professionals wanting simplicity and calm", difficulty: "Easy", competition: "High Competition", searchVol: "~19,000", queries: ["minimalist lifestyle guide", "how to declutter home", "capsule wardrobe minimalism"] },
  { id: "morning-routine", label: "🌅 Perfect Morning Routine", desc: "Own your first 2 hours and win the day", color: "from-amber-400 to-orange-500", tag: "Viral", score: 83, interest: "High Interest", category: "Lifestyle", audience: "Professionals wanting structure and productivity in their mornings", difficulty: "Easy", competition: "High Competition", searchVol: "~27,000", queries: ["productive morning routine", "5am morning habits", "daily routine for success"] },
  { id: "eco-budget", label: "🌿 Eco-Conscious Budgeting", desc: "High-aesthetic sustainable living for renters", color: "from-green-500 to-emerald-600", tag: "New", score: 81, interest: "Emerging", category: "Lifestyle", audience: "Renters wanting eco living without high costs", difficulty: "Easy", competition: "Low Competition", searchVol: "~9,200", queries: ["sustainable living on budget", "eco friendly renter tips", "zero waste apartment"] },

  // ── CAREER ──
  { id: "ai-career", label: "🤖 AI Career Pivot", desc: "Use LLMs to automate 50% of your current job", color: "from-blue-500 to-cyan-600", tag: "Hot", score: 97, interest: "High Interest", category: "Career", audience: "Knowledge workers wanting to stay ahead of AI displacement", difficulty: "Medium", competition: "Med Competition", searchVol: "~32,000", queries: ["how to use ChatGPT for work", "AI tools for productivity", "automate job with AI"] },
  { id: "linkedin-brand", label: "💼 LinkedIn Personal Brand", desc: "Go from invisible to inbound in 90 days", color: "from-blue-600 to-sky-500", tag: "Trending", score: 88, interest: "Rising", category: "Career", audience: "Professionals wanting better opportunities without cold applying", difficulty: "Medium", competition: "Med Competition", searchVol: "~21,000", queries: ["LinkedIn profile optimization", "personal brand LinkedIn", "get job offers LinkedIn"] },
  { id: "salary-negotiation", label: "💸 Salary Negotiation Mastery", desc: "Scripts and strategies to earn 20-40% more", color: "from-emerald-500 to-teal-600", tag: "Hot", score: 91, interest: "High Interest", category: "Career", audience: "Employees who feel underpaid and want concrete negotiation tools", difficulty: "Easy", competition: "Low Competition", searchVol: "~14,500", queries: ["how to negotiate salary", "salary negotiation script", "ask for raise email template"] },
  { id: "freelance-launch", label: "🚀 Freelance Launch System", desc: "Land your first 3 clients in 30 days", color: "from-violet-500 to-purple-600", tag: "Viral", score: 94, interest: "High Interest", category: "Career", audience: "Employees wanting to go freelance but unsure where to start", difficulty: "Easy", competition: "Med Competition", searchVol: "~18,000", queries: ["how to start freelancing", "freelance clients from scratch", "freelance niche selection"] },

  // ── HEALTH ──
  { id: "burnout", label: "🧠 Digital Burnout Recovery", desc: "Nervous system regulation for social media fatigue", color: "from-purple-500 to-indigo-600", tag: "Trending", score: 94, interest: "Rising", category: "Health", audience: "Overstimulated professionals experiencing chronic fatigue", difficulty: "Easy", competition: "Low Competition", searchVol: "~16,000", queries: ["digital burnout symptoms", "nervous system reset", "social media fatigue recovery"] },
  { id: "dopamine", label: "🎯 Dopamine Detox", desc: "7-day blueprint to reclaim your focus", color: "from-violet-500 to-purple-600", tag: "Trending", score: 91, interest: "Rising", category: "Health", audience: "Chronically distracted individuals unable to focus on real life", difficulty: "Easy", competition: "Med Competition", searchVol: "~24,000", queries: ["dopamine detox guide", "how to reset dopamine", "dopamine fasting benefits"] },
  { id: "gut-health", label: "🦠 Gut Health Revolution", desc: "Fix your microbiome, fix your mental health", color: "from-green-500 to-lime-600", tag: "Hot", score: 86, interest: "Rising", category: "Health", audience: "People with digestive issues, brain fog, or low energy", difficulty: "Medium", competition: "Med Competition", searchVol: "~20,000", queries: ["gut health improvement", "microbiome diet plan", "leaky gut healing protocol"] },
  { id: "sleep-science", label: "😴 Sleep Science Blueprint", desc: "Evidence-based guide to restorative deep sleep", color: "from-indigo-500 to-blue-700", tag: "Viral", score: 88, interest: "High Interest", category: "Health", audience: "Chronically tired adults who can't get quality sleep", difficulty: "Easy", competition: "High Competition", searchVol: "~29,000", queries: ["how to sleep better", "deep sleep tips", "sleep hygiene guide"] },

  // ── BUSINESS ──
  { id: "notion-business", label: "📋 Notion Business OS", desc: "Build your entire business inside one Notion workspace", color: "from-slate-500 to-zinc-600", tag: "Hot", score: 85, interest: "High Interest", category: "Business", audience: "Solo entrepreneurs and small teams wanting one organized system", difficulty: "Medium", competition: "Med Competition", searchVol: "~11,500", queries: ["Notion business template", "Notion workspace setup", "Notion for entrepreneurs"] },
  { id: "email-marketing", label: "📧 Email List From Zero", desc: "Build a 1,000-subscriber list in 60 days organically", color: "from-teal-500 to-cyan-600", tag: "Trending", score: 87, interest: "Rising", category: "Business", audience: "Content creators and coaches needing a direct audience", difficulty: "Medium", competition: "Med Competition", searchVol: "~13,000", queries: ["how to build email list", "email marketing beginners", "grow newsletter fast"] },
  { id: "productize-skills", label: "🎁 Productize Your Skills", desc: "Turn your expertise into a $500-$5000/month product", color: "from-rose-500 to-fuchsia-600", tag: "Hot", score: 93, interest: "High Interest", category: "Business", audience: "Professionals with expertise wanting passive income", difficulty: "Easy", competition: "Low Competition", searchVol: "~9,800", queries: ["turn skills into product", "sell expertise online", "online course creation guide"] },

  // ── TECHNOLOGY ──
  { id: "chatgpt-mastery", label: "🤖 ChatGPT Mastery Guide", desc: "From beginner to power user in one weekend", color: "from-green-500 to-emerald-600", tag: "Hot", score: 96, interest: "High Interest", category: "Technology", audience: "Professionals wanting to maximize ChatGPT for real work output", difficulty: "Easy", competition: "High Competition", searchVol: "~55,000", queries: ["how to use ChatGPT effectively", "ChatGPT prompts for work", "ChatGPT tips and tricks"] },
  { id: "no-code-business", label: "🔧 No-Code Business Builder", desc: "Build apps and tools without writing a single line of code", color: "from-blue-500 to-violet-600", tag: "Trending", score: 82, interest: "Rising", category: "Technology", audience: "Entrepreneurs and creators wanting to build without developers", difficulty: "Medium", competition: "Med Competition", searchVol: "~12,000", queries: ["no code app builder", "build website without coding", "no code tools 2025"] },
  { id: "cybersecurity-basics", label: "🔐 Cybersecurity for Everyone", desc: "Protect your digital life from hackers and scams", color: "from-red-600 to-slate-700", tag: "New", score: 77, interest: "Rising", category: "Technology", audience: "Non-technical people wanting to secure their online presence", difficulty: "Medium", competition: "Med Competition", searchVol: "~14,000", queries: ["how to stay safe online", "cybersecurity basics guide", "protect personal data internet"] },

  // ── SELF-IMPROVEMENT ──
  { id: "quarter-life", label: "🌀 Quarter-Life Clarity", desc: "Navigating the 'what am I doing?' phase at 20-25", color: "from-orange-500 to-amber-600", tag: "Viral", score: 89, interest: "Rising", category: "Self-Improvement", audience: "Young adults (20-25) feeling stuck and directionless", difficulty: "Easy", competition: "Low Competition", searchVol: "~13,000", queries: ["quarter life crisis help", "what to do with my life 20s", "find purpose young adult"] },
  { id: "social-anxiety", label: "🗣️ Social Anxiety Hacks", desc: "For networking and professional events", color: "from-teal-500 to-green-600", tag: "Viral", score: 88, interest: "High Interest", category: "Self-Improvement", audience: "Introverts and anxious professionals in social/work settings", difficulty: "Easy", competition: "Med Competition", searchVol: "~19,500", queries: ["social anxiety tips work", "overcome shyness networking", "confidence in social situations"] },
  { id: "manifestation", label: "✨ Manifestation Science", desc: "Combining neuroscience with goal setting", color: "from-yellow-500 to-orange-600", tag: "Trending", score: 85, interest: "Rising", category: "Self-Improvement", audience: "Goal-oriented individuals blending spirituality and science", difficulty: "Easy", competition: "High Competition", searchVol: "~22,000", queries: ["manifestation techniques that work", "law of attraction neuroscience", "visualization goal achievement"] },
  { id: "stoicism-modern", label: "🏛️ Modern Stoicism", desc: "Ancient philosophy applied to 21st century chaos", color: "from-stone-500 to-slate-600", tag: "Hot", score: 83, interest: "Rising", category: "Self-Improvement", audience: "Stressed professionals seeking emotional resilience frameworks", difficulty: "Medium", competition: "Med Competition", searchVol: "~11,000", queries: ["stoicism daily practice", "how to be stoic modern life", "Marcus Aurelius teachings today"] },
];

// ─── PDF Content Generator ────────────────────────────────────────────────────
function generatePDFContent(niche: typeof NICHES[0]): { title: string; sections: { heading: string; content: string }[] } {
  const contentMap: Record<string, { title: string; sections: { heading: string; content: string }[] }> = {
    burnout: {
      title: "Digital Burnout Recovery: A Complete Nervous System Reset",
      sections: [
        {
          heading: "Chapter 1: The Psychology of Digital Overwhelm — Why Your Brain is Exhausted",
          content: `We live in an era of unprecedented cognitive taxation. The average person touches their smartphone 2,617 times a day — not because they want to, but because the architecture of our digital world has been engineered by some of the most brilliant behavioral scientists on the planet to ensure that they do. This is not a character flaw. This is neuroscience weaponized.\n\nThe prefrontal cortex — the seat of rational decision-making, creativity, and emotional regulation — operates like a muscle. And just like any muscle subjected to relentless, high-frequency contractions without adequate recovery time, it fatigues.\n\n[VISUAL PLACEHOLDER: Infographic showing the dopamine loop cycle — Trigger → Variable Reward → Tolerance → Craving → Repeat — with brain regions highlighted]`,
        },
        {
          heading: "Chapter 2: The Nervous System Framework — Polyvagal Theory in Practice",
          content: `Dr. Stephen Porges' Polyvagal Theory provides perhaps the most elegant and actionable framework for understanding why digital burnout feels so physically embodied.\n\nThe Three-Phase Recovery Protocol:\n\nPHASE 1 — TITRATION (Days 1-7): Reduce, don't eliminate.\nPHASE 2 — RESTORATION (Days 8-21): Introduce physiological regulators.\nPHASE 3 — ARCHITECTURE REDESIGN (Days 22-30): Redesign your relationship with technology intentionally.\n\n[VISUAL PLACEHOLDER: Three-column table showing the three nervous system states]`,
        },
        {
          heading: "Chapter 3: Actionable Frameworks — The RESET Protocol",
          content: `The RESET Protocol is a five-pillar daily practice system designed to rebuild nervous system resilience.\n\nR — Ritual Mornings\nE — Embodiment Breaks\nS — Social Media Sovereignty\nE — Evening Digital Sunset\nT — Tending to Real Connection\n\n[VISUAL PLACEHOLDER: Weekly RESET Protocol calendar template]`,
        },
        {
          heading: "Chapter 4: Your 30-Day Nervous System Reset Plan",
          content: `WEEK 1 — AWARENESS & AUDIT\nWEEK 2 — REDUCTION & REPLACEMENT\nWEEK 3 — REGULATION & RECALIBRATION\nWEEK 4 — ARCHITECTURE & INTEGRATION\n\n[VISUAL PLACEHOLDER: 30-day calendar grid]`,
        },
      ],
    },
    "ai-career": {
      title: "AI Career Pivot: Automate 50% of Your Job & Lead the Next Economy",
      sections: [
        { heading: "Chapter 1: The Inflection Point", content: "Goldman Sachs estimates 300 million jobs could be automated. The professionals who thrive are those who architect AI workflows.\n\n[VISUAL PLACEHOLDER: Side-by-side workflow comparison]" },
        { heading: "Chapter 2: The 50% Audit", content: "WORKFLOW 1 — The Intelligence Briefing\nWORKFLOW 2 — The Communication Accelerator\nWORKFLOW 3 — The Analysis Engine\n\n[VISUAL PLACEHOLDER: Flowchart]" },
        { heading: "Chapter 3: Prompt Engineering Mastery", content: "The CRAFT Framework:\nC — Context\nR — Role Assignment\nA — Action Specificity\nF — Format Direction\nT — Tone and Constraints\n\n[VISUAL PLACEHOLDER: Before/after comparison]" },
        { heading: "Chapter 4: Your 30-Day AI Sprint", content: "WEEK 1 — AUDIT & FOUNDATION\nWEEK 2 — WORKFLOW ARCHITECTURE\nWEEK 3 — DEPTH & MASTERY\nWEEK 4 — LEADERSHIP & LEVERAGE\n\n[VISUAL PLACEHOLDER: 30-day sprint tracker]" },
      ],
    },
    "eco-budget": {
      title: "Eco-Conscious Budgeting: High-Aesthetic Sustainable Living for Renters",
      sections: [
        { heading: "Chapter 1: The Psychology of Sustainable Consumption", content: "The sustainable consumer market is projected to reach $150 billion by 2028.\n\n[VISUAL PLACEHOLDER: True Cost infographic]" },
        { heading: "Chapter 2: The Renter's Sustainable Home Framework", content: "THE ENERGY LAYER\nTHE WATER LAYER\nTHE FOOD LAYER\nTHE PRODUCT LAYER — The Slow Swap Protocol\n\n[VISUAL PLACEHOLDER: Room-by-room guide]" },
        { heading: "Chapter 3: The High-Aesthetic Capsule Home", content: "LAYER 1 — THE FOUNDATION\nLAYER 2 — THE LIVING LAYER\nLAYER 3 — THE STORY LAYER\n\n[VISUAL PLACEHOLDER: Before/after mood board]" },
        { heading: "Chapter 4: Your 30-Day Eco-Conscious Plan", content: "WEEK 1 — THE AUDIT\nWEEK 2 — THE FOUNDATION\nWEEK 3 — THE WARDROBE\nWEEK 4 — THE INTEGRATION\n\n[VISUAL PLACEHOLDER: Budget reallocation chart]" },
      ],
    },
    "quarter-life": {
      title: "Quarter-Life Clarity: Navigating the 'What Am I Doing?' Phase",
      sections: [
        { heading: "Chapter 1: The Quarter-Life Reality", content: "Oliver Robinson's four phases of Quarter-Life Crisis are predictable and navigable.\n\n[VISUAL PLACEHOLDER: Timeline graphic]" },
        { heading: "Chapter 2: The Identity Excavation Framework", content: "TOOL 1 — Values Archaeology\nTOOL 2 — Regret Minimization\nTOOL 3 — Subtraction Experiment\nTOOL 4 — Envy Map\nTOOL 5 — Energy Audit\n\n[VISUAL PLACEHOLDER: Worksheet]" },
        { heading: "Chapter 3: The Three-Horizon Model", content: "HORIZON 1 — THE PRESENT\nHORIZON 2 — THE EXPLORATION ZONE\nHORIZON 3 — THE DIRECTION\n\n[VISUAL PLACEHOLDER: Three-Horizon diagram]" },
        { heading: "Chapter 4: Your 30-Day Clarity Plan", content: "WEEK 1 — THE EXCAVATION\nWEEK 2 — THE HONEST CONVERSATION\nWEEK 3 — THE FIRST EXPERIMENT\nWEEK 4 — THE ARCHITECTURE\n\n[VISUAL PLACEHOLDER: Personal Clarity Map]" },
      ],
    },
    "micro-hustle": {
      title: "Micro-Side Hustles: Launch Your Digital Product in 48 Hours",
      sections: [
        { heading: "Chapter 1: The Digital Product Revolution", content: "The digital product market reached $331 billion in 2023.\n\n[VISUAL PLACEHOLDER: Market opportunity chart]" },
        { heading: "Chapter 2: The 48-Hour Product Sprint", content: "HOUR 0-4: IDEA VALIDATION\nHOUR 4-8: PRODUCT SCOPING\nHOUR 8-24: CREATION\nHOUR 24-36: PACKAGING\nHOUR 36-48: LAUNCH\n\n[VISUAL PLACEHOLDER: 48-hour timeline]" },
        { heading: "Chapter 3: The $0 Marketing Playbook", content: "THE PROOF OF CONCEPT LAUNCH\nTHE CONTENT MARKETING FLYWHEEL\nTHE COMMUNITY LEVERAGE STRATEGY\n\n[VISUAL PLACEHOLDER: Content calendar template]" },
        { heading: "Chapter 4: Your 30-Day Product Business Plan", content: "WEEK 1 — VALIDATE & BUILD\nWEEK 2 — LAUNCH & LEARN\nWEEK 3 — OPTIMIZE & AMPLIFY\nWEEK 4 — SYSTEMATIZE & SCALE\n\n[VISUAL PLACEHOLDER: Revenue projection chart]" },
      ],
    },
    dopamine: {
      title: "Dopamine Detox: A 7-Day Blueprint to Reclaim Your Focus",
      sections: [
        { heading: "Chapter 1: The Dopamine Economy", content: "Dopamine is the anticipation chemical. Modern platforms deliver artificial stimulation our brains weren't designed for.\n\n[VISUAL PLACEHOLDER: Dopamine baseline graph]" },
        { heading: "Chapter 2: The 7-Day Reset Protocol", content: "TIER 1 — ELIMINATE\nTIER 2 — MINIMIZE\nTIER 3 — MAINTAIN\nTIER 4 — INTRODUCE\n\n[VISUAL PLACEHOLDER: 7-day protocol grid]" },
        { heading: "Chapter 3: The Withdrawal Curve", content: "DAYS 1-2: THE DISCOMFORT VALLEY\nDAY 3: THE FLATLINE\nDAYS 4-5: THE RETURN OF CURIOSITY\nDAYS 6-7: THE RECALIBRATION\n\n[VISUAL PLACEHOLDER: Line chart]" },
        { heading: "Chapter 4: Your 30-Day Focus Architecture", content: "DAYS 1-7: THE RESET\nDAYS 8-14: THE REINTRODUCTION\nDAYS 15-21: SUSTAINABLE ARCHITECTURE\nDAYS 22-30: DEEP WORK FOUNDATION\n\n[VISUAL PLACEHOLDER: 30-day calendar]" },
      ],
    },
    attachment: {
      title: "Attachment Style Healing: A Guide to Secure, Fulfilling Relationships",
      sections: [
        { heading: "Chapter 1: The Architecture of Love", content: "Attachment Theory provides the most powerful framework for understanding why we relate the way we do.\n\n[VISUAL PLACEHOLDER: Four-quadrant attachment diagram]" },
        { heading: "Chapter 2: Identifying Your Attachment Blueprint", content: "THE ANXIOUS SIGNATURE\nTHE AVOIDANT SIGNATURE\nTHE DISORGANIZED SIGNATURE\nTHE SECURE SIGNATURE\n\n[VISUAL PLACEHOLDER: Self-Assessment]" },
        { heading: "Chapter 3: Secure Attachment Cultivation", content: "FOR ANXIOUS: The Regulation Toolkit\nFOR AVOIDANT: The Opening Practice\n\n[VISUAL PLACEHOLDER: Daily practice habit cards]" },
        { heading: "Chapter 4: Your 30-Day Healing Plan", content: "WEEK 1 — SELF-KNOWLEDGE\nWEEK 2 — PATTERN INTERRUPTION\nWEEK 3 — SECURE BASE BUILDING\nWEEK 4 — INTEGRATION\n\n[VISUAL PLACEHOLDER: Journey map]" },
      ],
    },
    manifestation: {
      title: "Manifestation Science: Neuroscience Meets Goal Achievement",
      sections: [
        { heading: "Chapter 1: Beyond the Vision Board", content: "The Reticular Activating System is your brain's trainable relevance filter.\n\n[VISUAL PLACEHOLDER: RAS diagram]" },
        { heading: "Chapter 2: Five Neuroscience-Backed Mechanisms", content: "MECHANISM 1 — ATTENTIONAL PRIMING\nMECHANISM 2 — IDENTITY-BEHAVIOR CONGRUENCE\nMECHANISM 3 — EMOTIONAL COHERENCE\nMECHANISM 4 — ENVIRONMENTAL DESIGN\nMECHANISM 5 — IMPLEMENTATION INTENTIONS\n\n[VISUAL PLACEHOLDER: Five-mechanism diagram]" },
        { heading: "Chapter 3: The Manifestation Practice Stack", content: "DAILY PRACTICE (35 Minutes)\nWEEKLY PRACTICE (60 Minutes)\nMONTHLY PRACTICE (90 Minutes)\n\n[VISUAL PLACEHOLDER: Goal Architecture pyramid]" },
        { heading: "Chapter 4: Your 30-Day Plan", content: "WEEK 1 — CLARITY & CALIBRATION\nWEEK 2 — ENVIRONMENT & BEHAVIOR\nWEEK 3 — ACTION & ALIGNMENT\nWEEK 4 — INTEGRATION & MOMENTUM\n\n[VISUAL PLACEHOLDER: 30-day tracker]" },
      ],
    },
    "social-anxiety": {
      title: "Social Anxiety Hacks: Thriving in Networking & Professional Environments",
      sections: [
        { heading: "Chapter 1: Understanding Social Anxiety", content: "Social anxiety is a sophisticated social monitoring system that evolved for tribal survival.\n\n[VISUAL PLACEHOLDER: Evolutionary diagram]" },
        { heading: "Chapter 2: The CONNECT Framework", content: "C — CURIOSITY AS ARMOR\nO — ONE PERSON AT A TIME\nN — NAMING THE EXPERIENCE\nN — NO PERFECT PERFORMANCE\nE — EXIT STRATEGIES\nC — CONTRIBUTION ORIENTATION\nT — TINY CONSISTENT EXPOSURES\n\n[VISUAL PLACEHOLDER: Reference card]" },
        { heading: "Chapter 3: Pre/During/Post Event Protocol", content: "PRE-EVENT PROTOCOL (24 Hours)\nDAY-OF PROTOCOL (2 Hours)\nARRIVAL STRATEGY\nPOST-EVENT RECOVERY\n\n[VISUAL PLACEHOLDER: Three-phase timeline]" },
        { heading: "Chapter 4: Your 30-Day Social Confidence Plan", content: "WEEK 1 — FOUNDATION & REFRAME\nWEEK 2 — THE CONVERSATION LAB\nWEEK 3 — NETWORKING IN PRACTICE\nWEEK 4 — CONSOLIDATION\n\n[VISUAL PLACEHOLDER: Progression tracker]" },
      ],
    },
    nomad: {
      title: "Remote Nomad Logistics: The Complete Tax & Lifestyle Guide",
      sections: [
        { heading: "Chapter 1: The Nomad Decision", content: "The global digital nomad population grew from 7 million in 2019 to over 35 million in 2024.\n\n[VISUAL PLACEHOLDER: World map]" },
        { heading: "Chapter 2: The Tax Reality", content: "STRATEGY 1 — TERRITORIAL TAX JURISDICTIONS\nSTRATEGY 2 — THE NOMAD VISA\nSTRATEGY 3 — FOREIGN INCOME EXCLUSION\nSTRATEGY 4 — STRUCTURE YOUR BUSINESS\n\n[VISUAL PLACEHOLDER: Decision tree]" },
        { heading: "Chapter 3: The Operational Systems Stack", content: "BANKING & MONEY\nHEALTH INSURANCE\nCOMMUNICATION STACK\nACCOMMODATION STACK\nPRODUCTIVITY STACK\n\n[VISUAL PLACEHOLDER: Nomad Operations Stack visual]" },
        { heading: "Chapter 4: Your 30-Day Nomad Launch Plan", content: "WEEK 1 — FINANCIAL & LEGAL FOUNDATION\nWEEK 2 — HEALTH, INSURANCE & COMMUNICATION\nWEEK 3 — DESTINATION PLANNING\nWEEK 4 — PROFESSIONAL PREPARATION\n\n[VISUAL PLACEHOLDER: Launch checklist]" },
      ],
    },
  };
  return contentMap[niche.id] || contentMap["burnout"];
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function convertPrice(amountINR: number, currencyInfo: { rate: number; symbol: string }) {
  const converted = amountINR * currencyInfo.rate;
  return { amount: converted < 1 ? parseFloat(converted.toFixed(2)) : Math.round(converted), symbol: currencyInfo.symbol };
}
function formatPrice(symbol: string, amount: number): string {
  return `${symbol}${amount.toLocaleString()}`;
}

// ─── Payment Modal (UNTOUCHED LOGIC) ─────────────────────────────────────────
function PaymentModal({
  plan,
  pricing,
  ipData,
  onClose,
}: {
  plan: "scholar" | "sage";
  pricing: PricingInfo;
  ipData: IPData | null;
  onClose: () => void;
}) {
  const price = plan === "scholar" ? pricing.scholar : pricing.sage;
  const planName = plan === "scholar" ? "Scholar" : "Sage";
  const features = plan === "scholar"
    ? ["1 Digital Guide PDF", "Basic Niche Selection", "Email Delivery", "30-Day Access"]
    : ["5 Digital Guide PDFs", "All 10 Premium Niches", "Priority Email Delivery", "Lifetime Access", "Exclusive Framework Templates", "Monthly New Guide"];

  const handleRazorpay = () => {
    const options = {
      // @ts-ignore
      key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID,
      amount: Math.round(price * 100),
      currency: "INR",
      name: "Evolvere AI",
      description: `${planName} Plan – Premium Digital Guide`,
      image: "",
      handler: function (response: any) {
        alert(`✅ Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
        onClose();
      },
      prefill: { name: "Aditya", email: "atharv.2006@gmail.com" },
      theme: { color: "#7c3aed" },
    };
    try {
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay Error:", err);
      alert("Payment gateway failed to load. Please try again.");
    }
  };

  const handleStripe = () => {
    setTimeout(() => {
      alert(`✅ Stripe Payment Successful! Your ${planName} plan is now active.\nCharged: ${formatPrice(pricing.symbol, price)} to your card.\nConfirmation sent to your email.`);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md">
        {/* Glow */}
        <div className="absolute inset-0 bg-violet-500/20 rounded-3xl blur-2xl" />
        <div className="relative bg-[#0f0a1f] border border-violet-500/30 rounded-3xl shadow-2xl p-8">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors">
            <X size={20} />
          </button>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4 shadow-lg shadow-violet-500/40">
              <span className="text-2xl">{plan === "scholar" ? "📚" : "🔮"}</span>
            </div>
            <h2 className="text-2xl font-bold text-white">{planName} Plan</h2>
            <p className="text-4xl font-black text-violet-400 mt-2">{formatPrice(pricing.symbol, price)}</p>
            <p className="text-sm text-slate-500 mt-1">{ipData?.country_name || "International"} • {pricing.currency}</p>
          </div>
          <ul className="space-y-2 mb-6">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs flex-shrink-0">✓</span>
                {f}
              </li>
            ))}
          </ul>
          {pricing.isIndia ? (
            <button onClick={handleRazorpay} className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-lg hover:opacity-90 transition-all shadow-lg">
              💳 Pay with Razorpay
            </button>
          ) : (
            <button onClick={handleStripe} className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-lg hover:opacity-90 transition-all shadow-lg">
              💳 Pay with Stripe
            </button>
          )}
          <p className="text-center text-xs text-slate-600 mt-3">🔒 Secured by {pricing.isIndia ? "Razorpay" : "Stripe"} • 256-bit SSL Encryption</p>
        </div>
      </div>
    </div>
  );
}

// ─── PDF Generator (UNTOUCHED LOGIC) ─────────────────────────────────────────
async function generateBookPDF(niche: typeof NICHES[0]) {
  const content = generatePDFContent(niche);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210; const pageH = 297; const margin = 20; const contentW = pageW - margin * 2;
  const addPageBackground = () => {
    doc.setFillColor(250, 248, 255); doc.rect(0, 0, pageW, pageH, "F");
    doc.setFillColor(124, 58, 237); doc.rect(0, 0, 8, pageH, "F");
  };
  addPageBackground();
  doc.setFillColor(124, 58, 237); doc.rect(0, 0, pageW, 120, "F");
  doc.setFillColor(139, 92, 246); doc.rect(0, 95, pageW, 30, "F");
  doc.setFontSize(10); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
  doc.text("EVOLVERE AI", margin, 20);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.text("Premium Digital Guide Platform", margin, 26);
  doc.setFontSize(26); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(content.title, contentW - 10); doc.text(titleLines, margin, 55);
  doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(221, 214, 254); doc.text(niche.desc, margin, 105);
  doc.setTextColor(80, 60, 120); doc.setFontSize(10); doc.setFont("helvetica", "normal");
  doc.text(`Published by Evolvere AI  •  Premium Research Guide  •  ${new Date().getFullYear()}`, margin, 140);
  doc.setDrawColor(200, 180, 240); doc.setFillColor(240, 235, 255); doc.roundedRect(margin, 150, contentW, 60, 5, 5, "FD");
  doc.setTextColor(150, 120, 200); doc.setFontSize(10); doc.setFont("helvetica", "italic");
  doc.text("[COVER ILLUSTRATION]", pageW / 2, 182, { align: "center" });
  doc.setFontSize(8); doc.setTextColor(130, 110, 170);
  doc.text("This guide is for educational purposes only. Results may vary.", margin, 270);
  doc.text(`© ${new Date().getFullYear()} Evolvere AI. All rights reserved.`, margin, 276);
  doc.addPage(); addPageBackground();
  doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(50, 20, 100); doc.text("Table of Contents", margin, 40);
  doc.setDrawColor(124, 58, 237); doc.setLineWidth(0.8); doc.line(margin, 45, margin + 80, 45);
  let tocY = 65;
  content.sections.forEach((section, idx) => {
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(80, 40, 150); doc.text(`${idx + 1}.`, margin, tocY);
    doc.setFont("helvetica", "normal"); doc.setTextColor(50, 30, 100);
    const tocTitle = doc.splitTextToSize(section.heading, contentW - 20); doc.text(tocTitle, margin + 10, tocY);
    doc.setFontSize(9); doc.setTextColor(160, 130, 200); tocY += tocTitle.length * 5 + 4;
    doc.text(`Page ${idx + 3}`, margin + 10, tocY); tocY += 10;
  });
  content.sections.forEach((section, sectionIdx) => {
    doc.addPage(); addPageBackground();
    doc.setFillColor(124, 58, 237); doc.rect(0, 0, pageW, 35, "F");
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(200, 180, 255);
    doc.text(`CHAPTER ${sectionIdx + 1}  •  ${niche.label.toUpperCase()}`, margin, 15);
    doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
    const headingLines = doc.splitTextToSize(section.heading, contentW); doc.text(headingLines, margin, 26);
    let y = 50;
    const paragraphs = section.content.split("\n\n");
    paragraphs.forEach((para) => {
      if (y > pageH - 35) { doc.addPage(); addPageBackground(); y = 25; }
      const trimmed = para.trim(); if (!trimmed) return;
      if (trimmed.startsWith("[VISUAL PLACEHOLDER")) {
        doc.setDrawColor(180, 150, 230); doc.setFillColor(245, 240, 255);
        const boxH = 28; doc.roundedRect(margin, y, contentW, boxH, 4, 4, "FD");
        doc.setFontSize(8); doc.setFont("helvetica", "italic"); doc.setTextColor(120, 80, 180);
        const placeholderLines = doc.splitTextToSize(trimmed, contentW - 8); doc.text(placeholderLines, margin + 4, y + 6);
        y += boxH + 8; return;
      }
      const isSectionHeader = /^(PHASE|MECHANISM|TOOL|STRATEGY|WORKFLOW|TIER|LAYER|THE|FOR |STEP |SYSTEM |WEEK |DAYS )/.test(trimmed) && trimmed.length < 120 && !trimmed.includes(". ");
      if (isSectionHeader && trimmed.length < 100) {
        if (y > pageH - 45) { doc.addPage(); addPageBackground(); y = 25; }
        doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 50, 180);
        const hLines = doc.splitTextToSize(trimmed, contentW); doc.text(hLines, margin, y);
        y += hLines.length * 6 + 4; doc.setDrawColor(200, 170, 240); doc.setLineWidth(0.3);
        doc.line(margin, y, margin + 40, y); y += 5;
      } else {
        doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(40, 30, 70);
        const pLines = doc.splitTextToSize(trimmed, contentW);
        if (y + pLines.length * 5.5 > pageH - 25) { doc.addPage(); addPageBackground(); y = 25; }
        doc.text(pLines, margin, y); y += pLines.length * 5.5 + 5;
      }
    });
    doc.setFontSize(8); doc.setTextColor(160, 130, 200);
    doc.text(`Evolvere AI  •  Chapter ${sectionIdx + 1}`, margin, pageH - 10);
    doc.text(`${sectionIdx + 3}`, pageW - margin, pageH - 10, { align: "right" });
  });
  doc.save(`Evolvere-AI-${niche.id}-Guide.pdf`);
}

// ─── Score Badge ─────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const color = score >= 90 ? "#a78bfa" : score >= 80 ? "#60a5fa" : "#34d399";
  return (
    <div className="relative flex items-center justify-center w-14 h-14">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="24" fill="none" stroke="#1e1b2e" strokeWidth="4" />
        <circle
          cx="28" cy="28" r="24" fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${(score / 100) * 150.8} 150.8`}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-xs font-black text-white relative z-10">{score}</span>
    </div>
  );
}

// ─── Opportunity Card (PDF Trend Lab style) ───────────────────────────────────
function OpportunityCard({ niche, onClick }: { niche: typeof NICHES[0]; onClick: () => void }) {
  const [showQueries, setShowQueries] = useState(false);

  const diffColors: Record<string, string> = {
    "Easy": "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
    "Medium": "text-amber-400 bg-amber-400/10 border-amber-400/25",
    "Hard": "text-red-400 bg-red-400/10 border-red-400/25",
  };
  const compColors: Record<string, string> = {
    "Low Competition": "text-sky-400 bg-sky-400/10 border-sky-400/25",
    "Med Competition": "text-violet-400 bg-violet-400/10 border-violet-400/25",
    "High Competition": "text-rose-400 bg-rose-400/10 border-rose-400/25",
  };
  const interestColors: Record<string, string> = {
    "Rising": "text-orange-400 bg-orange-400/10 border-orange-400/25",
    "High Interest": "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
    "Emerging": "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",
  };

  return (
    <div className="group bg-[#0d0a1a] border border-white/8 rounded-2xl overflow-hidden hover:border-violet-500/40 hover:bg-[#110d1e] transition-all duration-300">
      {/* Card Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3
              onClick={onClick}
              className="text-white font-bold text-base leading-snug cursor-pointer hover:text-violet-300 transition-colors"
            >
              {niche.label.slice(niche.label.indexOf(" ") + 1)}
            </h3>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed">{niche.desc}</p>
          </div>
          <button
            onClick={onClick}
            className="flex-shrink-0 flex items-center gap-1.5 bg-violet-600/20 hover:bg-violet-600 border border-violet-500/30 text-violet-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
          >
            <BookMarked size={11} />
            View
          </button>
        </div>

        {/* Target audience */}
        <div className="flex items-start gap-2 mb-4">
          <span className="text-slate-500 mt-0.5 flex-shrink-0">👤</span>
          <p className="text-slate-500 text-xs leading-relaxed">{niche.audience}</p>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${diffColors[niche.difficulty]}`}>
            {niche.difficulty}
          </span>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${interestColors[niche.interest]}`}>
            {niche.interest === "Rising" ? "↗ Rising" : niche.interest === "High Interest" ? "🔥 " + niche.interest : niche.interest}
          </span>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${compColors[niche.competition]}`}>
            {niche.competition}
          </span>
        </div>

        {/* Search volume */}
        <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-4">
          <span>🔍</span>
          <span>{niche.searchVol} searches/mo</span>
        </div>

        {/* Opportunity Score */}
        <div className="bg-[#06030e] rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-violet-400" />
            <span className="text-slate-400 text-xs font-medium">Opportunity Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${niche.color} rounded-full transition-all duration-700`}
                style={{ width: `${niche.score}%` }}
              />
            </div>
            <span className="text-white font-black text-base">{niche.score}<span className="text-slate-500 font-normal text-xs">/100</span></span>
          </div>
        </div>
      </div>

      {/* Example Queries toggle */}
      <div className="border-t border-white/5">
        <button
          onClick={() => setShowQueries(!showQueries)}
          className="w-full flex items-center gap-2 px-5 py-3 text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors"
        >
          <span>🔍</span>
          <span>Show Example Queries ({niche.queries.length})</span>
          <ChevronRight size={12} className={`ml-auto transition-transform ${showQueries ? "rotate-90" : ""}`} />
        </button>
        {showQueries && (
          <div className="px-5 pb-4 space-y-1.5">
            {niche.queries.map((q, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 rounded-lg px-3 py-1.5">
                <span className="text-slate-600">"{q}"</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Blueprint Detail View ────────────────────────────────────────────────────
function BlueprintDetail({
  niche,
  pricing,
  onBack,
  onDownload,
  generating,
  onUpgrade,
}: {
  niche: typeof NICHES[0];
  pricing: PricingInfo;
  onBack: () => void;
  onDownload: () => void;
  generating: boolean;
  onUpgrade: () => void;
}) {
  const content = generatePDFContent(niche);

  return (
    <div className="animate-in">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Results</span>
      </button>

      {/* Header Card */}
      <div className={`bg-gradient-to-r ${niche.color} p-px rounded-3xl mb-6`}>
        <div className="bg-[#0d0a1a] rounded-3xl p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${niche.color} flex items-center justify-center text-3xl shadow-lg`}>
                {niche.label.split(" ")[0]}
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">{niche.category}</span>
                <h2 className="text-xl font-black text-white leading-tight mt-0.5">
                  {niche.label.slice(niche.label.indexOf(" ") + 1)}
                </h2>
                <p className="text-slate-400 text-sm mt-1">{niche.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-2xl font-black text-white">{niche.score}</div>
                <div className="text-xs text-slate-500">Score</div>
              </div>
              <ScoreRing score={niche.score} />
            </div>
          </div>

          {/* Metadata pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {["4 Deep Chapters", "30-Day Action Plan", "Psychology Frameworks", "Visual Guides", "Appendix"].map(tag => (
              <span key={tag} className="text-xs bg-white/8 text-slate-400 px-3 py-1 rounded-full border border-white/10">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Blueprint Preview — white card feel */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
        {/* Mock document header */}
        <div className={`bg-gradient-to-r ${niche.color} p-6`}>
          <div className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">EVOLVERE AI · PREMIUM BLUEPRINT</div>
          <h3 className="text-white text-xl font-black leading-tight">{content.title}</h3>
        </div>

        <div className="p-6 space-y-4">
          {/* TOC */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Table of Contents</h4>
            <div className="space-y-2">
              {content.sections.map((section, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs font-black flex items-center justify-center mt-0.5">{i + 1}</span>
                  <div className="flex-1">
                    <div className="text-slate-700 text-sm font-medium leading-snug">{section.heading}</div>
                    {i === 0 && (
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                        {section.content.split("\n\n")[0].slice(0, 120)}...
                      </p>
                    )}
                  </div>
                  {i >= 1 && (
                    <div className="flex-shrink-0 mt-1">
                      <Lock size={12} className="text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs font-black flex items-center justify-center">{content.sections.length + 1}</span>
                <span className="text-slate-500 text-sm flex items-center gap-1">
                  Appendix: Resources & Next Steps <Lock size={11} className="text-slate-300 ml-1" />
                </span>
              </div>
            </div>
          </div>

          {/* Chapter 1 preview */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">Chapter 1 Preview</span>
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Free</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">
              {content.sections[0].content.split("\n\n")[0]}
            </p>
          </div>

          {/* Blur overlay for locked content */}
          <div className="relative border-t border-slate-100 pt-4">
            <div className="filter blur-sm select-none pointer-events-none">
              <p className="text-slate-600 text-sm leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-lg">
                <Lock size={14} className="text-violet-500" />
                <span className="text-sm font-semibold text-slate-700">Unlock full content</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download CTA */}
      <div className="bg-gradient-to-br from-violet-900/50 to-purple-900/30 border border-violet-500/30 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-white font-black text-lg">Download Full PDF Blueprint</h4>
            <p className="text-slate-400 text-sm mt-1">Get the complete guide with all chapters, frameworks & 30-day plan.</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-slate-500">Free preview available ·</span>
              <span className="text-xs text-violet-400 font-medium">Full PDF from {formatPrice(pricing.symbol, pricing.scholar)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <button
              onClick={onDownload}
              disabled={generating}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                generating
                  ? "bg-violet-800/50 text-violet-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90 hover:shadow-lg hover:shadow-violet-500/30"
              }`}
            >
              {generating ? (
                <>
                  <span className="w-4 h-4 border-2 border-violet-300 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={15} />
                  DOWNLOAD FULL PDF BLUEPRINT
                </>
              )}
            </button>
            <button
              onClick={onUpgrade}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl border border-violet-500/40 text-violet-300 text-sm font-medium hover:bg-violet-500/10 transition-all"
            >
              <Star size={13} />
              Unlock All Blueprints
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────
function DashboardView({
  user,
  pricing,
  onNavigate,
  onOpenPayment,
}: {
  user: User | null;
  pricing: PricingInfo;
  onNavigate: (tab: NavTab) => void;
  onOpenPayment: (plan: "scholar" | "sage") => void;
}) {
  const topNiches = [...NICHES].sort((a, b) => b.score - a.score).slice(0, 3);
  const avgScore = Math.round(NICHES.reduce((s, n) => s + n.score, 0) / NICHES.length);

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="text-3xl font-black text-white">
          {user ? `Hey, ${user.displayName?.split(" ")[0]}! 👋` : "Welcome to Evolvere AI 👋"}
        </h1>
        <p className="text-slate-400 mt-1">Here's what's trending in your niche intelligence dashboard.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Trending Niches",
            value: "10",
            sub: "Active now",
            icon: <Flame size={18} className="text-orange-400" />,
            color: "from-orange-500/10 to-amber-500/10",
            border: "border-orange-500/20",
          },
          {
            label: "Avg. Opportunity Score",
            value: `${avgScore}`,
            sub: "Across all niches",
            icon: <Target size={18} className="text-violet-400" />,
            color: "from-violet-500/10 to-purple-500/10",
            border: "border-violet-500/20",
          },
          {
            label: "Saved Ideas",
            value: "0",
            sub: "Save from Generator",
            icon: <BookMarked size={18} className="text-sky-400" />,
            color: "from-sky-500/10 to-blue-500/10",
            border: "border-sky-500/20",
          },
          {
            label: "Top Score Niche",
            value: `${[...NICHES].sort((a, b) => b.score - a.score)[0].score}`,
            sub: [...NICHES].sort((a, b) => b.score - a.score)[0].label.slice([...NICHES].sort((a, b) => b.score - a.score)[0].label.indexOf(" ") + 1).slice(0, 18),
            icon: <Zap size={18} className="text-emerald-400" />,
            color: "from-emerald-500/10 to-teal-500/10",
            border: "border-emerald-500/20",
          },
        ].map((stat) => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-xs font-medium">{stat.label}</span>
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">{stat.icon}</div>
            </div>
            <div className="text-3xl font-black text-white">{stat.value}</div>
            <div className="text-xs text-slate-500 mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Top Niches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">Top Opportunity Niches</h2>
          <button onClick={() => onNavigate("generate")} className="text-violet-400 text-sm flex items-center gap-1 hover:text-violet-300 transition-colors">
            See all <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topNiches.map((niche) => (
            <div key={niche.id} className="bg-[#0d0a1a] border border-white/8 rounded-2xl p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${niche.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                {niche.label.split(" ")[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-bold truncate">{niche.label.slice(niche.label.indexOf(" ") + 1)}</div>
                <div className="text-slate-500 text-xs">{niche.category}</div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${niche.color} rounded-full`} style={{ width: `${niche.score}%` }} />
                  </div>
                  <span className="text-xs text-white font-bold">{niche.score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => onNavigate("generate")}
          className="cursor-pointer group bg-gradient-to-br from-violet-900/50 to-purple-900/30 border border-violet-500/30 rounded-2xl p-6 hover:border-violet-400/50 transition-all"
        >
          <Sparkles size={24} className="text-violet-400 mb-3" />
          <h3 className="text-white font-bold mb-1">Generate a Blueprint</h3>
          <p className="text-slate-400 text-sm">Pick a niche and generate a full book-level PDF guide instantly.</p>
          <div className="mt-4 flex items-center gap-1 text-violet-400 text-sm font-semibold">
            Start generating <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
        <div
          onClick={() => onOpenPayment("sage")}
          className="cursor-pointer group bg-gradient-to-br from-fuchsia-900/30 to-pink-900/20 border border-fuchsia-500/20 rounded-2xl p-6 hover:border-fuchsia-400/40 transition-all"
        >
          <Star size={24} className="text-fuchsia-400 mb-3" />
          <h3 className="text-white font-bold mb-1">Unlock Sage Plan</h3>
          <p className="text-slate-400 text-sm">5 premium PDFs, all niches, lifetime access & monthly updates.</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-fuchsia-400 text-sm font-bold">{formatPrice(pricing.symbol, pricing.sage)} one-time</span>
            <span className="text-fuchsia-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
              Upgrade <ChevronRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Generate Ideas View ──────────────────────────────────────────────────────
function GenerateView({
  pricing,
  onViewBlueprint,
}: {
  pricing: PricingInfo;
  onViewBlueprint: (niche: typeof NICHES[0]) => void;
}) {
  const [problem, setProblem] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const categories = ["All", "Parenting", "Fitness", "Money", "Relationships", "Pets", "Lifestyle", "Career", "Health", "Business", "Technology", "Self-Improvement"];

  const filtered = NICHES.filter((n) => {
    const matchProblem = !problem || n.label.toLowerCase().includes(problem.toLowerCase()) || n.desc.toLowerCase().includes(problem.toLowerCase()) || n.audience.toLowerCase().includes(problem.toLowerCase());
    const matchCat = categoryFilter === "All" || n.category === categoryFilter;
    return matchProblem && matchCat;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Generate PDF Ideas</h1>
        <p className="text-slate-400 text-sm mt-1">Find trending PDF guide ideas based on real search data.</p>
      </div>

      {/* Input panel */}
      <div className="bg-[#0d0a1a] border border-white/8 rounded-2xl p-5 space-y-4">
        {/* Problem input */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Topic or Problem <span className="text-slate-600 font-normal">(Optional)</span>
          </label>
          <input
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="e.g., healthy meal planning for busy parents..."
            className="w-full bg-[#06030e] border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/60 transition-colors"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Niche dropdown */}
          <div className="flex-1 relative">
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Niche <span className="text-red-400">*</span>
            </label>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between bg-[#06030e] border border-white/10 text-white rounded-xl px-4 py-3 text-sm hover:border-violet-500/40 transition-colors"
            >
              <span className={categoryFilter === "All" ? "text-slate-500" : "text-white"}>
                {categoryFilter === "All" ? "Select a niche" : categoryFilter}
              </span>
              <ChevronRight size={14} className={`text-slate-500 transition-transform ${dropdownOpen ? "rotate-90" : ""}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1530] border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setCategoryFilter(cat); setDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      categoryFilter === cat
                        ? "bg-violet-600/40 text-violet-200 font-semibold"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Count display */}
          <div className="sm:w-40">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Ideas Found</label>
            <div className="bg-[#06030e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold">
              {filtered.length} ideas
            </div>
          </div>
        </div>

        <button
          onClick={() => { setProblem(""); setCategoryFilter("All"); }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-sm hover:opacity-90 transition-all"
        >
          ✨ Generate Ideas
        </button>
      </div>

      {/* PDF Quality Notice */}
      <div className="bg-gradient-to-r from-violet-900/30 to-fuchsia-900/20 border border-violet-500/20 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Star size={14} className="text-violet-400" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold">What does the downloaded PDF look like?</p>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Each PDF is a <strong className="text-violet-300">professionally designed, multi-chapter guide</strong> — not a simple doc. It includes a branded cover page, table of contents, deep psychology chapters, actionable frameworks, a 30-day plan, and an appendix. Think of it like a premium e-book you'd find on Amazon — formatted beautifully with purple-themed sections, visual placeholders, and 800–2,000+ words of real content per niche. <strong className="text-violet-300">Sage plan</strong> unlocks all niches with lifetime access.
          </p>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">
          Showing <span className="text-white font-semibold">{filtered.length}</span> ideas
          {categoryFilter !== "All" && <span> in <span className="text-violet-400 font-semibold">{categoryFilter}</span></span>}
        </p>
        {(problem || categoryFilter !== "All") && (
          <button onClick={() => { setProblem(""); setCategoryFilter("All"); }} className="text-xs text-slate-500 hover:text-slate-300 underline">
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((niche) => (
          <OpportunityCard key={niche.id} niche={niche} onClick={() => onViewBlueprint(niche)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-600">
          <Lightbulb size={32} className="mx-auto mb-3 opacity-50" />
          <p>No ideas match your search. Try a different topic or niche.</p>
        </div>
      )}
    </div>
  );
}

// ─── Saved Blueprints View ────────────────────────────────────────────────────
function SavedBlueprintsView({ onNavigate }: { onNavigate: (tab: NavTab) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
        <BookMarked size={28} className="text-slate-500" />
      </div>
      <h2 className="text-white font-bold text-xl">No Saved Blueprints Yet</h2>
      <p className="text-slate-500 text-sm max-w-xs">Generate a blueprint and save it here for quick access anytime.</p>
      <button
        onClick={() => onNavigate("generate")}
        className="mt-2 bg-violet-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
      >
        Generate Your First Blueprint
      </button>
    </div>
  );
}

// ─── Growth Course View ───────────────────────────────────────────────────────
function GrowthCourseView({ onUpgrade, pricing }: { onUpgrade: () => void; pricing: PricingInfo }) {
  const modules = [
    { title: "Understanding Modern Niche Dynamics", lessons: 4, locked: false },
    { title: "The Digital Product Blueprint Framework", lessons: 6, locked: true },
    { title: "Building Audience for Any Niche", lessons: 5, locked: true },
    { title: "Monetization Strategies & Pricing", lessons: 7, locked: true },
    { title: "Scale & Automation Systems", lessons: 5, locked: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Growth Course</h1>
        <p className="text-slate-400 text-sm mt-1">Master the art of niche selection and digital product creation.</p>
      </div>

      <div className="bg-gradient-to-br from-violet-900/40 to-fuchsia-900/20 border border-violet-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div>
          <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Sage Plan Required</span>
          <h3 className="text-white font-black text-lg mt-1">Unlock the Full Course</h3>
          <p className="text-slate-400 text-sm">27 lessons across 5 modules. From zero to your first digital product.</p>
        </div>
        <button onClick={onUpgrade} className="flex-shrink-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all">
          Upgrade · {formatPrice(pricing.symbol, pricing.sage)}
        </button>
      </div>

      <div className="space-y-3">
        {modules.map((mod, i) => (
          <div key={i} className={`flex items-center gap-4 bg-[#0d0a1a] border rounded-2xl p-4 ${mod.locked ? "border-white/5 opacity-60" : "border-violet-500/20"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${mod.locked ? "bg-white/5" : "bg-violet-500/20"}`}>
              {mod.locked ? <Lock size={15} className="text-slate-500" /> : <GraduationCap size={15} className="text-violet-400" />}
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-semibold">{mod.title}</div>
              <div className="text-slate-500 text-xs">{mod.lessons} lessons</div>
            </div>
            {!mod.locked && (
              <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-medium">Free</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [ipData, setIpData] = useState<IPData | null>(null);
  const [pricing, setPricing] = useState<PricingInfo>({ scholar: 90, sage: 180, symbol: "₹", currency: "INR", isIndia: true });
  const [loadingIP, setLoadingIP] = useState(true);
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [selectedNiche, setSelectedNiche] = useState<typeof NICHES[0] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; plan: "scholar" | "sage" }>({ open: false, plan: "scholar" });
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Auth (UNTOUCHED) ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const result: any = await signInWithGoogle();
      const u = result?.user || result;
      if (u) alert(`Oye ${u.displayName || "User"}, Evolvere AI mein swagat hai!`);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  // ── IP Detection (UNTOUCHED) ──
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data: IPData) => {
        setIpData(data);
        const cc = data.country_code;
        const cur = data.currency || "USD";
        if (cc === "IN") {
          setPricing({ scholar: 90, sage: 180, symbol: "₹", currency: "INR", isIndia: true });
        } else {
          const rateInfo = CURRENCY_RATES[cur] || CURRENCY_RATES["USD"];
          const scholar = convertPrice(BASE_SCHOLAR_INR, rateInfo);
          const sage = convertPrice(BASE_SAGE_INR, rateInfo);
          setPricing({ scholar: scholar.amount, sage: sage.amount, symbol: rateInfo.symbol, currency: cur, isIndia: false });
        }
      })
      .catch(() => setPricing({ scholar: 90, sage: 180, symbol: "₹", currency: "INR", isIndia: true }))
      .finally(() => setLoadingIP(false));
  }, []);

  const handleDownload = async () => {
    if (!selectedNiche) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    await generateBookPDF(selectedNiche);
    setGenerating(false);
  };

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "generate", label: "Generate Ideas", icon: <Lightbulb size={18} /> },
    { id: "blueprints", label: "Saved Blueprints", icon: <BookMarked size={18} /> },
    { id: "course", label: "Growth Course", icon: <GraduationCap size={18} /> },
  ];

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={`${
        mobile
          ? "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 " + (sidebarOpen ? "translate-x-0" : "-translate-x-full")
          : "hidden lg:flex flex-col w-60 flex-shrink-0"
      } bg-[#0f0a1f] border-r border-white/5 flex flex-col`}
    >
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-white text-base font-black">E</span>
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight">Evolvere</span>
            <span className="text-violet-400 font-bold text-base"> AI</span>
          </div>
          {mobile && (
            <button onClick={() => setSidebarOpen(false)} className="ml-auto text-slate-500 hover:text-white">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* User */}
      {user && (
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img src={user.photoURL} alt="profile" referrerPolicy="no-referrer" className="w-9 h-9 rounded-full border border-violet-500/50 object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                {user.displayName?.charAt(0) || "U"}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-white text-sm font-semibold truncate">{user.displayName?.split(" ")[0]}</div>
              <div className="text-slate-500 text-xs truncate">{user.email}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setSelectedNiche(null);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === item.id
                ? "bg-violet-600/20 text-violet-300 border border-violet-500/20"
                : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <span className={activeTab === item.id ? "text-violet-400" : "text-slate-600"}>{item.icon}</span>
            {item.label}
            {activeTab === item.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/5 space-y-2">
        {!user ? (
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
          >
            <LogIn size={15} />
            Login with Google
          </button>
        ) : (
          <button
            onClick={async () => { try { await auth.signOut(); window.location.reload(); } catch (e) { console.error(e); } }}
            className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-400 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        )}
        {!loadingIP && ipData && (
          <div className="text-center text-xs text-slate-600">
            📍 {ipData.city || ipData.country_name} · {pricing.currency}
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#06030e] flex font-sans">
      {/* Sidebar — Desktop */}
      <Sidebar />

      {/* Sidebar — Mobile overlay */}
      <Sidebar mobile />
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#06030e]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Hamburger */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-white p-1">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <div>
              <h2 className="text-white font-bold text-sm capitalize">
                {selectedNiche ? selectedNiche.label.slice(selectedNiche.label.indexOf(" ") + 1) : navItems.find((n) => n.id === activeTab)?.label}
              </h2>
              {!loadingIP && ipData && (
                <p className="text-slate-600 text-xs hidden sm:block">{ipData.country_name} · {pricing.currency}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Upgrade pill */}
            <button
              onClick={() => setPaymentModal({ open: true, plan: "sage" })}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 text-violet-300 px-4 py-1.5 rounded-full text-xs font-bold hover:border-violet-400/50 transition-all"
            >
              <Star size={11} />
              Upgrade to Sage
            </button>

            {/* User avatar or login */}
            {user ? (
              <div className="relative">
                {user.photoURL ? (
                  <img src={user.photoURL} referrerPolicy="no-referrer" alt="" className="w-8 h-8 rounded-full border border-violet-500/50 object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.displayName?.charAt(0) || "U"}
                  </div>
                )}
              </div>
            ) : (
              <button onClick={handleLogin} className="bg-white/10 text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-white/15 transition-all">
                Login
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          {paymentModal.open && (
            <PaymentModal
              plan={paymentModal.plan}
              pricing={pricing}
              ipData={ipData}
              onClose={() => setPaymentModal({ open: false, plan: "scholar" })}
            />
          )}

          {/* Blueprint detail overlay */}
          {selectedNiche ? (
            <BlueprintDetail
              niche={selectedNiche}
              pricing={pricing}
              onBack={() => setSelectedNiche(null)}
              onDownload={handleDownload}
              generating={generating}
              onUpgrade={() => setPaymentModal({ open: true, plan: "sage" })}
            />
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardView
                  user={user}
                  pricing={pricing}
                  onNavigate={(tab) => { setActiveTab(tab); setSelectedNiche(null); }}
                  onOpenPayment={(plan) => setPaymentModal({ open: true, plan })}
                />
              )}
              {activeTab === "generate" && (
                <GenerateView pricing={pricing} onViewBlueprint={(niche) => setSelectedNiche(niche)} />
              )}
              {activeTab === "blueprints" && (
                <SavedBlueprintsView onNavigate={(tab) => setActiveTab(tab)} />
              )}
              {activeTab === "course" && (
                <GrowthCourseView
                  onUpgrade={() => setPaymentModal({ open: true, plan: "sage" })}
                  pricing={pricing}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}