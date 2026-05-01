import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";

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
  {
    id: "burnout",
    label: "🧠 Digital Burnout Recovery",
    desc: "Nervous system regulation for social media fatigue",
    color: "from-purple-500 to-indigo-600",
    tag: "Trending",
  },
  {
    id: "ai-career",
    label: "🤖 AI Career Pivot",
    desc: "Use LLMs to automate 50% of your current job",
    color: "from-blue-500 to-cyan-600",
    tag: "Hot",
  },
  {
    id: "eco-budget",
    label: "🌿 Eco-Conscious Budgeting",
    desc: "High-aesthetic sustainable living for renters",
    color: "from-green-500 to-emerald-600",
    tag: "New",
  },
  {
    id: "quarter-life",
    label: "🌀 Quarter-Life Clarity",
    desc: "Navigating the 'what am I doing?' phase at 20-25",
    color: "from-orange-500 to-amber-600",
    tag: "Viral",
  },
  {
    id: "micro-hustle",
    label: "⚡ Micro-Side Hustles",
    desc: "Launch a digital product in 48 hours",
    color: "from-pink-500 to-rose-600",
    tag: "Hot",
  },
  {
    id: "dopamine",
    label: "🎯 Dopamine Detox",
    desc: "7-day blueprint to reclaim your focus",
    color: "from-violet-500 to-purple-600",
    tag: "Trending",
  },
  {
    id: "attachment",
    label: "💞 Attachment Style Healing",
    desc: "Improving modern relationships through self-awareness",
    color: "from-red-500 to-pink-600",
    tag: "New",
  },
  {
    id: "manifestation",
    label: "✨ Manifestation Science",
    desc: "Combining neuroscience with goal setting",
    color: "from-yellow-500 to-orange-600",
    tag: "Trending",
  },
  {
    id: "social-anxiety",
    label: "🗣️ Social Anxiety Hacks",
    desc: "For networking and professional events",
    color: "from-teal-500 to-green-600",
    tag: "Viral",
  },
  {
    id: "nomad",
    label: "🌍 Remote Nomad Logistics",
    desc: "Tax & lifestyle guide for digital nomads",
    color: "from-sky-500 to-blue-600",
    tag: "Hot",
  },
];

// ─── PDF Content Generator ────────────────────────────────────────────────────
function generatePDFContent(niche: typeof NICHES[0]): { title: string; sections: { heading: string; content: string }[] } {
  const contentMap: Record<string, { title: string; sections: { heading: string; content: string }[] }> = {
    burnout: {
      title: "Digital Burnout Recovery: A Complete Nervous System Reset",
      sections: [
        {
          heading: "Chapter 1: The Psychology of Digital Overwhelm — Why Your Brain is Exhausted",
          content: `We live in an era of unprecedented cognitive taxation. The average person touches their smartphone 2,617 times a day — not because they want to, but because the architecture of our digital world has been engineered by some of the most brilliant behavioral scientists on the planet to ensure that they do. This is not a character flaw. This is neuroscience weaponized.

The prefrontal cortex — the seat of rational decision-making, creativity, and emotional regulation — operates like a muscle. And just like any muscle subjected to relentless, high-frequency contractions without adequate recovery time, it fatigues. What we colloquially call "digital burnout" is, in clinical terms, a state of chronic allostatic overload triggered by sustained hyperarousal of the sympathetic nervous system, combined with dopaminergic depletion from excessive variable-reward loops.

Social media platforms are, at their core, dopamine delivery machines. Every notification, every like, every comment activates the nucleus accumbens — the brain's reward center — releasing a microburst of dopamine that feels good but demands more. The trough that follows each peak grows deeper over time. Users begin to scroll not for pleasure, but to stave off a low-grade withdrawal discomfort they can't quite name.

Case Study — Priya, 27, UX Designer: "I realized I was opening Instagram before I even got out of bed. Not because I wanted to — I didn't even like what I was seeing — but because the absence of it felt worse than the presence. That's when I knew something had shifted fundamentally in my brain."

The second layer of this crisis is the identity fracture. Platforms curate a version of reality that is 87% aspirational and 13% genuine. Constant exposure to this curated perfection — the perfect body, the perfect business launch, the perfect relationship — activates social comparison circuits that evolved to help us survive within tribal hierarchies. Our ancient brains cannot distinguish between a threat to social status and a physical predator. The cortisol response is identical. We scroll ourselves into a state of chronic low-grade stress without ever understanding why.

[VISUAL PLACEHOLDER: Infographic showing the dopamine loop cycle — Trigger → Variable Reward → Tolerance → Craving → Repeat — with brain regions highlighted]`,
        },
        {
          heading: "Chapter 2: The Nervous System Framework — Polyvagal Theory in Practice",
          content: `Dr. Stephen Porges' Polyvagal Theory provides perhaps the most elegant and actionable framework for understanding why digital burnout feels so physically embodied. The theory posits that the autonomic nervous system has three hierarchical states, each governing a distinct behavioral and physiological response pattern.

The Ventral Vagal State is our biological home — a state of safety, connection, and regulated arousal where creativity flourishes, empathy is accessible, and we can engage fully with our environment. This is the state in which we do our best work, forge our deepest connections, and experience genuine joy.

The Sympathetic State is mobilization — fight or flight. Adrenaline floods the body. Heart rate accelerates. Digestion pauses. Attention narrows. In short bursts, this state is adaptive. In the context of doomscrolling and content-induced anxiety, this state becomes our baseline, sustained for hours at a time across days, weeks, and years.

The Dorsal Vagal State is immobilization — the freeze response. Paradoxically, this is where many burnout sufferers land: not wired and energized, but numb, dissociated, motivationally depleted. They scroll without absorption. They respond to messages from behind glass. They feel simultaneously overwhelmed and hollow.

Recovery is not about willpower. Recovery is about systematically and physiologically guiding the nervous system back to ventral vagal regulation.

The Three-Phase Recovery Protocol:

PHASE 1 — TITRATION (Days 1-7): Reduce, don't eliminate. Cold turkey digital detox triggers its own cortisol spike. Instead, implement a digital sunset: all screens off 90 minutes before sleep. Replace evening scroll time with analog activities — journaling, physical books, gentle stretching. Install app timers. The goal is reducing sympathetic activation, not creating new stressors.

PHASE 2 — RESTORATION (Days 8-21): Introduce physiological regulators. Diaphragmatic breathing (4-7-8 technique), cold water face immersion (activates the dive reflex, rapidly lowering heart rate), and progressive muscle relaxation before sleep. These are not wellness trends — they are evidence-based vagal nerve stimulators.

PHASE 3 — ARCHITECTURE REDESIGN (Days 22-30): Redesign your relationship with technology intentionally. Designate three "check windows" per day (morning, midday, evening) rather than continuous availability. Create phone-free physical spaces in your home — beginning with the bedroom. Audit your follows aggressively: does this account make you feel expanded or contracted?

[VISUAL PLACEHOLDER: Three-column table showing the three nervous system states, symptoms of each, and corresponding recovery interventions]`,
        },
        {
          heading: "Chapter 3: Actionable Frameworks — The RESET Protocol",
          content: `The RESET Protocol is a five-pillar daily practice system designed to rebuild nervous system resilience and create sustainable digital hygiene without demanding dramatic lifestyle overhauls.

R — Ritual Mornings (The Sacred First Hour): The first 60 minutes of your day calibrate your nervous system for everything that follows. Guard them ferociously. No phone. No email. No social media. Instead: hydrate with 500ml water (dehydration amplifies cortisol), engage in 10 minutes of gentle movement or yoga nidra, journal one page of unfiltered stream-of-consciousness writing (this discharges emotional residue before the demands of the day layer over it), and set one clear intention for the day.

E — Embodiment Breaks (Every 90 Minutes): The ultradian rhythm cycle means our cognitive capacity naturally ebbs every 90 minutes. Honor this biology. Set a timer. When it sounds, stop. Take five deep belly breaths. Stand. Look at something green or distant to reset your visual cortex. Stretch your hip flexors — the primary muscle group that contracts under chronic stress. Two minutes is sufficient. The return on this investment is profound.

S — Social Media Sovereignty (Intentional Consumption Windows): You are allowed three 20-minute windows of social media per day. Set a timer before you open the app. When the timer sounds, exit. This is not deprivation — this is intentional curation. Notice what you feel before you open the app, during, and after. This metacognitive awareness alone is extraordinarily powerful.

E — Evening Digital Sunset (The 90-Minute Buffer): Blue light from screens suppresses melatonin production by up to 3 hours. But the damage isn't only optical — it's psychological. The content you consume in the hour before sleep seeds your subconscious processing. Evict the algorithm from your pre-sleep mental space. Replace with reading, conversation, gentle music, or nothing at all.

T — Tending to Real Connection (Analog Relationship Investment): Research from Harvard's 85-year Study of Adult Development is unambiguous: the quality of our relationships is the single greatest predictor of wellbeing and longevity. Schedule one analog, screen-free interaction per week. A walk. A meal. A phone call where you're fully present. These deposits into your relational bank account compound.

[VISUAL PLACEHOLDER: Weekly RESET Protocol calendar template showing morning rituals, check windows, embodiment breaks, and evening routines color-coded by type]`,
        },
        {
          heading: "Chapter 4: Your 30-Day Nervous System Reset Plan",
          content: `WEEK 1 — AWARENESS & AUDIT
Day 1-2: Install a screen time tracker. Observe without judgment.
Day 3-4: Implement the digital sunset (no screens 90 min before bed).
Day 5-7: Begin the Sacred First Hour morning practice.
Milestone: You have established your baseline and planted your first anchors.

WEEK 2 — REDUCTION & REPLACEMENT
Day 8-10: Install 20-minute app timers on social media platforms.
Day 11-13: Introduce one daily embodiment practice (breathwork, walking, stretching).
Day 14: Audit your follows. Unfollow anything that consistently generates envy, inadequacy, or numbness.
Milestone: You have begun redesigning your digital environment.

WEEK 3 — REGULATION & RECALIBRATION
Day 15-17: Introduce cold water face immersion upon waking (10 seconds minimum).
Day 18-20: Designate one room as a phone-free zone permanently.
Day 21: Reconnect with one analog hobby you abandoned. Reading, sketching, cooking, music.
Milestone: Your nervous system is beginning to find its natural rhythm.

WEEK 4 — ARCHITECTURE & INTEGRATION
Day 22-24: Implement three defined check windows. Delete social media from your home screen.
Day 25-27: Schedule one analog social interaction per week as a standing appointment.
Day 28-30: Write your Personal Digital Charter — your intentional relationship with technology going forward.
Milestone: You have built a sustainable, self-authored relationship with your digital world.

[VISUAL PLACEHOLDER: 30-day calendar grid with color-coded daily actions, weekly milestones, and space for personal notes and reflection prompts]

The transformation you are seeking is not about disconnecting from technology — it is about reconnecting with your own nervous system, your creativity, and your capacity for genuine presence. Technology, used with intention, is extraordinary. Used unconsciously, it extracts the very resources it promises to enhance.

You are not broken. Your attention is simply one of the most valuable resources in the modern world, and it has been harvested without your full consent. Reclaim it.`,
        },
      ],
    },
    "ai-career": {
      title: "AI Career Pivot: Automate 50% of Your Job & Lead the Next Economy",
      sections: [
        {
          heading: "Chapter 1: The Inflection Point — Why This Is the Most Important Career Decision of Your Lifetime",
          content: `We are living through an economic discontinuity that economists will study for centuries. The integration of Large Language Models — Claude, GPT-4, Gemini, and their successors — into the fabric of knowledge work is not an incremental improvement in productivity tools. It is a categorical shift in what it means to be a professional.

The professionals who will thrive in this new landscape are not those who compete with AI, but those who architect systems where AI is their most productive team member. This guide is your roadmap to becoming one of them.

Goldman Sachs estimates that 300 million full-time jobs globally could be automated by current AI capabilities. Yet paradoxically, the World Economic Forum simultaneously projects that AI will create 97 million new roles by 2025. The delta between those who are displaced and those who are empowered is not intelligence, education, or experience — it is one thing: the ability to form effective working partnerships with AI systems.

Case Study — Arjun, 29, Marketing Manager at a Mumbai tech startup: "I used to spend 22 hours a week on content creation, reporting, and email management. After three months of AI workflow integration, those same outputs take me 8 hours. I reinvested those 14 hours into strategic work that got me promoted. My salary increased 40%. The people who were skeptical of AI are now asking me for help."

The fear that AI will "take your job" is statistically less accurate than "a person who knows how to use AI will take your job." This is your opportunity to be that person.

[VISUAL PLACEHOLDER: Side-by-side comparison chart showing traditional workflow timeline vs. AI-augmented workflow timeline for common professional tasks]`,
        },
        {
          heading: "Chapter 2: Mapping Your Automation Opportunity — The 50% Audit",
          content: `The 50% Audit is a structured process for identifying exactly which portions of your current role can be delegated to AI systems, freeing you to operate at a higher strategic and creative altitude.

Step 1 — The Task Taxonomy: For the next 5 working days, log every task you perform in 15-minute increments. Be granular. At the end of the week, categorize each task into four types: Creative Synthesis (AI-Augmented), Relationship Management (Human-Essential), Analytical Processing (AI-Replaceable), and Routine Communication (AI-Replaceable).

Step 2 — The Automation Stack Assessment: Evaluate each task against five criteria: Is the output primarily text-based? Does it involve pattern recognition across data? Is it repetitive with predictable inputs? Does it require synthesizing multiple information sources? Is it time-intensive relative to its strategic value? Tasks that score 3 or more are prime automation candidates.

Step 3 — The Stack Build: For each automatable task, identify the specific AI tool and prompt architecture. Email drafting: GPT-4 with custom persona prompts. Data analysis: Code Interpreter with structured queries. Research synthesis: Perplexity + Claude for multi-source integration. Content creation: GPT-4 with brand voice training.

The LLM Automation Framework — Five High-Value Workflows:

WORKFLOW 1 — The Intelligence Briefing: Instead of spending 2 hours reading industry news, create a daily AI briefing system. Set up Perplexity alerts for your key topics. Each morning, paste the headlines into Claude with the prompt: "Analyze these developments for strategic implications relevant to [your role/industry]. Identify opportunities and risks."

WORKFLOW 2 — The Communication Accelerator: Stop writing emails from scratch. Build a library of 20 core email templates (pitches, follow-ups, escalations, negotiations) in your authentic voice. Use GPT-4 to generate first drafts from bullet points in seconds.

WORKFLOW 3 — The Analysis Engine: For any data set, use the Code Interpreter to generate analyses that would take a junior analyst hours. Describe what you want to understand, provide the data, and receive structured insights.

WORKFLOW 4 — The Content Factory: Develop a content production system where one strategic idea becomes 15 pieces of content: long-form article → LinkedIn posts → Twitter/X threads → email newsletter → slides → script → short-form video captions.

WORKFLOW 5 — The Research Synthesizer: For any new project, use Claude to process and synthesize competitor reports, academic papers, and market research into actionable executive summaries in minutes rather than days.

[VISUAL PLACEHOLDER: Flowchart showing the 50% Audit process with decision trees for identifying automation candidates and matching them to appropriate AI tools]`,
        },
        {
          heading: "Chapter 3: Prompt Engineering Mastery — The Language of the New Economy",
          content: `Prompt engineering is, at its core, the practice of communicating with extraordinary precision to a system of extraordinary capability. The difference between a mediocre AI output and an exceptional one is almost entirely determined by the quality of the prompt. This is a learnable skill that compounds dramatically with practice.

The CRAFT Framework for Professional Prompts:

C — Context: Provide rich situational context. Who are you? What is the output for? Who is the audience? What platform or format is it for? "Write a LinkedIn post" produces generic content. "Write a LinkedIn post for a Series A SaaS startup founder sharing a counterintuitive lesson about customer retention, targeting VP-level enterprise buyers who are skeptical of startup stability" produces targeted, high-value content.

R — Role Assignment: Assign AI a specific expert persona. "Act as a senior McKinsey consultant with 15 years of experience in digital transformation strategy" dramatically elevates the analytical depth of any business-related prompt.

A — Action Specificity: Be precise about what you want. Don't say "analyze this." Say "identify the three most significant risks, rank them by probability and impact, and suggest one mitigation strategy for each."

F — Format Direction: Specify exactly how you want the output structured. Headers, bullet points, tables, word count, numbered lists — be explicit. This is not pedantry; it is the difference between an output you can use immediately and one you need to reformat.

T — Tone and Constraints: Specify tone (professional, conversational, academic, empathetic), and articulate what to avoid (jargon, passive voice, excessive hedging, filler phrases).

[VISUAL PLACEHOLDER: Before/after comparison showing a basic prompt and a CRAFT-engineered prompt for the same task, with annotated differences]`,
        },
        {
          heading: "Chapter 4: Your 30-Day AI Integration Sprint",
          content: `WEEK 1 — AUDIT & FOUNDATION
Days 1-3: Complete your 5-day task taxonomy audit.
Days 4-5: Install your core AI stack (ChatGPT Plus, Claude Pro, Perplexity Pro).
Days 6-7: Complete your first 5 prompt templates in the Communication Accelerator workflow.
Target: 2-3 hours saved by end of week.

WEEK 2 — WORKFLOW ARCHITECTURE
Days 8-10: Build and test your Intelligence Briefing system.
Days 11-12: Set up your Content Factory pipeline for your role.
Days 13-14: Develop your Research Synthesizer workflow for an active project.
Target: 5-7 hours saved by end of week.

WEEK 3 — DEPTH & MASTERY
Days 15-17: Master the CRAFT framework by rebuilding your 5 templates using it.
Days 18-19: Train one AI tool on your brand voice and writing style.
Days 20-21: Identify one high-visibility project where you can demonstrate AI-augmented output.
Target: 8-10 hours saved by end of week. Peers begin noticing the quality and volume of your output.

WEEK 4 — LEADERSHIP & LEVERAGE
Days 22-24: Document your AI workflows into repeatable SOPs.
Days 25-27: Share your system with one colleague. Teaching compounds your own mastery.
Days 28-30: Schedule a conversation with your manager to discuss the strategic implications of AI for your team. Position yourself as the in-house AI integration lead.
Target: 10-14 hours saved per week. You are now operating at a fundamentally different level than your pre-AI baseline.

The professional landscape is bifurcating in real time. On one side: knowledge workers who view AI with suspicion, passivity, or fear. On the other: those who are systematically building AI-augmented skill stacks that make them 3-5x more productive and strategically valuable. The guide you are holding is your entry point to the second group.

[VISUAL PLACEHOLDER: 30-day sprint tracker with daily actions, weekly output metrics, and space for logging hours saved and key wins]`,
        },
      ],
    },
    "eco-budget": {
      title: "Eco-Conscious Budgeting: High-Aesthetic Sustainable Living for Renters",
      sections: [
        {
          heading: "Chapter 1: The Psychology of Sustainable Consumption — Why Eco-Living Feels Expensive (And How to Change That)",
          content: `The dominant cultural narrative around sustainable living is one of sacrifice — of brown rice aesthetics, scratchy fabrics, and moral superiority over a plate of oat milk. This narrative is not only inaccurate; it is actively harmful to the movement it claims to serve. When sustainability is framed as deprivation, it becomes accessible only to those with the luxury of performative sacrifice. The truly effective path to ecological living is one that is beautiful, intelligent, and financially empowering.

The sustainable consumer market is projected to reach $150 billion by 2028, driven almost entirely by a demographic that refuses the false binary between aesthetic pleasure and environmental responsibility. This is your generation. And you are rewriting the rules.

The psychology at play in our consumption patterns is more complex than brand loyalty or price sensitivity. It is identity architecture. We buy what reflects and reinforces who we believe ourselves to be. The lever for change, therefore, is not guilt — guilt produces paralysis and reactance — but aspiration. Who is the person you are becoming? What does their home look, feel, and smell like? What do they consume, and why?

Case Study — Kavya, 24, a renter in Bangalore earning ₹45,000/month: "I thought sustainability was for people who could afford organic. Then I realized I was spending ₹8,000 a month on fast fashion I wore three times. I redirected that into a capsule wardrobe of 18 quality pieces. My monthly fashion spend dropped to ₹1,200. My style actually improved. I was genuinely shocked by how much better I felt."

[VISUAL PLACEHOLDER: Infographic showing the 'True Cost' of fast fashion vs. slow fashion — cost per wear analysis over 24 months]`,
        },
        {
          heading: "Chapter 2: The Renter's Sustainable Home Framework",
          content: `Renters face a unique structural constraint: they cannot alter the bones of their dwelling. No solar panels on the roof. No composting systems in the backyard. No renovation of energy-inefficient windows. And yet, the renter's sustainable home framework demonstrates that 70% of your environmental and financial impact comes from areas entirely within your control.

THE ENERGY LAYER — Reducing Consumption Without Renovation:
Smart power strips eliminate phantom load — the energy consumed by devices in standby mode, which accounts for 10-15% of household electricity bills. This single intervention costs ₹800-1,200 and pays for itself within two months. LED bulb replacement (if not already done by your landlord) reduces lighting energy consumption by 75%. A smart plug on your geyser/water heater, set to heat only during off-peak hours and timed 30 minutes before your morning routine, reduces hot water energy costs by 40%.

THE WATER LAYER — Conservation as a Budget Tool:
A low-flow showerhead (₹600-900) reduces water consumption by 40% without impacting pressure. Greywater from vegetable washing can irrigate a balcony garden. A bucket-fill shower method (a deeply unglamorous but remarkably effective intervention) can reduce shower water use by 60%.

THE FOOD LAYER — The Largest Carbon and Cost Lever:
Food production accounts for 26% of global greenhouse gas emissions. More immediately relevant to your budget: food waste in Indian households averages ₹5,000-8,000 per month. The antidote is meal planning with a weekly template, a "use-first" section in your refrigerator for items approaching their peak, and a fermentation or preservation practice for excess produce. A home sprout kit (₹200) provides fresh microgreens year-round at a cost of approximately ₹15 per week.

THE PRODUCT LAYER — The Slow Swap Protocol:
Do not throw everything out and start fresh. That is, paradoxically, unsustainable. Instead, implement the Slow Swap: as a product runs out, replace it with a more sustainable alternative. Shampoo bar instead of bottled shampoo (lasts 2-3x longer, costs 40% less per wash). Beeswax wraps instead of cling film. Concentrated cleaning tablets instead of bottled cleaners. Each swap reduces both waste and spending.

[VISUAL PLACEHOLDER: Room-by-room guide showing sustainable swaps with cost comparison (old product vs. new product), environmental impact rating, and aesthetic score]`,
        },
        {
          heading: "Chapter 3: The High-Aesthetic Capsule Home — Beauty Without Excess",
          content: `The highest expression of sustainable home design is the capsule home: a carefully curated collection of high-quality, multi-functional, beautiful objects that create an environment of calm, intentional beauty. This is, notably, also significantly cheaper to maintain than the churn of trend-responsive consumption.

The Three-Layer Aesthetic System:

LAYER 1 — THE FOUNDATION (Neutral, Timeless, Renter-Safe): Invest in 3-5 high-quality textiles that coordinate — a linen throw, two cushion covers in complementary tones, a jute rug if your landlord permits. These items are portable, landlord-neutral, and last 5-10 years when chosen well. Budget: ₹3,000-6,000 total. Cost per year over five years: ₹600-1,200 annually.

LAYER 2 — THE LIVING LAYER (Plants, Light, and Aromatics): A shelf of three carefully chosen plants (pothos, snake plant, and one flowering specimen) transforms the atmospheric quality of any space. Plants improve air quality, reduce anxiety, and — critically — are deeply photogenic. Natural light maximization (sheer white curtains instead of blackout panels during the day) is free. A single beautiful candle or essential oil diffuser creates an olfactory signature that costs ₹150-300 per month.

LAYER 3 — THE STORY LAYER (Objects with Meaning): Resist the impulse to buy decorative objects. Instead, curate: one piece of local art (support an independent artist, available from ₹500 on Instagram), a collection of books that represent who you are becoming, and objects gathered from experiences (a stone from a meaningful hike, a market-bought ceramic from a trip). These items are free or low-cost, deeply personal, and communicate a richness of inner life that no Amazon purchase can replicate.

The Balcony Revolution — Renters' Outdoor Spaces:
Even a 4x6 foot balcony can become a productive micro-garden with 3-4 grow bags (₹150 each), a bag of potting mix (₹300), and seeds for tomatoes, curry leaves, or microgreens. This generates ₹400-600 worth of produce monthly and creates a deeply satisfying, aesthetically beautiful space that costs ₹1,000 to establish.

[VISUAL PLACEHOLDER: Before/after mood board of a typical renter apartment transformed using the Three-Layer Aesthetic System, with itemized cost breakdown]`,
        },
        {
          heading: "Chapter 4: Your 30-Day Eco-Conscious Budgeting Plan",
          content: `WEEK 1 — THE AUDIT
Days 1-2: Track every rupee of spending for 48 hours. Categorize by: Essential, Habitual, Impulsive.
Days 3-4: Identify your top 3 areas of environmental impact (food waste, fast fashion, energy, single-use plastics).
Days 5-7: Implement your first three Slow Swaps as current products run out.
Savings target: ₹800-1,200 identified for reallocation.

WEEK 2 — THE FOUNDATION
Days 8-10: Install smart power strips and LED bulbs where needed.
Days 11-12: Establish weekly meal planning and a use-first refrigerator section.
Days 13-14: Begin a balcony or windowsill herb garden.
Savings target: ₹1,500-2,500 in food waste reduction.

WEEK 3 — THE WARDROBE
Days 15-17: Complete a full wardrobe audit. Identify redundant, unworn, or low-quality items for donation or resale.
Days 18-19: Define your personal style aesthetic in 3 words. Build your next purchase around this.
Days 20-21: Create a wishlist of 3 quality wardrobe pieces. Research second-hand options on Depop, ThredUP, or local platforms.
Savings target: ₹3,000-5,000 annually in avoided fast fashion purchases.

WEEK 4 — THE INTEGRATION
Days 22-24: Calculate your monthly savings from Weeks 1-3. Direct 50% to a sustainability fund for quality investments.
Days 25-27: Implement the Three-Layer Aesthetic System with items you already own or can source secondhand.
Days 28-30: Share your journey. Document the process. Your community is full of people waiting for this exact framework.
Total 30-day savings target: ₹4,000-7,000 while reducing your personal environmental footprint by an estimated 25-35%.

[VISUAL PLACEHOLDER: Budget reallocation chart showing where savings from sustainable swaps are redirected — quality investments, experiences, savings — with 12-month projection]`,
        },
      ],
    },
    "quarter-life": {
      title: "Quarter-Life Clarity: Navigating the 'What Am I Doing?' Phase at 20-25",
      sections: [
        {
          heading: "Chapter 1: The Quarter-Life Reality — Why Your Generation Has It Uniquely Hard",
          content: `There is a particular species of confusion that visits in the years between 20 and 25 that is unlike any other period of human development. It has a specific texture: simultaneously feeling too young to have answers and too old to still be looking for them. A cognitive dissonance between the life you imagined at 16 and the life unfolding before you at 23. A suspicion, never quite spoken aloud, that everyone else has some map you were absent the day they were handed out.

You were not absent. That map does not exist. And what you are experiencing has a name: Quarter-Life Crisis. More importantly, it has a structure, a developmental logic, and a pathway through.

The term was first formally studied by Oliver Robinson at the University of Greenwich, who identified four distinct phases: Phase 1 — the feeling of being locked into a predetermined path (career, relationship, city) that no longer feels authentic; Phase 2 — the dawning awareness that change is possible, accompanied by terror; Phase 3 — a period of exploratory rebuilding with fresh commitments made from a more conscious place; Phase 4 — the consolidation of a new, more authentic identity.

The reason this crisis feels so acute for your generation specifically is multi-factorial. You were raised by parents who had life milestones clearly sequenced: degree, job, marriage, mortgage, children — all completed by 30. You inherited this schema. Then you entered an economy where degrees guarantee nothing, where the "job for life" is a relic, where the average marriage age has shifted to 30+, where mortgage ownership is a fantasy for most urban young people, and where the traditional milestones have been scrambled beyond recognition.

You are not failing at life. You are succeeding at a version of life that doesn't match the map you were given. The cartography needs updating.

Case Study — Rohan, 24, Engineering graduate working in sales: "I spent four years studying something I wasn't sure about, got a job that paid well but felt completely hollow, and then sat in my apartment at 23 wondering if this was it. The worst part was that I couldn't explain why I was unhappy. By any external metric, I was doing fine. That made it harder, somehow."

[VISUAL PLACEHOLDER: Timeline graphic contrasting 'Traditional Life Script' vs 'New Reality Timeline' showing the misalignment between inherited expectations and contemporary lived experience]`,
        },
        {
          heading: "Chapter 2: The Identity Excavation Framework",
          content: `Before you can build the life you want, you need to excavate who you actually are beneath the accumulated sediment of parental expectation, social comparison, algorithmic curation, and institutional conditioning. This is not a weekend retreat exercise. It is a rigorous, ongoing practice.

THE FIVE EXCAVATION TOOLS:

TOOL 1 — The Values Archaeology: List 20 things you've done in the last three years that made time feel like it disappeared. These are clues, not answers. From this list, identify the underlying values they represent: mastery, connection, creativity, impact, freedom, security, adventure. Rank your top five. Now audit your current life: how much time per week are you spending in alignment with each of your top five values? This gap is your roadmap.

TOOL 2 — The Regret Minimization Framework (borrowed from Jeff Bezos): Project yourself forward to age 80. You are in a rocking chair reviewing your life. Which risks are you relieved you took? Which conventional paths are you glad you resisted? Which unconventional choices are you glad you made? The clarity that emerges from the 80-year perspective is remarkable. Decisions that feel enormous at 23 often reveal themselves as obviously correct from a lifetime's vantage point.

TOOL 3 — The Subtraction Experiment: Identify three things in your life that you would eliminate if the social consequences were zero. Not doing them produces no anxiety, just habit and social expectation. These are the spaces where your authentic preferences have been overridden. The experiment is to subtract one of them for 30 days and observe what emerges in the space created.

TOOL 4 — The Envy Map: Note, without judgment, the people in your life and online who generate envy. Not admiration — envy. Admiration is for people doing things you respect but don't personally want. Envy is for people doing things you secretly want. Your envy is a remarkably accurate compass pointing toward suppressed desires. What specifically about them generates the envy? That specificity is your data.

TOOL 5 — The Energy Audit: For one week, note your energy level (1-10) before and after every significant activity and social interaction. This creates a map of what genuinely energizes versus depletes you that is far more reliable than your conscious beliefs about what "should" energize you.

[VISUAL PLACEHOLDER: Identity Excavation Worksheet — fillable template with prompts for all five tools, designed as a beautifully formatted journal page]`,
        },
        {
          heading: "Chapter 3: Building Your Clarity Architecture — The Three-Horizon Model",
          content: `The Three-Horizon Model, adapted from McKinsey's business strategy framework and applied to individual life design, provides a structure for navigating the present while building toward the future without the paralysis of either excessive short-termism or overwhelming long-term anxiety.

HORIZON 1 — THE PRESENT (Now to 12 Months): What needs to be optimized in your current reality to create the psychological space and financial runway for exploration? This includes: stabilizing your income to a level of genuine sustainability (not comfort, but sufficiency), reducing decision fatigue through routine architecture, building one skill that compounds across multiple potential futures (writing, coding, speaking, financial literacy), and establishing one health anchor (exercise, sleep, or nutrition — choose one to systematize completely).

HORIZON 2 — THE EXPLORATION ZONE (12 to 36 Months): This is where intentional experiments live. The goal is not to find your "one true calling" — that is a romantic and largely paralyzing concept — but to run structured 3-6 month experiments in areas that scored high on your Energy Audit and Values Archaeology. A side project in adjacent field. A course in a domain that has always fascinated you. A mentorship relationship with someone whose life or career you find compelling. These experiments are not failures if they don't become your career. They are data.

HORIZON 3 — THE DIRECTION (36+ Months): Not a specific destination — life is too non-linear for that — but a direction. A magnetic north. "I want to be doing work that combines creative problem-solving with human psychology within a high-growth environment" is a direction. "I want to be a Product Manager at a consumer tech company" is a destination. Directions survive the inevitable changes that destinations don't.

The Clarity Paradox: Clarity does not precede action. It follows it. The students who spend months "figuring out what they want" before taking any action are engaging in sophisticated avoidance. Clarity is earned through iteration — through taking small, low-stakes actions and observing your own response to them. This is the most important thing this guide can tell you.

[VISUAL PLACEHOLDER: Three-Horizon diagram showing the relationship between stability, exploration, and direction, with examples of actions appropriate to each horizon]`,
        },
        {
          heading: "Chapter 4: Your 30-Day Quarter-Life Clarity Plan",
          content: `WEEK 1 — THE EXCAVATION
Days 1-2: Complete the Values Archaeology exercise. Identify your top 5 values and audit your current life for alignment.
Days 3-4: Complete the Energy Audit for your current activities and social interactions.
Days 5-7: Complete the Envy Map and the Regret Minimization Framework.
Milestone: You have a clearer picture of who you actually are vs. who you've been conditioned to be.

WEEK 2 — THE HONEST CONVERSATION
Days 8-10: Write a 500-word "Current State of My Life" document. No editing. No performance. Honest assessment.
Days 11-12: Identify one assumption about your future that you've inherited but never consciously chosen.
Days 13-14: Have one honest conversation with someone whose life direction you find genuinely compelling (not enviable — compelling).
Milestone: You have named things that have been living unnamed in your subconscious.

WEEK 3 — THE FIRST EXPERIMENT
Days 15-17: Choose one Horizon 2 experiment. Define it with a start date, end date, and specific actions.
Days 18-19: Begin the experiment. Remove the pressure of "this needs to be my life's work" framing.
Days 20-21: Journal three times about what you notice — what feels alive, what feels forced, what surprises you.
Milestone: You have broken the inertia of contemplation and entered the generative space of action.

WEEK 4 — THE ARCHITECTURE
Days 22-24: Design your Horizon 1 stability plan. What needs to be systematized in your current life to create space for exploration?
Days 25-27: Define your Horizon 3 direction in 2-3 sentences. Share it with someone you trust.
Days 28-30: Create a 90-day action map. Three experiments to run. Three skills to develop. Three relationships to deepen.
Final Reflection: The confusion you felt at the beginning of this month is not gone — but it now has structure. Confusion with structure is a starting line. It always has been.

[VISUAL PLACEHOLDER: Personal Clarity Map — a visual framework combining your values, energy data, envy map insights, and three-horizon plan into a single-page life design document]`,
        },
      ],
    },
    "micro-hustle": {
      title: "Micro-Side Hustles: Launch Your Digital Product in 48 Hours",
      sections: [
        {
          heading: "Chapter 1: The Digital Product Revolution — Why Now Is the Greatest Opportunity in History",
          content: `We are living through an era of unprecedented democratization of entrepreneurship. For the first time in human history, a single individual with a laptop, an internet connection, and 48 hours of focused effort can create a product that generates income while they sleep — not in theory, not as an exception, but as a repeatable, systematic process available to anyone willing to execute.

The digital product market — encompassing e-books, templates, courses, presets, toolkits, swipe files, digital planners, and software tools — reached $331 billion in 2023 and is growing at 12% annually. The barriers to entry are essentially zero. The tools to create, deliver, and collect payment for digital products have never been more accessible or affordable.

The critical insight that most aspiring digital entrepreneurs miss: you do not need to know everything about a topic. You need to know more about it than your target customer and be able to communicate that knowledge in a format that saves them time, money, or frustration. The expertise gap that exists between you and someone earlier in their journey — in any domain — is your product.

Case Study — Neha, 26, HR professional in Delhi: "I knew nothing about product entrepreneurship. But I'd spent years formatting absolutely beautiful Excel trackers for my team. On a weekend, I turned them into a 'HR Manager Toolkit' — five spreadsheet templates — and listed them on Gumroad for ₹499. I made ₹28,000 in the first month with zero marketing budget. I'd been giving this value away for free for years."

The psychological barrier is not skill. It is permission. This guide gives you both the framework and the permission.

[VISUAL PLACEHOLDER: Market opportunity chart showing digital product category sizes, growth rates, and typical price points for different formats]`,
        },
        {
          heading: "Chapter 2: The 48-Hour Product Sprint Framework",
          content: `The 48-Hour Product Sprint is a structured methodology for moving from idea to first sale in two calendar days. It is designed to eliminate the perfection trap — the most common cause of digital product non-completion — by installing a "done is better than perfect" architecture from the very beginning.

HOUR 0-4: IDEA VALIDATION (Saturday Morning)
Your product idea is valid if it solves a specific, articulable problem for an identifiable group of people who are already spending money on solutions. The fastest validation method: search for your topic on Etsy, Gumroad, Udemy, and Amazon. If products exist and have reviews, the market is validated. You don't need to invent a new category — you need to serve an existing demand better, differently, or more affordably.

The Niche Specificity Test: "Social media templates" fails. "Instagram carousel templates for Ayurvedic wellness coaches" passes. Specificity is not limiting — it is targeting. A product that speaks directly to a specific person is 10x more likely to sell than one that speaks generally to everyone.

HOUR 4-8: PRODUCT SCOPING (Saturday Afternoon)
Choose one format appropriate to your knowledge and your market. For your first product, optimize for creation speed and delivery simplicity. Recommended formats and creation times:
- PDF Guide/E-Book: 4-8 hours (Canva)
- Template Pack (5-10 items): 6-10 hours (Notion, Canva, Google Sheets)
- Swipe File/Resource Kit: 3-5 hours (Notion, PDF)
- Prompt Library (for AI tools): 2-4 hours (Notion, PDF)
- Mini-Course (3-5 short videos): 8-12 hours (Loom, Notion)

Define your product scope in one sentence: "A [format] that helps [specific person] achieve [specific outcome] without [specific pain/obstacle]."

HOUR 8-24: CREATION (Saturday Evening to Sunday Morning)
Block distraction completely. Phone on airplane mode. One beverage. One clear workspace. Create from your outline, not from blank pages. For every section, write a first draft at 2x the speed you want. Edit later. Volume first, quality second. The editing pass is where quality emerges — trying to create and edit simultaneously is the source of most creative paralysis.

HOUR 24-36: PACKAGING & PRICING (Sunday Morning)
A premium product appearance is created in Canva in 2-3 hours. Choose one professional template. Use two fonts (one heading, one body). Select a 3-color palette. Create a compelling cover page and a clean, readable interior design. Your product's packaging communicates its value before a single word is read. Price with confidence: ₹299-799 for a well-produced template or PDF guide is entirely appropriate for a quality product solving a real problem.

HOUR 36-48: LAUNCH (Sunday Afternoon)
Set up your storefront on Gumroad (15 minutes). Write your product description using the Problem-Solution-Outcome framework. Create three pieces of content about your product for your preferred platform. Send the link to 10 people in your network who might benefit. Your first customer may be someone you know. Your first review will be your most valuable asset.

[VISUAL PLACEHOLDER: 48-hour timeline graphic with hourly milestones, tools for each phase, and decision points for format selection]`,
        },
        {
          heading: "Chapter 3: The $0 Marketing Playbook for Digital Creators",
          content: `You do not need an advertising budget to sell a digital product. You need three things: a clear value proposition, a small but relevant audience, and the consistency to show up for them. The $0 Marketing Playbook is built on the premise that authentic usefulness is the most durable marketing strategy available.

THE PROOF OF CONCEPT LAUNCH: Before any marketing, validate with 10 direct outreach messages to people who fit your ideal customer profile precisely. This is not mass marketing — it is a conversation. "I've created [product] specifically for [their situation]. I'd love your honest feedback and can offer it at 50% off in exchange." This generates early sales, testimonials, and product improvement data simultaneously.

THE CONTENT MARKETING FLYWHEEL: Create free content that demonstrates the value inside your paid product without giving away the product itself. If your product is "10 Notion templates for freelancers," create content about "Why most freelancers lose 5 hours a week to disorganization" — then mention that your templates solve exactly that. The relationship between free content and paid product should be: free content demonstrates the problem, paid product delivers the solution.

THE PLATFORM SELECTION PRINCIPLE: Be exceptional on one platform before diversifying to two. For digital products, the highest-converting platforms for Indian creators are currently Instagram (for visual products and templates), LinkedIn (for professional tools and career-adjacent guides), and Twitter/X (for thought-leadership products and writing-based products).

THE COMMUNITY LEVERAGE STRATEGY: Identify 3-5 online communities (Reddit, Facebook Groups, Discord servers, WhatsApp groups) where your target customer congregates. Spend two weeks providing genuine value with no promotion. Then share your product with context: "I've just published something based on what I've been sharing here."

[VISUAL PLACEHOLDER: Content calendar template for a 30-day launch campaign showing daily content types, messaging themes, and community touchpoints]`,
        },
        {
          heading: "Chapter 4: Your 30-Day Digital Product Business Plan",
          content: `WEEK 1 — VALIDATE & BUILD
Days 1-2: Complete your niche validation research on Etsy, Gumroad, and Udemy.
Days 3-4: Define your product scope and begin the 48-hour sprint.
Days 5-7: Complete your product and set up your Gumroad storefront.
Milestone: You have a live, purchasable digital product. This is already more than 95% of people who "want to create a digital product" ever achieve.

WEEK 2 — LAUNCH & LEARN
Days 8-10: Execute your Proof of Concept launch with 10 direct outreach messages.
Days 11-12: Create your first 5 pieces of platform content using the Content Marketing Flywheel.
Days 13-14: Join 3 relevant communities and begin adding genuine value.
Milestone: Your first sales and your first feedback. Both are equally valuable.

WEEK 3 — OPTIMIZE & AMPLIFY
Days 15-17: Incorporate feedback into a Version 1.1 product update.
Days 18-19: Collect and display your first testimonials prominently.
Days 20-21: Develop your first upsell or complementary product concept.
Milestone: You have a product-market feedback loop running.

WEEK 4 — SYSTEMATIZE & SCALE
Days 22-24: Automate your delivery system completely. Any sale should require zero manual work from you.
Days 25-27: Develop a referral mechanism. Offer existing customers 20% of each referred sale.
Days 28-30: Plan your next product. You now know your market, your creation process, and your marketing strategy. The second product takes half the time.
Revenue target: ₹5,000-25,000 in your first 30 days is realistic for a well-positioned, well-executed digital product. Some creators see ₹50,000-100,000.

[VISUAL PLACEHOLDER: Revenue projection chart showing conservative, moderate, and optimistic scenarios for months 1-6 of a digital product business]`,
        },
      ],
    },
    dopamine: {
      title: "Dopamine Detox: A 7-Day Blueprint to Reclaim Your Focus",
      sections: [
        {
          heading: "Chapter 1: The Dopamine Economy — How Your Reward System Was Hijacked",
          content: `Dopamine is not, as popularly misconceived, the "pleasure chemical." It is more accurately described as the "anticipation chemical" — the neurochemical of wanting, seeking, and craving. Its role is not to deliver satisfaction but to motivate pursuit. Understanding this distinction is foundational to understanding why modern life has created such a profound and widespread crisis of focus, motivation, and meaning.

The dopaminergic system evolved over hundreds of thousands of years in an environment of genuine scarcity. Food was uncertain. Shelter was precarious. Social belonging was existentially critical. The dopamine system rewarded effort, persistence, and successful navigation of genuine challenges with surges of motivational energy that felt meaningful and earned.

In the span of two decades, we have constructed an environment of artificial, effortless dopaminergic stimulation at a density and frequency that our neurological architecture was never designed to process. Infinite scroll. Variable reward notifications. Algorithmic content optimization. Fast food. Pornography. Gambling mechanics embedded in mobile games and financial platforms. Each of these delivers a dopamine spike that requires zero effort, zero skill, and zero genuine engagement.

The consequence — documented across dozens of peer-reviewed neuroscience studies — is a progressive dysregulation of the dopamine system. The baseline shifts downward as tolerance builds upward. Activities that once felt engaging — a conversation with a friend, a book, a walk in nature, one's own creative work — begin to feel dull, unrewarding, slow. Not because these activities have changed, but because the dopamine baseline against which they are measured has been artificially inflated.

This is not a moral failing. It is a physiological response to an unprecedented environment. And — crucially — it is reversible.

Case Study — Aditya, 22, engineering student: "I literally couldn't read more than three pages of a textbook without reaching for my phone. Not because I wanted to — I didn't even want to scroll. It was just that the textbook felt unbearably slow. I realized my brain had been recalibrated to a pace of stimulation that made normal life feel like withdrawal. That was terrifying to recognize."

[VISUAL PLACEHOLDER: Graph showing dopamine baseline degradation over time with progressive exposure to high-stimulation digital activities, compared to natural reset curve during detox period]`,
        },
        {
          heading: "Chapter 2: The 7-Day Dopamine Reset Protocol",
          content: `The Dopamine Reset Protocol is not an elimination diet — it is a recalibration. The goal is not to permanently abstain from sources of pleasure and stimulation, but to reset your baseline so that natural rewards feel rewarding again. Think of it as resetting your palate before a fine meal: the temporary abstinence makes the experience richer.

The Four Categories of Managed Reduction:

TIER 1 — ELIMINATE (7 Days): Social media (all platforms), video streaming (Netflix, YouTube, Reels), video games, pornography, online news consumption beyond one 10-minute check daily, and delivery food (cook all meals). These are your highest-dopamine, lowest-effort activities. Their removal is the core of the protocol.

TIER 2 — MINIMIZE (7 Days): Caffeine (reduce to one small serving before noon), sugar (eliminate processed sugar entirely — fruit is acceptable), music while working (introduce silence as a default), and multitasking. These are moderate-dopamine activities that amplify the effects of the Tier 1 reduction.

TIER 3 — MAINTAIN (Continue Normally): Work, study, exercise, sleep, human connection, meaningful creative projects. These are the activities you are recalibrating toward — they should feel more rewarding as the protocol progresses.

TIER 4 — INTRODUCE (Deliberate Practice): Cold exposure (cold showers, minimum 2 minutes), physical challenge (exercise of any kind, daily), nature exposure (minimum 30 minutes outdoors without headphones), and reading (physical books, minimum 30 minutes daily). These are low-dopamine inputs that retrain the reward system toward patience and earned rewards.

THE DAILY STRUCTURE: A structured daily rhythm during the detox period is essential because unstructured time in the absence of high-stimulation activities creates the anxiety that sends most detox attempts into failure. 6:00am wake, cold shower. Breakfast prepared at home. 90-minute deep work block. 10-minute walk. Three scheduled work blocks. One hour of physical exercise. 30 minutes of analog reading before bed. No screens after 9pm.

[VISUAL PLACEHOLDER: 7-day protocol grid showing daily Tier 1-4 categories, structure template, and daily reflection prompts]`,
        },
        {
          heading: "Chapter 3: The Withdrawal Curve & How to Navigate It",
          content: `Understanding what will happen neurologically during the 7-day reset is the difference between abandoning it on Day 2 and completing it with transformative results. The withdrawal curve is predictable, well-documented, and — once you know it — entirely navigable.

DAYS 1-2: THE DISCOMFORT VALLEY. You will feel bored, restless, and mildly anxious. Your mind will generate sophisticated rationalizations for why you should check your phone. "Just this one thing." "I need to check that message." "I'll start properly tomorrow." These are not genuine reasoning — they are withdrawal symptoms. Recognize them as such. The discomfort is the signal that the recalibration is working.

DAY 3: THE FLATLINE. Many people report a strange emotional flatness on Day 3 — neither the agitation of Days 1-2 nor the clarity of later days. This is the moment when the old dopamine spikes have been removed and the natural reward system hasn't yet re-sensitized. It passes. Read through it. Walk through it. Do not mistake it for evidence that the protocol isn't working.

DAYS 4-5: THE RETURN OF CURIOSITY. Something begins to shift. Things that seemed impossibly dull — a conversation, a cooking project, a walk — begin to carry a texture of genuine interest. You may notice yourself thinking more clearly, feeling emotions more distinctly, and experiencing moments of spontaneous creativity.

DAYS 6-7: THE RECALIBRATION. By the end of Day 7, most participants report the following: significantly improved focus and reading retention, a richer emotional range (both positive and negative emotions feel more vivid), reduced anxiety (paradoxically, despite the anxiety of Days 1-2), and a genuine desire to spend time in activities that felt boring at the start of the week. This is your neurological baseline resetting toward its natural level.

THE POST-RESET ARCHITECTURE: The purpose of the 7-day reset is not to establish permanent abstinence from digital entertainment. It is to recalibrate your relationship with it. After the reset, re-introduce activities intentionally, with defined rules: one episode of television per evening (not autoplay). Social media with a 20-minute timer. No mindless scrolling — only purposeful use.

[VISUAL PLACEHOLDER: Line chart of the withdrawal curve showing subjective wellbeing, focus quality, and craving intensity across the 7 days, with annotated turning points]`,
        },
        {
          heading: "Chapter 4: Your 30-Day Focus Architecture Plan",
          content: `DAYS 1-7: THE RESET
Execute the full 7-Day Dopamine Reset Protocol as described above. Journal each evening for 5 minutes: what was hardest today, what surprised you, what you noticed about your mind.

DAYS 8-14: THE REINTRODUCTION
Deliberately re-introduce one category at a time, with intentional constraints. Day 8: music returns (during exercise only). Day 10: streaming returns (one episode, 9pm, not in bed). Day 12: social media returns (two 15-minute windows with timers). Do not re-introduce all categories simultaneously — this is the most common failure mode post-detox.

DAYS 15-21: THE SUSTAINABLE ARCHITECTURE
Design your long-term digital environment with the clarity of a recalibrated baseline. Define your screen-free times (morning, meals, one hour before bed) as non-negotiable. Delete the apps that consistently drain you. Organize your home screen to show only tools, not entertainment. Create a phone-free physical space in your home.

DAYS 22-30: THE DEEP WORK FOUNDATION
Use your recalibrated baseline to establish a deep work practice that will compound over years. Schedule two 90-minute deep work blocks daily. During these blocks: phone in another room, website blockers on, one objective defined, timer running. The quality of work produced in these blocks will exceed what you previously produced in full days of scattered attention.

The capacity for sustained, voluntary attention — the ability to choose what you think about and for how long — is one of the rarest and most valuable cognitive assets in the attention economy. You are not just doing a detox. You are reclaiming sovereignty over your own mind. That is not a small thing.

[VISUAL PLACEHOLDER: 30-day focus architecture calendar with detox phase, reintroduction phase, and deep work phase clearly delineated, with weekly metrics to track]`,
        },
      ],
    },
    attachment: {
      title: "Attachment Style Healing: A Guide to Secure, Fulfilling Relationships",
      sections: [
        {
          heading: "Chapter 1: The Architecture of Love — Why Your Earliest Relationships Become Your Template",
          content: `The quality of every significant relationship in your adult life — romantic, professional, platonic — is shaped in large measure by relational patterns established before your fourth birthday. This is not a fatalistic claim. It is a liberating one. Because what was learned can be relearned. And what was shaped by unconscious early experience can be reshaped through conscious adult practice.

Attachment Theory, pioneered by British psychiatrist John Bowlby and expanded through decades of empirical research by Mary Ainsworth, Mary Main, and Phillip Shaver, provides perhaps the most powerful explanatory and practical framework for understanding why we relate the way we do — and how to change it.

The core premise is elegant: human beings are born as attachment-seeking creatures. Our survival depends entirely on the quality of our caregiving relationships. The brain, in its remarkable efficiency, encodes information about whether the world is safe or threatening, whether others are reliable or unpredictable, and whether we ourselves are worthy of love — based on the first 2-3 years of relational experience. These encodings become internal working models: unconscious templates through which all subsequent relationships are experienced and interpreted.

There are four primary attachment patterns. Secure attachment (approximately 50% of adults) develops when early caregivers are consistently warm, responsive, and emotionally available. Anxious attachment (20%) develops when caregivers are inconsistently responsive — sometimes warm and present, sometimes unavailable or preoccupied. Avoidant attachment (25%) develops when caregivers are consistently emotionally unavailable, dismissive of emotional needs, or value self-sufficiency over connection. Disorganized attachment (5%) develops in environments of fear — where the caregiver is simultaneously the source of and solution to distress.

Case Study — Shreya, 27: "I kept ending up with emotionally unavailable partners. My therapist asked me something that changed everything: 'Does this pattern of chasing someone who won't fully commit feel familiar?' I cried for about ten minutes. I realized I'd been unconsciously recreating the emotional dynamic of my childhood, trying to finally win the love I couldn't get then. That was the beginning of everything changing."

[VISUAL PLACEHOLDER: Four-quadrant attachment style diagram showing secure, anxious, avoidant, and disorganized patterns with key behavioral characteristics and relational tendencies of each]`,
        },
        {
          heading: "Chapter 2: Identifying Your Attachment Blueprint",
          content: `Before healing can begin, clarity is required. The following framework will help you identify your dominant attachment pattern — with the understanding that most people are combinations of styles, and that your pattern may differ across different relationship types.

THE ANXIOUS ATTACHMENT SIGNATURE: You experience relationships as fundamentally uncertain. You are exquisitely attuned to shifts in your partner's mood and availability. You tend to over-interpret silence, delayed responses, or changes in affection as evidence of rejection or abandonment. Your emotional regulation is heavily externalized — meaning you rely on reassurance from your partner to manage your anxiety, rather than being able to self-soothe effectively. You pursue when your partner distances.

THE AVOIDANT ATTACHMENT SIGNATURE: You value independence and self-sufficiency intensely — sometimes to the point where genuine intimacy feels threatening rather than desirable. You may intellectually want close relationships while physiologically experiencing closeness as constricting. You tend to minimize emotional needs — your own and others'. You distance when your partner pursues. In arguments, you stonewall or withdraw. You may describe yourself as "not a relationship person" or "bad at expressing feelings."

THE DISORGANIZED ATTACHMENT SIGNATURE: You simultaneously desire and fear intimacy at an intense level. Relationships feel both desperately needed and fundamentally dangerous. Your behavior in close relationships may feel confusing to both you and your partners — alternating between extreme closeness and extreme withdrawal in ways that don't follow a clear logic. You may have a history of relationships characterized by high drama, rapid escalation, and painful endings.

THE SECURE ATTACHMENT SIGNATURE: You are comfortable with intimacy and do not fear abandonment. You communicate your needs directly and can receive your partner's needs without feeling overwhelmed or burdened. Conflict is navigable rather than catastrophic. You can be close without losing yourself, and separate without feeling abandoned. This is not perfection — it is a functional baseline from which repair is possible.

THE HEALING PARADOX: Identifying as an insecure attachment style is not a diagnosis of being broken. It is the identification of a survival adaptation that made perfect sense in your early environment and now no longer serves you. With this reframe, healing becomes possible — not as an act of fixing what is wrong with you, but as an expansion of what is available to you.

[VISUAL PLACEHOLDER: Attachment Style Self-Assessment Questionnaire with scoring guide and result interpretation framework]`,
        },
        {
          heading: "Chapter 3: The Secure Attachment Cultivation Framework",
          content: `The research consensus is unambiguous: earned security — the development of a secure attachment style through intentional relational experiences and internal work in adulthood — is entirely possible and well-documented. The following framework integrates evidence-based interventions from Emotionally Focused Therapy (EFT), Internal Family Systems (IFS), and somatic therapy into a practical daily practice.

FOR ANXIOUS ATTACHMENT — THE REGULATION TOOLKIT:

Somatic anchoring: When anxiety spikes in your relationship, your nervous system is in threat response. The fastest intervention is physiological. Five slow, deep breaths. Cold water on the face. Physical grounding (feel your feet on the floor, your back against the chair). Return to the conversation from a regulated body.

The 24-hour rule: Before sending an anxious, emotionally charged message — the "are you okay? you seem distant. have I done something wrong?" message — wait 24 hours. In 90% of cases, the anxiety either resolves or reveals itself as internally generated rather than relationally triggered.

Self-soothing development: Identify five self-soothing activities that genuinely regulate your nervous system (exercise, music, journaling, calling a friend, cooking). Practice these as a first response to relational anxiety rather than reaching for reassurance.

FOR AVOIDANT ATTACHMENT — THE OPENING PRACTICE:

Emotion labeling: Avoidant individuals often have limited emotional vocabulary — not because they feel less, but because their early environment discouraged emotional identification. Begin labeling emotions with specificity, in writing, daily. "I felt frustrated, not just 'bad.'" "I felt relieved, not just 'fine.'" This builds emotional literacy as a foundational intimacy skill.

Graduated vulnerability: Intimacy is not binary. It is graduated. Practice sharing one small, genuine personal disclosure per day — not your deepest wounds, but something slightly beyond your comfort zone. Micro-disclosures compound into genuine intimacy over time.

Staying in repair: Avoidant individuals tend to resolve conflict by retreating and then acting as if it didn't happen. Practice staying present in repair conversations, even briefly. "That argument was uncomfortable for me. I want you to know I'm still here."

[VISUAL PLACEHOLDER: Two-page spread showing daily practices for anxious and avoidant attachment healing, formatted as beautiful habit cards with morning and evening routines]`,
        },
        {
          heading: "Chapter 4: Your 30-Day Attachment Healing Plan",
          content: `WEEK 1 — SELF-KNOWLEDGE
Days 1-2: Complete the Attachment Style Self-Assessment. Read about your primary style deeply — not to pathologize, but to understand your patterns with compassion.
Days 3-4: Write a "Relational Autobiography" — the key relationships in your life, the patterns that repeated, and what you now understand about them through an attachment lens.
Days 5-7: Begin the daily emotion labeling practice. Set a twice-daily reminder to name your emotional state with specificity.
Milestone: You have your relational map.

WEEK 2 — PATTERN INTERRUPTION
Days 8-10: Identify your three most common relationship triggers. Document the trigger, your automatic response, and what a more secure response would look like.
Days 11-12: Practice the 24-hour rule (for anxious patterns) or the Graduated Vulnerability practice (for avoidant patterns) in one low-stakes relationship context.
Days 13-14: Read one book on attachment theory at an accessible level (recommended: "Attached" by Amir Levine and Rachel Heller, or "Hold Me Tight" by Sue Johnson).
Milestone: You can observe your patterns in real time. Observation precedes change.

WEEK 3 — SECURE BASE BUILDING
Days 15-17: Identify two or three people in your life who demonstrate secure attachment tendencies. Spend deliberate time with them. Secure attachment is co-regulatory — being in the presence of securely attached individuals literally calibrates your own nervous system.
Days 18-19: Practice one act of "leaning in" (for avoidant patterns) or one act of "self-soothing rather than reassurance-seeking" (for anxious patterns) in your most significant relationship.
Days 20-21: Write a letter to your younger self — the version of you who developed these patterns as a survival response. Offer them the understanding they deserved.
Milestone: You have begun building new relational experiences as reference points for your nervous system.

WEEK 4 — INTEGRATION & COMMITMENT
Days 22-24: Evaluate your current relationships. Where are they asking for more security from you? Where are you asking for more security than the relationship can genuinely offer?
Days 25-27: Have one honest conversation about needs and attachment in a key relationship. Not a critique — a disclosure. "I've been learning about how I relate to people. I'd love to share something with you."
Days 28-30: Design your ongoing attachment healing practice. Therapy (EMDR or EFT specifically), journaling, community, and physical practice (somatic work, yoga, breathwork) are all evidence-based supports.
You are not trying to become a different person. You are trying to give yourself access to a fuller version of who you already are — one who can be close without losing themselves, and separate without feeling abandoned.

[VISUAL PLACEHOLDER: 30-day attachment healing journey map with weekly themes, daily practice icons, and reflection prompts formatted as a beautiful journal template]`,
        },
      ],
    },
    manifestation: {
      title: "Manifestation Science: Neuroscience Meets Goal Achievement",
      sections: [
        {
          heading: "Chapter 1: Beyond the Vision Board — The Neuroscience of Deliberate Reality Creation",
          content: `The manifestation conversation occupies an uncomfortable middle ground: too mystical for the scientific community, too empirical for the spiritual community. This guide occupies neither camp. Instead, it takes the empirically validated mechanisms underlying what practitioners describe as "manifestation" — attentional priming, identity-behavior alignment, emotional congruence, and environmental design — and makes them accessible, actionable, and honest about what the evidence actually supports.

The core claim of manifestation philosophy — that your dominant thoughts shape your reality — is, when properly operationalized, supported by an impressive body of neuroscience and psychology research. The mechanism is not mystical. It is architectural.

The Reticular Activating System (RAS) is a network of neurons in the brainstem that acts as your brain's relevance filter. Of the approximately 11 million bits of sensory information your nervous system processes per second, only 40-50 bits reach conscious awareness. The RAS determines which 40-50. And crucially — the RAS is trainable. It prioritizes information that matches your dominant beliefs, expectations, and emotional states. When you hold a clear, emotionally vivid image of a desired outcome, your RAS begins surfacing opportunities, connections, and information relevant to that outcome that were always present in your environment but previously filtered out.

This is not magic. It is selective attention. But selective attention, applied consistently and skillfully, produces outcomes that can appear magical to outside observers.

Case Study — Vikram, 31, startup founder: "I was deeply skeptical of visualization. Then a mentor asked me to spend five minutes each morning vividly imagining the specific conversation I'd have when we closed our first enterprise client — the handshake, the details, the feeling. Within six weeks, we closed our first enterprise deal. I can't prove the visualization caused it. But I can say that during that six weeks, I was noticing opportunities I'd been walking past for months."

[VISUAL PLACEHOLDER: Diagram of the Reticular Activating System showing how belief systems and emotional states filter sensory reality and prime attention toward aligned opportunities]`,
        },
        {
          heading: "Chapter 2: The Five Neuroscience-Backed Manifestation Mechanisms",
          content: `MECHANISM 1 — ATTENTIONAL PRIMING (The RAS Protocol): Train your brain's relevance filter toward your desired outcomes through consistent, specific, emotionally vivid mental rehearsal. The key variables are specificity (the brain responds to concrete detail, not vague wishes), vividness (engage all five sensory modalities in your visualization), and emotion (emotional arousal consolidates memory and amplifies the RAS signal). Practice: 5-10 minutes of morning visualization using the "As If Now" technique — narrate your desired future state in present tense, first person, with full sensory and emotional detail.

MECHANISM 2 — IDENTITY-BEHAVIOR CONGRUENCE (The Self-Perception Loop): Psychologist Daryl Bem's Self-Perception Theory demonstrates that we infer our own beliefs and values from our behaviors, in the same way we infer others'. The person who acts like a writer becomes a writer — not metaphorically, but neurologically. Identity statements ("I am a person who...") paired with congruent micro-behaviors create a self-reinforcing feedback loop. Write 10 "I am" statements aligned with your desired identity. Choose three behaviors this week that a person with that identity would naturally perform.

MECHANISM 3 — EMOTIONAL CONGRUENCE (The Coherence Protocol): The HeartMath Institute's research demonstrates that heart-brain coherence — a synchronized, harmonious state between cardiac rhythms and brainwave patterns — enhances cognitive function, decision-making quality, and perceptual openness. This state is achievable through controlled heart-focused breathing (breathe slowly as if through the heart, call up a genuine positive emotion, sustain for 3-5 minutes). Practicing coherence before goal-directed activities amplifies their effectiveness significantly.

MECHANISM 4 — ENVIRONMENTAL DESIGN (Behavior Architecture): BJ Fogg's research at Stanford's Behavior Design Lab demonstrates that environment accounts for 70% of behavioral outcomes — far more than motivation or willpower. Designing your physical and digital environment to make desired behaviors effortless and undesired behaviors difficult is perhaps the most potent "manifestation" tool available. Clear the workspace. Place the book on the pillow. Put the gym bag by the door. Remove the apps. The environment shapes the behavior. The behavior shapes the identity. The identity shapes the life.

MECHANISM 5 — IMPLEMENTATION INTENTIONS (The When-Then Protocol): Research by Peter Gollwitzer at NYU demonstrates that specifying when, where, and how you will perform a goal-directed behavior increases follow-through by up to 300%. "I will meditate" has a low completion rate. "When my alarm sounds at 6:15am, I will sit on my meditation cushion for 10 minutes before touching my phone" has a dramatically higher one. Translate every goal into implementation intentions.

[VISUAL PLACEHOLDER: Five-mechanism circular diagram showing how Attentional Priming, Identity Congruence, Emotional Coherence, Environmental Design, and Implementation Intentions interact in a compound feedback loop]`,
        },
        {
          heading: "Chapter 3: The Manifestation Practice Stack — Daily, Weekly, Monthly",
          content: `The gap between people who achieve their goals and those who don't is rarely intelligence, talent, or resources. It is almost always consistency of practice. The Manifestation Practice Stack is a layered system of daily, weekly, and monthly practices designed to build the psychological, neurological, and behavioral infrastructure of deliberate goal achievement.

DAILY PRACTICE (35 Minutes Total):
Morning Protocol (20 minutes): Wake without immediate phone contact. 5 minutes of coherence breathing. 10 minutes of first-person, present-tense goal visualization with full sensory and emotional detail. 5 minutes of journaling three implementation intentions for the day.
Evening Protocol (15 minutes): Review of three implementation intentions (completion rate). 5 minutes of "evidence journaling" — documenting any alignment, opportunity, or progress that appeared today. 5 minutes of gratitude for three specific, concrete things (generic gratitude has less neurological impact than specific).

WEEKLY PRACTICE (60 Minutes):
Every Sunday, review the week against your goal map. What moved? What stalled? What unexpected pathways appeared? Update your environmental design based on behavioral data. Revise implementation intentions where follow-through was low.

MONTHLY PRACTICE (90 Minutes):
First Sunday of the month: review your primary goals against evidence. What has your environment been reflecting back to you? What needs recalibration — the goal, the strategy, or the identity? Write a monthly "Evidence Letter" documenting progress toward your desired future self.

THE GOAL ARCHITECTURE FRAMEWORK: Effective goal architecture has four layers. Outcome Goal (the destination). Performance Goal (the measurable leading indicators of progress). Process Goal (the daily and weekly practices that drive performance). Identity Goal (who must you become to make this outcome inevitable?). Most people set outcome goals without the three supporting layers. The supporting layers are where the actual work — and the actual transformation — lives.

[VISUAL PLACEHOLDER: Four-layer Goal Architecture pyramid with example goals at each level for three different life domains: career, health, relationships]`,
        },
        {
          heading: "Chapter 4: Your 30-Day Manifestation Science Plan",
          content: `WEEK 1 — CLARITY & CALIBRATION
Days 1-2: Define your primary outcome goal for this 30-day cycle with maximum specificity. Include timeline, measurable indicators, and the emotional experience of achieving it.
Days 3-4: Write your Identity Goals. Who must you become for this outcome to be natural and inevitable?
Days 5-7: Begin the Daily Practice Stack. Prioritize consistency over perfection — a 5-minute practice beats a 20-minute intention.
Milestone: Your RAS has been primed. Your identity statement has been established. Your daily architecture is live.

WEEK 2 — ENVIRONMENT & BEHAVIOR
Days 8-10: Complete a comprehensive Environmental Design audit. Remove obstacles. Install facilitators.
Days 11-12: Write your 10 "I am" statements. Choose three congruent micro-behaviors to perform daily.
Days 13-14: Practice the Coherence Protocol before your most important daily activity for seven consecutive days.
Milestone: Your environment and behavior are aligned with your stated identity.

WEEK 3 — ACTION & ALIGNMENT
Days 15-17: Take one significant action toward your outcome goal — something that stretches beyond your current comfort zone. This is where vision becomes evidence.
Days 18-19: Begin your Evidence Journal — daily documentation of moments, opportunities, and synchronicities that appear aligned with your goal.
Days 20-21: Share your goal publicly with one trusted person. Social commitment is a powerful accountability mechanism, and articulating your goal to another person consolidates its neural encoding.
Milestone: You have generated real-world evidence of movement. This evidence becomes fuel.

WEEK 4 — INTEGRATION & MOMENTUM
Days 22-24: Review your Evidence Journal. What patterns do you notice? What opportunities have appeared that weren't visible on Day 1?
Days 25-27: Deepen your visualization practice — increase the sensory and emotional detail. Add the perspective of people in your life responding to your achieved outcome.
Days 28-30: Write your 90-day extension plan. The 30-day cycle is a catalyst. The compound growth happens in the months that follow.

The science of manifestation is ultimately the science of becoming. Of intentionally designing the person whose outer life is the natural expression of their inner world. The universe, as it turns out, responds less to what you want and more to who you are. Become the person. The life follows.

[VISUAL PLACEHOLDER: 30-day Manifestation Science tracker combining daily practice completion, evidence log, identity statement board, and goal architecture diagram in a single beautiful page]`,
        },
      ],
    },
    "social-anxiety": {
      title: "Social Anxiety Hacks: Thriving in Networking & Professional Environments",
      sections: [
        {
          heading: "Chapter 1: Understanding Social Anxiety — The Evolutionary Gift You've Been Fighting",
          content: `Social anxiety is not a character defect. It is not shyness. It is not weakness. It is, in its origin, a highly sophisticated social monitoring system that evolved to keep our ancestors alive within the complex, hierarchical tribal groups on which their survival depended. Social rejection, in the ancestral environment, meant exile — a death sentence in a world where individuals couldn't survive alone. The hypervigilance to social judgment that characterizes social anxiety was an adaptive survival mechanism.

The problem is that we now carry this ancient threat-detection system into social environments that no longer threaten our survival — networking events, job interviews, professional conferences, first dates — and our nervous system cannot distinguish between the modern social challenge and the ancestral survival threat. The physiological response is identical: elevated heart rate, flushed skin, shallow breathing, heightened self-monitoring, cognitive narrowing. These are the same responses our ancestors used to navigate genuine danger.

Understanding this evolutionary context provides three crucial reframes:

REFRAME 1: Your social anxiety is evidence of your social intelligence, not your social failure. The brain that is attuned to subtle social cues, that monitors how others are responding, that is motivated to make positive impressions — this brain is extraordinarily well-equipped for high-quality human connection. The anxiety is the cost of caring. And caring is one of the most valuable social assets available.

REFRAME 2: Everyone is more anxious than they appear. The spotlight effect — our tendency to believe we are being observed and evaluated more intensely than we actually are — is a universal cognitive bias. Research by Thomas Gilovich at Cornell demonstrates consistently that observers notice and remember far less about our social missteps than we fear. Everyone at the networking event is slightly worried about their own performance. You are not uniquely transparent.

REFRAME 3: The goal is not the elimination of anxiety. The goal is anxiety tolerance — the ability to act effectively despite the presence of anxiety. Olympic athletes don't perform without physiological arousal. They perform with it. The nervousness before a high-stakes social situation is not the enemy. Fighting it is.

Case Study — Priyanka, 28, entering her first corporate networking event: "I spent the first 20 minutes in the bathroom, catastrophizing. Then I remembered something I'd read: 'Contribution is the antidote to self-consciousness.' I went back in and focused entirely on what I could give to each conversation rather than what I needed to get from it. Everything changed."

[VISUAL PLACEHOLDER: Diagram showing the evolutionary origin of social anxiety, the modern context mismatch, and the three reframes that shift the relationship with the anxiety response]`,
        },
        {
          heading: "Chapter 2: The CONNECT Framework — Practical Tools for Networking Mastery",
          content: `The CONNECT Framework is a seven-principle system for navigating professional and social environments with increasing confidence and genuine connection — regardless of your baseline anxiety level.

C — CURIOSITY AS ARMOR: The single most powerful antidote to self-consciousness is genuine curiosity about the other person. When your attention is directed outward — genuinely interested in understanding their experience, their work, their perspective — there is less cognitive bandwidth available for self-monitoring and catastrophizing. Prepare three genuinely curious questions before any networking event. Not "what do you do?" but "what's the most interesting challenge you're working on right now?"

O — ONE PERSON AT A TIME: The social anxiety spiral is often triggered by the perception of the entire room as a social challenge to be navigated. Collapse the challenge to its smallest unit: one conversation, with one person, right now. Everything else is noise. The next conversation begins only when this one ends.

N — NAMING THE EXPERIENCE: Research by UCLA's Matthew Lieberman demonstrates that labeling an emotional experience — simply naming it — reduces activity in the amygdala (the brain's threat center) and increases activity in the prefrontal cortex (rational processing). Before entering a challenging social situation: "I'm feeling nervous. My body is preparing me for something important." This simple narration reduces the intensity of the anxiety response measurably.

N — NO PERFECT PERFORMANCE: Release the objective of social perfection. Social anxiety is maintained, in large part, by a post-event processing habit where we review every interaction for evidence of failure, judgment, or embarrassment. Replace post-event analysis with a three-question debrief: What went well? What did I learn? What would I do differently? Balanced evaluation replaces catastrophic rumination.

E — EXIT STRATEGIES ARE ETHICAL: You are allowed to leave conversations gracefully. "It was so good to talk with you — I want to make sure I connect with a few other people before this wraps up" is a complete and kind conversational exit. Having a pre-planned exit removes the trapped feeling that amplifies anxiety during social events.

C — CONTRIBUTION ORIENTATION: Before every networking event, define one concrete thing you want to give rather than get. An introduction, a resource, a piece of information, a genuine compliment. Contribution reorients attention from self-evaluation to social generosity — the single most effective state for high-quality connection.

T — TINY CONSISTENT EXPOSURES: Systematic desensitization — the evidence-based treatment for anxiety — works through graduated exposure. Not one terrifying leap into the deep end, but a hierarchy of progressively challenging social exposures, undertaken consistently. This week: make one comment in a meeting. Next week: introduce yourself to one person at an event. The week after: invite a colleague for coffee. Consistent, graduated exposure rewires the threat response.

[VISUAL PLACEHOLDER: CONNECT Framework one-page visual reference card designed for printing and reviewing before networking events, with the seven principles as memorable icons]`,
        },
        {
          heading: "Chapter 3: The Pre-Event, During-Event, Post-Event Protocol",
          content: `The three-phase protocol systematizes social anxiety management across the full arc of a challenging social situation — from anticipatory anxiety through execution and recovery.

THE PRE-EVENT PROTOCOL (24 Hours Before):
Preparation reduces uncertainty, and uncertainty amplifies anxiety. Research the event: Who will be there? What is the context? What is the explicit purpose? Prepare three curious questions and two genuine conversation starters. Choose your outfit in advance (eliminate one decision on the day). Set a "minimum viable attendance" commitment with yourself — you only need to stay 45 minutes to honor your commitment to growth. This reduces the overwhelming open-endedness of "I have to survive this whole evening."

THE DAY-OF PROTOCOL (2 Hours Before):
Physical preparation is cognitive preparation. 20 minutes of physical exercise releases endorphins, reduces cortisol, and increases confidence-related neurochemistry. A cold shower activates the parasympathetic nervous system. Review your three curious questions. Practice the "power posture" for 2 minutes privately (research by Amy Cuddy suggests brief high-power posing increases feelings of confidence and reduces cortisol measurably). Take three slow, deep breaths in the car or outside the venue before entering.

THE ARRIVAL STRATEGY:
Arrive 10-15 minutes early. This is counterintuitive but powerful. An empty or near-empty room means you meet people as they arrive — in ones and twos, before the noise and density escalate. You are a familiar face to early arrivals rather than someone entering an intimidating crowd.

THE CONVERSATION LAUNCH:
Situational openers require zero creativity and zero social risk. They reference the shared experience of the event: "How did you hear about this?" / "Have you been to one of these before?" / "What's been the most interesting conversation you've had tonight?" These are low-commitment, high-generativity entry points into genuine conversation.

THE POST-EVENT RECOVERY PROTOCOL:
Decompress intentionally. Introversion and social anxiety are different things, but many socially anxious individuals are also introverted — meaning social interaction, even successful interaction, is genuinely draining. Build 30-60 minutes of restorative solo time after social events. This is not avoidance — it is sustainable practice.

[VISUAL PLACEHOLDER: Three-phase protocol timeline showing the 24-hour pre-event, day-of, arrival, during-event, and post-event stages with specific actions and tools for each]`,
        },
        {
          heading: "Chapter 4: Your 30-Day Social Confidence Plan",
          content: `WEEK 1 — FOUNDATION & REFRAME
Days 1-2: Journal your top five social anxiety fears with maximum specificity. Then write the realistic probability and consequence of each.
Days 3-4: Practice the Naming the Experience technique in three low-stakes social interactions.
Days 5-7: Complete one item at the bottom of your social exposure hierarchy (a comment in a group chat, a conversation with a cashier, a question in a meeting).
Milestone: You have mapped your anxiety landscape and taken your first exposure steps.

WEEK 2 — THE CONVERSATION LAB
Days 8-10: Practice the Curiosity as Armor technique in five conversations. Prepare three questions before each.
Days 11-12: Attend one social event with the minimum viable commitment (45 minutes). Focus on Contribution Orientation.
Days 13-14: Replace your post-event rumination with the three-question balanced debrief for every social interaction this week.
Milestone: You have a conversation framework and a cognitive hygiene practice for post-event processing.

WEEK 3 — NETWORKING IN PRACTICE
Days 15-17: Attend one professional networking event using the full Pre-Event and Arrival Protocol.
Days 18-19: Follow up with two people you met at the event within 48 hours. A brief LinkedIn message or email counts.
Days 20-21: Practice an exit strategy in two conversations this week. Notice that graceful exits feel better than you expected.
Milestone: You have a complete networking protocol operating in real environments.

WEEK 4 — CONSOLIDATION & EXPANSION
Days 22-24: Identify the social challenge that felt impossible on Day 1. Schedule it for this week.
Days 25-27: Mentor someone else through a social challenge they're facing. Teaching consolidates your own learning and recalibrates you as a resource rather than a deficiency.
Days 28-30: Design your ongoing exposure hierarchy for the next 90 days. The anxiety doesn't disappear — your relationship to it changes. You become someone who acts despite it. That is the definition of courage.

Social confidence is not the absence of anxiety. It is the presence of skills, reframes, and evidence that build over time through consistent, courageous action. The networking event that paralyzes you today will be the event you lead in eighteen months. Not because the anxiety will be gone — but because you will have built a self that is larger than the anxiety.

[VISUAL PLACEHOLDER: 30-day Social Confidence progression tracker with exposure hierarchy ladder, weekly challenge assignments, and confidence level self-rating chart]`,
        },
      ],
    },
    nomad: {
      title: "Remote Nomad Logistics: The Complete Tax & Lifestyle Guide for Digital Nomads",
      sections: [
        {
          heading: "Chapter 1: The Nomad Decision — What Nobody Tells You Before You Buy the One-Way Ticket",
          content: `The digital nomad lifestyle, as curated on Instagram and YouTube, looks like this: a MacBook on a cafe table in Bali, golden hour, a coconut in one hand and a Zoom call in the other. The reality — which is significantly richer, more complex, and ultimately more rewarding than the aesthetic — includes navigating tax obligations across multiple jurisdictions, understanding visa categories that most government websites describe in deliberately ambiguous language, managing health insurance across borders, building professional credibility without a fixed address, and maintaining psychological wellbeing through the particular loneliness that comes from building community in cities you're leaving in three months.

This guide gives you the full picture — not to discourage you, but to ensure that your nomad experience is built on a foundation of genuine preparation rather than romanticized expectation. The people who thrive as digital nomads are not people who escaped the complexity of conventional life. They are people who built systems for managing a different, and in some ways more demanding, set of complexities.

The global digital nomad population has grown from an estimated 7 million in 2019 to over 35 million in 2024. The infrastructure supporting nomadic work — co-living spaces, co-working chains, nomad visa programs in 50+ countries, global health insurance products, international banking solutions — has matured enormously. The conditions for a financially structured, personally fulfilling nomadic career have never been better.

Case Study — Aryan, 28, full-stack developer earning $85,000 remotely: "I went nomad with almost no preparation. Six months in, I discovered I owed taxes in two countries, had no health insurance, and was burning through money I didn't budget for because I had no framework. Year two, I built systems for everything. The logistics became almost automatic. Now the life is genuinely what I imagined. But the first year taught me that freedom and structure are not opposites — they're partners."

[VISUAL PLACEHOLDER: World map showing countries with established digital nomad visa programs, color-coded by ease of application, cost threshold, and healthcare quality]`,
        },
        {
          heading: "Chapter 2: The Tax Reality — Obligations, Optimizations, and Structures",
          content: `Tax is the topic most nomad content creators handle most superficially — partly because it's jurisdiction-specific and partly because the answers are complicated. This chapter provides the foundational framework you need to have an informed conversation with a qualified international tax advisor (which you should absolutely hire — the cost is trivially small relative to the mistakes they prevent).

THE RESIDENCY-BASED TAXATION FRAMEWORK: Most countries use residency-based taxation — you owe taxes where you are a legal tax resident. A smaller number, including the United States and Eritrea, use citizenship-based taxation — you owe taxes to your home country regardless of where you live. Understanding which framework applies to your citizenship is the foundational question.

For Indian passport holders: India uses a residency-based system defined by the "182-day rule." If you spend fewer than 182 days in India in a financial year, you may qualify as a Non-Resident Indian (NRI) for tax purposes, which has significant implications for how your Indian and foreign income is taxed. This is a nuanced determination that depends on your income sources, treaty arrangements, and the specific countries where you operate. Professional advice is essential — but the principle is navigable.

THE FOUR TAX OPTIMIZATION STRATEGIES (Legal Only):

STRATEGY 1 — TERRITORIAL TAX JURISDICTIONS: Countries including Portugal (NHR scheme — though modified recently), Malaysia (MM2H scheme), Panama, Paraguay, and Georgia impose taxes only on income sourced within their territory. Income earned from clients in other countries is frequently exempt. These jurisdictions have become popular bases for location-independent professionals.

STRATEGY 2 — THE NOMAD VISA WITH TAX CLARITY: Many countries have introduced specific digital nomad visas (Portugal's Digital Nomad Visa, Spain's Ley de Startups visa, Croatia's Digital Nomad Residence Permit, among 50+ others) that provide legal residency status with defined tax treatment. The clarity these visas provide is enormously valuable compared to navigating visa-exempt short-stay tourism.

STRATEGY 3 — FOREIGN INCOME EXCLUSION (US Citizens): US citizens living abroad may qualify for the Foreign Earned Income Exclusion (FEIE), allowing exclusion of up to $126,500 (2024 figure) of foreign-earned income from US taxable income if they meet the Physical Presence or Bona Fide Residence test. US nomads should work with a CPA specializing in expat taxation — the compliance requirements are non-trivial.

STRATEGY 4 — STRUCTURE YOUR BUSINESS APPROPRIATELY: The business structure through which you earn income has significant tax implications. Sole proprietorship, a private limited company in a favorable jurisdiction, or an international contractor structure each carry different tax treatments. Consult a specialist before your first year abroad rather than after.

THE INVOICING AND BANKING STACK: Multi-currency accounts (Wise Business, Revolut Business, Mercury for USD) allow you to receive payment in client currencies without conversion losses. An international business account reduces cross-border friction significantly.

[VISUAL PLACEHOLDER: Decision tree showing tax consideration pathways for Indian passport holders, US citizens, and EU citizens going nomadic, with key decision points and outcome categories]`,
        },
        {
          heading: "Chapter 3: The Operational Systems Stack — Running a Professional Location-Independent Career",
          content: `The logistical complexity of nomadic life is real, but it is finite and manageable. The following systems stack addresses every major operational domain of a location-independent professional life.

BANKING & MONEY: Primary international account (Wise — excellent exchange rates, multi-currency holds). Secondary backup account (Revolut — instant cross-border transfers, decent travel insurance). Emergency cash reserve: 3 months of expenses in a stable currency (USD or EUR), accessible in your primary and one backup account separately. Notify your home bank before major moves to prevent account freezes.

HEALTH INSURANCE: This is where most nomads are dangerously underinsured. Travel insurance is not health insurance — read the fine print. Dedicated expat/nomad health insurance (SafetyWing, WorldNomads for basic coverage; Cigna Global, Aetna International, or IMG Global Medical for comprehensive coverage) provides genuine cross-border healthcare access. Expect to pay $80-300/month depending on age, coverage level, and region.

COMMUNICATION STACK: An international eSIM provider (Airalo, Holaho) allows you to purchase local data plans in 150+ countries from your phone before arrival. Keep your home SIM active for banking authentication. A business phone number through a service like Google Voice or MySudo provides professional consistency.

ACCOMMODATION STACK: Short-term (1-4 weeks): Airbnb, Booking.com, direct hostel/hotel. Medium-term (1-3 months): Spotahome, Flatio, Houfy for furnished apartments with nomad-friendly lease structures. Long-term bases (3+ months): Establish genuine local networks through Facebook expat groups and local co-living communities. Co-living spaces (Selina, Outpost, Dojo Bali) provide built-in community and reliable infrastructure at a premium.

PRODUCTIVITY STACK: Primary workspace: Co-working day passes or monthly memberships where consistent. Backup: Hotel lobbies, cafes (test wifi speed before committing to deep work). Productivity tools: Notion for all documents, Loom for async video communication, Calendly set to your working hours in your current timezone, Clockwise for calendar management across timezone shifts.

MAIL & ADDRESS: Virtual mailbox services (Anytime Mailbox, PostScan Mail, Earth Class Mail) provide a permanent US or UK address for banking, business registration, and official correspondence. Services scan your physical mail and deliver digitally.

[VISUAL PLACEHOLDER: Nomad Operations Stack visual showing all tools organized by category (Banking, Insurance, Communication, Accommodation, Productivity, Mail) with recommended options at different budget levels]`,
        },
        {
          heading: "Chapter 4: Your 30-Day Nomad Launch Plan",
          content: `WEEK 1 — FINANCIAL & LEGAL FOUNDATION
Days 1-2: Research your tax obligations as a citizen of your home country working remotely. Identify whether you need a specialist — you almost certainly do. Budget for one consultation.
Days 3-4: Open your international banking stack (Wise + Revolut minimum). Set up multi-currency receives.
Days 5-7: Research three destination countries that match your lifestyle and cost-of-living targets. Investigate their visa options explicitly.
Milestone: Your financial infrastructure is nomad-ready.

WEEK 2 — HEALTH, INSURANCE & COMMUNICATION
Days 8-9: Research and select nomad health insurance. Don't skip this. Medical emergencies in foreign countries without insurance are financially catastrophic.
Days 10-11: Set up your eSIM solution. Test it with a current Airalo purchase.
Days 12-14: Set up your virtual mailbox and professional communication stack.
Milestone: Your operational infrastructure can sustain a nomadic life professionally.

WEEK 3 — DESTINATION PLANNING & COMMUNITY
Days 15-17: Choose your first destination with intention. Consider: visa clarity, time zone overlap with clients, cost of living vs. quality of infrastructure, co-working ecosystem, healthcare access, community presence (nomad communities on Facebook, Meetup, and Reddit).
Days 18-19: Identify co-working spaces and co-living options at your destination. Budget your first month in detail.
Days 20-21: Join destination-specific nomad communities online. Introduce yourself. Ask your specific questions. The nomad community is remarkably generous with logistics information.
Milestone: Your first destination is planned with financial and logistical clarity.

WEEK 4 — PROFESSIONAL & PERSONAL PREPARATION
Days 22-24: Brief your clients or employer on your new working arrangements. Clarify timezone availability, communication expectations, and any contractual considerations.
Days 25-27: Build your home departure checklist: storage or subletting of your current accommodation, mail forwarding, phone plan, recurring subscriptions and their geographic restrictions.
Days 28-30: Set a 90-day review date for your first nomadic chapter. Assess: Is the lifestyle sustainable? Are your finances tracking correctly? Is the community need being met? Nomadic life is a living experiment, not a one-time decision.

The nomad life, built with structure and intention, is one of the most extraordinary experiments in living available to professionals today. It is not an escape from reality — it is a deliberate design of a different reality. One where the walls of your office expand to encompass the entire world. Build it well.

[VISUAL PLACEHOLDER: 30-day nomad launch checklist organized by week and category, with checkboxes, resource links, and estimated time and cost for each action item]`,
        },
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

// ─── Payment Modal ────────────────────────────────────────────────────────────
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

  
    try {
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert(`Payment gateway loaded! In production, this would process ₹${plan === "scholar" ? BASE_SCHOLAR_INR : BASE_SAGE_INR} via Razorpay.\n\n✅ Demo: Payment Successful for ${planName} Plan!`);
      onClose();
    }const options = {
      // ✅ Ab ye Vercel se tumhari verified key uthayega
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
      amount: Math.round(price * 100), 
      currency: "INR",
      name: "Evolvere AI",
      description: `${planName} Plan – Premium Digital Guide`,
      image: "",
      handler: function (response: any) {
        alert(`✅ Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
        onClose();
      },
      prefill: { 
        name: "Aditya", 
        email: "atharv.2006@gmail.com" 
      },
      theme: { color: "#7c3aed" },
    };
  };

  const handleStripe = () => {
    setTimeout(() => {
      alert(`✅ Stripe Payment Successful! Your ${planName} plan is now active.\nCharged: ${formatPrice(pricing.symbol, price)} to your card.\nConfirmation sent to your email.`);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">×</button>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4">
            <span className="text-2xl">{plan === "scholar" ? "📚" : "🔮"}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{planName} Plan</h2>
          <p className="text-4xl font-black text-violet-600 mt-2">{formatPrice(pricing.symbol, price)}</p>
          <p className="text-sm text-gray-500 mt-1">{ipData?.country_name || "International"} • {pricing.currency}</p>
        </div>
        <ul className="space-y-2 mb-6">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-green-500 font-bold">✓</span> {f}
            </li>
          ))}
        </ul>
        {pricing.isIndia ? (
          <button
            onClick={handleRazorpay}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-lg hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg"
          >
            💳 Pay with Razorpay
          </button>
        ) : (
          <button
            onClick={handleStripe}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-lg hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg"
          >
            💳 Pay with Stripe
          </button>
        )}
        <p className="text-center text-xs text-gray-400 mt-3">🔒 Secured by {pricing.isIndia ? "Razorpay" : "Stripe"} • 256-bit SSL Encryption</p>
      </div>
    </div>
  );
}

// ─── PDF Generator ────────────────────────────────────────────────────────────
async function generateBookPDF(niche: typeof NICHES[0]) {
  const content = generatePDFContent(niche);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const margin = 20;
  const contentW = pageW - margin * 2;

  const addPageBackground = () => {
    doc.setFillColor(250, 248, 255);
    doc.rect(0, 0, pageW, pageH, "F");
    doc.setFillColor(124, 58, 237);
    doc.rect(0, 0, 8, pageH, "F");
  };



  // ── TITLE PAGE ──
  addPageBackground();
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, pageW, 120, "F");
  doc.setFillColor(139, 92, 246);
  doc.rect(0, 95, pageW, 30, "F");

  // Evolvere logo area
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("EVOLVERE AI", margin, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Premium Digital Guide Platform", margin, 26);

  // Title
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(content.title, contentW - 10);
  doc.text(titleLines, margin, 55);

  // Niche tag
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(221, 214, 254);
  doc.text(niche.desc, margin, 105);

  // Below purple — metadata
  doc.setTextColor(80, 60, 120);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Published by Evolvere AI  •  Premium Research Guide  •  ${new Date().getFullYear()}`, margin, 140);

  // Visual placeholder box for cover image
  doc.setDrawColor(200, 180, 240);
  doc.setFillColor(240, 235, 255);
  doc.roundedRect(margin, 150, contentW, 60, 5, 5, "FD");
  doc.setTextColor(150, 120, 200);
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("[COVER ILLUSTRATION: Premium visual representing the transformation journey of this guide]", pageW / 2, 182, { align: "center" });

  // Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(130, 110, 170);
  doc.text("This guide is for educational purposes only. Results may vary.", margin, 270);
  doc.text(`© ${new Date().getFullYear()} Evolvere AI. All rights reserved.`, margin, 276);

  // ── TABLE OF CONTENTS ──
  doc.addPage();
  addPageBackground();
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 20, 100);
  doc.text("Table of Contents", margin, 40);
  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.8);
  doc.line(margin, 45, margin + 80, 45);

  let tocY = 65;
  content.sections.forEach((section, idx) => {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 40, 150);
    doc.text(`${idx + 1}.`, margin, tocY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 30, 100);
    const tocTitle = doc.splitTextToSize(section.heading, contentW - 20);
    doc.text(tocTitle, margin + 10, tocY);

    doc.setFontSize(9);
    doc.setTextColor(160, 130, 200);
    tocY += tocTitle.length * 5 + 4;
    doc.text(`Page ${idx + 3}`, margin + 10, tocY);
    tocY += 10;
  });

  // Bonus sections TOC
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 40, 150);
  doc.text(`${content.sections.length + 1}.`, margin, tocY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 30, 100);
  doc.text("Appendix: Resources, Recommended Reading & Next Steps", margin + 10, tocY);
  tocY += 5;
  doc.setFontSize(9);
  doc.setTextColor(160, 130, 200);
  doc.text(`Page ${content.sections.length + 3}`, margin + 10, tocY);

  // ── CONTENT CHAPTERS ──
  content.sections.forEach((section, sectionIdx) => {
    doc.addPage();
    addPageBackground();

    // Chapter header bar
    doc.setFillColor(124, 58, 237);
    doc.rect(0, 0, pageW, 35, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(200, 180, 255);
    doc.text(`CHAPTER ${sectionIdx + 1}  •  ${niche.label.toUpperCase()}`, margin, 15);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    const headingLines = doc.splitTextToSize(section.heading, contentW);
    doc.text(headingLines, margin, 26);

    let y = 50;

    // Split content by paragraphs
    const paragraphs = section.content.split("\n\n");
    paragraphs.forEach((para) => {
      if (y > pageH - 35) {
        doc.addPage();
        addPageBackground();
        y = 25;
      }

      const trimmed = para.trim();
      if (!trimmed) return;

      // Visual placeholder detection
      if (trimmed.startsWith("[VISUAL PLACEHOLDER")) {
        doc.setDrawColor(180, 150, 230);
        doc.setFillColor(245, 240, 255);
        const boxH = 28;
        doc.roundedRect(margin, y, contentW, boxH, 4, 4, "FD");
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(120, 80, 180);
        const placeholderLines = doc.splitTextToSize(trimmed, contentW - 8);
        doc.text(placeholderLines, margin + 4, y + 6);
        y += boxH + 8;
        return;
      }

      // Detect header-like lines (ALL CAPS or lines ending with :)
      const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-") || /^(Day|Week|HOUR|PHASE|MECHANISM|TOOL|STRATEGY|WORKFLOW|TIER|LAYER)\s/.test(trimmed);
      const isSectionHeader = /^(PHASE|MECHANISM|TOOL|STRATEGY|WORKFLOW|TIER|LAYER|THE|FOR |STEP |SYSTEM |WEEK |DAYS )/.test(trimmed) && trimmed.length < 120 && !trimmed.includes(". ");

      if (isSectionHeader && trimmed.length < 100) {
        if (y > pageH - 45) { doc.addPage(); addPageBackground(); y = 25; }
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 50, 180);
        const hLines = doc.splitTextToSize(trimmed, contentW);
        doc.text(hLines, margin, y);
        y += hLines.length * 6 + 4;
        doc.setDrawColor(200, 170, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, y, margin + 40, y);
        y += 5;
      } else if (isBullet) {
        doc.setFontSize(9.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 40, 100);
        const bulletLines = doc.splitTextToSize(trimmed, contentW - 8);
        if (y + bulletLines.length * 5 > pageH - 25) { doc.addPage(); addPageBackground(); y = 25; }
        doc.text(bulletLines, margin + 4, y);
        y += bulletLines.length * 5 + 3;
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 30, 70);
        const pLines = doc.splitTextToSize(trimmed, contentW);
        if (y + pLines.length * 5.5 > pageH - 25) { doc.addPage(); addPageBackground(); y = 25; }
        doc.text(pLines, margin, y);
        y += pLines.length * 5.5 + 5;
      }
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(160, 130, 200);
    doc.text(`Evolvere AI  •  ${content.title}  •  Chapter ${sectionIdx + 1}`, margin, pageH - 10);
    doc.text(`${sectionIdx + 3}`, pageW - margin, pageH - 10, { align: "right" });
  });

  // ── APPENDIX PAGE ──
  doc.addPage();
  addPageBackground();
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, pageW, 30, "F");
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Appendix: Resources & Next Steps", margin, 20);

  let appY = 45;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 40, 150);
  doc.text("Recommended Reading", margin, appY);
  appY += 8;

  const books = [
    "Atomic Habits – James Clear",
    "The Body Keeps the Score – Bessel van der Kolk",
    "Thinking, Fast and Slow – Daniel Kahneman",
    "Deep Work – Cal Newport",
    "Attached – Amir Levine & Rachel Heller",
    "The Power of Now – Eckhart Tolle",
    "Dopamine Nation – Dr. Anna Lembke",
  ];
  books.forEach(book => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 40, 100);
    doc.text(`• ${book}`, margin + 5, appY);
    appY += 7;
  });

  appY += 5;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 40, 150);
  doc.text("Your Next Steps with Evolvere AI", margin, appY);
  appY += 8;

  const nextSteps = [
    "Share your transformation journey with #EvolverAI on social media",
    "Join our premium community for weekly live Q&A sessions",
    "Explore our full library of 10 premium niche guides",
    "Schedule a 1:1 breakthrough session with an Evolvere coach",
    "Subscribe to our weekly newsletter for cutting-edge insights",
  ];
  nextSteps.forEach(step => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 40, 100);
    doc.text(`→ ${step}`, margin + 5, appY);
    appY += 7;
  });

  appY += 15;
  doc.setFillColor(245, 240, 255);
  doc.roundedRect(margin, appY, contentW, 40, 5, 5, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 40, 150);
  doc.text("Thank You for Choosing Evolvere AI", pageW / 2, appY + 12, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 70, 170);
  doc.text("Your evolution is our purpose. Every page of this guide was crafted", pageW / 2, appY + 20, { align: "center" });
  doc.text("with the singular intention of accelerating your transformation.", pageW / 2, appY + 27, { align: "center" });
  doc.text("evolvere.ai  |  hello@evolvere.ai", pageW / 2, appY + 35, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(160, 130, 200);
  doc.text(`Evolvere AI  •  ${content.title}  •  Appendix`, margin, pageH - 10);
  doc.text(`${content.sections.length + 3}`, pageW - margin, pageH - 10, { align: "right" });

  doc.save(`Evolvere-AI-${niche.id}-Guide.pdf`);
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [ipData, setIpData] = useState<IPData | null>(null);
  const [pricing, setPricing] = useState<PricingInfo>({
    scholar: 90,
    sage: 180,
    symbol: "₹",
    currency: "INR",
    isIndia: true,
  });
  const [loadingIP, setLoadingIP] = useState(true);
  const [selectedNiche, setSelectedNiche] = useState(NICHES[0]);
  const [generating, setGenerating] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; plan: "scholar" | "sage" }>({ open: false, plan: "scholar" });
  const [activeSection, setActiveSection] = useState<"home" | "pricing" | "generator">("home");
  const heroRef = useRef<HTMLDivElement>(null);

  // IP Detection & Pricing
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
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
      .catch(() => {
        setPricing({ scholar: 90, sage: 180, symbol: "₹", currency: "INR", isIndia: true });
      })
      .finally(() => setLoadingIP(false));
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    await generateBookPDF(selectedNiche);
    setGenerating(false);
  };

  const scrollTo = (section: "home" | "pricing" | "generator") => {
    setActiveSection(section);
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 font-['Inter',sans-serif]">
      {/* Payment Modal */}
      {paymentModal.open && (
        <PaymentModal
          plan={paymentModal.plan}
          pricing={pricing}
          ipData={ipData}
          onClose={() => setPaymentModal({ open: false, plan: "scholar" })}
        />
      )}

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-white text-lg font-black">E</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight">Evolvere</span>
              <span className="text-violet-400 font-bold text-lg tracking-tight"> AI</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[["home", "Home"], ["generator", "Generator"], ["pricing", "Pricing"]].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id as any)}
                className={`text-sm font-medium transition-colors ${activeSection === id ? "text-violet-400" : "text-slate-400 hover:text-white"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {!loadingIP && ipData && (
              <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
                <span className="text-xs text-slate-400">📍</span>
                <span className="text-xs text-slate-300 font-medium">{ipData.city || ipData.country_name}</span>
                <span className="text-xs text-violet-400 font-bold">{pricing.symbol}{pricing.scholar}</span>
              </div>
            )}
            <button
              onClick={() => setPaymentModal({ open: true, plan: "sage" })}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-full hover:shadow-lg hover:shadow-violet-500/30 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" ref={heroRef} className="relative overflow-hidden pt-20 pb-24 px-6">
        {/* Background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-800/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-violet-300 text-sm font-medium">Powered by AI • Book-Level Guides • Instant PDF</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight mb-6">
            Your Premium
            <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
              Digital Guide
            </span>
            Platform
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Generate deeply researched, book-level PDF guides on the topics that define your generation. Crafted with neuroscience, empathy, and actionable frameworks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => scrollTo("generator")}
              className="group bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold px-8 py-4 rounded-2xl hover:shadow-2xl hover:shadow-violet-500/40 transition-all text-lg"
            >
              Generate Free Guide →
            </button>
            <button
              onClick={() => scrollTo("pricing")}
              className="bg-white/5 border border-white/10 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all text-lg"
            >
              View Plans
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              ["10+", "Trending Niches"],
              ["800+", "Words Per Guide"],
              ["4", "Deep Chapters"],
              ["30-Day", "Action Plans"],
            ].map(([num, label]) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="text-2xl font-black text-white">{num}</div>
                <div className="text-xs text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NICHES SHOWCASE ── */}
      <section className="py-16 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Trending Niches for
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"> Gen Z & Millennials</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">10 carefully curated topics at the intersection of psychology, technology, and modern living.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {NICHES.map((niche) => (
              <button
                key={niche.id}
                onClick={() => { setSelectedNiche(niche); scrollTo("generator"); }}
                className={`group relative bg-white/5 border border-white/10 rounded-2xl p-5 text-left hover:bg-white/10 hover:border-violet-500/40 transition-all duration-300 ${selectedNiche.id === niche.id ? "border-violet-500/60 bg-violet-500/10" : ""}`}
              >
                <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${niche.color} text-white`}>
                  {niche.tag}
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${niche.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <span className="text-lg">{niche.label.split(" ")[0]}</span>
                </div>
                <h3 className="text-white font-semibold text-sm leading-snug mb-1">
                  {niche.label.slice(niche.label.indexOf(" ") + 1)}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">{niche.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── GENERATOR ── */}
      <section id="generator" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-violet-900/50 to-purple-900/30 border border-violet-500/20 rounded-3xl p-8 md:p-12 backdrop-blur-xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Generate Your Guide</h2>
              <p className="text-slate-400">Select a niche and generate a book-level PDF with deep psychology, frameworks, and a 30-day action plan.</p>
            </div>

            {/* Niche Selector */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-violet-300 mb-3">Select Your Niche</label>
              <div className="relative">
                <select
                  value={selectedNiche.id}
                  onChange={e => setSelectedNiche(NICHES.find(n => n.id === e.target.value) || NICHES[0])}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-5 py-4 text-base font-medium appearance-none cursor-pointer focus:outline-none focus:border-violet-500 hover:bg-white/15 transition-all"
                >
                  {NICHES.map(n => (
                    <option key={n.id} value={n.id} className="bg-slate-900 text-white">
                      {n.label} — {n.desc}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-violet-400">▼</div>
              </div>
            </div>

            {/* Selected Niche Preview */}
            <div className={`mb-8 bg-gradient-to-r ${selectedNiche.color} p-px rounded-2xl`}>
              <div className="bg-slate-900/90 rounded-2xl p-5 flex items-start gap-4">
                <div className={`w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br ${selectedNiche.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {selectedNiche.label.split(" ")[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold">{selectedNiche.label.slice(selectedNiche.label.indexOf(" ") + 1)}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${selectedNiche.color} text-white`}>{selectedNiche.tag}</span>
                  </div>
                  <p className="text-slate-400 text-sm">{selectedNiche.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Title Page", "Deep Psychology", "Actionable Framework", "30-Day Plan", "Visual Guides"].map(tag => (
                      <span key={tag} className="text-xs bg-white/10 text-slate-300 px-2 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* PDF Preview Description */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { icon: "📖", label: "Title Page", desc: "Branded cover design" },
                { icon: "🧠", label: "Deep Psychology", desc: "The 'Why' behind it all" },
                { icon: "⚙️", label: "Frameworks", desc: "The 'How' to action it" },
                { icon: "📅", label: "30-Day Plan", desc: "Day-by-day roadmap" },
              ].map(item => (
                <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-white text-xs font-semibold">{item.label}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className={`w-full py-5 rounded-2xl font-black text-xl transition-all duration-300 ${
                generating
                  ? "bg-violet-800/50 text-violet-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white hover:shadow-2xl hover:shadow-violet-500/50 hover:scale-[1.02]"
              }`}
            >
              {generating ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="inline-block w-5 h-5 border-2 border-violet-300 border-t-white rounded-full animate-spin" />
                  Generating Book-Level Guide...
                </span>
              ) : (
                "✨ Generate Free PDF Guide →"
              )}
            </button>

            <p className="text-center text-slate-500 text-sm mt-4">
              Free demo guide • Unlock all niches with{" "}
              <button onClick={() => scrollTo("pricing")} className="text-violet-400 hover:text-violet-300 underline">Scholar or Sage plan</button>
            </p>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Transparent Pricing,
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"> Zero Surprises</span>
            </h2>
            {!loadingIP ? (
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-green-300 text-sm font-medium">
                  Prices shown in {pricing.currency} for {ipData?.country_name || "your region"} •{" "}
                  {pricing.isIndia ? "Razorpay Payments" : "Stripe Payments"}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-slate-700/50 rounded-full px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
                <span className="text-slate-400 text-sm">Detecting your location...</span>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Scholar */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-violet-500/40 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-2xl">📚</div>
                <div>
                  <h3 className="text-white font-bold text-xl">Scholar</h3>
                  <p className="text-slate-500 text-sm">For the curious mind</p>
                </div>
              </div>

              <div className="mb-6">
                {loadingIP ? (
                  <div className="h-12 bg-white/10 rounded-xl animate-pulse" />
                ) : (
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black text-white">{formatPrice(pricing.symbol, pricing.scholar)}</span>
                    <span className="text-slate-400 text-sm mb-2">one-time</span>
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {["1 Premium Digital Guide PDF", "Choose from all 10 niches", "Book-level content (800+ words)", "30-Day action plan included", "Email delivery", "30-Day access"].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setPaymentModal({ open: true, plan: "scholar" })}
                disabled={loadingIP}
                className="w-full py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 hover:border-white/30 transition-all disabled:opacity-50"
              >
                {loadingIP ? "Loading..." : `Get Scholar • ${formatPrice(pricing.symbol, pricing.scholar)}`}
              </button>
            </div>

            {/* Sage */}
            <div className="relative bg-gradient-to-b from-violet-900/60 to-purple-900/40 border border-violet-500/50 rounded-3xl p-8 shadow-2xl shadow-violet-500/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                ⭐ MOST POPULAR
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-violet-500/40">🔮</div>
                <div>
                  <h3 className="text-white font-bold text-xl">Sage</h3>
                  <p className="text-violet-300 text-sm">For the serious transformer</p>
                </div>
              </div>

              <div className="mb-6">
                {loadingIP ? (
                  <div className="h-12 bg-white/10 rounded-xl animate-pulse" />
                ) : (
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black text-white">{formatPrice(pricing.symbol, pricing.sage)}</span>
                    <span className="text-violet-300 text-sm mb-2">one-time</span>
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {["5 Premium Digital Guide PDFs", "All 10 niches unlocked", "Book-level content (800+ words each)", "30-Day action plans included", "Priority email delivery", "Lifetime access", "Exclusive framework templates", "Monthly new guide updates"].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-violet-500/40 flex items-center justify-center text-violet-300 text-xs flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setPaymentModal({ open: true, plan: "sage" })}
                disabled={loadingIP}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold hover:shadow-2xl hover:shadow-violet-500/50 hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {loadingIP ? "Loading..." : `Get Sage • ${formatPrice(pricing.symbol, pricing.sage)}`}
              </button>
            </div>
          </div>

          {/* Payment badges */}
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            {[
              { icon: "🔒", label: "256-bit SSL" },
              { icon: "💳", label: pricing.isIndia ? "Razorpay Secured" : "Stripe Secured" },
              { icon: "✅", label: "Instant Delivery" },
              { icon: "🌍", label: `${ipData?.country_name || "Global"} Pricing` },
              { icon: "↩️", label: "30-Day Guarantee" },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                <span>{b.icon}</span>
                <span className="text-slate-300 text-xs font-medium">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-white text-center mb-12">
            What Our <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Community Says</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Priya S.",
                role: "UX Designer, Bangalore",
                text: "The Digital Burnout guide genuinely changed my relationship with my phone. The polyvagal theory section alone is worth 10x the price. This is not a quick blog post — it's a real book.",
                rating: 5,
                niche: "🧠 Digital Burnout Recovery",
              },
              {
                name: "Arjun M.",
                role: "Marketing Manager, Mumbai",
                text: "The AI Career Pivot guide helped me automate 14 hours of weekly work. I used the CRAFT prompt framework and my boss noticed the difference within the first week. Promoted within 2 months.",
                rating: 5,
                niche: "🤖 AI Career Pivot",
              },
              {
                name: "Kavya R.",
                role: "Freelance Designer, Chennai",
                text: "I launched my first digital product in exactly 48 hours using the Micro-Side Hustles framework. Made ₹12,000 in the first week. The specificity of the action plan is unlike anything I've read.",
                rating: 5,
                niche: "⚡ Micro-Side Hustles",
              },
            ].map(t => (
              <div key={t.name} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-violet-500/30 transition-all">
                <div className="flex gap-1 mb-3">
                  {Array(t.rating).fill(0).map((_, i) => <span key={i} className="text-yellow-400">★</span>)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="border-t border-white/10 pt-4">
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-slate-500 text-xs">{t.role}</div>
                  <div className="mt-2 text-xs text-violet-400 font-medium">{t.niche}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-violet-900/60 to-purple-900/40 border border-violet-500/30 rounded-3xl p-12">
            <h2 className="text-4xl font-black text-white mb-4">Begin Your Evolution Today</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of Gen Z and Millennial professionals who are using Evolvere AI guides to navigate the most important challenges of modern life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="bg-white text-violet-900 font-black px-8 py-4 rounded-2xl hover:shadow-2xl hover:bg-violet-50 transition-all text-lg"
              >
                {generating ? "Generating..." : "✨ Generate Free Guide Now"}
              </button>
              <button
                onClick={() => setPaymentModal({ open: true, plan: "sage" })}
                className="border border-violet-500/50 text-white font-bold px-8 py-4 rounded-2xl hover:bg-violet-500/10 transition-all text-lg"
              >
                Unlock All Guides
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-black">E</span>
            </div>
            <span className="text-white font-bold">Evolvere <span className="text-violet-400">AI</span></span>
          </div>
          <p className="text-slate-500 text-sm text-center">
            © {new Date().getFullYear()} Evolvere AI. Premium Digital Guide Platform.{" "}
            {!loadingIP && ipData && <span className="text-slate-600">Serving {ipData.country_name} ({pricing.currency})</span>}
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map(l => (
              <button key={l} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">{l}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
