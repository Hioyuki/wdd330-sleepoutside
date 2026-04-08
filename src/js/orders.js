import ExternalServices from './ExternalServices.mjs';
import { clearAuth, getAuth, getToken, requireAuth } from './auth.mjs';
import { alertMessage, formatCurrency } from './utils.mjs';

const ordersList = document.querySelector('[data-orders-list]');
const ordersStatus = document.querySelector('[data-orders-status]');
const logoutButton = document.getElementById('logoutButton');
const auth = getAuth();

function normalizeOrders(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.orders)) {
    return payload.orders;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.result)) {
    return payload.result;
  }

  return [];
}

function orderCardTemplate(order) {
  const id = order.id || order._id || order.orderNumber || 'Pending ID';
  const name =
    [order.fname, order.lname].filter(Boolean).join(' ') ||
    order.name ||
    'Unknown customer';
  const date = order.orderDate || order.createdAt || order.date || '';
  const status = order.status || order.state || 'Received';
  const total = Number(order.orderTotal || order.total || 0);
  const shipping = Number(order.shipping || 0);
  const tax = Number(order.tax || 0);
  const items = order.items || [];

  return `
    <article class="order-card">
      <div class="order-card__header">
        <div>
          <p class="order-card__eyebrow">Order ${id}</p>
          <h3>${name}</h3>
        </div>
        <p class="order-card__status">${status}</p>
      </div>
      <p class="order-card__meta">${date ? new Date(date).toLocaleString() : 'Date unavailable'}</p>
      <div class="order-card__totals">
        <p><span>Total</span><strong>${formatCurrency(total)}</strong></p>
        <p><span>Shipping</span><strong>${formatCurrency(shipping)}</strong></p>
        <p><span>Tax</span><strong>${formatCurrency(tax)}</strong></p>
      </div>
      <ul class="order-card__items">
        ${items
          .map(
            (item) => `
              <li>
                <span>${item.name || item.Name || 'Item'}</span>
                <strong>x${item.quantity || 1}</strong>
              </li>
            `,
          )
          .join('')}
      </ul>
    </article>
  `;
}

async function loadOrders() {
  if (!requireAuth()) {
    return;
  }

  if (auth?.email && ordersStatus) {
    ordersStatus.textContent = `Signed in as ${auth.email}`;
  }

  try {
    const services = new ExternalServices();
    const payload = await services.getOrders(getToken());
    const orders = normalizeOrders(payload);

    if (!orders.length) {
      ordersList.innerHTML =
        '<p class="orders-empty">No orders are waiting for review right now.</p>';
      return;
    }

    ordersList.innerHTML = orders.map((order) => orderCardTemplate(order)).join('');
  } catch (error) {
    alertMessage(
      error.message?.message ||
        error.message ||
        'Unable to load orders. Please sign in again.',
    );
  }
}

if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    clearAuth();
    window.location.assign('../login/index.html');
  });
}

loadOrders();
