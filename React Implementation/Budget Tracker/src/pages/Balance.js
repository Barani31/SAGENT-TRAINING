import React, { useEffect, useState } from 'react';
import { balanceApi, incomeApi, expenseApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Balance() {
  const { user } = useAuth();
  const USER_ID = user?.id;

  const [totalInc, setTotalInc] = useState(0);
  const [totalExp, setTotalExp] = useState(0);
  const [loading, setLoading]   = useState(true);

  const load = () => {
    if (!USER_ID) return;
    setLoading(true);
    Promise.all([
      incomeApi.getAll(),
      expenseApi.getAll(),
    ]).then(([inc, exp]) => {
      setTotalInc(inc.reduce((s, i) => s + (i.amount || 0), 0));
      setTotalExp(exp.reduce((s, e) => s + (e.amount || 0), 0));
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [USER_ID]);

  const recalc = async () => { await balanceApi.update(USER_ID); load(); };
  const net = totalInc - totalExp;

  const card = (color) => ({
    background: '#fff', borderRadius: 'var(--radius)', padding: '28px 24px',
    boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
    borderLeft: `4px solid ${color}`,
  });

  return (
    <div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 6 }}>Balance</div>
      <div style={{ color: 'var(--text-light)', fontSize: 14, marginBottom: 32 }}>Your current financial position</div>

      {loading ? <div style={{ color: 'var(--text-light)' }}>Loading...</div> : <>
        <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '28px 32px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 42, fontWeight: 700, color: net >= 0 ? 'var(--green-500)' : '#e53e3e' }}>
              {net < 0 ? '-' : ''}₹{Math.abs(net).toLocaleString()}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-light)', marginTop: 6 }}>
              {net >= 0 ? '✅ You are in surplus' : '⚠️ You are in deficit'}
            </div>
          </div>
          <button onClick={recalc} style={{ background: 'var(--green-500)', color: 'white', border: 'none', padding: '11px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            🔄 Recalculate
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <div style={card('var(--green-500)')}>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--green-500)', marginBottom: 8 }}>₹{totalInc.toLocaleString()}</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)' }}>Total Income</div>
          </div>
          <div style={card('#e53e3e')}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#e53e3e', marginBottom: 8 }}>₹{totalExp.toLocaleString()}</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)' }}>Total Expenses</div>
          </div>
          <div style={card(net >= 0 ? 'var(--green-600)' : '#e53e3e')}>
            <div style={{ fontSize: 32, fontWeight: 700, color: net >= 0 ? 'var(--green-600)' : '#e53e3e', marginBottom: 8 }}>
              {net < 0 ? '-' : ''}₹{Math.abs(net).toLocaleString()}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-light)' }}>Net Balance</div>
          </div>
        </div>
      </>}
    </div>
  );
}