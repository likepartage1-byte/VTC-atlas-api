import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
  Rect,
  Ellipse,
  G,
  ClipPath,
} from 'react-native-svg';
import { ThemeColorsType } from '../../../theme/ThemeContext';

interface Props {
  colors: ThemeColorsType;
}

/**
 * DriverWelcomeIllustration
 *
 * A flat, modern SVG illustration of a professional driver standing
 * next to a sleek passenger sedan, holding a smartphone.
 * All colors come from the active theme — no hardcoded brand values.
 */
export const DriverWelcomeIllustration = ({ colors }: Props) => {
  const isDark = colors.bg === '#0A0F1E';

  // Derived semantic values from theme
  const carBody      = isDark ? colors.surface    : colors.surfaceAlt;
  const carHighlight = isDark ? colors.surfaceAlt : colors.surface;
  const glass        = isDark ? 'rgba(129,140,248,0.12)' : 'rgba(99,102,241,0.07)';
  const shadow       = isDark ? 'rgba(0,0,0,0.50)'       : 'rgba(0,0,0,0.12)';

  return (
    <View style={styles.container}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 340 230"
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          {/* Soft radial glow behind the scene */}
          <RadialGradient id="bgGlow" cx="50%" cy="55%" r="50%">
            <Stop offset="0%"   stopColor={colors.primary}  stopOpacity={0.18} />
            <Stop offset="100%" stopColor={colors.bg}        stopOpacity={0}    />
          </RadialGradient>

          {/* Gradient for the car body panel */}
          <LinearGradient id="carGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%"   stopColor={carHighlight} stopOpacity={1} />
            <Stop offset="100%" stopColor={carBody}       stopOpacity={1} />
          </LinearGradient>

          {/* Accent stripe gradient */}
          <LinearGradient id="accentLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%"   stopColor={colors.primary} stopOpacity={0}   />
            <Stop offset="40%"  stopColor={colors.accent}  stopOpacity={0.9} />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity={0}   />
          </LinearGradient>

          {/* Driver jacket gradient */}
          <LinearGradient id="jacketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%"   stopColor={colors.primary} stopOpacity={1}   />
            <Stop offset="100%" stopColor={colors.accent}  stopOpacity={0.8} />
          </LinearGradient>

          {/* Screen glow gradient */}
          <LinearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%"   stopColor={colors.accent}  stopOpacity={1}   />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity={1}   />
          </LinearGradient>
        </Defs>

        {/* ── BACKGROUND GLOW ──────────────────────────────────────── */}
        <Ellipse cx={170} cy={130} rx={150} ry={90} fill="url(#bgGlow)" />

        {/* Subtle arc lines for depth */}
        <Path
          d="M30,160 Q170,60 310,140"
          fill="none"
          stroke={colors.accent}
          strokeWidth={1}
          strokeDasharray="4 6"
          opacity={0.25}
        />
        <Path
          d="M20,185 Q170,95 320,170"
          fill="none"
          stroke={colors.primary}
          strokeWidth={0.8}
          strokeDasharray="3 7"
          opacity={0.18}
        />

        {/* Floating accent dots */}
        <Circle cx={290} cy={55} r={5}  fill={colors.accent}  opacity={0.5} />
        <Circle cx={55}  cy={75} r={3}  fill={colors.primary} opacity={0.4} />
        <Circle cx={310} cy={130} r={3} fill={colors.accent}  opacity={0.3} />
        <Circle cx={40}  cy={155} r={2} fill={colors.border}  opacity={0.6} />

        {/* ── GROUND SHADOW ────────────────────────────────────────── */}
        <Ellipse cx={210} cy={197} rx={110} ry={8} fill={shadow} />

        {/* ── MODERN PASSENGER SEDAN ───────────────────────────────── */}
        {/* Underbody / sill */}
        <Path
          d="M128,180 L140,184 L284,184 L292,180 Z"
          fill={carBody}
          opacity={0.8}
        />

        {/* Main body */}
        <Path
          d="M126,180
             L128,164
             Q132,154 144,152
             L164,150
             Q172,134 186,130
             L238,128
             Q254,129 260,140
             L278,146
             Q294,151 296,162
             L298,176
             Q299,182 292,183
             L270,183
             Q270,171 258,170
             Q246,171 246,183
             L186,183
             Q186,171 174,170
             Q162,171 162,183
             L134,183 Z"
          fill="url(#carGradient)"
          stroke={colors.border}
          strokeWidth={0.8}
        />

        {/* Body panel gloss stripe */}
        <Path
          d="M140,164 Q210,160 290,166"
          fill="none"
          stroke="url(#accentLine)"
          strokeWidth={1.5}
          opacity={0.7}
        />

        {/* Windshield + roof glass */}
        <Path
          d="M170,150
             L166,151
             L186,134
             L236,131
             L254,142
             L246,150 Z"
          fill={glass}
          stroke={colors.border}
          strokeWidth={0.7}
        />
        {/* B-pillar */}
        <Path
          d="M208,131 L207,150"
          stroke={colors.border}
          strokeWidth={1.2}
          strokeLinecap="round"
        />

        {/* Headlamp — accent glow */}
        <Path
          d="M284,150 Q298,150 296,160 L290,162 Q294,155 284,154 Z"
          fill={colors.accent}
          opacity={0.85}
        />
        {/* Headlamp inner highlight */}
        <Path
          d="M288,153 Q295,153 294,159"
          fill="none"
          stroke={colors.white}
          strokeWidth={1}
          opacity={0.5}
        />

        {/* Rear light bar */}
        <Rect
          x={126}
          y={164}
          width={4}
          height={14}
          rx={2}
          fill={colors.offline}
          opacity={0.7}
        />

        {/* Wheels */}
        {/* Rear wheel */}
        <G transform="translate(174, 183)">
          <Circle r={18} fill="#111827" stroke={colors.border} strokeWidth={1.5} />
          <Circle r={11} fill="#0A0F1E" />
          {/* Spokes */}
          <Path d="M-11,0 L11,0 M0,-11 L0,11 M-8,-8 L8,8 M8,-8 L-8,8"
            stroke={colors.textSecondary} strokeWidth={0.8} opacity={0.7} />
          <Circle r={4} fill={colors.accent} />
          <Circle r={2} fill={colors.surfaceAlt} />
        </G>
        {/* Front wheel */}
        <G transform="translate(258, 183)">
          <Circle r={18} fill="#111827" stroke={colors.border} strokeWidth={1.5} />
          <Circle r={11} fill="#0A0F1E" />
          <Path d="M-11,0 L11,0 M0,-11 L0,11 M-8,-8 L8,8 M8,-8 L-8,8"
            stroke={colors.textSecondary} strokeWidth={0.8} opacity={0.7} />
          <Circle r={4} fill={colors.accent} />
          <Circle r={2} fill={colors.surfaceAlt} />
        </G>

        {/* ── PROFESSIONAL DRIVER ───────────────────────────────────── */}
        {/* Driver ground shadow */}
        <Ellipse cx={78} cy={196} rx={22} ry={5} fill={shadow} />

        {/* Legs */}
        <Rect x={66} y={175} width={10} height={22} rx={4} fill={colors.textMuted} />
        <Rect x={80} y={175} width={10} height={22} rx={4} fill={colors.textMuted} />
        {/* Shoes */}
        <Ellipse cx={71} cy={197} rx={7}  ry={3} fill={colors.textPrimary} opacity={0.6} />
        <Ellipse cx={85} cy={197} rx={7}  ry={3} fill={colors.textPrimary} opacity={0.6} />

        {/* Jacket / torso */}
        <Path
          d="M56,175
             Q56,155 66,148
             L78,145
             L90,148
             Q102,155 102,175 Z"
          fill="url(#jacketGrad)"
        />
        {/* Lapel / shirt visible centre */}
        <Path
          d="M74,147 L78,160 L82,147 Z"
          fill={colors.bg}
          opacity={0.9}
        />
        {/* Left arm extended forward, holding phone */}
        <Path
          d="M56,155 Q44,150 38,158 Q34,165 40,168 L52,167 Z"
          fill="url(#jacketGrad)"
        />
        {/* Right arm resting */}
        <Path
          d="M102,155 Q112,158 112,168 L104,169 Z"
          fill="url(#jacketGrad)"
        />

        {/* Smartphone */}
        <G transform="translate(30, 148) rotate(-8)">
          {/* Phone body */}
          <Rect width={14} height={24} rx={3} fill="#0A0F1E" stroke={colors.border} strokeWidth={1} />
          {/* Active screen */}
          <Rect x={1.5} y={1.5} width={11} height={21} rx={2} fill="url(#screenGrad)" opacity={0.9} />
          {/* Screen UI — map pin icon abstraction */}
          <Circle cx={7} cy={9}  r={3.5} fill={colors.white} opacity={0.15} />
          <Circle cx={7} cy={9}  r={2}   fill={colors.white} opacity={0.8}  />
          {/* Glowing pulse ring */}
          <Circle cx={7} cy={9}  r={5}   fill="none" stroke={colors.white} strokeWidth={0.7} opacity={0.4} />
          {/* Bottom bar */}
          <Rect x={3} y={16} width={8} height={1.5} rx={0.8} fill={colors.white} opacity={0.6} />
          <Rect x={4} y={19} width={6} height={1.5} rx={0.8} fill={colors.white} opacity={0.4} />
        </G>

        {/* Neck */}
        <Path
          d="M72,148 L72,140 Q78,142 84,140 L84,148 Z"
          fill={colors.white}
          opacity={0.85}
        />

        {/* Head */}
        <Circle cx={78} cy={128} r={13} fill={colors.white} opacity={0.92} />

        {/* Hair */}
        <Path
          d="M65,128 Q67,113 78,113 Q89,113 91,121 L88,126 Q85,116 78,116 Q71,116 68,125 Z"
          fill={colors.textPrimary}
          opacity={0.75}
        />

        {/* Face details — professional calm expression */}
        {/* Eye */}
        <Ellipse cx={83} cy={126} rx={1.5} ry={1.8} fill={colors.textPrimary} opacity={0.8} />
        {/* Pupil highlight */}
        <Circle cx={83.5} cy={125.5} r={0.5} fill={colors.white} />
        {/* Nose bridge */}
        <Path d="M81,130 Q81,133 83,134" fill="none" stroke={colors.textMuted} strokeWidth={0.8} strokeLinecap="round" />
        {/* Confident, calm smile */}
        <Path
          d="M79,136 Q82,139 85,137"
          fill="none"
          stroke={colors.textPrimary}
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.75}
        />
        {/* Ear */}
        <Path
          d="M65,127 Q63,130 65,133"
          fill="none"
          stroke={colors.border}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Earpiece / headset subtle detail */}
        <Circle cx={65} cy={130} r={1.5} fill={colors.accent} opacity={0.6} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1.48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
