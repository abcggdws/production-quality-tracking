import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reworkApi, productionApi } from '../api/client';
import { formatDate, getStatusClass } from '../utils/formatters';

export default function ReworkOrders() {
  const queryClient = useQueryClient();

  const { data: reworkOrders, isLoading } = useQuery({
    queryKey: ['rework-orders'],
    queryFn: () => reworkApi.getReworkOrders(),
  });

  const { data: orders } = useQuery({
    queryKey: ['production-orders'],
    queryFn: () => productionApi.getOrders(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: 'in_progress' | 'completed' } }) => reworkApi.updateReworkOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rework-orders'] });
    },
  });

  const getOrderNumber = (orderId: string) => {
    const order = orders?.find(o => o.id === orderId);
    return order?.order_number || orderId;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Rework Orders</h1>

      <table>
        <thead>
          <tr>
            <th>Order No.</th>
            <th>Defect Description</th>
            <th>Quantity</th>
            <th>Completed</th>
            <th>Status</th>
            <th>Assigned To</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reworkOrders?.map(rework => (
            <tr key={rework.id}>
              <td>{getOrderNumber(rework.order_id)}</td>
              <td>{rework.defect_description}</td>
              <td>{rework.quantity}</td>
              <td>{rework.completed_quantity} / {rework.quantity}</td>
              <td className={getStatusClass(rework.status)}>{rework.status.replace('_', ' ')}</td>
              <td>{rework.assigned_to || '-'}</td>
              <td>{formatDate(rework.created_at)}</td>
              <td>
                {rework.status === 'pending' && (
                  <button onClick={() => updateMutation.mutate({ id: rework.id, data: { status: 'in_progress' } })}>
                    Start
                  </button>
                )}
                {rework.status === 'in_progress' && (
                  <button onClick={() => updateMutation.mutate({ id: rework.id, data: { status: 'completed' } })}>
                    Complete
                  </button>
                )}
              </td>
            </tr>
          ))}
          {(!reworkOrders || reworkOrders.length === 0) && (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center' }}>No rework orders found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
