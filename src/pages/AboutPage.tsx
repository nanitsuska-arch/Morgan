import React, { useState } from 'react';
import {
  Shield,
  FileText,
  Star,
  MessageSquare,
  Info,
  ChevronRight,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Send,
} from 'lucide-react';

type SubView = 'privacy' | 'terms' | 'rating' | 'feedback' | 'disclaimer' | null;

export const AboutPage: React.FC = () => {
  const [activeView, setActiveView] = useState<SubView>(null);

  // Rating State
  const [userRating, setUserRating] = useState<number>(5);
  const [ratingHover, setRatingHover] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Feedback State
  const [feedbackCategory, setFeedbackCategory] = useState<'suggestion' | 'bug' | 'feature' | 'other'>('suggestion');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);

    if (!feedbackMessage.trim()) {
      setFeedbackError('Please enter your feedback message.');
      return;
    }

    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackMessage('');
      setFeedbackEmail('');
    }, 1000);
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRatingSubmitted(true);
  };

  // Sub-view: Privacy Policy
  if (activeView === 'privacy') {
    return (
      <div className="max-w-md mx-auto px-4 py-6 pb-28 animate-in fade-in duration-200">
        <button
          onClick={() => setActiveView(null)}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to About</span>
        </button>

        <div className="bg-[#12121c] border border-[#202032] rounded-2xl p-6 shadow-xl space-y-5 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <div className="flex items-center gap-3 pb-4 border-b border-[#1e1e2e]">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Privacy Policy</h2>
              <p className="text-xs text-slate-400">Last updated: November 2026</p>
            </div>
          </div>

          <p>
            At SnapTok, your privacy is our highest priority. We believe in providing a safe, clean media utility without tracking your activity.
          </p>

          <h3 className="text-white font-semibold pt-1">1. Zero Log Retention</h3>
          <p>
            We do not log the TikTok URLs you submit, the videos you stream or download, or your personal IP addresses. Processing happens transiently in memory to resolve clean CDN media streams.
          </p>

          <h3 className="text-white font-semibold pt-1">2. Local Storage Usage</h3>
          <p>
            Your download history and theme preferences are stored exclusively on your device using your browser's local storage. This data never touches our database and can be cleared anytime in Settings.
          </p>

          <h3 className="text-white font-semibold pt-1">3. Third-Party CDNs</h3>
          <p>
            When downloading a file, media streams are proxied securely from public content delivery networks directly to your browser without retention.
          </p>
        </div>
      </div>
    );
  }

  // Sub-view: Terms of Service
  if (activeView === 'terms') {
    return (
      <div className="max-w-md mx-auto px-4 py-6 pb-28 animate-in fade-in duration-200">
        <button
          onClick={() => setActiveView(null)}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to About</span>
        </button>

        <div className="bg-[#12121c] border border-[#202032] rounded-2xl p-6 shadow-xl space-y-5 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <div className="flex items-center gap-3 pb-4 border-b border-[#1e1e2e]">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Terms of Service</h2>
              <p className="text-xs text-slate-400">Terms of use and service conditions</p>
            </div>
          </div>

          <h3 className="text-white font-semibold">1. Acceptance of Terms</h3>
          <p>
            By accessing or using SnapTok, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use this service.
          </p>

          <h3 className="text-white font-semibold">2. Personal Use Only</h3>
          <p>
            SnapTok is designed strictly for personal, non-commercial, and fair-use educational archiving. You may not use this tool for mass unauthorized redistribution, copyright infringement, or commercial exploitation.
          </p>

          <h3 className="text-white font-semibold">3. Creator Rights</h3>
          <p>
            All rights, titles, and intellectual property in and to the content belong to their respective creators and ByteDance Ltd. Users remain solely liable for ensuring their downloads respect creator copyrights.
          </p>

          <h3 className="text-white font-semibold">4. Service Availability</h3>
          <p>
            SnapTok is provided "as is" and "as available". We do not guarantee uninterrupted availability or permanent accessibility to third-party endpoints.
          </p>
        </div>
      </div>
    );
  }

  // Sub-view: Disclaimer
  if (activeView === 'disclaimer') {
    return (
      <div className="max-w-md mx-auto px-4 py-6 pb-28 animate-in fade-in duration-200">
        <button
          onClick={() => setActiveView(null)}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to About</span>
        </button>

        <div className="bg-[#12121c] border border-[#202032] rounded-2xl p-6 shadow-xl space-y-5 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <div className="flex items-center gap-3 pb-4 border-b border-[#1e1e2e]">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Legal Disclaimer</h2>
              <p className="text-xs text-slate-400">For personal use only</p>
            </div>
          </div>

          <h3 className="text-white font-semibold">Non-Affiliation Notice</h3>
          <p>
            SnapTok is an independent media utility and is NOT affiliated, associated, authorized, endorsed by, or in any way officially connected with TikTok, ByteDance Ltd., or any of their subsidiaries or affiliates.
          </p>

          <h3 className="text-white font-semibold">Trademarks & Copyrights</h3>
          <p>
            The names "TikTok" and "Douyin", as well as related names, marks, emblems, and images are registered trademarks of their respective owners. SnapTok does not host or store any videos or audio tracks on its servers.
          </p>

          <h3 className="text-white font-semibold">User Responsibility</h3>
          <p>
            Users are solely responsible for ensuring that their downloads and subsequent use of any media comply with applicable copyright laws, licensing terms, and TikTok's terms of service.
          </p>
        </div>
      </div>
    );
  }

  // Sub-view: Rate the App
  if (activeView === 'rating') {
    return (
      <div className="max-w-md mx-auto px-4 py-6 pb-28 animate-in fade-in duration-200">
        <button
          onClick={() => {
            setActiveView(null);
            setRatingSubmitted(false);
          }}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to About</span>
        </button>

        <div className="bg-[#12121c] border border-[#202032] rounded-2xl p-6 shadow-xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 mx-auto mb-4">
            <Star className="w-6 h-6 fill-blue-500" />
          </div>

          <h2 className="text-lg font-bold text-white">Rate SnapTok</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Your review helps us keep SnapTok free, fast, and watermark-free!
          </p>

          {ratingSubmitted ? (
            <div className="py-8 space-y-3 animate-in fade-in">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-semibold text-white">Thank you for your rating!</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                We appreciate your feedback and support in making SnapTok even better.
              </p>
              <button
                type="button"
                onClick={() => setActiveView(null)}
                className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleRatingSubmit} className="space-y-5 text-left">
              {/* Star Selector */}
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setRatingHover(star)}
                    onMouseLeave={() => setRatingHover(0)}
                    onClick={() => setUserRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-115 focus:outline-none"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (ratingHover || userRating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="text-center text-xs font-semibold text-amber-400">
                {userRating === 5 && 'Outstanding! ★★★★★'}
                {userRating === 4 && 'Great experience! ★★★★☆'}
                {userRating === 3 && 'Good ★★★☆☆'}
                {userRating <= 2 && 'Needs improvement ★★☆☆☆'}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Optional Comments
                </label>
                <textarea
                  rows={3}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="What do you enjoy most about SnapTok?"
                  className="w-full bg-[#181826] border border-[#232338] rounded-xl p-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer text-center"
              >
                Submit Rating
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Sub-view: Send Feedback Form
  if (activeView === 'feedback') {
    return (
      <div className="max-w-md mx-auto px-4 py-6 pb-28 animate-in fade-in duration-200">
        <button
          onClick={() => {
            setActiveView(null);
            setFeedbackSubmitted(false);
          }}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to About</span>
        </button>

        <div className="bg-[#12121c] border border-[#202032] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 mb-5 border-b border-[#1e1e2e]">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Send Feedback</h2>
              <p className="text-xs text-slate-400">Help us improve SnapTok</p>
            </div>
          </div>

          {feedbackSubmitted ? (
            <div className="py-8 text-center space-y-3 animate-in fade-in">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-semibold text-white">Feedback Received!</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Thank you for helping us improve. Our team will review your message.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFeedbackSubmitted(false);
                  setActiveView(null);
                }}
                className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs sm:text-sm">
              {/* Category pills */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Topic
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'suggestion', label: 'Suggestion' },
                    { id: 'bug', label: 'Bug Report' },
                    { id: 'feature', label: 'Feature Request' },
                    { id: 'other', label: 'General' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFeedbackCategory(cat.id as any)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                        feedbackCategory === cat.id
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-[#181826] text-slate-300 border-[#232338] hover:bg-[#202034]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message text */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Your Message <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={feedbackMessage}
                  onChange={(e) => {
                    setFeedbackMessage(e.target.value);
                    if (feedbackError) setFeedbackError(null);
                  }}
                  placeholder="Tell us what you'd like to improve or report an issue..."
                  className="w-full bg-[#181826] border border-[#232338] rounded-xl p-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Optional Email */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Your Email (Optional, for replies)
                </label>
                <input
                  type="email"
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#181826] border border-[#232338] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {feedbackError && (
                <p className="text-xs text-rose-400">{feedbackError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Feedback</span>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Main About Screen matching reference screenshot
  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-28 animate-in fade-in duration-200">
      {/* 1. ABOUT Section */}
      <div className="mb-7">
        <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2.5 px-1">
          ABOUT
        </h2>

        <div className="bg-[#12121c] border border-[#202032] rounded-2xl overflow-hidden shadow-xl divide-y divide-[#1e1e2e]">
          {/* Privacy Policy */}
          <button
            type="button"
            onClick={() => setActiveView('privacy')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[#161626] active:bg-[#1a192e] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-105 transition-transform">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-white">
                Privacy Policy
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
          </button>

          {/* Terms of Service */}
          <button
            type="button"
            onClick={() => setActiveView('terms')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[#161626] active:bg-[#1a192e] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-white">
                Terms of Service
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
          </button>

          {/* Rate the App */}
          <button
            type="button"
            onClick={() => setActiveView('rating')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[#161626] active:bg-[#1a192e] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-105 transition-transform">
                <Star className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-white">
                Rate the App
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
          </button>

          {/* Send Feedback */}
          <button
            type="button"
            onClick={() => setActiveView('feedback')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[#161626] active:bg-[#1a192e] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-medium text-white block">
                  Send Feedback
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Help us improve
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
          </button>
        </div>
      </div>

      {/* 2. LEGAL Section */}
      <div className="mb-7">
        <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2.5 px-1">
          LEGAL
        </h2>

        <div className="bg-[#12121c] border border-[#202032] rounded-2xl overflow-hidden shadow-xl">
          {/* Disclaimer */}
          <button
            type="button"
            onClick={() => setActiveView('disclaimer')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[#161626] active:bg-[#1a192e] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-105 transition-transform">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-medium text-white block">
                  Disclaimer
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  For personal use only
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
          </button>
        </div>
      </div>

      {/* 3. Warning Banner */}
      <div className="bg-[#1c140b] border border-amber-900/40 rounded-2xl p-4 sm:p-4.5 flex items-start gap-3.5 shadow-lg">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-[13px] text-amber-200/90 leading-relaxed font-normal">
          SnapTok is intended for personal use only. Always respect copyright and TikTok's terms of service when downloading content.
        </p>
      </div>
    </div>
  );
};
