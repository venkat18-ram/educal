
import React, { useState, useEffect } from 'react';
import { User, StudentProfile, ExpertProfile } from '../types';
import { UserCircle, Pen, Save, X, Book, HelpCircle, BarChart, Award, DollarSign, Star } from 'lucide-react';

interface ProfilePageProps {
    user: User;
    onUpdateProfile: (updatedUser: User) => void;
}

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
    <div className="bg-black/20 p-6 rounded-xl border border-white/10 flex items-center gap-4">
        <div className="text-indigo-400">{icon}</div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-lg font-semibold text-white">{value}</p>
        </div>
    </div>
);

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<User>(user);

    useEffect(() => {
        setFormData(user);
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onUpdateProfile(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(user);
        setIsEditing(false);
    };

    const renderStudentProfile = (profile: StudentProfile) => (
        <>
            <div className="bg-black/20 p-8 rounded-xl border border-white/10">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                        <p className="text-indigo-400">Student</p>
                    </div>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm px-4 py-2 bg-white/10 text-gray-300 hover:bg-white/20 rounded-md transition-colors">
                            <Pen className="w-4 h-4" /> Edit Profile
                        </button>
                    )}
                </div>

                <div className="mt-6 border-t border-white/10 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400">Full Name</label>
                            {isEditing ? (
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                            ) : (
                                <p className="text-white text-lg">{profile.name}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-400">School / University</label>
                             {isEditing ? (
                                <input type="text" name="school" value={(formData as StudentProfile).school || ''} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                            ) : (
                                <p className="text-white text-lg">{profile.school || 'Not specified'}</p>
                            )}
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="mt-6 border-t border-white/10 pt-6 flex justify-end gap-4">
                        <button onClick={handleCancel} className="flex items-center gap-2 text-sm px-4 py-2 bg-white/10 text-gray-300 hover:bg-white/20 rounded-md transition-colors">
                            <X className="w-4 h-4" /> Cancel
                        </button>
                        <button onClick={handleSave} className="flex items-center gap-2 text-sm px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 rounded-md transition-colors">
                            <Save className="w-4 h-4" /> Save Changes
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-semibold text-white mb-4">My Activity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={<Book className="w-6 h-6"/>} label="Calculations Performed" value={12} />
                    <StatCard icon={<HelpCircle className="w-6 h-6"/>} label="Questions Asked" value={2} />
                    <StatCard icon={<BarChart className="w-6 h-6"/>} label="Most Used Category" value="Calculus" />
                </div>
            </div>
        </>
    );

    const renderExpertProfile = (profile: ExpertProfile) => (
         <>
            <div className="bg-black/20 p-8 rounded-xl border border-white/10">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                        <p className="text-indigo-400">Verified Expert</p>
                    </div>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm px-4 py-2 bg-white/10 text-gray-300 hover:bg-white/20 rounded-md transition-colors">
                            <Pen className="w-4 h-4" /> Edit Profile
                        </button>
                    )}
                </div>

                <div className="mt-6 border-t border-white/10 pt-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-400">Full Name</label>
                        {isEditing ? (
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        ) : (
                            <p className="text-white text-lg">{profile.name}</p>
                        )}
                    </div>
                     <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-400">Expertise</label>
                         {isEditing ? (
                            <input type="text" name="expertise" value={(formData as ExpertProfile).expertise || ''} onChange={handleInputChange} placeholder="e.g., Physics, Advanced Calculus" className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        ) : (
                            <p className="text-white text-lg">{profile.expertise || 'Not specified'}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-400">Bio</label>
                         {isEditing ? (
                            <textarea name="bio" value={(formData as ExpertProfile).bio || ''} onChange={handleInputChange} rows={3} className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        ) : (
                            <p className="text-gray-300 text-base">{profile.bio || 'No bio provided.'}</p>
                        )}
                    </div>
                </div>

                {isEditing && (
                    <div className="mt-6 border-t border-white/10 pt-6 flex justify-end gap-4">
                        <button onClick={handleCancel} className="flex items-center gap-2 text-sm px-4 py-2 bg-white/10 text-gray-300 hover:bg-white/20 rounded-md transition-colors">
                            <X className="w-4 h-4" /> Cancel
                        </button>
                        <button onClick={handleSave} className="flex items-center gap-2 text-sm px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 rounded-md transition-colors">
                            <Save className="w-4 h-4" /> Save Changes
                        </button>
                    </div>
                )}
            </div>
            <div className="mt-8">
                <h3 className="text-xl font-semibold text-white mb-4">My Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={<Award className="w-6 h-6"/>} label="Questions Answered" value={42} />
                    <StatCard icon={<Star className="w-6 h-6"/>} label="Average Rating" value="4.9 / 5.0" />
                    <StatCard icon={<DollarSign className="w-6 h-6"/>} label="Total Earnings" value="$1,250.75" />
                </div>
            </div>
        </>
    );

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                 <UserCircle className="w-10 h-10 text-gray-500" />
                <h1 className="text-3xl font-bold text-white">My Profile</h1>
            </div>
            {user.role === 'student' ? renderStudentProfile(user as StudentProfile) : renderExpertProfile(user as ExpertProfile)}
        </div>
    );
};

export default ProfilePage;
