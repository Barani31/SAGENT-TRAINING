import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { incomeApi, expenseApi, budgetApi, goalApi } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [income, setIncome]   = useState(0);
  const [expense, setExpense] = useState(0);
  const [budgets, setBudgets] = useState(0);
  const [goals, setGoals]     = useState(0);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    // Fetch income
    incomeApi.getAll().then(data => {
      console.log('RAW income data:', JSON.stringify(data[0]));
      const total = data.reduce((sum, item) => {
        const amt = Number(item.amount ?? item.incomeAmount ?? item.value ?? 0);
        return sum + amt;
      }, 0);
      setIncome(total);
    }).catch(console.error);

    // Fetch expenses
    expenseApi.getAll().then(data => {
      console.log('RAW expense data:', JSON.stringify(data[0]));
      const total = data.reduce((sum, item) => {
        const amt = Number(item.amount ?? item.expenseAmount ?? item.value ?? 0);
        return sum + amt;
      }, 0);
      setExpense(total);
    }).catch(console.error);

    // Fetch budgets count
    budgetApi.getAll().then(data => {
      setBudgets(data.length);
    }).catch(console.error);

    // Fetch goals count
    goalApi.getByUser(user.id).then(data => {
      setGoals(Array.isArray(data) ? data.length : 0);
      setLoaded(true);
    }).catch(() => { setGoals(0); setLoaded(true); });

  }, [user]);

  const balance = income - expense;

  const s = {
    heading: { fontFamily: "'DM Serif Display', serif", fontSize: 28, color: 'var(--text-dark)', marginBottom: 6 },
    sub: { color: 'var(--text-light)', fontSize: 14, marginBottom: 32 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 36 },
    card: (color) => ({
      background: '#ffffff', borderRadius: 'var(--radius)', padding: '24px',
      boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
      borderLeft: `4px solid ${color}`,
    }),
    num: (color) => ({ fontSize: 34, fontWeight: 700, color, lineHeight: 1, marginBottom: 8 }),
    lbl: { fontSize: 13, color: 'var(--text-light)', fontWeight: 500 },
    secTitle: { fontSize: 16, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 16 },
    quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 },
    quickCard: {
      background: '#ffffff', borderRadius: 'var(--radius)', padding: '18px 22px',
      boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      textDecoration: 'none',
    },
    quickLabel: { fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' },
    arrow: { fontSize: 18, color: 'var(--green-400)' },
  };

  const stats = [
    { label: 'Total Income',   value: `₹${income.toLocaleString()}`,            color: 'var(--green-500)' },
    { label: 'Total Expenses', value: `₹${expense.toLocaleString()}`,           color: '#e53e3e' },
    { label: 'Net Balance',    value: (balance < 0 ? '-' : '') + `₹${Math.abs(balance).toLocaleString()}`, color: balance >= 0 ? 'var(--green-600)' : '#e53e3e' },
    { label: 'Active Budgets', value: budgets,                                   color: 'var(--green-400)' },
  ];

  const links = [
    { to: '/income',        label: '💰 Add Income' },
    { to: '/expenses',      label: '🛒 Log Expense' },
    { to: '/goals',         label: '🎯 Track Goals' },
    { to: '/budget',        label: '📋 Set Budget' },
    { to: '/balance',       label: '⚖️ View Balance' },
    { to: '/notifications', label: '🔔 Notifications' },
  ];

  return (
    <div>
      <div style={s.heading}>Welcome, {user?.name} 👋</div>
      <div style={s.sub}>Your financial summary at a glance</div>
      <div style={s.grid}>
        {stats.map(({ label, value, color }) => (
          <div key={label} style={s.card(color)}>
            <div style={s.num(color)}>{value}</div>
            <div style={s.lbl}>{label}</div>
          </div>
        ))}
      </div>
      <div style={s.secTitle}>Quick Access</div>
      <div style={s.quickGrid}>
        {links.map(({ to, label }) => (
          <Link key={to} to={to} style={s.quickCard}>
            <span style={s.quickLabel}>{label}</span>
            <span style={s.arrow}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}