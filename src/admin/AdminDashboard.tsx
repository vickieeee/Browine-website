import React, { useState, useEffect } from 'react';
import {
  useContent,
  SiteSettings,
  AchievementSettings,
  DEFAULT_SETTINGS,
} from '../context/ContentContext';
import { BrownieItem, BakingClassInfo } from '../data/brownies';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import {
  Settings,
  Image as ImageIcon,
  UtensilsCrossed,
  Calendar,
  Trophy,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  RefreshCw,
  Users,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface AdminDashboardProps {
  adminEmail: string;
  onLogout: () => void;
  onViewWebsite: () => void;
}

const IMAGE_PRESETS = {
  hero1: [
    {
      label: 'Warm Kitchen Artisan Baker',
      url: 'https://images.unsplash.com/photo-1556911073-38141963c9e0?q=85&w=2400&auto=format&fit=crop',
    },
    {
      label: 'Pastry Chef Pouring Chocolate',
      url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=85&w=2400&auto=format&fit=crop',
    },
    {
      label: 'Baker Whisking Brownie Batter',
      url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=85&w=2400&auto=format&fit=crop',
    },
  ],
  hero2: [
    {
      label: 'Ultra Fudgy Brownie Stack',
      url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=85&w=2400&auto=format&fit=crop',
    },
    {
      label: 'Decadent Ganache Drizzle',
      url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=85&w=2400&auto=format&fit=crop',
    },
    {
      label: 'Crusty Dark Cocoa Squares',
      url: 'https://images.unsplash.com/photo-1515037893149-de7f840978e2?q=85&w=2400&auto=format&fit=crop',
    },
  ],
  hero3: [
    {
      label: 'Clean Studio Baking Workshop',
      url: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?q=85&w=2400&auto=format&fit=crop',
    },
    {
      label: 'Students Learning Pastry Art',
      url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=85&w=2400&auto=format&fit=crop',
    },
    {
      label: 'Baking Table with Cocoa & Trays',
      url: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=85&w=2400&auto=format&fit=crop',
    },
  ],
  about: [
    {
      label: 'Elena in Bakery Kitchen',
      url: 'https://images.unsplash.com/photo-1556911073-38141963c9e0?q=85&w=1600&auto=format&fit=crop',
    },
    {
      label: 'Master Chocolatier at Counter',
      url: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?q=85&w=1600&auto=format&fit=crop',
    },
    {
      label: 'Artisan Pastry Maker Smile',
      url: 'https://images.unsplash.com/photo-1607637508097-4089cfa6d5e7?q=85&w=1600&auto=format&fit=crop',
    },
  ],
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminEmail,
  onLogout,
  onViewWebsite,
}) => {
  const {
    settings,
    achievements,
    menuItems,
    bakingClasses,
    updateSettings,
    updateAchievements,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addClass,
    updateClass,
    deleteClass,
    resetToDefaults,
  } = useContent();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'contact' | 'images' | 'menu' | 'classes' | 'achievements' | 'bookings'
  >('overview');

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Draft states
  const [contactForm, setContactForm] = useState<SiteSettings>(settings);
  const [imageForm, setImageForm] = useState<SiteSettings>(settings);
  const [achForm, setAchForm] = useState<AchievementSettings>(achievements);

  const [expandedBrownieId, setExpandedBrownieId] = useState<string | null>(null);
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [classDateInputs, setClassDateInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    setContactForm(settings);
    setImageForm(settings);
  }, [settings]);

  useEffect(() => {
    setAchForm(achievements);
  }, [achievements]);

  // Real-time Firestore records
  const [allRegistrations, setAllRegistrations] = useState<any[]>([]);
  const [allInquiries, setAllInquiries] = useState<any[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsubRegs = onSnapshot(
      collection(db, 'class_registrations'),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() }));
        setAllRegistrations(list);
      },
      (err) => console.warn('Registrations error:', err)
    );

    const unsubInqs = onSnapshot(
      collection(db, 'inquiries'),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() }));
        setAllInquiries(list);
      },
      (err) => console.warn('Inquiries error:', err)
    );

    return () => {
      unsubRegs();
      unsubInqs();
    };
  }, []);

  // New brownie state
  const [isAddingBrownie, setIsAddingBrownie] = useState(false);
  const [newBrownie, setNewBrownie] = useState<Omit<BrownieItem, 'id'>>({
    name: '',
    subtitle: '',
    description: '',
    price: '$5.50 / piece',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=1200&auto=format&fit=crop',
    badge: 'Seasonal Special',
    cocoaPercentage: '72% Dark',
    flavorNotes: ['Madagascar Vanilla', 'Rich Cocoa nibs'],
  });

  // New class state
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClass, setNewClass] = useState<Omit<BakingClassInfo, 'id'>>({
    title: '',
    level: 'Beginner to Intermediate',
    duration: '2.5 Hours',
    price: '$85 / person',
    description: '',
    dates: ['Every Tuesday @ 6:00 PM (Live Online)', 'Saturday @ 11:00 AM (In-Studio)'],
  });

  const triggerSuccess = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#2A1612] text-[#F8F0E5] flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="bg-[#1F0F0C] border-b border-[#3B211B] px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#E8D6C3]"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="w-10 h-10 rounded-xl bg-[#C47B55] flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#F8F0E5]">
                BrowineGirlCakes Admin Dashboard
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#E5A962] text-[#23120E]">
                Authenticated
              </span>
            </div>
            <p className="text-[11px] text-[#E8D6C3]/70 hidden sm:block">
              Logged in as: <strong className="text-white">{adminEmail}</strong> &bull; Changes update public website immediately
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm('Reset website content to artisan bakery defaults?')) {
                resetToDefaults();
                triggerSuccess('Reset to default bakery content successfully!');
              }
            }}
            title="Reset to factory defaults"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-[#E8D6C3] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          {/* View Live Storefront Button */}
          <button
            onClick={onViewWebsite}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer border border-[#C47B55]/40"
          >
            <Globe className="w-4 h-4 text-[#C47B55]" />
            <span className="hidden sm:inline">View Public Website</span>
            <span className="sm:hidden">Website</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#E8D6C3]/60" />
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-700/50 text-red-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Sign out of Admin Dashboard"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Save Notification Banner */}
      {saveSuccess && (
        <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-semibold flex items-center justify-between sticky top-[61px] z-30 animate-in slide-in-from-top-2 shadow-md">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            {saveSuccess}
          </span>
          <span className="text-[11px] text-emerald-100 font-mono">Synced to Live Website</span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside
          className={`${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } fixed md:static inset-y-0 left-0 top-[61px] z-30 w-64 bg-[#1F0F0C] border-r border-[#3B211B] flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out shrink-0`}
        >
          <div className="space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#C47B55]">
              Management Navigation
            </div>

            <button
              onClick={() => {
                setActiveTab('overview');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#C47B55] text-white shadow-md'
                  : 'text-[#E8D6C3]/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview & Statistics</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('images');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'images'
                  ? 'bg-[#C47B55] text-white shadow-md'
                  : 'text-[#E8D6C3]/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Hero & Section Images</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('contact');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'contact'
                  ? 'bg-[#C47B55] text-white shadow-md'
                  : 'text-[#E8D6C3]/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Phone, Email & Socials</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('menu');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'menu'
                  ? 'bg-[#C47B55] text-white shadow-md'
                  : 'text-[#E8D6C3]/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span className="flex-1 text-left">Brownie Menu & Prices</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10">
                {menuItems.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('classes');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'classes'
                  ? 'bg-[#C47B55] text-white shadow-md'
                  : 'text-[#E8D6C3]/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="flex-1 text-left">Online Class Times</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10">
                {bakingClasses.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('achievements');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'achievements'
                  ? 'bg-[#C47B55] text-white shadow-md'
                  : 'text-[#E8D6C3]/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Achievements Section</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('bookings');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-[#C47B55] text-white shadow-md'
                  : 'text-[#E8D6C3]/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="flex-1 text-left">Customer Bookings</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10">
                {allRegistrations.length + allInquiries.length}
              </span>
            </button>
          </div>

          <div className="pt-4 border-t border-[#3B211B] space-y-2">
            <div className="p-3 bg-white/5 rounded-xl text-xs space-y-1">
              <p className="text-[#E8D6C3]/60 text-[10px] uppercase font-bold tracking-wider">
                Current URL Route
              </p>
              <p className="text-[#F8F0E5] font-mono text-[11px] truncate">
                /admin (Dedicated Dashboard)
              </p>
            </div>
            <button
              onClick={onViewWebsite}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#E8D6C3] transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#C47B55]" />
              <span>Open Customer Storefront</span>
            </button>
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-[#F8F0E5] text-[#3B211B] p-5 sm:p-8">
          {/* TAB 0: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
              <div>
                <span className="text-xs font-bold text-[#C47B55] uppercase tracking-wider">
                  Bakery Administration Suite
                </span>
                <h2 className="font-serif text-3xl font-bold text-[#3B211B] mt-1">
                  BrowineGirlCakes Storefront Control Center
                </h2>
                <p className="text-sm text-[#3B211B]/70 mt-1">
                  Configure your bakery photography, prices, class time slots, phone numbers, email, and social IDs. All adjustments save instantly to your live website.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E8D6C3] shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[#C47B55]">
                    <UtensilsCrossed className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[#3B211B]">{menuItems.length} Brownies</p>
                  <p className="text-xs text-[#3B211B]/60">Menu items displayed on website</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E8D6C3] shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[#C47B55]">
                    <Calendar className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C47B55] bg-[#F8F0E5] px-2 py-0.5 rounded-full">
                      Online & Studio
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[#3B211B]">{bakingClasses.length} Masterclasses</p>
                  <p className="text-xs text-[#3B211B]/60">Configured with live date schedules</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E8D6C3] shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[#C47B55]">
                    <Users className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      Firestore DB
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[#3B211B]">{allRegistrations.length} Bookings</p>
                  <p className="text-xs text-[#3B211B]/60">Student registrations recorded</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E8D6C3] shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[#C47B55]">
                    <Phone className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      Hotline
                    </span>
                  </div>
                  <p className="text-lg font-bold text-[#3B211B] truncate">{settings.phone}</p>
                  <p className="text-xs text-[#3B211B]/60">Email: {settings.email}</p>
                </div>
              </div>

              {/* Quick Jump Modules */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                  onClick={() => setActiveTab('images')}
                  className="bg-white p-6 rounded-2xl border border-[#E8D6C3] shadow-xs hover:border-[#C47B55] transition-all cursor-pointer space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F8F0E5] group-hover:bg-[#C47B55] group-hover:text-white text-[#C47B55] flex items-center justify-center transition-colors">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#3B211B]">
                    Change Images
                  </h3>
                  <p className="text-xs text-[#3B211B]/70">
                    Update high-res photographs for all 3 hero slides, close-up chocolate textures, and about section baker photos.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('menu')}
                  className="bg-white p-6 rounded-2xl border border-[#E8D6C3] shadow-xs hover:border-[#C47B55] transition-all cursor-pointer space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F8F0E5] group-hover:bg-[#C47B55] group-hover:text-white text-[#C47B55] flex items-center justify-center transition-colors">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#3B211B]">
                    Add Menu Items & Prices
                  </h3>
                  <p className="text-xs text-[#3B211B]/70">
                    Add new brownies, alter prices in real time, edit origin stories, descriptions, and cocoa percentages.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('classes')}
                  className="bg-white p-6 rounded-2xl border border-[#E8D6C3] shadow-xs hover:border-[#C47B55] transition-all cursor-pointer space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F8F0E5] group-hover:bg-[#C47B55] group-hover:text-white text-[#C47B55] flex items-center justify-center transition-colors">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#3B211B]">
                    Online Class Times
                  </h3>
                  <p className="text-xs text-[#3B211B]/70">
                    Update scheduled class times, online workshop slots, student fees, durations, and curriculum details.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: CHANGE IMAGES */}
          {activeTab === 'images' && (
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-bold text-[#C47B55] uppercase tracking-wider">
                  Visual Assets
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#3B211B] mt-0.5">
                  Change Hero Carousel & Bakery Section Images
                </h3>
                <p className="text-xs text-[#3B211B]/70 mt-1">
                  Paste any high-resolution image URL or choose from curated 1-click bakery photography presets.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hero Slide 1 */}
                <div className="bg-white p-6 rounded-3xl border border-[#E8D6C3] shadow-sm space-y-3">
                  <span className="text-xs font-bold text-[#C47B55] uppercase tracking-wider block">
                    Hero Slide 1: The Baker Behind the Brand
                  </span>
                  <div className="h-48 w-full rounded-2xl overflow-hidden bg-black/10 border border-[#E8D6C3]">
                    <img
                      src={imageForm.heroSlide1Image}
                      alt="Hero Slide 1"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_SETTINGS.heroSlide1Image;
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#3B211B] block mb-1">
                      Direct Photo URL:
                    </label>
                    <input
                      type="text"
                      value={imageForm.heroSlide1Image}
                      onChange={(e) => setImageForm({ ...imageForm, heroSlide1Image: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-xs font-mono text-[#3B211B]"
                    />
                  </div>
                  <div className="pt-1">
                    <span className="text-[10px] text-[#3B211B]/60 font-semibold block mb-1">
                      Quick Preset Options:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {IMAGE_PRESETS.hero1.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImageForm({ ...imageForm, heroSlide1Image: p.url })}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                            imageForm.heroSlide1Image === p.url
                              ? 'bg-[#3B211B] text-[#E8D6C3] border-[#3B211B]'
                              : 'bg-[#F8F0E5] text-[#3B211B] border-[#E8D6C3] hover:bg-[#E8D6C3]'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hero Slide 2 */}
                <div className="bg-white p-6 rounded-3xl border border-[#E8D6C3] shadow-sm space-y-3">
                  <span className="text-xs font-bold text-[#C47B55] uppercase tracking-wider block">
                    Hero Slide 2: The Chocolate Experience
                  </span>
                  <div className="h-48 w-full rounded-2xl overflow-hidden bg-black/10 border border-[#E8D6C3]">
                    <img
                      src={imageForm.heroSlide2Image}
                      alt="Hero Slide 2"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_SETTINGS.heroSlide2Image;
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#3B211B] block mb-1">
                      Direct Photo URL:
                    </label>
                    <input
                      type="text"
                      value={imageForm.heroSlide2Image}
                      onChange={(e) => setImageForm({ ...imageForm, heroSlide2Image: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-xs font-mono text-[#3B211B]"
                    />
                  </div>
                  <div className="pt-1">
                    <span className="text-[10px] text-[#3B211B]/60 font-semibold block mb-1">
                      Quick Preset Options:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {IMAGE_PRESETS.hero2.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImageForm({ ...imageForm, heroSlide2Image: p.url })}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                            imageForm.heroSlide2Image === p.url
                              ? 'bg-[#3B211B] text-[#E8D6C3] border-[#3B211B]'
                              : 'bg-[#F8F0E5] text-[#3B211B] border-[#E8D6C3] hover:bg-[#E8D6C3]'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hero Slide 3 */}
                <div className="bg-white p-6 rounded-3xl border border-[#E8D6C3] shadow-sm space-y-3">
                  <span className="text-xs font-bold text-[#C47B55] uppercase tracking-wider block">
                    Hero Slide 3: Baking Studio Workshop
                  </span>
                  <div className="h-48 w-full rounded-2xl overflow-hidden bg-black/10 border border-[#E8D6C3]">
                    <img
                      src={imageForm.heroSlide3Image}
                      alt="Hero Slide 3"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_SETTINGS.heroSlide3Image;
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#3B211B] block mb-1">
                      Direct Photo URL:
                    </label>
                    <input
                      type="text"
                      value={imageForm.heroSlide3Image}
                      onChange={(e) => setImageForm({ ...imageForm, heroSlide3Image: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-xs font-mono text-[#3B211B]"
                    />
                  </div>
                  <div className="pt-1">
                    <span className="text-[10px] text-[#3B211B]/60 font-semibold block mb-1">
                      Quick Preset Options:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {IMAGE_PRESETS.hero3.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImageForm({ ...imageForm, heroSlide3Image: p.url })}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                            imageForm.heroSlide3Image === p.url
                              ? 'bg-[#3B211B] text-[#E8D6C3] border-[#3B211B]'
                              : 'bg-[#F8F0E5] text-[#3B211B] border-[#E8D6C3] hover:bg-[#E8D6C3]'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* About Section Baker Photo */}
                <div className="bg-white p-6 rounded-3xl border border-[#E8D6C3] shadow-sm space-y-3">
                  <span className="text-xs font-bold text-[#C47B55] uppercase tracking-wider block">
                    Our Story: Artisan Baker Portrait
                  </span>
                  <div className="h-48 w-full rounded-2xl overflow-hidden bg-black/10 border border-[#E8D6C3]">
                    <img
                      src={imageForm.aboutImage}
                      alt="About Baker"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_SETTINGS.aboutImage;
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#3B211B] block mb-1">
                      Direct Photo URL:
                    </label>
                    <input
                      type="text"
                      value={imageForm.aboutImage}
                      onChange={(e) => setImageForm({ ...imageForm, aboutImage: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-xs font-mono text-[#3B211B]"
                    />
                  </div>
                  <div className="pt-1">
                    <span className="text-[10px] text-[#3B211B]/60 font-semibold block mb-1">
                      Quick Preset Options:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {IMAGE_PRESETS.about.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImageForm({ ...imageForm, aboutImage: p.url })}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                            imageForm.aboutImage === p.url
                              ? 'bg-[#3B211B] text-[#E8D6C3] border-[#3B211B]'
                              : 'bg-[#F8F0E5] text-[#3B211B] border-[#E8D6C3] hover:bg-[#E8D6C3]'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={async () => {
                    await updateSettings(imageForm);
                    triggerSuccess('Hero and section images updated live on the website!');
                  }}
                  className="px-6 py-3 rounded-full bg-[#C47B55] hover:bg-[#D98B5F] text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Image Changes</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PHONE, EMAIL, INSTAGRAM, FACEBOOK */}
          {activeTab === 'contact' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-bold text-[#C47B55] uppercase tracking-wider">
                  Contact & Socials
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#3B211B] mt-0.5">
                  Bakery Phone Numbers, Email & Social Media Handles
                </h3>
                <p className="text-xs text-[#3B211B]/70 mt-1">
                  Updates made here immediately propagate to the website top announcement bar, header, contact modals, and footer.
                </p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8D6C3] shadow-sm space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Display Phone */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3B211B] mb-2 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#C47B55]" />
                      Display Phone Number
                    </label>
                    <input
                      type="text"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="(555) 392-CAKE"
                      className="w-full p-3 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-sm font-semibold text-[#3B211B] focus:outline-none focus:ring-2 focus:ring-[#C47B55]"
                    />
                    <p className="text-[11px] text-[#3B211B]/60 mt-1.5">Visible on customer header & footer</p>
                  </div>

                  {/* Click-to-call Phone */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3B211B] mb-2 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#C47B55]" />
                      Click-to-Call Phone (Tel link)
                    </label>
                    <input
                      type="text"
                      value={contactForm.phoneRaw}
                      onChange={(e) => setContactForm({ ...contactForm, phoneRaw: e.target.value })}
                      placeholder="+15553922253"
                      className="w-full p-3 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-sm font-semibold text-[#3B211B] focus:outline-none focus:ring-2 focus:ring-[#C47B55]"
                    />
                    <p className="text-[11px] text-[#3B211B]/60 mt-1.5">Used for direct mobile dialer links</p>
                  </div>

                  {/* Bakery Email */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3B211B] mb-2 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#C47B55]" />
                      Bakery Contact Email
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="hello@browinegirlcakes.com"
                      className="w-full p-3 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-sm font-semibold text-[#3B211B] focus:outline-none focus:ring-2 focus:ring-[#C47B55]"
                    />
                  </div>

                  {/* Instagram ID */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3B211B] mb-2 flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5 text-[#C47B55]" />
                      Instagram Username / ID
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-sm text-[#3B211B]/60">@</span>
                      <input
                        type="text"
                        value={contactForm.instagramId}
                        onChange={(e) => setContactForm({ ...contactForm, instagramId: e.target.value })}
                        placeholder="browinegirlcakes"
                        className="w-full p-3 pl-8 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-sm font-semibold text-[#3B211B] focus:outline-none focus:ring-2 focus:ring-[#C47B55]"
                      />
                    </div>
                    <p className="text-[11px] text-[#3B211B]/60 mt-1.5">
                      Links to: instagram.com/{contactForm.instagramId || 'browinegirlcakes'}
                    </p>
                  </div>

                  {/* Facebook ID */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3B211B] mb-2 flex items-center gap-1.5">
                      <Facebook className="w-3.5 h-3.5 text-[#C47B55]" />
                      Facebook Page ID / Username
                    </label>
                    <input
                      type="text"
                      value={contactForm.facebookId}
                      onChange={(e) => setContactForm({ ...contactForm, facebookId: e.target.value })}
                      placeholder="browinegirlcakes"
                      className="w-full p-3 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-sm font-semibold text-[#3B211B] focus:outline-none focus:ring-2 focus:ring-[#C47B55]"
                    />
                    <p className="text-[11px] text-[#3B211B]/60 mt-1.5">
                      Links to: facebook.com/{contactForm.facebookId || 'browinegirlcakes'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F8F0E5] flex justify-end">
                  <button
                    onClick={async () => {
                      await updateSettings(contactForm);
                      triggerSuccess('Phone numbers, email, and social IDs saved and updated live on the website!');
                    }}
                    className="px-6 py-3 rounded-full bg-[#C47B55] hover:bg-[#D98B5F] text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Contact & Socials</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BROWNIE MENU & PRICES */}
          {activeTab === 'menu' && (
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#C47B55] uppercase tracking-wider">
                    Menu Management
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#3B211B] mt-0.5">
                    Brownie Menu Items & Pricing
                  </h3>
                  <p className="text-xs text-[#3B211B]/70 mt-1">
                    Add new creations, adjust prices, edit descriptions, and update photo links.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingBrownie(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3B211B] hover:bg-[#23120E] text-[#F8F0E5] text-xs font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 text-[#E5A962]" />
                  <span>+ Add New Brownie</span>
                </button>
              </div>

              {/* Add New Brownie Form */}
              {isAddingBrownie && (
                <div className="p-6 bg-white rounded-3xl border-2 border-[#C47B55] shadow-lg space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-lg font-bold text-[#3B211B] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C47B55]" />
                      Create New Brownie Square
                    </h4>
                    <button
                      onClick={() => setIsAddingBrownie(false)}
                      className="text-xs text-[#3B211B]/60 hover:text-black font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#3B211B] block mb-1">Brownie Name *</label>
                      <input
                        type="text"
                        value={newBrownie.name}
                        onChange={(e) => setNewBrownie({ ...newBrownie, name: e.target.value })}
                        placeholder="e.g. Cardamom Rose Fudge"
                        className="w-full p-2.5 bg-[#F8F0E5]/50 border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#3B211B] block mb-1">Origin / Subtitle</label>
                      <input
                        type="text"
                        value={newBrownie.subtitle}
                        onChange={(e) => setNewBrownie({ ...newBrownie, subtitle: e.target.value })}
                        placeholder="e.g. 74% Venezuelan Cacao"
                        className="w-full p-2.5 bg-[#F8F0E5]/50 border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#3B211B] block mb-1">Price *</label>
                      <input
                        type="text"
                        value={newBrownie.price}
                        onChange={(e) => setNewBrownie({ ...newBrownie, price: e.target.value })}
                        placeholder="$5.50 / piece"
                        className="w-full p-2.5 bg-[#F8F0E5]/50 border border-[#E8D6C3] rounded-xl text-xs font-bold text-[#3B211B]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#3B211B] block mb-1">Cocoa %</label>
                      <input
                        type="text"
                        value={newBrownie.cocoaPercentage}
                        onChange={(e) => setNewBrownie({ ...newBrownie, cocoaPercentage: e.target.value })}
                        placeholder="72% Dark"
                        className="w-full p-2.5 bg-[#F8F0E5]/50 border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#3B211B] block mb-1">Badge (Optional)</label>
                      <input
                        type="text"
                        value={newBrownie.badge || ''}
                        onChange={(e) => setNewBrownie({ ...newBrownie, badge: e.target.value })}
                        placeholder="Bestseller / New"
                        className="w-full p-2.5 bg-[#F8F0E5]/50 border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#3B211B] block mb-1">Image URL</label>
                      <input
                        type="text"
                        value={newBrownie.image}
                        onChange={(e) => setNewBrownie({ ...newBrownie, image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full p-2.5 bg-[#F8F0E5]/50 border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B] font-mono"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-xs font-bold text-[#3B211B] block mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={newBrownie.description}
                        onChange={(e) => setNewBrownie({ ...newBrownie, description: e.target.value })}
                        placeholder="Rich description of chocolate textures, aroma, and tasting notes..."
                        className="w-full p-2.5 bg-[#F8F0E5]/50 border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setIsAddingBrownie(false)}
                      className="px-4 py-2 text-xs font-semibold text-[#3B211B] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!newBrownie.name.trim() || !newBrownie.price.trim()) {
                          alert('Please enter a brownie name and price.');
                          return;
                        }
                        await addMenuItem(newBrownie);
                        setIsAddingBrownie(false);
                        triggerSuccess(`Added "${newBrownie.name}" to menu!`);
                      }}
                      className="px-6 py-2.5 rounded-full bg-[#C47B55] hover:bg-[#D98B5F] text-white text-xs font-bold shadow-md cursor-pointer"
                    >
                      Save New Brownie
                    </button>
                  </div>
                </div>
              )}

              {/* Existing Brownie List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((brownie) => {
                  const isExpanded = expandedBrownieId === brownie.id;

                  return (
                    <div
                      key={brownie.id}
                      className="bg-white p-5 rounded-3xl border border-[#E8D6C3] shadow-sm flex flex-col justify-between gap-4"
                    >
                      <div className="flex gap-4">
                        <img
                          src={brownie.image}
                          alt={brownie.name}
                          className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-[#E8D6C3]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C47B55]">
                              {brownie.cocoaPercentage}
                            </span>
                            {brownie.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#3B211B] text-[#E8D6C3]">
                                {brownie.badge}
                              </span>
                            )}
                          </div>
                          <h4 className="font-serif font-bold text-base text-[#3B211B] truncate mt-0.5">
                            {brownie.name}
                          </h4>
                          <p className="text-xs text-[#3B211B]/70 line-clamp-2 mt-1">
                            {brownie.description}
                          </p>
                        </div>
                      </div>

                      {/* Quick Price & Image Editor */}
                      <div className="pt-3 border-t border-[#F8F0E5] grid grid-cols-2 gap-3 items-center">
                        <div>
                          <label className="text-[10px] font-bold text-[#3B211B] block">Change Price</label>
                          <input
                            type="text"
                            value={brownie.price}
                            onChange={(e) => updateMenuItem(brownie.id, { price: e.target.value })}
                            className="w-full p-2 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-lg text-xs font-bold text-[#3B211B]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#3B211B] block">Image URL</label>
                          <input
                            type="text"
                            value={brownie.image}
                            onChange={(e) => updateMenuItem(brownie.id, { image: e.target.value })}
                            className="w-full p-2 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-lg text-[11px] font-mono text-[#3B211B] truncate"
                          />
                        </div>
                      </div>

                      {/* Expandable fields */}
                      {isExpanded && (
                        <div className="p-3 bg-[#F8F0E5]/50 rounded-xl space-y-2 border border-[#E8D6C3] animate-in fade-in">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-[#3B211B] block">Name</label>
                              <input
                                type="text"
                                value={brownie.name}
                                onChange={(e) => updateMenuItem(brownie.id, { name: e.target.value })}
                                className="w-full p-1.5 bg-white border border-[#E8D6C3] rounded-md text-xs font-semibold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#3B211B] block">Origin / Subtitle</label>
                              <input
                                type="text"
                                value={brownie.subtitle}
                                onChange={(e) => updateMenuItem(brownie.id, { subtitle: e.target.value })}
                                className="w-full p-1.5 bg-white border border-[#E8D6C3] rounded-md text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#3B211B] block">Cocoa %</label>
                              <input
                                type="text"
                                value={brownie.cocoaPercentage}
                                onChange={(e) => updateMenuItem(brownie.id, { cocoaPercentage: e.target.value })}
                                className="w-full p-1.5 bg-white border border-[#E8D6C3] rounded-md text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#3B211B] block">Badge</label>
                              <input
                                type="text"
                                value={brownie.badge || ''}
                                onChange={(e) => updateMenuItem(brownie.id, { badge: e.target.value })}
                                className="w-full p-1.5 bg-white border border-[#E8D6C3] rounded-md text-xs"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#3B211B] block">Description</label>
                            <textarea
                              rows={2}
                              value={brownie.description}
                              onChange={(e) => updateMenuItem(brownie.id, { description: e.target.value })}
                              className="w-full p-1.5 bg-white border border-[#E8D6C3] rounded-md text-xs"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => setExpandedBrownieId(isExpanded ? null : brownie.id)}
                          className="text-xs text-[#C47B55] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          <span>{isExpanded ? 'Hide Extra Fields' : 'Edit Name & Details'}</span>
                        </button>

                        <button
                          onClick={async () => {
                            if (confirm(`Delete "${brownie.name}" from the menu?`)) {
                              await deleteMenuItem(brownie.id);
                              triggerSuccess(`Deleted "${brownie.name}"`);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs flex items-center gap-1 cursor-pointer font-semibold"
                          title="Delete brownie"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: BAKING CLASS SCHEDULE & TIMES */}
          {activeTab === 'classes' && (
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#C47B55] uppercase tracking-wider">
                    Studio & Online Masterclasses
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#3B211B] mt-0.5">
                    Manage Online Class Times & Batch Dates
                  </h3>
                  <p className="text-xs text-[#3B211B]/70 mt-1">
                    Update scheduled class batch times, online masterclasses, durations, skill levels, and booking fees.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingClass(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3B211B] hover:bg-[#23120E] text-[#F8F0E5] text-xs font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 text-[#E5A962]" />
                  <span>+ Add New Class</span>
                </button>
              </div>

              {/* Add Class Form */}
              {isAddingClass && (
                <div className="p-6 bg-white rounded-3xl border-2 border-[#C47B55] shadow-lg space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-lg font-bold text-[#3B211B] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#C47B55]" />
                      Create New Baking Masterclass
                    </h4>
                    <button
                      onClick={() => setIsAddingClass(false)}
                      className="text-xs text-[#3B211B]/60 hover:text-black font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-[#3B211B] block mb-1">Class Title *</label>
                      <input
                        type="text"
                        value={newClass.title}
                        onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                        placeholder="e.g. Live Online Holiday Ganache & Brownie Workshop"
                        className="w-full p-2.5 bg-[#F8F0E5]/50 border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#3B211B] block mb-1">Price / Fee *</label>
                      <input
                        type="text"
                        value={newClass.price}
                        onChange={(e) => setNewClass({ ...newClass, price: e.target.value })}
                        placeholder="$85 / person"
                        className="w-full p-2.5 bg-[#F8F0E5]/50 border border-[#E8D6C3] rounded-xl text-xs font-bold text-[#3B211B]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#3B211B] block mb-1">Duration</label>
                      <input
                        type="text"
                        value={newClass.duration}
                        onChange={(e) => setNewClass({ ...newClass, duration: e.target.value })}
                        placeholder="2.5 Hours"
                        className="w-full p-2.5 bg-[#F8F0E5]/50 border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#3B211B] block mb-1">Skill Level</label>
                      <input
                        type="text"
                        value={newClass.level}
                        onChange={(e) => setNewClass({ ...newClass, level: e.target.value })}
                        placeholder="All Levels (Beginner to Advanced)"
                        className="w-full p-2.5 bg-[#F8F0E5]/50 border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#3B211B] block mb-1">Format</label>
                      <input
                        type="text"
                        value="Live Online & In-Studio"
                        readOnly
                        className="w-full p-2.5 bg-[#F8F0E5]/30 border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B]/70"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-xs font-bold text-[#3B211B] block mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={newClass.description}
                        onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                        placeholder="Detailed curriculum, chocolate techniques, recipe takeaway..."
                        className="w-full p-2.5 bg-[#F8F0E5]/50 border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setIsAddingClass(false)}
                      className="px-4 py-2 text-xs font-semibold text-[#3B211B] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!newClass.title.trim()) {
                          alert('Please enter a class title.');
                          return;
                        }
                        await addClass(newClass);
                        setIsAddingClass(false);
                        triggerSuccess(`Added masterclass "${newClass.title}"!`);
                      }}
                      className="px-6 py-2.5 rounded-full bg-[#C47B55] hover:bg-[#D98B5F] text-white text-xs font-bold shadow-md cursor-pointer"
                    >
                      Save New Class
                    </button>
                  </div>
                </div>
              )}

              {/* Existing Classes List */}
              <div className="space-y-4">
                {bakingClasses.map((cls) => {
                  const isExpanded = expandedClassId === cls.id;
                  const currentAddDate = classDateInputs[cls.id] || '';

                  return (
                    <div
                      key={cls.id}
                      className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8D6C3] shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C47B55] bg-[#F8F0E5] px-2.5 py-0.5 rounded-md">
                              {cls.level} &bull; {cls.duration}
                            </span>
                          </div>
                          <h4 className="font-serif text-lg font-bold text-[#3B211B] mt-1">
                            {cls.title}
                          </h4>
                          <p className="text-xs text-[#3B211B]/70 mt-1 line-clamp-2">
                            {cls.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-[#3B211B] block">Fee / Person</span>
                            <input
                              type="text"
                              value={cls.price}
                              onChange={(e) => updateClass(cls.id, { price: e.target.value })}
                              className="p-2 px-3 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-xs font-bold text-[#3B211B] w-28 text-right"
                            />
                          </div>
                          <button
                            onClick={async () => {
                              if (confirm(`Delete class "${cls.title}"?`)) {
                                await deleteClass(cls.id);
                                triggerSuccess(`Deleted class "${cls.title}"`);
                              }
                            }}
                            className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                            title="Delete class"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Scheduled Class Times & Dates */}
                      <div className="p-4 sm:p-5 bg-[#F8F0E5]/50 rounded-2xl border border-[#E8D6C3] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#3B211B] uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#C47B55]" />
                            Scheduled Class Times ({cls.dates.length} Available Slots):
                          </span>
                        </div>

                        <div className="space-y-2">
                          {cls.dates.map((dateStr, dIdx) => (
                            <div key={dIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={dateStr}
                                onChange={(e) => {
                                  const newDates = [...cls.dates];
                                  newDates[dIdx] = e.target.value;
                                  updateClass(cls.id, { dates: newDates });
                                }}
                                className="flex-1 p-2.5 bg-white border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B] font-medium"
                              />
                              <button
                                onClick={() => {
                                  const newDates = cls.dates.filter((_, idx) => idx !== dIdx);
                                  updateClass(cls.id, { dates: newDates });
                                  triggerSuccess('Removed date slot');
                                }}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg text-xs cursor-pointer"
                                title="Remove date slot"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add new date slot for this class */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="e.g. Every Thursday @ 7:00 PM (Live Online) or Saturday @ 2:00 PM"
                            value={currentAddDate}
                            onChange={(e) =>
                              setClassDateInputs({ ...classDateInputs, [cls.id]: e.target.value })
                            }
                            className="flex-1 p-2.5 bg-white border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B]"
                          />
                          <button
                            onClick={() => {
                              if (!currentAddDate.trim()) return;
                              const newDates = [...cls.dates, currentAddDate.trim()];
                              updateClass(cls.id, { dates: newDates });
                              setClassDateInputs({ ...classDateInputs, [cls.id]: '' });
                              triggerSuccess('Added new class session time!');
                            }}
                            className="px-4 py-2.5 bg-[#C47B55] hover:bg-[#D98B5F] text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            + Add Time Slot
                          </button>
                        </div>
                      </div>

                      {/* Expandable Class Details */}
                      {isExpanded && (
                        <div className="p-4 bg-white rounded-2xl border border-[#E8D6C3] space-y-3 animate-in fade-in">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="text-[10px] font-bold text-[#3B211B] block">Title</label>
                              <input
                                type="text"
                                value={cls.title}
                                onChange={(e) => updateClass(cls.id, { title: e.target.value })}
                                className="w-full p-2 bg-[#F8F0E5]/50 border border-[#E8D6C3] rounded-lg text-xs font-semibold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#3B211B] block">Duration</label>
                              <input
                                type="text"
                                value={cls.duration}
                                onChange={(e) => updateClass(cls.id, { duration: e.target.value })}
                                className="w-full p-2 bg-[#F8F0E5]/50 border border-[#E8D6C3] rounded-lg text-xs"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="text-[10px] font-bold text-[#3B211B] block">Description</label>
                              <textarea
                                rows={2}
                                value={cls.description}
                                onChange={(e) => updateClass(cls.id, { description: e.target.value })}
                                className="w-full p-2 bg-[#F8F0E5]/50 border border-[#E8D6C3] rounded-lg text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => setExpandedClassId(isExpanded ? null : cls.id)}
                          className="text-xs text-[#C47B55] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          <span>{isExpanded ? 'Hide Extra Fields' : 'Edit Class Title & Description'}</span>
                        </button>
                        <span className="text-[11px] text-green-700 font-semibold">
                          ✓ Auto-saved on change
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: ACHIEVEMENTS & MILESTONES */}
          {activeTab === 'achievements' && (
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-bold text-[#C47B55] uppercase tracking-wider">
                  Accolades & Milestones
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#3B211B] mt-0.5">
                  Edit Achievements & Milestones Section
                </h3>
                <p className="text-xs text-[#3B211B]/70 mt-1">
                  Update statistics, baking class graduate counters, review ratings, and industry certifications.
                </p>
              </div>

              {/* 4 Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Stat 1 */}
                <div className="bg-white p-6 rounded-3xl border border-[#E8D6C3] shadow-sm space-y-2">
                  <span className="text-[11px] font-bold text-[#C47B55] uppercase">Statistic #1</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#3B211B] block">Number / Stat</label>
                      <input
                        type="text"
                        value={achForm.stat1Value}
                        onChange={(e) => setAchForm({ ...achForm, stat1Value: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-sm font-bold text-[#3B211B]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#3B211B] block">Label</label>
                      <input
                        type="text"
                        value={achForm.stat1Label}
                        onChange={(e) => setAchForm({ ...achForm, stat1Label: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-xs font-semibold text-[#3B211B]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#3B211B] block">Description</label>
                    <input
                      type="text"
                      value={achForm.stat1Desc}
                      onChange={(e) => setAchForm({ ...achForm, stat1Desc: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B]"
                    />
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="bg-white p-6 rounded-3xl border border-[#E8D6C3] shadow-sm space-y-2">
                  <span className="text-[11px] font-bold text-[#C47B55] uppercase">Statistic #2</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#3B211B] block">Number / Stat</label>
                      <input
                        type="text"
                        value={achForm.stat2Value}
                        onChange={(e) => setAchForm({ ...achForm, stat2Value: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-sm font-bold text-[#3B211B]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#3B211B] block">Label</label>
                      <input
                        type="text"
                        value={achForm.stat2Label}
                        onChange={(e) => setAchForm({ ...achForm, stat2Label: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-xs font-semibold text-[#3B211B]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#3B211B] block">Description</label>
                    <input
                      type="text"
                      value={achForm.stat2Desc}
                      onChange={(e) => setAchForm({ ...achForm, stat2Desc: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B]"
                    />
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="bg-white p-6 rounded-3xl border border-[#E8D6C3] shadow-sm space-y-2">
                  <span className="text-[11px] font-bold text-[#C47B55] uppercase">Statistic #3</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#3B211B] block">Number / Stat</label>
                      <input
                        type="text"
                        value={achForm.stat3Value}
                        onChange={(e) => setAchForm({ ...achForm, stat3Value: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-sm font-bold text-[#3B211B]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#3B211B] block">Label</label>
                      <input
                        type="text"
                        value={achForm.stat3Label}
                        onChange={(e) => setAchForm({ ...achForm, stat3Label: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-xs font-semibold text-[#3B211B]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#3B211B] block">Description</label>
                    <input
                      type="text"
                      value={achForm.stat3Desc}
                      onChange={(e) => setAchForm({ ...achForm, stat3Desc: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B]"
                    />
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="bg-white p-6 rounded-3xl border border-[#E8D6C3] shadow-sm space-y-2">
                  <span className="text-[11px] font-bold text-[#C47B55] uppercase">Statistic #4</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#3B211B] block">Number / Stat</label>
                      <input
                        type="text"
                        value={achForm.stat4Value}
                        onChange={(e) => setAchForm({ ...achForm, stat4Value: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-sm font-bold text-[#3B211B]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#3B211B] block">Label</label>
                      <input
                        type="text"
                        value={achForm.stat4Label}
                        onChange={(e) => setAchForm({ ...achForm, stat4Label: e.target.value })}
                        className="w-full p-2.5 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-xs font-semibold text-[#3B211B]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#3B211B] block">Description</label>
                    <input
                      type="text"
                      value={achForm.stat4Desc}
                      onChange={(e) => setAchForm({ ...achForm, stat4Desc: e.target.value })}
                      className="w-full p-2.5 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-xl text-xs text-[#3B211B]"
                    />
                  </div>
                </div>
              </div>

              {/* Awards and Honors */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3B211B] block">
                  Industry Awards & Accreditations (3 Cards)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Award 1 */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E8D6C3] space-y-2">
                    <label className="text-[10px] font-bold text-[#3B211B] block">Award 1 Title</label>
                    <input
                      type="text"
                      value={achForm.award1Title}
                      onChange={(e) => setAchForm({ ...achForm, award1Title: e.target.value })}
                      className="w-full p-2 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-lg text-xs font-bold text-[#3B211B]"
                    />
                    <label className="text-[10px] font-bold text-[#3B211B] block">Organization</label>
                    <input
                      type="text"
                      value={achForm.award1Org}
                      onChange={(e) => setAchForm({ ...achForm, award1Org: e.target.value })}
                      className="w-full p-2 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-lg text-xs text-[#3B211B]"
                    />
                    <label className="text-[10px] font-bold text-[#3B211B] block">Highlight Note</label>
                    <input
                      type="text"
                      value={achForm.award1Note}
                      onChange={(e) => setAchForm({ ...achForm, award1Note: e.target.value })}
                      className="w-full p-2 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-lg text-xs text-[#3B211B]"
                    />
                  </div>

                  {/* Award 2 */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E8D6C3] space-y-2">
                    <label className="text-[10px] font-bold text-[#3B211B] block">Award 2 Title</label>
                    <input
                      type="text"
                      value={achForm.award2Title}
                      onChange={(e) => setAchForm({ ...achForm, award2Title: e.target.value })}
                      className="w-full p-2 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-lg text-xs font-bold text-[#3B211B]"
                    />
                    <label className="text-[10px] font-bold text-[#3B211B] block">Organization</label>
                    <input
                      type="text"
                      value={achForm.award2Org}
                      onChange={(e) => setAchForm({ ...achForm, award2Org: e.target.value })}
                      className="w-full p-2 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-lg text-xs text-[#3B211B]"
                    />
                    <label className="text-[10px] font-bold text-[#3B211B] block">Highlight Note</label>
                    <input
                      type="text"
                      value={achForm.award2Note}
                      onChange={(e) => setAchForm({ ...achForm, award2Note: e.target.value })}
                      className="w-full p-2 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-lg text-xs text-[#3B211B]"
                    />
                  </div>

                  {/* Award 3 */}
                  <div className="bg-white p-5 rounded-2xl border border-[#E8D6C3] space-y-2">
                    <label className="text-[10px] font-bold text-[#3B211B] block">Award 3 Title</label>
                    <input
                      type="text"
                      value={achForm.award3Title}
                      onChange={(e) => setAchForm({ ...achForm, award3Title: e.target.value })}
                      className="w-full p-2 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-lg text-xs font-bold text-[#3B211B]"
                    />
                    <label className="text-[10px] font-bold text-[#3B211B] block">Organization</label>
                    <input
                      type="text"
                      value={achForm.award3Org}
                      onChange={(e) => setAchForm({ ...achForm, award3Org: e.target.value })}
                      className="w-full p-2 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-lg text-xs text-[#3B211B]"
                    />
                    <label className="text-[10px] font-bold text-[#3B211B] block">Highlight Note</label>
                    <input
                      type="text"
                      value={achForm.award3Note}
                      onChange={(e) => setAchForm({ ...achForm, award3Note: e.target.value })}
                      className="w-full p-2 bg-[#F8F0E5]/60 border border-[#E8D6C3] rounded-lg text-xs text-[#3B211B]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={async () => {
                    await updateAchievements(achForm);
                    triggerSuccess('Achievements & Awards updated live on the website!');
                  }}
                  className="px-6 py-3 rounded-full bg-[#C47B55] hover:bg-[#D98B5F] text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Achievements Changes</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOMER BOOKINGS & INQUIRIES */}
          {activeTab === 'bookings' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
              <div>
                <span className="text-xs font-bold text-[#C47B55] uppercase tracking-wider">
                  Real-Time Database Records
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#3B211B] mt-0.5">
                  Live Class Bookings & Customer Inquiries
                </h3>
                <p className="text-xs text-[#3B211B]/70 mt-1">
                  Submissions made by customers on the public website stream here directly via Google Firestore.
                </p>
              </div>

              {/* Class Registrations */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-[#3B211B] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C47B55]" />
                  Masterclass Registrations ({allRegistrations.length})
                </h4>

                {allRegistrations.length === 0 ? (
                  <div className="p-8 bg-white rounded-3xl text-center text-xs text-[#3B211B]/60 border border-[#E8D6C3]">
                    No class bookings recorded yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allRegistrations.map((reg) => (
                      <div
                        key={reg.id}
                        className="bg-white p-5 rounded-2xl border border-[#E8D6C3] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                      >
                        <div>
                          <p className="text-sm font-bold text-[#3B211B]">
                            {reg.className} &bull; <span className="text-[#C47B55]">{reg.preferredDate}</span>
                          </p>
                          <p className="text-xs text-[#3B211B]/80 mt-1">
                            Customer: <strong>{reg.userName}</strong> ({reg.userEmail})
                          </p>
                          {reg.notes && (
                            <p className="text-xs text-[#3B211B]/60 italic mt-1">
                              Notes: {reg.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold text-[#3B211B]/60 uppercase">
                            Status:
                          </label>
                          <select
                            value={reg.status}
                            onChange={async (e) => {
                              try {
                                await updateDoc(doc(db, 'class_registrations', reg.id), {
                                  status: e.target.value,
                                });
                                triggerSuccess(`Updated booking status to ${e.target.value}`);
                              } catch (err) {
                                console.warn(err);
                              }
                            }}
                            className="p-2 bg-[#F8F0E5] border border-[#E8D6C3] rounded-xl text-xs font-semibold text-[#3B211B]"
                          >
                            <option value="registered">registered</option>
                            <option value="waitlist">waitlist</option>
                            <option value="cancelled">cancelled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Inquiries */}
              <div className="space-y-3 pt-4 border-t border-[#E8D6C3]">
                <h4 className="font-bold text-sm text-[#3B211B] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#C47B55]" />
                  Custom Order & Catering Inquiries ({allInquiries.length})
                </h4>

                {allInquiries.length === 0 ? (
                  <div className="p-8 bg-white rounded-3xl text-center text-xs text-[#3B211B]/60 border border-[#E8D6C3]">
                    No inquiries recorded yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allInquiries.map((inq) => (
                      <div
                        key={inq.id}
                        className="bg-white p-5 rounded-2xl border border-[#E8D6C3] space-y-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#3B211B]">{inq.subject}</span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#E8D6C3] text-[#3B211B]">
                            {inq.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#3B211B]/80 font-mono bg-[#F8F0E5]/60 p-3 rounded-xl whitespace-pre-wrap">
                          {inq.message}
                        </p>
                        <p className="text-[11px] text-[#3B211B]/60">
                          From: {inq.userName} ({inq.userEmail}) &bull;{' '}
                          {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
