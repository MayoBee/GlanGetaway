import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground p-4">
          <h1 className="text-2xl font-bold">Hotel Booking Admin</h1>
        </header>
        <main className="p-4">
          <Routes>
            <Route path="/" element={<div>Welcome to Admin Dashboard</div>} />
            {/* Add more routes here */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
