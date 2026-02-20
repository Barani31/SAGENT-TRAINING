import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 224, flex: 1, minHeight: '100vh', padding: '36px 40px' }}>
        {children}
      </main>
    </div>
  );
}
