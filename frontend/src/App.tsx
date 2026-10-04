import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Introduction from './pages/Introduction';
import Installation from './pages/Installation';
import Upload from './pages/Upload';
import Redaction from './pages/Redaction';
import RedactionDetail from './pages/RedactionDetail';
import Placeholder from './pages/Placeholder';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Introduction />} />
        <Route path="introduction" element={<Navigate to="/" replace />} />
        <Route path="installation" element={<Installation />} />
        <Route path="upload" element={<Upload />} />
        <Route path="redaction" element={<Redaction />} />
        <Route path="redaction/:id" element={<RedactionDetail />} />
        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Route>
    </Routes>
  );
}
