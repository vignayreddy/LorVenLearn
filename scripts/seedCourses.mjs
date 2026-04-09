/**
 * LorvenLearn Course Seeder
 * Run once: node scripts/seedCourses.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(resolve(__dirname, '../serviceAccountKey.json'), 'utf8'));
} catch {
  console.error('\n❌ ERROR: serviceAccountKey.json not found in project root.');
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore('ai-studio-371bd5a3-f7f5-47f8-b691-2c68455fa731');

// ── 30 Rich Courses ───────────────────────────────────────────────
const COURSES = [
  {
    id: 'course_web-architecture',
    title: 'Advanced Web Architecture',
    description: 'Master the art of building planet-scale systems. Covers distributed systems, microservices, and real-time Kafka pipelines.',
    price: 1999, originalPrice: 4999, rating: 4.8, category: 'Web Development', level: 'Advanced',
    instructorName: 'Vikram Nair', isBestseller: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=600',
    outcomes: ['Design microservices at scale', 'Implement event-driven APIs'],
    lessons: [
      { id: 'l1', title: 'The Architecture Mindset', content: 'C4 model and ADRs.', duration: 22, videoUrl: 'https://www.youtube.com/watch?v=y8OnoxKotPQ' },
      { id: 'l2', title: 'Microservices Fundamentals', content: 'Deep dive into services.', duration: 35, videoUrl: 'https://www.youtube.com/watch?v=1xo-0V08pMo' },
    ],
    quizzes: [
      { question: 'What does CQRS stand for?', options: ['Command Query Responsibility Segregation', 'Common Query Response System', 'Centralized Query Reporting Service'], correctAnswer: 0 },
      { question: 'Which tool is best for event steaming?', options: ['Redis', 'Kafka', 'MySQL'], correctAnswer: 1 }
    ]
  },
  {
    id: 'course_uiux-design',
    title: 'UI/UX Design Systems Masterclass',
    description: 'Master Figma and design psychology. Build professional design systems from scratch.',
    price: 1499, originalPrice: 3499, rating: 4.7, category: 'UI/UX Design', level: 'Intermediate',
    instructorName: 'Ananya Krishnaswamy', isBestseller: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600',
    outcomes: ['Build Figma design systems', 'Master UX research'],
    lessons: [
      { id: 'l1', title: 'Design Thinking', content: 'The 5-stage model.', duration: 20, videoUrl: 'https://www.youtube.com/watch?v=c9Wg6A_zE68' },
    ],
    quizzes: [
      { question: 'What is the first step in Design Thinking?', options: ['Ideate', 'Define', 'Empathize'], correctAnswer: 2 }
    ]
  },
  {
    id: 'course_fullstack-react',
    title: 'Full-Stack React & Node.js Bootcamp',
    description: 'Build production-grade MERN apps with React 19, TypeScript, and Node.js.',
    price: 2499, originalPrice: 5999, rating: 4.9, category: 'Web Development', level: 'Intermediate',
    instructorName: 'Rajan Mehta', isBestseller: true,
    thumbnailUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600',
    lessons: [
      { id: 'l1', title: 'React 19 Hooks', content: 'New hooks in React 19.', duration: 30, videoUrl: 'https://www.youtube.com/watch?v=0-S5a0eXPoc' },
    ],
    quizzes: [
      { question: 'Which hook was introduced in React 19?', options: ['useFormStatus', 'useEffect', 'useState'], correctAnswer: 0 }
    ]
  },
  {
    id: 'course_data-science',
    title: 'Data Science with Python',
    description: 'From data collection to ML models. Master NumPy, Pandas, and Scikit-Learn.',
    price: 2999, originalPrice: 6499, rating: 4.8, category: 'Data Science', level: 'Beginner',
    instructorName: 'Dr. Priya Chandran',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
    lessons: [
      { id: 'l1', title: 'NumPy Fundamentals', content: 'Arrays and vectors.', duration: 25, videoUrl: 'https://www.youtube.com/watch?v=ua-CiDNNj30' },
    ],
    quizzes: [
      { question: 'What is the primary library for dataframes in Python?', options: ['NumPy', 'Pandas', 'Matplotlib'], correctAnswer: 1 }
    ]
  },
  {
    id: 'course_cybersecurity',
    title: 'Ethical Hacking & Cybersecurity',
    description: 'Learn offensive security — reconnaissance, scanning, and exploitation.',
    price: 1899, originalPrice: 4499, rating: 4.7, category: 'Cybersecurity', level: 'Beginner',
    instructorName: 'Arjun Reddy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600',
    lessons: [
      { id: 'l1', title: 'Intro to Kali Linux', content: 'Setting up the environment.', duration: 22, videoUrl: 'https://www.youtube.com/watch?v=6mO_Q0n4u8' },
    ],
    quizzes: [
      { question: 'What does CIA triad stand for?', options: ['Confidentiality, Integrity, Availability', 'Control, Identity, Access', 'Core, Internal, Advanced'], correctAnswer: 0 }
    ]
  },
  {
    id: 'course_python-ai',
    title: 'Python for AI & Automation',
    description: 'Automate tasks and build AI agents with Python and LangChain.',
    price: 1799, originalPrice: 3499, rating: 4.8, category: 'Web Development', level: 'Intermediate',
    instructorName: 'Ravi Kumar',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
    lessons: [
      { id: 'l1', title: 'Web Scraping 101', content: 'BeautifulSoup and Requests.', duration: 18, videoUrl: 'https://www.youtube.com/watch?v=XVv6mJpR6oc' },
    ],
    quizzes: [
      { question: 'Which library is used for browser automation?', options: ['Pandas', 'Playwright', 'TensorFlow'], correctAnswer: 1 }
    ]
  },
  {
    id: 'course_fitness-yoga',
    title: 'Yoga & Performance Wellness',
    description: 'Science-backed yoga for entrepreneurs and high-performers.',
    price: 899, originalPrice: 1799, rating: 4.8, category: 'Health', level: 'Beginner',
    instructorName: 'Meena Patel',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600',
    lessons: [
      { id: 'l1', title: 'Breathwork Protocols', content: 'Wim Hof and Pranayama.', duration: 20, videoUrl: 'https://www.youtube.com/watch?v=tybOi4hjZFQ' },
    ],
    quizzes: [
      { question: 'What is HRV a biomarker for?', options: ['Stress & Recovery', 'Muscle Strength', 'Lung Capacity'], correctAnswer: 0 }
    ]
  },
  {
    id: 'course_rust',
    title: 'Rust Systems Programming',
    description: 'Build blazingly fast systems with Rust. Memory safety without garbage collection.',
    price: 2499, originalPrice: 5499, rating: 4.9, category: 'Web Development', level: 'Advanced',
    instructorName: 'Karthik Raja',
    thumbnailUrl: 'https://images.unsplash.com/photo-1629904853716-f0bc54eea481?w=600',
    lessons: [
      { id: 'l1', title: 'Ownership & Borrowing', content: 'The heart of Rust.', duration: 30, videoUrl: 'https://www.youtube.com/watch?v=VFI7_Nrk2p8' },
    ],
    quizzes: [
      { question: 'What ensures memory safety in Rust?', options: ['Garbage Collector', 'The Borrow Checker', 'Manual Freeing'], correctAnswer: 1 }
    ]
  },
  {
    id: 'course_aws-solutions',
    title: 'AWS Solutions Architect Masterclass',
    description: 'Master AWS services: EC2, S3, Lambda, and DynamoDB for professional certification.',
    price: 2799, originalPrice: 6999, rating: 4.8, category: 'DevOps', level: 'Intermediate',
    instructorName: 'Sathya Prakash',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600',
    lessons: [
      { id: 'l1', title: 'The Global Infrastructure', content: 'Regions and AZs.', duration: 25, videoUrl: 'https://www.youtube.com/watch?v=3hLmDS179YE' },
    ],
    quizzes: [
      { question: 'What is S3 primarily used for?', options: ['Object Storage', 'Compute', 'Database'], correctAnswer: 0 }
    ]
  },
  {
    id: 'course_prompt-engineering',
    title: 'AI Prompt Engineering Masterclass',
    description: 'Master advanced prompting techniques for Gemini, GPT-4, and Claude.',
    price: 1299, originalPrice: 2499, rating: 4.9, category: 'AI & Machine Learning', level: 'Beginner',
    instructorName: 'Geeta Sharma',
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600',
    lessons: [
      { id: 'l1', title: 'Chain of Thought', content: 'Reasoning with LLMs.', duration: 30, videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk' },
    ],
    quizzes: [
      { question: 'What is few-shot prompting?', options: ['Providing examples in the prompt', 'A short prompt', 'Fast inference'], correctAnswer: 0 }
    ]
  },
  {
    id: 'course_golang',
    title: 'Go for Backend Engineering',
    description: 'Build scalable concurrent backends with Go and Goroutines.',
    price: 1899, originalPrice: 3999, rating: 4.7, category: 'Web Development', level: 'Intermediate',
    instructorName: 'Rahul Saxena',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600',
    lessons: [
      { id: 'l1', title: 'Channels & Goroutines', content: 'Concurrency in Go.', duration: 35, videoUrl: 'https://www.youtube.com/watch?v=yyUHQyHyW20' },
    ],
    quizzes: [
      { question: 'Which keyword starts a concurrent process in Go?', options: ['async', 'thread', 'go'], correctAnswer: 2 }
    ]
  },
  {
    id: 'course_docker-k8s',
    title: 'Containerization with Docker & K8s',
    description: 'Master container orchestration and deployment at scale.',
    price: 2299, originalPrice: 4999, rating: 4.8, category: 'DevOps', level: 'Advanced',
    instructorName: 'Suresh Balakrishnan',
    thumbnailUrl: 'https://images.unsplash.com/photo-1605745341112-85968b193ef5?w=600',
    lessons: [
      { id: 'l1', title: 'Kubernetes Pods & Services', content: 'Orchestration 101.', duration: 40, videoUrl: 'https://www.youtube.com/watch?v=X48VuDVv0do' },
    ],
    quizzes: [
      { question: 'What is the smallest deployable unit in K8s?', options: ['Container', 'Pod', 'Node'], correctAnswer: 1 }
    ]
  },
  {
    id: 'course_sql-mastery',
    title: 'Advanced SQL & Database Design',
    description: 'PostgreSQL, query optimization, and complex database schema design.',
    price: 1499, originalPrice: 2999, rating: 4.7, category: 'Web Development', level: 'Intermediate',
    instructorName: 'Deepak Nambiar',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600',
    lessons: [
      { id: 'l1', title: 'Indexing for Speed', content: 'B-tree and Hash indexes.', duration: 28, videoUrl: 'https://www.youtube.com/watch?v=HubezKbFL78' },
    ],
    quizzes: [
      { question: 'Which index type is default in Postgres?', options: ['B-Tree', 'Hash', 'GiST'], correctAnswer: 0 }
    ]
  },
  {
    id: 'course_mobile-flutter',
    title: 'Flutter Mobile Development',
    description: 'Build native iOS and Android apps with Dart and Flutter.',
    price: 2499, originalPrice: 5999, rating: 4.9, category: 'Mobile Development', level: 'Beginner',
    instructorName: 'Kiran Pillai',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600',
    lessons: [
      { id: 'l1', title: 'Everything is a Widget', content: 'Flutter layout system.', duration: 30, videoUrl: 'https://www.youtube.com/watch?v=VPvVD8t02U8' },
    ],
    quizzes: [
      { question: 'What is the programming language for Flutter?', options: ['Java', 'Dart', 'Kotlin'], correctAnswer: 1 }
    ]
  },
  {
    id: 'course_digital-growth',
    title: 'Growth Hacking & Digital Ads',
    description: 'Meta Ads, Google Ads, and SEO strategies for rapid product growth.',
    price: 1299, originalPrice: 2999, rating: 4.6, category: 'Marketing', level: 'Beginner',
    instructorName: 'Meera Iyer',
    thumbnailUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600',
    lessons: [
      { id: 'l1', title: 'Conversion Funnels', content: 'Optimizing the customer journey.', duration: 32, videoUrl: 'https://www.youtube.com/watch?v=nU-IIXBWln4' },
    ],
    quizzes: [
      { question: 'What does CAC stand for?', options: ['Customer Acquisition Cost', 'Core Activity Central', 'Calculated App Click'], correctAnswer: 0 }
    ]
  },
  {
    id: 'course_stock-trading-pro',
    title: 'Professional Stock Trading',
    description: 'Technical analysis and options strategies for the Indian market.',
    price: 2999, originalPrice: 6499, rating: 4.8, category: 'Finance', level: 'Intermediate',
    instructorName: 'Anand Kumar',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600',
    lessons: [
      { id: 'l1', title: 'Candlestick Mastery', content: 'Reading the price action.', duration: 40, videoUrl: 'https://www.youtube.com/watch?v=7_8_fU6z1kU' },
    ],
    quizzes: [
      { question: 'Which pattern indicates a reversal?', options: ['Head & Shoulders', 'Rising Wedge', 'Both'], correctAnswer: 2 }
    ]
  },
  {
    id: 'course_langchain-ai',
    title: 'Build AI Apps with LangChain',
    description: 'Build RAG pipelines and AI agents using LangChain and Gemini.',
    price: 3499, originalPrice: 7999, rating: 4.9, category: 'AI & Machine Learning', level: 'Advanced',
    instructorName: 'Venkat Subramanian',
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600',
    lessons: [
      { id: 'l1', title: 'Retrieval Augmented Generation', content: 'What is RAG?', duration: 45, videoUrl: 'https://www.youtube.com/watch?v=LhnCsL7Z_IE' },
    ],
    quizzes: [
      { question: 'What is a Vector Database used for?', options: ['Storing embeddings', 'Relational data', 'Caches'], correctAnswer: 0 }
    ]
  },
  {
    id: 'course_micro-frontends',
    title: 'Micro-frontends & Module Federation',
    description: 'Scalable frontend architectures for large teams.',
    price: 2799, originalPrice: 5499, rating: 4.8, category: 'Web Development', level: 'Advanced',
    instructorName: 'Dr. Shruti Rao',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600',
    lessons: [
      { id: 'l1', title: 'Module Federation Intro', content: 'Sharing code at runtime.', duration: 38, videoUrl: 'https://www.youtube.com/watch?v=l_vS-R49V4uGg' },
    ],
    quizzes: [
      { question: 'Which tool popularized Module Federation?', options: ['Webpack 5', 'Vite', 'Babel'], correctAnswer: 0 }
    ]
  },
  {
    id: 'course_soft-skills-eng',
    title: 'Leadership for Engineers',
    description: 'Communication, emotional intelligence, and team leadership for tech leads.',
    price: 999, originalPrice: 1999, rating: 4.9, category: 'Business', level: 'Beginner',
    instructorName: 'Sunita Agarwal',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600',
    lessons: [
      { id: 'l1', title: 'Conflict Resolution', content: 'Handling team disagreements.', duration: 24, videoUrl: 'https://www.youtube.com/watch?v=f-B6_7-8-3-A' },
    ],
    quizzes: [
      { question: 'What is EQ?', options: ['Emotional Quotient', 'Engineering Quality', 'Effective Quest'], correctAnswer: 0 }
    ]
  },
  {
    id: 'course_figma-to-code',
    title: 'Figma to Code Masterclass',
    description: 'Bridge the gap between design and development.',
    price: 1299, originalPrice: 2499, rating: 4.7, category: 'UI/UX Design', level: 'Beginner',
    instructorName: 'Kavitha Nair',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=600',
    lessons: [
      { id: 'l1', title: 'Measuring in Figma', content: 'Extracting CSS values.', duration: 22, videoUrl: 'https://www.youtube.com/watch?v=2f3T6G_oH-o' },
    ],
    quizzes: [
      { question: 'What is the best format for web icons?', options: ['SVG', 'PNG', 'JPEG'], correctAnswer: 0 }
    ]
  },
  {
    id: 'course_nextjs-mastery',
    title: 'Next.js 15 Masterclass',
    description: 'Master Server Components, Server Actions, and the App Router.',
    price: 2499, originalPrice: 5999, rating: 4.9, category: 'Web Development', level: 'Advanced',
    instructorName: 'Vikram Nair',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=600',
    lessons: [
      { id: 'l1', title: 'Server Components', content: 'Why server components matter.', duration: 35, videoUrl: 'https://www.youtube.com/watch?v=68T0_A_T1_k' },
    ],
    quizzes: [
      { question: 'Can Server Components hold state?', options: ['Yes', 'No'], correctAnswer: 1 }
    ]
  },
  {
    id: 'course_postman-api',
    title: 'API Testing with Postman',
    description: 'Professional API testing, environments, and automated collection runs.',
    price: 899, originalPrice: 1999, rating: 4.7, category: 'Web Development', level: 'Beginner',
    instructorName: 'Arjun Reddy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494943-9839352723c3?w=600',
    lessons: [
      { id: 'l1', title: 'Collections & Environments', content: 'Managing variables.', duration: 30, videoUrl: 'https://www.youtube.com/watch?v=F3S01_u55d8' },
    ],
    quizzes: [
      { question: 'What status code means Successful?', options: ['200', '404', '500'], correctAnswer: 0 }
    ]
  },
  {
    id: 'course_tailwindcss',
    title: 'Tailwind CSS in Production',
    description: 'Build premium landing pages rapidly with utility-first CSS.',
    price: 1199, originalPrice: 2499, rating: 4.8, category: 'UI/UX Design', level: 'Beginner',
    instructorName: 'Ananya Krishnaswamy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600',
    lessons: [
      { id: 'l1', title: 'Flexbox vs Grid in Tailwind', content: 'Layout strategies.', duration: 32, videoUrl: 'https://www.youtube.com/watch?v=mDqD6I_yVwY' },
    ],
    quizzes: [
      { question: 'Is Tailwind utility-first?', options: ['Yes', 'No'], correctAnswer: 0 }
    ]
  },
  {
    id: 'course_django-pro',
    title: 'Django for Professionals',
    description: 'Build enterprise-grade web apps with Python and Django.',
    price: 2299, originalPrice: 4999, rating: 4.7, category: 'Web Development', level: 'Intermediate',
    instructorName: 'Dr. Priya Chandran',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600',
    lessons: [
      { id: 'l1', title: 'Django ORM Mastery', content: 'Efficient database queries.', duration: 45, videoUrl: 'https://www.youtube.com/watch?v=D-P_Wk6Y0kI' },
    ],
    quizzes: [
      { question: 'What is a "QuerySet" in Django?', options: ['A DB connection', 'A collection of objects from the DB', 'A template tag'], correctAnswer: 1 }
    ]
  },
  {
    id: 'course_graphql',
    title: 'GraphQL API Design',
    description: 'Design flexible APIs with GraphQL, Apollo, and Prisma.',
    price: 2499, originalPrice: 5999, rating: 4.8, category: 'Web Development', level: 'Advanced',
    instructorName: 'Rajan Mehta',
    thumbnailUrl: 'https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=600',
    lessons: [
      { id: 'l1', title: 'Queries & Mutations', content: 'Defining the schema.', duration: 38, videoUrl: 'https://www.youtube.com/watch?v=ed8SzALpx1Q' },
    ],
    quizzes: [
      { question: 'Does GraphQL prevent over-fetching?', options: ['Yes', 'No'], correctAnswer: 0 }
    ]
  },
  {
    id: 'course_unreal-engine',
    title: 'Game Dev with Unreal Engine 5',
    description: 'Build AAA-quality games with Blueprints and C++ in UE5.',
    price: 3199, originalPrice: 7999, rating: 4.9, category: 'AI & Machine Learning', level: 'Intermediate',
    instructorName: 'Vikram Nair',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600',
    lessons: [
      { id: 'l1', title: 'Lumen & Nanite', content: 'Realistic lighting and geometry.', duration: 55, videoUrl: 'https://www.youtube.com/watch?v=TM8Y-qfC3-c' },
    ],
    quizzes: [
      { question: 'What is the visual scripting tool in UE5?', options: ['Blueprints', 'C-Sharp', 'Lua'], correctAnswer: 0 }
    ]
  },
  {
    id: 'course_digital-portrait',
    title: 'Digital Portrait Painting',
    description: 'Master anatomical drawing and digital painting in Procreate.',
    price: 1599, originalPrice: 3499, rating: 4.8, category: 'Photography', level: 'All Levels',
    instructorName: 'Deepa Menon',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600',
    lessons: [
      { id: 'l1', title: 'Shading & Texture', content: 'Creating depth in digital art.', duration: 42, videoUrl: 'https://www.youtube.com/watch?v=F3S01_u55d8' },
    ],
    quizzes: [
      { question: 'Which app is best for digital painting on iPad?', options: ['Procreate', 'Excel', 'VS Code'], correctAnswer: 0 }
    ]
  },
  {
    id: 'course_cryptocurrency',
    title: 'Crypto Investing & Web3',
    description: 'Understand Bitcoin, Ethereum, and DeFi for smart investing.',
    price: 1999, originalPrice: 4499, rating: 4.7, category: 'Finance', level: 'Beginner',
    instructorName: 'Venkat Subramanian',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=600',
    lessons: [
      { id: 'l1', title: 'Smart Contracts 101', content: 'Automated trust on the chain.', duration: 30, videoUrl: 'https://www.youtube.com/watch?v=ZE2HxVaNPvA' },
    ],
    quizzes: [
      { question: 'What is a "Gas Fee"?', options: ['A reward for miners', 'A transaction cost', 'The price of BTC'], correctAnswer: 1 }
    ]
  },
  {
    id: 'course_agile-jira',
    title: 'Agile & Jira for Project Managers',
    description: 'Scrum, Kanban, and modern project management with Jira.',
    price: 1499, originalPrice: 3499, rating: 4.6, category: 'Business', level: 'Intermediate',
    instructorName: 'Sunita Agarwal',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600',
    lessons: [
      { id: 'l1', title: 'Managing Backlogs', content: 'Prioritizing stories.', duration: 25, videoUrl: 'https://www.youtube.com/watch?v=9jD_S68pX-c' },
    ],
    quizzes: [
      { question: 'What is a "Sprint"?', options: ['A long project phase', 'A time-boxed development cycle', 'A fast run'], correctAnswer: 1 }
    ]
  },
  {
    id: 'course_clean-code',
    title: 'Clean Code & SOLID Design',
    description: 'Write maintainable, professional code that teams love.',
    price: 2499, originalPrice: 4999, rating: 4.9, category: 'Web Development', level: 'Advanced',
    instructorName: 'Karthik Raja',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600',
    lessons: [
      { id: 'l1', title: 'SOLID Principles Explained', content: '5 rules for better code.', duration: 40, videoUrl: 'https://www.youtube.com/watch?v=pTB30aXS77k' },
    ],
    quizzes: [
      { question: 'What does "S" stand for in SOLID?', options: ['Single Responsibility', 'Simple Solutions', 'Secondary Sync'], correctAnswer: 0 }
    ]
  }
];

// Ensure every course has at least 12 lessons
COURSES.forEach(course => {
  if (!course.lessons) course.lessons = [];
  while (course.lessons.length < 12) {
    const idx = course.lessons.length + 1;
    course.lessons.push({
      id: `l${idx}`,
      title: `Advanced Module ${idx}: Comprehensive Overview`,
      content: `This is a comprehensive deep dive into module ${idx}. Here you will explore advanced topics, architectural patterns, and hands-on exercises to master the subject matter completely.`,
      duration: 15 + idx,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    });
  }
});


async function seed() {
  console.log(`\n🚀 LorvenLearn Course Seeder\n   Seeding ${COURSES.length} courses with Quizzes & Videos...\n`);
  const batch = db.batch();

  for (const course of COURSES) {
    const { id, ...data } = course;
    const ref = db.collection('courses').doc(id);
    batch.set(ref, {
      ...data,
      instructorId: 'admin-seed',
      totalStudents: Math.floor(Math.random() * 4000) + 500,
      language: 'English',
      createdAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`   ✅ Queued: ${course.title} (+ Quiz)`);
  }

  await batch.commit();
  console.log(`\n🎉 Success! ${COURSES.length} premium courses written to Firestore.\n`);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
