/**
 * ============================================================================
 * CYKF._ PORTFOLIO CONTENT & CONFIGURATION
 * ============================================================================
 * 
 * SAKSHAM: Fill in all the fields marked with "TODO" before deploying!
 * 
 * FIELDS TO FILL BEFORE PUBLISHING:
 * - email: Your real contact email address
 * - location: Your real city / country
 * - linkedin: Your LinkedIn username or URL
 * - instagram: Your Instagram handle or URL
 * - github: Your GitHub profile URL (optional)
 * - bio: 1-2 sentence developer summary in Player Profile
 * - role: Your professional title (e.g. "Full-Stack Builder")
 * - level: Your experience level string (e.g. "Level 25 · Full Stack")
 * - server: Server string (e.g. "Global · Web & Cloud")
 * - status: Availability (e.g. "Online · Open for contracts")
 * - skills: Levels (I-V) and percentages (0-100) for the 7 skills
 * - projects: 6 project entries (title, description, rarity, tech, link)
 * - journey: 3 career milestone entries (date, title, description)
 * - trades: 4 service offers (title, description, emerald price, stock status)
 * - stats: Real counts for builds, clients, and countries
 * - advancements: 4 completed + 1 locked milestone
 * ============================================================================
 */

export interface SkillItem {
  id: string;
  name: string;
  romanLevel: string; // e.g. "V", "IV", "III"
  percentage: number;  // 0 - 100
  category?: string;
}

export interface ProjectItem {
  id: string;
  slotIndex: number;
  title: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  rarityColor: string; // Hex color for rarity pip
  tech: string[];
  link: string;
  demoUrl?: string;
  iconName: string; // Icon identifier
}

export interface JourneyEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  ingredients: string[]; // 3 pixel icons representing the "ingredients"
}

export interface TradeOffer {
  id: string;
  service: string;
  description: string;
  price: number; // in Emeralds
  stockStatus: 'In stock' | 'Limited' | 'Sold out';
  icon: string;
}

export interface AdvancementItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: string;
}

export interface PortfolioContent {
  brand: string;
  version: string;
  owner: string;
  mcUsername: string;
  skinPath: string;
  skinModel: 'auto' | 'classic' | 'slim';
  enableCape: boolean;
  enableSkinSwap: boolean;

  // Contact Info
  email: string;
  location: string;
  linkedin: string;
  instagram: string;
  github?: string;

  // Player Profile
  bio: string;
  role: string;
  level: string;
  server: string;
  status: string;

  // Skills (Exact 7 names from reference)
  skills: SkillItem[];

  // Completed Builds (6 filled + 6 empty)
  projects: ProjectItem[];

  // Crafting Journey (3 entries)
  journey: JourneyEntry[];

  // Villager Trades (4 services)
  trades: TradeOffer[];
  tradeLevelText: string;

  // Stats
  stats: {
    builds: string;
    clients: string;
    countries: string;
  };

  // Advancements (4 completed + 1 locked)
  advancements: AdvancementItem[];

  // End Scene
  endPoem: {
    title: string;
    subtitle: string;
    quote: string;
    respawnButtonText: string;
  };
}

export const content: PortfolioContent = {
  brand: "Cykf._",
  version: "v1.0.0",
  owner: "Saksham",
  mcUsername: "Cykf_",
  skinPath: "/skins/cykf.png",
  skinModel: "auto", // 'auto' auto-detects 4px classic vs 3px slim
  enableCape: false,
  enableSkinSwap: true,

  // Contact Info
  email: "sakshampanwar0312@gmail.com",
  location: "GGN, Haryana",
  linkedin: "https://www.linkedin.com/in/saksham-panwar-9847b3412/",
  instagram: "https://instagram.com/cykf._",
  github: "https://github.com/cykf",

  // Player Profile
  bio: "Full-Stack Developer & Creative Technologist based in GGN, Haryana. Building high-performance web applications, interactive 3D voxel experiences, and modern software architectures.",
  role: "Full-Stack Developer",
  level: "Level 42 · Full Stack Architect",
  server: "GGN · India · Global",
  status: "Online · Open for contracts",

  // Exact 7 Skills from reference
  skills: [
    { id: 'html-css', name: 'HTML / CSS', romanLevel: 'V', percentage: 95 },
    { id: 'javascript', name: 'JavaScript', romanLevel: 'V', percentage: 90 },
    { id: 'astro-gsap', name: 'Astro / GSAP', romanLevel: 'IV', percentage: 88 },
    { id: 'python', name: 'Python', romanLevel: 'IV', percentage: 75 },
    { id: 'ui-ux', name: 'UI / UX', romanLevel: 'V', percentage: 90 },
    { id: 'blender', name: 'Blender', romanLevel: 'III', percentage: 70 },
    { id: 'ai-automation', name: 'AI / Automation', romanLevel: 'IV', percentage: 82 },
  ],

  // 6 Completed Builds (Chest Scene)
  projects: [
    {
      id: 'proj-1',
      slotIndex: 0,
      title: 'TODO_PROJECT_1_TITLE',
      description: 'TODO_PROJECT_1_DESCRIPTION: High-impact web application built with modern architecture.',
      rarity: 'legendary',
      rarityColor: '#FFAA00', // Gold / Orange
      tech: ['React', 'Three.js', 'Tailwind'],
      link: 'https://github.com/TODO',
      iconName: 'nether-star'
    },
    {
      id: 'proj-2',
      slotIndex: 1,
      title: 'TODO_PROJECT_2_TITLE',
      description: 'TODO_PROJECT_2_DESCRIPTION: Interactive real-time dashboard and state management system.',
      rarity: 'rare',
      rarityColor: '#55FFFF', // Cyan
      tech: ['TypeScript', 'Zustand', 'Node.js'],
      link: 'https://github.com/TODO',
      iconName: 'potion'
    },
    {
      id: 'proj-3',
      slotIndex: 2,
      title: 'TODO_PROJECT_3_TITLE',
      description: 'TODO_PROJECT_3_DESCRIPTION: High performance microservice API pipeline with low latency.',
      rarity: 'epic',
      rarityColor: '#AA00AA', // Purple
      tech: ['Python', 'FastAPI', 'Redis'],
      link: 'https://github.com/TODO',
      iconName: 'spyglass'
    },
    {
      id: 'proj-4',
      slotIndex: 3,
      title: 'TODO_PROJECT_4_TITLE',
      description: 'TODO_PROJECT_4_DESCRIPTION: Next-generation AI agent integration and automated workflow.',
      rarity: 'legendary',
      rarityColor: '#FFFF55', // Yellow
      tech: ['Gemini API', 'Vector DB', 'TypeScript'],
      link: 'https://github.com/TODO',
      iconName: 'lightning'
    },
    {
      id: 'proj-5',
      slotIndex: 4,
      title: 'TODO_PROJECT_5_TITLE',
      description: 'TODO_PROJECT_5_DESCRIPTION: 3D interactive portfolio and procedural shader experiment.',
      rarity: 'epic',
      rarityColor: '#FF55FF', // Magenta
      tech: ['GLSL', 'R3F', 'Vite'],
      link: 'https://github.com/TODO',
      iconName: 'satellite'
    },
    {
      id: 'proj-6',
      slotIndex: 5,
      title: 'TODO_PROJECT_6_TITLE',
      description: 'TODO_PROJECT_6_DESCRIPTION: Comprehensive design system with accessible components.',
      rarity: 'common',
      rarityColor: '#FFFFFF', // White
      tech: ['Figma', 'Storybook', 'Tailwind'],
      link: 'https://github.com/TODO',
      iconName: 'palette'
    }
  ],

  // 3 Journey Milestones (Snowy Peaks Crafting Scene)
  journey: [
    {
      id: 'journey-1',
      date: '2024 - NOW',
      title: 'TODO_JOURNEY_1_TITLE (e.g. Lead Developer / Creator)',
      description: 'TODO_JOURNEY_1_DESC: Crafting production web applications and 3D experiences for modern clients.',
      ingredients: ['code', 'layers', 'cloud']
    },
    {
      id: 'journey-2',
      date: '2023 - 2024',
      title: 'TODO_JOURNEY_2_TITLE (e.g. Full Stack Engineering)',
      description: 'TODO_JOURNEY_2_DESC: Engineering high-scale APIs, interactive frontends, and automated tooling.',
      ingredients: ['database', 'ruler', 'spark']
    },
    {
      id: 'journey-3',
      date: '2022 - 2023',
      title: 'TODO_JOURNEY_3_TITLE (e.g. Foundations & Building in Public)',
      description: 'TODO_JOURNEY_3_DESC: Open-source contributions, algorithms, UI experiments, and creative development.',
      ingredients: ['terminal', 'pickaxe', 'lantern']
    }
  ],

  // 4 Villager Trades (Village Scene)
  tradeLevelText: 'Master Builder · Level 2',
  trades: [
    {
      id: 'trade-1',
      service: 'TODO_TRADE_1: Landing Page',
      description: 'Single-page cinematic 3D website with smooth animations',
      price: 12,
      stockStatus: 'In stock',
      icon: 'monitor'
    },
    {
      id: 'trade-2',
      service: 'TODO_TRADE_2: Full Website',
      description: 'Multi-page full-stack web build + CMS integration',
      price: 28,
      stockStatus: 'In stock',
      icon: 'website'
    },
    {
      id: 'trade-3',
      service: 'TODO_TRADE_3: 3D & Motion Experiences',
      description: 'Custom WebGL / Three.js scenes, interactive physics & loops',
      price: 20,
      stockStatus: 'In stock',
      icon: 'clapperboard'
    },
    {
      id: 'trade-4',
      service: 'TODO_TRADE_4: Design System & Tokens',
      description: 'Accessible UI component library, tokens and brand identity',
      price: 36,
      stockStatus: 'Limited',
      icon: 'sparkles'
    }
  ],

  // Stat Counters (Villager Scene)
  stats: {
    builds: '20+',
    clients: '12+',
    countries: '3+'
  },

  // Advancements (Deep Dark Scene: 4 completed + 1 locked)
  advancements: [
    {
      id: 'adv-1',
      title: 'TODO_ADV_1_TITLE: Taking Inventory',
      description: 'TODO_ADV_1_DESC: Shipped first live production web project',
      completed: true,
      icon: 'chest'
    },
    {
      id: 'adv-2',
      title: 'TODO_ADV_2_TITLE: Into the Wider World',
      description: 'TODO_ADV_2_DESC: Collaborated with international teams and clients',
      completed: true,
      icon: 'globe'
    },
    {
      id: 'adv-3',
      title: 'TODO_ADV_3_TITLE: Hot Topic',
      description: 'TODO_ADV_3_DESC: Project featured or gained wide community recognition',
      completed: true,
      icon: 'fire'
    },
    {
      id: 'adv-4',
      title: 'TODO_ADV_4_TITLE: The Long Haul',
      description: 'TODO_ADV_4_DESC: 1000+ hours of continuous engineering consistency',
      completed: true,
      icon: 'hourglass'
    },
    {
      id: 'adv-5',
      title: 'TODO_ADV_5_TITLE: Free the End',
      description: 'TODO_ADV_5_DESC: Launch next major venture or product',
      completed: false,
      icon: 'portal'
    }
  ],

  // The End Scene
  endPoem: {
    title: 'THANKS FOR PLAYING',
    subtitle: 'The End',
    quote: 'You reached the end of the world. But every world has another seed. Go build something nobody expects.',
    respawnButtonText: 'Respawn'
  }
};
