import React, { useState } from 'react';
import { BakingClassInfo } from '../data/brownies';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { X, Calendar, Clock, CheckCircle2, AlertCircle, Sparkles, Phone } from 'lucide-react';

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
  const availableClasses = bakingClasses.length > 0 ? bakingClasses : [];
  const [selectedClass, setSelectedClass] = useState<string>(
    selectedClassId || (availableClasses[0]?.id || 'brownie-mastery')
  );
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentClassData =
    availableClasses.find((c) => c.id === selectedClass) || availableClasses[0];

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
        currentClassData.title,
        preferredDate || currentClassData.dates[0],
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

  const resetForm = () => {
    setSubmitted(false);
    setErrorMsg(null);
    setPreferredDate('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[#F8F0E5] rounded-3xl shadow-2xl border border-[#C47B55]/30 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#3B211B] text-[#F8F0E5] p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E5A962]" />
            <div>
              <h3 className="font-serif text-xl font-bold">Artisan Baking Classes</h3>
              <p className="text-xs text-[#E8D6C3]/80">Learn the secrets of fudge, crust & chocolate</p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#F8F0E5] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-serif text-2xl font-bold text-[#3B211B]">
                Booking Confirmed!
              </h4>
              <p className="text-sm text-[#3B211B]/80 max-w-md mx-auto">
                Thank you for reserving your spot for <strong>{currentClassData.title}</strong>. A confirmation has been registered to your account and we look forward to baking with you!
              </p>
              <button
                onClick={resetForm}
                className="mt-4 px-6 py-2.5 rounded-full bg-[#C47B55] hover:bg-[#D98B5F] text-[#F8F0E5] font-semibold text-sm transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
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
                  Select Masterclass
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
                      <span className="text-xs font-bold text-[#C47B55]">{c.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3B211B]/80 mb-1.5">
                  Available Batch Session
                </label>
                <div className="relative">
                  <select
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full p-3 bg-white border border-[#E8D6C3] rounded-xl text-sm text-[#3B211B] focus:outline-none focus:ring-2 focus:ring-[#C47B55]"
                    required
                  >
                    <option value="">Select a date...</option>
                    {currentClassData.dates.map((dateStr, idx) => (
                      <option key={idx} value={dateStr}>
                        {dateStr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
