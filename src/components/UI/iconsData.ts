// Icon constants and utilities
// This file contains all icon exports to maintain fast refresh compatibility

import {
  // Navigation & Layout
  Home,
  Search,
  User,
  Settings,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  ArrowRight,

  // Content & Documents
  FileText,
  Download,
  Upload,
  Save,
  Edit,
  Copy,
  Trash2,
  FolderOpen,
  Archive,
  Star,
  Bookmark,

  // Career & Job
  Briefcase,
  TrendingUp,
  Target,
  Award,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  Calendar,
  MapPin,
  Building,
  Users,
  Network,

  // Analytics & Data
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Brain,
  Lightbulb,
  Sparkles,
  MessageSquare,
  Eye,
  EyeOff,

  // Communication
  Mail,
  Phone,
  Send,
  Paperclip,
  Share2,

  // Authentication & Security
  Lock,
  Shield,
  Key,
  UserPlus,
  UserCheck,
  LogIn,
  LogOut,

  // Actions & States
  Plus,
  Minus,
  RefreshCw,
  Loader2,
  Filter,
  SortAsc,
  SortDesc,
  MoreVertical,
  MoreHorizontal,

  // Themes & Display
  Sun,
  Moon,
  Monitor,
  Palette,

  // Media & Creative
  Image,
  Video,
  Music,
  Camera,
  Mic,

  // Other Professional Icons
  GraduationCap,
  BookOpen,
  Laptop,
  Smartphone,
  Globe,
  CreditCard,
  Database,
  Cpu,
  Layers,
  Grid,
  List,
  ThumbsUp,
  ThumbsDown,
  Heart,
  ExternalLink,
  HelpCircle,
  Info
} from 'lucide-react';
import { useMemo } from 'react';

export interface IconComponent {
  className?: string;
  size?: string | number;
  color?: string;
}

// Export des icônes individuelles pour un accès facile
export const NavigationIcons = {
  Home,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  MoreVertical,
  MoreHorizontal
};

export const DocumentIcons = {
  FileText,
  Download,
  Upload,
  Save,
  Edit,
  Copy,
  Trash2,
  FolderOpen,
  Archive,
  Star,
  Bookmark,
  Briefcase
};

export const CareerIcons = {
  Briefcase,
  TrendingUp,
  Target,
  Award,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  Calendar,
  MapPin,
  Building,
  Users,
  Network,
  GraduationCap
};

export const AnalyticsIcons = {
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Brain,
  Lightbulb,
  Sparkles,
  Eye,
  EyeOff
};

export const CommunicationIcons = {
  Mail,
  Phone,
  MessageSquare,
  Send,
  Paperclip,
  Share2
};

export const AuthIcons = {
  Lock,
  Shield,
  Key,
  UserPlus,
  UserCheck,
  LogIn,
  LogOut,
  User
};

export const ActionIcons = {
  Plus,
  Minus,
  RefreshCw,
  Loader2,
  Filter,
  SortAsc,
  SortDesc,
  Save,
  Edit,
  Copy,
  Trash2
};

export const ThemeIcons = {
  Sun,
  Moon,
  Monitor,
  Palette
};

export const MediaIcons = {
  Image,
  Video,
  Music,
  Camera,
  Mic
};

export const SystemIcons = {
  Settings,
  Bell,
  User,
  Database,
  Cpu,
  Layers,
  Grid,
  List,
  Globe,
  CreditCard,
  Laptop,
  Smartphone,
  BookOpen
};

export const FeedbackIcons = {
  ThumbsUp,
  ThumbsDown,
  Heart,
  Star,
  CheckCircle,
  AlertCircle,
  AlertTriangle
};

export const UtilityIcons = {
  ExternalLink,
  HelpCircle,
  Info,
  Bookmark,
  Archive
};

// Hook pour les icônes contextuelles
export const useIcon = () => {
  const iconMap = useMemo(() => ({
    // Navigation
    home: NavigationIcons.Home,
    search: NavigationIcons.Search,
    menu: NavigationIcons.Menu,
    close: NavigationIcons.X,
    back: NavigationIcons.ArrowLeft,
    next: NavigationIcons.ArrowRight,

    // Documents
    file: DocumentIcons.FileText,
    download: DocumentIcons.Download,
    upload: DocumentIcons.Upload,
    save: DocumentIcons.Save,
    edit: DocumentIcons.Edit,
    copy: DocumentIcons.Copy,
    delete: DocumentIcons.Trash2,

    // Career
    job: CareerIcons.Briefcase,
    trend: CareerIcons.TrendingUp,
    target: CareerIcons.Target,
    award: CareerIcons.Award,
    success: CareerIcons.CheckCircle,
    warning: CareerIcons.AlertCircle,
    error: CareerIcons.AlertTriangle,
    time: CareerIcons.Clock,
    location: CareerIcons.MapPin,

    // Analytics
    chart: AnalyticsIcons.BarChart3,
    brain: AnalyticsIcons.Brain,
    lightbulb: AnalyticsIcons.Lightbulb,
    sparkles: AnalyticsIcons.Sparkles,

    // Communication
    email: CommunicationIcons.Mail,
    message: CommunicationIcons.MessageSquare,
    send: CommunicationIcons.Send,

    // Auth
    user: AuthIcons.User,
    lock: AuthIcons.Lock,
    shield: AuthIcons.Shield,

    // Actions
    add: ActionIcons.Plus,
    refresh: ActionIcons.RefreshCw,
    loading: ActionIcons.Loader2,
    filter: ActionIcons.Filter,

    // System
    settings: SystemIcons.Settings,
    bell: SystemIcons.Bell,
    database: SystemIcons.Database,

    // Theme
    sun: ThemeIcons.Sun,
    moon: ThemeIcons.Moon,
    monitor: ThemeIcons.Monitor
  }), []);

  const getIconByType = (type: string) => {
    return iconMap[type as keyof typeof iconMap] || NavigationIcons.Home;
  };

  return { getIconByType };
};
