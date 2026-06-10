import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { qualityApi, productionApi } from '../api/client';
import { formatDate, getResultClass } from '../utils/formatters';

export default function QualityRecords() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: orders } = useQuery({
    queryKey: ['production-orders'],
    queryFn: () => productionApi.getOrders(),
  });

  const { data: records, isLoading } = useQuery({
    queryKey: ['quality-records', selectedOrderId],
    queryFn: () => qualityApi.getRecordsByOrder(selectedOrderId!),
    enabled: !!selectedOrderId,
  });

  const { data: passRateData } = useQuery({
    queryKey: ['pass-rate', selectedOrderId],
    queryFn: () => qualityApi.getPassRate(selectedOrderId!),
    enabled: !!selectedOrderId,
  });

  const { data: defectRateData } = useQuery({
    queryKey: ['defect-rate', selectedOrderId],
    queryFn: () => qualityApi.getDefectRate(selectedOrderId!),
    enabled: !!selectedOrderId,
  });

  return (
    <div>
      <h1>Quality Records</h1>

      <div style={{ marginBottom: '1em' }}>
        <label style={{ marginRight: '0.5em' }}>Select Order:</label>
        <select
          value={selectedOrderId || ''}
          onChange={e => setSelectedOrderId(e.target.value || null)}
        >
          <option value="">-- Select an order --</option>
          {orders?.map(order => (
            <option key={order.id} value={order.id}>
              {order.order_number} - {order.product_name}
            </option>
          ))}
        </select>
      </div>

      {selectedOrderId && (
        <>
          <div style={{ display: 'flex', gap: '1em', marginBottom: '1em' }}>
            <div className="card">
              <h4>Pass Rate</h4>
              <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#22c55e' }}>
                {passRateData?.pass_rate?.toFixed(2) || '0.00'}%
              </p>
            </div>
            <div className="card">
              <h4>Defect Rate</h4>
              <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#ef4444' }}>
                {defectRateData?.defect_rate?.toFixed(2) || '0.00'}%
              </p>
            </div>
          </div>

          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Inspector</th>
                  <th>Check Point</th>
                  <th>Result</th>
                  <th>Defect Type</th>
                  <th>Defect Qty</th>
                  <th>Remarks</th>
                  <th>Inspected At</th>
                </tr>
              </thead>
              <tbody>
                {records?.map(record => (
                  <tr key={record.id}>
                    <td>{record.inspector}</td>
                    <td>{record.check_point}</td>
                    <td className={getResultClass(record.result)}>{record.result}</td>
                    <td>{record.defect_type || '-'}</td>
                    <td>{record.defect_quantity || '-'}</td>
                    <td>{record.remarks || '-'}</td>
                    <td>{formatDate(record.inspected_at)}</td>
                  </tr>
                ))}
                {(!records || records.length === 0) && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center' }}>No quality records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </>
      )}

      {!selectedOrderId && (
        <p style={{ textAlign: 'center', marginTop: '2em', color: '#666' }}>
          Please select an order to view quality records
        </p>
      )}
    </div>
  );
}