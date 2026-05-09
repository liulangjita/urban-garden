/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import DiscoverPage from './components/DiscoverPage';
import DetailPage from './components/DetailPage';
import MyPlotsPage from './components/MyPlotsPage';
import MessagesPage from './components/MessagesPage';
import ProfilePage from './components/ProfilePage';
import BottomNav from './components/BottomNav';
import { Plot, User } from './types';
import { fetchPlots } from './api';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'discover' | 'my-plots' | 'messages' | 'profile'>('discover');
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // 检查本地存储中的用户登录状态
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handlePlotSelect = (plot: Plot) => {
    setSelectedPlot(plot);
  };

  const handleBack = () => {
    setSelectedPlot(null);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentPage('discover');
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {!selectedPlot ? (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden"
          >
            <div className="h-full flex flex-col pb-20">
              {currentPage === 'discover' && <DiscoverPage onSelectPlot={handlePlotSelect} />}
              {currentPage === 'my-plots' && <MyPlotsPage user={user} onEditPlot={handlePlotSelect} />}
              {currentPage === 'messages' && <MessagesPage user={user} />}
              {currentPage === 'profile' && <ProfilePage user={user} onLogin={handleLogin} onLogout={handleLogout} />}
            </div>
            <BottomNav activeTab={currentPage} onTabChange={setCurrentPage} user={user} />
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50 bg-white"
          >
            <DetailPage plot={selectedPlot} onBack={handleBack} currentUser={user} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

