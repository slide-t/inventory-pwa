
const { jsPDF } = window.jspdf;

// IndexedDB
const db = new Dexie("InventoryDB");
db.version(1).stores({
  items: '++id, category, subcategory, itemName, quantity, sold, barcode, sales'
});

// Navigation buttons
function goToStore() { window.location.href = 'store.html'; }
function logoutAdmin() { window.location.href = 'index.html'; }

// Dark mode toggle
document.getElementById('darkModeSwitch').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// Initialize sample data if DB is empty
async function initData() {
  const count = await db.items.count();
  if (count === 0) {
    await db.items.bulkAdd([
      {category:"Electronics", subcategory:"Phone", itemName:"iPhone 14", quantity:10, sold:3, barcode:"111", sales:[{date:"2025-08-15", qty:2},{date:"2025-08-16", qty:1}]},
      {category:"Groceries", subcategory:"Rice", itemName:"Golden Rice 5kg", quantity:20, sold:5, barcode:"222", sales:[{date:"2025-08-15", qty:3},{date:"2025-08-16", qty:2}]},
      {category:"Clothing", subcategory:"T-Shirt", itemName:"Polo Shirt", quantity:15, sold:4, barcode:"333", sales:[{date:"2025-08-16", qty:4}]}
    ]);
  }
}

// Load inventory table
async function loadInventory() {
  const tbody = document.getElementById('inventoryTableBody');
  tbody.innerHTML = "";
  const allItems = await db.items.toArray();
  allItems.forEach(item => {
    tbody.innerHTML += `
      <tr>
        <td>${item.category}</td>
        <td>${item.subcategory}</td>
        <td>${item.itemName}</td>
        <td>${item.quantity}</td>
        <td>${item.sold}</td>
      </tr>
    `;
  });
}

// Calculate sales stats
async function calculateSales() {
  const dailyElem = document.getElementById('dailySales');
  const weeklyElem = document.getElementById('weeklySales');
  let today = new Date().toISOString().slice(0,10);
  let weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate()-7);

  let dailyTotal = 0, weeklyTotal = 0;
  const allItems = await db.items.toArray();
  allItems.forEach(item => {
    if(item.sales){
      item.sales.forEach(sale=>{
        let saleDate = new Date(sale.date);
        if(sale.date === today) dailyTotal += sale.qty;
        if(saleDate >= weekAgo) weeklyTotal += sale.qty;
      });
    }
  });
  dailyElem.textContent = dailyTotal;
  weeklyElem.textContent = weeklyTotal;
}

// Load sales history with filters
async function loadSalesHistory(filterName="", start="", end="") {
  const tbody = document.getElementById('salesHistoryAdmin');
  tbody.innerHTML = "";
  const allItems = await db.items.toArray();
  let hasData = false;

  allItems.forEach(item => {
    if(item.sales){
      item.sales.forEach(sale => {
        let saleDate = new Date(sale.date);
        let show = true;
        if(filterName && !item.itemName.toLowerCase().includes(filterName.toLowerCase())) show = false;
        if(start && saleDate < new Date(start)) show = false;
        if(end && saleDate > new Date(end)) show = false;
        if(show){
          hasData = true;
          tbody.innerHTML += `
            <tr>
              <td>${sale.date}</td>
              <td>${item.itemName}</td>
              <td>${sale.qty}</td>
            </tr>
          `;
        }
      });
    }
  });
  if(!hasData) tbody.innerHTML = "<tr><td colspan='3'>No sales data for filter</td></tr>";
}

// Apply filters button
function applyFilters() {
  const name = document.getElementById('filterItemName').value;
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;
  loadSalesHistory(name, start, end);
}

// PDF Exports
async function exportInventoryPDF() {
  if(!confirm("Do you want to download the Inventory PDF?")) return;
  const items = await db.items.toArray();
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Inventory Report", 14, 20);
  let y = 30;
  items.forEach(i => {
    const line = `Category: ${i.category}, Subcategory: ${i.subcategory}, Item: ${i.itemName}, Qty: ${i.quantity}, Sold: ${i.sold}`;
    doc.text(line, 14, y); y+=10;
    if(y>280){ doc.addPage(); y=20; }
  });
  doc.save("Inventory_Report.pdf");
}

async function exportSalesPDF() {
  if(!confirm("Do you want to download the Sales PDF?")) return;
  const items = await db.items.toArray();
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Sales Report", 14, 20);
  let y = 30;
  items.forEach(i => {
    i.sales.forEach(s => {
      const line = `Item: ${i.itemName}, Qty Sold: ${s.qty}, Date: ${s.date}`;
      doc.text(line, 14, y); y+=10;
      if(y>280){ doc.addPage(); y=20; }
    });
  });
  doc.save("Sales_Report.pdf");
}
// Navigation - use button ids to avoid inline onclick issues
document.getElementById('toStoreBtn').addEventListener('click', () => {
  // replace with your store page path if different
  window.location.href = 'store.html';
});

// Logout: clear session and redirect to access/login page
document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  // Clear session/local storage items (adjust keys you use)
  try {
    localStorage.removeItem('adminSession'); // example key
    sessionStorage.removeItem('adminSession');
  } catch (err) { /* ignore */ }

  // If you maintain cookies, clear relevant cookie(s) here (optional)
  // document.cookie = 'your_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

  // redirect to login (adjust path)
  window.location.href = 'index.html';
});



// Service Worker registration
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.log('SW registration failed:', err));
  });
}

// Initialize page
(async()=>{
  await initData();
  await loadInventory();
  await calculateSales();
  await loadSalesHistory();
})();



