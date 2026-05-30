import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import ExpenseFormModal from './ExpenseFormModal';

export default function Layout() {
  const [showForm, setShowForm] = useState(false);
  const location = useLocation();

  return (
    <>
      <Outlet context={{ openForm: () => setShowForm(true) }} />
      <button type="button" className="fab" aria-label="記一筆" onClick={() => setShowForm(true)}>
        +
      </button>
      <nav className="tabs">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          首頁
        </NavLink>
        <NavLink to="/expenses" className={({ isActive }) => (isActive ? 'active' : '')}>
          明細
        </NavLink>
        <NavLink to="/balance" className={({ isActive }) => (isActive ? 'active' : '')}>
          結算
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
          設定
        </NavLink>
      </nav>
      {showForm && (
        <ExpenseFormModal
          onClose={() => setShowForm(false)}
          key={location.key + String(showForm)}
        />
      )}
    </>
  );
}
