import { useQuery } from '@tanstack/react-query';
import { productionApi, reworkApi, alertApi } from '../api/client';

export function useProductionOrders(status?: string) {
  return useQuery({
    queryKey: ['production-orders', status],
    queryFn: () => productionApi.getOrders(status),
  });
}

export function useProductionOrder(id: string) {
  return useQuery({
    queryKey: ['production-order', id],
    queryFn: () => productionApi.getOrderById(id),
    enabled: !!id,
  });
}

export function useProductionMetrics(id: string) {
  return useQuery({
    queryKey: ['production-metrics', id],
    queryFn: () => productionApi.getOrderMetrics(id),
    enabled: !!id,
  });
}

export function usePendingOrders() {
  return useQuery({
    queryKey: ['pending-orders'],
    queryFn: () => productionApi.getPendingOrders(),
  });
}

export function useInProgressOrders() {
  return useQuery({
    queryKey: ['in-progress-orders'],
    queryFn: () => productionApi.getInProgressOrders(),
  });
}

export function useReworkOrders() {
  return useQuery({
    queryKey: ['rework-orders'],
    queryFn: () => reworkApi.getReworkOrders(),
  });
}

export function usePendingReworkOrders() {
  return useQuery({
    queryKey: ['pending-rework-orders'],
    queryFn: () => reworkApi.getPendingReworkOrders(),
  });
}

export function useAlerts(acknowledged?: boolean) {
  return useQuery({
    queryKey: ['alerts', acknowledged],
    queryFn: () => alertApi.getAlerts(acknowledged),
  });
}

export function useCriticalAlerts() {
  return useQuery({
    queryKey: ['critical-alerts'],
    queryFn: () => alertApi.getCriticalAlerts(),
  });
}

export function useUnacknowledgedAlertCount() {
  return useQuery({
    queryKey: ['unacknowledged-alert-count'],
    queryFn: () => alertApi.getUnacknowledgedCount(),
    refetchInterval: 30000,
  });
}