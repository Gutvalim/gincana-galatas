import React from 'react';
import {
  Flame,
  BookOpen,
  Shield,
  Cross,
  Heart,
  Star,
  Anchor,
  Zap,
  Trophy,
  Crown,
  Compass,
  Users,
  Sun,
  Flag,
  Sparkles,
  Award,
} from 'lucide-react';

export const TEAM_ICONS_MAP: Record<string, React.FC<{ className?: string }>> = {
  Flame,
  BookOpen,
  Shield,
  Cross,
  Heart,
  Star,
  Anchor,
  Zap,
  Trophy,
  Crown,
  Compass,
  Users,
  Sun,
  Flag,
  Sparkles,
  Award,
};

interface TeamIconProps {
  icon?: string;
  className?: string;
}

export const TeamIcon: React.FC<TeamIconProps> = ({ icon, className = 'w-5 h-5' }) => {
  const IconComponent = (icon && TEAM_ICONS_MAP[icon]) ? TEAM_ICONS_MAP[icon] : Flame;
  return <IconComponent className={className} />;
};
