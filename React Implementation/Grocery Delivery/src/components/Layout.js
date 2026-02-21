import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 230, flex: 1, padding: '32px 36px', background: 'var(--bg)', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
