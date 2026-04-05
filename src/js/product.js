import { addProductToCart } from './cart-helpers.mjs';
import { addComment, getComments } from './comments-helpers.mjs';
import { getCustomer, getCustomerDisplayName } from './customer.mjs';
import { formatCurrency } from './utils.mjs';
import {
  isInWishlist,
  toggleWishlist,
} from './wishlist-helpers.mjs';
import ProductData from './ProductData.mjs';

const productDetail = document.querySelector('.product-detail');
const initialButton = document.getElementById('addToCart');

function colorNameToHex(name) {
  const colorMap = {
    amber: '#d98c26',
    army: '#54613d',
    blue: '#557da8',
    canary: '#e0c22d',
    clay: '#a65f48',
    copper: '#b26738',
    dark: '#3f4a3a',
    gold: '#c9a24a',
    golden: '#c9a24a',
    gray: '#7d858d',
    green: '#5a7a58',
    grey: '#7d858d',
    olive: '#68714a',
    pale: '#d9ab7d',
    pumpkin: '#bf6f2f',
    rust: '#9f523b',
    saffron: '#d7a325',
    spruce: '#35514a',
    storm: '#47607b',
    terracotta: '#a65f48',
    yellow: '#d9bf3f',
    zinc: '#88939d',
  };

  const parts = name
    .toLowerCase()
    .split(/[/, ]+/)
    .map((part) => colorMap[part])
    .filter(Boolean);

  return parts.length ? parts : ['#8a470c', '#d0d0d0'];
}

function swatchMarkup(color) {
  if (color.ColorChipImageSrc) {
    return `<img src="${color.ColorChipImageSrc}" alt="" />`;
  }

  const colors = colorNameToHex(color.ColorName);
  const gradient = colors.length === 1 ? colors[0] : `linear-gradient(135deg, ${colors.join(', ')})`;

  return `<span class="product-colors__chip-fallback" style="background: ${gradient};"></span>`;
}

function getSelectedColor(product, colorCode) {
  return (
    product.Colors.find((color) => color.ColorCode === colorCode) || product.Colors[0]
  );
}

function getBaseGalleryImages(product) {
  const primaryImage = product.Images?.PrimaryLarge || product.Image;
  const extras = product.Images?.ExtraImages || [];
  const gallery = [
    {
      title: 'Primary View',
      src: primaryImage,
    },
    ...extras.map((image) => ({
      title: image.Title || 'Alternate View',
      src: image.Src,
    })),
  ];

  return gallery.filter(
    (image, index, allImages) =>
      image.src && allImages.findIndex((entry) => entry.src === image.src) === index,
  );
}

function getGalleryImages(product, selectedColor) {
  const previewImage = selectedColor.ColorPreviewImageSrc;
  const gallery = getBaseGalleryImages(product);

  if (previewImage) {
    return [
      {
        title: `${selectedColor.ColorName} Preview`,
        src: previewImage,
      },
      ...gallery.filter((image) => image.src !== previewImage),
    ];
  }

  return gallery;
}

function buildCartProduct(product, selectedColor) {
  const selectedImage =
    selectedColor.ColorPreviewImageSrc || product.Images?.PrimaryLarge || product.Image;

  return {
    ...product,
    Image: selectedImage,
    SelectedColor: selectedColor,
  };
}

function commentTemplate(comment) {
  return `
    <article class="comment-card">
      ${
        comment.avatar
          ? `<img src="${comment.avatar}" alt="${comment.author}" class="comment-card__avatar" />`
          : `<div class="comment-card__avatar comment-card__avatar--fallback">${comment.author
              .charAt(0)
              .toUpperCase()}</div>`
      }
      <div class="comment-card__content">
        <div class="comment-card__header">
          <strong>${comment.author}</strong>
          <span>${new Date(comment.createdAt).toLocaleDateString()}</span>
        </div>
        <p>${comment.message}</p>
      </div>
    </article>
  `;
}

function productDetailTemplate(product, state) {
  const selectedColor = getSelectedColor(product, state.selectedColorCode);
  const galleryImages = getGalleryImages(product, selectedColor);
  const activeImage = galleryImages[state.selectedImageIndex] || galleryImages[0];
  const discountAmount = product.SuggestedRetailPrice - product.FinalPrice;
  const hasDiscount = discountAmount > 0;
  const hasMultipleColors = product.Colors.length > 1;
  const hasCarousel = galleryImages.length > 1;
  const savedToWishlist = isInWishlist(product.Id, selectedColor.ColorCode);
  const comments = getComments(product.Id);
  const customer = getCustomer();
  const customerName = getCustomerDisplayName(customer);

  return `
    <h3 class="product__brand">${product.Brand.Name}</h3>
    <h2 class="divider">${product.NameWithoutBrand}</h2>

    <div class="product-gallery">
      <img
        class="divider product-gallery__main"
        src="${activeImage.src}"
        alt="${product.Name}"
      />
      ${
        hasCarousel
          ? `<div class="product-gallery__thumbs">
              ${galleryImages
                .map(
                  (image, index) => `
                    <button
                      class="product-gallery__thumb ${index === state.selectedImageIndex ? 'is-active' : ''}"
                      type="button"
                      data-image-index="${index}"
                      aria-label="Show ${image.title}"
                    >
                      <img src="${image.src}" alt="${image.title}" />
                    </button>
                  `,
                )
                .join('')}
            </div>`
          : ''
      }
    </div>

    <p class="product-card__price">${formatCurrency(product.FinalPrice)}</p>
    ${
      hasDiscount
        ? `<p class="product__discount">Save ${formatCurrency(discountAmount)}</p>`
        : ''
    }

    ${
      hasMultipleColors
        ? `<div class="product-colors">
            <p class="product-colors__label">Choose a color</p>
            <div class="product-colors__list">
              ${product.Colors.map(
                (color) => `
                  <button
                    class="product-colors__option ${color.ColorCode === selectedColor.ColorCode ? 'is-active' : ''}"
                    type="button"
                    data-color-code="${color.ColorCode}"
                    aria-label="Select ${color.ColorName}"
                  >
                    ${swatchMarkup(color)}
                    <span>${color.ColorName}</span>
                  </button>
                `,
              ).join('')}
            </div>
          </div>`
        : ''
    }

    <p class="product__color">
      Selected Color:
      <span class="product__color-name">${selectedColor.ColorName}</span>
    </p>

    <div class="product__description">${product.DescriptionHtmlSimple}</div>

    <div class="product-detail__add">
      <div class="product-detail__actions">
        <button
          id="addToCart"
          data-id="${product.Id}"
          data-selected-color="${selectedColor.ColorCode}"
        >
          Add to Cart
        </button>
        <button
          id="wishlistToggle"
          type="button"
          class="wishlist-toggle ${savedToWishlist ? 'is-active' : ''}"
        >
          ${savedToWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
        </button>
      </div>
    </div>

    <section class="product-comments">
      <div class="product-comments__header">
        <div>
          <p class="newsletter__eyebrow">Trail Notes</p>
          <h3>Product Comments</h3>
        </div>
        <span class="product-comments__count">${comments.length} comment${comments.length === 1 ? '' : 's'}</span>
      </div>
      <form class="comment-form" id="commentForm">
        ${
          customer
            ? `<p class="comment-form__identity">Commenting as ${customerName}</p>`
            : `<label for="commentAuthor">Your Name</label>
               <input id="commentAuthor" name="author" type="text" required minlength="2" />`
        }
        <label for="commentMessage">Comment</label>
        <textarea
          id="commentMessage"
          name="message"
          rows="4"
          required
          minlength="4"
          placeholder="Share what you noticed about this gear..."
        ></textarea>
        <button type="submit">Post Comment</button>
      </form>
      <div class="comment-list">
        ${
          comments.length
            ? comments.map((comment) => commentTemplate(comment)).join('')
            : '<p class="orders-empty">No comments yet. Be the first to share feedback.</p>'
        }
      </div>
    </section>
  `;
}

function renderProductDetail(product, state) {
  productDetail.innerHTML = productDetailTemplate(product, state);
}

function attachDetailEvents(product, state) {
  productDetail.querySelector('#addToCart').addEventListener('click', () => {
    const selectedColor = getSelectedColor(product, state.selectedColorCode);
    addProductToCart(buildCartProduct(product, selectedColor));
  });

  productDetail.querySelector('#wishlistToggle').addEventListener('click', () => {
    const selectedColor = getSelectedColor(product, state.selectedColorCode);
    toggleWishlist(product, selectedColor);
    renderProductDetail(product, state);
    attachDetailEvents(product, state);
  });

  productDetail.querySelector('#commentForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const commentForm = event.currentTarget;
    const isValid = commentForm.checkValidity();
    commentForm.reportValidity();

    if (!isValid) {
      return;
    }

    const customer = getCustomer();
    addComment(product.Id, {
      author: customer ? customer.name || getCustomerDisplayName(customer) : commentForm.author.value.trim(),
      avatar: customer?.avatar || '',
      email: customer?.email || '',
      message: commentForm.message.value.trim(),
    });

    renderProductDetail(product, state);
    attachDetailEvents(product, state);
  });

  productDetail.querySelectorAll('[data-color-code]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedColorCode = button.dataset.colorCode;
      state.selectedImageIndex = 0;
      renderProductDetail(product, state);
      attachDetailEvents(product, state);
    });
  });

  productDetail.querySelectorAll('[data-image-index]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedImageIndex = Number(button.dataset.imageIndex);
      renderProductDetail(product, state);
      attachDetailEvents(product, state);
    });
  });
}

async function initProductDetail() {
  if (!productDetail || !initialButton) {
    return;
  }

  const category = productDetail.dataset.category || 'tents';
  const productId = initialButton.dataset.id;
  const dataSource = new ProductData(category);
  const product = await dataSource.findProductById(productId);

  if (!product) {
    return;
  }

  const state = {
    selectedColorCode: product.Colors[0].ColorCode,
    selectedImageIndex: 0,
  };

  renderProductDetail(product, state);
  attachDetailEvents(product, state);
}

initProductDetail();
