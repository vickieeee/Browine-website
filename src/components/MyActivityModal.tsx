import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SIGNATURE_BROWNIES } from '../data/brownies';
import { X, Calendar, MessageSquare, Heart, Clock, User, CheckCircle2 } from 'lucide-react';

interface MyActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreCreations: () => void;
  onBookClass: () => void;
}

export const MyActivityModal: React.FC<MyActivityModalProps> = ({
  isOpen,
  onClose,
  onExploreCreations,
  onBookClass,
}) => {
  const { user, userProfile, userRegistrations, userInquiries } = useAuth();

  if (!isOpen) return null;

  const favBrownies = SIGNATURE_BROWNIES.filter((b) =>
    userProfile?.favorites?.includes(b.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#F8F0E5] rounded-3xl shadow-2xl border border-[#C47B55]/30 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#3B211B] text-[#F8F0E5] p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C47B55] flex items-center justify-center text-white font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold">My Bakery Activity</h3>
              <p className="text-xs text-[#E8D6C3]/80">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#F8F0E5] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Class Bookings */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-serif text-lg font-bold text-[#3B211B] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C47B55]" />
                Registered Masterclasses ({userRegistrations.length})
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onBookClass();
                }}
                className="text-xs font-semibold text-[#C47B55] hover:underline cursor-pointer"
              >
                + Book Another Class
              </button>
            </div>

            {userRegistrations.length === 0 ? (
              <div className="p-5 rounded-2xl bg-white border border-[#E8D6C3] text-center text-xs text-[#3B211B]/60">
                You haven't booked any baking classes yet. Discover the art of brownie making!
              </div>
            ) : (
              <div className="space-y-2">
                {userRegistrations.map((reg, idx) => (
                  <div
                    key={reg.id || idx}
                    className="p-4 rounded-xl bg-white border border-[#E8D6C3] flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#3B211B]">{reg.className}</p>
                      <div className="flex items-center gap-2 text-xs text-[#3B211B]/70 mt-1">
                        <Clock className="w-3.5 h-3.5 text-[#C47B55]" />
                        <span>{reg.preferredDate}</span>
                      </div>
                      {reg.notes && (
                        <p className="text-[11px] text-[#3B211B]/50 mt-1 italic">
                          Notes: {reg.notes}
                        </p>
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {reg.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Favorited Brownies */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-serif text-lg font-bold text-[#3B211B] flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                Saved Brownie Favorites ({favBrownies.length})
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onExploreCreations();
                }}
                className="text-xs font-semibold text-[#C47B55] hover:underline cursor-pointer"
              >
                Browse Menu
              </button>
            </div>

            {favBrownies.length === 0 ? (
              <div className="p-5 rounded-2xl bg-white border border-[#E8D6C3] text-center text-xs text-[#3B211B]/60">
                No favorites saved yet. Click the heart icon on any brownie to save it!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {favBrownies.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 bg-white rounded-xl border border-[#E8D6C3] flex items-center gap-3"
                  >
                    <img
                      src={b.image}
                      alt={b.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#3B211B]">{b.name}</p>
                      <p className="text-[11px] text-[#C47B55]">{b.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inquiries */}
          {userInquiries.length > 0 && (
            <div>
              <h4 className="font-serif text-lg font-bold text-[#3B211B] mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#C47B55]" />
                Recent Inquiries ({userInquiries.length})
              </h4>
              <div className="space-y-2">
                {userInquiries.map((inq, idx) => (
                  <div
                    key={inq.id || idx}
                    className="p-4 rounded-xl bg-white border border-[#E8D6C3]"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#3B211B]">{inq.subject}</p>
                      <span className="text-[10px] uppercase font-semibold bg-[#E8D6C3] px-2 py-0.5 rounded text-[#3B211B]">
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#3B211B]/70 mt-1 line-clamp-2">
                      {inq.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
