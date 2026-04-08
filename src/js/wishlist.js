import {
  getWishlistItems,
  getWishlistOwnerLabel,
  moveWishlistItemToCart,
  removeFromWishlist,
} from './wishlist-helpers.mjs';
import { formatCurrency } from './utils.mjs';

const wishlistList = document.querySelector('[data-wishlist-list]');
const wishlistTitle = document.querySelector('[data-wishlist-owner]');

function wishlistItemTemplate(item) {
  const colorName = item.SelectedColor?.ColorName || 'Default';
  const colorCode = item.SelectedColor?.ColorCode || '';

  return `
    <article class="wishlist-card">
      <img src="${item.Image}" alt="${item.Name}" class="wishlist-card__image" />
      <div class="wishlist-card__content">
        <p class="order-card__eyebrow">${item.Brand?.Name || 'Sleep Outside'}</p>
        <h3>${item.NameWithoutBrand || item.Name}</h3>
        <p class="wishlist-card__color">${colorName}</p>
        <p class="wishlist-card__price">${formatCurrency(item.FinalPrice)}</p>
        <div class="wishlist-card__actions">
          <button
            type="button"
            data-action="cart"
            data-id="${item.Id}"
            data-color-code="${colorCode}"
          >
            Move to Cart
          </button>
          <button
            type="button"
            data-action="remove"
            data-id="${item.Id}"
            data-color-code="${colorCode}"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderWishlist() {
  const items = getWishlistItems();

  if (wishlistTitle) {
    wishlistTitle.textContent = `${getWishlistOwnerLabel()}'s Wishlist`;
  }

  if (!items.length) {
    wishlistList.innerHTML =
      '<p class="orders-empty">No saved items yet. Add favorites from any product page.</p>';
    return;
  }

  wishlistList.innerHTML = items.map((item) => wishlistItemTemplate(item)).join('');
}

if (wishlistList) {
  wishlistList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');

    if (!button) {
      return;
    }

    const { action, id, colorCode } = button.dataset;

    if (action === 'cart') {
      moveWishlistItemToCart(id, colorCode);
    }

    if (action === 'remove') {
      removeFromWishlist(id, colorCode);
    }

    renderWishlist();
  });
}

renderWishlist();
