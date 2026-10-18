import * as React from 'react';
import { View, Text } from 'react-native';
import { useAppContext } from '@/context/AppContext';
import { Fonts } from '@/constants/theme';
import { FleetAlert } from '@/services/types';
import { Card, IconBubble, Sheet, EmptyState } from './ui';

const LEVEL = {
  critical: { color: '#EF4444', icon: 'alert' as const },
  warning: { color: '#F59E0B', icon: 'file' as const },
  info: { color: '#3B82F6', icon: 'info' as const },
};

export default function AlertsModal({
  visible,
  onClose,
  alerts,
  onOpenVehicle,
}: {
  visible: boolean;
  onClose: () => void;
  alerts: FleetAlert[];
  onOpenVehicle?: (vehicleId: string) => void;
}) {
  const { activeTheme: T } = useAppContext();

  return (
    <Sheet visible={visible} onClose={onClose} title={`Alertes de flotte (${alerts.length})`}>
      {alerts.length === 0 ? (
        <EmptyState icon="check" title="Tout est en ordre" body="Aucun document expiré, aucun véhicule sans chauffeur." />
      ) : (
        <View style={{ gap: 10 }}>
          {alerts.map(a => {
            const L = LEVEL[a.level];
            return (
              <Card
                key={a.id}
                onPress={a.vehicleId && onOpenVehicle ? () => { onClose(); onOpenVehicle(a.vehicleId!); } : undefined}
                style={{ flexDirection: 'row', gap: 12, alignItems: 'center', borderColor: L.color + '40' }}
              >
                <IconBubble name={L.icon} color={L.color} size={38} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: T.text, fontFamily: Fonts.bold, fontSize: 13 }}>{a.title}</Text>
                  <Text style={{ color: T.muted, fontFamily: Fonts.sans, fontSize: 12, marginTop: 2 }}>{a.body}</Text>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </Sheet>
  );
}
