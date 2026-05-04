# 📊 Penjelasan Script Google Apps Script (Gate.io → Google Sheets)

Script ini digunakan untuk:
- Mengambil **saldo aset (spot account)** dari Gate.io  
- Mengambil **harga market (ticker)**  
- Menghitung total nilai semua aset dalam **USDT**  
- Menuliskannya ke **Google Sheets**

---

# ⚙️ 1. CONFIGURATION

```javascript
const MY_API_KEY = ""; 
const MY_API_SECRET = "";

const MY_HOST = "https://api.gateio.ws";
const MY_PREFIX = "/api/v4";
```

### Penjelasan:
- `MY_API_KEY` & `MY_API_SECRET` → kredensial API Gate.io  
- `MY_HOST` → base URL API Gate.io  
- `MY_PREFIX` → versi API (`/api/v4`)

---

# 📝 2. Fungsi: writeTotalToSheet()

```javascript
function writeTotalToSheet() {
  const namaSheet = "TOTAL";
  const selTujuan = "A2";

  const total = getGateTotalUSDT();

  const sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(namaSheet);

  sheet.getRange(selTujuan).setValue(total);
}
```

### Fungsi:
- Memanggil `getGateTotalUSDT()`
- Menulis hasil ke:
  - Sheet: **TOTAL**
  - Cell: **A2**

---

# 🧮 3. Fungsi Utama: getGateTotalUSDT()

### Alur kerja:

#### 1. Ambil data:
```javascript
const balances = getSpotBalances();
const tickers = getTickers();
```

#### 2. Hitung total:
```javascript
let totalUSDT = 0;
```

Loop setiap aset:
```javascript
balances.forEach(asset => {
```

#### Ambil data:
```javascript
const currency = asset.currency;
const available = parseFloat(asset.available) + parseFloat(asset.locked);
```

#### Skip jika nol:
```javascript
if (available === 0) return;
```

#### Jika USDT:
```javascript
if (currency === "USDT") {
  totalUSDT += available;
}
```

#### Jika aset lain:
```javascript
const pair = currency + "_USDT";

if (tickers[pair]) {
  const price = parseFloat(tickers[pair]);
  totalUSDT += available * price;
}
```

#### Output:
```javascript
Logger.log("Total USDT value: " + totalUSDT);
return totalUSDT;
```

---

# 💰 4. Ambil Saldo: getSpotBalances()

Endpoint:
```
GET /spot/accounts
```

Menggunakan autentikasi dan mengembalikan JSON saldo.

---

# 📈 5. Ambil Harga: getTickers()

Endpoint:
```
GET /spot/tickers
```

Menghasilkan mapping:
```javascript
{
  "BTC_USDT": "67000",
  "ETH_USDT": "3000"
}
```

---

# 🔐 6. Autentikasi: createHeaders()

Langkah:
1. Timestamp  
2. Hash body (SHA512)  
3. Prehash string  
4. Signature (HMAC SHA512)  
5. Header request  

---

# 🔑 7. Fungsi Kriptografi

- `sha512()` → hashing  
- `hmacSHA512()` → signature API  
- `bytesToHex()` → konversi byte ke hex  

---

# ⚠️ 8. Masalah / Bug dalam Kode

### ❌ Variabel tidak konsisten
- PREFIX → harusnya MY_PREFIX  
- API_KEY → MY_API_KEY  
- API_SECRET → MY_API_SECRET  

### ❌ Duplikasi fungsi
- sha512 dan hmacSHA512 ditulis dua kali  

### ❌ Pair tidak selalu tersedia
- Tidak semua aset punya pasangan USDT  

---

# ✅ 9. Ringkasan Alur

```
getSpotBalances → ambil saldo
getTickers → ambil harga
↓
Loop semua aset
↓
Konversi ke USDT
↓
Total dihitung
↓
Tulis ke Google Sheets
```

---

# 🚀 Kesimpulan

Script ini:
- Mengambil data dari Gate.io  
- Menghitung total aset dalam USDT  
- Menyimpan hasil ke Google Sheets  

Perlu perbaikan pada:
- Nama variabel  
- Duplikasi fungsi  
- Handling data market  
