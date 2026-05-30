export default function SetupPage() {
  return (
    <div className="screen center">
      <div className="setup-box">
        <div className="hero-wrap">
          <img src="/hero.png" alt="" className="hero-img" />
          <h1 className="brand-title">尚未設定 Firebase</h1>
        </div>
        <p className="muted" style={{ marginTop: '0.75rem' }}>
          請複製 <code>CoupleLedgerWeb/.env.example</code> 為 <code>.env</code>，填入 Firebase Web App 設定後重新啟動。
        </p>
        <p className="muted" style={{ marginTop: '0.75rem' }}>
          資料庫說明見 <code>firebase/DATABASE.md</code>
        </p>
      </div>
    </div>
  );
}
