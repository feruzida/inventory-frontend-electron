const { ipcRenderer } = require("electron");

// ================= DOM REFERENCES =================
const user = document.getElementById("user");
const pass = document.getElementById("pass");
const errorBox = document.getElementById("errorBox");

const loadBtn = document.getElementById("loadBtn");
const logoutBtn = document.getElementById("logoutBtn");
const roleLabel = document.getElementById("roleLabel");

const pName = document.getElementById("pName");
const pCategory = document.getElementById("pCategory");
const pPrice = document.getElementById("pPrice");
const pQty = document.getElementById("pQty");

const addBtn = document.getElementById("addBtn");
const updateBtn = document.getElementById("updateBtn");
const deleteBtn = document.getElementById("deleteBtn");
const saleBtn = document.getElementById("saleBtn");
const purchaseBtn = document.getElementById("purchaseBtn");

// ================= GLOBAL STATE =================
let currentRole = null;
let selectedProductId = null;

ipcRenderer.send("connect-server");

// ================= AUTH =================
function login() {
    errorBox.innerText = "";

    ipcRenderer.send("send-data", JSON.stringify({
        action: "login",
        username: user.value,
        password: pass.value
    }));
}

function logout() {
    ipcRenderer.send("send-data", JSON.stringify({
        action: "logout"
    }));
}

// ================= PRODUCTS =================
function loadProducts() {
    ipcRenderer.send("send-data", JSON.stringify({
        action: "get_all_products"
    }));
}

function addProduct() {
    ipcRenderer.send("send-data", JSON.stringify({
        action: "add_product",
        name: pName.value,
        category: pCategory.value,
        unitPrice: Number(pPrice.value),
        quantity: Number(pQty.value)
    }));
}

function testUpdate() {
    if (!selectedProductId) {
        alert("Select product first");
        return;
    }

    ipcRenderer.send("send-data", JSON.stringify({
        action: "update_product",
        productId: selectedProductId,
        name: pName.value,
        category: pCategory.value,
        unitPrice: Number(pPrice.value),
        quantity: Number(pQty.value)
    }));
}

function testDelete() {
    if (!selectedProductId) {
        alert("Select product first");
        return;
    }

    ipcRenderer.send("send-data", JSON.stringify({
        action: "delete_product",
        product_id: selectedProductId
    }));
}

// ================= TRANSACTIONS =================
function sale() {
    if (!selectedProductId) {
        alert("Select product first");
        return;
    }

    ipcRenderer.send("send-data", JSON.stringify({
        action: "record_transaction",
        transaction: {
            productId: selectedProductId,
            quantity: 1,
            txnType: "Sale"
        }
    }));
}

function purchase() {
    if (!selectedProductId) {
        alert("Select product first");
        return;
    }

    ipcRenderer.send("send-data", JSON.stringify({
        action: "record_transaction",
        transaction: {
            productId: selectedProductId,
            quantity: 5,
            txnType: "Purchase"
        }
    }));
}

// ================= ROLE-BASED UI =================
function applyRoleUI() {
    saleBtn.disabled = false;

    if (currentRole === "Cashier") return;

    addBtn.disabled = false;
    updateBtn.disabled = false;

    if (currentRole === "Stock Manager") {
        purchaseBtn.disabled = false;
        return;
    }

    if (currentRole === "Admin") {
        deleteBtn.disabled = false;
        purchaseBtn.disabled = false;
    }
}

// ================= RESET =================
function resetUI() {
    currentRole = null;
    selectedProductId = null;

    document.querySelector("#productsTable tbody").innerHTML = "";

    user.value = "";
    pass.value = "";
    pName.value = "";
    pCategory.value = "";
    pPrice.value = "";
    pQty.value = "";

    errorBox.innerText = "";
    roleLabel.innerText = "";

    loadBtn.disabled = true;
    logoutBtn.disabled = true;

    addBtn.disabled = true;
    updateBtn.disabled = true;
    deleteBtn.disabled = true;
    saleBtn.disabled = true;
    purchaseBtn.disabled = true;

    showLogin();
    user.focus();
}

// ================= SERVER RESPONSE =================
ipcRenderer.on("server-response", (e, data) => {
    const response = JSON.parse(data);
    console.log(response);

    if (!response.success) {
        errorBox.innerText = response.message;
        return;
    }

    errorBox.innerText = "";

    // ===== LOGIN SUCCESS =====
    if (response.data?.role) {
        resetUI(); // 🔥 ВАЖНО
        currentRole = response.data.role;

        document.getElementById("roleLabel").innerText = currentRole;

        showApp();

        loadBtn.disabled = false;   // базовая кнопка
        logoutBtn.disabled = false;

        applyRoleUI();
        return;
    }


    // ===== LOGOUT SUCCESS =====
    if (response.message === "Logged out successfully") {
        resetUI();
        showLogin();
        return;
    }

    // ===== PRODUCTS =====
    if (Array.isArray(response.data)) {
        renderProducts(response.data);
        return;
    }

    // ===== CRUD / TX =====
    if (
        response.message.includes("Transaction") ||
        response.message.includes("added") ||
        response.message.includes("updated") ||
        response.message.includes("deactivated")
    ) {
        loadProducts();
    }
});


// ================= RENDER =================
function renderProducts(products) {
    const tbody = document.querySelector("#productsTable tbody");
    tbody.innerHTML = "";

    products.forEach(p => {
        const row = document.createElement("tr");

        row.onclick = () => {
            document.querySelectorAll("#productsTable tr")
                .forEach(r => r.classList.remove("selected"));

            row.classList.add("selected");

            selectedProductId = p.productId;
            pName.value = p.name;
            pCategory.value = p.category;
            pPrice.value = p.unitPrice;
            pQty.value = p.quantity;
        };

        row.innerHTML = `
            <td>${p.productId}</td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${p.unitPrice}</td>
            <td>${p.quantity}</td>
        `;

        tbody.appendChild(row);
    });
}

// ================= VISIBILITY =================
function showLogin() {
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("appSection").style.display = "none";
    user.focus();
}

function showApp() {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("appSection").style.display = "block";
}


