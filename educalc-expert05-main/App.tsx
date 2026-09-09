
import React, { useState } from 'react';
import { Page, User } from './types';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import MainApp from './components/MainApp';
import Footer from './components/Footer';
import * as profileService from './services/profileService';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [page, setPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [scrollToSection, setScrollToSection] = useState<string | null>(null);

  const navigate = (targetPage: Page, options?: { scrollTo?: string }) => {
    if ((targetPage === 'dashboard' || targetPage === 'ask' || targetPage === 'calculators' || targetPage === 'profile') && !user) {
      setPage('login');
    } else {
      setPage(targetPage);
      if (options?.scrollTo) {
        // Set a scroll target which will be passed to the relevant page component
        setScrollToSection(options.scrollTo);
      }
    }
  };

  const login = (role: 'student' | 'expert', name?: string) => {
    let userProfile = profileService.getProfile(role);
    // If name is provided (Sign Up) or no profile exists, create/overwrite it
    if (!userProfile || name) {
        userProfile = role === 'student' 
            ? profileService.createDefaultStudent(name || 'Alex Doe')
            : profileService.createDefaultExpert(name || 'Dr. Evelyn Reed');
        profileService.saveProfile(role, userProfile);
    }
    setUser(userProfile);
    setPage('dashboard');
  };
  
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    profileService.saveProfile(updatedUser.role, updatedUser);
  };

  const logout = () => {
    setUser(null);
    setPage('landing');
  };

  const renderPage = () => {
    switch (page) {
      case 'landing':
        return <LandingPage navigate={navigate} scrollTo={scrollToSection} onScrollHandled={() => setScrollToSection(null)} />;
      case 'login':
        return <LoginPage onLogin={login} />;
      case 'dashboard':
      case 'calculators':
      case 'ask':
      case 'profile':
        return user ? <MainApp user={user} currentPage={page} navigate={navigate} updateUser={updateUser} /> : <LoginPage onLogin={login} />;
      default:
        return <LandingPage navigate={navigate} scrollTo={scrollToSection} onScrollHandled={() => setScrollToSection(null)} />;
    }
  };

  return (
    <div className="bg-[#030303] text-gray-100 min-h-screen font-sans flex flex-col bg-aurora">
      <Header user={user} navigate={navigate} logout={logout} />
      <AnimatePresence>
        <motion.main
          key={page}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-grow"
        >
          {renderPage()}
        </motion.main>
      </AnimatePresence>
      {page === 'landing' && <Footer />}
    </div>
  );
}

export default App;
