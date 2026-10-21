import React, { useState } from 'react';
import { SIGNATURE_BROWNIES, BrownieItem } from '../data/brownies';
import { ChevronLeft, ChevronRight, Heart, Sparkles, Eye, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';

interface BrownieGalleryProps {
  onSelectBrownie: (brownie: BrownieItem) => void;
  onViewAllCreations: () => void;
}

export const BrownieGallery: React.FC<BrownieGalleryProps> = ({
  onSelectBrownie,
  onViewAllCreations,
}) => {
  const { menuItems } = useContent();
  const brownies = menuItems.length > 0 ? menuItems : SIGNATURE_BROWNIES;
  const [activeIndex, setActiveIndex] = useState(0);
  const [depthState, setDepthState] = useState<'idle' | 'going-back' | 'coming-forward'>('idle');
  const { userProfile, toggleFavorite, user, signInWithGoogle } = useAuth();

  const totalBrownies = brownies.length;
  const safeIndex = activeIndex >= totalBrownies ? 0 : activeIndex;
  const currentBrownie = brownies[safeIndex] || brownies[0];

  // Right Button: Sends current image back in depth and moves to next image
  const handleGoBack = () => {
    setDepthState('going-back');
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % totalBrownies);
      setDepthState('idle');
    }, 280);
  };

  // Left Button: Brings previous image forward to front
  const handleComeForward = () => {
    setDepthState('coming-forward');
    setTimeout(() => {
      setActiveIndex((prev) => (prev - 1 + totalBrownies) % totalBrownies);
      setDepthState('idle');
    }, 280);
  };

  const handleFavoriteClick = async (e: React.MouseEvent, brownieId: string) => {
    e.stopPropagation();
    if (!user) {
      const signedInUser = await signInWithGoogle();
      if (!signedInUser) return;
    }
    await toggleFavorite(brownieId);
  };

  const isCurrentFav = userProfile?.favorites?.includes(currentBrownie.id);

  return (
    <section className="w-full py-16 sm:py-20 bg-[#F8F0E5] border-b border-[#E8D6C3]" id="brownie-gallery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Title & Full Menu Link */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8D6C3] text-[#3B211B] text-xs font-semibold tracking-wider uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C47B55]" />
              Artisan Batch Selection
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3B211B] tracking-tight">
              Our Five Signature Brownies
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#3B211B]/75 max-w-xl">
              Each recipe is slow-baked with cultured butter, pure cocoa butter chocolate, and delicate flavor infusions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onViewAllCreations}
              className="text-xs sm:text-sm font-semibold text-[#C47B55] hover:text-[#9F5835] underline underline-offset-4 cursor-pointer"
            >
              View Full Menu & Allergen Guide
            </button>
          </div>
        </div>

        {/* 3D DEPTH IMAGE SECTION */}
        <div className="bg-[#23120E] rounded-3xl p-6 sm:p-10 shadow-2xl border border-[#3B211B] relative overflow-hidden mb-12">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C47B55]/15 rounded-full blur-3xl pointer-events-none" />

          {/* 3D Depth Viewport & Spotlight Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* 3D Image Depth Stage with Left and Right flanking buttons */}
            <div className="lg:col-span-7 flex justify-center items-center py-4 sm:py-6 relative">
              {/* Left Button near image (brings image forward) */}
              <button
                onClick={handleComeForward}
                className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#1A0B08]/85 hover:bg-[#C47B55] text-[#E8D6C3] hover:text-[#F8F0E5] border border-[#C47B55]/50 flex items-center justify-center shadow-xl backdrop-blur-md transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#C47B55]"
                aria-label="Bring image forward"
                title="Bring image forward"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* 3D Card Stack Container */}
              <div
                className="relative w-full max-w-[420px] sm:max-w-[460px] h-[320px] sm:h-[380px] perspective-[1200px] mx-8 sm:mx-12"
                style={{ perspective: '1200px' }}
              >
                {brownies.map((brownie, idx) => {
                  // Calculate relative offset from active index
                  const diff = (idx - activeIndex + totalBrownies) % totalBrownies;
                  const isFront = diff === 0;

                  // Compute 3D translation & scale based on depth stack position
                  let transformStyle = '';
                  let zIndex = 10;
                  let opacity = 0;
                  let pointerEvents: 'auto' | 'none' = 'none';

                  if (isFront) {
                    zIndex = 30;
                    opacity = 1;
                    pointerEvents = 'auto';
                    if (depthState === 'going-back') {
                      transformStyle = 'translateZ(-140px) translateY(20px) scale(0.85) rotateX(4deg)';
                    } else if (depthState === 'coming-forward') {
                      transformStyle = 'translateZ(40px) translateY(-10px) scale(1.05)';
                    } else {
                      transformStyle = 'translateZ(0px) translateY(0px) scale(1) rotate(0deg)';
                    }
                  } else if (diff === 1) {
                    zIndex = 20;
                    opacity = 0.85;
                    transformStyle = 'translateX(35px) translateY(12px) translateZ(-60px) scale(0.92) rotateY(-5deg)';
                  } else if (diff === 2) {
                    zIndex = 10;
                    opacity = 0.55;
                    transformStyle = 'translateX(65px) translateY(24px) translateZ(-120px) scale(0.85) rotateY(-10deg)';
                  } else if (diff === totalBrownies - 1) {
                    // Previous card positioned slightly to the left behind
                    zIndex = 15;
                    opacity = 0.65;
                    transformStyle = 'translateX(-35px) translateY(12px) translateZ(-60px) scale(0.92) rotateY(5deg)';
                  } else {
                    zIndex = 5;
                    opacity = 0.25;
                    transformStyle = 'translateZ(-200px) scale(0.75)';
                  }

                  return (
                    <div
                      key={brownie.id}
                      onClick={() => {
                        setActiveIndex(idx);
                        onSelectBrownie(brownie);
                      }}
                      className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-[#C47B55]/50 transition-all duration-500 ease-out cursor-pointer group"
                      style={{
                        transform: transformStyle,
                        zIndex,
                        opacity,
                        pointerEvents,
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <img
                        src={brownie.image}
                        alt={brownie.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A0B08]/90 via-transparent to-black/30" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        {brownie.badge ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C47B55] text-white shadow-md">
                            {brownie.badge}
                          </span>
                        ) : <span />}

                        <button
                          onClick={(e) => handleFavoriteClick(e, brownie.id)}
                          className="w-9 h-9 rounded-full bg-[#1A0B08]/75 hover:bg-[#3B211B] text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90"
                          aria-label="Toggle favorite"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              userProfile?.favorites?.includes(brownie.id)
                                ? 'text-red-500 fill-red-500'
                                : 'text-white'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Bottom Image Overlay Label */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="text-[10px] uppercase tracking-wider text-[#E5A962] font-semibold block">
                          {brownie.cocoaPercentage}
                        </span>
                        <h4 className="font-serif text-xl sm:text-2xl font-bold text-white drop-shadow-md">
                          {brownie.name}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Button near image (sends image back) */}
              <button
                onClick={handleGoBack}
                className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#1A0B08]/85 hover:bg-[#C47B55] text-[#E8D6C3] hover:text-[#F8F0E5] border border-[#C47B55]/50 flex items-center justify-center shadow-xl backdrop-blur-md transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#C47B55]"
                aria-label="Send image back"
                title="Send image back"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Active Brownie Description & Tasting Notes (5 cols) */}
            <div className="lg:col-span-5 text-[#E8D6C3] space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B211B] border border-[#C47B55]/30 text-xs text-[#E5A962]">
                <Award className="w-3.5 h-3.5 text-[#E5A962]" />
                <span>Square {activeIndex + 1} of {totalBrownies}</span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-[#C47B55] font-semibold block">
                  {currentBrownie.subtitle}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F0E5] mt-1">
                  {currentBrownie.name}
                </h3>
                <p className="text-sm text-[#E8D6C3]/80 leading-relaxed mt-2.5">
                  {currentBrownie.description}
                </p>
              </div>

              {/* Flavor Profile Pills */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#C47B55] block mb-2">
                  Artisan Flavor Notes
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentBrownie.flavorNotes.map((note, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-[#3B211B] border border-[#C47B55]/40 text-xs font-medium text-[#F8F0E5]"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-[#E8D6C3]/60 block">Price</span>
                  <span className="text-xl font-bold text-[#F8F0E5]">{currentBrownie.price}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onSelectBrownie(currentBrownie)}
                    className="px-5 py-2.5 rounded-full bg-[#C47B55] hover:bg-[#D98B5F] text-[#F8F0E5] text-xs font-semibold tracking-wide transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Recipe Details</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail Strip to Jump Forward/Back */}
          <div className="mt-8 pt-6 border-t border-[#3B211B]/80 flex items-center justify-center gap-3 flex-wrap">
            {brownies.map((b, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={b.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#C47B55] text-white font-bold ring-2 ring-[#E5A962]'
                      : 'bg-[#3B211B] text-[#E8D6C3]/80 hover:bg-[#3B211B]/80 hover:text-white'
                  }`}
                >
                  <img src={b.image} alt={b.name} className="w-5 h-5 rounded-full object-cover" />
                  <span>{b.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
