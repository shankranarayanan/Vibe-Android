import React, { useState, useMemo } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Search, 
  Code, 
  Smartphone, 
  Database, 
  Cpu, 
  Image as ImageIcon, 
  MapPin, 
  Star, 
  Copy, 
  Check, 
  Folder, 
  FolderOpen, 
  FileCode, 
  RotateCcw, 
  Layers, 
  Settings, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  ExternalLink, 
  Info, 
  Terminal, 
  Share2
} from 'lucide-react';
import { androidFiles, AndroidFile } from './data/androidFiles';
import { mockCategories, mockBusinesses, MockBusiness } from './data/mockData';

export default function App() {
  // Mobile UI States
  const [selectedCategory, setSelectedCategory] = useState<string>("cat_baker");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLowRamMode, setIsLowRamMode] = useState<boolean>(false);
  const [selectedBusiness, setSelectedBusiness] = useState<MockBusiness | null>(null);
  const [activeCatalogPage, setActiveCatalogPage] = useState<number>(0);
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  
  // Architect Source Code Explorer States
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(androidFiles[0]);
  const [codeSearch, setCodeSearch] = useState<string>("");
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [isFolderOpen, setIsFolderOpen] = useState({
    model: true,
    database: true,
    viewmodel: true,
    adapter: true,
    intent: true,
    glide: true,
    layout: true
  });

  // Diagnostic Logcat Terminal Stack
  const [logcat, setLogcat] = useState<Array<{ timestamp: string; tag: string; level: 'D' | 'I' | 'W' | 'E'; msg: string }>>([
    { timestamp: "10:54:01.211", tag: "AppDatabase", level: "I", msg: "Initializing Room database instance: dukan_adambakkam_db" },
    { timestamp: "10:54:01.405", tag: "AppDatabase", level: "D", msg: "Pre-populating SQLite DB asynchronously. Running 4 active executor threads." },
    { timestamp: "10:54:01.812", tag: "GlideConfiguration", level: "I", msg: "AppGlideModule registered.manifest parsing disabled." },
    { timestamp: "10:54:02.100", tag: "BusinessViewModel", level: "D", msg: "LiveData stream initialized. Category filter defaults to: Home Bakers & Desserts" }
  ]);

  const addLog = (tag: string, level: 'D' | 'I' | 'W' | 'E', msg: string) => {
    const now = new Date();
    const ts = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    setLogcat(prev => [...prev.slice(-30), { timestamp: ts, tag, level, msg }]);
  };

  const toggleFolder = (folderName: keyof typeof isFolderOpen) => {
    setIsFolderOpen(prev => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  // Filter local business entries in real time based on active category and sub-query search
  const filteredBusinesses = useMemo(() => {
    return mockBusinesses.filter(b => {
      const matchCategory = b.categoryId === selectedCategory;
      const matchSearch = searchQuery ? (
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.address.toLowerCase().includes(searchQuery.toLowerCase())
      ) : true;
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Handle dial trigger simulation
  const handleCall = (business: MockBusiness, e: React.MouseEvent) => {
    e.stopPropagation();
    addLog("IntentHelper", "I", `dialPhoneNumber() invoked for "${business.name}"`);
    addLog("IntentHelper", "D", `Creating Intent: Action=Intent.ACTION_DIAL, Data=tel:${business.phoneNumber}`);
    addLog("AndroidRuntime", "I", `Dispatched dial UI to system frame: Activity resolver returned packaging capability info.`);
    alert(`[NATIVE DIAL INTENT FIRED]\n\nJava Call:\nIntentHelper.dialPhoneNumber(context, "${business.phoneNumber}");\n\nThis opens the Android dialer with the number pre-filled. Bypasses dangerous call permissions.`);
  };

  // Handle WhatsApp API trigger simulation
  const handleWhatsApp = (business: MockBusiness, e: React.MouseEvent) => {
    e.stopPropagation();
    addLog("IntentHelper", "I", `openWhatsAppChat() invoked with number: ${business.whatsappNumber}`);
    addLog("IntentHelper", "D", `Standardizing clean formatting: ${business.whatsappNumber}`);
    
    const message = `Hello ${business.name}, I found you on Dukan Adambakkam directory. Can I see your latest menu catalog?`;
    const encoded = encodeURIComponent(message);
    addLog("IntentHelper", "D", `Generated URI: https://api.whatsapp.com/send?phone=${business.whatsappNumber}&text=${encoded.slice(0, 30)}...`);
    addLog("IntentHelper", "I", `Attempting direct package target: "com.whatsapp" Check resolver...`);
    
    // Simulate WhatsApp Package Query
    setTimeout(() => {
      addLog("PackageManager", "W", `Package check failed for target: "com.whatsapp" [Simulated WhatsApp missing]`);
      addLog("IntentHelper", "W", `Direct WhatsApp redirect caught Exception. Resolving package: "com.whatsapp.w4b" (WhatsApp Business)`);
      setTimeout(() => {
        addLog("PackageManager", "W", `Package check failed for target: "com.whatsapp.w4b"`);
        addLog("IntentHelper", "I", `Fallback system routing triggered. Dispatching browser Intent: Action=Intent.ACTION_VIEW`);
      }, 350);
    }, 400);

    alert(`[NATIVE WHATSAPP DEEP LINK INTENT FIRED]\n\nJava Call:\nIntentHelper.openWhatsAppChat(context, "${business.whatsappNumber}", "${message.slice(0, 45)}...");\n\nThis checks for Personal then Business WhatsApp packages. If missing, it smoothly falls back to browser web-routing.`);
  };

  const handleBusinessClick = (business: MockBusiness) => {
    setSelectedBusiness(business);
    setActiveCatalogPage(0);
    setIsCatalogOpen(true);
    addLog("BusinessAdapter", "D", `onBusinessClick() fired. Opening full-screen view-pager container.`);
    addLog("BusinessViewModel", "I", `Querying catalog list for Business ID: ${business.id}`);
    addLog("BusinessDao", "D", `[SQL Transaction] Query returned ${business.catalogs.length} catalog items for "${business.name}"`);
    
    const ramFormat = isLowRamMode ? "RGB_565 (50% RAM)" : "ARGB_8888 (High Quality)";
    addLog("Glide", "I", `Glide loading thumbnail: Url="${business.catalogs[0]?.image.slice(0, 40)}...", DecodeFormat=${ramFormat}, DiskCacheStrategy=ALL`);
  };

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (!selectedBusiness) return;
    if (direction === 'next' && activeCatalogPage < selectedBusiness.catalogs.length - 1) {
      setActiveCatalogPage(prev => prev + 1);
      addLog("ViewPager2", "D", `Page index swiped next: ${activeCatalogPage + 1}`);
    } else if (direction === 'prev' && activeCatalogPage > 0) {
      setActiveCatalogPage(prev => prev - 1);
      addLog("ViewPager2", "D", `Page index swiped prev: ${activeCatalogPage - 1}`);
    }
  };

  // Filter Code Files
  const filteredFiles = useMemo(() => {
    if (!codeSearch) return androidFiles;
    return androidFiles.filter(f => 
      f.name.toLowerCase().includes(codeSearch.toLowerCase()) ||
      f.description.toLowerCase().includes(codeSearch.toLowerCase()) ||
      f.code.toLowerCase().includes(codeSearch.toLowerCase())
    );
  }, [codeSearch]);

  // Dynamic calculations for system constraints
  const calculatedMemory = useMemo(() => {
    // Arbitrary realistic calculation of memory usage of loading high-res images on Android.
    // Standard ARGB_32 uses 4 bytes per pixel. RGB_565 uses 2 bytes per pixel.
    const pixels = 1920 * 1080; // Catalog image
    const rawBytes = pixels * (isLowRamMode ? 2 : 4);
    const mbUsed = (rawBytes / (1024 * 1024)).toFixed(1);
    return {
      bytesPerPixel: isLowRamMode ? 2 : 4,
      ramSavedPct: isLowRamMode ? "50%" : "0%",
      imageHeapAllocation: mbUsed,
      threadPoolSize: isLowRamMode ? 2 : 4,
      cacheStrategy: isLowRamMode ? "LruLowRamCache" : "LruStandardCache"
    };
  }, [isLowRamMode]);

  const copyCode = (file: AndroidFile) => {
    navigator.clipboard.writeText(file.code);
    setCopiedFile(file.name);
    addLog("DeveloperConsole", "I", `Copied source code: ${file.name} to system clipboard.`);
    setTimeout(() => {
      setCopiedFile(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#0F172A] flex flex-col font-sans antialiased">
      
      {/* Professional Polish Header with distinct bottom border of --android-green */}
      <header className="bg-[#0F172A] border-b-3 border-[#3DDC84] py-4 px-6 sticky top-0 z-50 shadow-md text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo and Brand Title */}
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#1A73E8] text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                Android Native
              </span>
              <h1 className="text-xl font-semibold tracking-tight flex items-center gap-1.5">
                Dukan Adambakkam <span className="text-[#3DDC84] text-xs font-semibold px-2 py-0.5 bg-slate-800 rounded">Architecture Blueprint</span>
              </h1>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              High-performance, resource-optimized MVVM &amp; Room local directory model for Adambakkam bakers, kitchens, and services.
            </p>
          </div>

          {/* Quick Stats & Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Low RAM Simulation Switch */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Device Constraint</span>
                <span className="text-xs font-medium text-slate-200">Budget Device RAM Mode</span>
              </div>
              <button 
                id="toggle-low-ram"
                onClick={() => {
                  const newState = !isLowRamMode;
                  setIsLowRamMode(newState);
                  addLog("GlideConfiguration", "W", `Dynamic VM heap check switched profile! Config set to: ${newState ? 'LowRamDevice (RGB_565)' : 'HighPrecisionDevice (ARGB_8888)'}`);
                }}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${isLowRamMode ? 'bg-[#3DDC84]' : 'bg-slate-700'}`}
              >
                <div className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${isLowRamMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Simulated Live Specs */}
            <div className="hidden lg:flex bg-[#1E293B] border border-slate-700 rounded-lg p-2 items-center gap-3 font-mono text-xs text-slate-300">
              <div className="border-r border-slate-700 pr-2">
                <div className="text-[9px] text-slate-400 uppercase">GLIDE BITMAP</div>
                <div className="text-white font-bold">{isLowRamMode ? "RGB_565" : "ARGB_8888"}</div>
              </div>
              <div className="border-r border-slate-700 pr-2">
                <div className="text-[9px] text-slate-400 uppercase">RAM / PAMPHLET</div>
                <div className="text-[#3DDC84] font-bold">{calculatedMemory.imageHeapAllocation} MB</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 uppercase">ROOM MEM CACHE</div>
                <div className="text-[#1A73E8] font-bold">{isLowRamMode ? "8 MB Limit" : "32 MB Safe"}</div>
              </div>
            </div>

            {/* Quick Actions */}
            <button 
              id="reset-logs"
              onClick={() => {
                setLogcat([]);
                addLog("DeveloperConsole", "I", "Cleared interactive execution trace log.");
              }} 
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded border border-slate-700 transition"
              title="Reset Trace Logs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Grid Viewport splits phone sim and code catalog */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT: High-fidelity Interactive Mobile Simulator (Col Span 5 on LG / 12 on mobile) */}
        <section className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col">
            
            {/* Simulation Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E8F0]">
              <span className="text-xs font-bold text-[#334155] uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#1A73E8]" /> Interactive UI Simulator
              </span>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#3DDC84] animate-pulse"></span>
                <span className="text-[10px] text-slate-500 font-mono">SQLite Room Cache</span>
              </div>
            </div>

            {/* Phone Container */}
            <div className="w-full max-w-[320px] mx-auto bg-[#0F172A] border-[10px] border-[#0F172A] rounded-[36px] shadow-lg relative overflow-hidden flex flex-col h-[580px]">
              
              {/* Speaker and Camera notch simulation */}
              <div className="h-5 bg-[#0F172A] flex justify-center items-center z-20">
                <div className="w-16 h-3 bg-slate-950 rounded-full"></div>
              </div>

              {/* Mock App Container */}
              <div className="flex-1 flex flex-col bg-[#F8FAFC] text-slate-900 overflow-hidden relative font-sans">
                
                {/* Simulated Android Status Bar */}
                <div className="px-4 py-1 flex justify-between items-center bg-white text-slate-600 text-[10px] font-mono select-none">
                  <span className="font-semibold">9:41 AM</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">4G LTE</span>
                    <span className="bg-slate-600 h-2 w-3.5 rounded-xs inline-block"></span>
                  </div>
                </div>

                {/* Simulated Toolbar Header corresponding to activity_main */}
                <div className="bg-white border-b border-[#E2E8F0] px-4 py-3 flex flex-col">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-md font-bold text-[#0F172A] tracking-tight leading-tight">Dukan Adambakkam</h2>
                      <p className="text-[10px] text-[#64748B] font-medium">Core directory of offline catalogs</p>
                    </div>
                    <span className="bg-[#E8F0FE] text-[#1A73E8] px-2 py-0.5 rounded text-[9px] font-bold">Local Db</span>
                  </div>

                  {/* Search query input simulation */}
                  <div className="mt-3.5 relative">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search items (cakes, parotta, wires)..." 
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        addLog("BusinessDao", "D", `User typed search query: "${e.target.value}". Running Like check.`);
                      }}
                      className="w-full pl-8 pr-3 py-1.5 bg-[#F1F5F9] focus:bg-white text-xs border border-transparent focus:border-[#1A73E8] rounded-md outline-hidden text-slate-800 transition"
                    />
                  </div>
                </div>

                {/* Categories recycler simulation with precise Design HTML details */}
                <div className="bg-white px-2 py-2 border-b border-[#E2E8F0] overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
                  {mockCategories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          addLog("BusinessViewModel", "I", `selectCategory("${cat.id}") called inside ViewModel.`);
                          addLog("BusinessDao", "D", `Retrieving SQLite businesses for category_id="${cat.id}" indexed relation.`);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-[10px] font-bold transition-all ${
                          isSelected 
                            ? 'bg-[#E8F0FE] text-[#1A73E8] border-l-3 border-[#1A73E8] shadow-xs' 
                            : 'bg-slate-100 text-[#334155] hover:bg-slate-250'
                        }`}
                      >
                        <span className="text-[11px]">{cat.icon}</span>
                        <span>{cat.name.split(' & ')[0]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Recycled Businesses List correspond to rv_businesses */}
                <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-2 bg-[#F1F5F9]">
                  {filteredBusinesses.length > 0 ? (
                    filteredBusinesses.map((b) => {
                      const isActive = selectedBusiness?.id === b.id && isCatalogOpen;
                      return (
                        <div 
                          key={b.id}
                          id={`business-${b.id}`}
                          onClick={() => handleBusinessClick(b)}
                          className={`rounded-lg border p-3 cursor-pointer transition transform hover:-translate-y-0.5 ${
                            isActive 
                              ? 'border-[#1A73E8] bg-[#F0F7FF] shadow-xs' 
                              : 'bg-white border-[#E2E8F0] hover:border-slate-300'
                          }`}
                        >
                          <div className="flex gap-2.5">
                            {/* Image Thumbnail loaded via Glide inside ViewHolder */}
                            <div className="relative flex-shrink-0">
                              <img 
                                src={b.thumbnail} 
                                alt={b.name}
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 object-cover rounded-md bg-slate-100 border border-slate-150"
                              />
                              {/* Star Badge */}
                              <div className="absolute -bottom-1.5 -right-1 bg-amber-400 text-[8px] font-extrabold text-slate-950 px-1 rounded flex items-center gap-0.5">
                                <Star className="w-2 h-2 fill-slate-900 stroke-none" /> {b.rating}
                              </div>
                            </div>

                            {/* Info Column */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xs font-bold text-slate-900 truncate">{b.name}</h3>
                              <p className="text-[9px] text-[#64748B] line-clamp-2 leading-relaxed mt-0.5">{b.tagline}</p>
                              
                              <p className="text-[8px] text-[#1A73E8] font-bold tracking-wider uppercase mt-1">Active Now • MVVM Binded</p>
                            </div>
                          </div>

                          {/* Direct Intent Buttons */}
                          <div className="flex justify-end gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                            <button
                              id={`btn-whatsapp-${b.id}`}
                              onClick={(e) => handleWhatsApp(b, e)}
                              className="bg-[#25D366] hover:bg-[#1EBE56] text-white font-bold text-[9px] px-2.5 py-1 rounded flex items-center gap-1 shadow-xs"
                            >
                              <MessageSquare className="w-2.5 h-2.5" /> WhatsApp
                            </button>
                            <button
                              id={`btn-call-${b.id}`}
                              onClick={(e) => handleCall(b, e)}
                              className="bg-[#1A73E8] hover:bg-[#155CB8] text-white font-bold text-[9px] px-2.5 py-1 rounded flex items-center gap-1"
                            >
                              <Phone className="w-2.5 h-2.5" /> DIAL INTENT
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
                      <Search className="w-8 h-8 text-slate-300 stroke-1 mb-2" />
                      <p className="text-xs font-bold">No results found in SQLite</p>
                      <p className="text-[10px] max-w-[200px] mt-0.5">Check category filters or queries.</p>
                    </div>
                  )}
                </div>

                {/* Simulated Android Navigation Bar */}
                <div className="bg-white border-t border-[#E2E8F0] py-2 px-6 flex justify-between items-center text-slate-400 select-none">
                  <div className="w-3.5 h-3.5 border-2 border-slate-400 rounded-sm"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-400"></div>
                  <ChevronLeft className="w-4 h-4" />
                </div>

                {/* Interactive Catalog Viewer Popup (Simulating ViewPager2 in DialogFragment) */}
                {isCatalogOpen && selectedBusiness && (
                  <div className="absolute inset-0 bg-slate-900 z-40 flex flex-col justify-between text-white p-3.5">
                    
                    {/* Catalog Header */}
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <div>
                        <h4 className="text-xs font-bold truncate text-white">{selectedBusiness.name}</h4>
                        <p className="text-[8px] text-slate-400 font-mono uppercase tracking-wider">Glide Hardware Bitmap</p>
                      </div>
                      <button 
                        onClick={() => {
                          setIsCatalogOpen(false);
                          addLog("ViewPager2", "D", "Dismiss dialog catalog page viewer.");
                        }}
                        className="p-1 hover:bg-slate-800 rounded transition"
                      >
                        <X className="w-4 h-4 text-slate-400 hover:text-white" />
                      </button>
                    </div>

                    {/* Image Viewport wrapper */}
                    <div className="flex-1 flex items-center justify-center relative my-3">
                      {selectedBusiness.catalogs[activeCatalogPage] ? (
                        <div className="relative max-h-64 w-full flex items-center justify-center bg-slate-950 p-2 rounded-lg border border-slate-800 shadow-inner">
                          <img 
                            src={selectedBusiness.catalogs[activeCatalogPage].image} 
                            alt={`Catalog page ${activeCatalogPage + 1}`}
                            referrerPolicy="no-referrer"
                            className="max-h-60 object-contain rounded"
                          />
                          
                          {/* Low RAM Warning Stamp */}
                          <div className="absolute top-2 left-2 bg-[#0F172A]/90 border border-slate-700 px-2 py-0.5 rounded text-[8px] font-mono">
                            Memory: <span className={isLowRamMode ? "text-amber-400" : "text-[#3DDC84]"}>{isLowRamMode ? "RGB_565 (50% Saved)" : "ARGB_8888"}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400">Loading pamphlet...</div>
                      )}

                      {/* Slider Navigation arrows */}
                      {selectedBusiness.catalogs.length > 1 && (
                        <>
                          <button 
                            id="catalog-prev-page"
                            disabled={activeCatalogPage === 0}
                            onClick={() => handlePageChange('prev')}
                            className={`absolute left-0 p-1.5 rounded-full ${
                              activeCatalogPage === 0 ? 'text-slate-800 cursor-not-allowed font-light' : 'text-white bg-slate-800/80 hover:bg-slate-700'
                            }`}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button 
                            id="catalog-next-page"
                            disabled={activeCatalogPage === selectedBusiness.catalogs.length - 1}
                            onClick={() => handlePageChange('next')}
                            className={`absolute right-0 p-1.5 rounded-full ${
                              activeCatalogPage === selectedBusiness.catalogs.length - 1 ? 'text-slate-800 cursor-not-allowed font-light' : 'text-white bg-slate-800/80 hover:bg-slate-700'
                            }`}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Catalog Footer controls */}
                    <div className="border-t border-slate-800 pt-2 text-center flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono text-slate-300">
                        Page {activeCatalogPage + 1} of {selectedBusiness.catalogs.length}
                      </span>
                      
                      {/* Glide memory monitoring readout */}
                      <div className="bg-slate-950 p-1.5 rounded border border-slate-850 text-[8px] font-mono flex justify-between gap-1">
                        <span>Strategy: <strong className="text-[#1A73E8]">ALL</strong></span>
                        <span>Format: <strong className={isLowRamMode ? "text-amber-400" : "text-[#3DDC84]"}>{isLowRamMode ? "RGB_565" : "ARGB_8888"}</strong></span>
                        <span>Heap: <strong className="text-[#3DDC84]">{calculatedMemory.imageHeapAllocation}M</strong></span>
                      </div>

                      {/* Bottom Dialog Action Triggers inside simulation */}
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          onClick={(e) => handleWhatsApp(selectedBusiness, e)}
                          className="bg-[#25D366] text-white font-extrabold text-[9px] py-2 rounded shadow-xs"
                        >
                          WhatsApp Inquiry
                        </button>
                        <button
                          onClick={(e) => handleCall(selectedBusiness, e)}
                          className="bg-[#1A73E8] text-white font-extrabold text-[9px] py-2 rounded shadow-xs"
                        >
                          ACTION_DIAL
                        </button>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>

            {/* Simulated Debug Console / Android Logcat */}
            <div className="mt-4 flex flex-col bg-slate-950 rounded-lg border border-slate-800 overflow-hidden shadow-xs">
              <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex justify-between items-center text-[10px] text-slate-300 font-mono">
                <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-[#3DDC84]" /> Logcat System Feed</span>
                <span className="text-[8px] text-slate-500 font-mono">APP_LOGS</span>
              </div>
              <div className="h-[105px] overflow-y-auto p-2 font-mono text-[9px] leading-relaxed space-y-1">
                {logcat.length > 0 ? (
                  logcat.map((l, i) => {
                    const levelColors = {
                      'D': 'text-blue-400',
                      'I': 'text-[#3DDC84]',
                      'W': 'text-amber-400',
                      'E': 'text-rose-500'
                    };
                    return (
                      <div key={i} className="text-slate-300 hover:bg-slate-900/50 rounded px-1 flex gap-1.5 whitespace-pre-wrap">
                        <span className="text-slate-500 flex-shrink-0">{l.timestamp}</span>
                        <span className={`${levelColors[l.level]} font-bold flex-shrink-0`}>{l.level}/{l.tag}</span>
                        <span>{l.msg}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-600 italic text-center py-6">Log trace empty.</p>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* RIGHT COMPONENT: Production Android Java Code Vault & Architects Explanations (Col Span 7 on LG) */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col flex-1">
            
            {/* Header controls for Code Explorer */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#E2E8F0] gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#1A73E8]" /> Android Java Production Repository
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Copy optimized clean files for your Android Jetpack Room project folders.</p>
              </div>

              {/* Code index Search */}
              <div className="relative w-full sm:w-64 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter repository code..." 
                  value={codeSearch}
                  onChange={(e) => setCodeSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#F1F5F9] focus:bg-white text-xs border border-[#E2E8F0] focus:border-[#1A73E8] rounded-md outline-hidden text-[#334155] transition"
                />
              </div>
            </div>

            {/* Split layout inside Repo: side directory filetree, main code window */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4 flex-1">
              
              {/* Folder Trees (Col Span 4) */}
              <div className="md:col-span-4 bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0] overflow-y-auto max-h-[480px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Directory Main Tree</div>
                
                {/* Custom Nested Folders matching standard Android package conventions */}
                <div className="space-y-1.5 text-xs text-slate-700 font-mono">
                  
                  {/* Model Folder */}
                  <div>
                    <button 
                      onClick={() => toggleFolder('model')}
                      className="w-full flex items-center justify-between p-1 hover:bg-slate-200 rounded transition text-left"
                    >
                      <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        {isFolderOpen.model ? <FolderOpen className="w-4 h-4 text-amber-500" /> : <Folder className="w-4 h-4 text-amber-500" />}
                        model/
                      </span>
                    </button>
                    {isFolderOpen.model && (
                      <div className="pl-3.5 mt-1 space-y-0.5 border-l border-slate-200 ml-2">
                        {filteredFiles.filter(f => f.category === 'model').map(file => (
                          <button
                            key={file.name}
                            onClick={() => {
                              setSelectedFile(file);
                              addLog("DeveloperConsole", "I", `Viewing source file: ${file.path}`);
                            }}
                            className={`w-full flex items-center gap-1.5 py-1 px-2 rounded truncate transition text-left ${
                              selectedFile.name === file.name 
                                ? 'bg-[#E8F0FE] text-[#1A73E8] font-semibold border-l-2 border-[#1A73E8]' 
                                : 'hover:bg-slate-100 text-[#475569]'
                            }`}
                          >
                            <FileCode className="w-3.5 h-3.5 opacity-80" />
                            <span className="truncate">{file.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Database Folder */}
                  <div>
                    <button 
                      onClick={() => toggleFolder('database')}
                      className="w-full flex items-center justify-between p-1 hover:bg-slate-200 rounded transition text-left"
                    >
                      <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        {isFolderOpen.database ? <FolderOpen className="w-4 h-4 text-emerald-600" /> : <Folder className="w-4 h-4 text-emerald-600" />}
                        database/
                      </span>
                    </button>
                    {isFolderOpen.database && (
                      <div className="pl-3.5 mt-1 space-y-0.5 border-l border-slate-200 ml-2">
                        {filteredFiles.filter(f => f.category === 'database').map(file => (
                          <button
                            key={file.name}
                            onClick={() => {
                              setSelectedFile(file);
                              addLog("DeveloperConsole", "I", `Viewing source file: ${file.path}`);
                            }}
                            className={`w-full flex items-center gap-1.5 py-1 px-2 rounded truncate transition text-left ${
                              selectedFile.name === file.name 
                                ? 'bg-[#E8F0FE] text-[#1A73E8] font-semibold border-l-2 border-[#1A73E8]' 
                                : 'hover:bg-slate-100 text-[#475569]'
                            }`}
                          >
                            <FileCode className="w-3.5 h-3.5 opacity-80" />
                            <span className="truncate">{file.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Viewmodel Folder */}
                  <div>
                    <button 
                      onClick={() => toggleFolder('viewmodel')}
                      className="w-full flex items-center justify-between p-1 hover:bg-slate-200 rounded transition text-left"
                    >
                      <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        {isFolderOpen.viewmodel ? <FolderOpen className="w-4 h-4 text-[#1A73E8]" /> : <Folder className="w-4 h-4 text-[#1A73E8]" />}
                        viewmodel/
                      </span>
                    </button>
                    {isFolderOpen.viewmodel && (
                      <div className="pl-3.5 mt-1 space-y-0.5 border-l border-slate-200 ml-2">
                        {filteredFiles.filter(f => f.category === 'viewmodel').map(file => (
                          <button
                            key={file.name}
                            onClick={() => {
                              setSelectedFile(file);
                              addLog("DeveloperConsole", "I", `Viewing source file: ${file.path}`);
                            }}
                            className={`w-full flex items-center gap-1.5 py-1 px-2 rounded truncate transition text-left ${
                              selectedFile.name === file.name 
                                ? 'bg-[#E8F0FE] text-[#1A73E8] font-semibold border-l-2 border-[#1A73E8]' 
                                : 'hover:bg-slate-100 text-[#475569]'
                            }`}
                          >
                            <FileCode className="w-3.5 h-3.5 opacity-80" />
                            <span className="truncate">{file.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Adapter Folder */}
                  <div>
                    <button 
                      onClick={() => toggleFolder('adapter')}
                      className="w-full flex items-center justify-between p-1 hover:bg-slate-200 rounded transition text-left"
                    >
                      <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        {isFolderOpen.adapter ? <FolderOpen className="w-4 h-4 text-indigo-500" /> : <Folder className="w-4 h-4 text-indigo-500" />}
                        adapter/
                      </span>
                    </button>
                    {isFolderOpen.adapter && (
                      <div className="pl-3.5 mt-1 space-y-0.5 border-l border-slate-200 ml-2">
                        {filteredFiles.filter(f => f.category === 'adapter').map(file => (
                          <button
                            key={file.name}
                            onClick={() => {
                              setSelectedFile(file);
                              addLog("DeveloperConsole", "I", `Viewing source file: ${file.path}`);
                            }}
                            className={`w-full flex items-center gap-1.5 py-1 px-2 rounded truncate transition text-left ${
                              selectedFile.name === file.name 
                                ? 'bg-[#E8F0FE] text-[#1A73E8] font-semibold border-l-2 border-[#1A73E8]' 
                                : 'hover:bg-slate-100 text-[#475569]'
                            }`}
                          >
                            <FileCode className="w-3.5 h-3.5 opacity-80" />
                            <span className="truncate">{file.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Intent Folder */}
                  <div>
                    <button 
                      onClick={() => toggleFolder('intent')}
                      className="w-full flex items-center justify-between p-1 hover:bg-slate-200 rounded transition text-left"
                    >
                      <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        {isFolderOpen.intent ? <FolderOpen className="w-4 h-4 text-rose-500" /> : <Folder className="w-4 h-4 text-rose-500" />}
                        intent/
                      </span>
                    </button>
                    {isFolderOpen.intent && (
                      <div className="pl-3.5 mt-1 space-y-0.5 border-l border-slate-200 ml-2">
                        {filteredFiles.filter(f => f.category === 'intent').map(file => (
                          <button
                            key={file.name}
                            onClick={() => {
                              setSelectedFile(file);
                              addLog("DeveloperConsole", "I", `Viewing source file: ${file.path}`);
                            }}
                            className={`w-full flex items-center gap-1.5 py-1 px-2 rounded truncate transition text-left ${
                              selectedFile.name === file.name 
                                ? 'bg-[#E8F0FE] text-[#1A73E8] font-semibold border-l-2 border-[#1A73E8]' 
                                : 'hover:bg-slate-100 text-[#475569]'
                            }`}
                          >
                            <FileCode className="w-3.5 h-3.5 opacity-80" />
                            <span className="truncate">{file.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Glide Folder */}
                  <div>
                    <button 
                      onClick={() => toggleFolder('glide')}
                      className="w-full flex items-center justify-between p-1 hover:bg-slate-200 rounded transition text-left"
                    >
                      <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        {isFolderOpen.glide ? <FolderOpen className="w-4 h-4 text-purple-600" /> : <Folder className="w-4 h-4 text-purple-600" />}
                        glide/
                      </span>
                    </button>
                    {isFolderOpen.glide && (
                      <div className="pl-3.5 mt-1 space-y-0.5 border-l border-slate-200 ml-2">
                        {filteredFiles.filter(f => f.category === 'glide').map(file => (
                          <button
                            key={file.name}
                            onClick={() => {
                              setSelectedFile(file);
                              addLog("DeveloperConsole", "I", `Viewing source file: ${file.path}`);
                            }}
                            className={`w-full flex items-center gap-1.5 py-1 px-2 rounded truncate transition text-left ${
                              selectedFile.name === file.name 
                                ? 'bg-[#E8F0FE] text-[#1A73E8] font-semibold border-l-2 border-[#1A73E8]' 
                                : 'hover:bg-slate-100 text-[#475569]'
                            }`}
                          >
                            <FileCode className="w-3.5 h-3.5 opacity-80" />
                            <span className="truncate">{file.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Layout XML Folder */}
                  <div>
                    <button 
                      onClick={() => toggleFolder('layout')}
                      className="w-full flex items-center justify-between p-1 hover:bg-slate-200 rounded transition text-left"
                    >
                      <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        {isFolderOpen.layout ? <FolderOpen className="w-4 h-4 text-teal-600" /> : <Folder className="w-4 h-4 text-teal-600" />}
                        res/layout/
                      </span>
                    </button>
                    {isFolderOpen.layout && (
                      <div className="pl-3.5 mt-1 space-y-0.5 border-l border-slate-200 ml-2">
                        {filteredFiles.filter(f => f.category === 'layout').map(file => (
                          <button
                            key={file.name}
                            onClick={() => {
                              setSelectedFile(file);
                              addLog("DeveloperConsole", "I", `Viewing source file: ${file.path}`);
                            }}
                            className={`w-full flex items-center gap-1.5 py-1 px-2 rounded truncate transition text-left ${
                              selectedFile.name === file.name 
                                ? 'bg-[#E8F0FE] text-[#1A73E8] font-semibold border-l-2 border-[#1A73E8]' 
                                : 'hover:bg-slate-100 text-[#475569]'
                            }`}
                          >
                            <FileCode className="w-3.5 h-3.5 opacity-80" />
                            <span className="truncate">{file.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Code Viewer and highlighted panel (Col Span 8) */}
              <div className="md:col-span-8 flex flex-col bg-slate-900 rounded-lg border border-slate-800 overflow-hidden min-h-[400px]">
                
                {/* Code Window Header */}
                <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-300 font-mono tracking-wider truncate max-w-[200px]" title={`app/src/main/java/com/dukan/adambakkam/${selectedFile.path}`}>
                      src/main/.../{selectedFile.path}
                    </span>
                    <span className="bg-slate-800 text-[#3DDC84] text-[9px] uppercase font-bold px-1.5 py-0.5 rounded">
                      {selectedFile.language}
                    </span>
                  </div>
                  
                  {/* Copy Button */}
                  <button
                    id="btn-copy-code"
                    onClick={() => copyCode(selectedFile)}
                    className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-2.5 py-1 rounded transition select-none"
                  >
                    {copiedFile === selectedFile.name ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#3DDC84]" />
                        <span>Copy File</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Main Code Scroller */}
                <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-350 bg-slate-950 leading-relaxed max-h-[380px] scrollbar-thin">
                  <pre className="whitespace-pre">
                    <code>
                      {selectedFile.code.split('\n').map((line, idx) => {
                        // Custom markup simulation color accents on JVM code labels for professional look
                        let lineStyle = "text-slate-300";
                        if (line.includes("package") || line.includes("import ") || line.includes("@Entity") || line.includes("@PrimaryKey") || line.includes("@Query") || line.includes("@Dao")) {
                          lineStyle = "text-[#1A73E8] font-semibold";
                        } else if (line.trim().startsWith("//") || line.startsWith(" *") || line.startsWith("/**")) {
                          lineStyle = "text-slate-500 italic";
                        } else if (line.includes("public ") || line.includes("private ") || line.includes("class ") || line.includes("interface ")) {
                          lineStyle = "text-[#3DDC84]";
                        }
                        return (
                          <div key={idx} className="hover:bg-slate-900/40 px-1 rounded flex gap-4 min-w-fit">
                            <span className="text-slate-600 select-none w-6 text-right border-r border-slate-900 pr-1">{idx + 1}</span>
                            <span className={lineStyle}>{line}</span>
                          </div>
                        );
                      })}
                    </code>
                  </pre>
                </div>

                {/* File context info strip */}
                <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex gap-2.5 text-xs text-slate-400">
                  <Info className="w-4 h-4 text-[#1A73E8] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200">Architect Description:</span> {selectedFile.description}
                  </div>
                </div>

              </div>

            </div>

            {/* Architecture Insights deep dive bottom dashboard */}
            <div className="mt-5 bg-slate-50 border border-[#E2E8F0] rounded-lg p-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 mb-2.5">
                <Layers className="w-3.5 h-3.5 text-[#1A73E8]" /> High Performance Architecture Specifications
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
                
                {/* Specs Box 1 */}
                <div className="bg-white p-3.5 rounded-lg border border-[#E2E8F0] flex flex-col gap-1.5 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1A73E8]"></span>
                    Glide Low-RAM Adaptivity
                  </div>
                  <p className="text-[#64748B] leading-relaxed text-[11px]">
                    The custom <code>GlideConfiguration</code> intercepts device profiles at runtime. Under simulated low RAM, it scales down caches and changes decoded compression from ARGB_8888 down to RGB_565, preserving vital device resources.
                  </p>
                </div>

                {/* Specs Box 2 */}
                <div className="bg-white p-3.5 rounded-lg border border-[#E2E8F0] flex flex-col gap-1.5 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3DDC84]"></span>
                    Jetpack Room Database Cache
                  </div>
                  <p className="text-[#64748B] leading-relaxed text-[11px]">
                    Maintains fully indexed tables with foreign cascade key restraints linking categories to local vendors. Eliminates duplicate file allocations while supporting immediate offline cache lookup for pamphlet photos.
                  </p>
                </div>

                {/* Specs Box 3 */}
                <div className="bg-white p-3.5 rounded-lg border border-[#E2E8F0] flex flex-col gap-1.5 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3DDC84]"></span>
                    WhatsApp Intent Rerouter
                  </div>
                  <p className="text-[#64748B] leading-relaxed text-[11px]">
                    Robust dispatch checks both target packages: personal WhatsApp (<code>com.whatsapp</code>) or business (<code>com.whatsapp.w4b</code>). Falls back smoothly to secure web redirection so budget models never crash.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Elegant developer card footer */}
      <footer className="bg-[#0F172A] border-t border-slate-800 text-xs text-slate-400 py-6 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-400" />
            <span>Formulated for Android 15 &amp; backward compatible down to Android KitKat (API 19)</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Dukan Adambakkam Directory v1.0.0</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-300">Principal Architect Blueprint</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

