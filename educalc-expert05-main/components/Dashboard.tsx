
import React, { useState, useEffect } from 'react';
import { User, Page, Calculator, Question } from '../types';
import { STUDENT_HISTORY, EXPERT_QUESTIONS, AVAILABLE_QUESTIONS, EXPERT_EARNINGS_HISTORY } from '../constants';
import { getRecentCalculators } from '../services/recentCalculatorsService';
import { getFavorites } from '../services/favoritesService';
import { databases, storage, account, DB_ID, COLLECTION_REQUESTS, BUCKET_FILES } from '../appwriteConfig';
import { ID, Query } from 'appwrite';
import { BookOpen, HelpCircle, History, MessageSquare, ArrowRight, User as UserIcon, DollarSign, CheckCircle, Clock, Inbox, FileCheck, ListPlus, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import AnswerView from './AnswerView';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardProps {
  user: User;
  navigate: (page: Page) => void;
  navigateToCalculator: (calculator: Calculator) => void;
}

const DueDateBadge = ({ dueDate }: { dueDate?: string }) => {
  if (!dueDate) return null;

  const dueDateObj = new Date(dueDate);
  const now = new Date();
  const diffTime = dueDateObj.getTime() - now.getTime();
  const diffHours = Math.round(diffTime / (1000 * 60 * 60));

  let text = '';
  let colorClass = '';
  
  if (diffTime < 0) {
    const diffHoursAbs = Math.abs(diffHours);
    colorClass = 'text-red-400 bg-red-500/10';
    if (diffHoursAbs < 24) {
      text = `Overdue ${diffHoursAbs}h ago`;
    } else {
      text = `Overdue ${Math.round(diffHoursAbs / 24)}d ago`;
    }
  } else {
    if (diffHours <= 48) {
      colorClass = 'text-yellow-400 bg-yellow-500/10';
    } else {
      colorClass = 'text-gray-400 bg-white/10';
    }
    
    if (diffHours < 24) {
       text = `Due in ${diffHours}h`;
    } else {
       text = `Due in ${Math.round(diffHours/24)}d`;
    }
  }

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 ${colorClass}`}>
      <Clock className="w-3.5 h-3.5" />
      {text}
    </span>
  );
};


const DashboardCard = ({ icon, title, description, buttonText, onClick, children, className = '' }: { icon: React.ReactNode, title: string, description?: string, buttonText?: string, onClick?: () => void, children?: React.ReactNode, className?: string }) => (
    <motion.div 
        whileHover={{ y: -5, scale: 1.02, boxShadow: '0 10px 15px -3px rgba(129, 140, 248, 0.1), 0 4px 6px -2px rgba(129, 140, 248, 0.05)' }}
        className={`bg-black/20 p-6 rounded-xl border border-white/10 flex flex-col ${className}`}
    >
        <div className="flex-grow">
            <div className="flex items-center gap-4 mb-4">
                <div className="bg-indigo-600/30 p-3 rounded-lg text-indigo-400">
                    {icon}
                </div>
                <h3 className="font-semibold text-xl text-white">{title}</h3>
            </div>
            {description && <p className="text-gray-400 mb-4">{description}</p>}
            {children}
        </div>
        {buttonText && onClick && (
            <button onClick={onClick} className="mt-auto flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group">
                {buttonText} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
        )}
    </motion.div>
);


const StudentDashboard: React.FC<DashboardProps> = ({ user, navigate, navigateToCalculator }) => {
    const [recentCalculators, setRecentCalculators] = useState<Calculator[]>([]);
    const [favoriteCalculators, setFavoriteCalculators] = useState<Calculator[]>([]);

    useEffect(() => {
        setRecentCalculators(getRecentCalculators());
        setFavoriteCalculators(getFavorites());
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
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
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white/10 rounded-full border border-white/10">
                    <UserIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Welcome back, {user.name}!</h1>
                    <p className="text-gray-400">Ready to solve some problems?</p>
                </div>
            </div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
                <motion.div variants={itemVariants}>
                    <DashboardCard 
                        icon={<HelpCircle className="w-8 h-8"/>} 
                        title="Ask an Expert" 
                        description="Stuck on a tricky problem? Get a detailed explanation from our subject-matter experts."
                        buttonText="Ask Now"
                        onClick={() => navigate('ask')}
                        className="h-full"
                    />
                </motion.div>
                 <motion.div variants={itemVariants}>
                    <DashboardCard 
                        icon={<BookOpen className="w-8 h-8"/>} 
                        title="Calculator Library" 
                        description="Explore over 50 powerful calculators for math, science, finance, and more."
                        buttonText="Explore Library"
                        onClick={() => navigate('calculators')}
                        className="h-full"
                    />
                </motion.div>
            </motion.div>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Your Activity</h2>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                  <motion.div variants={itemVariants}>
                      <DashboardCard 
                          icon={<Star className="w-8 h-8"/>} 
                          title="Favorites"
                      >
                          {favoriteCalculators.length > 0 ? (
                              <ul className="space-y-3">
                                  {favoriteCalculators.map(calc => (
                                      <li key={calc.name} onClick={() => navigateToCalculator(calc)} className="text-gray-300 text-sm truncate p-3 bg-white/5 rounded-md hover:bg-white/10 hover:text-white cursor-pointer transition-colors">
                                          {calc.name}
                                      </li>
                                  ))}
                              </ul>
                          ) : (
                              <p className="text-gray-500 text-sm">Click the star on a calculator to add it here for quick access.</p>
                          )}
                      </DashboardCard>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                      <DashboardCard 
                          icon={<History className="w-8 h-8"/>} 
                          title="Recents"
                      >
                          {recentCalculators.length > 0 ? (
                              <ul className="space-y-3">
                                  {recentCalculators.map(calc => (
                                      <li key={calc.name} onClick={() => navigateToCalculator(calc)} className="text-gray-300 text-sm truncate p-3 bg-white/5 rounded-md hover:bg-white/10 hover:text-white cursor-pointer transition-colors">
                                          {calc.name}
                                      </li>
                                  ))}
                              </ul>
                          ) : (
                              <p className="text-gray-500 text-sm">Your recently used calculators will appear here.</p>
                          )}
                      </DashboardCard>
                  </motion.div>
                   <motion.div variants={itemVariants}>
                      <DashboardCard 
                          icon={<MessageSquare className="w-8 h-8"/>} 
                          title="Questions"
                      >
                           <ul className="space-y-3">
                              {STUDENT_HISTORY.questions.slice(0, 3).map(q => (
                                  <li key={q.id} className="text-gray-400 text-sm p-3 bg-white/5 rounded-md">
                                      <p className="truncate text-gray-300">{q.text}</p>
                                      <div className="mt-2 flex justify-between items-center">
                                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${q.status === 'Answered' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{q.status}</span>
                                          {q.status === 'Open' && <DueDateBadge dueDate={q.dueDate} />}
                                      </div>
                                  </li>
                              ))}
                          </ul>
                      </DashboardCard>
                  </motion.div>
              </motion.div>
            </div>
        </div>
    );
}

const ExpertDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'my-queue' | 'answered' | 'available'>('my-queue');
    const [answeringQuestion, setAnsweringQuestion] = useState<any | null>(null);
    const [pendingQuestions, setPendingQuestions] = useState<any[]>([]);

    useEffect(() => {
        fetchPendingQuestions();
    }, []);

    const fetchPendingQuestions = async () => {
        const response = await databases.listDocuments(
            DB_ID,
            COLLECTION_REQUESTS,
            [Query.equal('status', 'pending')]
        );
        setPendingQuestions(response.documents);
    };

    const sendAnswer = async (requestDocId: string, answerText: string, answerImageFile: File | null) => {
        try {
            const user = await account.get(); // Get current expert
            let answerImageId = null;

            // A. Upload Answer Image (Formulas)
            if (answerImageFile) {
                const upload = await storage.createFile(BUCKET_FILES, ID.unique(), answerImageFile);
                answerImageId = upload.$id;
            }

            // B. Update the Database
            await databases.updateDocument(
                DB_ID,
                COLLECTION_REQUESTS,
                requestDocId, // The ID of the question being answered
                {
                    answer: answerText,
                    answer_image_id: answerImageId,
                    status: 'answered',
                    expert_id: user.$id
                }
            );

            alert("Answer Sent!");
            fetchPendingQuestions(); // Refresh the list

        } catch (error: any) {
            alert("Error: " + error.message);
        }
    };

    const myQueue = pendingQuestions; // Use fetched questions
    const answered = EXPERT_QUESTIONS.filter(q => q.status === 'Answered');
    const available = AVAILABLE_QUESTIONS;

    const stats = {
        earnings: '1,250.75',
        answeredCount: answered.length,
        openCount: myQueue.length,
    };
    
    const handleAnswerNow = (question: Question) => {
        setAnsweringQuestion(question);
    };

    const handleAnswerSubmit = async (answer: { image: File; description?: string }) => {
        await sendAnswer(answeringQuestion.$id, answer.description || '', answer.image);
        setAnsweringQuestion(null);
    };

    const earningsChartData = {
        labels: EXPERT_EARNINGS_HISTORY.labels,
        datasets: [
            {
                label: 'Earnings ($)',
                data: EXPERT_EARNINGS_HISTORY.data,
                fill: true,
                backgroundColor: 'rgba(129, 140, 248, 0.2)',
                borderColor: 'rgb(129, 140, 248)',
                tension: 0.4,
                pointBackgroundColor: 'rgb(129, 140, 248)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(129, 140, 248)'
            },
        ],
    };

    const earningsChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#9ca3af',
                },
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: '#9ca3af',
                    callback: function(value: any) {
                        return '$' + value;
                    }
                },
            },
        },
    };

    if (answeringQuestion) {
        return (
            <AnswerView 
                question={answeringQuestion}
                onBack={() => setAnsweringQuestion(null)}
                onSubmit={handleAnswerSubmit}
            />
        );
    }

    const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) => (
        <div className="bg-black/20 p-6 rounded-xl border border-white/10 flex items-center gap-6">
            <div className="bg-indigo-600/30 p-4 rounded-lg text-indigo-400">
                {icon}
            </div>
            <div>
                <p className="text-gray-400 text-sm">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );

    const TabButton = ({ text, icon, isActive, onClick }: { text: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }) => {
        const baseClasses = "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-200 focus:outline-none";
        const activeClasses = "border-b-2 border-indigo-500 text-white";
        const inactiveClasses = "border-b-2 border-transparent text-gray-400 hover:text-white";
        return (
            <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
                {icon}
                {text}
            </button>
        );
    };

    const QuestionList = ({ questions, actionText, onActionClick }: { questions: any[], actionText: string, onActionClick: (question: any) => void }) => (
          <div className="bg-black/20 rounded-xl border border-white/10">
              <ul className="divide-y divide-white/10">
                 {questions.length > 0 ? questions.map(q => (
                     <li key={q.$id} className="p-6 hover:bg-white/5 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                         <div className="flex-grow">
                             <p className="text-gray-300 mb-2">{q.question}</p>
                             <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                                 <span className="text-sm text-gray-500">From: Student {q.student_id}</span>
                                 {q.status === 'pending' && <DueDateBadge dueDate={q.dueDate} />}
                             </div>
                         </div>
                         <button onClick={() => onActionClick(q)} className="flex-shrink-0 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-500 transition-colors self-end sm:self-center">
                             {actionText}
                         </button>
                     </li>
                 )) : (
                     <li className="p-6 text-center text-gray-500">No questions in this category.</li>
                 )}
              </ul>
         </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8">Expert Dashboard</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard icon={<DollarSign className="w-7 h-7" />} title="Total Earnings" value={`$${stats.earnings}`} />
                <StatCard icon={<CheckCircle className="w-7 h-7" />} title="Questions Answered" value={stats.answeredCount} />
                <StatCard icon={<Clock className="w-7 h-7" />} title="Open in Your Queue" value={stats.openCount} />
            </div>
            
            {/* Earnings Chart */}
            <div className="bg-black/20 p-6 rounded-xl border border-white/10 mb-12">
                <h3 className="text-xl font-semibold text-white mb-4">Earnings Overview</h3>
                <div className="h-64">
                    <Line options={earningsChartOptions} data={earningsChartData} />
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10 mb-6">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <TabButton text="My Queue" icon={<Inbox className="w-5 h-5"/>} isActive={activeTab === 'my-queue'} onClick={() => setActiveTab('my-queue')} />
                    <TabButton text="Answered" icon={<FileCheck className="w-5 h-5"/>} isActive={activeTab === 'answered'} onClick={() => setActiveTab('answered')} />
                    <TabButton text="Available Questions" icon={<ListPlus className="w-5 h-5"/>} isActive={activeTab === 'available'} onClick={() => setActiveTab('available')} />
                </nav>
            </div>

            {/* Content */}
            <div>
                {activeTab === 'my-queue' && <QuestionList questions={myQueue} actionText="Answer Now" onActionClick={handleAnswerNow} />}
                {activeTab === 'answered' && <QuestionList questions={answered} actionText="View" onActionClick={(q) => alert(`Viewing answer for: "${q.text}"`)} />}
                {activeTab === 'available' && <QuestionList questions={available} actionText="Claim & Answer" onActionClick={(q) => alert(`Claiming question: "${q.text}"`)} />}
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ user, navigate, navigateToCalculator }) => {
    if (user.role === 'student') {
        return <StudentDashboard user={user} navigate={navigate} navigateToCalculator={navigateToCalculator} />;
    }
    return <ExpertDashboard />;
};

export default Dashboard;