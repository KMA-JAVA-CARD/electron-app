import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { POSPage } from './pages/POSPage';
import { MembersPage } from './pages/MembersPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { Dashboard } from './pages/Dashboard';

// Placeholder pages
const Settings = () => <div className='p-8 text-2xl font-bold'>Settings (Coming Soon)</div>;

function App(): React.JSX.Element {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path='/' element={<Navigate to='/dashboard' replace />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/pos' element={<POSPage />} />
          <Route path='/members' element={<MembersPage />} />
          <Route path='/transactions' element={<TransactionsPage />} />
          <Route path='/settings' element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
