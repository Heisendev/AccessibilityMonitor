import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import UrlDetail from './pages/UrlDetail.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <nav className="max-w-6xl mx-auto flex items-center gap-4">
            <Link to="/" className="text-xl font-semibold text-gray-900 hover:text-blue-600">
              Accessibility Monitor
            </Link>
          </nav>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/url/:id" element={<UrlDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
