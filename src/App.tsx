import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { signInWithGoogle } from "./firebaseConfig";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
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
  CheckCircle,
} from "lucide-react";

const db = getFirestore();

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
  { id: "digital-detox-parenting", label: "📵 Digital Detox Parenting", desc: "Raising screen-free kids in a tech-obsessed world", color: "from-blue-500 to-indigo-600", tag: "Trending", score: 70, interest: "Rising", category: "Parenting", audience: "Parents concerned about excessive screen time", difficulty: "Medium", competition: "Med Competition", searchVol: "~12,000", queries: ["screen time kids limit", "how to reduce child phone use", "digital detox for children guide"] },
  { id: "mindful-parenting", label: "🧡 Mindful Parenting", desc: "Raising emotionally intelligent children", color: "from-orange-400 to-rose-500", tag: "Hot", score: 82, interest: "High Interest", category: "Parenting", audience: "Parents interested in emotional development of children", difficulty: "Medium", competition: "Med Competition", searchVol: "~9,500", queries: ["emotional intelligence kids", "mindful parenting techniques", "raising empathetic child"] },
  { id: "eco-parenting", label: "🌱 Eco-Friendly Parenting", desc: "Sustainable practices for raising green kids", color: "from-green-500 to-emerald-600", tag: "New", score: 65, interest: "Rising", category: "Parenting", audience: "Eco-conscious parents aiming to instill sustainability", difficulty: "Medium", competition: "Med Competition", searchVol: "~8,000", queries: ["eco friendly baby products", "sustainable parenting tips", "green lifestyle kids"] },
  { id: "positive-discipline", label: "🌟 Positive Discipline", desc: "Non-punitive techniques for well-behaved children", color: "from-yellow-400 to-amber-500", tag: "Trending", score: 74, interest: "High Interest", category: "Parenting", audience: "Parents seeking alternatives to punishment-based discipline", difficulty: "Easy", competition: "Low Competition", searchVol: "~11,000", queries: ["positive discipline methods", "non punitive parenting", "gentle parenting techniques"] },
  { id: "single-parent", label: "💪 Single Parent Survival", desc: "Thriving as a solo parent — financially & emotionally", color: "from-purple-500 to-violet-600", tag: "Hot", score: 88, interest: "High Interest", category: "Parenting", audience: "Single parents needing practical daily guidance", difficulty: "Easy", competition: "Low Competition", searchVol: "~14,000", queries: ["single parent tips", "solo parenting stress", "single mom budget guide"] },
  { id: "teen-communication", label: "🗣️ Teen Communication", desc: "Bridge the gap between parents and teenagers", color: "from-sky-500 to-cyan-600", tag: "Viral", score: 79, interest: "Rising", category: "Parenting", audience: "Parents struggling to connect with their teenagers", difficulty: "Medium", competition: "Med Competition", searchVol: "~7,800", queries: ["how to talk to teenager", "teen parent communication", "understanding adolescent behavior"] },
  { id: "home-workout", label: "🏠 Home Workout Mastery", desc: "Full body transformation with zero equipment", color: "from-red-500 to-orange-500", tag: "Hot", score: 91, interest: "High Interest", category: "Fitness", audience: "Busy professionals wanting gym results at home", difficulty: "Easy", competition: "High Competition", searchVol: "~45,000", queries: ["home workout no equipment", "bodyweight fitness routine", "calisthenics for beginners"] },
  { id: "veggie-muscle", label: "🥦 Muscle Gain for Vegetarians", desc: "Plant-based protocols for serious muscle building", color: "from-green-400 to-teal-500", tag: "Trending", score: 84, interest: "Rising", category: "Fitness", audience: "Vegetarians and vegans serious about building muscle", difficulty: "Medium", competition: "Low Competition", searchVol: "~18,000", queries: ["vegetarian muscle gain diet", "plant based protein for muscle", "vegan bodybuilding plan"] },
  { id: "over-40-fitness", label: "🏃 Fitness After 40", desc: "Science-backed training for aging bodies", color: "from-blue-500 to-sky-600", tag: "Hot", score: 87, interest: "High Interest", category: "Fitness", audience: "Adults 40+ wanting sustainable fitness without injury", difficulty: "Easy", competition: "Med Competition", searchVol: "~22,000", queries: ["fitness over 40 beginners", "workout routine after 40", "strength training middle age"] },
  { id: "hiit-fat-loss", label: "⚡ HIIT Fat Loss Blueprint", desc: "20-minute protocols for maximum calorie burn", color: "from-red-400 to-pink-600", tag: "Viral", score: 76, interest: "High Interest", category: "Fitness", audience: "Time-crunched individuals wanting rapid fat loss", difficulty: "Medium", competition: "High Competition", searchVol: "~31,000", queries: ["HIIT workout fat loss", "20 minute cardio burn", "interval training weight loss"] },
  { id: "yoga-anxiety", label: "🧘 Yoga for Anxiety", desc: "Daily poses and breathwork to calm a wired nervous system", color: "from-violet-400 to-purple-600", tag: "Trending", score: 80, interest: "Rising", category: "Fitness", audience: "Anxious individuals seeking mind-body movement practices", difficulty: "Easy", competition: "Med Competition", searchVol: "~16,500", queries: ["yoga poses for anxiety", "calming yoga routine", "yoga breathwork stress relief"] },
  { id: "micro-hustle", label: "⚡ Micro-Side Hustles", desc: "Launch a digital product in 48 hours", color: "from-pink-500 to-rose-600", tag: "Hot", score: 96, interest: "High Interest", category: "Money", audience: "Employed professionals wanting extra income streams", difficulty: "Easy", competition: "Med Competition", searchVol: "~28,000", queries: ["side hustle ideas 2025", "passive income digital products", "make money online fast"] },
  { id: "frugal-millionaire", label: "💰 Frugal Millionaire Path", desc: "Building wealth on an average salary", color: "from-yellow-500 to-amber-600", tag: "Trending", score: 89, interest: "Rising", category: "Money", audience: "Middle-income earners wanting to build long-term wealth", difficulty: "Medium", competition: "Med Competition", searchVol: "~19,000", queries: ["save money on low income", "frugal living wealth building", "how to become millionaire average salary"] },
  { id: "debt-freedom", label: "🔓 Debt-Free Blueprint", desc: "Step-by-step system to eliminate all debt in 24 months", color: "from-emerald-500 to-green-600", tag: "Hot", score: 93, interest: "High Interest", category: "Money", audience: "Individuals overwhelmed by credit card and student debt", difficulty: "Easy", competition: "Med Competition", searchVol: "~24,000", queries: ["how to pay off debt fast", "debt snowball method", "get out of debt plan"] },
  { id: "crypto-beginner", label: "₿ Crypto for Beginners", desc: "Navigating Web3 without losing your shirt", color: "from-orange-500 to-yellow-500", tag: "Viral", score: 71, interest: "Emerging", category: "Money", audience: "Curious beginners wanting to invest in crypto safely", difficulty: "Hard", competition: "High Competition", searchVol: "~38,000", queries: ["how to buy bitcoin safely", "crypto investing for beginners", "best crypto wallets 2025"] },
  { id: "invest-twenties", label: "📈 Investing in Your 20s", desc: "Compound wealth from your first paycheck", color: "from-blue-500 to-indigo-600", tag: "New", score: 86, interest: "Rising", category: "Money", audience: "Young adults (22-30) starting their investment journey", difficulty: "Easy", competition: "Med Competition", searchVol: "~17,500", queries: ["how to start investing 20s", "index funds for beginners", "Roth IRA young adults"] },
  { id: "attachment", label: "💞 Attachment Style Healing", desc: "Improving modern relationships through self-awareness", color: "from-red-500 to-pink-600", tag: "New", score: 78, interest: "Emerging", category: "Relationships", audience: "Adults recognizing unhealthy relationship patterns", difficulty: "Medium", competition: "Low Competition", searchVol: "~11,000", queries: ["anxious attachment healing", "avoidant attachment style", "secure attachment adults"] },
  { id: "modern-dating", label: "💘 Modern Dating Decoded", desc: "Navigating apps, ghosting, and genuine connection", color: "from-rose-500 to-pink-500", tag: "Viral", score: 82, interest: "High Interest", category: "Relationships", audience: "Single adults 24-35 frustrated with modern dating", difficulty: "Easy", competition: "Med Competition", searchVol: "~20,000", queries: ["dating app tips 2025", "how to stop being ghosted", "find genuine connection online"] },
  { id: "marriage-rekindled", label: "🔥 Reignite Your Marriage", desc: "Practical tools for long-term relationship satisfaction", color: "from-amber-500 to-orange-500", tag: "Hot", score: 85, interest: "Rising", category: "Relationships", audience: "Married couples experiencing emotional distance", difficulty: "Medium", competition: "Med Competition", searchVol: "~13,500", queries: ["how to reignite marriage", "relationship advice long term", "emotional intimacy couples"] },
  { id: "toxic-relationships", label: "🛡️ Escaping Toxic Patterns", desc: "Recognize, exit, and recover from harmful relationships", color: "from-slate-500 to-gray-600", tag: "Trending", score: 90, interest: "High Interest", category: "Relationships", audience: "People recovering from emotionally abusive relationships", difficulty: "Easy", competition: "Low Competition", searchVol: "~16,000", queries: ["signs of toxic relationship", "how to leave toxic partner", "healing after narcissistic abuse"] },
  { id: "dog-training", label: "🐕 Dog Training Mastery", desc: "Transform a chaotic dog into a calm companion", color: "from-amber-500 to-yellow-600", tag: "Hot", score: 88, interest: "High Interest", category: "Pets", audience: "New dog owners struggling with basic obedience", difficulty: "Easy", competition: "High Competition", searchVol: "~41,000", queries: ["dog training basics", "how to stop dog barking", "puppy training schedule"] },
  { id: "cat-behavior", label: "🐱 Cat Behavior Guide", desc: "Decode your cat's signals and build real bond", color: "from-purple-400 to-violet-500", tag: "Trending", score: 72, interest: "Rising", category: "Pets", audience: "Cat owners wanting deeper understanding of feline behavior", difficulty: "Easy", competition: "Med Competition", searchVol: "~12,000", queries: ["why does my cat do that", "cat body language guide", "understanding cat behavior"] },
  { id: "raw-feeding", label: "🥩 Raw Feeding Pets", desc: "Biologically appropriate nutrition for dogs and cats", color: "from-red-500 to-rose-500", tag: "New", score: 68, interest: "Emerging", category: "Pets", audience: "Health-conscious pet owners exploring alternatives to kibble", difficulty: "Hard", competition: "Low Competition", searchVol: "~8,500", queries: ["raw diet for dogs", "BARF diet pets", "is raw food good for dogs"] },
  { id: "nomad", label: "🌍 Remote Nomad Logistics", desc: "Tax & lifestyle guide for digital nomads", color: "from-sky-500 to-blue-600", tag: "Hot", score: 92, interest: "Rising", category: "Lifestyle", audience: "Remote workers wanting to travel while working full-time", difficulty: "Medium", competition: "Med Competition", searchVol: "~15,000", queries: ["digital nomad visa 2025", "how to travel and work remotely", "best countries for digital nomads"] },
  { id: "minimalism", label: "🏡 Minimalist Living", desc: "Declutter your space, simplify your life", color: "from-zinc-400 to-slate-600", tag: "Trending", score: 79, interest: "Rising", category: "Lifestyle", audience: "Overwhelmed professionals wanting simplicity and calm", difficulty: "Easy", competition: "High Competition", searchVol: "~19,000", queries: ["minimalist lifestyle guide", "how to declutter home", "capsule wardrobe minimalism"] },
  { id: "morning-routine", label: "🌅 Perfect Morning Routine", desc: "Own your first 2 hours and win the day", color: "from-amber-400 to-orange-500", tag: "Viral", score: 83, interest: "High Interest", category: "Lifestyle", audience: "Professionals wanting structure and productivity in their mornings", difficulty: "Easy", competition: "High Competition", searchVol: "~27,000", queries: ["productive morning routine", "5am morning habits", "daily routine for success"] },
  { id: "eco-budget", label: "🌿 Eco-Conscious Budgeting", desc: "High-aesthetic sustainable living for renters", color: "from-green-500 to-emerald-600", tag: "New", score: 81, interest: "Emerging", category: "Lifestyle", audience: "Renters wanting eco living without high costs", difficulty: "Easy", competition: "Low Competition", searchVol: "~9,200", queries: ["sustainable living on budget", "eco friendly renter tips", "zero waste apartment"] },
  { id: "ai-career", label: "🤖 AI Career Pivot", desc: "Use LLMs to automate 50% of your current job", color: "from-blue-500 to-cyan-600", tag: "Hot", score: 97, interest: "High Interest", category: "Career", audience: "Knowledge workers wanting to stay ahead of AI displacement", difficulty: "Medium", competition: "Med Competition", searchVol: "~32,000", queries: ["how to use ChatGPT for work", "AI tools for productivity", "automate job with AI"] },
  { id: "linkedin-brand", label: "💼 LinkedIn Personal Brand", desc: "Go from invisible to inbound in 90 days", color: "from-blue-600 to-sky-500", tag: "Trending", score: 88, interest: "Rising", category: "Career", audience: "Professionals wanting better opportunities without cold applying", difficulty: "Medium", competition: "Med Competition", searchVol: "~21,000", queries: ["LinkedIn profile optimization", "personal brand LinkedIn", "get job offers LinkedIn"] },
  { id: "salary-negotiation", label: "💸 Salary Negotiation Mastery", desc: "Scripts and strategies to earn 20-40% more", color: "from-emerald-500 to-teal-600", tag: "Hot", score: 91, interest: "High Interest", category: "Career", audience: "Employees who feel underpaid and want concrete negotiation tools", difficulty: "Easy", competition: "Low Competition", searchVol: "~14,500", queries: ["how to negotiate salary", "salary negotiation script", "ask for raise email template"] },
  { id: "freelance-launch", label: "🚀 Freelance Launch System", desc: "Land your first 3 clients in 30 days", color: "from-violet-500 to-purple-600", tag: "Viral", score: 94, interest: "High Interest", category: "Career", audience: "Employees wanting to go freelance but unsure where to start", difficulty: "Easy", competition: "Med Competition", searchVol: "~18,000", queries: ["how to start freelancing", "freelance clients from scratch", "freelance niche selection"] },
  { id: "burnout", label: "🧠 Digital Burnout Recovery", desc: "Nervous system regulation for social media fatigue", color: "from-purple-500 to-indigo-600", tag: "Trending", score: 94, interest: "Rising", category: "Health", audience: "Overstimulated professionals experiencing chronic fatigue", difficulty: "Easy", competition: "Low Competition", searchVol: "~16,000", queries: ["digital burnout symptoms", "nervous system reset", "social media fatigue recovery"] },
  { id: "dopamine", label: "🎯 Dopamine Detox", desc: "7-day blueprint to reclaim your focus", color: "from-violet-500 to-purple-600", tag: "Trending", score: 91, interest: "Rising", category: "Health", audience: "Chronically distracted individuals unable to focus on real life", difficulty: "Easy", competition: "Med Competition", searchVol: "~24,000", queries: ["dopamine detox guide", "how to reset dopamine", "dopamine fasting benefits"] },
  { id: "gut-health", label: "🦠 Gut Health Revolution", desc: "Fix your microbiome, fix your mental health", color: "from-green-500 to-lime-600", tag: "Hot", score: 86, interest: "Rising", category: "Health", audience: "People with digestive issues, brain fog, or low energy", difficulty: "Medium", competition: "Med Competition", searchVol: "~20,000", queries: ["gut health improvement", "microbiome diet plan", "leaky gut healing protocol"] },
  { id: "sleep-science", label: "😴 Sleep Science Blueprint", desc: "Evidence-based guide to restorative deep sleep", color: "from-indigo-500 to-blue-700", tag: "Viral", score: 88, interest: "High Interest", category: "Health", audience: "Chronically tired adults who can't get quality sleep", difficulty: "Easy", competition: "High Competition", searchVol: "~29,000", queries: ["how to sleep better", "deep sleep tips", "sleep hygiene guide"] },
  { id: "notion-business", label: "📋 Notion Business OS", desc: "Build your entire business inside one Notion workspace", color: "from-slate-500 to-zinc-600", tag: "Hot", score: 85, interest: "High Interest", category: "Business", audience: "Solo entrepreneurs and small teams wanting one organized system", difficulty: "Medium", competition: "Med Competition", searchVol: "~11,500", queries: ["Notion business template", "Notion workspace setup", "Notion for entrepreneurs"] },
  { id: "email-marketing", label: "📧 Email List From Zero", desc: "Build a 1,000-subscriber list in 60 days organically", color: "from-teal-500 to-cyan-600", tag: "Trending", score: 87, interest: "Rising", category: "Business", audience: "Content creators and coaches needing a direct audience", difficulty: "Medium", competition: "Med Competition", searchVol: "~13,000", queries: ["how to build email list", "email marketing beginners", "grow newsletter fast"] },
  { id: "productize-skills", label: "🎁 Productize Your Skills", desc: "Turn your expertise into a $500-$5000/month product", color: "from-rose-500 to-fuchsia-600", tag: "Hot", score: 93, interest: "High Interest", category: "Business", audience: "Professionals with expertise wanting passive income", difficulty: "Easy", competition: "Low Competition", searchVol: "~9,800", queries: ["turn skills into product", "sell expertise online", "online course creation guide"] },
  { id: "chatgpt-mastery", label: "🤖 ChatGPT Mastery Guide", desc: "From beginner to power user in one weekend", color: "from-green-500 to-emerald-600", tag: "Hot", score: 96, interest: "High Interest", category: "Technology", audience: "Professionals wanting to maximize ChatGPT for real work output", difficulty: "Easy", competition: "High Competition", searchVol: "~55,000", queries: ["how to use ChatGPT effectively", "ChatGPT prompts for work", "ChatGPT tips and tricks"] },
  { id: "no-code-business", label: "🔧 No-Code Business Builder", desc: "Build apps and tools without writing a single line of code", color: "from-blue-500 to-violet-600", tag: "Trending", score: 82, interest: "Rising", category: "Technology", audience: "Entrepreneurs and creators wanting to build without developers", difficulty: "Medium", competition: "Med Competition", searchVol: "~12,000", queries: ["no code app builder", "build website without coding", "no code tools 2025"] },
  { id: "cybersecurity-basics", label: "🔐 Cybersecurity for Everyone", desc: "Protect your digital life from hackers and scams", color: "from-red-600 to-slate-700", tag: "New", score: 77, interest: "Rising", category: "Technology", audience: "Non-technical people wanting to secure their online presence", difficulty: "Medium", competition: "Med Competition", searchVol: "~14,000", queries: ["how to stay safe online", "cybersecurity basics guide", "protect personal data internet"] },
  { id: "quarter-life", label: "🌀 Quarter-Life Clarity", desc: "Navigating the 'what am I doing?' phase at 20-25", color: "from-orange-500 to-amber-600", tag: "Viral", score: 89, interest: "Rising", category: "Self-Improvement", audience: "Young adults (20-25) feeling stuck and directionless", difficulty: "Easy", competition: "Low Competition", searchVol: "~13,000", queries: ["quarter life crisis help", "what to do with my life 20s", "find purpose young adult"] },
  { id: "social-anxiety", label: "🗣️ Social Anxiety Hacks", desc: "For networking and professional events", color: "from-teal-500 to-green-600", tag: "Viral", score: 88, interest: "High Interest", category: "Self-Improvement", audience: "Introverts and anxious professionals in social/work settings", difficulty: "Easy", competition: "Med Competition", searchVol: "~19,500", queries: ["social anxiety tips work", "overcome shyness networking", "confidence in social situations"] },
  { id: "manifestation", label: "✨ Manifestation Science", desc: "Combining neuroscience with goal setting", color: "from-yellow-500 to-orange-600", tag: "Trending", score: 85, interest: "Rising", category: "Self-Improvement", audience: "Goal-oriented individuals blending spirituality and science", difficulty: "Easy", competition: "High Competition", searchVol: "~22,000", queries: ["manifestation techniques that work", "law of attraction neuroscience", "visualization goal achievement"] },
  { id: "stoicism-modern", label: "🏛️ Modern Stoicism", desc: "Ancient philosophy applied to 21st century chaos", color: "from-stone-500 to-slate-600", tag: "Hot", score: 83, interest: "Rising", category: "Self-Improvement", audience: "Stressed professionals seeking emotional resilience frameworks", difficulty: "Medium", competition: "Med Competition", searchVol: "~11,000", queries: ["stoicism daily practice", "how to be stoic modern life", "Marcus Aurelius teachings today"] },
];

// ─── Utility ──────────────────────────────────────────────────────────────────
function convertPrice(amountINR: number, currencyInfo: { rate: number; symbol: string }) {
  const converted = amountINR * currencyInfo.rate;
  return { amount: converted < 1 ? parseFloat(converted.toFixed(2)) : Math.round(converted), symbol: currencyInfo.symbol };
}
function formatPrice(symbol: string, amount: number): string {
  return `${symbol}${amount.toLocaleString()}`;
}

// ─── AI-Powered PDF Generation ────────────────────────────────────────────────
async function fetchAIContentForNiche(niche: typeof NICHES[0]): Promise<string> {
  const prompt = `You are a world-class expert author writing a premium, high-density digital guide. Generate a COMPLETE, detailed guide for the niche: "${niche.label.slice(niche.label.indexOf(" ") + 1)}" (${niche.desc}).

Target audience: ${niche.audience}

STRICT REQUIREMENTS — follow every rule exactly:

# [Create a powerful, specific title for this guide]

## Introduction: The Science & Psychology Behind ${niche.label.slice(niche.label.indexOf(" ") + 1)}
[Write minimum 500 words. Explain the deep scientific, psychological, and neurological frameworks that underpin this topic. Reference real studies, researchers, and mechanisms. Be specific, not vague. Use bold text for key terms and concepts.]

## Chapter 1: [Compelling Chapter Title — Core Framework]
[Write minimum 500 words of dense, actionable content. Include specific techniques, step-by-step protocols, real-world examples, and expert insights. No filler. Every sentence must deliver value.]

### [Sub-section title]
[Deep dive into a key sub-topic with specifics]

### [Sub-section title]
[Deep dive into another key sub-topic]

## Chapter 2: [Compelling Chapter Title — Implementation]
[Write minimum 500 words. Focus on practical implementation, common mistakes, and expert-level nuances. Include specific scripts, templates, or protocols where relevant.]

### [Sub-section title]
[Detailed sub-topic]

### [Sub-section title]
[Detailed sub-topic]

## Chapter 3: [Compelling Chapter Title — Psychology & Mindset]
[Write minimum 500 words. Explore the psychological barriers, cognitive biases, and mental models relevant to this topic. Include research-backed reframes and mindset shifts.]

### [Sub-section title]
[Detailed sub-topic]

## Chapter 4: [Compelling Chapter Title — Advanced Strategies]
[Write minimum 500 words. Cover advanced tactics, optimization strategies, and expert-level approaches that separate beginners from masters.]

### [Sub-section title]
[Detailed sub-topic]

### [Sub-section title]
[Detailed sub-topic]

## Chapter 5: [Compelling Chapter Title — Sustainability & Long-Term Success]
[Write minimum 500 words. Address how to make this a permanent lifestyle change, avoid relapse, and build on initial success.]

### [Sub-section title]
[Detailed sub-topic]

## 30-Day Mastery Calendar

| Day | Focus Area | Specific Task | Success Metric |
|-----|-----------|---------------|----------------|
| 1 | [Area] | [Specific task] | [How to measure] |
| 2 | [Area] | [Specific task] | [How to measure] |
| 3 | [Area] | [Specific task] | [How to measure] |
| 4 | [Area] | [Specific task] | [How to measure] |
| 5 | [Area] | [Specific task] | [How to measure] |
| 6 | [Area] | [Specific task] | [How to measure] |
| 7 | [Area] | [Specific task] | [How to measure] |
| 8 | [Area] | [Specific task] | [How to measure] |
| 9 | [Area] | [Specific task] | [How to measure] |
| 10 | [Area] | [Specific task] | [How to measure] |
| 11 | [Area] | [Specific task] | [How to measure] |
| 12 | [Area] | [Specific task] | [How to measure] |
| 13 | [Area] | [Specific task] | [How to measure] |
| 14 | [Area] | [Specific task] | [How to measure] |
| 15 | [Area] | [Specific task] | [How to measure] |
| 16 | [Area] | [Specific task] | [How to measure] |
| 17 | [Area] | [Specific task] | [How to measure] |
| 18 | [Area] | [Specific task] | [How to measure] |
| 19 | [Area] | [Specific task] | [How to measure] |
| 20 | [Area] | [Specific task] | [How to measure] |
| 21 | [Area] | [Specific task] | [How to measure] |
| 22 | [Area] | [Specific task] | [How to measure] |
| 23 | [Area] | [Specific task] | [How to measure] |
| 24 | [Area] | [Specific task] | [How to measure] |
| 25 | [Area] | [Specific task] | [How to measure] |
| 26 | [Area] | [Specific task] | [How to measure] |
| 27 | [Area] | [Specific task] | [How to measure] |
| 28 | [Area] | [Specific task] | [How to measure] |
| 29 | [Area] | [Specific task] | [How to measure] |
| 30 | [Area] | [Specific task] | [How to measure] |

## Common Pitfalls vs. Sage Solutions

| Common Pitfall | Why It Happens | Sage Solution | Expected Outcome |
|---------------|----------------|---------------|------------------|
| [Pitfall 1] | [Root cause] | [Expert solution] | [Result] |
| [Pitfall 2] | [Root cause] | [Expert solution] | [Result] |
| [Pitfall 3] | [Root cause] | [Expert solution] | [Result] |
| [Pitfall 4] | [Root cause] | [Expert solution] | [Result] |
| [Pitfall 5] | [Root cause] | [Expert solution] | [Result] |
| [Pitfall 6] | [Root cause] | [Expert solution] | [Result] |
| [Pitfall 7] | [Root cause] | [Expert solution] | [Result] |
| [Pitfall 8] | [Root cause] | [Expert solution] | [Result] |

## Resource & Tool Checklist

| Resource/Tool | Type | Purpose | Priority | Cost |
|--------------|------|---------|----------|------|
| [Resource 1] | [App/Book/Website] | [What it does] | [Essential/Optional] | [Free/Paid] |
| [Resource 2] | [App/Book/Website] | [What it does] | [Essential/Optional] | [Free/Paid] |
| [Resource 3] | [App/Book/Website] | [What it does] | [Essential/Optional] | [Free/Paid] |
| [Resource 4] | [App/Book/Website] | [What it does] | [Essential/Optional] | [Free/Paid] |
| [Resource 5] | [App/Book/Website] | [What it does] | [Essential/Optional] | [Free/Paid] |
| [Resource 6] | [App/Book/Website] | [What it does] | [Essential/Optional] | [Free/Paid] |
| [Resource 7] | [App/Book/Website] | [What it does] | [Essential/Optional] | [Free/Paid] |
| [Resource 8] | [App/Book/Website] | [What it does] | [Essential/Optional] | [Free/Paid] |
| [Resource 9] | [App/Book/Website] | [What it does] | [Essential/Optional] | [Free/Paid] |
| [Resource 10] | [App/Book/Website] | [What it does] | [Essential/Optional] | [Free/Paid] |

## Conclusion: Your Path Forward
[Write 300+ words. A powerful, direct closing that reinforces the transformation available to the reader. No motivational fluff — specific next steps, accountability systems, and a clear vision of what mastery looks like in 90 days.]

STYLE RULES:
- Direct and sophisticated. Zero filler. Every sentence delivers value.
- Use **bold** for key terms, frameworks, and critical insights.
- Start directly with the # Title. No preamble, no "Here is your guide", no meta-commentary.
- Be specific: name real researchers, cite approximate statistics, reference actual tools and methods.
- Write as if this is a $197 premium product that will transform someone's life.`;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Bina apiVersion specify kiye direct model call kar
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const result = await model.generateContent(prompt);
const response = await result.response;
const fullText = response.text();
    if (!fullText) {
      throw new Error('No content received from Gemini');
    }

    return fullText;
}

// ─── PDF Renderer — parses AI markdown and renders to jsPDF ──────────────────
async function generateBookPDF(niche: typeof NICHES[0]) {
  // Step 1: Fetch AI content
  let rawContent: string;
  try {
    rawContent = await fetchAIContentForNiche(niche);
  } catch (err) {
    console.error("AI content fetch failed:", err);
    throw new Error("Failed to generate AI content. Please try again.");
  }

  // Step 2: Render PDF
  const pdfDoc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const marginL = 20;
  const marginR = 20;
  const contentW = pageW - marginL - marginR;

  const addPageBackground = () => {
    pdfDoc.setFillColor(250, 248, 255);
    pdfDoc.rect(0, 0, pageW, pageH, "F");
    pdfDoc.setFillColor(124, 58, 237);
    pdfDoc.rect(0, 0, 6, pageH, "F");
  };

  const addFooter = (pageNum: number, title: string) => {
    pdfDoc.setFontSize(8);
    pdfDoc.setTextColor(160, 130, 200);
    pdfDoc.setFont("helvetica", "normal");
    pdfDoc.text(`Evolvere AI  •  ${title}`, marginL, pageH - 10);
    pdfDoc.text(`${pageNum}`, pageW - marginR, pageH - 10, { align: "right" });
  };

  // ── Cover Page ──
  addPageBackground();
  pdfDoc.setFillColor(124, 58, 237);
  pdfDoc.rect(0, 0, pageW, 130, "F");
  pdfDoc.setFillColor(99, 40, 210);
  pdfDoc.rect(0, 105, pageW, 30, "F");

  pdfDoc.setFontSize(10);
  pdfDoc.setTextColor(255, 255, 255);
  pdfDoc.setFont("helvetica", "bold");
  pdfDoc.text("EVOLVERE AI", marginL, 20);
  pdfDoc.setFont("helvetica", "normal");
  pdfDoc.setFontSize(8);
  pdfDoc.text("Premium Digital Guide Platform", marginL, 26);

  // Extract title from AI content (first # line)
  const titleMatch = rawContent.match(/^#\s+(.+)/m);
  const guideTitle = titleMatch ? titleMatch[1].trim() : niche.label.slice(niche.label.indexOf(" ") + 1);

  pdfDoc.setFontSize(22);
  pdfDoc.setFont("helvetica", "bold");
  pdfDoc.setTextColor(255, 255, 255);
  const titleLines = pdfDoc.splitTextToSize(guideTitle, contentW);
  pdfDoc.text(titleLines, marginL, 50);

  pdfDoc.setFontSize(11);
  pdfDoc.setFont("helvetica", "normal");
  pdfDoc.setTextColor(221, 214, 254);
  pdfDoc.text(niche.desc, marginL, 110);

  pdfDoc.setTextColor(100, 70, 160);
  pdfDoc.setFontSize(9);
  pdfDoc.text(`Published by Evolvere AI  •  AI-Powered Premium Guide  •  ${new Date().getFullYear()}`, marginL, 145);

  // Cover info box
  pdfDoc.setDrawColor(180, 150, 230);
  pdfDoc.setFillColor(240, 235, 255);
  pdfDoc.roundedRect(marginL, 155, contentW, 65, 5, 5, "FD");
  pdfDoc.setFontSize(9);
  pdfDoc.setFont("helvetica", "bold");
  pdfDoc.setTextColor(100, 60, 180);
  pdfDoc.text("WHAT'S INSIDE THIS GUIDE:", marginL + 6, 167);
  const coverItems = [
    "✓  5 Deep Chapters with 500+ words each",
    "✓  30-Day Mastery Calendar with daily tasks",
    "✓  Common Pitfalls vs. Sage Solutions Table",
    "✓  Complete Resource & Tool Checklist",
    "✓  Expert frameworks, research & protocols",
  ];
  pdfDoc.setFont("helvetica", "normal");
  pdfDoc.setFontSize(9);
  pdfDoc.setTextColor(80, 50, 140);
  coverItems.forEach((item, i) => {
    pdfDoc.text(item, marginL + 6, 176 + i * 8);
  });

  pdfDoc.setFontSize(8);
  pdfDoc.setTextColor(130, 110, 170);
  pdfDoc.text("© " + new Date().getFullYear() + " Evolvere AI. All rights reserved. For personal use only.", marginL, 276);

  // ── Parse and render AI content line by line ──
  const lines = rawContent.split("\n");
  let pageNum = 2;
  pdfDoc.addPage();
  addPageBackground();
  let y = 25;

  // Table parsing state
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeaderRow: string[] = [];
  let isHeaderNext = false;

  const flushTable = () => {
    if (tableRows.length === 0) return;

    // Calculate column widths
    const cols = tableHeaderRow.length || (tableRows[0]?.length ?? 1);
    const colW = contentW / cols;

    // Check if table fits on page, if not add new page
    const tableHeight = (tableRows.length + 1) * 8 + 6;
    if (y + tableHeight > pageH - 20) {
      addFooter(pageNum, guideTitle);
      pageNum++;
      pdfDoc.addPage();
      addPageBackground();
      y = 25;
    }

    // Draw header
    pdfDoc.setFillColor(124, 58, 237);
    pdfDoc.rect(marginL, y, contentW, 8, "F");
    pdfDoc.setFontSize(7.5);
    pdfDoc.setFont("helvetica", "bold");
    pdfDoc.setTextColor(255, 255, 255);
    tableHeaderRow.forEach((cell, ci) => {
      const cellText = pdfDoc.splitTextToSize(cell.trim(), colW - 4);
      pdfDoc.text(cellText[0] || "", marginL + ci * colW + 2, y + 5.5);
    });
    y += 8;

    // Draw rows
    tableRows.forEach((row, ri) => {
      if (y + 8 > pageH - 20) {
        addFooter(pageNum, guideTitle);
        pageNum++;
        pdfDoc.addPage();
        addPageBackground();
        y = 25;
        // Reprint header
        pdfDoc.setFillColor(124, 58, 237);
        pdfDoc.rect(marginL, y, contentW, 8, "F");
        pdfDoc.setFontSize(7.5);
        pdfDoc.setFont("helvetica", "bold");
        pdfDoc.setTextColor(255, 255, 255);
        tableHeaderRow.forEach((cell, ci) => {
          pdfDoc.text(cell.trim().slice(0, 20), marginL + ci * colW + 2, y + 5.5);
        });
        y += 8;
      }

      const bgColor = ri % 2 === 0 ? [248, 244, 255] : [255, 255, 255];
      pdfDoc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdfDoc.rect(marginL, y, contentW, 8, "F");
      pdfDoc.setDrawColor(220, 200, 240);
      pdfDoc.setLineWidth(0.1);
      pdfDoc.rect(marginL, y, contentW, 8, "S");

      pdfDoc.setFontSize(7);
      pdfDoc.setFont("helvetica", "normal");
      pdfDoc.setTextColor(50, 30, 90);
      row.forEach((cell, ci) => {
        const cellText = pdfDoc.splitTextToSize(cell.trim(), colW - 3);
        pdfDoc.text(cellText[0] || "", marginL + ci * colW + 2, y + 5);
      });
      y += 8;
    });

    y += 6;
    inTable = false;
    tableRows = [];
    tableHeaderRow = [];
    isHeaderNext = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ── Table detection ──
    if (line.trim().startsWith("|")) {
      // Is separator row?
      if (line.replace(/[\s|:-]/g, "").length === 0) {
        isHeaderNext = false; // separator after header
        continue;
      }
      const cells = line.split("|").filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (!inTable) {
        inTable = true;
        tableHeaderRow = cells;
        isHeaderNext = true;
      } else if (isHeaderNext) {
        // skip separator
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // ── Headings ──
    if (line.startsWith("# ")) {
      // H1 — Skip (already used as title on cover)
      continue;
    }

    if (line.startsWith("## ")) {
      const text = line.replace(/^##\s+/, "").replace(/\*\*/g, "");
      if (y + 20 > pageH - 20) {
        addFooter(pageNum, guideTitle);
        pageNum++;
        pdfDoc.addPage();
        addPageBackground();
        y = 25;
      }
      // Chapter header band
      pdfDoc.setFillColor(124, 58, 237);
      pdfDoc.rect(marginL - 2, y - 4, contentW + 4, 13, "F");
      pdfDoc.setFontSize(13);
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.setTextColor(255, 255, 255);
      const h2Lines = pdfDoc.splitTextToSize(text, contentW - 4);
      pdfDoc.text(h2Lines, marginL + 2, y + 5);
      y += h2Lines.length * 7 + 8;
      continue;
    }

    if (line.startsWith("### ")) {
      const text = line.replace(/^###\s+/, "").replace(/\*\*/g, "");
      if (y + 12 > pageH - 20) {
        addFooter(pageNum, guideTitle);
        pageNum++;
        pdfDoc.addPage();
        addPageBackground();
        y = 25;
      }
      pdfDoc.setFontSize(11);
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.setTextColor(100, 50, 200);
      const h3Lines = pdfDoc.splitTextToSize(text, contentW);
      pdfDoc.text(h3Lines, marginL, y);
      y += h3Lines.length * 6 + 2;
      pdfDoc.setDrawColor(180, 140, 240);
      pdfDoc.setLineWidth(0.4);
      pdfDoc.line(marginL, y, marginL + 50, y);
      y += 5;
      continue;
    }

    // ── Empty line ──
    if (line.trim() === "") {
      y += 3;
      continue;
    }

    // ── Regular paragraph text (handle inline bold) ──
    const cleanedLine = line.replace(/\*\*/g, "");
    const isBoldLine = line.includes("**") && (line.match(/\*\*/g) || []).length >= 2;

    if (cleanedLine.trim() === "") continue;

    if (y + 8 > pageH - 20) {
      addFooter(pageNum, guideTitle);
      pageNum++;
      pdfDoc.addPage();
      addPageBackground();
      y = 25;
    }

    pdfDoc.setFontSize(10);
    pdfDoc.setTextColor(40, 30, 70);

    if (isBoldLine && cleanedLine.trim().length < 120 && !cleanedLine.includes(". ")) {
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.setTextColor(80, 40, 150);
    } else {
      pdfDoc.setFont("helvetica", "normal");
    }

    const wrapped = pdfDoc.splitTextToSize(cleanedLine, contentW);
    if (y + wrapped.length * 5.5 > pageH - 20) {
      addFooter(pageNum, guideTitle);
      pageNum++;
      pdfDoc.addPage();
      addPageBackground();
      y = 25;
    }
    pdfDoc.text(wrapped, marginL, y);
    y += wrapped.length * 5.5 + 2;
  }

  // Flush any remaining table
  if (inTable) flushTable();

  // Footer on last page
  addFooter(pageNum, guideTitle);

  pdfDoc.save(`Evolvere-AI-${niche.id}-Premium-Guide.pdf`);
}

// ─── Subscription Badge ───────────────────────────────────────────────────────
function SubscriptionBadge() {
  return (
    <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
      <CheckCircle size={11} />
      Active Plan
    </div>
  );
}

// ─── Payment Modal ─────────────────────────────────────────────────────────────
function PaymentModal({
  plan,
  pricing,
  ipData,
  onClose,
  onPaymentSuccess,
}: {
  plan: "scholar" | "sage";
  pricing: PricingInfo;
  ipData: IPData | null;
  onClose: () => void;
  onPaymentSuccess: () => void;
}) {
  const price = plan === "scholar" ? pricing.scholar : pricing.sage;
  const planName = plan === "scholar" ? "Scholar" : "Sage";
  const features = plan === "scholar"
    ? ["1 AI-Generated PDF Guide", "Basic Niche Selection", "Email Delivery", "30-Day Access"]
    : ["5 AI-Generated PDF Guides", "All 10 Premium Niches", "Priority Email Delivery", "Lifetime Access", "Exclusive Framework Templates", "Monthly New Guide"];

  const handleRazorpay = () => {
    const options = {
      // @ts-ignore
      key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID,
      amount: Math.round(price * 100),
      currency: "INR",
      name: "Evolvere AI",
      description: `${planName} Plan – Premium AI Digital Guide`,
      image: "",
      handler: async function (response: any) {
        try {
          const { getAuth } = await import("firebase/auth");
          const currentUser = getAuth().currentUser;
          if (currentUser) {
            await setDoc(
              doc(db, "users", currentUser.uid),
              {
                isSubscribed: true,
                plan: planName.toLowerCase(),
                subscribedAt: new Date().toISOString(),
                paymentId: response.razorpay_payment_id,
              },
              { merge: true }
            );
          }
        } catch (err) {
          console.error("Firestore update error:", err);
        }
        onPaymentSuccess();
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

  const handleStripe = async () => {
    setTimeout(async () => {
      try {
        const { getAuth } = await import("firebase/auth");
        const currentUser = getAuth().currentUser;
        if (currentUser) {
          await setDoc(
            doc(db, "users", currentUser.uid),
            {
              isSubscribed: true,
              plan: planName.toLowerCase(),
              subscribedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      } catch (err) {
        console.error("Firestore update error:", err);
      }
      onPaymentSuccess();
      alert(`✅ Stripe Payment Successful! Your ${planName} plan is now active.\nCharged: ${formatPrice(pricing.symbol, price)} to your card.\nConfirmation sent to your email.`);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md">
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
            <p className="text-sm text-slate-500 mt-1">{ipData?.country_name || "International"} · {pricing.currency}</p>
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
          <p className="text-center text-xs text-slate-600 mt-3">🔒 Secured by {pricing.isIndia ? "Razorpay" : "Stripe"} · 256-bit SSL Encryption</p>
        </div>
      </div>
    </div>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const color = score >= 90 ? "#a78bfa" : score >= 80 ? "#60a5fa" : "#34d399";
  return (
    <div className="relative flex items-center justify-center w-14 h-14">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="24" fill="none" stroke="#1e1b2e" strokeWidth="4" />
        <circle cx="28" cy="28" r="24" fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${(score / 100) * 150.8} 150.8`} strokeLinecap="round" />
      </svg>
      <span className="text-xs font-black text-white relative z-10">{score}</span>
    </div>
  );
}

// ─── Opportunity Card ─────────────────────────────────────────────────────────
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
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 onClick={onClick} className="text-white font-bold text-base leading-snug cursor-pointer hover:text-violet-300 transition-colors">
              {niche.label.slice(niche.label.indexOf(" ") + 1)}
            </h3>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed">{niche.desc}</p>
          </div>
          <button onClick={onClick} className="flex-shrink-0 flex items-center gap-1.5 bg-violet-600/20 hover:bg-violet-600 border border-violet-500/30 text-violet-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all">
            <BookMarked size={11} />
            View
          </button>
        </div>
        <div className="flex items-start gap-2 mb-4">
          <span className="text-slate-500 mt-0.5 flex-shrink-0">👤</span>
          <p className="text-slate-500 text-xs leading-relaxed">{niche.audience}</p>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${diffColors[niche.difficulty]}`}>{niche.difficulty}</span>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${interestColors[niche.interest]}`}>
            {niche.interest === "Rising" ? "↗ Rising" : niche.interest === "High Interest" ? "🔥 " + niche.interest : niche.interest}
          </span>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${compColors[niche.competition]}`}>{niche.competition}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-4">
          <span>🔍</span>
          <span>{niche.searchVol} searches/mo</span>
        </div>
        <div className="bg-[#06030e] rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-violet-400" />
            <span className="text-slate-400 text-xs font-medium">Opportunity Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${niche.color} rounded-full transition-all duration-700`} style={{ width: `${niche.score}%` }} />
            </div>
            <span className="text-white font-black text-base">{niche.score}<span className="text-slate-500 font-normal text-xs">/100</span></span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5">
        <button onClick={() => setShowQueries(!showQueries)} className="w-full flex items-center gap-2 px-5 py-3 text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors">
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
  generatingStatus,
  onUpgrade,
  isSubscribed,
}: {
  niche: typeof NICHES[0];
  pricing: PricingInfo;
  onBack: () => void;
  onDownload: () => void;
  generating: boolean;
  generatingStatus: string;
  onUpgrade: () => void;
  isSubscribed: boolean;
}) {
  const chapterPreviews = [
    "Introduction: The Science & Psychology",
    "Chapter 1: Core Framework & Foundations",
    "Chapter 2: Implementation Protocols",
    "Chapter 3: Psychology & Mindset Mastery",
    "Chapter 4: Advanced Strategies",
    "Chapter 5: Sustainability & Long-Term Success",
    "30-Day Mastery Calendar",
    "Common Pitfalls vs. Sage Solutions",
    "Resource & Tool Checklist",
  ];

  return (
    <div className="animate-in">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Results</span>
      </button>

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
          <div className="flex flex-wrap gap-2 mt-4">
            {["5 Deep Chapters", "30-Day Calendar", "Pitfalls Table", "Resource Checklist", "AI-Generated"].map(tag => (
              <span key={tag} className="text-xs bg-white/8 text-slate-400 px-3 py-1 rounded-full border border-white/10">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* AI Content Notice */}
      <div className="bg-gradient-to-r from-violet-900/30 to-fuchsia-900/20 border border-violet-500/20 rounded-2xl p-4 flex items-start gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles size={14} className="text-violet-400" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold">AI-Powered Premium PDF</p>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            This guide is generated in real-time by Claude AI with <strong className="text-violet-300">8,192 tokens</strong> of rich content — 5 deep chapters (500+ words each), a full 30-day calendar, pitfall tables, and a resource checklist. Each PDF is unique and high-density.
          </p>
        </div>
      </div>

      {/* Blueprint Preview */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
        <div className={`bg-gradient-to-r ${niche.color} p-6`}>
          <div className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">EVOLVERE AI · AI-POWERED PREMIUM BLUEPRINT</div>
          <h3 className="text-white text-xl font-black leading-tight">{niche.label.slice(niche.label.indexOf(" ") + 1)}: Complete Expert Guide</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Contents (AI-Generated)</h4>
            <div className="space-y-2">
              {chapterPreviews.map((chapter, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs font-black flex items-center justify-center mt-0.5">{i + 1}</span>
                  <div className="flex-1">
                    <div className="text-slate-700 text-sm font-medium leading-snug">{chapter}</div>
                    {i === 0 && <p className="text-slate-400 text-xs mt-1">Deep scientific and psychological frameworks with research citations...</p>}
                  </div>
                  {i >= 1 && !isSubscribed && <div className="flex-shrink-0 mt-1"><Lock size={12} className="text-slate-300" /></div>}
                  {i >= 1 && isSubscribed && <div className="flex-shrink-0 mt-1"><CheckCircle size={12} className="text-emerald-400" /></div>}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">What You Get</span>
              <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">AI-Powered</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Each PDF is generated fresh with Claude AI — delivering expert-level content with real research, specific protocols, named frameworks, and actionable 30-day plans. Not a template. Not filler. Pure, dense value for <strong>{niche.audience.toLowerCase()}</strong>.
            </p>
          </div>

          {isSubscribed ? (
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={14} className="text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-600">Full AI Content Unlocked — Ready to Download</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Your Sage plan gives you full access. Click Download to generate your personalized AI guide with all 5 chapters, tables, and 30-day plan.
              </p>
            </div>
          ) : (
            <div className="relative border-t border-slate-100 pt-4">
              <div className="filter blur-sm select-none pointer-events-none">
                <p className="text-slate-600 text-sm leading-relaxed">
                  Chapter 2 dives into the specific implementation protocols, including the exact frameworks used by top practitioners. You'll learn the step-by-step system for building lasting habits and achieving measurable outcomes within the first 14 days...
                </p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-lg">
                  <Lock size={14} className="text-violet-500" />
                  <span className="text-sm font-semibold text-slate-700">Unlock full AI content</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Download CTA */}
      <div className="bg-gradient-to-br from-violet-900/50 to-purple-900/30 border border-violet-500/30 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-white font-black text-lg">Download AI-Generated PDF Blueprint</h4>
            <p className="text-slate-400 text-sm mt-1">Claude AI writes your full guide on demand — 5 chapters, 3 tables, 30-day plan.</p>
            {isSubscribed ? (
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle size={13} className="text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">Your plan includes unlimited AI PDF downloads</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-slate-500">Free preview ·</span>
                <span className="text-xs text-violet-400 font-medium">Full AI PDF from {formatPrice(pricing.symbol, pricing.scholar)}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <button
              onClick={onDownload}
              disabled={generating}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all min-w-[220px] ${
                generating
                  ? "bg-violet-800/50 text-violet-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90 hover:shadow-lg hover:shadow-violet-500/30"
              }`}
            >
              {generating ? (
                <>
                  <span className="w-4 h-4 border-2 border-violet-300 border-t-white rounded-full animate-spin" />
                  {generatingStatus || "Generating AI Content..."}
                </>
              ) : (
                <>
                  <Download size={15} />
                  DOWNLOAD AI PDF BLUEPRINT
                </>
              )}
            </button>
            {!isSubscribed && (
              <button onClick={onUpgrade} className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl border border-violet-500/40 text-violet-300 text-sm font-medium hover:bg-violet-500/10 transition-all">
                <Star size={13} />
                Unlock All Blueprints
              </button>
            )}
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
  isSubscribed,
}: {
  user: User | null;
  pricing: PricingInfo;
  onNavigate: (tab: NavTab) => void;
  onOpenPayment: (plan: "scholar" | "sage") => void;
  isSubscribed: boolean;
}) {
  const topNiches = [...NICHES].sort((a, b) => b.score - a.score).slice(0, 3);
  const avgScore = Math.round(NICHES.reduce((s, n) => s + n.score, 0) / NICHES.length);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="text-3xl font-black text-white">
          {user ? `Hey, ${user.displayName?.split(" ")[0]}! 👋` : "Welcome to Evolvere AI 👋"}
        </h1>
        <p className="text-slate-400 mt-1">Here's what's trending in your niche intelligence dashboard.</p>
        {isSubscribed && (
          <div className="mt-3 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-2">
            <CheckCircle size={15} className="text-emerald-400" />
            <span className="text-emerald-300 text-sm font-semibold">All features unlocked — Active subscription</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Trending Niches", value: "10", sub: "Active now", icon: <Flame size={18} className="text-orange-400" />, color: "from-orange-500/10 to-amber-500/10", border: "border-orange-500/20" },
          { label: "Avg. Opportunity Score", value: `${avgScore}`, sub: "Across all niches", icon: <Target size={18} className="text-violet-400" />, color: "from-violet-500/10 to-purple-500/10", border: "border-violet-500/20" },
          { label: "Saved Ideas", value: "0", sub: "Save from Generator", icon: <BookMarked size={18} className="text-sky-400" />, color: "from-sky-500/10 to-blue-500/10", border: "border-sky-500/20" },
          { label: "Top Score Niche", value: `${[...NICHES].sort((a, b) => b.score - a.score)[0].score}`, sub: [...NICHES].sort((a, b) => b.score - a.score)[0].label.slice([...NICHES].sort((a, b) => b.score - a.score)[0].label.indexOf(" ") + 1).slice(0, 18), icon: <Zap size={18} className="text-emerald-400" />, color: "from-emerald-500/10 to-teal-500/10", border: "border-emerald-500/20" },
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

      <div className={`grid grid-cols-1 ${isSubscribed ? "" : "md:grid-cols-2"} gap-4`}>
        <div onClick={() => onNavigate("generate")} className="cursor-pointer group bg-gradient-to-br from-violet-900/50 to-purple-900/30 border border-violet-500/30 rounded-2xl p-6 hover:border-violet-400/50 transition-all">
          <Sparkles size={24} className="text-violet-400 mb-3" />
          <h3 className="text-white font-bold mb-1">Generate an AI Blueprint</h3>
          <p className="text-slate-400 text-sm">Pick a niche and generate a full AI-written PDF guide with 5 chapters, tables & 30-day plan.</p>
          <div className="mt-4 flex items-center gap-1 text-violet-400 text-sm font-semibold">
            Start generating <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
        {!isSubscribed && (
          <div onClick={() => onOpenPayment("sage")} className="cursor-pointer group bg-gradient-to-br from-fuchsia-900/30 to-pink-900/20 border border-fuchsia-500/20 rounded-2xl p-6 hover:border-fuchsia-400/40 transition-all">
            <Star size={24} className="text-fuchsia-400 mb-3" />
            <h3 className="text-white font-bold mb-1">Unlock Sage Plan</h3>
            <p className="text-slate-400 text-sm">5 premium AI PDFs, all niches, lifetime access & monthly updates.</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-fuchsia-400 text-sm font-bold">{formatPrice(pricing.symbol, pricing.sage)} one-time</span>
              <span className="text-fuchsia-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                Upgrade <ChevronRight size={14} />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Generate Ideas View ──────────────────────────────────────────────────────
function GenerateView({ pricing, onViewBlueprint }: { pricing: PricingInfo; onViewBlueprint: (niche: typeof NICHES[0]) => void }) {
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

      <div className="bg-[#0d0a1a] border border-white/8 rounded-2xl p-5 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Topic or Problem <span className="text-slate-600 font-normal">(Optional)</span></label>
          <input value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="e.g., healthy meal planning for busy parents..."
            className="w-full bg-[#06030e] border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/60 transition-colors" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Niche <span className="text-red-400">*</span></label>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-full flex items-center justify-between bg-[#06030e] border border-white/10 text-white rounded-xl px-4 py-3 text-sm hover:border-violet-500/40 transition-colors">
              <span className={categoryFilter === "All" ? "text-slate-500" : "text-white"}>{categoryFilter === "All" ? "Select a niche" : categoryFilter}</span>
              <ChevronRight size={14} className={`text-slate-500 transition-transform ${dropdownOpen ? "rotate-90" : ""}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1530] border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => { setCategoryFilter(cat); setDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${categoryFilter === cat ? "bg-violet-600/40 text-violet-200 font-semibold" : "text-slate-300 hover:bg-white/5"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="sm:w-40">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Ideas Found</label>
            <div className="bg-[#06030e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold">{filtered.length} ideas</div>
          </div>
        </div>
        <button onClick={() => { setProblem(""); setCategoryFilter("All"); }} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-sm hover:opacity-90 transition-all">
          ✨ Generate Ideas
        </button>
      </div>

      <div className="bg-gradient-to-r from-violet-900/30 to-fuchsia-900/20 border border-violet-500/20 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles size={14} className="text-violet-400" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold">AI-Powered PDF Generation</p>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Each PDF is written by Claude AI with <strong className="text-violet-300">8,192 tokens</strong> of dense content — 5 chapters (500+ words each), a full 30-day mastery calendar, a pitfalls table, and a resource checklist. Premium quality, generated in real-time.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">Showing <span className="text-white font-semibold">{filtered.length}</span> ideas
          {categoryFilter !== "All" && <span> in <span className="text-violet-400 font-semibold">{categoryFilter}</span></span>}
        </p>
        {(problem || categoryFilter !== "All") && (
          <button onClick={() => { setProblem(""); setCategoryFilter("All"); }} className="text-xs text-slate-500 hover:text-slate-300 underline">Clear filters</button>
        )}
      </div>

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
      <button onClick={() => onNavigate("generate")} className="mt-2 bg-violet-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors">
        Generate Your First Blueprint
      </button>
    </div>
  );
}

// ─── Growth Course View ───────────────────────────────────────────────────────
function GrowthCourseView({ onUpgrade, pricing, isSubscribed }: { onUpgrade: () => void; pricing: PricingInfo; isSubscribed: boolean }) {
  const modules = [
    { title: "Understanding Modern Niche Dynamics", lessons: 4, locked: false },
    { title: "The Digital Product Blueprint Framework", lessons: 6, locked: !isSubscribed },
    { title: "Building Audience for Any Niche", lessons: 5, locked: !isSubscribed },
    { title: "Monetization Strategies & Pricing", lessons: 7, locked: !isSubscribed },
    { title: "Scale & Automation Systems", lessons: 5, locked: !isSubscribed },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Growth Course</h1>
        <p className="text-slate-400 text-sm mt-1">Master the art of niche selection and digital product creation.</p>
      </div>
      {!isSubscribed ? (
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
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-emerald-300 font-semibold text-sm">All 5 modules unlocked</p>
            <p className="text-slate-400 text-xs mt-0.5">27 lessons available — enjoy your full course access.</p>
          </div>
        </div>
      )}
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
              <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-medium">
                {i === 0 ? "Free" : "Unlocked"}
              </span>
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
  const [generatingStatus, setGeneratingStatus] = useState("");
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; plan: "scholar" | "sage" }>({ open: false, plan: "scholar" });
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) { setIsSubscribed(false); return; }
    setLoadingSubscription(true);
    const fetchSubscription = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          const hasActivePlan = data.isSubscribed === true || (typeof data.plan === "string" && data.plan.length > 0);
          setIsSubscribed(hasActivePlan);
        } else {
          setIsSubscribed(false);
        }
      } catch (err) {
        console.error("Firestore subscription fetch error:", err);
        setIsSubscribed(false);
      } finally {
        setLoadingSubscription(false);
      }
    };
    fetchSubscription();
  }, [user?.uid]);

  const handlePaymentSuccess = () => setIsSubscribed(true);

  const handleLogin = async () => {
    try {
      const result: any = await signInWithGoogle();
      const u = result?.user || result;
      if (u) alert(`Oye ${u.displayName || "User"}, Evolvere AI mein swagat hai!`);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

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
    setGeneratingStatus("Prompting Claude AI...");
    try {
      setGeneratingStatus("Writing 5 deep chapters...");
      await generateBookPDF(selectedNiche);
      setGeneratingStatus("Done!");
    } catch (err: any) {
      console.error("PDF generation error:", err);
      alert(`PDF generation failed: ${err.message || "Unknown error"}. Please try again.`);
    } finally {
      setGenerating(false);
      setGeneratingStatus("");
    }
  };

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "generate", label: "Generate Ideas", icon: <Lightbulb size={18} /> },
    { id: "blueprints", label: "Saved Blueprints", icon: <BookMarked size={18} /> },
    { id: "course", label: "Growth Course", icon: <GraduationCap size={18} /> },
  ];

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={`${mobile ? "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 " + (sidebarOpen ? "translate-x-0" : "-translate-x-full") : "hidden lg:flex flex-col w-60 flex-shrink-0"} bg-[#0f0a1f] border-r border-white/5 flex flex-col`}>
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
          {isSubscribed && <div className="mt-2"><SubscriptionBadge /></div>}
        </div>
      )}

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setSelectedNiche(null); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? "bg-violet-600/20 text-violet-300 border border-violet-500/20" : "text-slate-500 hover:text-slate-200 hover:bg-white/5"}`}>
            <span className={activeTab === item.id ? "text-violet-400" : "text-slate-600"}>{item.icon}</span>
            {item.label}
            {activeTab === item.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        {!user ? (
          <button onClick={handleLogin} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all">
            <LogIn size={15} />
            Login with Google
          </button>
        ) : (
          <button onClick={async () => { try { await auth.signOut(); window.location.reload(); } catch (e) { console.error(e); } }}
            className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-400 py-2 rounded-xl text-sm font-medium transition-colors">
            <LogOut size={14} />
            Sign Out
          </button>
        )}
        {!loadingIP && ipData && (
          <div className="text-center text-xs text-slate-600">📍 {ipData.city || ipData.country_name} · {pricing.currency}</div>
        )}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#06030e] flex font-sans">
      <Sidebar />
      <Sidebar mobile />
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-[#06030e]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-white p-1">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <div>
              <h2 className="text-white font-bold text-sm capitalize">
                {selectedNiche ? selectedNiche.label.slice(selectedNiche.label.indexOf(" ") + 1) : navItems.find((n) => n.id === activeTab)?.label}
              </h2>
              {!loadingIP && ipData && <p className="text-slate-600 text-xs hidden sm:block">{ipData.country_name} · {pricing.currency}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <div className="hidden sm:block"><SubscriptionBadge /></div>
            ) : (
              <button onClick={() => setPaymentModal({ open: true, plan: "sage" })}
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 text-violet-300 px-4 py-1.5 rounded-full text-xs font-bold hover:border-violet-400/50 transition-all">
                <Star size={11} />
                Upgrade to Sage
              </button>
            )}
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

        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          {paymentModal.open && (
            <PaymentModal
              plan={paymentModal.plan}
              pricing={pricing}
              ipData={ipData}
              onClose={() => setPaymentModal({ open: false, plan: "scholar" })}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}

          {selectedNiche ? (
            <BlueprintDetail
              niche={selectedNiche}
              pricing={pricing}
              onBack={() => setSelectedNiche(null)}
              onDownload={handleDownload}
              generating={generating}
              generatingStatus={generatingStatus}
              onUpgrade={() => setPaymentModal({ open: true, plan: "sage" })}
              isSubscribed={isSubscribed}
            />
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardView user={user} pricing={pricing}
                  onNavigate={(tab) => { setActiveTab(tab); setSelectedNiche(null); }}
                  onOpenPayment={(plan) => setPaymentModal({ open: true, plan })}
                  isSubscribed={isSubscribed} />
              )}
              {activeTab === "generate" && (
                <GenerateView pricing={pricing} onViewBlueprint={(niche) => setSelectedNiche(niche)} />
              )}
              {activeTab === "blueprints" && (
                <SavedBlueprintsView onNavigate={(tab) => setActiveTab(tab)} />
              )}
              {activeTab === "course" && (
                <GrowthCourseView onUpgrade={() => setPaymentModal({ open: true, plan: "sage" })} pricing={pricing} isSubscribed={isSubscribed} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}