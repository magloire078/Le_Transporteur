import * as React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

export interface IconProps {
  name: keyof typeof ICONS;
  size?: number;
  color?: string;
  sw?: number;
  style?: any;
}

const ICONS = {
  home: (c: string, sw: number) => <><Rect x="3" y="11" width="18" height="10" rx="2" fill="none" stroke={c} strokeWidth={sw}/><Path d="M2 11L12 2l10 9" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"/></>,
  calendar: (c: string, sw: number) => <><Rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke={c} strokeWidth={sw}/><Path d="M8 3v4M16 3v4M3 11h18" stroke={c} strokeWidth={sw} strokeLinecap="round"/></>,
  map: (c: string, sw: number) => <><Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="none" stroke={c} strokeWidth={sw}/><Circle cx="12" cy="9" r="2.5" fill="none" stroke={c} strokeWidth={sw}/></>,
  user: (c: string, sw: number) => <><Circle cx="12" cy="8" r="4" fill="none" stroke={c} strokeWidth={sw}/><Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"/></>,
  grid: (c: string, sw: number) => <><Rect x="3" y="3" width="7" height="7" rx="1.5" fill="none" stroke={c} strokeWidth={sw}/><Rect x="14" y="3" width="7" height="7" rx="1.5" fill="none" stroke={c} strokeWidth={sw}/><Rect x="3" y="14" width="7" height="7" rx="1.5" fill="none" stroke={c} strokeWidth={sw}/><Rect x="14" y="14" width="7" height="7" rx="1.5" fill="none" stroke={c} strokeWidth={sw}/></>,
  car: (c: string, sw: number) => <><Path d="M5 12l2-6h10l2 6" fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round"/><Rect x="3" y="12" width="18" height="6" rx="2" fill="none" stroke={c} strokeWidth={sw}/><Circle cx="7.5" cy="18" r="1.5" fill={c}/><Circle cx="16.5" cy="18" r="1.5" fill={c}/></>,
  check: (c: string, sw: number) => <Path d="M5 12l5 5L19 7" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>,
  clock: (c: string, sw: number) => <><Circle cx="12" cy="12" r="9" fill="none" stroke={c} strokeWidth={sw}/><Path d="M12 7v5l3 3" stroke={c} strokeWidth={sw} strokeLinecap="round"/></>,
  star: (c: string, sw: number) => <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={c}/>,
  phone: (c: string, sw: number) => <><Rect x="7" y="2" width="10" height="20" rx="3" fill="none" stroke={c} strokeWidth={sw}/><Circle cx="12" cy="18" r="1" fill={c}/></>,
  bell: (c: string, sw: number) => <><Path d="M6 10a6 6 0 0112 0v4l2 2H4l2-2v-4z" fill="none" stroke={c} strokeWidth={sw}/><Path d="M10 20a2 2 0 004 0" fill="none" stroke={c} strokeWidth={sw}/></>,
  wallet: (c: string, sw: number) => <><Rect x="2" y="6" width="20" height="14" rx="2" fill="none" stroke={c} strokeWidth={sw}/><Path d="M2 10h20" stroke={c} strokeWidth={sw}/><Circle cx="17" cy="15" r="1.5" fill={c}/></>,
  arrow: (c: string, sw: number) => <Path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>,
  zap: (c: string, sw: number) => <Path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round"/>,
  sparkle: (c: string, sw: number) => <><Path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke={c} strokeWidth={sw} strokeLinecap="round"/></>,
  droplet: (c: string, sw: number) => <Path d="M12 2s-7 8.5-7 13a7 7 0 0014 0C19 10.5 12 2 12 2z" fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round"/>,
  shield: (c: string, sw: number) => <Path d="M12 3L4 7v5c0 4.4 3.4 8.5 8 9.6C16.6 20.5 20 16.4 20 12V7L12 3z" fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round"/>,
  trending: (c: string, sw: number) => <><Path d="M22 7l-9 9-4-4L2 17" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/><Path d="M17 7h5v5" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></>,
  logout: (c: string, sw: number) => <><Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"/><Path d="M16 17l5-5-5-5M21 12H9" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></>,
  settings: (c: string, sw: number) => <><Circle cx="12" cy="12" r="3" fill="none" stroke={c} strokeWidth={sw}/><Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" fill="none" stroke={c} strokeWidth={sw}/></>,
  users: (c: string, sw: number) => <><Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" fill="none" stroke={c} strokeWidth={sw}/><Circle cx="9" cy="7" r="4" fill="none" stroke={c} strokeWidth={sw}/><Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"/></>,
  barChart: (c: string, sw: number) => <><Rect x="18" y="3" width="4" height="18" rx="1" fill={c}/><Rect x="10" y="8" width="4" height="13" rx="1" fill={c}/><Rect x="2" y="13" width="4" height="8" rx="1" fill={c}/></>,
  plus: (c: string, sw: number) => <Path d="M12 5v14M5 12h14" stroke={c} strokeWidth={sw} strokeLinecap="round"/>,
  x: (c: string, sw: number) => <Path d="M18 6L6 18M6 6l12 12" stroke={c} strokeWidth={sw} strokeLinecap="round"/>,
  switch: (c: string, sw: number) => <><Path d="M17 3l4 4-4 4" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/><Path d="M3 7h18" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"/><Path d="M7 21l-4-4 4-4" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/><Path d="M21 17H3" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"/></>,
  spray: (c: string, sw: number) => <><Path d="M6 3h6l2 4H8L6 3z" fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round"/><Path d="M8 7v10a2 2 0 004 0V7" fill="none" stroke={c} strokeWidth={sw}/><Path d="M14 8l4-2M14 10l4 0M14 12l4 2" stroke={c} strokeWidth={sw} strokeLinecap="round"/></>,
  confetti: (c: string, sw: number) => <><Circle cx="12" cy="12" r="2" fill={c}/><Path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke={c} strokeWidth={sw} strokeLinecap="round"/></>,
  'chevron-left': (c: string, sw: number) => <Path d="M15 18l-6-6 6-6" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>,
  'chevron-right': (c: string, sw: number) => <Path d="M9 18l6-6-6-6" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>,
  sun: (c: string, sw: number) => <><Circle cx="12" cy="12" r="5" fill="none" stroke={c} strokeWidth={sw}/><Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={c} strokeWidth={sw} strokeLinecap="round"/></>,
  search: (c: string, sw: number) => <><Circle cx="11" cy="11" r="8" fill="none" stroke={c} strokeWidth={sw}/><Path d="M21 21l-4.35-4.35" stroke={c} strokeWidth={sw} strokeLinecap="round"/></>,
  heart: (c: string, sw: number) => <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round"/>,
  trash: (c: string, sw: number) => <><Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/><Path d="M10 11v6M14 11v6" stroke={c} strokeWidth={sw} strokeLinecap="round"/></>,
  edit: (c: string, sw: number) => <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>,
  camera: (c: string, sw: number) => <><Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round"/><Circle cx="12" cy="13" r="4" fill="none" stroke={c} strokeWidth={sw}/></>,
  navigation: (c: string, sw: number) => <Path d="M3 11l19-9-9 19-2-8-8-2z" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>,
  info: (c: string, sw: number) => <><Circle cx="12" cy="12" r="10" fill="none" stroke={c} strokeWidth={sw}/><Path d="M12 16v-4M12 8h.01" stroke={c} strokeWidth={sw} strokeLinecap="round"/></>,
  close: (c: string, sw: number) => <Path d="M18 6L6 18M6 6l12 12" stroke={c} strokeWidth={sw} strokeLinecap="round"/>,
  location: (c: string, sw: number) => <><Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="none" stroke={c} strokeWidth={sw}/><Circle cx="12" cy="9" r="2.5" fill="none" stroke={c} strokeWidth={sw}/></>,
  card: (c: string, sw: number) => <><Rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke={c} strokeWidth={sw}/><Path d="M2 10h20" stroke={c} strokeWidth={sw}/></>,
  truck: (c: string, sw: number) => <><Path d="M1 4h14v12H1zM15 9h4l3 3v4h-7V9z" fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round"/><Circle cx="5.5" cy="18" r="2" fill="none" stroke={c} strokeWidth={sw}/><Circle cx="18.5" cy="18" r="2" fill="none" stroke={c} strokeWidth={sw}/></>,
  file: (c: string, sw: number) => <><Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round"/><Path d="M14 2v6h6M8 13h8M8 17h5" stroke={c} strokeWidth={sw} strokeLinecap="round"/></>,
  wrench: (c: string, sw: number) => <Path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round"/>,
  download: (c: string, sw: number) => <><Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"/><Path d="M7 10l5 5 5-5M12 15V3" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></>,
  alert: (c: string, sw: number) => <><Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round"/><Path d="M12 9v4M12 17h.01" stroke={c} strokeWidth={sw} strokeLinecap="round"/></>,
};

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 20, color = 'currentColor', sw = 1.8, style }: IconProps) {
  const SvgContent = ICONS[name];
  if (!SvgContent) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {SvgContent(color, sw)}
    </Svg>
  );
}

