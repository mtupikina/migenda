import { Outlet, Route, Routes } from 'react-router-dom';

function LoggedOutShell() {
  return <Outlet />;
}

function LoggedInShell() {
  return <Outlet />;
}

export function App() {
  return (
    <Routes>
      <Route element={<LoggedOutShell />}>
        <Route path="/" element={null} />
      </Route>
      <Route element={<LoggedInShell />}>
        <Route path="/app" element={null} />
      </Route>
    </Routes>
  );
}
