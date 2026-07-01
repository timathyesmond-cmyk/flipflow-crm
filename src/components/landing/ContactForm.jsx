import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Send, CheckCircle2, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const INITIAL = { name: '', email: '', message: '' };

export default function ContactForm() {
  const [form, setForm] = useState(INITIAL);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;

    setStatus('loading');
    setError('');

    try {
      await base44.entities.Suggestion.create({
        title: `Contact inquiry from ${form.name.trim()}`,
        description: form.message.trim(),
        category: 'other',
        status: 'pending',
        submitter_name: form.name.trim(),
        submitter_email: form.email.trim(),
      });
      setStatus('success');
      setForm(INITIAL);
    } catch {
      const subject = encodeURIComponent('FlipFlow CRM — Contact Inquiry');
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
      );
      window.location.href = `mailto:support@flipflowcrm.com?subject=${subject}&body=${body}`;
      setStatus('success');
      setForm(INITIAL);
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3 py-8 text-center"
      >
        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        <p className="font-semibold text-slate-900 dark:text-white">Message sent!</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">We'll get back to you within 1–2 business days.</p>
        <button
          onClick={() => setStatus('idle')}
          className="text-sm text-amber-500 hover:text-amber-400 font-medium mt-2"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="contact-name" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            required
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0a1628] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-shadow"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="contact-email" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0a1628] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-shadow"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={4}
          placeholder="How can we help?"
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0a1628] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-shadow resize-none"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
      >
        {status === 'loading' ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
        ) : (
          <><Send className="w-4 h-4" /> Send Message</>
        )}
      </button>
      <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500">
        <Mail className="w-3 h-3" />
        Or email us directly at support@flipflowcrm.com
      </p>
    </form>
  );
}