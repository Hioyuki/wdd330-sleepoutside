import { formatCurrency, getCartItems, setLocalStorage } from './utils.mjs';

function renderCartContents() {
  const cartItems = getCartItems();
  const productList = document.querySelector('.product-list');

  if (!cartItems.length) {
    productList.innerHTML = '<li class=\'cart-empty\'>Your cart is empty.</li>';
    renderCartSummary(cartItems);
    return;
  }

  const htmlItems = cartItems.map((item, index) =>
    cartItemTemplate(item, index),
  );
  productList.innerHTML = htmlItems.join('');
  attachRemoveEvents();
  renderCartSummary(cartItems);
}

function cartItemTemplate(item, index) {
  const colorName = item.SelectedColor?.ColorName || item.Colors[0].ColorName;
  const newItem = `<li class="cart-card divider">
  <button class="cart-card__remove" type="button" data-index="${index}" aria-label="Remove ${item.Name} from cart">X</button>
  <a href="#" class="cart-card__image">
    <img
      src="${item.Image}"
      alt="${item.Name}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${colorName}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">${formatCurrency(item.FinalPrice)}</p>
</li>`;

  return newItem;
}

function renderCartSummary(cartItems) {
  const subtotalElement = document.querySelector('[data-cart-total]');
  const itemCountElement = document.querySelector('[data-cart-count]');
  const checkoutLink = document.querySelector('.cart-checkout__link');
  const hasItems = cartItems.length > 0;
  const subtotal = cartItems.reduce(
    (runningTotal, item) => runningTotal + Number(item.FinalPrice || 0),
    0,
  );

  subtotalElement.textContent = formatCurrency(subtotal);
  itemCountElement.textContent = `${cartItems.length} item${cartItems.length === 1 ? '' : 's'}`;
  checkoutLink.classList.toggle('disabled', !hasItems);
  checkoutLink.setAttribute('aria-disabled', String(!hasItems));
  checkoutLink.tabIndex = hasItems ? 0 : -1;
}

function removeCartItem(index) {
  const cartItems = getCartItems();
  cartItems.splice(index, 1);
  setLocalStorage('so-cart', cartItems);
  renderCartContents();
}

function attachRemoveEvents() {
  document.querySelectorAll('.cart-card__remove').forEach((button) => {
    button.addEventListener('click', (event) => {
      removeCartItem(Number(event.currentTarget.dataset.index));
    });
  });
}

renderCartContents();
