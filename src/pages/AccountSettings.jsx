import { useState } from 'react';
import { CheckCircle, HelpCircle, Save } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SEO from '../components/SEO';

// Keep these values in sync with the backend security-question enum.
const SECURITY_QUESTIONS = [
  'What is the name of your first pet?',
  'What is the name of your primary school?',
  'What was your favorite childhood nickname?',
  'In which city were you born?',
  'What is the make of your first car?',
];

const emptyQuestions = Array.from({ length: 3 }, () => ({ question: '', answer: '' }));

export default function AccountSettings() {
  const toast = useToast();
  const { user } = useAuth();
  const [questions, setQuestions] = useState(emptyQuestions);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function updateQuestion(index, field, value) {
    setQuestions(current => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    if (questions.some(item => !item.question || !item.answer.trim())) {
      setError('Choose a question and enter an answer for all three questions.');
      return;
    }
    if (new Set(questions.map(item => item.question)).size !== 3) {
      setError('Please choose three different questions.');
      return;
    }

    setLoading(true);
    try {
      await authApi.saveSecurityQuestions(questions.map(item => ({
        question: item.question,
        answer: item.answer.trim(),
      })));
      const emailKey = user?.email ? `eco_security_questions_set:${user.email.trim().toLowerCase()}` : 'eco_security_questions_set';
      localStorage.setItem(emailKey, 'true');
      if (user?.email) {
        sessionStorage.removeItem(`eco_security_questions_reminder:${user.email.trim().toLowerCase()}`);
      }
      setMessage('Your security questions have been saved.');
      toast.success('Security questions saved.');
    } catch (requestError) {
      const errorMessage = requestError.message || 'Could not save your security questions.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <SEO path="/dashboard/settings" title="Account Settings" noindex />
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-leaf-600 mb-2">Account</p>
        <h1 className="font-display text-3xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-slate-500 mt-1">Set recovery questions for your EcoTrack account.</p>
      </div>

      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-7 max-w-3xl">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-leaf-50 text-leaf-700 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Security questions</h2>
            <p className="text-sm text-slate-500 mt-1">Choose three questions and answers you will remember. Answers are hidden while you type.</p>
          </div>
        </div>

        {message && <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-5 text-sm"><CheckCircle className="w-4 h-4 shrink-0" />{message}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {questions.map((item, index) => (
            <div key={index} className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Question {index + 1}</label>
              <select required value={item.question} onChange={event => updateQuestion(index, 'question', event.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500">
                <option value="">Select a question</option>
                {SECURITY_QUESTIONS.map(question => <option key={question} value={question} disabled={questions.some((other, otherIndex) => otherIndex !== index && other.question === question)}>{question}</option>)}
              </select>
              <input type="password" required value={item.answer} onChange={event => updateQuestion(index, 'answer', event.target.value)} placeholder="Your answer" autoComplete="off" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500" />
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full sm:w-auto bg-leaf-600 hover:bg-leaf-700 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />{loading ? 'Saving...' : 'Save security questions'}
          </button>
        </form>
      </section>
    </div>
  );
}
