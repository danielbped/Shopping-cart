const API_URL = 'https://api.mercadolibre.com/sites/MLB/search?q=computador';

let arrayCart;
let totalPrice = 0;

const getCart = () => {
  const localStorageCart = localStorage.getItem('Cart');
  if (localStorageCart === null || localStorageCart === '') {
    arrayCart = [];
    localStorage.setItem('Cart', arrayCart);
  } else {
    const localStorageConvert = JSON.parse(localStorageCart);
    arrayCart = localStorageConvert;
  }
};

getCart();

const createSalePrice = () => {
  const priceP = document.querySelector('.total-price');
  priceP.innerText = totalPrice;
};

const createProductImageElement = (imageSource) => {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
};

const createCustomElement = (element, className, innerText) => {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
};

const sumTotalPrice = (salePrice) => {
  totalPrice += salePrice;
  createSalePrice();
};

const createProductItemElement = ({ id: sku, title: name, thumbnail: image }) => {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
};

const getSkuFromProductItem = (item) => item.querySelector('span.item__sku').innerText;

const cartItemClickListener = (event, salePrice) => {
  const cart = document.getElementById('cart__items');
  totalPrice -= salePrice;
  createSalePrice();
  cart.removeChild(event.target);
};

const createCartItemElement = ({ id: sku, title: name, price: salePrice }) => {
  const cart = document.getElementById('cart__items');
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  cart.appendChild(li);
  sumTotalPrice(salePrice);
  li.addEventListener('click', (event) => cartItemClickListener(event, salePrice));
  return li;
};

const createItemsList = (data) => {
  const items = document.querySelector('.items');
  const itemsList = data.results;
    itemsList.forEach((item) => {
      const itemElement = createProductItemElement(item);
      items.appendChild(itemElement);
    });
};

const fetchApi = (url) => 
  new Promise((resolve) => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => createItemsList(data))
      .then((itemsList) => resolve(itemsList));
  });

const buttonAddCart = () => {
  const buttons = document.querySelectorAll('.item__add');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
    const id = button.parentNode.firstChild.innerText;
    fetch(`https://api.mercadolibre.com/items/${id}`)
    .then((response) => response.json())
    .then((item) => {
      arrayCart.push(item);
      localStorage.setItem('Cart', JSON.stringify(arrayCart));
      createCartItemElement(item);
    });
    });
  });
};

const removeLoadingText = () => {
  const body = document.querySelector('body');
  body.removeChild(body.firstElementChild);
};

const buttonEmptyCart = () => {
  const buttonEmpty = document.getElementById('empty-cart');
  const cart = document.getElementById('cart__items');
  buttonEmpty.addEventListener('click', () => {
    cart.innerHTML = '';
    totalPrice = 0;
    createSalePrice();
    localStorage.setItem('Cart', []);
  });
};

window.onload = function onload() {
  fetchApi(API_URL).then(() => {
    removeLoadingText();
    buttonAddCart();
  });
  buttonEmptyCart();
  createSalePrice();
  arrayCart.forEach((item) => createCartItemElement(item));
};