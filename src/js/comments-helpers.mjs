import {
  getCustomer,
  getCustomerDisplayName,
} from './customer.mjs';
import { getLocalStorage, setLocalStorage } from './utils.mjs';

const COMMENTS_KEY = 'so-comments';

function getCommentsStore() {
  return getLocalStorage(COMMENTS_KEY) || {};
}

function saveCommentsStore(store) {
  setLocalStorage(COMMENTS_KEY, store);
}

export function getComments(productId) {
  const store = getCommentsStore();
  return (store[productId] || []).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

export function addComment(productId, comment) {
  const store = getCommentsStore();
  const comments = store[productId] || [];
  const customer = getCustomer();

  comments.push({
    id: crypto.randomUUID?.() || `${Date.now()}`,
    author: comment.author || getCustomerDisplayName(customer),
    avatar: comment.avatar || customer?.avatar || '',
    email: comment.email || customer?.email || '',
    message: comment.message,
    createdAt: new Date().toISOString(),
  });

  store[productId] = comments;
  saveCommentsStore(store);
  return getComments(productId);
}
