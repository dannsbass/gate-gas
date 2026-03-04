// =============================
// CONFIGURATION
// =============================
const MY_API_KEY = ""; //sesuaikan
const MY_API_SECRET = ""; //sesuaikan

const MY_HOST = "https://api.gateio.ws";
const MY_PREFIX = "/api/v4";

// =============================
// Fungsi untuk menulis hasil yang didapatkan
// ke dalam Google Sheet
// =============================
function writeTotalToSheet() {

  const namaSheet = "TOTAL";
  const selTujuan = "A2";

  const total = getGateTotalUSDT();

  const sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(namaSheet);

//  sheet.getRange("A2").setValue("Total USDT");
  sheet.getRange(selTujuan).setValue(total);

}

// =============================
// MAIN FUNCTION
// Fungsi untuk mengambil total USDT dari akun Gate
// =============================
function getGateTotalUSDT() {

  const balances = getSpotBalances();
  const tickers = getTickers();

  let totalUSDT = 0;

  balances.forEach(asset => {

    const currency = asset.currency;
    const available = parseFloat(asset.available) + parseFloat(asset.locked);

    if (available === 0) return;

    if (currency === "USDT") {
      totalUSDT += available;
    } else {

      const pair = currency + "_USDT";

      if (tickers[pair]) {
        const price = parseFloat(tickers[pair]);
        totalUSDT += available * price;
      }

    }

  });

  Logger.log("Total USDT value: " + totalUSDT);

  return totalUSDT;
}


// =============================
// GET SPOT BALANCES
// =============================
function getSpotBalances() {

  const method = "GET";
  const url = "/spot/accounts";
  const query = "";
  const body = "";

  const headers = createHeaders(method, url, query, body);

  const response = UrlFetchApp.fetch(
    MY_HOST + MY_PREFIX + url,
    {
      method: method,
      headers: headers
    }
  );

  return JSON.parse(response.getContentText());
}


// =============================
// GET TICKERS
// =============================
function getTickers() {

  const response = UrlFetchApp.fetch(
    MY_HOST + MY_PREFIX + "/spot/tickers"
  );

  const data = JSON.parse(response.getContentText());

  const prices = {};

  data.forEach(ticker => {
    prices[ticker.currency_pair] = ticker.last;
  });

  return prices;
}


// =============================
// CREATE AUTH HEADERS
// =============================
function createHeaders(method, url, query, body) {

  const timestamp = Math.floor(Date.now() / 1000).toString();

  const hashedPayload = sha512(body);

  const prehash =
      method + "\n" +
      PREFIX + url + "\n" +
      query + "\n" +
      hashedPayload + "\n" +
      timestamp;

  const signature = hmacSHA512(prehash, API_SECRET);

  return {
    "Content-Type": "application/json",
    "KEY": API_KEY,
    "Timestamp": timestamp,
    "SIGN": signature
  };

}


function sha512(str) {

  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_512,
    str,
    Utilities.Charset.UTF_8
  );

  return bytesToHex(bytes);

}


function hmacSHA512(str, secret) {

  const signature = Utilities.computeHmacSignature(
    Utilities.MacAlgorithm.HMAC_SHA_512,
    str,
    secret,
    Utilities.Charset.UTF_8
  );

  return bytesToHex(signature);

}


// =============================
// SHA512
// =============================
function sha512(str) {

  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_512,
    str,
    Utilities.Charset.UTF_8
  );

  return bytesToHex(bytes);
}


// =============================
// HMAC SHA512
// =============================
function hmacSHA512(str, secret) {

  const signature = Utilities.computeHmacSignature(
    Utilities.MacAlgorithm.HMAC_SHA_512,
    str,
    secret,
    Utilities.Charset.UTF_8
  );

  return bytesToHex(signature);

}


// =============================
// BYTES → HEX
// =============================
function bytesToHex(bytes) {

  return bytes.map(function(byte) {

    const v = (byte < 0 ? byte + 256 : byte).toString(16);

    return v.length === 1 ? "0" + v : v;

  }).join("");

}
