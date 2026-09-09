import { account, databases, DB_ID, COLLECTION_USERS } from '../appwriteConfig';
import { ID } from 'appwrite';
import React, { useState } from 'react';
import { User, Briefcase, Mail, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


interface LoginPageProps {
  onLogin: (role: 'student' | 'expert', name?: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'expert'>('student');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Signup logic
        const user = await account.create(ID.unique(), email, password, name);
        await account.createEmailPasswordSession(email, password);
        await databases.createDocument(
          DB_ID,
          COLLECTION_USERS,
          user.$id,
          {
            user_id: user.$id,
            name: name,
            role: activeTab
          }
        );
        onLogin(activeTab, name);
      } else {
        // Login logic
        await account.createEmailPasswordSession(email, password);
        const user = await account.get();
        const userDoc = await databases.getDocument(DB_ID, COLLECTION_USERS, user.$id);
        onLogin(userDoc.role, userDoc.name);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const tabs = [
    { id: 'student', label: isSignUp ? "Student Sign Up" : "Student Login", icon: <User className="inline-block mr-2 h-5 w-5" /> },
    { id: 'expert', label: isSignUp ? "Expert Sign Up" : "Expert Login", icon: <Briefcase className="inline-block mr-2 h-5 w-5" /> }
  ];
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full space-y-8 bg-black/20 p-8 rounded-xl border border-white/10 shadow-2xl shadow-indigo-500/10 backdrop-blur-sm"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {isSignUp ? 'Join our community today' : 'or start your journey with us today'}
          </p>
        </div>
        
        <div className="flex border-b border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'student' | 'expert')}
              className={`${
                activeTab === tab.id ? "" : "hover:text-gray-200"
              } w-1/2 py-4 px-1 text-center font-medium text-lg text-gray-300 transition-colors duration-300 relative focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 rounded-t-md`}
            >
              <span className="flex items-center justify-center">
                {tab.icon}
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <motion.div
                  className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-indigo-400"
                  layoutId="underline"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            {isSignUp && (
                 <div className="relative">
                    <input 
                        id="name" 
                        name="name" 
                        type="text" 
                        required={isSignUp}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        aria-label="Full Name" 
                        className="appearance-none rounded-none relative block w-full px-3 py-3 border border-white/10 bg-black/20 text-white placeholder-gray-500 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                        placeholder="Full Name" 
                    />
                    <User className="absolute right-3 top-3.5 h-5 w-5 text-gray-500"/>
                </div>
            )}
            <div className="relative">
              <input id="email-address" name="email" type="email" required aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className={`appearance-none rounded-none relative block w-full px-3 py-3 border border-white/10 bg-black/20 text-white placeholder-gray-500 ${isSignUp ? '' : 'rounded-t-md'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`} placeholder="Email address" />
                <Mail className="absolute right-3 top-3.5 h-5 w-5 text-gray-500"/>
            </div>
            <div className="relative">
              <input id="password" name="password" type="password" required aria-label="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-3 border border-white/10 bg-black/20 text-white placeholder-gray-500 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Password" />
              <Key className="absolute right-3 top-3.5 h-5 w-5 text-gray-500"/>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-500 bg-gray-700 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-400 hover:text-indigo-300">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : (isSignUp ? (activeTab === 'student' ? 'Sign Up as Student' : 'Sign Up as Expert') : (activeTab === 'student' ? 'Sign In as Student' : 'Sign In as Expert'))}
            </motion.button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
              <button 
                type="button" 
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setName('');
                  setEmail('');
                  setPassword('');
                  setError('');
                }}
                className="font-medium text-indigo-400 hover:text-indigo-300 focus:outline-none focus:underline transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </form>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

      </motion.div>
    </div>
  );
};

export default LoginPage;
