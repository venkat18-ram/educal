
import React from 'react';
import { Page, User } from '../types';
import { Calculator, LogOut, User as UserIcon, BrainCircuit, ArrowRight } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  navigate: (page: Page, options?: { scrollTo?: string }) => void;
  logout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, navigate, logout }) => {
  return (
    <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a onClick={() => navigate('landing')} className="cursor-pointer flex items-center gap-2 text-xl font-bold text-white p-2 border border-indigo-500 rounded-lg">
               <BrainCircuit className="h-7 w-7 text-indigo-400" />
               EduCalc Expert
            </a>
          </div>
          {(!user || user.role === 'student') && (
            <nav className="hidden md:flex md:space-x-10">
              <a onClick={() => navigate('calculators')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer">Calculators</a>
              <a onClick={() => navigate('ask')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer">Ask an Expert</a>
              <a onClick={() => navigate('landing', { scrollTo: 'pricing' })} className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer">Pricing</a>
            </nav>
          )}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-300 hidden sm:block">Welcome, {user.name}</span>
                <button onClick={() => navigate('profile')} className="flex items-center text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  <UserIcon className="h-5 w-5 mr-1" /> Profile
                </button>
                <button onClick={logout} className="p-2 rounded-full text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('login')} className="flex items-center justify-center px-4 py-2 border border-blue-500 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <ArrowRight className="h-5 w-5 mr-2"/>
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
