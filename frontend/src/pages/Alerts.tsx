import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertApi } from '../api/client';
import { formatDate } from '../utils/formatters';

export default function Alerts() {
  const queryClient = useQueryClient();
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts', showAcknowledged],
    queryFn: () => alertApi.getAlerts(showAcknowledged ? undefined : false),
  });

  const acknowledgeMutation = useMutation({
    mutationFn: ({ id, acknowledgedBy }: { id: string; acknowledgedBy: string }) => alertApi.acknowledgeAlert(id, acknowledgedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['critical-alerts'] });
    },
  });

  const getSeverityClass = (severity: string) => {
    return `severity-${severity}`;
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#fee2e2';
      case 'high':
        return '#ffedd5';
      case 'medium':
        return '#fef9c3';
      case 'low':
        return '#dbeafe';
      default:
        return '#f3f4f6';
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1em' }}>
        <h1>Quality Alerts</h1>
        <div>
          <label style={{ marginRight: '0.5em' }}>Show acknowledged:</label>
          <input type="checkbox" checked={showAcknowledged} onChange={e => setShowAcknowledged(e.target.checked)} />
        </div>
      </div>

      <div>
        {alerts?.map(alert => (
          <div
            key={alert.id}
            className="card"
            style={{
              marginBottom: '0.5em',
              borderLeft: `4px solid ${alert.severity === 'critical' ? '#ef4444' : alert.severity === 'high' ? '#f97316' : '#eab308'}`,
              backgroundColor: getSeverityBgColor(alert.severity),
              color: '#000',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className={getSeverityClass(alert.severity)} style={{ fontWeight: 'bold' }}>
                  [{alert.severity.toUpperCase()}]
                </span>
                <span style={{ marginLeft: '0.5em' }}>{alert.message}</span>
              </div>
              {!alert.acknowledged && (
                <button onClick={() => acknowledgeMutation.mutate({ id: alert.id, acknowledgedBy: 'Operator' })} style={{ backgroundColor: '#22c55e', color: '#fff' }}>
                  Acknowledge
                </button>
              )}
            </div>
            <div style={{ marginTop: '0.5em', fontSize: '0.9em', color: '#666' }}>
              <span>Type: {alert.alert_type}</span>
              <span style={{ marginLeft: '1em' }}>Created: {formatDate(alert.created_at)}</span>
              {alert.acknowledged && alert.acknowledged_at && (
                <span style={{ marginLeft: '1em' }}>
                  Acknowledged by {alert.acknowledged_by} at {formatDate(alert.acknowledged_at)}
                </span>
              )}
            </div>
          </div>
        ))}
        {(!alerts || alerts.length === 0) && (
          <p style={{ textAlign: 'center', marginTop: '2em', color: '#666' }}>
            No alerts found
          </p>
        )}
      </div>
    </div>
  );
}
