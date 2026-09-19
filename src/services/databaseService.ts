import { DatabaseConfig, DatabaseStatus, Order, Product, Distributor } from '../types';

const STORAGE_KEY = 'rzoil_infinityfree_db_config';

export const DEFAULT_DB_CONFIG: DatabaseConfig = {
  dbHost: 'sql101.infinityfree.com',
  dbName: 'if0_42956889_rzoil',
  dbUser: 'if0_42956889',
  dbPass: 'nmoA7jsmA8c9ODH',
  apiEndpoint: './api.php',
  isConfigured: true,
  autoSync: true
};

export const getSavedDbConfig = (): DatabaseConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_DB_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error loading DB config from storage', e);
  }
  return DEFAULT_DB_CONFIG;
};

export const saveDbConfigToStorage = (config: DatabaseConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving DB config to storage', e);
  }
};

/**
 * Test connection to the InfinityFree MySQL database via the PHP bridge
 */
export const testDatabaseConnection = async (
  config: DatabaseConfig
): Promise<DatabaseStatus> => {
  const endpoint = config.apiEndpoint || './api.php';
  const startTime = Date.now();

  try {
    const response = await fetch(`${endpoint}?action=test_connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        dbHost: config.dbHost,
        dbUser: config.dbUser,
        dbPass: config.dbPass,
        dbName: config.dbName
      })
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      let parsedMsg = `خطأ في الخادم (HTTP ${response.status})`;
      try {
        const json = JSON.parse(errorText);
        if (json.message) parsedMsg = json.message;
      } catch {
        if (errorText.includes('404')) {
          parsedMsg = 'لم يتم العثور على ملف api.php على السيرفر. تأكد من رفع مجلد dist ومعه ملف api.php إلى مجلد htdocs في InfinityFree.';
        }
      }
      return {
        isConnected: false,
        isChecking: false,
        message: parsedMsg,
        errorMessage: parsedMsg,
        latencyMs,
        lastChecked: new Date().toLocaleTimeString('ar-JO')
      };
    }

    const data = await response.json();

    if (data.success) {
      return {
        isConnected: true,
        isChecking: false,
        message: data.message || 'تم الاتصال بقاعدة بيانات InfinityFree بنجاح!',
        dbVersion: data.dbVersion,
        tablesFound: data.tablesFound || [],
        latencyMs: data.latencyMs || latencyMs,
        lastChecked: new Date().toLocaleTimeString('ar-JO')
      };
    } else {
      return {
        isConnected: false,
        isChecking: false,
        message: data.message || 'فشل الاتصال بقاعدة البيانات',
        errorMessage: data.message,
        latencyMs,
        lastChecked: new Date().toLocaleTimeString('ar-JO')
      };
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    let userMsg = 'تعذر الوصول إلى مسار API. تأكد من أن الموقع مرفوع على سيرفر يدعم PHP (InfinityFree) وأن مسار api.php صحيح.';
    if (window.location.hostname.includes('run.app') || window.location.hostname === 'localhost') {
      userMsg = 'أنت حالياً في بيئة المعاينة السحابية (Cloud Preview). عند رفع الموقع على InfinityFree، سيتصل الملف api.php مباشرة بقاعدة بيانات MySQL الخاصة بك ويتحقق من البيانات.';
    }
    return {
      isConnected: false,
      isChecking: false,
      message: userMsg,
      errorMessage: err.message || String(err),
      latencyMs,
      lastChecked: new Date().toLocaleTimeString('ar-JO')
    };
  }
};

/**
 * Save configuration to server and auto-generate MySQL tables
 */
export const saveAndInitDatabase = async (
  config: DatabaseConfig
): Promise<{ success: boolean; message: string }> => {
  const endpoint = config.apiEndpoint || './api.php';
  try {
    const response = await fetch(`${endpoint}?action=save_config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dbHost: config.dbHost,
        dbUser: config.dbUser,
        dbPass: config.dbPass,
        dbName: config.dbName
      })
    });

    const data = await response.json();
    return {
      success: !!data.success,
      message: data.message || (data.success ? 'تم الحفظ بنجاح' : 'فشل الحفظ')
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'تعذر الاتصال بـ api.php على السيرفر: ' + (err.message || String(err))
    };
  }
};

/**
 * Check if the server already has a saved database config
 */
export const checkServerDbStatus = async (
  endpoint: string = './api.php'
): Promise<{ isConfigured: boolean; isConnected: boolean; message?: string; dbHost?: string; dbName?: string; counts?: any }> => {
  try {
    const response = await fetch(`${endpoint}?action=get_config_status`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
      return { isConfigured: false, isConnected: false, message: 'ملف api.php لم يتم رفعه بعد أو لا يستجيب' };
    }
    const data = await response.json();
    return data;
  } catch (e) {
    return { isConfigured: false, isConnected: false, message: 'في انتظار الرفع على سيرفر InfinityFree' };
  }
};

/**
 * Save a newly placed customer order directly to the InfinityFree MySQL database
 */
export const saveOrderToDatabase = async (
  config: DatabaseConfig,
  order: Order
): Promise<{ success: boolean; message: string }> => {
  if (!config.isConfigured) {
    return { success: false, message: 'قاعدة البيانات غير مهيأة بعد' };
  }

  const endpoint = config.apiEndpoint || './api.php';
  try {
    const res = await fetch(`${endpoint}?action=create_order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order })
    });
    const data = await res.json();
    return {
      success: !!data.success,
      message: data.message || 'تم حفظ الطلب في قاعدة البيانات'
    };
  } catch (e: any) {
    return {
      success: false,
      message: 'تعذر الاتصال بقاعدة البيانات: ' + e.message
    };
  }
};

/**
 * Bulk sync local products and distributors into the real MySQL database
 */
export const syncLocalDataToDatabase = async (
  config: DatabaseConfig,
  products: Product[],
  distributors: Distributor[],
  orders: Order[]
): Promise<{ success: boolean; message: string }> => {
  const endpoint = config.apiEndpoint || './api.php';
  try {
    const res = await fetch(`${endpoint}?action=sync_all_data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products, distributors, orders })
    });
    const data = await res.json();
    return {
      success: !!data.success,
      message: data.message || 'تمت المزامنة بنجاح'
    };
  } catch (e: any) {
    return {
      success: false,
      message: 'فشلت المزامنة مع السيرفر: ' + e.message
    };
  }
};

export const clearRemoteProducts = async (
  config: DatabaseConfig
): Promise<{ success: boolean; message: string }> => {
  const endpoint = config.apiEndpoint || './api.php';
  try {
    const res = await fetch(`${endpoint}?action=clear_all_products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    return {
      success: !!data.success,
      message: data.message || 'تم تصفير المنتجات في قاعدة البيانات'
    };
  } catch (e: any) {
    return {
      success: false,
      message: 'تعذر الاتصال بالسيرفر لتصفير المنتجات: ' + e.message
    };
  }
};

export const clearRemoteOrders = async (
  config: DatabaseConfig
): Promise<{ success: boolean; message: string }> => {
  const endpoint = config.apiEndpoint || './api.php';
  try {
    const res = await fetch(`${endpoint}?action=clear_all_orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    return {
      success: !!data.success,
      message: data.message || 'تم تصفير الطلبات في قاعدة البيانات'
    };
  } catch (e: any) {
    return {
      success: false,
      message: 'تعذر الاتصال بالسيرفر لتصفير الطلبات: ' + e.message
    };
  }
};
