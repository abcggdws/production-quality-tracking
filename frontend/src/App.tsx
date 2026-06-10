import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductionOrders from './pages/ProductionOrders';
import QualityRecords from './pages/QualityRecords';
import ReworkOrders from './pages/ReworkOrders';
import Alerts from './pages/Alerts';
import Dashboard from './pages/Dashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <nav className="navbar">
          <Link to="/">Dashboard</Link>
          <Link to="/orders">Production Orders</Link>
          <Link to="/quality">Quality Records</Link>
          <Link to="/rework">Rework Orders</Link>
          <Link to="/alerts">Alerts</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<ProductionOrders />} />
          <Route path="/quality" element={<QualityRecords />} />
          <Route path="/rework" element={<ReworkOrders />} />
          <Route path="/alerts" element={<Alerts />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;