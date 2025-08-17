// Open IndexedDB
let db;
const request = indexedDB.open("DGMdb", 1);

request.onupgradeneeded = function(e) {
  db = e.target.result;
  if (!db.objectStoreNames.contains("products")) {
    db.createObjectStore("products", { keyPath: "id", autoIncrement: true });
  }
};

request.onsuccess = function(e) {
  db = e.target.result;
};

document.getElementById("productForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const category = document.getElementById("category").value;
  const qty = parseInt(document.getElementById("qty").value);
  const price = parseFloat(document.getElementById("price").value);

  const tx = db.transaction("products", "readwrite");
  const store = tx.objectStore("products");

  store.add({ name, category, qty, price });

  tx.oncomplete = () => {
    alert("✅ Product added successfully!");
    this.reset();
  };
});
