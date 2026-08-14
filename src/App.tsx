import { useEffect, useState } from 'react';
import { seedDefaults } from './db/db';
import { NavBar, type Tab } from './components/NavBar';
import { LogTab } from './components/LogTab';
import { HistoryTab } from './components/HistoryTab';
import { SettingsTab } from './components/SettingsTab';

export function App() {
  const [tab, setTab] = useState<Tab>('log');

  useEffect(() => {
    void seedDefaults();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {tab === 'log' && <LogTab />}
      {tab === 'history' && <HistoryTab />}
      {tab === 'settings' && <SettingsTab />}
      <NavBar active={tab} onChange={setTab} />
    </div>
  );
}
