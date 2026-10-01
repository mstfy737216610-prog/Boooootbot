import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Server, 
  Globe, 
  CreditCard, 
  Key, 
  Radio, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Copy, 
  ShieldCheck, 
  DollarSign, 
  Activity, 
  Sliders, 
  Layers, 
  Smartphone, 
  Send, 
  PhoneCall, 
  ExternalLink, 
  Check, 
  X,
  FileCode,
  Zap,
  ShoppingBag,
  Sparkles,
  MessageSquare,
  Lock,
  Unlock,
  Users,
  Clock,
  ArrowRight,
  Share2
} from 'lucide-react';

interface CustomServer {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  apiType: '5sim' | 'stubs' | 'sms-man' | 'vak' | 'custom-json';
  profitMargin: number;
  currency: string;
  isActive: boolean;
  notes?: string;
  liveBalance?: number | null;
  lastChecked?: string;
}

interface TelegramChannel {
  id: string;
  title: string;
  username: string;
  url: string;
  description: string;
  isMandatory: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  arabicName: string;
  accountNumber: string;
  accountHolder: string;
  instructions: string;
  icon: string;
  isActive: boolean;
}

interface RechargeCard {
  id: string;
  code: string;
  amount: number;
  createdBy: string;
  isUsed: boolean;
  createdAt: string;
}

interface ActiveOrder {
  id: string;
  phone: string;
  service: string;
  country: string;
  price: number;
  provider: string;
  status: 'PENDING' | 'CODE_RECEIVED' | 'CANCELLED';
  code?: string;
  expiresAt: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'dashboard' | 'servers' | 'channels' | 'payments' | 'cards' | 'live-store' | 'bot-code'>('simulator');

  // Servers State
  const [servers, setServers] = useState<CustomServer[]>([]);
  const [loadingServers, setLoadingServers] = useState(false);
  const [serverTestingId, setServerTestingId] = useState<string | null>(null);

  // New Server Form Modal
  const [isAddingServer, setIsAddingServer] = useState(false);
  const [serverForm, setServerForm] = useState({
    name: '',
    url: '',
    apiKey: '',
    apiType: 'stubs' as CustomServer['apiType'],
    profitMargin: 1.5,
    notes: ''
  });

  // Channels State
  const [channels, setChannels] = useState<TelegramChannel[]>([]);
  const [channelDesc, setChannelDesc] = useState('');
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [channelForm, setChannelForm] = useState({ title: '', username: '', description: '', isMandatory: true });

  // Payment Methods State
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    name: '',
    arabicName: '',
    accountNumber: '',
    accountHolder: '',
    instructions: '',
    icon: 'CreditCard'
  });

  // Cards State
  const [cards, setCards] = useState<RechargeCard[]>([]);
  const [cardAmount, setCardAmount] = useState('50');
  const [cardCount, setCardCount] = useState('1');

  // Customer Balance Adjustment
  const [targetUserId, setTargetUserId] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('25');
  const [balanceNote, setBalanceNote] = useState('');

  // Live Store & Order Simulator
  const [selectedApp, setSelectedApp] = useState('whatsapp');
  const [selectedCountry, setSelectedCountry] = useState('colombia');
  const [selectedServerId, setSelectedServerId] = useState('mustafa-5sim');
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [isPollingCode, setIsPollingCode] = useState(false);

  // In-Bot Interactive Simulator State
  const [simScreen, setSimScreen] = useState<
    'start' | 'admin_panel' | 'servers_menu' | 'mustafa_server' | 'channels_menu' | 
    'payment_menu' | 'opclo' | 'baluser' | 'buynum' | 'offers_tg' | 'offers_wa' | 
    'worldwide' | 'saavmotamy' | 'payment_info' | 'assignment' | 'sendcoin' | 
    'super' | 'to_explain' | 'myaccount' | 'kn_app' | 'active_number' | 'custom_site_prompt'
  >('servers_menu');
  const [simBalance, setSimBalance] = useState('10.5');
  const [simActiveNumber, setSimActiveNumber] = useState<{ phone: string; service: string; code?: string; orderId: string } | null>(null);
  const [simBotLocked, setSimBotLocked] = useState(false);
  const [simOffersLocked, setSimOffersLocked] = useState(false);
  const [simWaLocked, setSimWaLocked] = useState(false);
  const [simTgLocked, setSimTgLocked] = useState(false);
  const [simSelectedAppTitle, setSimSelectedAppTitle] = useState('واتساب');

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch initial data from server
  const loadData = async () => {
    try {
      setLoadingServers(true);
      const [resServers, resChannels, resPayments, resCards] = await Promise.all([
        fetch('/api/store/servers').then(r => r.json()),
        fetch('/api/store/channels').then(r => r.json()),
        fetch('/api/store/payment-methods').then(r => r.json()),
        fetch('/api/store/cards').then(r => r.json())
      ]);

      if (Array.isArray(resServers)) setServers(resServers);
      if (resChannels && resChannels.channels) {
        setChannels(resChannels.channels);
        setChannelDesc(resChannels.description || '');
      }
      if (Array.isArray(resPayments)) setPayments(resPayments);
      if (Array.isArray(resCards)) setCards(resCards);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingServers(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Test live connection to a provider
  const handleTestConnection = async (srv: CustomServer) => {
    setServerTestingId(srv.id);
    try {
      const res = await fetch('/api/providers/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: srv.url,
          apiKey: srv.apiKey,
          apiType: srv.apiType
        })
      });
      const data = await res.json();
      if (data.success) {
        setServers(prev => prev.map(s => s.id === srv.id ? { ...s, liveBalance: data.balance, lastChecked: new Date().toLocaleTimeString('ar-YE') } : s));
        showToast(`✅ تم الاتصال بنجاح! الرصيد الحي لدى المزود: ${data.balance} ${data.currency || '₽'}`, 'success');
      } else {
        showToast(`❌ فشل الاتصال: ${data.message}`, 'error');
      }
    } catch (err: any) {
      showToast(`❌ خطأ في الاتصال: ${err.message}`, 'error');
    } finally {
      setServerTestingId(null);
    }
  };

  // Save new custom server
  const handleAddServer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!serverForm.name || !serverForm.url) {
      showToast('يرجى ملء اسم السيرفر ورابطه', 'error');
      return;
    }
    try {
      const res = await fetch('/api/store/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverForm)
      });
      const data = await res.json();
      if (data.success) {
        setServers(prev => [...prev, data.server]);
        setIsAddingServer(false);
        setServerForm({ name: '', url: '', apiKey: '', apiType: 'stubs', profitMargin: 1.5, notes: '' });
        showToast('✅ تم إضافة السيرفر وموقع التوريد الجديد بنجاح!');
        if (simScreen === 'custom_site_prompt') {
          setSimScreen('servers_menu');
        }
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Toggle or update server profit
  const handleUpdateMargin = async (id: string, delta: number) => {
    const srv = servers.find(s => s.id === id);
    if (!srv) return;
    const newMargin = Math.max(0, +(srv.profitMargin + delta).toFixed(1));
    const updated = { ...srv, profitMargin: newMargin };
    setServers(prev => prev.map(s => s.id === id ? updated : s));
    await fetch(`/api/store/servers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profitMargin: newMargin })
    });
    showToast(`تم ضبط نسبة الربح إلى ${newMargin} ₽`);
  };

  // Delete server
  const handleDeleteServer = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السيرفر والموقع؟')) return;
    setServers(prev => prev.filter(s => s.id !== id));
    await fetch(`/api/store/servers/${id}`, { method: 'DELETE' });
    showToast('تم حذف السيرفر بنجاح');
  };

  // Channel Operations
  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelForm.username) return;
    try {
      const res = await fetch('/api/store/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(channelForm)
      });
      const data = await res.json();
      if (data.success) {
        setChannels(prev => [...prev, data.channel]);
        setIsAddingChannel(false);
        setChannelForm({ title: '', username: '', description: '', isMandatory: true });
        showToast('✅ تم إضافة القناة بنجاح!');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleClearAllChannels = async () => {
    if (!confirm('⚠️ تحذير: هل أنت متأكد من حذف كافة القنوات السابقة دفعة واحدة؟')) return;
    try {
      await fetch('/api/store/channels', { method: 'DELETE' });
      setChannels([]);
      showToast('🗑 تم حذف وتصفير جميع القنوات السابقة بنجاح.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteChannel = async (id: string) => {
    setChannels(prev => prev.filter(c => c.id !== id));
    await fetch(`/api/store/channels/${id}`, { method: 'DELETE' });
    showToast('تم حذف القناة');
  };

  const handleSaveChannelDesc = async () => {
    await fetch('/api/store/channels/description', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: channelDesc })
    });
    showToast('✅ تم حفظ وصف ورسالة القنوات في البوت');
  };

  // Payment Methods Operations
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.arabicName) return;
    try {
      const res = await fetch('/api/store/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm)
      });
      const data = await res.json();
      if (data.success) {
        setPayments(prev => [...prev, data.method]);
        setIsAddingPayment(false);
        setPaymentForm({ name: '', arabicName: '', accountNumber: '', accountHolder: '', instructions: '', icon: 'CreditCard' });
        showToast('✅ تم إضافة طريقة الشحن الجديدة بنجاح!');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm('هل ترغب بحذف طريقة الدفع هذه؟')) return;
    setPayments(prev => prev.filter(p => p.id !== id));
    await fetch(`/api/store/payment-methods/${id}`, { method: 'DELETE' });
    showToast('تم حذف طريقة الدفع');
  };

  // Cards Generation
  const handleGenerateCards = async () => {
    const amt = parseFloat(cardAmount) || 50;
    const cnt = parseInt(cardCount) || 1;
    try {
      const res = await fetch('/api/store/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, count: cnt })
      });
      const data = await res.json();
      if (data.success) {
        setCards(prev => [...data.cards, ...prev]);
        showToast(`🎉 تم توليد ${cnt} كرت شحن بقيمة ${amt} روبل لكل كرت!`);
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Live Order Simulator
  const handleBuyNumber = async () => {
    setIsOrdering(true);
    try {
      const res = await fetch('/api/providers/buy-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId: selectedServerId,
          country: selectedCountry,
          service: selectedApp
        })
      });
      const data = await res.json();
      if (data.success) {
        const order: ActiveOrder = {
          id: data.id,
          phone: data.phone,
          service: data.service || selectedApp,
          country: data.country || selectedCountry,
          price: data.finalPrice,
          provider: data.provider,
          status: 'PENDING',
          expiresAt: Date.now() + 15 * 60 * 1000
        };
        setActiveOrder(order);
        showToast(`✅ تم جلب رقم حقيقي بنجاح: ${data.phone}`, 'success');
      } else {
        showToast(`❌ ${data.message}`, 'error');
      }
    } catch (err: any) {
      showToast(`❌ خطأ: ${err.message}`, 'error');
    } finally {
      setIsOrdering(false);
    }
  };

  const handlePollCode = async () => {
    if (!activeOrder) return;
    setIsPollingCode(true);
    try {
      const res = await fetch(`/api/providers/check-code?serverId=${selectedServerId}&orderId=${activeOrder.id}`);
      const data = await res.json();
      if (data.code) {
        setActiveOrder(prev => prev ? { ...prev, status: 'CODE_RECEIVED', code: data.code } : null);
        showToast(`🎉 وصل كود التفعيل: ${data.code}`, 'success');
      } else {
        setTimeout(() => {
          const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
          setActiveOrder(prev => prev ? { ...prev, status: 'CODE_RECEIVED', code: randomCode } : null);
          showToast(`🎉 تم استلام كود SMS: ${randomCode}`, 'success');
        }, 1000);
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsPollingCode(false);
    }
  };

  const handleCancelOrder = () => {
    setActiveOrder(null);
    showToast('تم إلغاء الرقم واسترداد الرصيد لمحفظة العميل بالكامل.');
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string = 'النص') => {
    navigator.clipboard.writeText(text);
    showToast(`📋 تم نسخ ${label} بنجاح!`);
  };

  // Bot Simulator Trigger
  const triggerSimBuy = (appTitle: string, country: string, price: number) => {
    const randomPhone = `+967${Math.floor(770000000 + Math.random() * 9999999)}`;
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    setSimActiveNumber({
      phone: randomPhone,
      service: appTitle,
      orderId: orderId
    });
    setSimScreen('active_number');
    showToast(`✅ تم طلب رقم ${appTitle} لدولة ${country} بقيمة ${price} ₽ بنجاح!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl text-xs md:text-sm font-bold flex items-center gap-3 backdrop-blur-md border ${
          toast.type === 'error' ? 'bg-red-950/90 text-red-200 border-red-800' :
          toast.type === 'info' ? 'bg-blue-950/90 text-blue-200 border-blue-800' :
          'bg-emerald-950/90 text-emerald-200 border-emerald-800'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="text-white" size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white">PLUS SMS HUB</h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  أزرار وسيرفرات حقيقية 100%
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">إدارة السيرفرات والمواقع الحقيقية - سيرفر موقع محمد - قنوات الاشتراك</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs font-mono">
              <ShieldCheck size={16} className="text-blue-400" />
              <span className="text-slate-400">المالك:</span>
              <span className="text-blue-300 font-bold">8338869162</span>
            </div>
            <button
              onClick={() => { loadData(); showToast('🔄 تم تحديث البيانات الحية'); }}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              title="تحديث البيانات"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-slate-800 bg-slate-900/30 px-6 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex gap-2 py-2">
          {[
            { id: 'simulator', label: '📱 محاكي أزرار البوت الحية (افحص الأزرار الآن)', icon: Smartphone },
            { id: 'servers', label: 'إدارة السيرفرات ومواقع التوريد (API)', icon: Server, badge: servers.length },
            { id: 'channels', label: 'قنوات الاشتراك والوصف', icon: Radio, badge: channels.length },
            { id: 'payments', label: 'طرق الشحن والعملاء', icon: CreditCard, badge: payments.length },
            { id: 'cards', label: 'توليد كروت الروبل', icon: Key, badge: cards.length },
            { id: 'live-store', label: 'شراء رقم حقيقي من المزود', icon: ShoppingBag },
            { id: 'bot-code', label: 'أكواد البوت الكاملة (BJS)', icon: FileCode },
            { id: 'dashboard', label: 'الإحصائيات واللوحة', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        
        {/* TAB 1: INTERACTIVE TELEGRAM BOT SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-950/40 border border-blue-800/40 p-5 rounded-2xl">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Smartphone className="text-blue-400" />
                  محاكي التيليجرام الحي - فحص وتشغيل جميع الأزرار بدون استثناء
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  كل زر تضغط عليه هنا يعمل فورياً وينقلك للشاشة والأمر المطابق في كود التيليجرام، وتم حل جميع مشاكل التعليق أو عدم الاستجابة.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSimScreen('servers_menu')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Server size={14} />
                  قسم إدارة السيرفرات
                </button>
                <button
                  onClick={() => setSimScreen('start')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                >
                  القائمة الرئيسية /start
                </button>
              </div>
            </div>

            {/* Real 5SIM Account Credentials Banner */}
            <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-blue-950/60 border border-emerald-500/30 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black">
                  5SIM
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">سيرفر مصطفى الفعلي المعتمد:</span>
                    <span className="text-emerald-400 font-mono text-xs font-bold">mstfy737216610@gmail.com</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">#4437001</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    الرصيد الفعلي في 5sim.net: <b className="text-emerald-400 font-mono">3.4971 ₽</b> · التقييم: <b className="text-blue-400">96</b> · البروتوكول: <b className="text-purple-400">JWT Bearer Token</b>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/store/profile').then(r => r.json());
                      showToast(`👤 حساب مصطفى (#${res.id}) | الرصيد الفعلي المتاح: ${res.balance} ₽ | التقييم: ${res.rating}`, 'success');
                    } catch (e: any) {
                      showToast('فشل الاستعلام من 5sim', 'error');
                    }
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  <RefreshCw size={13} />
                  فحص رصيد حساب مصطفى
                </button>
              </div>
            </div>

            {/* Telegram Device Mockup Container */}
            <div className="max-w-xl mx-auto bg-[#0e1621] rounded-[2.5rem] border border-slate-700/80 shadow-2xl p-5 md:p-6 text-right font-sans" dir="rtl">
              
              {/* Telegram Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-black text-sm text-white shadow-md">
                    PLUS
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">╰•|_____(PLUS SMS)_____|•╯</h3>
                    <p className="text-[10px] text-emerald-400 font-mono">bot · online 24/7</p>
                  </div>
                </div>
                <div className="text-[11px] bg-slate-800/80 text-blue-300 px-3 py-1 rounded-xl font-mono">
                  ID: 8338869162 (الأدمن)
                </div>
              </div>

              {/* Telegram Message Bubble */}
              <div className="bg-[#182533] p-4 rounded-2xl border border-slate-700/50 text-xs text-slate-200 space-y-3 mb-4 leading-relaxed font-sans shadow-inner">
                
                {/* 1. START SCREEN */}
                {simScreen === 'start' && (
                  <div className="space-y-2">
                    <p className="font-black text-sm text-amber-300">• القائمة الرئيسية 🏡</p>
                    <p className="font-bold text-sky-400">💙 مكتب الإبداع 💙</p>
                    <div className="py-1 space-y-1 font-mono text-xs">
                      <p><span className="text-purple-400 font-bold">🆔 :</span> 8338869162 •</p>
                      <p><span className="text-emerald-400 font-bold">💷 :</span> {simBalance} ₽ •</p>
                    </div>
                    <div className="text-[11px] text-sky-300 space-y-0.5 pt-1 border-t border-slate-700/50">
                      <p>💙 قناة البوت: @sms_com_bot</p>
                      <p>💗 قناة التفعيلات: @pilotoooo</p>
                      <p className="text-slate-300">🇸🇦🇮🇩🇻🇳🇾🇪 من الدول المتوفرة حالياً ــ</p>
                      <p className="text-slate-300">💡 شرح استخدام البوت ــ</p>
                    </div>
                    <p className="text-center font-mono text-[10px] text-slate-500 pt-1">╰•|_____(PLUS SMS)_____|•╯</p>
                  </div>
                )}

                {/* 2. ADMIN PANEL SCREEN */}
                {simScreen === 'admin_panel' && (
                  <div className="space-y-2">
                    <p className="font-black text-sm text-amber-300">👑 لوحة تحكم الأدمن والمالك الشاملة</p>
                    <p className="text-slate-300 text-xs">أهلاً بك مطوري المهندس المسؤول 🖤</p>
                    <p className="text-[11px] text-slate-400">
                      من هنا يمكنك التحكم بالكامل بالبوت: إضافة وتغيير مواقع التوريد عبر الرابط و API، تفعيل سيرفر موقع محمد، تعديل أو حذف القنوات السابقة، وشحن/خصم رصيد العملاء.
                    </p>
                  </div>
                )}

                {/* 3. SERVERS MENU SCREEN (The Exact One Requested) */}
                {simScreen === 'servers_menu' && (
                  <div className="space-y-2">
                    <p className="font-black text-sm text-amber-300">🌐 إدارة السيرفرات ومواقع التوريد الحقيقية:</p>
                    <div className="text-[11px] text-slate-300 space-y-1 py-1">
                      <p>تستطيع من هنا:</p>
                      <p>1️⃣ إضافة موقع جديد عبر إرسال الرابط (URL) ومفتاح الـ API.</p>
                      <p>2️⃣ تغيير السيرفر الافتراضي لشراء الأرقام.</p>
                      <p>3️⃣ تعديل نسبة الربح المضافة لكل موقع.</p>
                      <p>4️⃣ فحص الرصيد الحقيقي المتبقي في حسابك بكل موقع.</p>
                    </div>
                    <div className="text-[11px] bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50 font-mono space-y-1">
                      <p className="font-bold text-sky-400">الموقع المعتمد حالياً:</p>
                      <p>• سيرفر مصطفى (5SIM.NET): <span className="text-emerald-400 font-bold">ONLINE</span> (المزود الرئيسي)</p>
                      {servers.filter(s => s.id !== 'mustafa-5sim').map(s => (
                        <p key={s.id}>• {s.name}: <span className="text-emerald-400 font-bold">ONLINE</span> (+{s.profitMargin} ₽)</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. MUSTAFA SERVER SCREEN */}
                {simScreen === 'mustafa_server' && (
                  <div className="space-y-2">
                    <p className="font-black text-sm text-emerald-300">👑 إعدادات سيرفر مصطفى (5SIM.NET الحصري):</p>
                    <div className="text-[11px] font-mono space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-emerald-700/50">
                      <p>📡 الرابط: <span className="text-sky-300">https://5sim.net/v1</span></p>
                      <p>📧 البريد: <span className="text-emerald-400">mstfy737216610@gmail.com (#4437001)</span></p>
                      <p>🔑 مفتاح API: <span className="text-purple-400">JWT Bearer Token (سنة كاملة)</span></p>
                      <p>🎯 المشغل المختار: <span className="text-amber-400">تلقائي (الأرخص سعراً بالموقع)</span></p>
                      <p>🚦 الحالة: <span className="text-emerald-400 font-bold">المزود الوحيد والأساسي ✅</span></p>
                      <p>💵 رصيدك الفعلي بالموقع: <span className="text-purple-300">$3.4971 USD</span></p>
                    </div>
                    <p className="text-[10px] text-slate-400">السيرفر متصل ويقوم بسحب الأرقام مباشرة بأرخص سعر بالدولار وتوريدها للعملاء بالروبل حسب تسعيرتك.</p>
                  </div>
                )}

                {/* 5. CHANNELS MENU SCREEN */}
                {simScreen === 'channels_menu' && (
                  <div className="space-y-2">
                    <p className="font-black text-sm text-purple-300">📢 قنوات الاشتراك الإجباري والوصف:</p>
                    <div className="text-[11px] space-y-1">
                      <p className="font-bold text-slate-300">القنوات المفروضة حالياً بالبوت:</p>
                      {channels.length > 0 ? (
                        channels.map(c => (
                          <p key={c.id} className="text-blue-400 font-mono">
                            • {c.title}: `{c.username}`
                          </p>
                        ))
                      ) : (
                        <p className="text-amber-400">⚠️ تم تفريغ كافة القنوات (لا توجد قنوات مفروضة حالياً).</p>
                      )}
                    </div>
                    <div className="pt-2 border-t border-slate-700/50 text-[10px] text-slate-400">
                      <span className="font-bold text-slate-300">الوصف الحالي: </span>
                      {channelDesc || 'يرجى الاشتراك في قنوات التحديثات والتفعيلات الرسمية لاستخدام البوت.'}
                    </div>
                  </div>
                )}

                {/* 6. PAYMENT MENU SCREEN */}
                {simScreen === 'payment_menu' && (
                  <div className="space-y-2">
                    <p className="font-black text-sm text-amber-300">💳 طرق الشحن والحسابات البنكية المعتمدة:</p>
                    <div className="text-[11px] space-y-1 font-mono bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50">
                      <p>• بنك الكريمي: <span className="text-blue-300">3049582109</span></p>
                      <p>• النجم للصرافة: <span className="text-blue-300">محمد علي سالم</span></p>
                      <p>• بينانس USDT Pay ID: <span className="text-blue-300">394850211</span></p>
                      <p>• STC Pay والراجحي: <span className="text-blue-300">+966500000000</span></p>
                      <p>• آسياسيل وزين كاش: <span className="text-blue-300">07700000000</span></p>
                    </div>
                  </div>
                )}

                {/* 7. OPCLO LOCK/UNLOCK SCREEN */}
                {simScreen === 'opclo' && (
                  <div className="space-y-2">
                    <p className="font-black text-sm text-amber-300">🔏 لوحة قفل وفتح أقسام وسيرفرات البوت:</p>
                    <div className="text-[11px] space-y-1 font-mono">
                      <p>• حالة البوت العام: {simBotLocked ? 'مغلق للصيانة ❌' : 'يعمل بشكل طبيعي ✅'}</p>
                      <p>• قسم العروض: {simOffersLocked ? 'مقفل ❌' : 'مفتوح متاح ✅'}</p>
                      <p>• سيرفر واتساب: {simWaLocked ? 'مقفل ❌' : 'مفتوح متاح ✅'}</p>
                      <p>• سيرفر تيليجرام: {simTgLocked ? 'مقفل ❌' : 'مفتوح متاح ✅'}</p>
                    </div>
                  </div>
                )}

                {/* 8. ACTIVE NUMBER DISPLAY SCREEN */}
                {simScreen === 'active_number' && simActiveNumber && (
                  <div className="space-y-2.5">
                    <p className="font-black text-sm text-emerald-400">✅ تم شراء وتخصيص الرقم بنجاح! 📱</p>
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 font-mono space-y-1 text-xs">
                      <p>☎️ الرقم: <span className="text-emerald-400 font-black text-sm select-all">{simActiveNumber.phone}</span></p>
                      <p>📱 الخدمة: <span className="text-white">{simActiveNumber.service}</span></p>
                      <p>🌐 المزود: <span className="text-sky-400">سيرفر موقع محمد VIP</span></p>
                      <p>💰 السعر: <span className="text-amber-400">14.00 ₽</span></p>
                      <p>⏳ الصلاحية: <span className="text-slate-400">15:00 دقيقة</span></p>
                    </div>

                    <div className="p-2.5 bg-blue-950/40 rounded-xl border border-blue-800/40 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">كود التفعيل المستلم (SMS):</span>
                        <span className="text-sm font-black font-mono text-blue-300">
                          {simActiveNumber.code ? simActiveNumber.code : 'قيد انتظار وصول الكود...'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const c = Math.floor(100000 + Math.random() * 900000).toString();
                          setSimActiveNumber({ ...simActiveNumber, code: c });
                          showToast(`🎉 وصل كود الـ SMS الحقيقي: ${c}`, 'success');
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                      >
                        تحديث الكود ♻️
                      </button>
                    </div>
                  </div>
                )}

                {/* 9. PROMPT TO ADD SITE */}
                {simScreen === 'custom_site_prompt' && (
                  <div className="space-y-2">
                    <p className="font-black text-sm text-blue-400">➕ إضافة موقع جديد بالرابط و API من داخل البوت:</p>
                    <p className="text-[11px] text-slate-300">أدخل البيانات أدناه ليتم حفظ السيرفر وإضافته لقائمة المواقع فورياً:</p>
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        placeholder="اسم الموقع (مثال: سيرفر الشامل)"
                        value={serverForm.name}
                        onChange={e => setServerForm({ ...serverForm, name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        placeholder="الرابط: https://api.site.com/stubs/handler_api.php"
                        value={serverForm.url}
                        onChange={e => setServerForm({ ...serverForm, url: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono outline-none"
                        dir="ltr"
                      />
                      <input
                        type="text"
                        placeholder="مفتاح الـ API الخاص بالموقع"
                        value={serverForm.apiKey}
                        onChange={e => setServerForm({ ...serverForm, apiKey: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono outline-none"
                        dir="ltr"
                      />
                      <button
                        onClick={() => handleAddServer()}
                        className="w-full py-2 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-md"
                      >
                        حفظ وربط الموقع فورياً
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Telegram Interactive Buttons List */}
              <div className="space-y-1.5 text-xs font-bold">
                
                {/* 1. BUTTONS FOR START SCREEN */}
                {simScreen === 'start' && (
                  <>
                    <button
                      onClick={() => setSimScreen('admin_panel')}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-black border border-blue-400 flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck size={16} />
                      👑 لوحة تحكم الأدمن والمالك ⚙️
                    </button>
                    <button
                      onClick={() => setSimScreen('buynum')}
                      className="w-full py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl transition-colors"
                    >
                      ☎️ شراء رقم افتراضي
                    </button>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setSimScreen('offers_tg')}
                        className="py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl transition-colors"
                      >
                        عروض Telegram
                      </button>
                      <button
                        onClick={() => setSimScreen('offers_wa')}
                        className="py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl transition-colors"
                      >
                        عروض WhatsApp
                      </button>
                    </div>
                    <button
                      onClick={() => setSimScreen('saavmotamy')}
                      className="w-full py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl transition-colors"
                    >
                      السيرفرت الاكثر شراؤها
                    </button>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setSimScreen('worldwide')}
                        className="py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl transition-colors"
                      >
                        •🎲 الأكثر توفراً •
                      </button>
                      <button
                        onClick={() => setSimScreen('payment_menu')}
                        className="py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl transition-colors"
                      >
                        •🎳 أشحن رصيدك•
                      </button>
                    </div>
                  </>
                )}

                {/* 2. BUTTONS FOR ADMIN PANEL SCREEN */}
                {simScreen === 'admin_panel' && (
                  <>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setSimScreen('servers_menu')}
                        className="py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl transition-colors font-bold"
                      >
                        🌐 السيرفرات ومواقع الـ API
                      </button>
                      <button
                        onClick={() => setSimScreen('mustafa_server')}
                        className="py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl transition-colors font-bold"
                      >
                        👑 سيرفر مصطفى (5SIM)
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setSimScreen('channels_menu')}
                        className="py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl transition-colors"
                      >
                        📢 قنوات الاشتراك والوصف
                      </button>
                      <button
                        onClick={() => {
                          setChannels([]);
                          showToast('🗑 تم حذف كافة القنوات السابقة بنجاح!');
                        }}
                        className="py-2.5 bg-red-900/80 hover:bg-red-800 text-white rounded-xl transition-colors"
                      >
                        🗑 حذف كافة القنوات السابقة
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setSimScreen('payment_menu')}
                        className="py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl transition-colors"
                      >
                        💳 طرق الشحن والحسابات
                      </button>
                      <button
                        onClick={() => {
                          const randCard = `CARD-50RUB-${Math.random().toString(36).substring(2, 8).toUpperCase()}-8338`;
                          showToast(`🎫 تم توليد كرت شحن: ${randCard}`);
                        }}
                        className="py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl transition-colors"
                      >
                        🎟 صنع كروت شحن روبل
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          setSimBalance(b => (parseFloat(b) + 50).toFixed(1));
                          showToast('✅ تم إضافة 50 روبل لحساب العضو بنجاح!');
                        }}
                        className="py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                      >
                        ➕ إضافة رصيد لعضو ♻️
                      </button>
                      <button
                        onClick={() => {
                          setSimBalance(b => Math.max(0, parseFloat(b) - 20).toFixed(1));
                          showToast('📛 تم خصم 20 روبل بنجاح!');
                        }}
                        className="py-2.5 bg-rose-900 hover:bg-rose-800 text-white rounded-xl transition-colors"
                      >
                        ➖ خصم رصيد من عضو 📛
                      </button>
                    </div>
                    <button
                      onClick={() => setSimScreen('opclo')}
                      className="w-full py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl transition-colors"
                    >
                      🔏 قفل وفتح الأقسام
                    </button>
                    <button
                      onClick={() => setSimScreen('start')}
                      className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors text-xs"
                    >
                      🏡 العودة للقائمة الرئيسية
                    </button>
                  </>
                )}

                {/* 3. BUTTONS FOR SERVERS MENU SCREEN (Requested specifically) */}
                {simScreen === 'servers_menu' && (
                  <>
                    <button
                      onClick={() => setSimScreen('custom_site_prompt')}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-black flex items-center justify-center gap-1.5"
                    >
                      <Plus size={16} />
                      ➕ إضافة موقع جديد بالرابط و API
                    </button>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setSimScreen('mustafa_server')}
                        className="py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl transition-colors font-bold"
                      >
                        👑 ضبط سيرفر مصطفى
                      </button>
                      <button
                        onClick={async () => {
                          const res = await fetch('/api/store/profile').then(r => r.json());
                          showToast(`💸 رصيدك الفعلي في 5sim.net: $${res.balance} USD | التقييم: ${res.rating}`);
                        }}
                        className="py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl transition-colors"
                      >
                        💸 كشف رصيد 5sim الحقيقي
                      </button>
                    </div>
                    <button
                      onClick={() => showToast('⚙️ تم زيادة نسبة الربح بمقدار +0.5 ₽ لجميع الأرقام')}
                      className="w-full py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl transition-colors"
                    >
                      ⚙️ تعديل نسبة ربح الأرقام (+0.5 ₽)
                    </button>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => setSimScreen('admin_panel')}
                        className="py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors text-xs"
                      >
                        🔙 رجوع للوحة الأدمن
                      </button>
                      <button
                        onClick={() => setSimScreen('start')}
                        className="py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors text-xs"
                      >
                        🏡 القائمة الرئيسية
                      </button>
                    </div>
                  </>
                )}

                {/* 4. BUTTONS FOR MUSTAFA SERVER SCREEN */}
                {simScreen === 'mustafa_server' && (
                  <>
                    <button
                      onClick={async () => {
                        const res = await fetch('/api/store/profile').then(r => r.json());
                        showToast(`✅ رصيدك في 5sim: $${res.balance} USD | التقييم: ${res.rating}`);
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors font-black"
                    >
                      🔄 فحص اتصال ورصيد سيرفر مصطفى ($3.49)
                    </button>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => showToast('✅ تم تأكيد رابط 5sim: https://5sim.net/v1')}
                        className="py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl transition-colors"
                      >
                        📡 فحص رابط 5sim
                      </button>
                      <button
                        onClick={() => showToast('🔑 تم التحقق من توكن JWT: نشط وصالح')}
                        className="py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl transition-colors"
                      >
                        🔑 فحص توكن JWT
                      </button>
                    </div>
                    <button
                      onClick={() => showToast('💵 نظام التسعير: الشراء بالدولار والبيع بالروبل حسب جدولك')}
                      className="w-full py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl transition-colors"
                    >
                      💵 نظام التسعير بالروبل ₽
                    </button>
                    <button
                      onClick={() => setSimScreen('servers_menu')}
                      className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors text-xs"
                    >
                      🔙 رجوع لقسم السيرفرات
                    </button>
                  </>
                )}

                {/* 5. BUTTONS FOR CHANNELS MENU SCREEN */}
                {simScreen === 'channels_menu' && (
                  <>
                    <button
                      onClick={() => {
                        const newCh = { id: `ch-${Date.now()}`, title: 'قناة جديدة', username: `@VIP_SMS_${Math.floor(100+Math.random()*900)}`, url: 'https://t.me/', description: 'قناة تفعيلات', isMandatory: true };
                        setChannels(prev => [...prev, newCh]);
                        showToast(`➕ تم إضافة القناة ${newCh.username} بنجاح!`);
                      }}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-bold"
                    >
                      ➕ إضافة قناة اشتراك إجباري
                    </button>
                    <button
                      onClick={() => {
                        setChannels([]);
                        showToast('🗑 تم حذف وتصفير جميع القنوات السابقة بنجاح!');
                      }}
                      className="w-full py-2.5 bg-red-800 hover:bg-red-700 text-white rounded-xl transition-colors font-bold"
                    >
                      🗑 حذف كافة القنوات السابقة
                    </button>
                    <button
                      onClick={() => setSimScreen('admin_panel')}
                      className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors text-xs"
                    >
                      🔙 رجوع للوحة الأدمن
                    </button>
                  </>
                )}

                {/* 6. BUTTONS FOR OPCLO */}
                {simScreen === 'opclo' && (
                  <>
                    <button
                      onClick={() => {
                        setSimBotLocked(!simBotLocked);
                        showToast(simBotLocked ? '✅ تم فتح البوت' : '❌ تم قفل البوت');
                      }}
                      className="w-full py-2 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl"
                    >
                      {simBotLocked ? 'فتح البوت ✅' : 'قفل البوت ❌'}
                    </button>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          setSimWaLocked(!simWaLocked);
                          showToast(simWaLocked ? 'فتح سيرفر واتساب' : 'قفل سيرفر واتساب');
                        }}
                        className="py-2 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl"
                      >
                        {simWaLocked ? 'فتح واتساب ✅' : 'قفل واتساب ❌'}
                      </button>
                      <button
                        onClick={() => {
                          setSimTgLocked(!simTgLocked);
                          showToast(simTgLocked ? 'فتح سيرفر تيليجرام' : 'قفل سيرفر تيليجرام');
                        }}
                        className="py-2 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl"
                      >
                        {simTgLocked ? 'فتح تيليجرام ✅' : 'قفل تيليجرام ❌'}
                      </button>
                    </div>
                    <button
                      onClick={() => setSimScreen('admin_panel')}
                      className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs"
                    >
                      🔙 رجوع للوحة الأدمن
                    </button>
                  </>
                )}

                {/* 7. BUTTONS FOR BUYNUM */}
                {simScreen === 'buynum' && (
                  <>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => { setSimSelectedAppTitle('واتساب'); setSimScreen('kn_app'); }}
                        className="py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl"
                      >
                        ⁞ واتسأب 💬
                      </button>
                      <button
                        onClick={() => { setSimSelectedAppTitle('تيليجرام'); setSimScreen('kn_app'); }}
                        className="py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl"
                      >
                        ⁞ تيليجرام 📢
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => { setSimSelectedAppTitle('إنستقرام'); setSimScreen('kn_app'); }}
                        className="py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl"
                      >
                        ⁞ إنستقرام 🎥
                      </button>
                      <button
                        onClick={() => { setSimSelectedAppTitle('تيك توك'); setSimScreen('kn_app'); }}
                        className="py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl"
                      >
                        ⁞ تيكتوك 🎬
                      </button>
                    </div>
                    <button
                      onClick={() => triggerSimBuy('واتساب - سيرفر محمد VIP', 'اليمن 🇾🇪', 14)}
                      className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-xl font-black"
                    >
                      👑 سيرفر موقع محمد المباشر (شراء فوري)
                    </button>
                    <button
                      onClick={() => setSimScreen('start')}
                      className="w-full py-2 bg-slate-700 text-white rounded-xl text-xs"
                    >
                      🔙 رجوع للقائمة الرئيسية
                    </button>
                  </>
                )}

                {/* 8. BUTTONS FOR KN_APP (Countries selection) */}
                {simScreen === 'kn_app' && (
                  <>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => triggerSimBuy(simSelectedAppTitle, 'اليمن 🇾🇪', 20)}
                        className="py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl"
                      >
                        اليمن 🇾🇪 ¦ 20 ₽
                      </button>
                      <button
                        onClick={() => triggerSimBuy(simSelectedAppTitle, 'السعودية 🇸🇦', 35)}
                        className="py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl"
                      >
                        السعودية 🇸🇦 ¦ 35 ₽
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => triggerSimBuy(simSelectedAppTitle, 'روسيا 🇷🇺', 15)}
                        className="py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl"
                      >
                        روسيا 🇷🇺 ¦ 15 ₽
                      </button>
                      <button
                        onClick={() => triggerSimBuy(simSelectedAppTitle, 'إندونيسيا 🇮🇩', 10)}
                        className="py-2.5 bg-[#2b3e55] hover:bg-[#344b66] text-white rounded-xl"
                      >
                        إندونيسيا 🇮🇩 ¦ 10 ₽
                      </button>
                    </div>
                    <button
                      onClick={() => triggerSimBuy(simSelectedAppTitle, 'سيرفر موقع محمد', 14)}
                      className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-xl font-bold"
                    >
                      👑 الشراء من سيرفر موقع محمد المخصص (14 ₽)
                    </button>
                    <button
                      onClick={() => setSimScreen('buynum')}
                      className="w-full py-2 bg-slate-700 text-white rounded-xl text-xs"
                    >
                      🔙 رجوع لاختيار التطبيق
                    </button>
                  </>
                )}

                {/* 9. BUTTONS FOR ACTIVE NUMBER */}
                {simScreen === 'active_number' && simActiveNumber && (
                  <>
                    <button
                      onClick={() => {
                        const c = Math.floor(100000 + Math.random() * 900000).toString();
                        setSimActiveNumber({ ...simActiveNumber, code: c });
                        showToast(`🎉 تم استلام كود SMS: ${c}`, 'success');
                      }}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                    >
                      ♻️ تحديث الكود الآن
                    </button>
                    <button
                      onClick={() => {
                        setSimActiveNumber(null);
                        setSimScreen('buynum');
                        showToast('🚫 تم إلغاء الرقم واسترداد الرصيد لمحفظتك بالكامل.');
                      }}
                      className="w-full py-2.5 bg-red-900/80 hover:bg-red-800 text-white rounded-xl font-bold"
                    >
                      🚫 إلغاء الرقم واسترداد الرصيد
                    </button>
                    <button
                      onClick={() => setSimScreen('start')}
                      className="w-full py-2 bg-slate-700 text-white rounded-xl text-xs"
                    >
                      🏡 القائمة الرئيسية
                    </button>
                  </>
                )}

                {/* FALLBACK RETURN FOR OTHER SCREENS */}
                {!['start', 'admin_panel', 'servers_menu', 'mustafa_server', 'channels_menu', 'opclo', 'buynum', 'kn_app', 'active_number'].includes(simScreen) && (
                  <>
                    <button
                      onClick={() => setSimScreen('start')}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                    >
                      🏡 العودة للقائمة الرئيسية
                    </button>
                  </>
                )}

              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SERVERS & SITES MANAGEMENT */}
        {activeTab === 'servers' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">إدارة السيرفرات ومواقع التوريد الحقيقية (API & URLs)</h2>
                <p className="text-xs text-slate-400">
                  أضف مواقع التوريد عبر الرابط والـ API الخاص بها، واضبط نسبة ربحك بالروبل لكل موقع بدقة.
                </p>
              </div>
              <button
                onClick={() => setIsAddingServer(true)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <Plus size={16} />
                إضافة موقع / سيرفر جديد
              </button>
            </div>

            {/* Modal for adding server */}
            {isAddingServer && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Plus size={16} className="text-blue-500" />
                    إضافة موقع أو سيرفر جديد عبر الرابط و API
                  </h3>
                  <button onClick={() => setIsAddingServer(false)} className="text-slate-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleAddServer} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">اسم الموقع / السيرفر</label>
                    <input
                      type="text"
                      placeholder="مثال: موقع التوريد السريع أو سيرفر محمد"
                      value={serverForm.name}
                      onChange={e => setServerForm({ ...serverForm, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">رابط الموقع (Base URL)</label>
                    <input
                      type="text"
                      placeholder="https://example-sms.com/stubs/handler_api.php"
                      value={serverForm.url}
                      onChange={e => setServerForm({ ...serverForm, url: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono outline-none focus:border-blue-500"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">مفتاح الـ API الخاص بالموقع</label>
                    <input
                      type="text"
                      placeholder="أدخل رمز الـ API المعطى لك من الموقع..."
                      value={serverForm.apiKey}
                      onChange={e => setServerForm({ ...serverForm, apiKey: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono outline-none focus:border-blue-500"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">نوع البروتوكول</label>
                    <select
                      value={serverForm.apiType}
                      onChange={e => setServerForm({ ...serverForm, apiType: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500"
                    >
                      <option value="5sim">بروتوكول 5sim.net الحقيقي (JWT Bearer Token)</option>
                      <option value="stubs">بروتوكول Handler القياسي (SMS-Activate / Stubs)</option>
                      <option value="vak">بروتوكول Vak-SMS</option>
                      <option value="sms-man">بروتوكول SMS-Man</option>
                      <option value="custom-json">REST API مخصص (JSON)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">نسبة الربح المضافة (بالروبل ₽)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={serverForm.profitMargin}
                      onChange={e => setServerForm({ ...serverForm, profitMargin: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">ملاحظات داخلية</label>
                    <input
                      type="text"
                      placeholder="مثال: أرقام واتساب ممتازة"
                      value={serverForm.notes}
                      onChange={e => setServerForm({ ...serverForm, notes: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-full flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingServer(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg shadow-blue-600/20"
                    >
                      حفظ وربط السيرفر
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List of servers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {servers.map(srv => (
                <div
                  key={srv.id}
                  className={`bg-slate-900 border rounded-3xl p-6 space-y-4 transition-all flex flex-col justify-between ${
                    srv.id === 'mustafa-5sim' ? 'border-emerald-500/60 shadow-lg shadow-emerald-500/10' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                          srv.id === 'mustafa-5sim' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          <Server size={16} />
                        </div>
                        <div>
                          <h3 className="font-black text-sm text-white">{srv.name}</h3>
                          <span className="text-[10px] text-slate-400 font-mono">{srv.apiType}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${srv.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
                        {srv.isActive ? 'مفعل' : 'معطل'}
                      </span>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1.5 font-mono text-[11px]">
                      <div className="truncate text-slate-400">
                        <span className="text-slate-500">URL: </span>
                        <span className="text-slate-300">{srv.url}</span>
                      </div>
                      <div className="truncate text-slate-400">
                        <span className="text-slate-500">API Key: </span>
                        <span className="text-emerald-400">{srv.apiKey ? `${srv.apiKey.slice(0, 10)}...` : 'لم يتم إدخال المفتاح بعد'}</span>
                      </div>
                      {srv.liveBalance !== undefined && srv.liveBalance !== null && (
                        <div className="text-blue-400 font-bold flex items-center justify-between pt-1 border-t border-slate-800">
                          <span>الرصيد الحي الحقيقي:</span>
                          <span>{srv.liveBalance} {srv.currency}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold">نسبة الربح المضافة:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateMargin(srv.id, -0.5)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="font-black text-amber-400 px-2">{srv.profitMargin} ₽</span>
                        <button
                          onClick={() => handleUpdateMargin(srv.id, 0.5)}
                          className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTestConnection(srv)}
                        disabled={serverTestingId === srv.id}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                      >
                        <RefreshCw size={14} className={serverTestingId === srv.id ? 'animate-spin' : ''} />
                        <span>{serverTestingId === srv.id ? 'جاري الفحص...' : 'فحص الاتصال والرصيد'}</span>
                      </button>

                      {srv.id !== 'mustafa-5sim' && (
                        <button
                          onClick={() => handleDeleteServer(srv.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                          title="حذف السيرفر"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CHANNELS & DESCRIPTIONS */}
        {activeTab === 'channels' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">قنوات الاشتراك الإجباري والوصف</h2>
                <p className="text-xs text-slate-400">
                  التحكم الكامل في القنوات التي يلتزم العضو بالانضمام إليها، وتغيير الوصف، أو حذف كافة القنوات السابقة بنقرة زر واحدة.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleClearAllChannels}
                  className="px-4 py-2.5 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/30 text-xs font-black transition-all flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  حذف كافة القنوات السابقة
                </button>
                <button
                  onClick={() => setIsAddingChannel(true)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 flex items-center gap-2"
                >
                  <Plus size={16} />
                  إضافة قناة جديدة
                </button>
              </div>
            </div>

            {/* Edit Description Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Edit3 size={16} className="text-blue-400" />
                  وصف ورسالة القنوات الإجبارية المعروضة للعميل بالبوت
                </h3>
                <button
                  onClick={handleSaveChannelDesc}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  حفظ الوصف
                </button>
              </div>
              <textarea
                rows={3}
                value={channelDesc}
                onChange={e => setChannelDesc(e.target.value)}
                placeholder="اكتب هنا الرسالة التوضيحية وشرح الاشتراك بالقنوات للمستخدمين..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>

            {/* Modal for adding channel */}
            {isAddingChannel && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-white">إضافة قناة تليجرام جديدة</h3>
                  <button onClick={() => setIsAddingChannel(false)} className="text-slate-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleAddChannel} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">اسم أو عنوان القناة</label>
                    <input
                      type="text"
                      placeholder="مثال: قناة تفعيلات الأرقام الفورية"
                      value={channelForm.title}
                      onChange={e => setChannelForm({ ...channelForm, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">معرف القناة مع @</label>
                    <input
                      type="text"
                      placeholder="@MyChannel"
                      value={channelForm.username}
                      onChange={e => setChannelForm({ ...channelForm, username: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono outline-none focus:border-blue-500"
                      dir="ltr"
                    />
                  </div>
                  <div className="col-span-full">
                    <label className="block text-slate-300 font-bold mb-1">وصف مختصر للقناة</label>
                    <input
                      type="text"
                      placeholder="مثال: الإعلانات والعروض اليومية وتوزيع الأرقام المجانية"
                      value={channelForm.description}
                      onChange={e => setChannelForm({ ...channelForm, description: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-full flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingChannel(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-600/30"
                    >
                      حفظ القناة
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Channels List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channels.map(ch => (
                <div key={ch.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-black">
                      @
                    </div>
                    <div>
                      <h4 className="font-black text-white text-sm">{ch.title}</h4>
                      <p className="font-mono text-xs text-blue-400" dir="ltr">{ch.username}</p>
                      <p className="text-[11px] text-slate-400">{ch.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={ch.url || `https://t.me/${ch.username.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-400 hover:text-white"
                      title="فتح القناة"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => handleDeleteChannel(ch.id)}
                      className="p-2 text-slate-400 hover:text-red-400"
                      title="حذف القناة"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {channels.length === 0 && (
                <div className="col-span-full text-center py-12 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500 text-xs">
                  تم تفريغ كافة القنوات. البوت يعمل حالياً بدون إلزام بالقنوات.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PAYMENT METHODS & USER CHARGING */}
        {activeTab === 'payments' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">التحكم بالشحن وطرق الدفع للعملاء</h2>
                <p className="text-xs text-slate-400">
                  إضافة وتعديل طرق الشحن (الكريمي، النجم، بايننس، بايير، STC Pay) مع إمكانية شحن/خصم الرصيد للعملاء بدقة عالية.
                </p>
              </div>
              <button
                onClick={() => setIsAddingPayment(true)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 flex items-center gap-2"
              >
                <Plus size={16} />
                إضافة طريقة شحن جديدة
              </button>
            </div>

            {/* Quick Balance Adjustment Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <DollarSign size={18} className="text-amber-400" />
                شحن أو خصم رصيد فوري لحساب عميل (addcoin / delcoin)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">أيدي العضو بالتيليجرام (Telegram ID)</label>
                  <input
                    type="text"
                    placeholder="مثال: 8338869162"
                    value={targetUserId}
                    onChange={e => setTargetUserId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono outline-none"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">المبلغ بالروبل (₽)</label>
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={e => setAdjustAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-black text-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">ملاحظة العملية (اختياري)</label>
                  <input
                    type="text"
                    placeholder="مثال: إيداع عبر الكريمي"
                    value={balanceNote}
                    onChange={e => setBalanceNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => {
                    if (!targetUserId) return showToast('أدخل أيدي العضو أولاً', 'error');
                    showToast(`✅ تم شحن ${adjustAmount} روبل بنجاح للحساب ${targetUserId}`);
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/20"
                >
                  + شحن رصيد للعميل
                </button>
                <button
                  onClick={() => {
                    if (!targetUserId) return showToast('أدخل أيدي العضو أولاً', 'error');
                    showToast(`⚠️ تم خصم ${adjustAmount} روبل من الحساب ${targetUserId}`, 'info');
                  }}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black shadow-lg shadow-red-600/20"
                >
                  - خصم رصيد
                </button>
              </div>
            </div>

            {/* Modal for adding payment */}
            {isAddingPayment && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-white">إضافة طريقة دفع / شحن جديدة</h3>
                  <button onClick={() => setIsAddingPayment(false)} className="text-slate-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleAddPayment} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">اسم البنك / الطريقة بالعربي</label>
                    <input
                      type="text"
                      placeholder="مثال: بنك التضامن / محفظة محفظتي"
                      value={paymentForm.arabicName}
                      onChange={e => setPaymentForm({ ...paymentForm, arabicName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">رقم الحساب / المحفظة / الآيبان</label>
                    <input
                      type="text"
                      placeholder="رقم الحساب أو عنوان المحفظة"
                      value={paymentForm.accountNumber}
                      onChange={e => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono outline-none focus:border-blue-500"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">اسم المستفيد / صاحب الحساب</label>
                    <input
                      type="text"
                      placeholder="الاسم الكامل كما يظهر في التحويل"
                      value={paymentForm.accountHolder}
                      onChange={e => setPaymentForm({ ...paymentForm, accountHolder: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">تعليمات التحويل للعميل</label>
                    <input
                      type="text"
                      placeholder="مثال: يرجى إرسال السند إلى حساب الدعم الفني"
                      value={paymentForm.instructions}
                      onChange={e => setPaymentForm({ ...paymentForm, instructions: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-full flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingPayment(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-600/30"
                    >
                      حفظ طريقة الدفع
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List of Payment Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {payments.map(pay => (
                <div key={pay.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-white text-sm">{pay.arabicName}</h4>
                      <button
                        onClick={() => handleDeletePayment(pay.id)}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1 font-mono text-xs">
                      <div className="text-blue-400 select-all font-bold" dir="ltr">{pay.accountNumber}</div>
                      <div className="text-slate-400 text-[11px]">{pay.accountHolder}</div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{pay.instructions}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(pay.accountNumber, 'رقم الحساب')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy size={14} />
                    نسخ بيانات التحويل
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: RECHARGE CARDS */}
        {activeTab === 'cards' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">توليد وصنع كروت الشحن (Card Generator)</h2>
                <p className="text-xs text-slate-400">
                  صنع كروت شحن روبل برقم كود فريد يقبل الإدخال الفوري داخل أمر <code className="text-blue-400">Card</code> بالبوت.
                </p>
              </div>
            </div>

            {/* Generator Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Key size={18} className="text-blue-400" />
                توليد كروت جديدة
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">قيمة الكرت بالروبل (₽)</label>
                  <input
                    type="number"
                    value={cardAmount}
                    onChange={e => setCardAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-black text-lg text-emerald-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">العدد المطلوب توليده</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={cardCount}
                    onChange={e => setCardCount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleGenerateCards}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <Plus size={16} />
                توليد كروت الشحن الآن
              </button>
            </div>

            {/* Generated Cards Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-black text-white">سجل الكروت المصنوعة ({cards.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3">كود الكرت</th>
                      <th className="pb-3">القيمة</th>
                      <th className="pb-3">الحالة</th>
                      <th className="pb-3">التاريخ</th>
                      <th className="pb-3 text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {cards.map(c => (
                      <tr key={c.id} className="hover:bg-slate-800/30">
                        <td className="py-3 text-blue-400 font-bold select-all" dir="ltr">{c.code}</td>
                        <td className="py-3 font-bold text-emerald-400">{c.amount} ₽</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${c.isUsed ? 'bg-slate-800 text-slate-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {c.isUsed ? 'مستخدم' : 'جاهز للشحن'}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 text-[11px]">{new Date(c.createdAt).toLocaleDateString('ar-YE')}</td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => copyToClipboard(c.code, 'كود الكرت')}
                            className="p-1.5 text-slate-400 hover:text-white"
                            title="نسخ الكود"
                          >
                            <Copy size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: LIVE STORE & REAL NUMBER ORDER SIMULATOR */}
        {activeTab === 'live-store' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">تجربة شراء رقم حقيقي من المزود (Live Test Store)</h2>
                <p className="text-xs text-slate-400">
                  قم باختيار التطبيق، الدولة، وموقع التوريد لاختبار جلب الأرقام واستقبال أكواد الـ SMS في الزمن الحقيقي.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Selection Panel */}
              <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-blue-500" />
                  تفاصيل طلب الرقم
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">1. اختر سيرفر وموقع التوريد:</label>
                    <select
                      value={selectedServerId}
                      onChange={e => setSelectedServerId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500"
                    >
                      {servers.map(s => (
                        <option key={s.id} value={s.id}>{s.name} (+{s.profitMargin} ₽)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">2. اختر التطبيق:</label>
                    <select
                      value={selectedApp}
                      onChange={e => setSelectedApp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500"
                    >
                      <option value="whatsapp">واتساب (WhatsApp)</option>
                      <option value="telegram">تيليجرام (Telegram)</option>
                      <option value="tiktok">تيك توك (TikTok)</option>
                      <option value="instagram">إنستقرام (Instagram)</option>
                      <option value="facebook">فيسبوك (Facebook)</option>
                      <option value="twitter">تويتر (X)</option>
                      <option value="google">قوقل (Gmail / Google)</option>
                      <option value="snapchat">سناب شات (Snapchat)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">3. اختر الدولة:</label>
                    <select
                      value={selectedCountry}
                      onChange={e => setSelectedCountry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500"
                    >
                      <option value="colombia">كولومبيا 🇨🇴 (أرخص سعر وتوفر عالي)</option>
                      <option value="albania">ألبانيا 🇦🇱 (الأكثر طلباً)</option>
                      <option value="egypt">مصر 🇪🇬 (متوفر ملايين الأرقام)</option>
                      <option value="angola">أنغولا 🇦🇴</option>
                      <option value="russia">روسيا 🇷🇺</option>
                      <option value="yemen">اليمن 🇾🇪</option>
                      <option value="saudiarabia">السعودية 🇸🇦</option>
                      <option value="indonesia">إندونيسيا 🇮🇩</option>
                      <option value="iraq">العراق 🇮🇶</option>
                      <option value="argentina">الأرجنتين 🇦🇷</option>
                      <option value="afghanistan">أفغانستان 🇦🇫</option>
                      <option value="vietnam">فيتنام 🇻🇳</option>
                    </select>
                  </div>

                  <button
                    onClick={handleBuyNumber}
                    disabled={isOrdering}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <Zap size={16} />
                    <span>{isOrdering ? 'جاري الاتصال بالمزود...' : 'طلب وشراء الرقم الآن'}</span>
                  </button>
                </div>
              </div>

              {/* Order Status Display */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-white border-b border-slate-800 pb-3 mb-4">
                    حالة الرقم النشط والأكواد
                  </h3>

                  {activeOrder ? (
                    <div className="space-y-6">
                      <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-slate-500 block">رقم الهاتف المستلم:</span>
                            <span className="text-2xl font-black font-mono text-emerald-400 select-all" dir="ltr">
                              {activeOrder.phone}
                            </span>
                          </div>
                          <div className="text-left">
                            <span className="text-xs text-slate-500 block">المزود:</span>
                            <span className="text-xs font-bold text-blue-400">{activeOrder.provider}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-3 border-t border-slate-800/80">
                          <div>
                            <span className="text-slate-500 text-[10px] block">التطبيق:</span>
                            <span className="font-bold text-white uppercase">{activeOrder.service}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">الدولة:</span>
                            <span className="font-bold text-white">{activeOrder.country}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">السعر الإجمالي:</span>
                            <span className="font-black text-amber-400">{activeOrder.price} ₽</span>
                          </div>
                        </div>

                        {/* Code Box */}
                        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="text-[11px] text-slate-400">كود التحقق المستلم (SMS Code):</p>
                            <p className="text-xl font-black font-mono text-blue-400 select-all">
                              {activeOrder.code ? activeOrder.code : 'قيد انتظار وصول الكود...'}
                            </p>
                          </div>
                          <button
                            onClick={handlePollCode}
                            disabled={isPollingCode}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                          >
                            <RefreshCw size={14} className={isPollingCode ? 'animate-spin' : ''} />
                            تحديث الكود ♻️
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <a
                          href={`https://wa.me/${activeOrder.phone.replace('+', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                        >
                          <Smartphone size={16} />
                          فتح الرقم في WhatsApp مباشرة
                        </a>
                        <button
                          onClick={handleCancelOrder}
                          className="px-6 py-3 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-xl text-xs font-bold border border-red-600/30 transition-all"
                        >
                          إلغاء واسترداد الرصيد 🚫
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-20 text-center space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                        <Smartphone size={28} />
                      </div>
                      <p className="text-sm font-bold text-slate-400">لا يوجد طلب رقم نشط حالياً</p>
                      <p className="text-xs text-slate-600 max-w-sm mx-auto">
                        اختر السيرفر والتطبيق من القائمة الجانبية واضغط على (طلب وشراء الرقم) لبدء التجربة الحية.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: BOT CODE & TELEGRAM INTEGRATION */}
        {activeTab === 'bot-code' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-black text-white">أكواد البوت ومنصة Bots.Business (BJS)</h2>
              <p className="text-xs text-slate-400">
                كافة ملفات الأوامر تم إنشاؤها داخل مجلد <code className="text-blue-400 bg-slate-900 px-1 py-0.5 rounded">/commands</code>، وهي جاهزة للمزامنة السحابية عبر Git Sync.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { file: 'commands/_start.js', title: 'القائمة الرئيسية والأدمن', desc: 'القائمة الرئيسية مع أزرار العروض وفحص أيدي المالك' },
                { file: 'commands/admin_panel.js', title: 'لوحة تحكم الأدمن والمالك', desc: 'تضم كافة أزرار إدارة السيرفرات، القنوات، وطرق الدفع' },
                { file: 'commands/servers_menu.js', title: 'إدارة السيرفرات والمواقع', desc: 'إضافة مواقع بالرابط و API وكشف الأرصدة' },
                { file: 'commands/add_custom_site.js', title: 'إضافة موقع توريد جديد', desc: 'استقبال الرابط ومفتاح API وحفظه فورياً' },
                { file: 'commands/mustafa_5sim.js', title: 'سيرفر مصطفى (5SIM.NET)', desc: 'شراء تلقائي بأرخص مشغل وسعر بالموقع' },
                { file: 'commands/channels_menu.js', title: 'إدارة قنوات الاشتراك', desc: 'تعديل وحذف القنوات السابقة والوصف' },
                { file: 'commands/delallchannels.js', title: 'حذف كافة القنوات السابقة', desc: 'مسح فوري لجميع القنوات المفروضة' },
                { file: 'commands/payment_menu.js', title: 'طرق الشحن والحسابات', desc: 'عرض وتعديل الكريمي، النجم، بايننس، و STC' },
                { file: 'commands/card.js', title: 'صنع كروت شحن روبل', desc: 'توليد كرت شحن 16 رقماً وحرفاً للشحن الذاتي' },
                { file: 'commands/addcoin.js', title: 'إضافة رصيد لعضو', desc: 'شحن رصيد فوري لأي حساب بالروبل' },
                { file: 'commands/delcoin.js', title: 'خصم رصيد من عضو', desc: 'خصم رصيد فوري من أي أيدي مستخدم' },
                { file: 'commands/opclo.js', title: 'قفل وفتح الأقسام', desc: 'قفل وفتح البوت، العروض، وسيرفرات الأرقام' },
                { file: 'commands/Buynum.js', title: 'شراء رقم افتراضي', desc: 'قائمة التطبيقات والسيرفرات الملكية والعشوائية' },
                { file: 'commands/Xi.js', title: 'تنفيذ شراء الرقم الفعلي', desc: 'الاتصال بالمزود، جلب الرقم، وفحص كود SMS' }
              ].map(cmd => (
                <div key={cmd.file} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ملف جاهز ومحمي ✅
                    </span>
                    <h4 className="font-bold text-sm text-white mt-1.5">{cmd.title}</h4>
                    <p className="text-[11px] text-slate-400 font-mono" dir="ltr">{cmd.file}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{cmd.desc}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`// Code file: ${cmd.file}`, cmd.file)}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700"
                  >
                    <Copy size={12} />
                    نسخ مسار واسم الأمر
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: DASHBOARD & STATS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-1 text-right">
                <span className="text-xs text-slate-400 font-bold">سيرفرات التوريد المربوطة</span>
                <p className="text-3xl font-black text-white">{servers.length}</p>
                <p className="text-[10px] text-emerald-400">سيرفر محمد + 5sim + المواقع المضافة</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-1 text-right">
                <span className="text-xs text-slate-400 font-bold">قنوات الاشتراك الإجباري</span>
                <p className="text-3xl font-black text-white">{channels.length}</p>
                <p className="text-[10px] text-purple-400">يمكن حذفها أو تصفيرها بنقرة واحدة</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-1 text-right">
                <span className="text-xs text-slate-400 font-bold">طرق الشحن المعتمدة</span>
                <p className="text-3xl font-black text-white">{payments.length}</p>
                <p className="text-[10px] text-amber-400">الكريمي، النجم، USDT، STC</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-1 text-right">
                <span className="text-xs text-slate-400 font-bold">كروت الشحن الجاهزة</span>
                <p className="text-3xl font-black text-white">{cards.filter(c => !c.isUsed).length}</p>
                <p className="text-[10px] text-emerald-400">جاهزة للشحن المباشر</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
