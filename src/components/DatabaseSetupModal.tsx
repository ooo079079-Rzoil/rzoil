import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Server, 
  KeyRound, 
  User, 
  Layers, 
  Download, 
  ExternalLink, 
  ShieldCheck,
  Zap,
  HelpCircle,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import { DatabaseConfig, DatabaseStatus, Product, Distributor, Order } from '../types';
import { 
  testDatabaseConnection, 
  saveAndInitDatabase, 
  saveDbConfigToStorage,
  syncLocalDataToDatabase 
} from '../services/databaseService';

interface DatabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DatabaseConfig;
  onUpdateConfig: (newConfig: DatabaseConfig) => void;
  products: Product[];
  distributors: Distributor[];
  orders: Order[];
}

export const DatabaseSetupModal: React.FC<DatabaseSetupModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  products,
  distributors,
  orders
}) => {
  const [form, setForm] = useState<DatabaseConfig>(config);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<DatabaseStatus>({
    isConnected: config.isConfigured,
    isChecking: false,
    message: config.isConfigured ? 'تم تهيئة قاعدة البيانات مسبقاً' : 'في انتظار إدخال بيانات خادم InfinityFree والتحقق'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'connection' | 'guide' | 'sql'>('connection');
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    setForm(config);
  }, [config, isOpen]);

  if (!isOpen) return null;

  // Handle Testing Connection
  const handleTestConnection = async () => {
    if (!form.dbHost.trim() || !form.dbName.trim() || !form.dbUser.trim()) {
      setStatus({
        isConnected: false,
        isChecking: false,
        message: 'يرجى إدخال اسم الخادم (Host) واسم القاعدة (Database) واسم المستخدم أولاً.'
      });
      return;
    }

    setStatus({
      isConnected: false,
      isChecking: true,
      message: 'جاري فحص الاتصال مع خادم InfinityFree والتحقق من الجداول...'
    });

    const result = await testDatabaseConnection(form);
    setStatus(result);
  };

  // Handle Saving Config & Initializing
  const handleSaveAndInit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Save locally first
    const updatedConfig: DatabaseConfig = {
      ...form,
      isConfigured: true,
      connectedAt: new Date().toISOString()
    };
    saveDbConfigToStorage(updatedConfig);
    onUpdateConfig(updatedConfig);

    // Call server to generate db_config.php and create MySQL tables
    const res = await saveAndInitDatabase(updatedConfig);
    setIsSaving(false);

    if (res.success) {
      setStatus({
        isConnected: true,
        isChecking: false,
        message: 'تم الاتصال وتثبيت جداول قاعدة البيانات بنجاح في InfinityFree! ' + res.message
      });
    } else {
      setStatus({
        isConnected: false,
        isChecking: false,
        message: 'تم حفظ البيانات محلياً، ولكن ' + res.message
      });
    }
  };

  // Handle Sync Data to MySQL
  const handleSyncAll = async () => {
    setIsSyncing(true);
    const res = await syncLocalDataToDatabase(form, products, distributors, orders);
    setIsSyncing(false);
    alert(res.message);
  };

  // Download files helpers
  const handleDownloadApiPhp = () => {
    const link = document.createElement('a');
    link.href = '/api.php';
    link.download = 'api.php';
    link.click();
  };

  const handleDownloadSql = () => {
    const link = document.createElement('a');
    link.href = '/rzoil_database.sql';
    link.download = 'rzoil_database.sql';
    link.click();
  };

  const copySqlToClipboard = () => {
    fetch('/rzoil_database.sql')
      .then(res => res.text())
      .then(text => {
        navigator.clipboard.writeText(text);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 2500);
      })
      .catch(() => alert('تعذر نسخ كود SQL'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-200 dark:border-gray-700 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#181818] border-b-2 border-[#ea1b25] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#ea1b25] flex items-center justify-center text-white shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>ربط قاعدة بيانات InfinityFree (MySQL / MariaDB)</span>
                {status.isConnected ? (
                  <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    متصل
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    غير متصل
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-400">إدارة الاتصال السحابي الحقيقي لمتجر رزويل الأردن</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-100 dark:bg-[#252525] px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('connection')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'connection' 
                ? 'bg-white dark:bg-[#181818] text-[#ea1b25] shadow-xs' 
                : 'text-gray-600 dark:text-gray-300 hover:text-[#ea1b25]'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>بيانات الاتصال والفحص</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide' 
                ? 'bg-white dark:bg-[#181818] text-[#ea1b25] shadow-xs' 
                : 'text-gray-600 dark:text-gray-300 hover:text-[#ea1b25]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>دليل الرفع خطوة بخطوة</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sql' 
                ? 'bg-white dark:bg-[#181818] text-[#ea1b25] shadow-xs' 
                : 'text-gray-600 dark:text-gray-300 hover:text-[#ea1b25]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>تحميل ملفات الربط و SQL</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-sm">
          
          {/* Status Message Card */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
            status.isChecking
              ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300'
              : status.isConnected
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          }`}>
            {status.isChecking ? (
              <RefreshCw className="w-5 h-5 animate-spin shrink-0 mt-0.5 text-blue-600" />
            ) : status.isConnected ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
            )}

            <div className="flex-1 text-xs space-y-1">
              <div className="font-bold text-sm">
                {status.isChecking ? 'جاري الفحص والتحقق...' : status.isConnected ? 'الاتصال نشط ومؤكد بنجاح' : 'حالة الاتصال'}
              </div>
              <p className="leading-relaxed">{status.message}</p>
              
              {status.dbVersion && (
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-gray-700 dark:text-gray-300">
                  <span className="bg-white/60 dark:bg-black/40 px-2 py-0.5 rounded">إصدار الخادم: {status.dbVersion}</span>
                  {status.latencyMs !== undefined && (
                    <span className="bg-white/60 dark:bg-black/40 px-2 py-0.5 rounded">سرعة الاستجابة: {status.latencyMs} ms</span>
                  )}
                  {status.tablesFound && status.tablesFound.length > 0 && (
                    <span className="bg-white/60 dark:bg-black/40 px-2 py-0.5 rounded">الجداول المكتشفة: {status.tablesFound.length}</span>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={status.isChecking}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#181818] border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs hover:bg-gray-50 flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
              title="إعادة الفحص"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status.isChecking ? 'animate-spin' : ''}`} />
              <span>فحص الآن</span>
            </button>
          </div>

          {/* TAB 1: CONNECTION FORM */}
          {activeTab === 'connection' && (
            <form onSubmit={handleSaveAndInit} className="space-y-4">
              
              <div className="bg-gray-50 dark:bg-[#252525] p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3 text-xs">
                <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 text-sm">
                  <Server className="w-4 h-4 text-[#ea1b25]" />
                  <span>بيانات خادم MySQL الخاصة بك من InfinityFree (vPanel):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Host */}
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      خادم قاعدة البيانات (MySQL Hostname) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. sql123.infinityfree.com أو localhost"
                      value={form.dbHost}
                      onChange={(e) => setForm({ ...form, dbHost: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1c1c1c] font-mono text-left"
                      dir="ltr"
                    />
                    <span className="text-[10px] text-gray-500 mt-0.5 block">
                      تجد هذا العنوان في لوحة تحكم vPanel تحت MySQL Databases
                    </span>
                  </div>

                  {/* DB Name */}
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      اسم قاعدة البيانات (Database Name) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. if0_38123456_rzoil"
                      value={form.dbName}
                      onChange={(e) => setForm({ ...form, dbName: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1c1c1c] font-mono text-left"
                      dir="ltr"
                    />
                    <span className="text-[10px] text-gray-500 mt-0.5 block">
                      يبدأ عادةً بـ if0_ واسم القاعدة الذي أنشأته
                    </span>
                  </div>

                  {/* User */}
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      اسم مستخدم القاعدة (MySQL Username) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. if0_38123456"
                      value={form.dbUser}
                      onChange={(e) => setForm({ ...form, dbUser: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1c1c1c] font-mono text-left"
                      dir="ltr"
                    />
                    <span className="text-[10px] text-gray-500 mt-0.5 block">
                      نفس اسم مستخدم حساب الاستضافة الخاص بك في InfinityFree
                    </span>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      كلمة مرور القاعدة (MySQL Password) *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="كلمة مرور vPanel الخاصة بك"
                        value={form.dbPass}
                        onChange={(e) => setForm({ ...form, dbPass: e.target.value })}
                        className="w-full h-9 px-3 pl-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1c1c1c] font-mono text-left"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-2.5 top-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-0.5 block">
                      نفس كلمة المرور التي تدخل بها للوحة تحكم InfinityFree
                    </span>
                  </div>

                  {/* API Endpoint */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      مسار جسر الربط البرمجي (API Endpoint)
                    </label>
                    <input
                      type="text"
                      value={form.apiEndpoint}
                      onChange={(e) => setForm({ ...form, apiEndpoint: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1c1c1c] font-mono text-left"
                      dir="ltr"
                    />
                    <span className="text-[10px] text-gray-500 mt-0.5 block">
                      القيمة الافتراضية <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">./api.php</code> (تعمل تلقائياً عند رفع ملفات الموقع داخل مجلد htdocs)
                    </span>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={status.isChecking}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold text-xs flex items-center gap-2 cursor-pointer transition"
                  >
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>فحص وتحقق من الاتصال</span>
                  </button>

                  {status.isConnected && (
                    <button
                      type="button"
                      onClick={handleSyncAll}
                      disabled={isSyncing}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition shadow"
                      title="رفع كافة المنتجات والموزعين لقاعدة البيانات"
                    >
                      <Layers className="w-4 h-4" />
                      <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة كافة البيانات إلى MySQL'}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs hover:bg-gray-300 transition cursor-pointer"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-[#ea1b25] hover:bg-[#c9141d] text-white font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isSaving ? 'جاري التثبيت...' : 'حفظ وتثبيت الجداول في InfinityFree'}</span>
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* TAB 2: STEP BY STEP GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <span>🚀 طريقة رفع الموقع وربطه بـ InfinityFree خطوة بخطوة:</span>
                </h4>

                <ol className="space-y-2.5 list-decimal list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
                  <li>
                    <strong>إنشاء حساب وقاعدة بيانات في InfinityFree:</strong>
                    <p className="mr-5 text-gray-500 dark:text-gray-400 mt-0.5">
                      ادخل إلى حسابك في InfinityFree ثم افتح لوحة التحكم <strong>Control Panel (vPanel)</strong> ← انقر على <strong>MySQL Databases</strong> ← اكتب اسماً لقاعدتك واضغط <strong>Create Database</strong>.
                    </p>
                  </li>

                  <li>
                    <strong>نسخ بيانات الخادم:</strong>
                    <p className="mr-5 text-gray-500 dark:text-gray-400 mt-0.5">
                      انسخ من الصفحة: <strong>MySQL Hostname</strong> (مثل sql300.infinityfree.com)، و <strong>Database Name</strong>، و <strong>Username</strong>.
                    </p>
                  </li>

                  <li>
                    <strong>رفع ملفات الموقع:</strong>
                    <p className="mr-5 text-gray-500 dark:text-gray-400 mt-0.5">
                      افتح <strong>Online File Manager</strong> أو برنامج <strong>FileZilla</strong> وادخل لمجلد <strong>htdocs</strong>. ارفع كافة الملفات الموجودة في مجلد <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">dist</code> (التي تتضمن <code className="text-[#ea1b25]">index.html</code> وملف <code className="text-[#ea1b25]">api.php</code> وملف <code className="text-[#ea1b25]">.htaccess</code>).
                    </p>
                  </li>

                  <li>
                    <strong>إدخال البيانات في الموقع:</strong>
                    <p className="mr-5 text-gray-500 dark:text-gray-400 mt-0.5">
                      افتح موقعك على الرابط المجاني (مثال: <code className="text-blue-600">yoursite.infinityfreeapp.com</code>)، ستظهر لك نافذة إعداد القاعدة أو افتحها من زر "قاعدة البيانات" في الأعلى، وضع البيانات ثم اضغط <strong>"حفظ وتثبيت الجداول"</strong>.
                    </p>
                  </li>

                  <li>
                    <strong>استقبال وتخزين الطلبات الحقيقية:</strong>
                    <p className="mr-5 text-gray-500 dark:text-gray-400 mt-0.5">
                      بمجرد ربط القاعدة، أي طلب شراء يقوم به أي زبون من داخل الأردن سيتم تسجيله فوراً داخل جدول <code className="font-bold text-[#ea1b25]">rzoil_orders</code> في قاعدة بيانات InfinityFree الحقيقية، ويمكنك مشاهدته في phpMyAdmin أو في لوحة الإدارة!
                    </p>
                  </li>
                </ol>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900 text-xs">
                <span className="font-bold text-[#ea1b25]">هل تحتاج الملفات المنفصلة الآن؟</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadApiPhp}
                    className="px-3 py-1.5 bg-[#ea1b25] text-white rounded-lg font-bold hover:bg-[#c9141d] transition flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل api.php</span>
                  </button>
                  <button
                    onClick={handleDownloadSql}
                    className="px-3 py-1.5 bg-gray-800 text-white rounded-lg font-bold hover:bg-black transition flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل ملف SQL</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SQL DOWNLOAD & CODE */}
          {activeTab === 'sql' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <p className="text-gray-600 dark:text-gray-300">
                  يمكنك استيراد هذا الكود مباشرة من داخل <strong>phpMyAdmin</strong> لإنشاء الجداول والبيانات مسبقاً إذا أردت:
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copySqlToClipboard}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 font-bold rounded-lg flex items-center gap-1 cursor-pointer transition"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'تم النسخ!' : 'نسخ كود SQL'}</span>
                  </button>

                  <button
                    onClick={handleDownloadSql}
                    className="px-3 py-1 bg-[#ea1b25] text-white font-bold rounded-lg hover:bg-[#c9141d] flex items-center gap-1 cursor-pointer transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل rzoil_database.sql</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-gray-900 text-gray-100 rounded-xl font-mono text-[11px] overflow-x-auto max-h-64 border border-gray-800" dir="ltr">
                <pre>{`-- RZ Oil Jordan - InfinityFree MySQL Schema
CREATE TABLE IF NOT EXISTS \`rzoil_products\` (
  \`id\` varchar(64) PRIMARY KEY,
  \`code\` varchar(64) NOT NULL,
  \`name\` varchar(255) NOT NULL,
  \`price\` decimal(10,2) NOT NULL DEFAULT '0.00',
  \`category\` varchar(100) DEFAULT 'اضافات الوقود',
  \`image\` mediumtext,
  \`in_stock\` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`rzoil_orders\` (
  \`id\` varchar(64) PRIMARY KEY,
  \`order_number\` varchar(64) NOT NULL UNIQUE,
  \`customer_name\` varchar(255) NOT NULL,
  \`phone\` varchar(64) NOT NULL,
  \`city\` varchar(100) NOT NULL,
  \`address\` text NOT NULL,
  \`items_json\` mediumtext NOT NULL,
  \`grand_total\` decimal(10,2) NOT NULL DEFAULT '0.00',
  \`status\` enum('pending','processing','delivered','cancelled') DEFAULT 'pending',
  \`created_at\` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`rzoil_distributors\` (
  \`id\` varchar(64) PRIMARY KEY,
  \`city\` varchar(100) NOT NULL,
  \`area\` varchar(255) NOT NULL,
  \`phone\` varchar(64) NOT NULL,
  \`address\` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`}</pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-[#181818] border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1 text-[11px]">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>متوافق مع خوادم MySQL و MariaDB الخاصة بـ InfinityFree و cPanel</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
