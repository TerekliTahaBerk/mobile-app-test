import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { theme } from '@/shared/ui/theme/tokens';

/**
 * The design's icon set, transcribed one-for-one from the imported canvas.
 * Every icon here is decorative — the control that owns it carries the
 * accessible label — so none of them set accessibility props.
 *
 * Icons come in two viewBoxes, matching the source: 20x20 for interface glyphs
 * and 24x24 for the subject marks.
 */

export type IconProps = {
  color?: string | undefined;
  size?: number | undefined;
};

type StrokeIconProps = IconProps & {
  strokeWidth?: number | undefined;
};

function Glyph20({ children, size }: { children: React.ReactNode; size: number }) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 20 20" width={size}>
      {children}
    </Svg>
  );
}

function Glyph24({ children, size }: { children: React.ReactNode; size: number }) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      {children}
    </Svg>
  );
}

// --- Navigation -------------------------------------------------------------

export function HomeIcon({ color = theme.colors.navigation.inactive, size = 23 }: IconProps) {
  return (
    <Glyph20 size={size}>
      <Path
        d="M3 8.5 10 3l7 5.5V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"
        stroke={color}
        strokeWidth={1.8}
      />
    </Glyph20>
  );
}

export function LearnIcon({ color = theme.colors.navigation.inactive, size = 23 }: IconProps) {
  return (
    <Glyph20 size={size}>
      <Rect height={13} rx={3} stroke={color} strokeWidth={1.8} width={14} x={3} y={4} />
      <Path d="M10 4v13" stroke={color} strokeWidth={1.8} />
    </Glyph20>
  );
}

export function LeagueIcon({ color = theme.colors.navigation.inactive, size = 23 }: IconProps) {
  return (
    <Glyph20 size={size}>
      <Path d="M4 16V9M10 16V4M16 16v-5" stroke={color} strokeWidth={1.8} />
    </Glyph20>
  );
}

export function ProfileIcon({ color = theme.colors.navigation.inactive, size = 23 }: IconProps) {
  return (
    <Glyph20 size={size}>
      <Circle cx={10} cy={7} r={3.2} stroke={color} strokeWidth={1.8} />
      <Path d="M4 17c1.5-3 4-4 6-4s4.5 1 6 4" stroke={color} strokeWidth={1.8} />
    </Glyph20>
  );
}

// --- Chrome -----------------------------------------------------------------

export function CloseIcon({ color = theme.colors.text.muted, size = 22 }: IconProps) {
  return (
    <Glyph20 size={size}>
      <Path d="M5 5l10 10M15 5L5 15" stroke={color} strokeWidth={2.2} />
    </Glyph20>
  );
}

export function BackIcon({ color = theme.colors.text.muted, size = 22 }: IconProps) {
  return (
    <Glyph20 size={size}>
      <Path d="M13 4l-6 6 6 6" stroke={color} strokeWidth={2} />
    </Glyph20>
  );
}

export function ChevronIcon({ color = theme.colors.text.muted, size = 18 }: IconProps) {
  return (
    <Glyph20 size={size}>
      <Path d="M8 5l5 5-5 5" stroke={color} strokeWidth={2} />
    </Glyph20>
  );
}

export function CheckIcon({
  color = theme.colors.text.inverse,
  size = 15,
  strokeWidth = 3,
}: StrokeIconProps) {
  return (
    <Glyph20 size={size}>
      <Path d="M4 10.5l4 4 8-9" stroke={color} strokeWidth={strokeWidth} />
    </Glyph20>
  );
}

export function PlusIcon({ color = theme.colors.text.muted, size = 20 }: IconProps) {
  return (
    <Glyph20 size={size}>
      <Path d="M10 5v10M5 10h10" stroke={color} strokeWidth={2} />
    </Glyph20>
  );
}

export function DragHandleIcon({ color = theme.colors.status.successInk, size = 20 }: IconProps) {
  return (
    <Glyph20 size={size}>
      <Path d="M5 7h10M5 13h10" stroke={color} strokeWidth={1.8} />
    </Glyph20>
  );
}

// --- Economy ----------------------------------------------------------------

export function StreakIcon({ color = theme.colors.reward.streak, size = 17 }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 20 20" width={size}>
      <Path
        d="M10 18c3 0 5.2-2 5.2-4.7 0-3-3.2-4.6-5.2-9.3-2 4.7-5.2 6.3-5.2 9.3C4.8 16 7 18 10 18z"
        fill={color}
      />
    </Svg>
  );
}

export function HeartIcon({ color = theme.colors.reward.heart, size = 17 }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 20 20" width={size}>
      <Path
        d="M10 17S3 12.6 3 8.3A3.8 3.8 0 0 1 10 6a3.8 3.8 0 0 1 7 2.3C17 12.6 10 17 10 17z"
        fill={color}
      />
    </Svg>
  );
}

export function HeartOutlineIcon({ color = theme.colors.reward.heart, size = 18 }: IconProps) {
  return (
    <Glyph20 size={size}>
      <Path
        d="M10 17S3 12.6 3 8.3A3.8 3.8 0 0 1 10 6a3.8 3.8 0 0 1 7 2.3C17 12.6 10 17 10 17z"
        stroke={color}
        strokeWidth={2}
      />
    </Glyph20>
  );
}

export function HeartBrokenIcon({ color = theme.colors.reward.heart, size = 26 }: IconProps) {
  return (
    <Glyph20 size={size}>
      <Path
        d="M10 17S3 12.6 3 8.3A3.8 3.8 0 0 1 10 6a3.8 3.8 0 0 1 7 2.3C17 12.6 10 17 10 17z"
        stroke={color}
        strokeWidth={2}
      />
      <Path d="M6 4l8 12" stroke={color} strokeWidth={2} />
    </Glyph20>
  );
}

export function StarIcon({ color = theme.colors.reward.badge, size = 26 }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M12 3l2.6 5.6 6 .7-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.3l6-.7z"
        fill={color}
      />
    </Svg>
  );
}

export function TrophyIcon({ color = theme.colors.subject.history.primary, size = 20 }: IconProps) {
  return (
    <Glyph20 size={size}>
      <Circle cx={10} cy={8} r={4.6} stroke={color} strokeWidth={1.8} />
      <Path d="M7 13l-1 4 4-2 4 2-1-4" stroke={color} strokeWidth={1.8} />
    </Glyph20>
  );
}

export function BookmarkIcon({ color = theme.colors.reward.badgeSoft, size = 24 }: IconProps) {
  return (
    <Glyph20 size={size}>
      <Path d="M5 3h10v14l-5-3-5 3z" stroke={color} strokeWidth={1.6} />
    </Glyph20>
  );
}

// --- Exercise and path ------------------------------------------------------

export function PlayIcon({ color = theme.colors.text.inverse, size = 30 }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 20 20" width={size}>
      <Path d="M7 4.5l9 5.5-9 5.5z" fill={color} />
    </Svg>
  );
}

export function BlankIcon({
  color = theme.colors.subject.history.primary,
  size = 26,
  strokeWidth = 2,
}: StrokeIconProps) {
  return (
    <Glyph24 size={size}>
      <Rect height={12} rx={3} stroke={color} strokeWidth={strokeWidth} width={16} x={4} y={6} />
      <Path d="M8 11h6" stroke={color} strokeWidth={strokeWidth} />
    </Glyph24>
  );
}

export function LockIcon({ color = theme.colors.path.lockedGlyph, size = 23 }: IconProps) {
  return (
    <Glyph20 size={size}>
      <Rect height={8} rx={2.5} stroke={color} strokeWidth={2} width={12} x={4} y={9} />
      <Path d="M7 9V7a3 3 0 0 1 6 0v2" stroke={color} strokeWidth={2} />
    </Glyph20>
  );
}

export function UnlockedIcon({ color = theme.colors.action.primary, size = 19 }: IconProps) {
  return (
    <Glyph20 size={size}>
      <Rect height={8} rx={2.5} stroke={color} strokeWidth={2} width={12} x={4} y={9} />
      <Path d="M13 9V7a3 3 0 0 0-6 0" stroke={color} strokeWidth={2} />
    </Glyph20>
  );
}

export function ClockIcon({ color = theme.colors.text.secondary, size = 20 }: IconProps) {
  return (
    <Glyph20 size={size}>
      <Circle cx={10} cy={10} r={7} stroke={color} strokeWidth={1.8} />
      <Path d="M10 6.5V10l2.5 1.5" stroke={color} strokeWidth={1.8} />
    </Glyph20>
  );
}

export function RepeatIcon({ color = theme.colors.action.primary, size = 19 }: IconProps) {
  return (
    <Glyph20 size={size}>
      <Path d="M16.5 10a6.5 6.5 0 1 1-2.3-4.9" stroke={color} strokeWidth={2} />
      <Path d="M16.5 4v3.2h-3.2" stroke={color} strokeWidth={2} />
    </Glyph20>
  );
}

export function TargetIcon({ color = theme.colors.action.primary, size = 22 }: IconProps) {
  return (
    <Glyph20 size={size}>
      <Path d="M10 3v4M10 13v4M3 10h4M13 10h4" stroke={color} strokeWidth={2} />
      <Circle cx={10} cy={10} r={2.4} stroke={color} strokeWidth={2} />
    </Glyph20>
  );
}

export function BellIcon({ color = theme.colors.reward.streak, size = 19 }: IconProps) {
  return (
    <Glyph20 size={size}>
      <Path d="M6 8a4 4 0 0 1 8 0c0 4 1.5 5 1.5 5h-11S6 12 6 8z" stroke={color} strokeWidth={1.9} />
      <Path d="M8.5 16a1.8 1.8 0 0 0 3 0" stroke={color} strokeWidth={1.9} />
    </Glyph20>
  );
}

// --- Subjects ---------------------------------------------------------------

export type SubjectIconName =
  | 'biology'
  | 'chemistry'
  | 'geography'
  | 'history'
  | 'math'
  | 'philosophy'
  | 'physics'
  | 'religion'
  | 'turkish';

export function SubjectIcon({
  color = theme.colors.text.secondary,
  name,
  size = 26,
}: IconProps & { name: SubjectIconName }) {
  switch (name) {
    case 'history':
      return (
        <Glyph24 size={size}>
          <Path d="M5 5h10a3 3 0 0 1 3 3v11H8a3 3 0 0 1-3-3z" stroke={color} strokeWidth={1.7} />
          <Path d="M8 9h7M8 13h5" stroke={color} strokeWidth={1.7} />
        </Glyph24>
      );
    case 'math':
      return (
        <Glyph24 size={size}>
          <Path d="M7 5h10L11 12l6 7H7" stroke={color} strokeWidth={1.8} />
        </Glyph24>
      );
    case 'turkish':
      return (
        <Glyph24 size={size}>
          <Path d="M5 6h14M5 12h9M5 18h11" stroke={color} strokeWidth={1.8} />
        </Glyph24>
      );
    case 'physics':
      return (
        <Glyph24 size={size}>
          <Circle cx={12} cy={12} r={2.2} stroke={color} strokeWidth={1.7} />
          <Ellipse cx={12} cy={12} rx={9} ry={4} stroke={color} strokeWidth={1.7} />
          <Ellipse
            cx={12}
            cy={12}
            rx={9}
            ry={4}
            stroke={color}
            strokeWidth={1.7}
            transform="rotate(60 12 12)"
          />
        </Glyph24>
      );
    case 'chemistry':
      return (
        <Glyph24 size={size}>
          <Path
            d="M8 4v6l-3 7a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-3-7V4"
            stroke={color}
            strokeWidth={1.7}
          />
          <Path d="M7 4h10" stroke={color} strokeWidth={1.7} />
        </Glyph24>
      );
    case 'biology':
      return (
        <Glyph24 size={size}>
          <Path d="M7 20c0-8 4-14 10-16-1 10-5 14-10 16z" stroke={color} strokeWidth={1.7} />
          <Path d="M9 16c2-3 4-5 7-6" stroke={color} strokeWidth={1.7} />
        </Glyph24>
      );
    case 'geography':
      return (
        <Glyph24 size={size}>
          <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={1.7} />
          <Path
            d="M4 12h16M12 4c2.6 2.6 2.6 13 0 16M12 4c-2.6 2.6-2.6 13 0 16"
            stroke={color}
            strokeWidth={1.7}
          />
        </Glyph24>
      );
    case 'philosophy':
      return (
        <Glyph24 size={size}>
          <Path
            d="M12 4a4 4 0 0 0-4 4c-1.5 1-2 2.4-2 4 0 3 2.5 5 6 5s6-2 6-5c0-1.6-.5-3-2-4a4 4 0 0 0-4-4z"
            stroke={color}
            strokeWidth={1.7}
          />
          <Path d="M12 8v9" stroke={color} strokeWidth={1.7} />
        </Glyph24>
      );
    case 'religion':
      return (
        <Glyph24 size={size}>
          <Path d="M4 6.5c3.2-.8 5.8-.2 8 1.6v11c-2.2-1.8-4.8-2.4-8-1.6z" stroke={color} strokeWidth={1.7} />
          <Path d="M20 6.5c-3.2-.8-5.8-.2-8 1.6v11c2.2-1.8 4.8-2.4 8-1.6z" stroke={color} strokeWidth={1.7} />
        </Glyph24>
      );
  }
}
