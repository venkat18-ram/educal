
import React, { useState, useRef } from 'react';
import { Question } from '../types';
import { ArrowLeft, Send, Loader, UploadCloud, X, FileText, Clock } from 'lucide-react';

interface AnswerViewProps {
  question: Question;
  onBack: () => void;
  onSubmit: (answer: { image: File; description?: string }) => void;
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


const AnswerView: React.FC<AnswerViewProps> = ({ question, onBack, onSubmit }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
        alert("An image is required to submit an answer.");
        return;
    }
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
        onSubmit({ image: imageFile, description });
        setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <h2 className="text-3xl font-bold text-white mb-2">Answer Question</h2>
      <div className="bg-black/20 p-6 rounded-xl border border-white/10 mb-8">
        <div className="flex justify-between items-start gap-4">
            <div className="flex-grow">
              <p className="text-sm text-gray-400 mb-2">Replying to {question.student}:</p>
              <p className="text-lg text-gray-200 italic">"{question.text}"</p>
            </div>
            <div className="flex-shrink-0">
              <DueDateBadge dueDate={question.dueDate} />
            </div>
        </div>
      </div>

      <div className="bg-black/20 p-8 rounded-xl border border-white/10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload Answer Image (Required)
            </label>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Answer preview" className="w-full h-auto max-h-64 object-contain rounded-md bg-gray-800" />
                <button onClick={removeImage} type="button" className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-md cursor-pointer hover:border-indigo-500 hover:bg-white/5 transition-colors"
              >
                <UploadCloud className="h-12 w-12 text-gray-500" />
                <p className="mt-2 text-sm text-gray-400">Click to upload your answer</p>
                <p className="text-xs text-gray-500">e.g., a photo of handwritten work</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif"
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide additional context or step-by-step explanations here..."
              className="w-full h-32 bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-500 transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isSubmitting || !imageFile}
            >
              {isSubmitting ? <Loader className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
              Submit Answer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnswerView;
