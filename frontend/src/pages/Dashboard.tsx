import { useQuery } from '@tanstack/react-query';
import { productionApi, reworkApi, alertApi } from '../api/client';
import { formatDate, calculateProgress } from '../utils/formatters';

export default function Dashboard() {
  const { data: pendingOrders, isLoading: loadingPending } = useQuery({
    queryKey: ['pending-orders'],
    queryFn: () => productionApi.getPendingOrders(),
  });

  const { data: inProgressOrders, isLoading: loadingInProgress } = useQuery({
    queryKey: ['in-progress-orders'],
    queryFn: () => productionApi.getInProgressOrders(),
  });

  const { data: reworkOrders, isLoading: loadingRework } = useQuery({
    queryKey: ['pending-rework-orders'],
    queryFn: () => reworkApi.getPendingReworkOrders(),
  });

  const { data: alertData, isLoading: loadingAlerts } = useQuery({
    queryKey: ['critical-alerts'],
    queryFn: () => alertApi.getCriticalAlerts(),
  });

  if (loadingPending || loadingInProgress || loadingRework || loadingAlerts) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Production Quality Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1em', marginTop: '2em' }}>
        <div className="card">
          <h3>Pending Orders</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{pendingOrders?.length || 0}</p>
        </div>

        <div className="card">
          <h3>In Progress Orders</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{inProgressOrders?.length || 0}</p>
        </div>

        <div className="card">
          <h3>Pending Rework</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{reworkOrders?.length || 0}</p>
        </div>

        <div className="card">
          <h3>Critical Alerts</h3>
          <p style={{ fontSize: '2em', fontWeight: 'bold', color: alertData?.length ? '#ef4444' : '#22c55e' }}>
            {alertData?.length || 0}
          </p>
        </div>
      </div>

      <div style={{ marginTop: '2em' }}>
        <h2>In Progress Orders</h2>
        <table>
          <thead>
            <tr>
              <th>Order No.</th>
              <th>Product</th>
              <th>Progress</th>
              <th>Workstation</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {inProgressOrders?.map(order => (
              <tr key={order.id}>
                <td>{order.order_number}</td>
                <td>{order.product_name}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                    <div style={{ flex: 1, backgroundColor: '#333', borderRadius: '4px', height: '8px' }}>
                      <div
                        style={{
                          width: `${calculateProgress(order.completed_quantity, order.planned_quantity)}%`,
                          height: '100%',
                          backgroundColor: '#22c55e',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                    <span>{calculateProgress(order.completed_quantity, order.planned_quantity)}%</span>
                  </div>
                </td>
                <td>{order.workstation}</td>
                <td>{formatDate(order.due_date)}</td>
              </tr>
            ))}
            {(!inProgressOrders || inProgressOrders.length === 0) && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>No orders in progress</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {alertData && alertData.length > 0 && (
        <div style={{ marginTop: '2em' }}>
          <h2 style={{ color: '#ef4444' }}>Critical Alerts</h2>
          {alertData.map(alert => (
            <div key={alert.id} className="card" style={{ borderLeft: '4px solid #ef4444' }}>
              <p>{alert.message}</p>
              <small>{formatDate(alert.created_at)}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
