import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productionApi, ProductionOrder } from '../api/client';
import { formatDate, getStatusClass, calculateProgress } from '../utils/formatters';

export default function ProductionOrders() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['production-orders', statusFilter],
    queryFn: () => productionApi.getOrders(statusFilter),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductionOrder> }) => productionApi.updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-orders'] });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1em' }}>
        <h1>Production Orders</h1>
        <div>
          <label style={{ marginRight: '0.5em' }}>Filter by status:</label>
          <select value={statusFilter || ''} onChange={e => setStatusFilter(e.target.value || undefined)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Order No.</th>
            <th>Product Code</th>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Progress</th>
            <th>Workstation</th>
            <th>Status</th>
            <th>Start Date</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders?.map(order => (
            <tr key={order.id}>
              <td>{order.order_number}</td>
              <td>{order.product_code}</td>
              <td>{order.product_name}</td>
              <td>{order.completed_quantity} / {order.planned_quantity}</td>
              <td style={{ minWidth: '150px' }}>
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
              <td className={getStatusClass(order.status)}>{order.status.replace('_', ' ')}</td>
              <td>{formatDate(order.start_date)}</td>
              <td>{formatDate(order.due_date)}</td>
              <td>
                {order.status === 'pending' && (
                  <button onClick={() => updateMutation.mutate({ id: order.id, data: { status: 'in_progress' } })}>
                    Start
                  </button>
                )}
                {order.status === 'in_progress' && (
                  <button onClick={() => updateMutation.mutate({ id: order.id, data: { status: 'completed' } })}>
                    Complete
                  </button>
                )}
              </td>
            </tr>
          ))}
          {(!orders || orders.length === 0) && (
            <tr>
              <td colSpan={10} style={{ textAlign: 'center' }}>No orders found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
