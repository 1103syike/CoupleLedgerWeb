import { useApp } from '../context/AppContext';

export default function MonthNav() {
  const { selectedMonth, setSelectedMonth, monthTitle } = useApp();

  const shift = (delta: number) => {
    const d = new Date(selectedMonth);
    d.setMonth(d.getMonth() + delta);
    setSelectedMonth(d);
  };

  return (
    <div className="month-nav" style={{ marginTop: '0.75rem' }}>
      <button type="button" onClick={() => shift(-1)} aria-label="上個月">
        ‹
      </button>
      <strong>{monthTitle}</strong>
      <button type="button" onClick={() => shift(1)} aria-label="下個月">
        ›
      </button>
    </div>
  );
}
