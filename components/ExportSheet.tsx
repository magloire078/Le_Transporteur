import * as React from 'react';
import { useMemo, useState } from 'react';
import { Platform, Share, Text, View } from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { Fonts } from '@/constants/theme';
import { inMonth, onDay, paymentBreakdown, sumBy, toCsv } from '@/services/analytics';
import { notify } from '@/services/dialog';
import { PAYMENT_METHODS, formatFCFA } from '@/services/labels';
import { FleetTransaction, PaymentMethod } from '@/services/types';
import { Button, Card, ChipGroup, Row, Sheet } from './ui';

type Period = 'today' | 'week' | 'month' | 'prev';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'today', label: "Aujourd'hui" },
  { key: 'week', label: '7 jours' },
  { key: 'month', label: 'Ce mois' },
  { key: 'prev', label: 'Mois dernier' },
];

export default function ExportSheet({ visible, onClose, transactions }: { visible: boolean; onClose: () => void; transactions: FleetTransaction[] }) {
  const { activeTheme: T } = useAppContext();
  const [period, setPeriod] = useState<Period>('month');

  const list = useMemo(() => {
    const now = new Date();
    const weekAgo = now.getTime() - 7 * 86400000;
    return transactions.filter(t => {
      if (period === 'today') return onDay(t, now);
      if (period === 'week') return new Date(t.date).getTime() >= weekAgo;
      if (period === 'month') return inMonth(t, now);
      return inMonth(t, now, -1);
    });
  }, [transactions, period]);

  const revenue = sumBy(list, 'revenue');
  const expense = sumBy(list, 'expense');
  const split = paymentBreakdown(list);

  const exportCsv = async () => {
    const csv = toCsv(list);
    const filename = `transporteur-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    if (Platform.OS === 'web') {
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    try {
      await Share.share({ title: filename, message: csv });
    } catch (e) {
      notify('Partage impossible', (e as Error).message);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Export comptable">
      <ChipGroup<Period> value={period} onChange={setPeriod} options={PERIODS} />

      <Card style={{ marginBottom: 14 }}>
        <Row label="Recettes" value={formatFCFA(revenue)} valueColor="#10B981" />
        <Row label="Dépenses" value={`− ${formatFCFA(expense)}`} valueColor="#EF4444" />
        <View style={{ height: 1, backgroundColor: T.dark ? 'rgba(255,255,255,0.08)' : '#F0F0F0', marginVertical: 6 }} />
        <Row label="Bénéfice net" value={formatFCFA(revenue - expense)} />
        <Row label="Opérations" value={String(list.length)} />
      </Card>

      <Text style={{ color: T.muted, fontFamily: Fonts.semibold, fontSize: 12, marginBottom: 8 }}>Encaissements par mode de versement</Text>
      <Card style={{ marginBottom: 18 }}>
        {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map(k => (
          <Row key={k} label={`${PAYMENT_METHODS[k].emoji} ${PAYMENT_METHODS[k].label}`} value={formatFCFA(split[k])} />
        ))}
      </Card>

      <Button label={Platform.OS === 'web' ? 'Télécharger le fichier CSV' : 'Partager le fichier CSV'} icon="download" onPress={exportCsv} disabled={list.length === 0} />
    </Sheet>
  );
}
