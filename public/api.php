<?php
/**
 * RZ Oil Jordan - InfinityFree MySQL Database Bridge & API
 * الوكيل والموزع المعتمد لزيوت وإضافات رزويل الألمانية في الأردن
 *
 * This file connects the React frontend directly with your InfinityFree MySQL database.
 * Upload this file and the built frontend files into your InfinityFree 'htdocs' directory.
 */

// Enable error reporting for diagnostics during setup
error_reporting(E_ALL);
ini_set('display_errors', '0');

// CORS Headers for secure API access
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header("Content-Type: application/json; charset=UTF-8");

$configFile = __DIR__ . '/db_config.php';

// Helper to send JSON responses
function sendJson($status, $data = []) {
    http_response_code($status ? 200 : 400);
    echo json_encode(array_merge(['success' => $status], $data), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// Helper to get raw JSON input
function getJsonInput() {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// Get action
$action = isset($_GET['action']) ? trim($_GET['action']) : '';
$input = getJsonInput();
if (empty($action) && isset($input['action'])) {
    $action = trim($input['action']);
}

// Load database config if exists
$dbConfig = null;
if (file_exists($configFile)) {
    $loaded = include $configFile;
    if (is_array($loaded)) {
        $dbConfig = $loaded;
    }
}

// Function to establish database connection
function getDbConnection($host, $user, $pass, $db) {
    // Disable default mysqli error reporting to handle gracefully
    mysqli_report(MYSQLI_REPORT_OFF);
    $conn = @new mysqli($host, $user, $pass, $db);
    if ($conn->connect_error) {
        return ['error' => $conn->connect_error, 'errno' => $conn->connect_errno];
    }
    $conn->set_charset("utf8mb4");
    return ['conn' => $conn];
}

// -------------------------------------------------------------
// ACTION 1: TEST CONNECTION
// -------------------------------------------------------------
if ($action === 'test_connection') {
    $host = isset($input['dbHost']) ? trim($input['dbHost']) : ($dbConfig['host'] ?? '');
    $user = isset($input['dbUser']) ? trim($input['dbUser']) : ($dbConfig['user'] ?? '');
    $pass = isset($input['dbPass']) ? $input['dbPass'] : ($dbConfig['pass'] ?? '');
    $db   = isset($input['dbName']) ? trim($input['dbName']) : ($dbConfig['name'] ?? '');

    if (empty($host) || empty($user) || empty($db)) {
        sendJson(false, [
            'message' => 'يرجى تزويد كافة البيانات المطلوبة: اسم الخادم (Host)، اسم المستخدم، واسم قاعدة البيانات.'
        ]);
    }

    $startTime = microtime(true);
    $res = getDbConnection($host, $user, $pass, $db);

    if (isset($res['error'])) {
        $msg = 'فشل الاتصال بقاعدة بيانات InfinityFree: ' . $res['error'];
        if ($res['errno'] == 1045) {
            $msg = 'خطأ في اسم المستخدم أو كلمة المرور الخاصة بقاعدة بيانات InfinityFree (Error 1045). تأكد من صحة بيانات الدخول في vPanel.';
        } elseif ($res['errno'] == 1049) {
            $msg = 'قاعدة البيانات المحددة غير موجودة (Error 1049). يرجى التأكد من إنشاء قاعدة البيانات أولاً من لوحة تحكم InfinityFree.';
        } elseif ($res['errno'] == 2002) {
            $msg = 'تعذر الوصول إلى خادم MySQL المحدد (Error 2002). تأكد من كتابة اسم الخادم صحيحاً مثل sql123.infinityfree.com أو localhost.';
        }
        sendJson(false, [
            'message' => $msg,
            'errno' => $res['errno'],
            'raw_error' => $res['error']
        ]);
    }

    $conn = $res['conn'];
    $latencyMs = round((microtime(true) - $startTime) * 1000);
    $serverVersion = $conn->server_info;

    // Check existing tables
    $tables = [];
    $tableRes = $conn->query("SHOW TABLES");
    if ($tableRes) {
        while ($row = $tableRes->fetch_array()) {
            $tables[] = $row[0];
        }
    }

    $conn->close();

    sendJson(true, [
        'message' => 'تم الاتصال بنجاح وتأكيد صحة بيانات قاعدة بيانات InfinityFree (MySQL)!',
        'dbVersion' => 'MySQL / MariaDB ' . $serverVersion,
        'latencyMs' => $latencyMs,
        'tablesFound' => $tables,
        'host' => $host,
        'database' => $db
    ]);
}

// -------------------------------------------------------------
// ACTION 2: SAVE CONFIG & INITIALIZE TABLES
// -------------------------------------------------------------
if ($action === 'save_config') {
    $host = isset($input['dbHost']) ? trim($input['dbHost']) : '';
    $user = isset($input['dbUser']) ? trim($input['dbUser']) : '';
    $pass = isset($input['dbPass']) ? $input['dbPass'] : '';
    $db   = isset($input['dbName']) ? trim($input['dbName']) : '';

    if (empty($host) || empty($user) || empty($db)) {
        sendJson(false, ['message' => 'جميع الحقول مطلوبة لحفظ إعدادات قاعدة البيانات.']);
    }

    // Verify first
    $res = getDbConnection($host, $user, $pass, $db);
    if (isset($res['error'])) {
        sendJson(false, [
            'message' => 'تعذر حفظ الإعدادات لعدم استجابة قاعدة البيانات: ' . $res['error']
        ]);
    }

    $conn = $res['conn'];

    // 1. Create Tables
    $sqlQueries = [
        "CREATE TABLE IF NOT EXISTS `rzoil_products` (
            `id` VARCHAR(64) PRIMARY KEY,
            `code` VARCHAR(64) NOT NULL,
            `name` VARCHAR(255) NOT NULL,
            `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            `brand` VARCHAR(100) DEFAULT 'رزويل',
            `category` VARCHAR(100) DEFAULT 'اضافات الوقود',
            `image` MEDIUMTEXT,
            `description` TEXT,
            `volume` VARCHAR(64) DEFAULT '300 مل',
            `in_stock` TINYINT(1) DEFAULT 1,
            `features` TEXT,
            `usage_guide` TEXT,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS `rzoil_orders` (
            `id` VARCHAR(64) PRIMARY KEY,
            `order_number` VARCHAR(64) NOT NULL UNIQUE,
            `customer_name` VARCHAR(255) NOT NULL,
            `phone` VARCHAR(64) NOT NULL,
            `city` VARCHAR(100) NOT NULL,
            `address` TEXT NOT NULL,
            `notes` TEXT,
            `items_json` MEDIUMTEXT NOT NULL,
            `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            `shipping_cost` DECIMAL(10,2) NOT NULL DEFAULT 3.00,
            `grand_total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            `status` ENUM('pending', 'processing', 'delivered', 'cancelled') DEFAULT 'pending',
            `created_at` VARCHAR(64) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS `rzoil_distributors` (
            `id` VARCHAR(64) PRIMARY KEY,
            `city` VARCHAR(100) NOT NULL,
            `area` VARCHAR(255) NOT NULL,
            `phone` VARCHAR(64) NOT NULL,
            `address` TEXT,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS `rzoil_settings` (
            `key_name` VARCHAR(64) PRIMARY KEY,
            `value_text` TEXT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"
    ];

    foreach ($sqlQueries as $q) {
        $conn->query($q);
    }

    // 2. Save config to file safely
    $configContent = "<?php\n" .
        "// Auto-generated RZ Oil Jordan InfinityFree Database Config\n" .
        "return [\n" .
        "    'host' => " . var_export($host, true) . ",\n" .
        "    'user' => " . var_export($user, true) . ",\n" .
        "    'pass' => " . var_export($pass, true) . ",\n" .
        "    'name' => " . var_export($db, true) . ",\n" .
        "    'saved_at' => " . var_export(date('Y-m-d H:i:s'), true) . "\n" .
        "];\n";

    @file_put_contents($configFile, $configContent);

    $conn->close();

    sendJson(true, [
        'message' => 'تم حفظ إعدادات قاعدة البيانات وإنشاء الجداول بنجاح في سيرفر InfinityFree!',
        'connectedAt' => date('Y-m-d H:i:s')
    ]);
}

// -------------------------------------------------------------
// ACTION 3: GET CONFIG STATUS
// -------------------------------------------------------------
if ($action === 'get_config_status') {
    if (!$dbConfig) {
        sendJson(true, [
            'isConfigured' => false,
            'message' => 'قاعدة البيانات غير مهيأة بعد. يرجى إدخال بيانات الربط الخاصة بـ InfinityFree.'
        ]);
    }

    $res = getDbConnection($dbConfig['host'], $dbConfig['user'], $dbConfig['pass'], $dbConfig['name']);
    if (isset($res['error'])) {
        sendJson(true, [
            'isConfigured' => true,
            'isConnected' => false,
            'dbHost' => $dbConfig['host'],
            'dbName' => $dbConfig['name'],
            'dbUser' => $dbConfig['user'],
            'errorMessage' => 'تعذر الاتصال بقاعدة البيانات: ' . $res['error']
        ]);
    }

    $conn = $res['conn'];
    $version = $conn->server_info;

    // Count records
    $pCount = 0;
    $oCount = 0;
    $dCount = 0;

    $rp = $conn->query("SELECT COUNT(*) FROM `rzoil_products`");
    if ($rp) $pCount = intval($rp->fetch_row()[0]);

    $ro = $conn->query("SELECT COUNT(*) FROM `rzoil_orders`");
    if ($ro) $oCount = intval($ro->fetch_row()[0]);

    $rd = $conn->query("SELECT COUNT(*) FROM `rzoil_distributors`");
    if ($rd) $dCount = intval($rd->fetch_row()[0]);

    $conn->close();

    sendJson(true, [
        'isConfigured' => true,
        'isConnected' => true,
        'dbHost' => $dbConfig['host'],
        'dbName' => $dbConfig['name'],
        'dbUser' => $dbConfig['user'],
        'dbVersion' => $version,
        'savedAt' => $dbConfig['saved_at'] ?? '',
        'counts' => [
            'products' => $pCount,
            'orders' => $oCount,
            'distributors' => $dCount
        ]
    ]);
}

// -------------------------------------------------------------
// HELPER FOR ALL OTHER DATA ACTIONS: Check if DB is configured
// -------------------------------------------------------------
if (!$dbConfig) {
    sendJson(false, [
        'message' => 'قاعدة البيانات غير مربوطة حالياً. يرجى إعداد بيانات الاتصال أولاً.'
    ]);
}

$connRes = getDbConnection($dbConfig['host'], $dbConfig['user'], $dbConfig['pass'], $dbConfig['name']);
if (isset($connRes['error'])) {
    sendJson(false, [
        'message' => 'فشل الاتصال بقاعدة بيانات InfinityFree: ' . $connRes['error']
    ]);
}
$conn = $connRes['conn'];

// Auto-ensure required MySQL tables exist
$conn->query("CREATE TABLE IF NOT EXISTS `rzoil_products` (
    `id` VARCHAR(64) PRIMARY KEY,
    `code` VARCHAR(64),
    `name` VARCHAR(255) NOT NULL,
    `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `original_price` DECIMAL(10,2),
    `brand` VARCHAR(100) DEFAULT 'رزويل',
    `category` VARCHAR(100) DEFAULT 'اضافات الوقود',
    `image` MEDIUMTEXT,
    `description` TEXT,
    `volume` VARCHAR(64) DEFAULT '300 مل',
    `in_stock` TINYINT(1) DEFAULT 1,
    `features` TEXT,
    `usage_guide` TEXT,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

$conn->query("CREATE TABLE IF NOT EXISTS `rzoil_orders` (
    `id` VARCHAR(64) PRIMARY KEY,
    `order_number` VARCHAR(64) NOT NULL UNIQUE,
    `customer_name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(64) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `address` TEXT NOT NULL,
    `notes` TEXT,
    `items_json` MEDIUMTEXT NOT NULL,
    `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `shipping_cost` DECIMAL(10,2) NOT NULL DEFAULT 3.00,
    `grand_total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `status` ENUM('pending', 'processing', 'delivered', 'cancelled') DEFAULT 'pending',
    `created_at` VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

$conn->query("CREATE TABLE IF NOT EXISTS `rzoil_distributors` (
    `id` VARCHAR(64) PRIMARY KEY,
    `city` VARCHAR(100) NOT NULL,
    `area` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(64) NOT NULL,
    `address` TEXT,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

$conn->query("CREATE TABLE IF NOT EXISTS `rzoil_settings` (
    `key_name` VARCHAR(64) PRIMARY KEY,
    `value_text` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

// -------------------------------------------------------------
// ACTION: CREATE ORDER (حفظ طلب جديد من الزبون في قاعدة البيانات)
// -------------------------------------------------------------
if ($action === 'create_order') {
    $order = isset($input['order']) ? $input['order'] : $input;
    if (empty($order['orderNumber']) || empty($order['customerName']) || empty($order['phone'])) {
        sendJson(false, ['message' => 'بيانات الطلب غير مكتملة']);
    }

    $stmt = $conn->prepare("INSERT INTO `rzoil_orders` 
        (`id`, `order_number`, `customer_name`, `phone`, `city`, `address`, `notes`, `items_json`, `subtotal`, `shipping_cost`, `grand_total`, `status`, `created_at`) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $id = !empty($order['id']) ? $order['id'] : ('ord_' . time());
    $num = $order['orderNumber'];
    $name = $order['customerName'];
    $phone = $order['phone'];
    $city = $order['city'];
    $addr = $order['address'];
    $notes = $order['notes'] ?? '';
    $itemsJson = json_encode($order['items'] ?? [], JSON_UNESCAPED_UNICODE);
    $subtotal = floatval($order['subtotal'] ?? 0);
    $shipping = floatval($order['shippingCost'] ?? 3);
    $total = floatval($order['grandTotal'] ?? ($subtotal + $shipping));
    $status = $order['status'] ?? 'pending';
    $createdAt = $order['createdAt'] ?? date('Y/m/d H:i');

    $stmt->bind_param("ssssssssdddss", 
        $id, $num, $name, $phone, $city, $addr, $notes, $itemsJson, $subtotal, $shipping, $total, $status, $createdAt
    );

    if ($stmt->execute()) {
        sendJson(true, ['message' => 'تم تسجيل وحفظ الطلب في قاعدة بيانات InfinityFree بنجاح', 'orderNumber' => $num]);
    } else {
        sendJson(false, ['message' => 'فشل حفظ الطلب: ' . $stmt->error]);
    }
}

// -------------------------------------------------------------
// ACTION: GET ORDERS
// -------------------------------------------------------------
if ($action === 'get_orders') {
    $res = $conn->query("SELECT * FROM `rzoil_orders` ORDER BY `created_at` DESC");
    $orders = [];
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $orders[] = [
                'id' => $row['id'],
                'orderNumber' => $row['order_number'],
                'customerName' => $row['customer_name'],
                'phone' => $row['phone'],
                'city' => $row['city'],
                'address' => $row['address'],
                'notes' => $row['notes'],
                'items' => json_decode($row['items_json'], true) ?: [],
                'subtotal' => floatval($row['subtotal']),
                'shippingCost' => floatval($row['shipping_cost']),
                'grandTotal' => floatval($row['grand_total']),
                'status' => $row['status'],
                'createdAt' => $row['created_at']
            ];
        }
    }
    sendJson(true, ['orders' => $orders]);
}

// -------------------------------------------------------------
// ACTION: UPDATE ORDER STATUS
// -------------------------------------------------------------
if ($action === 'update_order_status') {
    $id = $input['orderId'] ?? '';
    $status = $input['status'] ?? 'pending';
    $stmt = $conn->prepare("UPDATE `rzoil_orders` SET `status` = ? WHERE `id` = ?");
    $stmt->bind_param("ss", $status, $id);
    $stmt->execute();
    sendJson(true, ['message' => 'تم تحديث حالة الطلب']);
}

// -------------------------------------------------------------
// ACTION: DELETE ORDER
// -------------------------------------------------------------
if ($action === 'delete_order') {
    $id = $input['orderId'] ?? '';
    $stmt = $conn->prepare("DELETE FROM `rzoil_orders` WHERE `id` = ?");
    $stmt->bind_param("ss", $id);
    $stmt->execute();
    sendJson(true, ['message' => 'تم حذف الطلب']);
}

// -------------------------------------------------------------
// ACTION: GET DISTRIBUTORS
// -------------------------------------------------------------
if ($action === 'get_distributors') {
    $res = $conn->query("SELECT * FROM `rzoil_distributors` ORDER BY `city` ASC");
    $distributors = [];
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $distributors[] = [
                'id' => $row['id'],
                'city' => $row['city'],
                'area' => $row['area'],
                'phone' => $row['phone'],
                'address' => $row['address']
            ];
        }
    }
    sendJson(true, ['distributors' => $distributors]);
}

// -------------------------------------------------------------
// ACTION: SAVE DISTRIBUTOR (INSERT OR UPDATE)
// -------------------------------------------------------------
if ($action === 'save_distributor') {
    $d = $input['distributor'] ?? $input;
    if (empty($d['id']) || empty($d['city']) || empty($d['phone'])) {
        sendJson(false, ['message' => 'بيانات الموزع غير مكتملة']);
    }
    $stmt = $conn->prepare("INSERT INTO `rzoil_distributors` (`id`, `city`, `area`, `phone`, `address`)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE `city` = VALUES(`city`), `area` = VALUES(`area`), `phone` = VALUES(`phone`), `address` = VALUES(`address`)");
    $stmt->bind_param("sssss", $d['id'], $d['city'], $d['area'], $d['phone'], $d['address']);
    $stmt->execute();
    sendJson(true, ['message' => 'تم حفظ الموزع في قاعدة البيانات بنجاح']);
}

// -------------------------------------------------------------
// ACTION: DELETE DISTRIBUTOR
// -------------------------------------------------------------
if ($action === 'delete_distributor') {
    $id = $input['distributorId'] ?? '';
    $stmt = $conn->prepare("DELETE FROM `rzoil_distributors` WHERE `id` = ?");
    $stmt->bind_param("ss", $id);
    $stmt->execute();
    sendJson(true, ['message' => 'تم حذف الموزع من قاعدة البيانات']);
}

// -------------------------------------------------------------
// ACTION: GET PRODUCTS
// -------------------------------------------------------------
if ($action === 'get_products') {
    $res = $conn->query("SELECT * FROM `rzoil_products` ORDER BY `price` DESC");
    $products = [];
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $products[] = [
                'id' => $row['id'],
                'code' => $row['code'],
                'name' => $row['name'],
                'price' => floatval($row['price']),
                'brand' => $row['brand'],
                'category' => $row['category'],
                'image' => $row['image'],
                'description' => $row['description'],
                'volume' => $row['volume'],
                'inStock' => (bool)$row['in_stock'],
                'features' => json_decode($row['features'], true) ?: ['صناعة ألمانية 100%'],
                'usage' => $row['usage_guide'] ?: 'حسب إرشادات الشركة الصانعة',
                'directions' => ['تأكد من إطفاء المحرك', 'صب المحتوى كاملاً']
            ];
        }
    }
    sendJson(true, ['products' => $products]);
}

// -------------------------------------------------------------
// ACTION: SYNC BULK DATA (تصدير كافة البيانات من التطبيق إلى MySQL)
// -------------------------------------------------------------
if ($action === 'sync_all_data') {
    $products = $input['products'] ?? [];
    $distributors = $input['distributors'] ?? [];
    $orders = $input['orders'] ?? [];

    if (!empty($products)) {
        foreach ($products as $p) {
            $stmt = $conn->prepare("INSERT INTO `rzoil_products` 
                (`id`, `code`, `name`, `price`, `brand`, `category`, `image`, `description`, `volume`, `in_stock`, `features`, `usage_guide`)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                `code`=VALUES(`code`), `name`=VALUES(`name`), `price`=VALUES(`price`), `category`=VALUES(`category`), `in_stock`=VALUES(`in_stock`)");
            $inStock = !empty($p['inStock']) ? 1 : 0;
            $featJson = json_encode($p['features'] ?? [], JSON_UNESCAPED_UNICODE);
            $usage = $p['usage'] ?? '';
            $desc = $p['description'] ?? '';
            $brand = $p['brand'] ?? 'رزويل';
            $vol = $p['volume'] ?? '300 مل';
            $price = floatval($p['price'] ?? 10);
            $stmt->bind_param("sssdsssssiss", 
                $p['id'], $p['code'], $p['name'], $price, $brand, $p['category'], $p['image'], $desc, $vol, $inStock, $featJson, $usage
            );
            $stmt->execute();
        }
    }

    if (!empty($distributors)) {
        foreach ($distributors as $d) {
            $stmt = $conn->prepare("INSERT INTO `rzoil_distributors` (`id`, `city`, `area`, `phone`, `address`)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE `city`=VALUES(`city`), `area`=VALUES(`area`), `phone`=VALUES(`phone`), `address`=VALUES(`address`)");
            $stmt->bind_param("sssss", $d['id'], $d['city'], $d['area'], $d['phone'], $d['address']);
            $stmt->execute();
        }
    }

    sendJson(true, ['message' => 'تمت مزامنة وحفظ جميع المنتجات والموزعين في قاعدة بيانات InfinityFree بنجاح!']);
}

// -------------------------------------------------------------
// ACTION: CLEAR ALL PRODUCTS (تصفير وحذف جميع المنتجات من MySQL)
// -------------------------------------------------------------
if ($action === 'clear_all_products') {
    $conn->query("TRUNCATE TABLE `rzoil_products`");
    sendJson(true, ['message' => 'تم تصفير جميع المنتجات من قاعدة بيانات MySQL بنجاح']);
}

// -------------------------------------------------------------
// ACTION: CLEAR ALL ORDERS (تصفير وحذف جميع الطلبات من MySQL)
// -------------------------------------------------------------
if ($action === 'clear_all_orders') {
    $conn->query("TRUNCATE TABLE `rzoil_orders`");
    sendJson(true, ['message' => 'تم تصفير جميع الطلبات من قاعدة بيانات MySQL بنجاح']);
}

// Fallback for unknown action
sendJson(false, ['message' => 'إجراء غير معروف: ' . $action]);
$conn->close();
