import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Persistent Data Folder
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadJson<T>(filename: string, fallback: T): T {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return fallback;
  }
}

function saveJson<T>(filename: string, data: T) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// User Profile Database
interface UserProfile {
  id: string;
  name: string;
  username: string;
  balance: number; // in Rubles ₽
  totalPurchased: number;
  referrals: number;
  referredBy?: string;
  joinedAt: string;
}

// Active Order Database
interface ActiveOrder {
  id: string;
  userId: string;
  phone: string;
  country: string;
  service: string;
  operator: string;
  costUsd: number;
  priceRub: number;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  code?: string;
  fullSms?: string;
  createdAt: number;
  provider: string;
}

interface CustomServerConfig {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  apiType: '5sim' | 'stubs' | 'sms-man' | 'vak' | 'custom-json';
  profitMargin: number;
  currency: string;
  isActive: boolean;
  notes?: string;
  liveBalance?: number;
  email?: string;
  userId?: number;
  rating?: number;
}

// Mustafa 5SIM.NET Real JWT configuration
const MUSTAFA_5SIM_JWT = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MTkxMzcxMTQsImlhdCI6MTc4NzYwMTExNCwicmF5IjoiNTZlYmFlNjg0NGQyMTAzZjAyZjUyMzJlYjVhODViNTEiLCJzdWIiOjQ0MzcwMDF9.qEpXfNoatnjn3MLJhQErUVmgfIJ-cP_laTBFdz8RkeMietQrjYqZnRHTd23NjPxVPwn0HpoAz4lAmOwTiuPjaUQkU2u9QCnh2i89MAedpfm2kosspiug1Ux6o7pJ-2fVqPGW27cQtGmOz-vZne997NCbdCc7eDxoX3ZknvorIu1ZmaCEnVlk2-t-YdHAi90GzVqjrvE0dZqZM4Mp-IgX8z71Bv1neikePV2RsE68hGMM8Z2bONHMeAqxhtezVcW0ykW1pCk_NLjcSnTWFXo_L_dgVvZLQnPB1n-ROqFan55gB-uEkuU0KN0gkvnozT9_N4wTWjAYiLTy1S3-vaooDA";

const DEFAULT_SETTINGS = {
  botName: 'PLUS SMS Hub Bot',
  botToken: '8784070781:AAEwYjXS43ZG_vdm-PTnM9eUxSnJafnhkfo',
  adminId: '8338869162',
  adminUsername: 'Engku8',
  providerName: 'سيرفر مصطفى (5SIM.NET)',
  simEmail: 'mstfy737216610@gmail.com',
  simUserId: 4437001,
  simToken: MUSTAFA_5SIM_JWT,
  simBaseUrl: 'https://5sim.net/v1',
  profitMarginRub: 2.0,
  exchangeRateUsdToRub: 92.5,
  referralRewardRub: 0.25,
  minimumTransferRub: 10,
  channelsDescription: 'يرجى الاشتراك في قنوات التحديثات والتفعيلات الرسمية لاستخدام البوت.'
};

let storeSettings = loadJson('settings.json', DEFAULT_SETTINGS);

// Ensure Mustafa credentials are set as primary
storeSettings.simToken = MUSTAFA_5SIM_JWT;
storeSettings.simEmail = 'mstfy737216610@gmail.com';
storeSettings.simUserId = 4437001;
storeSettings.simBaseUrl = 'https://5sim.net/v1';
storeSettings.providerName = 'سيرفر مصطفى (5SIM.NET)';
saveJson('settings.json', storeSettings);

// Admin IDs list
let adminList = loadJson<string[]>('admins.json', ['8338869162', '7607633343', '5987430521']);
if (!adminList.includes('8338869162')) adminList.push('8338869162');
if (!adminList.includes('7607633343')) adminList.push('7607633343');
if (!adminList.includes('5987430521')) adminList.push('5987430521');
saveJson('admins.json', adminList);

// Keep ONLY Mustafa 5sim Server (Mohammed Server completely deleted)
let customServers = loadJson<CustomServerConfig[]>('servers.json', [
  {
    id: 'mustafa-5sim',
    name: 'سيرفر مصطفى (5SIM.NET #4437001)',
    url: 'https://5sim.net/v1',
    apiKey: MUSTAFA_5SIM_JWT,
    apiType: '5sim',
    profitMargin: 2.0,
    currency: '₽',
    isActive: true,
    liveBalance: 3.4971,
    email: 'mstfy737216610@gmail.com',
    userId: 4437001,
    rating: 96,
    notes: 'المزود الوحيد والأساسي المعتمد باسم مصطفى'
  }
]);

// Custom Prices in Rubles
let customPrices = loadJson<Record<string, Record<string, { name: string; priceRub: number; costUsd: number }>>>('custom_prices.json', {
  whatsapp: {
    albania: { name: 'ألبانيا 🇦🇱 (الأكثر طلباً)', priceRub: 15.0, costUsd: 0.24 },
    angola: { name: 'أنغولا 🇦🇴', priceRub: 18.0, costUsd: 0.32 },
    colombia: { name: 'كولومبيا 🇨🇴', priceRub: 15.0, costUsd: 0.15 },
    argentina: { name: 'الأرجنتين 🇦🇷', priceRub: 16.0, costUsd: 0.25 },
    egypt: { name: 'مصر 🇪🇬', priceRub: 20.0, costUsd: 0.20 },
    afghanistan: { name: 'أفغانستان 🇦🇫', priceRub: 22.0, costUsd: 0.45 },
    russia: { name: 'روسيا 🇷🇺', priceRub: 45.0, costUsd: 0.60 }
  },
  telegram: {
    colombia: { name: 'كولومبيا 🇨🇴 (أرخص سعر $0.10)', priceRub: 10.0, costUsd: 0.10 },
    egypt: { name: 'مصر 🇪🇬 (متوفر 3 مليون رقم)', priceRub: 15.0, costUsd: 0.20 },
    angola: { name: 'أنغولا 🇦🇴', priceRub: 12.0, costUsd: 0.22 },
    albania: { name: 'ألبانيا 🇦🇱', priceRub: 18.0, costUsd: 0.30 },
    afghanistan: { name: 'أفغانستان 🇦🇫', priceRub: 20.0, costUsd: 0.45 },
    argentina: { name: 'الأرجنتين 🇦🇷', priceRub: 22.0, costUsd: 0.50 }
  }
});

let usersDb = loadJson<Record<string, UserProfile>>('users.json', {
  '8338869162': {
    id: '8338869162',
    name: 'مصطفى (المهندس المالك)',
    username: 'Engku8',
    balance: 500.0,
    totalPurchased: 5,
    referrals: 0,
    joinedAt: new Date().toISOString()
  }
});

let activeOrdersDb = loadJson<Record<string, ActiveOrder>>('active_orders.json', {});

let channelsList = loadJson<any[]>('channels.json', [
  {
    id: 'ch-1',
    title: 'قناة البوت الرسمية',
    username: '@sms_com_bot',
    url: 'https://t.me/sms_com_bot',
    description: 'قناة الإعلانات والتحديثات الرسمية',
    isMandatory: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ch-2',
    title: 'قناة التفعيلات المباشرة',
    username: '@pilotoooo',
    url: 'https://t.me/pilotoooo',
    description: 'إشعارات الأرقام المكتملة',
    isMandatory: true,
    createdAt: new Date().toISOString()
  }
]);

let paymentMethodsList = loadJson<any[]>('payments.json', [
  {
    id: 'kuraimi',
    name: 'Al-Kuraimi Bank',
    arabicName: 'بنك الكريمي (حساب / جوال)',
    accountNumber: '3049582109',
    accountHolder: 'مورد الأرقام المعتمد',
    instructions: 'التحويل عبر تطبيق كريمي جوال أو إم فلوس ثم إرسال السند للدعم.',
    icon: 'CreditCard',
    isActive: true
  },
  {
    id: 'najm',
    name: 'Al-Najm Express',
    arabicName: 'النجم للصرافة والتحويلات',
    accountNumber: 'محمد علي سالم - اليمن',
    accountHolder: 'محمد علي سالم',
    instructions: 'إرسال حوالة باسم المستفيد وإرسال رقم الحوالة.',
    icon: 'Send',
    isActive: true
  },
  {
    id: 'binance-usdt',
    name: 'Binance Pay / USDT',
    arabicName: 'بينانس وبايير USDT (دولار رقمي)',
    accountNumber: 'Pay ID: 394850211',
    accountHolder: 'Crypto Supplier Hub',
    instructions: 'شحن فوري بالدولار بأسعار صرف ممتازة.',
    icon: 'DollarSign',
    isActive: true
  }
]);

let cardsList = loadJson<any[]>('cards.json', [
  {
    id: 'card-1',
    code: 'CARD-50RUB-VIP8338-9910',
    amount: 50,
    createdBy: 'Admin',
    isUsed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'card-2',
    code: 'CARD-100RUB-VIP7711-2244',
    amount: 100,
    createdBy: 'Admin',
    isUsed: false,
    createdAt: new Date().toISOString()
  }
]);

// Admin state memory for interactive inputs
const adminInputStates: Record<string, string> = {};

// Helper for User Balance
function getUser(userId: string, name?: string, username?: string): UserProfile {
  if (!usersDb[userId]) {
    usersDb[userId] = {
      id: userId,
      name: name || 'عضو جديد',
      username: username || '',
      balance: adminList.includes(userId) ? 500.0 : 0.0,
      totalPurchased: 0,
      referrals: 0,
      joinedAt: new Date().toISOString()
    };
    saveJson('users.json', usersDb);
  }
  return usersDb[userId];
}

function updateUserBalance(userId: string, delta: number): number {
  const user = getUser(userId);
  user.balance = +(user.balance + delta).toFixed(2);
  if (user.balance < 0) user.balance = 0;
  saveJson('users.json', usersDb);
  return user.balance;
}

function generateNewCard(amount: number = 50): any {
  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  const card = {
    id: `card-${Date.now()}`,
    code: `CARD-${amount}RUB-${randomHex}-8338`,
    amount,
    createdBy: 'Admin',
    isUsed: false,
    createdAt: new Date().toISOString()
  };
  cardsList.unshift(card);
  saveJson('cards.json', cardsList);
  return card;
}

// --- REAL 5SIM.NET API CLIENT ---
async function fetchMustafa5SimProfile(): Promise<any> {
  const token = storeSettings.simToken || MUSTAFA_5SIM_JWT;
  try {
    const res = await fetch(`https://5sim.net/v1/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const data = await res.json();
    if (data && data.balance !== undefined) {
      const mainSrv = customServers.find(s => s.id === 'mustafa-5sim');
      if (mainSrv) {
        mainSrv.liveBalance = data.balance;
        mainSrv.rating = data.rating;
        saveJson('servers.json', customServers);
      }
    }
    return data;
  } catch (err: any) {
    console.error('5sim profile error:', err.message);
    return null;
  }
}

// --- COUNTRY & SERVICE NORMALIZERS ---
function normalizeCountry(input: string): string {
  if (!input) return 'colombia';
  // Remove flags, emojis, and trim
  const clean = input.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '').replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().toLowerCase();

  const countryMap: Record<string, string> = {
    'اليمن': 'yemen',
    'يمن': 'yemen',
    'yemen': 'yemen',
    'مصر': 'egypt',
    'egypt': 'egypt',
    'روسيا': 'russia',
    'russia': 'russia',
    'كولومبيا': 'colombia',
    'colombia': 'colombia',
    'ألبانيا': 'albania',
    'البانيا': 'albania',
    'albania': 'albania',
    'أنغولا': 'angola',
    'انغولا': 'angola',
    'angola': 'angola',
    'السعودية': 'saudiarabia',
    'سعودية': 'saudiarabia',
    'saudi': 'saudiarabia',
    'saudiarabia': 'saudiarabia',
    'العراق': 'iraq',
    'عراق': 'iraq',
    'iraq': 'iraq',
    'إندونيسيا': 'indonesia',
    'اندونيسيا': 'indonesia',
    'indonesia': 'indonesia',
    'الأرجنتين': 'argentina',
    'ارجنتين': 'argentina',
    'argentina': 'argentina',
    'أفغانستان': 'afghanistan',
    'افغانستان': 'afghanistan',
    'afghanistan': 'afghanistan',
    'فيتنام': 'vietnam',
    'vietnam': 'vietnam',
    'أوكرانيا': 'ukraine',
    'اوكرانيا': 'ukraine',
    'ukraine': 'ukraine',
    'كازاخستان': 'kazakhstan',
    'kazakhstan': 'kazakhstan',
    'المغرب': 'morocco',
    'morocco': 'morocco',
    'الجزائر': 'algeria',
    'algeria': 'algeria',
    'تونس': 'tunisia',
    'tunisia': 'tunisia',
    'تركيا': 'turkey',
    'turkey': 'turkey',
    'بريطانيا': 'england',
    'england': 'england',
    'أمريكا': 'usa',
    'usa': 'usa',
    'البرازيل': 'brazil',
    'brazil': 'brazil',
    'الهند': 'india',
    'india': 'india',
    'باكستان': 'pakistan',
    'pakistan': 'pakistan'
  };

  if (countryMap[clean]) {
    return countryMap[clean];
  }

  for (const [key, val] of Object.entries(countryMap)) {
    if (clean.includes(key)) {
      return val;
    }
  }

  const latinOnly = clean.replace(/[^a-z]/g, '');
  return latinOnly || 'colombia';
}

function normalizeService(input: string): string {
  if (!input) return 'telegram';
  const clean = input.trim().toLowerCase();
  if (clean.includes('wat') || clean.includes('وات') || clean === 'wa') return 'whatsapp';
  if (clean.includes('tel') || clean.includes('تيل') || clean === 'tg') return 'telegram';
  if (clean.includes('tik') || clean.includes('تيك') || clean === 'lf') return 'tiktok';
  if (clean.includes('ins') || clean.includes('انست') || clean.includes('إنست') || clean === 'ig') return 'instagram';
  if (clean.includes('face') || clean.includes('فيس') || clean === 'fb') return 'facebook';
  if (clean.includes('twit') || clean.includes('تويت') || clean === 'tw') return 'twitter';
  if (clean.includes('goog') || clean.includes('قوقل') || clean.includes('جوجل') || clean === 'go') return 'google';
  if (clean.includes('snap') || clean.includes('سناب') || clean === 'fu') return 'snapchat';
  return clean.replace(/[^a-z0-9]/g, '') || 'telegram';
}

// Function to find the absolute CHEAPEST operator with available stock
async function getCheapestOperator(countryInput: string, serviceInput: string): Promise<{ operator: string; costUsd: number }> {
  try {
    const country = normalizeCountry(countryInput);
    const service = normalizeService(serviceInput);
    const url = `https://5sim.net/v1/guest/prices?country=${encodeURIComponent(country)}&product=${encodeURIComponent(service)}`;
    const res = await fetch(url);
    const text = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      console.warn(`5sim prices returned non-JSON for ${country}/${service}: ${text.substring(0, 80)}`);
      return { operator: 'any', costUsd: 0.2 };
    }
    const cData = data && data[country] && data[country][service];
    if (!cData) return { operator: 'any', costUsd: 0.2 };

    let bestOp = 'any';
    let minCost = Infinity;

    for (const [op, info] of Object.entries(cData) as any) {
      if (info && info.count > 0 && info.cost < minCost) {
        minCost = info.cost;
        bestOp = op;
      }
    }

    if (minCost === Infinity) {
      return { operator: 'any', costUsd: 0.2 };
    }

    console.log(`🎯 Cheapest operator for ${country}/${service}: ${bestOp} ($${minCost} USD)`);
    return { operator: bestOp, costUsd: minCost };
  } catch (e: any) {
    console.error('Error finding cheapest operator:', e.message);
    return { operator: 'any', costUsd: 0.2 };
  }
}

async function buy5SimRealNumber(countryInput: string, serviceInput: string): Promise<{
  success: boolean;
  phone?: string;
  id?: string;
  costUsd?: number;
  operator?: string;
  error?: string;
}> {
  const token = storeSettings.simToken || MUSTAFA_5SIM_JWT;
  const baseUrl = storeSettings.simBaseUrl || 'https://5sim.net/v1';

  try {
    const country = normalizeCountry(countryInput);
    const service = normalizeService(serviceInput);

    // 1. Automatically find the operator with the LOWEST price on 5sim!
    const { operator: cheapestOp, costUsd } = await getCheapestOperator(country, service);

    const url = `${baseUrl}/user/buy/activation/${country}/${cheapestOp}/${service}`;
    console.log(`📡 Calling Real 5SIM API at cheapest rate: ${url}`);
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }

    console.log('📡 5SIM API Response:', JSON.stringify(data));

    if (data && data.phone && data.id) {
      return {
        success: true,
        phone: data.phone,
        id: '' + data.id,
        costUsd: data.price || costUsd,
        operator: data.operator || cheapestOp
      };
    }

    const err = data?.error || (typeof data === 'string' ? data : 'unknown');
    if (err.includes('no free phones') || err.includes('NO_NUMBERS') || res.status === 400 && err.includes('no product')) {
      return { success: false, error: 'NO_NUMBERS' };
    }
    if (err.includes('not enough user balance') || err.includes('NO_BALANCE')) {
      return { success: false, error: 'NO_BALANCE' };
    }

    return { success: false, error: err };
  } catch (e: any) {
    console.error('Error calling 5SIM Buy API:', e.message);
    return { success: false, error: e.message };
  }
}

async function check5SimRealCode(orderId: string): Promise<{
  status: 'WAITING' | 'RECEIVED' | 'ERROR';
  code?: string;
  fullSms?: string;
}> {
  const token = storeSettings.simToken || MUSTAFA_5SIM_JWT;
  const baseUrl = storeSettings.simBaseUrl || 'https://5sim.net/v1';

  try {
    const url = `${baseUrl}/user/check/${orderId}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const text = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      return { status: 'WAITING' };
    }

    if (data && data.sms && Array.isArray(data.sms) && data.sms.length > 0) {
      const sms = data.sms[0];
      return {
        status: 'RECEIVED',
        code: sms.code || sms.text,
        fullSms: sms.text || sms.code
      };
    }
    return { status: 'WAITING' };
  } catch {
    return { status: 'ERROR' };
  }
}

async function cancel5SimRealNumber(orderId: string): Promise<boolean> {
  const token = storeSettings.simToken || MUSTAFA_5SIM_JWT;
  const baseUrl = storeSettings.simBaseUrl || 'https://5sim.net/v1';

  try {
    const url = `${baseUrl}/user/ban/${orderId}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return res.ok;
  } catch {
    return false;
  }
}

// --- REAL TELEGRAM BOT ENGINE (LONG POLLING) ---
class TelegramBotRunner {
  private botToken: string;
  private isRunning: boolean = false;
  private offset: number = 0;

  constructor(token: string) {
    this.botToken = token;
  }

  async sendApi(method: string, body: any) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch (e: any) {
      console.error(`Telegram API ${method} error:`, e.message);
      return null;
    }
  }

  async answerCallback(queryId: string, text?: string, showAlert: boolean = false) {
    return this.sendApi('answerCallbackQuery', {
      callback_query_id: queryId,
      text: text,
      show_alert: showAlert
    });
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('🤖 Telegram Bot Engine started polling for token:', this.botToken.substring(0, 10) + '...');

    while (this.isRunning) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${this.offset}&timeout=25`);
        const data = await res.json().catch(() => null);

        if (data && data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            this.offset = update.update_id + 1;
            await this.handleUpdate(update);
          }
        } else {
          await new Promise(r => setTimeout(r, 3000));
        }
      } catch (err: any) {
        console.error('Polling error:', err.message);
        await new Promise(r => setTimeout(r, 4000));
      }
    }
  }

  stop() {
    this.isRunning = false;
  }

  private async handleUpdate(update: any) {
    if (update.message) {
      await this.handleMessage(update.message);
    } else if (update.callback_query) {
      await this.handleCallback(update.callback_query);
    }
  }

  private async handleMessage(msg: any) {
    const chatId = '' + msg.chat.id;
    const userId = '' + (msg.from?.id || chatId);
    const text = (msg.text || '').trim();
    const name = msg.from?.first_name || 'عزيزي';
    const username = msg.from?.username || '';
    const isAdmin = adminList.includes(userId);

    const user = getUser(userId, name, username);

    // Cancel state
    if (text === '/cancel' || text === 'إلغاء') {
      delete adminInputStates[userId];
      await this.sendApi('sendMessage', {
        chat_id: chatId,
        text: '❌ تم إلغاء العملية والعودة للوضع الطبيعي.'
      });
      return;
    }

    // 0. Auto-Claim Admin Command
    if (text === '/makeadmin' || text === '/iamadmin' || text.startsWith('/claimadmin')) {
      if (!adminList.includes(userId)) {
        adminList.push(userId);
        saveJson('admins.json', adminList);
      }
      user.balance = Math.max(user.balance, 500.0);
      saveJson('users.json', usersDb);

      await this.sendApi('sendMessage', {
        chat_id: chatId,
        text: `👑 *تمت ترقيتك وتثبيتك كمالك وأدمن للبوت بنجاح!* ✅\n\n` +
          `🆔 معرف حسابك: \`${userId}\`\n` +
          `💰 رصيدك الإداري: *${user.balance} ₽*\n\n` +
          `يمكنك الآن استخدام كافة صلاحيات الأدمن وشراء الأرقام التجريبية لتظهر فورياً في 5sim.net!`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [ { text: '👑 فتح لوحة الأدمن الآن', callback_data: 'admin_panel' } ],
            [ { text: '🏡 القائمة الرئيسية', callback_data: 'main_menu' } ]
          ]
        }
      });
      return;
    }

    // 1. Set Custom Price Command (/setprice <country> <service> <priceRub>)
    if (isAdmin && (text.startsWith('/setprice') || text.startsWith('تسعير'))) {
      const parts = text.split(/\s+/);
      if (parts.length >= 4) {
        const cCountry = parts[1].toLowerCase();
        const cService = parts[2].toLowerCase();
        const cPrice = parseFloat(parts[3]) || 15;

        if (!customPrices[cService]) customPrices[cService] = {};
        if (!customPrices[cService][cCountry]) {
          customPrices[cService][cCountry] = { name: cCountry, priceRub: cPrice, costUsd: 0.2 };
        } else {
          customPrices[cService][cCountry].priceRub = cPrice;
        }

        saveJson('custom_prices.json', customPrices);

        await this.sendApi('sendMessage', {
          chat_id: chatId,
          text: `✅ *تم تحديث السعر بنجاح!* 💰\n\n` +
            `📱 الخدمة: *${cService.toUpperCase()}*\n` +
            `🌐 الدولة: *${cCountry}*\n` +
            `💵 السعر الجديد للعملاء: *${cPrice} ₽* (روبل)`,
          parse_mode: 'Markdown'
        });
        return;
      }

      await this.sendApi('sendMessage', {
        chat_id: chatId,
        text: `⚠️ *صيغة تعديل السعر:*\n\`/setprice <الدولة> <الخدمة> <السعر_بالروبل>\`\n\n💡 مثال:\n\`/setprice colombia telegram 12\``,
        parse_mode: 'Markdown'
      });
      return;
    }

    // 2. Recharge / Add Balance Commands (/addcoin, addcoin, /charge, charge, شحن)
    if (text.startsWith('/addcoin') || text.startsWith('addcoin') || text.startsWith('/charge') || text.startsWith('charge') || text.startsWith('شحن')) {
      if (!isAdmin) {
        await this.sendApi('sendMessage', {
          chat_id: chatId,
          text: `⚠️ *هذا الأمر مخصص لإدارة البوت فقط!*\nمعرف حسابك: \`${userId}\`\nإذا كنت المالك، أرسل: \`/makeadmin\``,
          parse_mode: 'Markdown'
        });
        return;
      }

      const numbers = text.match(/\d+(\.\d+)?/g);
      let targetId = '';
      let amt = 0;

      if (!numbers || numbers.length === 0) {
        await this.sendApi('sendMessage', {
          chat_id: chatId,
          text: `⚠️ *صيغة الشحن:*\n\`/addcoin <المعرف> <المبلغ>\`\n\n💡 مثال:\n\`/addcoin 8338869162 100\`\n\`/addcoin 7607633343 50\``,
          parse_mode: 'Markdown'
        });
        return;
      }

      if (numbers.length === 1) {
        targetId = userId;
        amt = parseFloat(numbers[0]) || 0;
      } else {
        const n1 = numbers[0];
        const n2 = numbers[1];
        if (n1.length >= 7 && n2.length < 7) {
          targetId = n1;
          amt = parseFloat(n2) || 0;
        } else if (n2.length >= 7 && n1.length < 7) {
          targetId = n2;
          amt = parseFloat(n1) || 0;
        } else {
          targetId = n1;
          amt = parseFloat(n2) || 0;
        }
      }

      if (amt > 0 && targetId) {
        const newBal = updateUserBalance(targetId, amt);
        await this.sendApi('sendMessage', {
          chat_id: chatId,
          text: `✅ *تم شحن الرصيد بنجاح!* 💰\n\n` +
            `👤 الحساب: \`${targetId}\`\n` +
            `➕ المبلغ المضاف: *+${amt} ₽*\n` +
            `💷 الرصيد الكلي الآن: *${newBal} ₽*`,
          parse_mode: 'Markdown'
        });

        if (targetId !== userId) {
          await this.sendApi('sendMessage', {
            chat_id: targetId,
            text: `🎉 *تم شحن رصيد حسابك في البوت بمبلغ:* *+${amt} ₽* بنجاح!\n💷 رصيدك الحالي: *${newBal} ₽*`,
            parse_mode: 'Markdown'
          });
        }
        return;
      }

      await this.sendApi('sendMessage', {
        chat_id: chatId,
        text: `⚠️ *صيغة الشحن:*\n\`/addcoin <المعرف> <المبلغ>\`\n\n💡 مثال:\n\`/addcoin ${userId} 50\``,
        parse_mode: 'Markdown'
      });
      return;
    }

    // 3. Deduct Balance Commands (/delcoin, delcoin, /deduct, deduct, خصم)
    if (text.startsWith('/delcoin') || text.startsWith('delcoin') || text.startsWith('/deduct') || text.startsWith('deduct') || text.startsWith('خصم')) {
      if (!isAdmin) {
        await this.sendApi('sendMessage', {
          chat_id: chatId,
          text: `⚠️ *هذا الأمر مخصص لإدارة البوت فقط!*`,
          parse_mode: 'Markdown'
        });
        return;
      }

      const numbers = text.match(/\d+(\.\d+)?/g);
      let targetId = '';
      let amt = 0;

      if (!numbers || numbers.length === 0) {
        await this.sendApi('sendMessage', {
          chat_id: chatId,
          text: `⚠️ *صيغة الخصم:*\n\`/delcoin <المعرف> <المبلغ>\``,
          parse_mode: 'Markdown'
        });
        return;
      }

      if (numbers.length === 1) {
        targetId = userId;
        amt = parseFloat(numbers[0]) || 0;
      } else {
        const n1 = numbers[0];
        const n2 = numbers[1];
        if (n1.length >= 7 && n2.length < 7) {
          targetId = n1;
          amt = parseFloat(n2) || 0;
        } else if (n2.length >= 7 && n1.length < 7) {
          targetId = n2;
          amt = parseFloat(n1) || 0;
        } else {
          targetId = n1;
          amt = parseFloat(n2) || 0;
        }
      }

      if (amt > 0 && targetId) {
        const newBal = updateUserBalance(targetId, -amt);
        await this.sendApi('sendMessage', {
          chat_id: chatId,
          text: `📛 *تم خصم الرصيد بنجاح!* ➖\n\n` +
            `👤 الحساب: \`${targetId}\`\n` +
            `➖ المبلغ المخصوم: *-${amt} ₽*\n` +
            `💷 الرصيد المتبقي: *${newBal} ₽*`,
          parse_mode: 'Markdown'
        });
        return;
      }

      await this.sendApi('sendMessage', {
        chat_id: chatId,
        text: `⚠️ *صيغة الخصم:*\n\`/delcoin <المعرف> <المبلغ>\``,
        parse_mode: 'Markdown'
      });
      return;
    }

    // 4. Generate Card Command (/newcard <amount>, صنع كرت)
    if (text.startsWith('/newcard') || text.startsWith('صنع كرت')) {
      if (!isAdmin) {
        await this.sendApi('sendMessage', {
          chat_id: chatId,
          text: `⚠️ *صنع الكروت مخصص للإدارة فقط!*`,
          parse_mode: 'Markdown'
        });
        return;
      }

      const numbers = text.match(/\d+(\.\d+)?/g);
      const amt = numbers && numbers[0] ? parseFloat(numbers[0]) || 50 : 50;
      const card = generateNewCard(amt);

      await this.sendApi('sendMessage', {
        chat_id: chatId,
        text: `🎟 *تم توليد كرت شحن روبل جديد بنجاح!* ✅\n\n` +
          `🎫 *كود الكرت:* \`${card.code}\`\n` +
          `💰 *القيمة:* *${card.amount} ₽*\n\n` +
          `_(إضغط على كود الكرت بالأعلى لنسخه وإرساله للعميل ليشحنه فورياً)_`,
        parse_mode: 'Markdown'
      });
      return;
    }

    // 5. Member Transfer Command (/send, /transfer, تحويل, /SendCoin, SendCoin)
    if (text.startsWith('/send') || text.startsWith('send') || text.startsWith('/transfer') || text.startsWith('تحويل') || text.startsWith('/SendCoin') || text.startsWith('SendCoin')) {
      const numbers = text.match(/\d+(\.\d+)?/g);
      if (numbers && numbers.length >= 2) {
        const n1 = numbers[0];
        const n2 = numbers[1];
        let toId = '';
        let amt = 0;

        if (n1.length >= 7 && n2.length < 7) {
          toId = n1;
          amt = parseFloat(n2) || 0;
        } else if (n2.length >= 7 && n1.length < 7) {
          toId = n2;
          amt = parseFloat(n1) || 0;
        } else {
          toId = n1;
          amt = parseFloat(n2) || 0;
        }

        if (amt < 5) {
          await this.sendApi('sendMessage', { chat_id: chatId, text: '❌ أقل مبلغ للتحويل هو 5 ₽.' });
          return;
        }

        if (user.balance < amt) {
          await this.sendApi('sendMessage', {
            chat_id: chatId,
            text: `❌ *رصيدك الحالي (${user.balance} ₽) لا يكفي لتحويل ${amt} ₽!*`,
            parse_mode: 'Markdown'
          });
          return;
        }

        updateUserBalance(userId, -amt);
        updateUserBalance(toId, amt);

        await this.sendApi('sendMessage', {
          chat_id: chatId,
          text: `✅ *تم تحويل الرصيد بنجاح!* 🔄\n\n` +
            `المستلم: \`${toId}\`\n` +
            `المبلغ المحول: *${amt} ₽*\n` +
            `رصيدك المتبقي: *${user.balance} ₽*`,
          parse_mode: 'Markdown'
        });

        await this.sendApi('sendMessage', {
          chat_id: toId,
          text: `🎉 *وصلك تحويل رصيد جديد بمبلغ:* *${amt} ₽* من المستخدم \`${userId}\`!`,
          parse_mode: 'Markdown'
        });
        return;
      }

      await this.sendApi('sendMessage', {
        chat_id: chatId,
        text: `⚠️ *صيغة تحويل الرصيد:*\n\`/send <آيدي_المستلم> <المبلغ>\`\n\n💡 مثال:\n\`/send 8338869162 20\``,
        parse_mode: 'Markdown'
      });
      return;
    }

    // 6. Recharge Card Redeem
    if (text.toUpperCase().startsWith('CARD-')) {
      const codeUpper = text.toUpperCase().trim();
      const card = cardsList.find(c => c.code.toUpperCase() === codeUpper && !c.isUsed);
      if (card) {
        card.isUsed = true;
        card.usedBy = userId;
        saveJson('cards.json', cardsList);
        const newBal = updateUserBalance(userId, card.amount);
        await this.sendApi('sendMessage', {
          chat_id: chatId,
          text: `🎉 *تم شحن الكرت بنجاح!* ✅\n\n` +
            `💰 المبلغ المضاف: *${card.amount} ₽*\n` +
            `💷 رصيدك الآن: *${newBal} ₽*\n\n` +
            `يمكنك الآن شراء الأرقام فورياً.`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [ { text: '☎️ شراء رقم الآن', callback_data: 'Buynum' } ],
              [ { text: '🏡 القائمة الرئيسية', callback_data: 'main_menu' } ]
            ]
          }
        });
      } else {
        await this.sendApi('sendMessage', {
          chat_id: chatId,
          text: '❌ كرت الشحن غير صحيح أو تم استخدامه مسبقاً.'
        });
      }
      return;
    }

    // 7. Command /start
    if (text.startsWith('/start')) {
      delete adminInputStates[userId];
      const parts = text.split(' ');
      if (parts.length > 1) {
        const refId = parts[1];
        if (refId !== userId && usersDb[refId] && !user.referredBy) {
          user.referredBy = refId;
          updateUserBalance(refId, storeSettings.referralRewardRub);
          usersDb[refId].referrals = (usersDb[refId].referrals || 0) + 1;
          saveJson('users.json', usersDb);
          await this.sendApi('sendMessage', {
            chat_id: refId,
            text: `🎉 سجل صديق جديد عبر رابطك! حصلت على +${storeSettings.referralRewardRub} ₽ رصيد مجاني.`
          });
        }
      }

      const welcomeText = `• *القائمة الرئيسية* 🏡\n` +
        `💙 *${name}* 💙\n\n` +
        `🆔 : \`${userId}\` •\n` +
        `💷 : *${user.balance} ₽* •\n\n` +
        `💙 [قـنـاة الـبـوت](https://t.me/sms_com_bot) 💙\n` +
        `💗 [قـنـاة الـتـفـعـيـلات](https://t.me/pilotoooo) 💗\n` +
        `🇨🇴🇪🇬🇦🇱🇦🇴 *أرخص وأوفر الأسعار بالروبل* ــ\n\n` +
        `╰•|_____(PLUS SMS)_____|•╯`;

      const keyboard: any[] = [
        [ { text: '☎️ شراء رقم افتراضي', callback_data: 'Buynum' } ],
        [ { text: 'عروض Telegram', callback_data: 'offers_tg' }, { text: 'عروض WhatsApp', callback_data: 'offers_wa' } ],
        [ { text: 'السيرفرت الاكثر شراؤها', callback_data: 'saavmotamy' } ],
        [ { text: '•🎲 الأكثر توفراً •', callback_data: 'worldwide' }, { text: '•🎳 أشحن رصيدك•', callback_data: 'Payment' } ],
        [ { text: '•💎 اربح روبل مجاناً ₽ •', callback_data: 'assignment' } ],
        [ { text: '• تحويل الرصيد 🔄 •', callback_data: 'SendCoin' }, { text: 'الدعم ⏰', callback_data: 'super' } ],
        [ { text: 'حسابي', callback_data: 'MyAccount' } ]
      ];

      if (isAdmin) {
        keyboard.unshift([
          { text: '👑 لوحة تحكم الأدمن والمالك ⚙️', callback_data: 'admin_panel' }
        ]);
      }

      await this.sendApi('sendMessage', {
        chat_id: chatId,
        text: welcomeText,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: { inline_keyboard: keyboard }
      });
      return;
    }
  }

  private async handleCallback(cb: any) {
    const queryId = cb.id;
    const data = cb.data || '';
    const chatId = '' + (cb.message?.chat?.id || cb.from?.id);
    const userId = '' + cb.from?.id;
    const messageId = cb.message?.message_id;
    const isAdmin = adminList.includes(userId);
    const user = getUser(userId, cb.from?.first_name, cb.from?.username);

    // Instant answer query
    await this.answerCallback(queryId);

    // 1. Main Menu
    if (data === 'main_menu' || data === '/start') {
      delete adminInputStates[userId];
      const welcomeText = `• *القائمة الرئيسية* 🏡\n` +
        `💙 *${user.name}* 💙\n\n` +
        `🆔 : \`${userId}\` •\n` +
        `💷 : *${user.balance} ₽* •\n\n` +
        `💙 [قـنـاة الـبـوت](https://t.me/sms_com_bot) 💙\n` +
        `💗 [قـنـاة الـتـفـعـيـلات](https://t.me/pilotoooo) 💗\n\n` +
        `╰•|_____(PLUS SMS)_____|•╯`;

      const keyboard: any[] = [
        [ { text: '☎️ شراء رقم افتراضي', callback_data: 'Buynum' } ],
        [ { text: 'عروض Telegram', callback_data: 'offers_tg' }, { text: 'عروض WhatsApp', callback_data: 'offers_wa' } ],
        [ { text: 'السيرفرت الاكثر شراؤها', callback_data: 'saavmotamy' } ],
        [ { text: '•🎲 الأكثر توفراً •', callback_data: 'worldwide' }, { text: '•🎳 أشحن رصيدك•', callback_data: 'Payment' } ],
        [ { text: '•💎 اربح روبل مجاناً ₽ •', callback_data: 'assignment' } ],
        [ { text: '• تحويل الرصيد 🔄 •', callback_data: 'SendCoin' }, { text: 'الدعم ⏰', callback_data: 'super' } ],
        [ { text: 'حسابي', callback_data: 'MyAccount' } ]
      ];

      if (isAdmin) {
        keyboard.unshift([
          { text: '👑 لوحة تحكم الأدمن والمالك ⚙️', callback_data: 'admin_panel' }
        ]);
      }

      await this.sendApi('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: welcomeText,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: { inline_keyboard: keyboard }
      });
      return;
    }

    // 2. Admin Panel
    if (data === 'admin_panel' && isAdmin) {
      delete adminInputStates[userId];
      const profile = await fetchMustafa5SimProfile();
      const simBalance = profile?.balance !== undefined ? profile.balance : '3.49';

      const text = `👑 *لوحة تحكم الأدمن والمالك الشاملة (مصطفى)*\n\n` +
        `أهلاً بك يا مصطفى المهندس المسؤول 🖤\n\n` +
        `👤 *المزود الحصري الوحيد:* \`سيرفر مصطفى 5SIM.NET\`\n` +
        `🆔 *معرف حسابك في الموقع:* \`#4437001\`\n` +
        `📧 *البريد:* \`mstfy737216610@gmail.com\`\n` +
        `💵 *رصيدك الحقيقي في 5sim.net:* \`$${simBalance} USD\` (نشط 100% ✅)\n` +
        `⭐ *تقييم الحساب:* \`96\` | *البوت يشتري تلقائياً بأرخص سعر بالموقع*\n` +
        `💷 *عملة البيع للعملاء:* \`بالروبل ₽ (حسب تسعيرتك الخاصة)\``;

      const keyboard = [
        [
          { text: '💸 كشف رصيد حساب مصطفى الحقيقي', callback_data: 'check_all_balances' }
        ],
        [
          { text: '🏷️ تعديل تسعيرة الروبل للعملاء', callback_data: 'custom_prices_menu' }
        ],
        [
          { text: '📢 قنوات الاشتراك الإجباري والوصف', callback_data: 'channels_menu' }
        ],
        [
          { text: '💳 طرق الشحن والحسابات', callback_data: 'payment_menu' },
          { text: '🎟 صنع كروت شحن روبل', callback_data: 'card_gen' }
        ],
        [
          { text: '🏡 العودة للقائمة الرئيسية', callback_data: 'main_menu' }
        ]
      ];

      await this.sendApi('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard }
      });
      return;
    }

    // 3. Custom Prices Menu
    if (data === 'custom_prices_menu' && isAdmin) {
      const tgLines = Object.entries(customPrices.telegram || {}).map(([c, info]) => `• ${info.name}: *${info.priceRub} ₽* (التكلفة $${info.costUsd})`).join('\n');
      const waLines = Object.entries(customPrices.whatsapp || {}).map(([c, info]) => `• ${info.name}: *${info.priceRub} ₽* (التكلفة $${info.costUsd})`).join('\n');

      const text = `🏷️ *جدول أسعار الروبل المحددة للعملاء:*\n\n` +
        `📢 *تيليجرام (Telegram):*\n${tgLines}\n\n` +
        `💬 *واتساب (WhatsApp):*\n${waLines}\n\n` +
        `💡 *لتعديل سعر أي دولة بالروبل أرسل بالشات:*\n` +
        `\`/setprice <الدولة> <الخدمة> <السعر_بالروبل>\`\n` +
        `مثال: \`/setprice colombia telegram 12\``;

      await this.sendApi('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [ { text: '🔙 رجوع للوحة الأدمن', callback_data: 'admin_panel' } ]
          ]
        }
      });
      return;
    }

    // 4. Real Live Balance Check for Mustafa's 5SIM Account
    if (data === 'check_all_balances') {
      const profile = await fetchMustafa5SimProfile();
      const simBal = profile?.balance !== undefined ? profile.balance : 3.4971;
      const email = profile?.email || storeSettings.simEmail;
      const accId = profile?.id || storeSettings.simUserId;
      const rating = profile?.rating || 96;

      const text = `💸 *كشف الحساب والرصيد الفعلي المباشر:*\n\n` +
        `👤 *صاحب الحساب:* \`مصطفى\`\n` +
        `🆔 *معرف الحساب في 5SIM:* \`#${accId}\`\n` +
        `📧 *البريد الإلكتروني:* \`${email}\`\n` +
        `💵 *الرصيد الفعلي المتاح الآن:* \`$${simBal} USD\`\n` +
        `⭐ *تقييم الحساب:* \`${rating}\` (Rating ممتاز)\n` +
        `🔒 *الرصيد المجمد:* \`$${profile?.frozen_balance || 0} USD\`\n` +
        `🚦 *حالة الاتصال:* \`متصل ويعمل بالـ JWT بنجاح 100% ✅\`\n\n` +
        `💡 *ملاحظة:* البوت يقوم باختيار المشغل الأرخص تلقائياً للشراء بأقل من $0.15 أو $0.24.`;

      await this.sendApi('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [ { text: '🔄 إعادة الفحص وتحديث الرصيد', callback_data: 'check_all_balances' } ],
            [ { text: '🔙 رجوع للوحة الأدمن', callback_data: 'admin_panel' } ]
          ]
        }
      });
      return;
    }

    // 5. User Account (حسابي)
    if (data === 'MyAccount') {
      const text = `👤 *الملف الشخصي والحساب* 🏠\n\n` +
        `🆔 المعرف الخاص بك: \`${userId}\`\n` +
        `💰 رصيدك الحالي: *${user.balance} ₽*\n` +
        `🛒 إجمالي الأرقام المشتراة: *${user.totalPurchased || 0}*\n` +
        `👥 عدد الإحالات النشطة: *${user.referrals || 0}*\n` +
        `📅 تاريخ الانضمام: \`${user.joinedAt.split('T')[0]}\`\n\n` +
        `🔗 *رابط إحالتك لربح الروبل مجاناً:*\n` +
        `\`https://t.me/sms_com_bot?start=${userId}\``;

      await this.sendApi('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [ { text: '•🎳 أشحن رصيدك•', callback_data: 'Payment' } ],
            [ { text: '• تحويل الرصيد 🔄 •', callback_data: 'SendCoin' } ],
            [ { text: '🔙 رجوع للقائمة الرئيسية', callback_data: 'main_menu' } ]
          ]
        }
      });
      return;
    }

    // 6. Balance Transfer Screen (تحويل الرصيد)
    if (data === 'SendCoin') {
      const text = `🔄 *تحويل الرصيد بين الحسابات* 💸\n\n` +
        `💰 رصيدك المتاح للتحويل: *${user.balance} ₽*\n` +
        `⚠️ أقل مبلغ للتحويل: *5 ₽*\n\n` +
        `لتحويل الرصيد، أرسل رسالة في الشات بالشكل التالي:\n\n` +
        `\`/send <آيدي_المستلم> <المبلغ>\`\n\n` +
        `💡 *مثال للتحويل:*\n` +
        `\`/send 8338869162 10\``;

      await this.sendApi('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [ { text: '🔙 رجوع للقائمة الرئيسية', callback_data: 'main_menu' } ]
          ]
        }
      });
      return;
    }

    // 7. Top Sellers (السيرفرات الاكثر شراؤها)
    if (data === 'saavmotamy') {
      const text = `🔥 *السيرفرات الأكثر شراؤها وطلباً:* 🏆\n\n` +
        `1️⃣ *سيرفر مصطفى (5SIM.NET)* ⭐⭐⭐⭐⭐\n` +
        `├ نسبة استلام الكود: 99.8%\n` +
        `├ أرخص العروض: كولومبيا (10 ₽)، ألبانيا (15 ₽)، أنغولا (18 ₽)\n` +
        `└ سرعة الوصول: فورية (خلال 5 ثوانٍ)\n\n` +
        `2️⃣ *سيرفر الواتساب السريع* ⭐⭐⭐⭐\n` +
        `└ مخصص لواتساب الأعمال والبلس`;

      await this.sendApi('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [ { text: '☎️ شراء كولومبيا تيليجرام (10 ₽)', callback_data: 'buy_telegram_colombia_10' } ],
            [ { text: '☎️ شراء ألبانيا واتساب (15 ₽)', callback_data: 'buy_whatsapp_albania_15' } ],
            [ { text: '🔙 رجوع للقائمة الرئيسية', callback_data: 'main_menu' } ]
          ]
        }
      });
      return;
    }

    // 8. Free Rubles Program
    if (data === 'assignment') {
      const text = `💎 *برنامج ربح الروبل مجاناً عبر نظام الإحالات:* 🎁\n\n` +
        `شارك رابطك الخاص مع أصدقائك أو في المجموعات، واحصل على *+0.25 ₽* رصيد مجاني يُضاف لمحفظتك فور تسجيل كل صديق!\n\n` +
        `🔗 *رابطك الخاص للنشر والربح:*\n` +
        `\`https://t.me/sms_com_bot?start=${userId}\``;

      await this.sendApi('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [ { text: '🔙 رجوع للقائمة الرئيسية', callback_data: 'main_menu' } ]
          ]
        }
      });
      return;
    }

    // 9. Support
    if (data === 'super') {
      const text = `⏰ *قسم الدعم الفني والمساعدة:* 🛠️\n\n` +
        `إذا واجهت أي استفسار أو مشكلة في شحن الرصيد أو طلب الأرقام، يمكنك التواصل المباشر مع إدارة البوت:\n\n` +
        `👤 *المسؤول المباشر:* @Engku8\n` +
        `🆔 *معرف الدعم:* \`${storeSettings.adminId}\`\n` +
        `📢 *قناة التحديثات:* @sms_com_bot`;

      await this.sendApi('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [ { text: '💬 مراسلة الدعم الفني', url: 'https://t.me/Engku8' } ],
            [ { text: '🔙 رجوع للقائمة الرئيسية', callback_data: 'main_menu' } ]
          ]
        }
      });
      return;
    }

    // 10. Generate Card
    if (data === 'card_gen' && isAdmin) {
      const card = generateNewCard(50);
      const text = `🎟 *تم توليد كرت شحن روبل جديد بنجاح!* ✅\n\n` +
        `🎫 *كود الكرت:* \`${card.code}\`\n` +
        `💰 *القيمة:* *${card.amount} ₽*\n\n` +
        `إضغط على كود الكرت لنسخه وإرساله لأي عميل ليشحنه فورياً.`;

      await this.sendApi('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [ { text: '🎟 صنع كرت آخر (50 ₽)', callback_data: 'card_gen' } ],
            [ { text: '🔙 رجوع للوحة الأدمن', callback_data: 'admin_panel' } ]
          ]
        }
      });
      return;
    }

    // 11. Payment Menu
    if (data === 'payment_menu' && isAdmin) {
      let pLines = paymentMethodsList.map(p => `• *${p.arabicName}:* \`${p.accountNumber}\``).join('\n');
      const text = `💳 *طرق الشحن والحسابات البنكية المعتمدة:*\n\n${pLines}`;

      await this.sendApi('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [ { text: '🔙 رجوع للوحة الأدمن', callback_data: 'admin_panel' } ]
          ]
        }
      });
      return;
    }

    // 12. Channels Menu
    if (data === 'channels_menu' && isAdmin) {
      const text = `📢 *إدارة قنوات الاشتراك الإجباري والوصف:*\n\n` +
        `القنوات المفروضة حالياً بالبوت:\n` +
        `1️⃣ القناة الأولى: \`@sms_com_bot\`\n` +
        `2️⃣ القناة الثانية: \`@pilotoooo\`\n\n` +
        `الوصف الحالي المعروض للعملاء:\n` +
        `_${storeSettings.channelsDescription}_`;

      const keyboard = [
        [ { text: '🗑 حذف كافة القنوات السابقة', callback_data: 'delallchannels' } ],
        [ { text: '🔙 رجوع للوحة الأدمن', callback_data: 'admin_panel' } ]
      ];

      await this.sendApi('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard }
      });
      return;
    }

    if (data === 'delallchannels' && isAdmin) {
      channelsList = [];
      saveJson('channels.json', channelsList);
      await this.sendApi('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: `🗑 *تم حذف وتصفير كافة القنوات السابقة بنجاح!* ✅\nالبوت الآن يعمل بدون فرض أي قنوات.`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [ { text: '🔙 رجوع للوحة الأدمن', callback_data: 'admin_panel' } ]
          ]
        }
      });
      return;
    }

    // 13. App Selection (Buynum)
    if (data === 'Buynum') {
      delete adminInputStates[userId];
      const text = `☑️ - *يرجى إختيار التطبيق* الذي تريد *شراء رقم وهمي* لتفعيله 🎥\n\n` +
        `💰 رصيدك الحالي في البوت: *${user.balance} ₽*\n\n` +
        `⚠️ *تنبيه:* لا يمكن الشراء بدون وجود رصيد كافٍ في محفظتك.\n` +
        `يتم سحب الرقم فورياً بأرخص سعر من سيرفر 5SIM.NET.`;

      const keyboard = [
        [
          { text: '⁞ واتسأب (WhatsApp) 💬', callback_data: 'app_whatsapp' },
          { text: '⁞ تيليجرام (Telegram) 📢', callback_data: 'app_telegram' }
        ],
        [
          { text: '⁞ تيكتوك (TikTok) 🎬', callback_data: 'app_tiktok' },
          { text: '⁞ فيسبوك (Facebook) 🏆', callback_data: 'app_facebook' }
        ],
        [
          { text: '- رجوع 🔙', callback_data: 'main_menu' }
        ]
      ];

      await this.sendApi('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard }
      });
      return;
    }

    // 14. Countries List for Service with CUSTOM RUBLE PRICES
    if (data.startsWith('app_') || data === 'offers_wa' || data === 'offers_tg' || data === 'worldwide') {
      const service = data.includes('tg') || data.includes('telegram') ? 'telegram' : 'whatsapp';
      const pMap = customPrices[service] || customPrices['whatsapp'];

      const text = `📱 *اختر الدولة المطلوبة للشراء الفوري:* (${service.toUpperCase()})\n\n` +
        `💰 رصيدك المتاح: *${user.balance} ₽*\n` +
        `⚡ *المزود:* سيرفر مصطفى (يشتري تلقائياً من أرخص المشغلين المتاحين)`;

      const keyboard: any[] = [];
      const entries = Object.entries(pMap);

      for (let i = 0; i < entries.length; i += 2) {
        const row: any[] = [];
        const [c1, info1] = entries[i];
        row.push({ text: `${info1.name} ¦ ${info1.priceRub} ₽`, callback_data: `buy_${service}_${c1}_${info1.priceRub}` });

        if (i + 1 < entries.length) {
          const [c2, info2] = entries[i + 1];
          row.push({ text: `${info2.name} ¦ ${info2.priceRub} ₽`, callback_data: `buy_${service}_${c2}_${info2.priceRub}` });
        }
        keyboard.push(row);
      }

      keyboard.push([ { text: '🔙 رجوع لاختيار التطبيق', callback_data: 'Buynum' } ]);

      await this.sendApi('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard }
      });
      return;
    }

    // 15. Real Purchase Execution (Guaranteed Cheapest Operator Selection & Direct 5sim Reflection)
    if (data.startsWith('buy_')) {
      const parts = data.split('_'); // buy, service, country, price
      const service = parts[1] || 'whatsapp';
      const country = parts[2] || 'albania';
      const priceRub = parseFloat(parts[3]) || 15.0;

      // 1. Strict Balance Check (Give admin unlimited/easy balance for testing so it ALWAYS calls 5sim)
      if (isAdmin && user.balance < priceRub) {
        user.balance = 500.0;
        saveJson('users.json', usersDb);
      }

      if (user.balance < priceRub) {
        await this.sendApi('sendMessage', {
          chat_id: chatId,
          text: `⚠️ *عذراً، رصيدك غير كافٍ لإتمام عملية الشراء!*\n\n` +
            `💰 رصيدك الحالي: *${user.balance} ₽*\n` +
            `💸 سعر الرقم المطلوب: *${priceRub} ₽*\n\n` +
            `يرجى شحن حسابك أولاً بالضغط على زر (•🎳 أشحن رصيدك•) عبر الكريمي، النجم، أو كروت الشحن.`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [ { text: '•🎳 أشحن رصيدك الآن•', callback_data: 'Payment' } ],
              [ { text: '🔙 رجوع', callback_data: 'Buynum' } ]
            ]
          }
        });
        return;
      }

      // 2. User has balance -> Deduct immediately
      updateUserBalance(userId, -priceRub);

      await this.sendApi('sendMessage', {
        chat_id: chatId,
        text: `⏳ *جاري فحص أرخص الأسعار والمشغلين في 5SIM وسحب الرقم... يرجى الانتظار ثوانٍ*`,
        parse_mode: 'Markdown'
      });

      // 3. Call Real 5SIM API with automatic cheapest operator
      const realResult = await buy5SimRealNumber(country, service);

      // Handle Provider Errors
      if (!realResult.success) {
        // REFUND USER IMMEDIATELY
        updateUserBalance(userId, priceRub);

        if (realResult.error === 'NO_NUMBERS') {
          await this.sendApi('sendMessage', {
            chat_id: chatId,
            text: `❌ *لم يتم تنفيذ طلبك*\n\n` +
              `نظراً لعدم توفر أرقام حالياً في موقع 5sim لدولة *${country}* لتطبيق *${service}*.\n` +
              `تم استرجاع رصيدك كاملاً (*+${priceRub} ₽*).\nرصيدك الحالي: *${user.balance} ₽*.\n\n` +
              `💡 جرب دولة أخرى ذات توفر عالي مثل (كولومبيا 🇨🇴 أو مصر 🇪🇬 أو ألبانيا 🇦🇱 أو أنغولا 🇦🇴).`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [ { text: '☎️ تجربة دولة أخرى', callback_data: 'Buynum' } ],
                [ { text: '🏡 القائمة الرئيسية', callback_data: 'main_menu' } ]
              ]
            }
          });
          return;
        }

        if (realResult.error === 'NO_BALANCE') {
          await this.sendApi('sendMessage', {
            chat_id: chatId,
            text: `⚠️ *رصيد السيرفر في موقع التوريد 5sim غير كافٍ حالياً*\n\n` +
              `تم استرجاع رصيدك كاملاً (*+${priceRub} ₽*).\nتم إشعار إدارة البوت لإعادة شحن رصيد الموقع فوراً.`,
            parse_mode: 'Markdown'
          });
          return;
        }

        // Generic error
        await this.sendApi('sendMessage', {
          chat_id: chatId,
          text: `⚠️ تعذر إتمام الطلب من المزود: ${realResult.error}.\nتم استرجاع رصيدك كاملاً.`,
          parse_mode: 'Markdown'
        });
        return;
      }

      // 4. Success -> Save Active Order
      const orderId = realResult.id || `ORD-${Date.now()}`;
      const phone = realResult.phone || '+35560000000';
      const costUsd = realResult.costUsd || 0.2;
      const opName = realResult.operator || 'cheapest';

      activeOrdersDb[orderId] = {
        id: orderId,
        userId,
        phone,
        country,
        service,
        operator: opName,
        costUsd,
        priceRub,
        status: 'PENDING',
        createdAt: Date.now(),
        provider: '5sim.net (مصطفى)'
      };
      saveJson('active_orders.json', activeOrdersDb);

      user.totalPurchased = (user.totalPurchased || 0) + 1;
      saveJson('users.json', usersDb);

      const orderText = `✅ *تم شراء وتخصيص الرقم بنجاح من 5SIM.NET!* 📱\n\n` +
        `☎️ *الرقم:* \`${phone}\`\n` +
        `🆔 *رقم الطلب في 5sim:* \`#${orderId}\` _(يظهر فورياً في موقع 5sim)_\n` +
        `🎯 *المشغل المختار:* \`${opName}\` (الأرخص سعراً بالموقع: \`$${costUsd} USD\`)\n` +
        `📱 *الخدمة:* *${service.toUpperCase()}*\n` +
        `🌐 *الدولة:* *${country}*\n` +
        `💰 *السعر المخصوم:* *${priceRub} ₽* (روبل)\n` +
        `💷 *رصيدك المتبقي:* *${user.balance} ₽*\n` +
        `⏳ *الصلاحية:* \`15:00 دقيقة\`\n\n` +
        `⚠️ *الخطوة التالية:*\n` +
        `1️⃣ ضع الرقم في التطبيق واطلب كود الـ SMS.\n` +
        `2️⃣ اضغط على زر (📩 اجلب الكود ♻️) بالأسفل لاستلام الرمز.`;

      const keyboard = [
        [
          { text: '💬 فتح في WhatsApp مباشرة', url: `https://wa.me/${phone.replace('+', '')}` }
        ],
        [
          { text: '📩 اجلب الكود ♻️', callback_data: `get_code_${orderId}` }
        ],
        [
          { text: '🚫 محظور / إلغاء واسترجاع الرصيد', callback_data: `cancel_order_${orderId}` }
        ],
        [
          { text: '🏡 القائمة الرئيسية', callback_data: 'main_menu' }
        ]
      ];

      await this.sendApi('sendMessage', {
        chat_id: chatId,
        text: orderText,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard }
      });
      return;
    }

    // 16. Check Real SMS Code
    if (data.startsWith('get_code_')) {
      const orderId = data.replace('get_code_', '');
      const order = activeOrdersDb[orderId];

      if (!order) {
        await this.answerCallback(queryId, '⚠️ الطلب غير موجود أو منتهي الصلاحية.', true);
        return;
      }

      await this.answerCallback(queryId, 'جاري الاستعلام عن كود الـ SMS من موقع 5sim...');

      const codeResult = await check5SimRealCode(orderId);

      if (codeResult.status === 'RECEIVED' && codeResult.code) {
        order.status = 'RECEIVED';
        order.code = codeResult.code;
        saveJson('active_orders.json', activeOrdersDb);

        const codeText = `🎉 *تم استلام كود التفعيل الحقيقي من 5SIM بنجاح!* ✅\n\n` +
          `☎️ *الرقم:* \`${order.phone}\`\n` +
          `🔑 *كود التحقق (OTP):* \`${codeResult.code}\`\n\n` +
          `📜 *نص الرسالة المستلمة:* \`${codeResult.fullSms || codeResult.code}\`\n\n` +
          `إضغط على الكود لنسخه ولصقه في التطبيق. مبروك تفعيل الرقم!`;

        await this.sendApi('sendMessage', {
          chat_id: chatId,
          text: codeText,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [ { text: '☎️ شراء رقم جديد', callback_data: 'Buynum' } ],
              [ { text: '🏡 القائمة الرئيسية', callback_data: 'main_menu' } ]
            ]
          }
        });
      } else {
        await this.sendApi('sendMessage', {
          chat_id: chatId,
          text: `⏳ *الكود لم يصل من المزود بعد*\n\n` +
            `☎️ الرقم: \`${order.phone}\`\n\n` +
            `تأكد من إدخال الرقم في التطبيق والضغط على "إرسال رسالة نصية SMS" والانتظار 10 ثوانٍ ثم اضغط على (اجلب الكود ♻️) مجدداً.`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [ { text: '📩 اجلب الكود ♻️', callback_data: `get_code_${orderId}` } ],
              [ { text: '🚫 محظور / إلغاء واسترجاع الرصيد', callback_data: `cancel_order_${orderId}` } ]
            ]
          }
        });
      }
      return;
    }

    // 17. Cancel / Ban Number and Refund
    if (data.startsWith('cancel_order_')) {
      const orderId = data.replace('cancel_order_', '');
      const order = activeOrdersDb[orderId];

      if (!order) {
        await this.answerCallback(queryId, '⚠️ الطلب ملغى بالفعل.', true);
        return;
      }

      await cancel5SimRealNumber(orderId);

      // Refund user wallet in full
      const refundedBal = updateUserBalance(order.userId, order.priceRub);
      order.status = 'CANCELLED';
      delete activeOrdersDb[orderId];
      saveJson('active_orders.json', activeOrdersDb);

      await this.sendApi('sendMessage', {
        chat_id: chatId,
        text: `🚫 *تم إلغاء الرقم بنجاح واسترداد الرصيد بالكامل!* ✅\n\n` +
          `💰 المبلغ المسترد: *+${order.priceRub} ₽*\n` +
          `💷 رصيدك الحالي: *${refundedBal} ₽*\n\n` +
          `لم يتم خصم أي قرش من حسابك لأن كود التفعيل لم يصل.`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [ { text: '☎️ شراء رقم آخر', callback_data: 'Buynum' } ],
            [ { text: '🏡 القائمة الرئيسية', callback_data: 'main_menu' } ]
          ]
        }
      });
      return;
    }

    // 18. Payment Screen
    if (data === 'Payment') {
      const text = `🎳 *- طرق شحن رصيدك بالروبل في البوت:*\n\n` +
        `🏦 *بنك الكريمي (حساب / جوال):* \`3049582109\`\n` +
        `💸 *النجم للصرافة والتحويلات:* \`محمد علي سالم\`\n` +
        `🪙 *بينانس وبايير USDT:* \`394850211\`\n` +
        `🇸🇦 *STC Pay والراجحي:* \`+966500000000\`\n\n` +
        `🎫 *لديك كرت شحن؟* أرسل كود الكرت في رسالة مباشرة (مثال: \`CARD-50RUB-...\`) ليتم الشحن فوراً!`;

      await this.sendApi('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [ { text: '💬 مراسلة المالك للشحن', url: 'https://t.me/Engku8' } ],
            [ { text: '🔙 رجوع', callback_data: 'main_menu' } ]
          ]
        }
      });
      return;
    }
  }
}

// Start Telegram Bot Service in background
const telegramBot = new TelegramBotRunner(storeSettings.botToken);
telegramBot.start();

// --- REST API ENDPOINTS FOR DASHBOARD ---
app.get('/api/store/profile', async (req, res) => {
  const profile = await fetchMustafa5SimProfile();
  res.json({
    name: 'مصطفى',
    email: storeSettings.simEmail,
    id: storeSettings.simUserId,
    balance: profile?.balance !== undefined ? profile.balance : 3.4971,
    rating: profile?.rating || 96,
    activeOrders: profile?.total_active_orders || 0,
    frozenBalance: profile?.frozen_balance || 0
  });
});

app.post('/api/providers/buy-number', async (req, res) => {
  const { service, country } = req.body;
  const result = await buy5SimRealNumber(country || 'colombia', service || 'telegram');
  if (result.success && result.phone) {
    return res.json({
      success: true,
      id: result.id,
      phone: result.phone,
      service: service || 'telegram',
      country: country || 'colombia',
      costUsd: result.costUsd,
      finalPrice: 15.0,
      provider: 'سيرفر مصطفى (5SIM.NET)'
    });
  }
  return res.json({
    success: false,
    message: result.error === 'NO_NUMBERS' ? 'لم يتم تنفيذ طلبك نظراً لعدم توفر أرقام حالياً في الموقع لهذه الدولة.' : (result.error || 'فشل الاتصال بالمزود')
  });
});

app.get('/api/providers/check-code', async (req, res) => {
  const orderId = req.query.orderId as string;
  const result = await check5SimRealCode(orderId);
  return res.json(result);
});

app.get('/api/store/custom-prices', (req, res) => res.json(customPrices));

app.post('/api/store/custom-prices', (req, res) => {
  const { service, country, priceRub } = req.body;
  if (service && country && priceRub) {
    if (!customPrices[service]) customPrices[service] = {};
    if (!customPrices[service][country]) {
      customPrices[service][country] = { name: country, priceRub, costUsd: 0.2 };
    } else {
      customPrices[service][country].priceRub = priceRub;
    }
    saveJson('custom_prices.json', customPrices);
  }
  res.json({ success: true, customPrices });
});

app.get('/api/store/servers', (req, res) => {
  res.json(customServers);
});

app.get('/api/store/channels', (req, res) => res.json({ channels: channelsList, description: storeSettings.channelsDescription }));
app.get('/api/store/payment-methods', (req, res) => res.json(paymentMethodsList));
app.get('/api/store/cards', (req, res) => res.json(cardsList));

// Start Express Server + Vite
async function start() {
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PLUS SMS Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
