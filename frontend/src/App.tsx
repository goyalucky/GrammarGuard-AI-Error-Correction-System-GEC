import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import GrammarCorrection from '@/pages/GrammarCorrection';
import DocumentReview from '@/pages/DocumentReview';
import Analytics from '@/pages/Analytics';
import GrammarLearning from '@/pages/GrammarLearning';
import Settings from '@/pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/correction" element={<GrammarCorrection />} />
          <Route path="/documents" element={<DocumentReview />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/learning" element={<GrammarLearning />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
