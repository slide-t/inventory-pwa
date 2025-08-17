let db;
const request = indexedDB.open("DGMdb", 1);

request.onsuccess = function(e) {
  db = e.target.result;
  loadStock();
};

function loadStock() {
  const tx = db.transaction("products", "readonly");
  const store = tx.objectStore("products");
  const request = store.openCursor();

  const stockTable = document.getElementById("stockTable");
  stockTable.innerHTML = "";
  let alerts = "";

  request.onsuccess = function(e) {
    const cursor = e.target.result;
    if (cursor) {
      const { name, category, qty, price } = cursor.value;

      // add row
      stockTable.innerHTML += `
        <tr>
          <td>${name}</td>
          <td>${category}</td>
          <td>${qty}</td>
          <td>₦${price.toLocaleString()}</td>
        </tr>
      `;

      // low stock alert
      if (qty < 5) {
        alerts += `<p style="color:red;">⚠ Low stock: ${name} (only ${qty} left)</p>`;
      }

      cursor.continue();
    } else {
      document.getElementById("lowStockAlerts").innerHTML = alerts;
    }
  };
}
