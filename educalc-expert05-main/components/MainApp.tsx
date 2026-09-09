
import React, { useState, useEffect } from 'react';
import { Page, User, Calculator as CalculatorType, CalculationResult } from '../types';
import { CALCULATOR_CATEGORIES, CALCULATORS } from '../constants';
import { BookOpen, HelpCircle, LayoutDashboard, Search, ChevronRight, Loader, Info, UserCircle, Star, ArrowRight } from 'lucide-react';
import CalculatorView from './CalculatorView';
import Dashboard from './Dashboard';
import AskExpert from './AskExpert';
import Tooltip from './ui/Tooltip';
import Highlight from './ui/Highlight';
import ProfilePage from './ProfilePage';
import { motion } from 'framer-motion';
import * as favoritesService from '../services/favoritesService';
import { getRecentCalculators } from '../services/recentCalculatorsService';
import { cn } from '../lib/utils';


// --- Marquee Component ---
interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children?: React.ReactNode;
  vertical?: boolean;
  [key: string]: any;
}

const Marquee: React.FC<MarqueeProps> = ({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn(
        'group flex overflow-hidden p-2 [--gap:1.5rem] [gap:var(--gap)]',
        !vertical && 'flex-row',
        vertical && 'flex-col',
        className
      )}
    >
      <div
        className={cn('flex shrink-0 justify-around [gap:var(--gap)] min-w-full',
          !vertical && 'animate-marquee flex-row',
          vertical && 'animate-marquee-vertical flex-col',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
          reverse && '[animation-direction:reverse]',
        )}
      >
        {children}
      </div>
      <div
        className={cn('flex shrink-0 justify-around [gap:var(--gap)] min-w-full',
          !vertical && 'animate-marquee flex-row',
          vertical && 'animate-marquee-vertical flex-col',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
          reverse && '[animation-direction:reverse]',
        )}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
};

interface MarqueeItemProps {
    children: React.ReactNode;
    onClick?: () => void;
}

const MarqueeItem: React.FC<MarqueeItemProps> = ({ children, onClick }) => {
    return (
        <div className="flex items-center gap-6">
            <div
                onClick={onClick}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-black/20 border border-white/10 rounded-xl text-gray-300 shrink-0 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
                {children}
                <ArrowRight className="w-4 h-4 text-gray-500" />
            </div>
            <div className="h-8 w-px bg-white/10 shrink-0"></div>
        </div>
    );
};
// --- End Marquee Component ---

interface MainAppProps {
  user: User;
  currentPage: Page;
  navigate: (page: Page) => void;
  updateUser: (user: User) => void;
}

// Side Navigation
const SideNav: React.FC<{ currentPage: Page; navigate: (page: Page) => void; userRole: 'student' | 'expert' }> = ({ currentPage, navigate, userRole }) => {
  const navItemClasses = (page: Page) => `flex items-center px-4 py-3 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 ${
    currentPage === page ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
  }`;

  return (
    <nav className="space-y-2">
      <a onClick={() => navigate('dashboard')} className={navItemClasses('dashboard')}>
        <LayoutDashboard className="h-5 w-5 mr-3" />
        Dashboard
      </a>
      {userRole === 'student' && (
        <>
          <a onClick={() => navigate('calculators')} className={navItemClasses('calculators')}>
            <BookOpen className="h-5 w-5 mr-3" />
            Calculator Library
          </a>
          <a onClick={() => navigate('ask')} className={navItemClasses('ask')}>
            <HelpCircle className="h-5 w-5 mr-3" />
            Ask an Expert
          </a>
        </>
      )}
      <a onClick={() => navigate('profile')} className={navItemClasses('profile')}>
        <UserCircle className="h-5 w-5 mr-3" />
        My Profile
      </a>
    </nav>
  );
};

// Calculator Library
const CalculatorLibrary: React.FC<{ onSelectCalculator: (calculator: CalculatorType) => void, navigate: (page: Page) => void }> = ({ onSelectCalculator, navigate }) => {
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [filteredCalculators, setFilteredCalculators] = useState<CalculatorType[]>(CALCULATORS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentCalculators, setRecentCalculators] = useState<CalculatorType[]>([]);


  useEffect(() => {
    setFavorites(favoritesService.getFavorites().map(f => f.name));
    setRecentCalculators(getRecentCalculators());
  }, []);

  useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(() => {
      const results = CALCULATORS.filter(calc =>
        (calc.name.toLowerCase().includes(filter.toLowerCase()) || calc.description.toLowerCase().includes(filter.toLowerCase())) &&
        (!selectedCategory || calc.category === selectedCategory)
      );
      setFilteredCalculators(results);
      setIsSearching(false);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [filter, selectedCategory]);
  
  const handleToggleFavorite = (e: React.MouseEvent, calc: CalculatorType) => {
    e.stopPropagation(); // Prevent card click
    const updatedFavorites = favoritesService.toggleFavorite(calc);
    setFavorites(updatedFavorites.map(f => f.name));
  };

  const marqueeItems = [
    ...recentCalculators.slice(0, 2).map(calc => ({
      id: calc.name,
      content: <p className="truncate max-w-[200px] text-sm">{calc.description}</p>,
      onClick: () => onSelectCalculator(calc),
    })),
    {
      id: 'ask-expert',
      content: <p className="font-semibold text-white">Ask an Expert</p>,
      onClick: () => navigate('ask'),
    },
    {
      id: 'stats-calc',
      content: <p className="truncate max-w-[200px] text-sm">{CALCULATORS.find(c => c.name === 'Statistics Calculator')?.description}</p>,
      onClick: () => onSelectCalculator(CALCULATORS.find(c => c.name === 'Statistics Calculator')!),
    },
    {
      id: 'mortgage-calc',
      content: <p className="truncate max-w-[200px] text-sm">{CALCULATORS.find(c => c.name === 'Mortgage Calculator')?.description}</p>,
      onClick: () => onSelectCalculator(CALCULATORS.find(c => c.name === 'Mortgage Calculator')!),
    },
     {
      id: 'profile',
      content: <p className="font-semibold text-white">View Your Profile</p>,
      onClick: () => navigate('profile'),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div>
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-8 border-y border-white/10 bg-black/10">
        <Marquee pauseOnHover>
          {marqueeItems.map(item => (
            <MarqueeItem key={item.id} onClick={item.onClick}>
              {item.content}
            </MarqueeItem>
          ))}
        </Marquee>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#030303] via-transparent to-[#030303]"></div>
      </div>

      <div className="relative mb-6">
        <input 
          type="text" 
          placeholder="Search for a calculator..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Search for a calculator"
          className="w-full bg-black/20 border border-white/10 rounded-md py-3 pl-10 pr-10 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        {isSearching && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 animate-spin" />}
      </div>
       <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setSelectedCategory(null)} className={`px-4 py-1.5 text-sm rounded-full transition-colors ${!selectedCategory ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-indigo-500`}>All</button>
        {CALCULATOR_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 text-sm rounded-full transition-colors ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-indigo-500`}>{cat}</button>
        ))}
      </div>
      
      {isSearching ? (
        <div className="flex justify-center items-center h-64">
            <Loader className="h-10 w-10 text-indigo-400 animate-spin" />
        </div>
      ) : (
        filteredCalculators.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredCalculators.map(calc => (
              <motion.div 
                key={calc.name} 
                variants={itemVariants}
                onClick={() => onSelectCalculator(calc)} 
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectCalculator(calc)}
                role="button"
                tabIndex={0}
                aria-label={`Open ${calc.name} calculator`}
                className="bg-black/20 p-6 rounded-xl border border-white/10 hover:border-indigo-500/50 transition-colors cursor-pointer group hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between min-h-[180px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors flex-grow pr-2 h-14 line-clamp-2">
                      <Highlight text={calc.name} highlight={filter} />
                    </h3>
                     <Tooltip content={favorites.includes(calc.name) ? `Remove ${calc.name} from Favorites` : `Add ${calc.name} to Favorites`}>
                       <button
                           onClick={(e) => handleToggleFavorite(e, calc)}
                           className="p-1 -mr-1 -mt-1 text-gray-500 hover:text-yellow-400 transition-colors rounded-full z-10 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-yellow-400"
                           aria-label={favorites.includes(calc.name) ? `Remove ${calc.name} from Favorites` : `Add ${calc.name} to Favorites`}
                       >
                           <Star className={`w-5 h-5 transition-all ${favorites.includes(calc.name) ? 'text-yellow-400 fill-current' : ''}`} />
                       </button>
                     </Tooltip>
                  </div>
                  <p className="text-sm text-gray-400 mt-2 h-10 line-clamp-2">
                    <Highlight text={calc.description} highlight={filter} />
                  </p>
                </div>
                <div className="flex justify-end mt-4">
                    <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1"/>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 text-gray-500">
            <p>No calculators found.</p>
          </div>
        )
      )}
    </div>
  );
};


const MainApp: React.FC<MainAppProps> = ({ user, currentPage, navigate, updateUser }) => {
  const [selectedCalculator, setSelectedCalculator] = useState<CalculatorType | null>(null);
  const [askExpertContext, setAskExpertContext] = useState<string | null>(null);

  // When navigating away from the calculators page, reset the selected calculator
  useEffect(() => {
    if (currentPage !== 'calculators' && selectedCalculator) {
      setSelectedCalculator(null);
    }
  }, [currentPage, selectedCalculator]);
  
  const navigateToAskWithContext = (calculatorName: string, inputs: any, result: CalculationResult) => {
    const context = `Hi, I was using the "${calculatorName}" calculator.\n\nMy inputs were:\n${JSON.stringify(inputs, null, 2)}\n\nAnd the result I got was:\n"${result.text}"\n\nCould you please provide more clarification on how this result was reached?`;
    setAskExpertContext(context);
    navigate('ask');
  };

  const navigateToCalculator = (calculator: CalculatorType) => {
    setSelectedCalculator(calculator);
    navigate('calculators');
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} navigate={navigate} navigateToCalculator={navigateToCalculator} />;
      case 'calculators':
        return selectedCalculator ? (
          <CalculatorView 
            calculator={selectedCalculator} 
            onBack={() => setSelectedCalculator(null)}
            navigateToAskWithContext={navigateToAskWithContext}
          />
        ) : (
          <CalculatorLibrary onSelectCalculator={(calc) => setSelectedCalculator(calc)} navigate={navigate} />
        );
      case 'ask':
        return <AskExpert 
                  initialQuestion={askExpertContext} 
                  onQuestionUsed={() => setAskExpertContext(null)} 
                />;
      case 'profile':
        return <ProfilePage user={user} onUpdateProfile={updateUser} />;
      default:
        return <Dashboard user={user} navigate={navigate} navigateToCalculator={navigateToCalculator} />;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <motion.aside 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full md:w-1/4 lg:w-1/5"
        >
          <div className="bg-black/20 p-4 rounded-xl border border-white/10">
            <SideNav currentPage={currentPage} navigate={navigate} userRole={user.role} />
          </div>
        </motion.aside>
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="w-full md:w-3/4 lg:w-4/5"
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default MainApp;
