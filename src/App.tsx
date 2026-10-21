import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import { Navbar } from './components/Navbar';
import { HeroCarousel } from './components/HeroCarousel';
import { BrownieGallery } from './components/BrownieGallery';
import { AboutSection } from './components/AboutSection';
import { AchievementSection } from './components/AchievementSection';
import { ClassModal } from './components/ClassModal';
import { ContactModal } from './components/ContactModal';
import { CreationsDrawer } from './components/CreationsDrawer';
import { MyActivityModal } from './components/MyActivityModal';
import { AdminApp } from './admin/AdminApp';
import { Footer } from './components/Footer';
import { BrownieItem, SIGNATURE_BROWNIES } from './data/brownies';

function MainBakeryWebsite() {
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [creationsDrawerOpen, setCreationsDrawerOpen] = useState(false);
  const [selectedBrownie, setSelectedBrownie] = useState<BrownieItem | null>(null);
  const [myActivityOpen, setMyActivityOpen] = useState(false);

  // Handlers for Hero Carousel CTAs
  const handleExploreCreations = () => {
    setSelectedBrownie(SIGNATURE_BROWNIES[0]);
    setCreationsDrawerOpen(true);
  };

  const handleJoinClass = () => {
    setSelectedClassId('brownie-mastery');
    setClassModalOpen(true);
  };

  const handleGetInTouch = () => {
    setContactModalOpen(true);
  };

  const handleRegisterInterest = () => {
    setSelectedClassId('artisan-caramels-swirls');
    setClassModalOpen(true);
  };

  // Handler for gallery brownie click
  const handleSelectBrownie = (brownie: BrownieItem) => {
    setSelectedBrownie(brownie);
    setCreationsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F0E5] text-[#3B211B] flex flex-col relative">
      {/* 1. Header & Navigation Bar (Pristine Customer Storefront) */}
      <Navbar
        onOpenCreations={handleExploreCreations}
        onOpenClasses={handleJoinClass}
        onOpenContact={handleGetInTouch}
        onOpenMyActivity={() => setMyActivityOpen(true)}
      />

      <main className="flex-1">
        {/* 2. HERO SECTION — FULL-WIDTH HERO BANNER CAROUSEL */}
        <HeroCarousel
          onExploreCreations={handleExploreCreations}
          onJoinClass={handleJoinClass}
          onGetInTouch={handleGetInTouch}
          onRegisterInterest={handleRegisterInterest}
        />

        {/* 3. SEPARATE FIVE-IMAGE BROWNIE GALLERY COMPONENT WITH 3D DEPTH CONTROLS */}
        <BrownieGallery
          onSelectBrownie={handleSelectBrownie}
          onViewAllCreations={handleExploreCreations}
        />

        {/* 4. ACHIEVEMENTS & MILESTONES SECTION */}
        <AchievementSection
          onOpenContact={handleGetInTouch}
          onOpenClasses={handleJoinClass}
        />

        {/* 5. THE BAKER BEHIND THE BRAND & BAKING STUDIO */}
        <AboutSection
          onJoinClass={handleJoinClass}
          onExploreCreations={handleExploreCreations}
        />
      </main>

      {/* 6. Footer (Pristine Customer Storefront) */}
      <Footer
        onOpenCreations={handleExploreCreations}
        onOpenClasses={handleJoinClass}
        onOpenContact={handleGetInTouch}
      />

      {/* Interactive Modals & Drawers */}
      <ClassModal
        isOpen={classModalOpen}
        onClose={() => setClassModalOpen(false)}
        selectedClassId={selectedClassId}
      />

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />

      <CreationsDrawer
        isOpen={creationsDrawerOpen}
        onClose={() => setCreationsDrawerOpen(false)}
        selectedBrownie={selectedBrownie}
        onSelectBrownie={(b) => setSelectedBrownie(b)}
        onOrderNow={() => setContactModalOpen(true)}
      />

      <MyActivityModal
        isOpen={myActivityOpen}
        onClose={() => setMyActivityOpen(false)}
        onExploreCreations={handleExploreCreations}
        onBookClass={handleJoinClass}
      />
    </div>
  );
}

function RootApp() {
  const checkIsAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();

    return (
      path === '/admin' ||
      path.startsWith('/admin') ||
      hash === '#admin' ||
      hash.startsWith('#admin') ||
      hash.startsWith('#/admin') ||
      search.includes('admin=true') ||
      search.includes('view=admin')
    );
  };

  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(checkIsAdminRoute);

  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdminRoute(checkIsAdminRoute());
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);

    // Keyboard shortcut for bakery owners to easily access /#admin (Ctrl+Shift+A or Cmd+Shift+A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        window.location.hash = '#admin';
        setIsAdminRoute(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navigateToWebsite = () => {
    window.location.hash = '';
    if (window.location.pathname.startsWith('/admin')) {
      window.history.pushState(null, '', '/');
    }
    setIsAdminRoute(false);
  };

  if (isAdminRoute) {
    return <AdminApp onBackToWebsite={navigateToWebsite} />;
  }

  return <MainBakeryWebsite />;
}

export default function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <RootApp />
      </ContentProvider>
    </AuthProvider>
  );
}
