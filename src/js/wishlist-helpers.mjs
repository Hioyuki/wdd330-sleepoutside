import { addProductToCart } from './cart-helpers.mjs';
import {
  getCustomer,
  getCustomerDisplayName,
  getCustomerIdentifier,
} from './customer.mjs';
import { getLocalStorage, setLocalStorage } from './utils.mjs';

const WISHLIST_KEY = 'so-wishlist';

function getWishlistStore() {
  return getLocalStorage(WISHLIST_KEY) || {};
}

function saveWishlistStore(store) {
  setLocalStorage(WISHLIST_KEY, store);
}

function normalizeWishlistItem(product, selectedColor) {
  return {
    Id: product.Id,
    Name: product.Name,
    NameWithoutBrand: product.NameWithoutBrand,
    FinalPrice: product.FinalPrice,
    Image: selectedColor?.ColorPreviewImageSrc || product.Images?.PrimaryLarge || product.Image,
    SelectedColor: selectedColor || product.SelectedColor || product.Colors?.[0] || null,
    Brand: product.Brand,
  };
}

export function getWishlistItems() {
  const store = getWishlistStore();
  const owner = getCustomerIdentifier();

  return store[owner] || [];
}

export function isInWishlist(productId, colorCode = '') {
  return getWishlistItems().some(
    (item) =>
      item.Id === productId &&
      (item.SelectedColor?.ColorCode || '') === colorCode,
  );
}

export function addToWishlist(product, selectedColor) {
  const store = getWishlistStore();
  const owner = getCustomerIdentifier();
  const nextItems = getWishlistItems();
  const item = normalizeWishlistItem(product, selectedColor);

  if (
    nextItems.some(
      (entry) =>
        entry.Id === item.Id &&
        (entry.SelectedColor?.ColorCode || '') ===
          (item.SelectedColor?.ColorCode || ''),
    )
  ) {
    return nextItems;
  }

  nextItems.push(item);
  store[owner] = nextItems;
  saveWishlistStore(store);
  return nextItems;
}

export function removeFromWishlist(productId, colorCode = '') {
  const store = getWishlistStore();
  const owner = getCustomerIdentifier();
  const nextItems = getWishlistItems().filter(
    (item) =>
      !(
        item.Id === productId &&
        (item.SelectedColor?.ColorCode || '') === colorCode
      ),
  );

  store[owner] = nextItems;
  saveWishlistStore(store);
  return nextItems;
}

export function toggleWishlist(product, selectedColor) {
  const colorCode = selectedColor?.ColorCode || '';

  if (isInWishlist(product.Id, colorCode)) {
    removeFromWishlist(product.Id, colorCode);
    return false;
  }

  addToWishlist(product, selectedColor);
  return true;
}

export function moveWishlistItemToCart(productId, colorCode = '') {
  const item = getWishlistItems().find(
    (entry) =>
      entry.Id === productId &&
      (entry.SelectedColor?.ColorCode || '') === colorCode,
  );

  if (!item) {
    return false;
  }

  addProductToCart(item, {
    message: `${item.Name} is ready to buy and has been moved to your cart.`,
  });
  removeFromWishlist(productId, colorCode);
  return true;
}

export function getWishlistOwnerLabel() {
  const customer = getCustomer();

  if (!customer) {
    return 'This browser';
  }

  return getCustomerDisplayName(customer);
}
