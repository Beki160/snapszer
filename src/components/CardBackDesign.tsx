import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { CARD_BACK_IMAGE } from './cardImages';
import { CardBackId } from '../settings/types';

type Props = {
  id: CardBackId;
  width: number;
  height: number;
};

type DesignSpec = {
  bg: string;
  bg2: string;
  border: string;
  accent: string;
  pattern: 'diamond' | 'cross' | 'circle' | 'star' | 'wave' | 'grid' | 'fan' | 'dots' | 'chevron';
};

const DESIGNS: Record<CardBackId, DesignSpec> = {
  klasszikus: { bg: '#1B4D3E', bg2: '#16382D', border: '#D4A017', accent: '#D4A017', pattern: 'diamond' },
  zold: { bg: '#1A5C3A', bg2: '#0F3D26', border: '#7CB342', accent: '#A5D6A7', pattern: 'grid' },
  kek: { bg: '#1A3A6B', bg2: '#0F2547', border: '#5C9CE6', accent: '#90CAF9', pattern: 'cross' },
  bordo: { bg: '#5C1A2E', bg2: '#3D0F1F', border: '#C06080', accent: '#E8A0B0', pattern: 'fan' },
  lila: { bg: '#3D1A6B', bg2: '#250F47', border: '#9C6BD4', accent: '#CE93D8', pattern: 'circle' },
  arany: { bg: '#4A3800', bg2: '#2E2200', border: '#FFD700', accent: '#FFE082', pattern: 'star' },
  ejfekete: { bg: '#1A1A2E', bg2: '#0D0D18', border: '#606080', accent: '#9090B0', pattern: 'chevron' },
  turkiz: { bg: '#0D4A4A', bg2: '#062E2E', border: '#26A69A', accent: '#80CBC4', pattern: 'wave' },
  krem: { bg: '#8B7355', bg2: '#6B5740', border: '#D4C4A8', accent: '#F5E6C8', pattern: 'dots' },
  piros: { bg: '#6B1A1A', bg2: '#470F0F', border: '#E06060', accent: '#FFAB91', pattern: 'diamond' },
};

function PatternOverlay({ spec, w, h }: { spec: DesignSpec; w: number; h: number }) {
  const cx = w / 2;
  const cy = h / 2;
  const accent = spec.accent;
  const border = spec.border;

  switch (spec.pattern) {
    case 'diamond':
      return (
        <>
          <Path
            d={`M ${cx} ${cy - h * 0.22} L ${cx + w * 0.18} ${cy} L ${cx} ${cy + h * 0.22} L ${cx - w * 0.18} ${cy} Z`}
            fill="none"
            stroke={accent}
            strokeWidth={1.5}
          />
          <Path
            d={`M ${cx} ${cy - h * 0.12} L ${cx + w * 0.1} ${cy} L ${cx} ${cy + h * 0.12} L ${cx - w * 0.1} ${cy} Z`}
            fill={accent}
            opacity={0.4}
          />
        </>
      );
    case 'cross':
      return (
        <>
          <Line x1={cx} y1={cy - h * 0.2} x2={cx} y2={cy + h * 0.2} stroke={accent} strokeWidth={2} />
          <Line x1={cx - w * 0.15} y1={cy} x2={cx + w * 0.15} y2={cy} stroke={accent} strokeWidth={2} />
          <Circle cx={cx} cy={cy} r={w * 0.06} fill={accent} opacity={0.5} />
        </>
      );
    case 'circle':
      return (
        <>
          <Circle cx={cx} cy={cy} r={w * 0.18} fill="none" stroke={accent} strokeWidth={1.5} />
          <Circle cx={cx} cy={cy} r={w * 0.1} fill="none" stroke={border} strokeWidth={1} />
          <Circle cx={cx} cy={cy} r={w * 0.04} fill={accent} />
        </>
      );
    case 'star':
      return (
        <Path
          d={`M ${cx} ${cy - h * 0.18} L ${cx + w * 0.04} ${cy - h * 0.06} L ${cx + w * 0.17} ${cy - h * 0.06} L ${cx + w * 0.07} ${cy + h * 0.02} L ${cx + w * 0.11} ${cy + h * 0.14} L ${cx} ${cy + h * 0.06} L ${cx - w * 0.11} ${cy + h * 0.14} L ${cx - w * 0.07} ${cy + h * 0.02} L ${cx - w * 0.17} ${cy - h * 0.06} L ${cx - w * 0.04} ${cy - h * 0.06} Z`}
          fill={accent}
          opacity={0.7}
        />
      );
    case 'wave':
      return (
        <Path
          d={`M ${w * 0.15} ${cy} Q ${cx} ${cy - h * 0.12} ${w * 0.85} ${cy} Q ${cx} ${cy + h * 0.12} ${w * 0.15} ${cy}`}
          fill="none"
          stroke={accent}
          strokeWidth={1.5}
        />
      );
    case 'grid':
      return (
        <>
          {[0.3, 0.5, 0.7].map((ratio) => (
            <React.Fragment key={ratio}>
              <Line x1={w * ratio} y1={h * 0.2} x2={w * ratio} y2={h * 0.8} stroke={accent} strokeWidth={0.8} opacity={0.4} />
              <Line x1={w * 0.2} y1={h * ratio} x2={w * 0.8} y2={h * ratio} stroke={accent} strokeWidth={0.8} opacity={0.4} />
            </React.Fragment>
          ))}
        </>
      );
    case 'fan':
      return (
        <>
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = -60 + i * 30;
            const rad = (angle * Math.PI) / 180;
            const x2 = cx + Math.sin(rad) * w * 0.2;
            const y2 = cy - Math.cos(rad) * h * 0.2;
            return (
              <Line key={i} x1={cx} y1={cy + h * 0.05} x2={x2} y2={y2} stroke={accent} strokeWidth={1.2} opacity={0.6} />
            );
          })}
        </>
      );
    case 'dots':
      return (
        <>
          {[-1, 0, 1].flatMap((row) =>
            [-1, 0, 1].map((col) => (
              <Circle
                key={`${row}-${col}`}
                cx={cx + col * w * 0.12}
                cy={cy + row * h * 0.1}
                r={w * 0.025}
                fill={accent}
                opacity={0.5}
              />
            )),
          )}
        </>
      );
    case 'chevron':
      return (
        <>
          <Path d={`M ${w * 0.25} ${cy - h * 0.06} L ${cx} ${cy - h * 0.14} L ${w * 0.75} ${cy - h * 0.06}`} fill="none" stroke={accent} strokeWidth={1.5} />
          <Path d={`M ${w * 0.25} ${cy + h * 0.06} L ${cx} ${cy + h * 0.14} L ${w * 0.75} ${cy + h * 0.06}`} fill="none" stroke={accent} strokeWidth={1.5} />
        </>
      );
  }
}

function SvgCardBack({ spec, width, height }: { spec: DesignSpec; width: number; height: number }) {
  const pad = 4;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={spec.bg} />
          <Stop offset="1" stopColor={spec.bg2} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} rx={6} fill="url(#bgGrad)" />
      <Rect
        x={pad}
        y={pad}
        width={innerW}
        height={innerH}
        rx={4}
        fill="none"
        stroke={spec.border}
        strokeWidth={1.5}
      />
      <Rect
        x={pad + 3}
        y={pad + 3}
        width={innerW - 6}
        height={innerH - 6}
        rx={3}
        fill="none"
        stroke={spec.border}
        strokeWidth={0.5}
        opacity={0.5}
      />
      <PatternOverlay spec={spec} w={width} h={height} />
    </Svg>
  );
}

export function CardBackDesign({ id, width, height }: Props) {
  if (id === 'klasszikus') {
    return (
      <View style={[styles.container, { width, height }]}>
        <Image
          source={CARD_BACK_IMAGE}
          style={{ width, height }}
          resizeMode="contain"
        />
      </View>
    );
  }

  const spec = DESIGNS[id];
  return (
    <View style={[styles.container, { width, height }]}>
      <SvgCardBack spec={spec} width={width} height={height} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    overflow: 'hidden',
  },
});
