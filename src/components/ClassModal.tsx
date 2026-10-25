import React, { useState, useEffect } from 'react';
import { BakingClassInfo } from '../data/brownies';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { formatRupee } from '../utils/formatters';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  MessageCircle,
  Users,
} from 'lucide-react';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClassId?: string;
}

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  selectedClassId,
}) => {
  const { user, signInWithGoogle, registerForClass } = useAuth();
  const { bakingClasses, settings } = useContent();

  // IMPORTANT: availableClasses strictly mirrors the dashboard database.
  // When classes are deleted in the dashboard, this is empty ([]).
  const availableClasses: BakingClassInfo[] = bakingClasses || [];

  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (selectedClassId && availableClasses.some((c) => c.id === selectedClassId)) {
      return selectedClassId;
    }
    return availableClasses[0]?.id || '';
  });

  const [preferredDate, setPreferredDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [waitlistName, setWaitlistName] = useState<string>('');
  const [waitlistEmail, setWaitlistEmail] = useState<string>('');
  const [waitlistPhone, setWaitlistPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync selected class with available classes
  useEffect(() => {
    if (selectedClassId && availableClasses.some((c) => c.id === selectedClassId)) {
      setSelectedClass(selectedClassId);
    } else if (availableClasses[0]?.id && !availableClasses.some((c) => c.id === selectedClass)) {
      setSelectedClass(availableClasses[0].id);
    }
  }, [selectedClassId, availableClasses, selectedClass]);

  // Pre-fill user profile info
  useEffect(() => {
    if (user) {
      if (user.displayName && !waitlistName) setWaitlistName(user.displayName);
      if (user.email && !waitlistEmail) setWaitlistEmail(user.email);
    }
  }, [user]);

  if (!isOpen) return null;

  const currentClassData =
    availableClasses.find((c) => c.id === selectedClass) || availableClasses[0];

  const classDates: string[] =
    Array.isArray(currentClassData?.dates) && currentClassData.dates.length > 0
      ? currentClassData.dates
      : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      const signedInUser = await signInWithGoogle();
      if (!signedInUser) {
        setErrorMsg('Please sign in with Google to complete your booking.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await registerForClass(
        currentClassData?.title || 'Artisan Brownie Masterclass',
        preferredDate || classDates[0] || 'Upcoming Scheduled Batch',
        notes
      );
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to submit class booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const name = waitlistName.trim() || user?.displayName || 'Interested Student';
    const email = waitlistEmail.trim() || user?.email;

    if (!name || !email) {
      setErrorMsg('Please enter your name and email to join the priority waitlist.');
      return;
    }

    try {
      setIsSubmitting(true);
      await registerForClass(
        'Baking Masterclasses (Priority Waitlist)',
        'Upcoming Seasonal Batch (Priority Notification)',
        `[Waitlist Request] Student: ${name}, Email: ${email}${waitlistPhone ? `, Tel: ${waitlistPhone}` : ''}. Notes: ${notes || 'Eager to join the next live/studio workshop.'}`
      );
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to join waitlist. Please message our hotline or try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setErrorMsg(null);
    setPreferredDate('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[#F8F0E5] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#C47B55]/30 overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#3B211B] text-[#F8F0E5] p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E5A962] shrink-0" />
            <div>
              <h3 className="font-editorial text-lg sm:text-xl font-bold tracking-tight">Artisan Baking Classes</h3>
              <p className="text-xs text-[#E8D6C3]/80">Learn the secrets of fudge, crust & chocolate</p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-[#F8F0E5] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-serif text-2xl font-bold text-[#3B211B]">
                {availableClasses.length > 0 ? 'Booking Confirmed!' : 'Waitlist Registered!'}
              </h4>
              <p className="text-sm text-[#3B211B]/80 max-w-md mx-auto leading-relaxed">
                {availableClasses.length > 0
                  ? `Thank you for reserving your spot for ${currentClassData?.title || 'our Masterclass'}. A confirmation has been registered to your account and we look forward to baking with you!`
                  : 'Thank you for your interest! Elena will reach out with first access and dates as soon as our next seasonal masterclasses open.'}
              </p>
              <button
                onClick={resetForm}
                className="mt-4 px-6 py-2.5 rounded-full bg-[#C47B55] hover:bg-[#D98B5F] text-[#F8F0E5] font-semibold text-sm transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : availableClasses.length === 0 ? (
            /* EMPTY STATE: When NO classes exist in the dashboard catalogue */
            <div className="py-2 space-y-5">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#C47B55]/15 text-[#C47B55] mx-auto flex items-center justify-center shadow-inner">
                  <Calendar className="w-7 h-7" />
                </div>
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#E8D6C3] text-[#3B211B] text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    Schedule Update in Progress
                  </span>
                  <h4 className="font-editorial text-2xl font-bold text-[#3B211B]">
                    No Baking Classes Currently Scheduled
                  </h4>
                  <p className="text-xs text-[#3B211B]/75 max-w-md mx-auto mt-1 leading-relaxed">
                    Our masterclass schedules are currently between terms as our head baker Elena prepares new recipe curricula. Join the priority waitlist below to be notified first when fresh batch dates open!
                  </p>
                </div>
              </div>

              {/* Direct WhatsApp Callout for Private/Group Workshops */}
              <div className="p-3.5 bg-white rounded-2xl border border-[#25D366]/40 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#25D366]">
                      Private Workshop Inquiries
                    </p>
                    <p className="text-xs font-mono font-bold text-[#3B211B]">
                      +91 {settings.whatsappNumber || '7339651529'}
                    </p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/91${(settings.whatsappNumber || '7339651529').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Elena! I would like to inquire about upcoming baking classes or booking a private workshop session.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold shrink-0 transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </div>

              {/* Waitlist Form */}
              <form onSubmit={handleWaitlistSubmit} className="space-y-4 bg-white p-5 rounded-2xl border border-[#E8D6C3] shadow-xs">
                <div className="flex items-center gap-2 border-b border-[#E8D6C3]/60 pb-2">
                  <Users className="w-4 h-4 text-[#C47B55]" />
                  <span className="text-xs font-bold text-[#3B211B] uppercase tracking-wider">
                    Join Masterclass Priority Waitlist
                  </span>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#3B211B] block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      value={waitlistName}
                      onChange={(e) => setWaitlistName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full p-2.5 bg-[#F8F0E5]/50 border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B] focus:outline-none focus:ring-2 focus:ring-[#C47B55]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#3B211B] block mb-1">Your Email *</label>
                    <input
                      type="email"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      placeholder="e.g. priya@example.com"
                      className="w-full p-2.5 bg-[#F8F0E5]/50 border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B] focus:outline-none focus:ring-2 focus:ring-[#C47B55]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#3B211B] block mb-1">Contact Phone (for WhatsApp notice)</label>
                  <input
                    type="tel"
                    value={waitlistPhone}
                    onChange={(e) => setWaitlistPhone(e.target.value)}
                    placeholder="e.g. 9840123456"
                    className="w-full p-2.5 bg-[#F8F0E5]/50 border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B] focus:outline-none focus:ring-2 focus:ring-[#C47B55]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#3B211B] block mb-1">Timing or Technique Preferences (Optional)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Weekend mornings, beginner baking, crackly crust masterclass..."
                    className="w-full p-2.5 bg-[#F8F0E5]/50 border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B] focus:outline-none focus:ring-2 focus:ring-[#C47B55]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full bg-[#C47B55] hover:bg-[#D98B5F] text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Join Priority Waitlist'}
                </button>
              </form>
            </div>
          ) : (
            /* ACTIVE CLASSES: Displayed when classes exist in dashboard */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Class Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B211B]/80 mb-2">
                  Select Masterclass ({availableClasses.length} Available)
                </label>
                <div className="grid gap-2">
                  {availableClasses.map((c) => (
                    <label
                      key={c.id}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedClass === c.id
                          ? 'border-[#C47B55] bg-[#E8D6C3]/50 shadow-xs'
                          : 'border-[#E8D6C3] bg-white hover:border-[#C47B55]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="classSelection"
                          value={c.id}
                          checked={selectedClass === c.id}
                          onChange={() => setSelectedClass(c.id)}
                          className="accent-[#C47B55]"
                        />
                        <div>
                          <p className="text-sm font-bold text-[#3B211B]">{c.title}</p>
                          <div className="flex items-center gap-3 text-[11px] text-[#3B211B]/70 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#C47B55]" /> {c.duration}
                            </span>
                            <span>•</span>
                            <span>{c.level}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#C47B55]">{formatRupee(c.price)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              {classDates.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B211B]/80 mb-1.5">
                    Available Batch Session
                  </label>
                  <div className="relative">
                    <select
                      value={preferredDate || classDates[0]}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full p-3 bg-white border border-[#E8D6C3] rounded-xl text-sm text-[#3B211B] focus:outline-none focus:ring-2 focus:ring-[#C47B55]"
                      required
                    >
                      {classDates.map((dateStr, idx) => (
                        <option key={idx} value={dateStr}>
                          {dateStr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Special Requests or Dietary Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B211B]/80 mb-1.5">
                  Special Notes or Dietary Requirements (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Nut allergies, beginner baking experience, booking for two..."
                  className="w-full p-3 bg-white border border-[#E8D6C3] rounded-xl text-sm text-[#3B211B] placeholder-[#3B211B]/40 focus:outline-none focus:ring-2 focus:ring-[#C47B55]"
                  maxLength={500}
                />
              </div>

              {/* User Google Sign-In Status */}
              <div className="p-3 bg-[#E8D6C3]/40 rounded-xl flex items-center justify-between text-xs">
                {user ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-[#3B211B]">
                      Booking as <strong>{user.displayName || user.email}</strong>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[#3B211B]/80">
                      Sign in with Google to save booking to Firestore:
                    </span>
                    <button
                      type="button"
                      onClick={signInWithGoogle}
                      className="px-3 py-1 bg-[#3B211B] text-[#F8F0E5] rounded-lg font-semibold hover:bg-[#23120E] transition-colors"
                    >
                      Google Sign-In
                    </button>
                  </div>
                )}
              </div>

              {/* Phone Hotline Note */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E8D6C3] text-xs">
                <span className="flex items-center gap-2 text-[#3B211B]/80">
                  <Phone className="w-3.5 h-3.5 text-[#C47B55]" />
                  Prefer to register by phone?
                </span>
                <a
                  href={`tel:${settings.phoneRaw}`}
                  className="font-bold text-[#C47B55] hover:underline"
                >
                  {settings.phone}
                </a>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-[#C47B55] hover:bg-[#D98B5F] text-[#F8F0E5] font-semibold text-sm tracking-wide shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Registering...' : 'Confirm Class Registration'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
