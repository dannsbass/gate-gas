const PAIR = "HYPE3L_USDT";
const SHEET_NAME = "HYPE3L";

// =============================
// MAIN FUNCTION
// =============================
function updateTrades() {

  const trades = getMyTrades(PAIR);

  if (!trades || trades.length === 0) {
    Logger.log("Tidak ada trade.");
    return;
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName(SHEET_NAME);

  // Ambil ID terakhir di sheet (untuk hindari duplikat)
  const lastId = sheet.getRange("G2").getValue();

  let newRows = [];

  for (let i = 0; i < trades.length; i++) {

    const trade = trades[i];

    // STOP jika sudah ketemu data lama
    if (trade.id == lastId) break;

    const time = new Date(parseInt(trade.create_time_ms));
    const pair = trade.currency_pair;
    const side = trade.side;
    const price = parseFloat(trade.price);
    const amount = parseFloat(trade.amount);
    const total = price * amount;

    newRows.push([
      time,
      pair,
      side,
      price,
      amount,
      total,
      trade.id
    ]);
  }

  if (newRows.length === 0) {
    Logger.log("Tidak ada data baru.");
    return;
  }

  // Insert ke sheet
  sheet.insertRowsBefore(2, newRows.length);
  const range = sheet.getRange(2, 1, newRows.length, 7);
  range.setValues(newRows);

  // =============================
  // 🎨 WARNA TEKS
  // =============================
  let colors = [];

  newRows.forEach(row => {

    const side = row[2]; // kolom "Side"

    let color;

    if (side.toLowerCase() === "buy") {
      color = "green";
    } else if (side.toLowerCase() === "sell") {
      color = "red";
    } else {
      color = "black";
    }

    // satu baris full diberi warna sama
    colors.push([color, color, color, color, color, color, color]);
  });

  // Terapkan warna
  range.setFontColors(colors);

  Logger.log(newRows.length + " trade baru ditambahkan.");
}


// =============================
// GET MY TRADES
// =============================
function getMyTrades(pair) {

  const method = "GET";
  const url = "/spot/my_trades";
  const query = "currency_pair=" + pair + "&limit=30";
  const body = "";

  const headers = createHeaders(method, url, query, body);

  const response = UrlFetchApp.fetch(
    HOST + PREFIX + url + "?" + query,
    {
      method: method,
      headers: headers
    }
  );

  return JSON.parse(response.getContentText());
}


// =============================
// CREATE HEADERS (AUTH)
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

  const signature = hmacSHA512(prehash, MY_API_SECRET);

  return {
    "Content-Type": "application/json",
    "KEY": MY_API_KEY,
    "Timestamp": timestamp,
    "SIGN": signature
  };
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
  return bytes.map(b => {
    const v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? "0" + v : v;
  }).join("");
}
