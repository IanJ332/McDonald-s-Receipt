// --- INITIAL SETUP ---
function initialize() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('dateTime').value = `${year}-${month}-${day} ${hours}:${minutes}`;

    document.getElementById('pickupCode').value = Math.floor(1000 + Math.random() * 9000);
    document.getElementById('orderNumber').value = Date.now();

    addItem('Big Mac', 1, 5.99);
    addItem('Large Fries', 1, 2.99);
    addItem('Coke', 1, 1.99);

    document.getElementById('itemsContainer').addEventListener('input', generateReceipt);
    document.getElementById('discountsContainer').addEventListener('input', generateReceipt);
    document.querySelector('.form-section').addEventListener('input', generateReceipt);

    document.getElementById('deliveryToggle').addEventListener('change', (e) => {
        document.getElementById('deliveryDetails').style.display = e.target.checked ? 'block' : 'none';
        generateReceipt();
    });

    generateReceipt();
}

// --- ITEM & DISCOUNT MANAGEMENT ---
function addItem(name = '', qty = 1, price = 0.00) {
    const container = document.getElementById('itemsContainer');
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    itemRow.innerHTML = `
        <input type="text" placeholder="Item Name" value="${name}">
        <input type="number" placeholder="Qty" value="${qty}" min="1">
        <input type="number" placeholder="Price" value="${price.toFixed(2)}" step="0.01" min="0">
        <button class="remove-item-btn" onclick="this.parentElement.remove(); generateReceipt();">✕</button>
    `;
    container.appendChild(itemRow);
    generateReceipt();
}

function addDiscount(name = 'Coupon', amount = 1.00) {
    const container = document.getElementById('discountsContainer');
    const discountRow = document.createElement('div');
    discountRow.className = 'item-row';
    discountRow.innerHTML = `
        <input type="text" placeholder="Discount Name" value="${name}">
        <input type="number" placeholder="Amount" value="${amount.toFixed(2)}" step="0.01" min="0">
        <button class="remove-discount-btn" onclick="this.parentElement.remove(); generateReceipt();">✕</button>
    `;
    container.appendChild(discountRow);
    generateReceipt();
}

// --- RECEIPT GENERATION ---
function generateReceipt() {
    const theme = document.getElementById('theme').value;
    const storeName = document.getElementById('storeName').value;
    const storeCode = document.getElementById('storeCode').value;
    const storeAddress = document.getElementById('storeAddress').value;
    const pickupCode = document.getElementById('pickupCode').value;
    const orderNumber = document.getElementById('orderNumber').value;
    const dateTime = document.getElementById('dateTime').value;
    const taxRate = parseFloat(document.getElementById('tax').value) || 0;
    const note = document.getElementById('note').value;
    const cashierName = document.getElementById('cashierName').value;

    document.getElementById('receiptCashierName').textContent = cashierName || '';

    const themeContainer = document.getElementById('receiptThemeImageContainer');
    themeContainer.innerHTML = '';
    let imageSrc = '', altText = '';
    if (theme === 'puppy') {
        imageSrc = './src/mc_puppy.png';
        altText = 'Happy Puppy Theme';
    } else {
        imageSrc = './src/mc_logo.png';
        altText = "McDonald's Logo";
    }
    themeContainer.innerHTML = `
        <div class="receipt-header-image">
            <img src="${imageSrc}" alt="${altText}">
        </div>`;

    document.getElementById('receiptStoreName').textContent = storeName;
    document.getElementById('receiptStoreCode').textContent = `Restaurant #${storeCode}`;
    document.getElementById('receiptStoreAddress').textContent = storeAddress;
    document.getElementById('receiptPickupCode').textContent = pickupCode;
    document.getElementById('receiptDateTime').textContent = dateTime;
    document.getElementById('receiptOrderNumber').textContent = orderNumber;

    const itemsContainer = document.getElementById('receiptItems');
    itemsContainer.innerHTML = '';
    let subtotal = 0;
    document.querySelectorAll('#itemsContainer .item-row').forEach(row => {
        const inputs = row.querySelectorAll('input');
        const itemName = inputs[0].value;
        const qty = parseInt(inputs[1].value) || 1;
        const price = parseFloat(inputs[2].value) || 0;
        if (itemName) {
            const itemTotal = qty * price;
            subtotal += itemTotal;
            itemsContainer.innerHTML += `<div class="receipt-item"><span>${qty} ${itemName}</span><span>$${itemTotal.toFixed(2)}</span></div>`;
        }
    });

    const discountsContainer = document.getElementById('receiptDiscounts');
    discountsContainer.innerHTML = '';
    let totalDiscount = 0;
    let discountLines = '';
    document.querySelectorAll('#discountsContainer .item-row').forEach(row => {
        const inputs = row.querySelectorAll('input');
        const discountName = inputs[0].value.trim();
        const discountAmount = parseFloat(inputs[1].value) || 0;
        if (discountName && discountAmount > 0) {
            totalDiscount += discountAmount;
            discountLines += `<div class="receipt-item"><span>- ${discountName}</span><span>-$${discountAmount.toFixed(2)}</span></div>`;
        }
    });
    if (discountLines) {
        discountsContainer.innerHTML = `<div style="font-weight: bold;">Discount:</div>${discountLines}`;
    }

    const taxableAmount = subtotal - totalDiscount;
    const tax = taxableAmount > 0 ? (taxableAmount * taxRate) / 100 : 0;
    const total = taxableAmount + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('taxAmount').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;

    const discountTotalLine = document.getElementById('receiptTotalDiscountLine');
    if (discountTotalLine) {
        if (totalDiscount > 0) {
            discountTotalLine.style.display = 'flex';
            document.getElementById('discountAmount').textContent = `-$${totalDiscount.toFixed(2)}`;
        } else {
            discountTotalLine.style.display = 'none';
        }
    }

    const deliverySection = document.getElementById('receiptDeliverySection');
    deliverySection.innerHTML = '';
    if (document.getElementById('deliveryToggle').checked) {
        const name = document.getElementById('deliveryName').value;
        const address = document.getElementById('deliveryAddress').value;
        const phone = document.getElementById('deliveryPhone').value;
        deliverySection.innerHTML = `<div class="receipt-separator"></div><div style="font-weight: bold;">Delivery To:</div><div>${name}</div><div>${address}</div><div>${phone}</div>`;
    }

    const noteDisplay = document.getElementById('receiptNote');
    noteDisplay.textContent = note;
    noteDisplay.style.display = note ? 'block' : 'none';
}

// --- DOWNLOAD FUNCTIONALITY ---
function downloadReceipt() {
    const receiptElement = document.getElementById('receiptPreview');
    html2canvas(receiptElement, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
        .then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'custom-receipt.png';
            link.click();
        });
}

// --- START THE APP ---
window.addEventListener('DOMContentLoaded', initialize);
