import { addProductToCart } from './cart-helpers.mjs';
import { alertMessage, formatCurrency, setLocalStorage } from './utils.mjs';

const quickViewModal = document.getElementById('quickViewModal');
const quickViewContent = document.querySelector('[data-quick-view-content]');
const newsletterForm = document.getElementById('newsletterForm');
const newsletterMessage = document.querySelector('[data-newsletter-message]');
let productCache = [];

async function getProducts() {
  if (productCache.length) {
    return productCache;
  }

  const response = await fetch('./json/tents.json');
  if (!response.ok) {
    throw new Error('Unable to load product details right now.');
  }

  productCache = await response.json();
  return productCache;
}

async function getProductById(id) {
  const products = await getProducts();
  return products.find((product) => product.Id === id);
}

function renderQuickView(product, href) {
  const savings =
    product.SuggestedRetailPrice > product.FinalPrice
      ? formatCurrency(product.SuggestedRetailPrice - product.FinalPrice)
      : null;
  const imagePath = product.Image.replace('../', '');

  quickViewContent.innerHTML = `
    <div class="quick-view__image-wrap">
      <img src="${imagePath}" alt="${product.Name}" class="quick-view__image" />
    </div>
    <div class="quick-view__details">
      <p class="quick-view__brand">${product.Brand.Name}</p>
      <h3>${product.NameWithoutBrand}</h3>
      <p class="quick-view__price">${formatCurrency(product.FinalPrice)}</p>
      ${
        savings
          ? `<p class="quick-view__savings">Save ${savings}</p>`
          : ''
      }
      <p class="quick-view__color">${product.Colors[0].ColorName}</p>
      <p class="quick-view__description">${product.DescriptionHtmlSimple}</p>
      <div class="quick-view__actions">
        <button type="button" class="quick-view__add" data-id="${product.Id}">
          Add to Cart
        </button>
        <a href="${href}" class="button-link quick-view__link">View Full Details</a>
      </div>
    </div>
  `;
}

async function openQuickView(button) {
  try {
    const { id, href } = button.dataset;
    const product = await getProductById(id);

    if (!product) {
      alertMessage('We could not find that product right now.', false);
      return;
    }

    renderQuickView(product, href);
    quickViewModal.showModal();
  } catch (error) {
    alertMessage(error.message || 'Unable to open the quick view right now.', false);
  }
}

function closeQuickView() {
  quickViewModal.close();
}

function setupQuickView() {
  if (!quickViewModal || !quickViewContent) {
    return;
  }

  document.querySelectorAll('.product-card__quickview').forEach((button) => {
    button.addEventListener('click', () => openQuickView(button));
  });

  quickViewModal.addEventListener('click', (event) => {
    if (event.target === quickViewModal) {
      closeQuickView();
      return;
    }

    if (event.target.closest('.quick-view__close')) {
      closeQuickView();
      return;
    }

    const addButton = event.target.closest('.quick-view__add');

    if (addButton) {
      const productId = addButton.dataset.id;
      getProductById(productId)
        .then((product) => {
          if (!product) {
            return;
          }

          addProductToCart(product);
          closeQuickView();
        })
        .catch(() => {
          alertMessage('Unable to add that item to the cart right now.', false);
        });
    }
  });

  quickViewModal.addEventListener('close', () => {
    quickViewContent.innerHTML = '';
  });
}

function setupNewsletter() {
  if (!newsletterForm || !newsletterMessage) {
    return;
  }

  newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const isValid = newsletterForm.checkValidity();
    newsletterForm.reportValidity();

    if (!isValid) {
      return;
    }

    const name = newsletterForm.elements.name.value.trim();
    const email = newsletterForm.elements.email.value.trim();

    setLocalStorage('so-newsletter', {
      name,
      email,
      subscribedAt: new Date().toISOString(),
    });

    newsletterMessage.textContent = `Thanks, ${name}. You're signed up with ${email}.`;
    newsletterForm.reset();
  });
}

setupQuickView();
setupNewsletter();
