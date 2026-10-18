import * as React from 'react';
import { Text, View } from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { Fonts } from '@/constants/theme';

/** Histogramme simple des recettes journalières (sans dépendance graphique). */
export default function BarChart({ data, color, height = 120 }: { data: { label: string; revenue: number }[]; color: string; height?: number }) {
  const { activeTheme: T } = useAppContext();
  const max = Math.max(1, ...data.map(d => d.revenue));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: height + 36 }}>
      {data.map((d, i) => {
        const h = Math.max(4, (d.revenue / max) * height);
        const isLast = i === data.length - 1;
        return (
          <View key={`${d.label}-${i}`} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: T.muted, fontFamily: Fonts.semibold, fontSize: 9, marginBottom: 4 }} numberOfLines={1}>
              {d.revenue >= 1000 ? `${Math.round(d.revenue / 1000)}k` : d.revenue || ''}
            </Text>
            <View
              style={{
                width: '100%',
                height: h,
                borderRadius: 8,
                backgroundColor: d.revenue ? color : T.dark ? 'rgba(255,255,255,0.08)' : '#EEF0F3',
                opacity: isLast ? 1 : 0.65,
              }}
            />
            <Text style={{ color: isLast ? T.text : T.muted, fontFamily: isLast ? Fonts.bold : Fonts.sans, fontSize: 10, marginTop: 6, textTransform: 'capitalize' }}>
              {d.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
