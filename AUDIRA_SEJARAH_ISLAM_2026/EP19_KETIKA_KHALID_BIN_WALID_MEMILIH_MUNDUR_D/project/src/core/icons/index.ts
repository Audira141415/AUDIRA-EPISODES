/**
 * AUDIRA Icon System — powered by lucide-react (bundled, no network at render time).
 *
 * Usage:
 *   import { TrendingUp, AlertTriangle, Icon } from '../core/icons';
 *   <TrendingUp size={48} color="#fff" strokeWidth={1.5} />
 *
 * Default props baked into every icon via AudiraIcon wrapper:
 *   size       = 48   (safe for 1080×1920 HUD)
 *   strokeWidth= 1.5  (matches AUDIRA visual weight)
 *   color      = currentColor (inherits CSS color)
 *
 * For HUD Kinetic Callout (Hukum Mutlak 4), pair with KineticCounter:
 *   <div style={{ color: '#FFD700' }}><TrendingUp /><KineticCounter value={2000000} /></div>
 *
 * Icon categories below — pick the closest semantic match.
 */

export {
  // ── Data & Stats ──────────────────────────────────────────────
  TrendingUp,
  TrendingDown,
  BarChart2,
  BarChart3,
  BarChart4,
  PieChart,
  LineChart,
  Activity,
  Sigma,
  Hash,
  Percent,
  CircleDollarSign,
  Coins,
  Banknote,
  Wallet,
  // ── Status & Alert ────────────────────────────────────────────
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Info,
  ShieldAlert,
  Flame,
  Zap,
  // ── Geography & Map ───────────────────────────────────────────
  MapPin,
  Map,
  Globe,
  Globe2,
  Compass,
  Navigation,
  Navigation2,
  // ── Time & History ────────────────────────────────────────────
  Clock,
  Clock3,
  Clock8,
  Timer,
  CalendarDays,
  Calendar,
  History,
  // ── Science & Tech ────────────────────────────────────────────
  Atom,
  Cpu,
  Dna,
  Microscope,
  Rocket,
  Satellite,
  Telescope,
  FlaskConical,
  BrainCircuit,
  Network,
  // ── People & Society ──────────────────────────────────────────
  Users,
  User,
  UserCheck,
  Heart,
  HandHeart,
  Baby,
  Stethoscope,
  // ── Environment ───────────────────────────────────────────────
  Leaf,
  Wind,
  Droplets,
  Thermometer,
  Mountain,
  Trees,
  Sun,
  CloudRain,
  // ── War & Conflict ────────────────────────────────────────────
  Swords,
  Shield,
  Bomb,
  Target,
  CrosshairIcon,
  // ── Economy & Industry ────────────────────────────────────────
  Factory,
  Landmark,
  Building2,
  Ship,
  Plane,
  Car,
  Truck,
  // ── Generic UI ────────────────────────────────────────────────
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ChevronRight,
  ChevronUp,
  Star,
  Award,
  Trophy,
  Crown,
  BookOpen,
  Newspaper,
  Search,
  Eye,
} from 'lucide-react';

export type { LucideIcon, LucideProps } from 'lucide-react';

/**
 * AUDIRA default icon props for HUD use.
 * Spread onto any lucide icon: <TrendingUp {...ICON_HUD} />
 */
export const ICON_HUD = {
  size: 48,
  strokeWidth: 1.5,
} as const;

/**
 * Smaller variant for inline text callouts.
 */
export const ICON_INLINE = {
  size: 32,
  strokeWidth: 1.5,
} as const;

/**
 * Large hero variant for full-screen data reveals.
 */
export const ICON_HERO = {
  size: 96,
  strokeWidth: 1,
} as const;
