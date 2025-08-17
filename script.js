<script>
/* === IndexedDB Setup for Sales === */
let db;
const request = indexedDB.open("DammyStoreDB", 1);

request.onupgradeneeded = (e) => {
  db = e.target.result;
  if (!db.objectStoreNames.contains("sales")) {
    const store = db.createObjectStore("sales", { keyPath: "id", autoIncrement: true });
    store.createIndex("date", "date", { unique: false });
    store.createIndex("amount", "amount", { unique: false });
  }
};

request.onsuccess = (e) => {
  db = e.target.result;
  console.log("✅ IndexedDB ready for Sales");
  loadSalesFromDB();
};

request.onerror = (e) => {
  console.error("❌ IndexedDB Error:", e.target.errorCode);
};

/* === Save a Sale === */
function saveSale(sale) {
  const tx = db.transaction("sales", "readwrite");
  const store = tx.objectStore("sales");
  store.add(sale);
  tx.oncomplete = () => console.log("Sale saved:", sale);
}

/* === Load All Sales === */
function loadSalesFromDB() {
  const tx = db.transaction("sales", "readonly");
  const store = tx.objectStore("sales");
  const request = store.getAll();

  request.onsuccess = () => {
    const sales = request.result;
    const salesTable = document.getElementById("salesTable");
    salesTable.innerHTML = "";

    sales.forEach(sale => {
      let row = `<tr>
        <td>${sale.date}</td>
        <td>${sale.item}</td>
        <td>${sale.quantity}</td>
        <td>${sale.amount}</td>
      </tr>`;
      salesTable.innerHTML += row;
    });
  };
}

/* === Example: Hook to Your Existing Form === */
document.getElementById("salesForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  let sale = {
    date: new Date().toLocaleDateString(),
    item: document.getElementById("saleItem").value,
    quantity: Number(document.getElementById("saleQty").value),
    amount: Number(document.getElementById("saleAmount").value)
  };

  saveSale(sale);
  loadSalesFromDB();
  e.target.reset();
});
</script>
