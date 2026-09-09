
import React, { useState, useRef, useEffect } from 'react';
import { databases, storage, account, DB_ID, COLLECTION_REQUESTS, BUCKET_FILES } from '../appwriteConfig';
import { ID } from 'appwrite';
import { Send, Loader, BrainCircuit, UploadCloud, X, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AskExpertProps {
    initialQuestion?: string | null;
    onQuestionUsed?: () => void;
}

// New Payment Modal Component
const PaymentModal = ({ onPay, onCancel }: { onPay: (price: number) => void, onCancel: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Choose Your Answer Depth</h2>
                    <button onClick={onCancel} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-gray-400 mb-8">Select the level of detail you need from our expert. This is a one-time payment per question.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Option 1: Minimal */}
                    <div className="bg-black/20 p-6 rounded-xl border border-white/10 flex flex-col items-center text-center hover:border-indigo-500/50 transition-colors">
                        <h3 className="text-xl font-semibold text-white">Minimal Explanation</h3>
                        <p className="text-gray-400 mt-2 flex-grow">A concise, to-the-point answer.</p>
                        <p className="text-4xl font-bold text-indigo-400 my-6">₹12</p>
                        <button
                            onClick={() => onPay(12)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-md font-semibold hover:bg-white/20 transition-colors"
                        >
                            <CreditCard className="w-5 h-5" /> Pay & Submit
                        </button>
                    </div>

                    {/* Option 2: Detailed */}
                     <div className="bg-black/20 p-6 rounded-xl border-2 border-indigo-500 flex flex-col items-center text-center">
                        <h3 className="text-xl font-semibold text-white">Detailed Explanation</h3>
                        <p className="text-gray-400 mt-2 flex-grow">A comprehensive, step-by-step breakdown.</p>
                        <p className="text-4xl font-bold text-indigo-400 my-6">₹19</p>
                        <button
                            onClick={() => onPay(19)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-500 transition-colors"
                        >
                            <CreditCard className="w-5 h-5" /> Pay & Submit
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};


const AskExpert: React.FC<AskExpertProps> = ({ initialQuestion, onQuestionUsed }) => {
    const [question, setQuestion] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false); // New state
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        if (initialQuestion) {
            setQuestion(initialQuestion);
            if (onQuestionUsed) {
                onQuestionUsed();
            }
        }
    }, [initialQuestion, onQuestionUsed]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    // This now just opens the modal
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() && !imageFile) return;
        
        // Instead of submitting, show the payment modal
        setShowPaymentModal(true);
    };

    // This function handles the actual submission after payment
    const handlePayAndSubmit = async (price: number) => {
        setShowPaymentModal(false);
        setIsLoading(true);
        setResponse('');

        try {
            const user = await account.get(); // Who is logged in?
            let imageId = null;

            // 1. If there is an image, upload it first
            if (imageFile) {
                const upload = await storage.createFile(BUCKET_FILES, ID.unique(), imageFile);
                imageId = upload.$id;
            }

            // 2. Save the Question to Database
            await databases.createDocument(
                DB_ID,
                COLLECTION_REQUESTS,
                ID.unique(),
                {
                    student_id: user.$id,
                    question: question,
                    question_image_id: imageId,
                    status: 'pending',
                    price: price // Optional: store the price paid
                }
            );

            setResponse("Question Sent to Experts! You'll receive a notification when an expert responds.");
            // Clear the form
            setQuestion('');
            setImageFile(null);
            setImagePreview(null);

        } catch (error: any) {
            setResponse("Error: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-2">Ask an Expert</h2>
            <p className="text-gray-400 mb-8">Can't find a calculator? Upload a photo or describe your problem for a detailed explanation from a subject-matter expert.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-black/20 p-8 rounded-xl border border-white/10">
                    <h3 className="font-semibold text-lg text-white mb-4">Your Question</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="question-description" className="block text-sm font-medium text-gray-300 mb-2">
                                Describe your problem
                            </label>
                            <textarea
                                id="question-description"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="e.g., Explain Maxwell's equations and their significance..."
                                className="w-full h-32 bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                                disabled={isLoading}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Upload an image (optional)
                            </label>
                            {imagePreview ? (
                                <div className="relative">
                                    <img src={imagePreview} alt="Question preview" className="w-full h-auto max-h-48 object-contain rounded-md bg-gray-800" />
                                    <button onClick={removeImage} type="button" className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-md cursor-pointer hover:border-indigo-500 hover:bg-white/5 transition-colors"
                                >
                                    <UploadCloud className="h-10 w-10 text-gray-500" />
                                    <p className="mt-2 text-sm text-gray-400">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/gif"
                                        disabled={isLoading}
                                    />
                                </div>
                            )}
                        </div>

                        <button type="submit" className="w-full px-6 py-3 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-500 transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed flex items-center justify-center gap-2" disabled={isLoading || (!question.trim() && !imageFile)}>
                           {isLoading ? <Loader className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
                           Proceed to Ask Expert
                        </button>
                    </form>
                </div>
                
                <div className="bg-black/20 p-8 rounded-xl border border-white/10 flex flex-col">
                    <h3 className="font-semibold text-lg text-white mb-4 flex-shrink-0">Expert's Response</h3>
                    <div className="flex-grow overflow-y-auto">
                        <AnimatePresence>
                        {isLoading ? (
                           <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="flex flex-col items-center justify-center text-gray-400 h-full">
                               <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.7, 1, 0.7],
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <BrainCircuit className="h-12 w-12 text-indigo-400 mb-4" />
                                </motion.div>
                               <p className="font-semibold text-lg">Our expert is thinking...</p>
                               <p className="text-sm">This may take a moment.</p>
                           </motion.div>
                        ) : response ? (
                            <motion.div initial={{opacity: 0, y:10}} animate={{opacity: 1, y: 0}} className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
                                {response}
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-500 h-full text-center">
                                <p>Your expert's detailed response will appear here.</p>
                            </div>
                        )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            
            <AnimatePresence>
                {showPaymentModal && <PaymentModal onPay={handlePayAndSubmit} onCancel={() => setShowPaymentModal(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default AskExpert;
