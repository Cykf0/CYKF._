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
  owner: "Saksham Panwar",
  mcUsername: "Cykf_",
  skinPath: "/skins/cykf.png",
  skinModel: "auto", // 'auto' auto-detects 4px classic vs 3px slim
  enableCape: false,
  enableSkinSwap: true,

  // Contact Info
  email: "sakshampanwar0312@rediffmail.com",
  location: "Gurgaon (GGN), Haryana, India",
  linkedin: "https://www.linkedin.com/in/saksham-panwar-9847b3412/",
  instagram: "https://instagram.com/cykf._",
  github: "https://github.com/Cykf0",

  // Player Profile
  bio: "Full-Stack Software Engineer & Creative Developer based in Gurgaon, Haryana. Crafting high-performance web applications, interactive 3D voxel experiences, audio AI/PWA engineering, and distributed architectures.",
  role: "Full-Stack Software Engineer",
  level: "Level 25 · Full Stack Architect",
  server: "Gurgaon · Haryana · India",
  status: "Open for Opportunities & Collaborations",

  // Exact 7 Skills from reference
  skills: [
    { id: 'html-css', name: 'HTML / CSS / Tailwind', romanLevel: 'V', percentage: 95 },
    { id: 'javascript', name: 'JavaScript / TypeScript', romanLevel: 'V', percentage: 92 },
    { id: 'react-three', name: 'React / Next.js / Three.js', romanLevel: 'V', percentage: 90 },
    { id: 'python-backend', name: 'Python & Backend APIs', romanLevel: 'IV', percentage: 85 },
    { id: 'ui-ux', name: 'UI / UX & Design Systems', romanLevel: 'V', percentage: 88 },
    { id: 'audio-pwa', name: 'PWA & Audio AI Systems', romanLevel: 'IV', percentage: 84 },
    { id: 'cloud-git', name: 'Git & Cloud DevOps', romanLevel: 'IV', percentage: 86 },
  ],

  // 6 Completed Builds (Chest Scene)
  projects: [
    {
      id: 'proj-1',
      slotIndex: 0,
      title: 'CYKF._ 3D Minecraft Portfolio',
      description: 'Cinematic 9-scene interactive 3D Minecraft voxel portfolio built with React Three Fiber, custom GLSL shaders, authentic audio, and responsive GUI.',
      rarity: 'legendary',
      rarityColor: '#FFAA00', // Gold / Orange
      tech: ['React', 'Three.js', 'TypeScript', 'Tailwind'],
      link: 'https://github.com/Cykf0/CYKF._',
      iconName: 'nether-star'
    },
    {
      id: 'proj-2',
      slotIndex: 1,
      title: 'Distributed Cloud Services & Telemetry',
      description: 'High-throughput microservices architecture with real-time WebSocket state distribution, low-latency caching, and live telemetry.',
      rarity: 'epic',
      rarityColor: '#FF55FF', // Magenta
      tech: ['TypeScript', 'Node.js', 'WebSockets', 'Redis'],
      link: 'https://github.com/Cykf0',
      iconName: 'potion'
    },
    {
      id: 'proj-3',
      slotIndex: 2,
      title: 'Real-time Telemetry & State Hub',
      description: 'High-throughput real-time telemetry dashboard and state management pipeline for distributed microservices and WebSocket event feeds.',
      rarity: 'rare',
      rarityColor: '#55FFFF', // Cyan
      tech: ['TypeScript', 'Zustand', 'Node.js', 'WebSockets'],
      link: 'https://github.com/Cykf0',
      iconName: 'spyglass'
    },
    {
      id: 'proj-4',
      slotIndex: 3,
      title: 'Autonomous AI Agent Stack',
      description: 'Autonomous AI agent framework with multi-turn reasoning, tool execution, grounding pipelines, and asynchronous background tasks.',
      rarity: 'epic',
      rarityColor: '#FFFF55', // Yellow
      tech: ['Gemini API', 'Vector DB', 'Python', 'FastAPI'],
      link: 'https://github.com/Cykf0',
      iconName: 'lightning'
    },
    {
      id: 'proj-5',
      slotIndex: 4,
      title: 'Procedural Shader & Graphics Lab',
      description: 'Dynamic voxel terrain rendering, fluid physics simulations, post-processing FX, and custom GLSL vertex/fragment shaders.',
      rarity: 'epic',
      rarityColor: '#AA00AA', // Purple
      tech: ['GLSL', 'Three.js', 'R3F', 'Vite'],
      link: 'https://github.com/Cykf0',
      iconName: 'satellite'
    },
    {
      id: 'proj-6',
      slotIndex: 5,
      title: 'Modular Accessible Design System',
      description: 'Comprehensive pixel-perfect design system and accessible UI component architecture with fluid responsive scaling.',
      rarity: 'rare',
      rarityColor: '#55FF55', // Green
      tech: ['Figma', 'Storybook', 'Tailwind', 'a11y'],
      link: 'https://github.com/Cykf0',
      iconName: 'palette'
    }
  ],

  // 3 Journey Milestones (Snowy Peaks Crafting Scene)
  journey: [
    {
      id: 'journey-1',
      date: '2024 - Present',
      title: 'Lead Full-Stack & WebGL Engineer',
      description: 'Crafting production web applications, interactive 3D voxel experiences, and real-time client systems.',
      ingredients: ['code', 'layers', 'cloud']
    },
    {
      id: 'journey-2',
      date: '2023 - 2024',
      title: 'Full-Stack Software Engineer',
      description: 'Engineering scalable microservices, reactive frontend architectures, and automated testing pipelines.',
      ingredients: ['database', 'ruler', 'spark']
    },
    {
      id: 'journey-3',
      date: '2022 - 2023',
      title: 'Foundations & Open Source Engineering',
      description: 'Algorithm design, data structures, civic safety tech (Awaaz Map), and developer tooling.',
      ingredients: ['terminal', 'pickaxe', 'lantern']
    }
  ],

  // 4 Villager Trades (Village Scene)
  tradeLevelText: 'Master Engineer · Level 5',
  trades: [
    {
      id: 'trade-1',
      service: 'Cinematic 3D Web Experiences',
      description: 'Single-page cinematic 3D website with smooth camera paths & animations',
      price: 12,
      stockStatus: 'In stock',
      icon: 'monitor'
    },
    {
      id: 'trade-2',
      service: 'Full-Stack Web App Development',
      description: 'Multi-page full-stack web build with database and cloud integration',
      price: 28,
      stockStatus: 'In stock',
      icon: 'website'
    },
    {
      id: 'trade-3',
      service: 'Interactive WebGL & Shaders',
      description: 'Custom WebGL / Three.js scenes, interactive physics & procedural loops',
      price: 20,
      stockStatus: 'In stock',
      icon: 'clapperboard'
    },
    {
      id: 'trade-4',
      service: 'Design Systems & UI Kits',
      description: 'Accessible UI component library, design tokens, and brand identity',
      price: 16,
      stockStatus: 'Limited',
      icon: 'sparkles'
    }
  ],

  // Stat Counters (Villager Scene)
  stats: {
    builds: '6',
    clients: '00',
    countries: '1'
  },

  // Advancements (Deep Dark Scene: 4 completed + 1 locked)
  advancements: [
    {
      id: 'adv-1',
      title: 'Taking Inventory',
      description: 'Shipped first live production web project',
      completed: true,
      icon: 'chest'
    },
    {
      id: 'adv-2',
      title: 'Into the Wider World',
      description: 'Shipped open source projects and explored modern web frameworks',
      completed: true,
      icon: 'globe'
    },
    {
      id: 'adv-3',
      title: 'Hot Topic',
      description: 'Constructed high-impact web apps featured across developer communities',
      completed: true,
      icon: 'fire'
    },
    {
      id: 'adv-4',
      title: 'The Long Haul',
      description: '1000+ hours of continuous engineering consistency & problem solving',
      completed: true,
      icon: 'hourglass'
    },
    {
      id: 'adv-5',
      title: 'Free the End',
      description: 'Launch next major product and engineering milestone',
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
