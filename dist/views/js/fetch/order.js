'use strict';

const uri = window.APP_URI;
const overflowDOM = document.querySelector('.overflow');
let cart;
// Our order html Template
const orderTemplate = data => {
  const nodeDivCartItem = document.createElement('div');
  const nodeCartDesc = document.createElement('div');
  const nodeCartQty = document.createElement('div');
  const nodeCartPrice = document.createElement('div');
  const nodeCartImage = document.createElement('div');
  const nodeCartAdd = document.createElement('div');
  const buttonIncrement = document.createElement('button');
  const buttonDecrement = document.createElement('button');
  const inputQty = document.createElement('input');
  const imgPlus = document.createElement('img');
  const imgMinus = document.createElement('img');
  const imgCart = document.createElement('img');
  const buttonAdd = document.createElement('a');
  const spanName = document.createElement('span');

  nodeDivCartItem.dataset.id = data.id;
  nodeDivCartItem.dataset.name = data.name;
  nodeDivCartItem.className = 'cart__item';

  nodeCartImage.className = 'cart__image';
  imgCart.src = data.img;
  nodeCartImage.appendChild(imgCart);

  nodeCartDesc.className = 'cart__description';
  spanName.innerHTML = data.name;
  nodeCartDesc.appendChild(spanName);

  nodeCartPrice.className = 'cart__item-total-price';
  nodeCartPrice.innerHTML = `&#8358; ${data.price}`;

  nodeCartAdd.className = 'cart__add-to-cart';
  buttonAdd.className = 'button button--secondary button--radius';
  buttonAdd.href = '#';
  buttonAdd.innerHTML = 'Add';
  nodeCartAdd.appendChild(buttonAdd);

  // Cart Quantity Node
  imgPlus.src = 'img/plus.svg';
  imgMinus.src = 'img/minus.svg';
  buttonIncrement.id = 'increment';
  buttonIncrement.className = 'cart__button-plus';
  buttonIncrement.type = 'button';
  buttonDecrement.id = 'decrement';
  buttonDecrement.className = 'cart__button-minus';
  buttonDecrement.type = 'button';
  buttonIncrement.appendChild(imgPlus);
  buttonDecrement.appendChild(imgMinus);
  inputQty.name = 'qty';
  inputQty.value = '0';
  inputQty.type = 'text';
  nodeCartQty.className = 'cart__quantity';
  nodeCartQty.appendChild(buttonIncrement);
  nodeCartQty.appendChild(inputQty);
  nodeCartQty.appendChild(buttonDecrement);

  nodeDivCartItem.appendChild(nodeCartImage);
  nodeDivCartItem.appendChild(nodeCartDesc);
  nodeDivCartItem.appendChild(nodeCartQty);
  nodeDivCartItem.appendChild(nodeCartPrice);
  nodeDivCartItem.appendChild(nodeCartAdd);

  return nodeDivCartItem;
};

// Increment functionality
const increment = () => {
  const incrementBtn = document.querySelectorAll('#increment');
  incrementBtn.forEach(inc => {
    inc.addEventListener('click', e => {
      e.preventDefault();
      const parentID = e.currentTarget.parentNode.parentNode.getAttribute('data-id');
      const parentDOM = document.querySelectorAll(`[data-id='${parentID}']`)[0];
      const inputDOM = parentDOM.getElementsByTagName('input')[0];
      let value = parseInt(inputDOM.value, 10);

      if (value <= 100) {
        value += 1;
      } else {
        value = 0;
      }
      inputDOM.value = value;
    });
  });
};

// Decrement functionality
const decrement = () => {
  const decrementBtn = document.querySelectorAll('#decrement');
  decrementBtn.forEach(dec => {
    dec.addEventListener('click', e => {
      e.preventDefault();
      const parentID = e.currentTarget.parentNode.parentNode.getAttribute('data-id');
      const parentDOM = document.querySelectorAll(`[data-id='${parentID}']`)[0];
      const inputDOM = parentDOM.getElementsByTagName('input')[0];
      let value = parseInt(inputDOM.value, 10);

      if (value >= 1) {
        value -= 1;
      } else {
        value = 0;
      }
      inputDOM.value = value;
    });
  });
};

// Construct the DOM
const constructDOM = meals => {
  meals.forEach(async meal => {
    const ordersDOM = orderTemplate(meal);
    await overflowDOM.appendChild(ordersDOM);
  });
};

const handleButtonClick = () => {
  const addButtons = document.querySelectorAll('.cart__add-to-cart');
  addButtons.forEach(button => {
    button.addEventListener('click', async e => {
      e.preventDefault();
      const parentID = e.currentTarget.parentNode.getAttribute('data-id');
      const parentDOM = document.querySelectorAll(`[data-id='${parentID}']`)[0];
      const inputDOM = parentDOM.getElementsByTagName('input')[0];
      const quantity = parseInt(inputDOM.value, 10);
      const name = parentDOM.getAttribute('data-name');
      const imageUrl = parentDOM.querySelector('.cart__image > img').src;
      const price = parseInt(parentDOM.querySelector('.cart__item-total-price').innerHTML.split(' ')[1], 10);

      if (quantity === 0) {
        return toast('danger', 'Quantity cannot be zero');
      }

      const data = {
        name,
        quantity,
        imageUrl,
        price
      };
      const existOrderID = await cart.getSpecificOrder(name);

      if (existOrderID) {
        cart.updateQuantityOrder(existOrderID, data);
        inputDOM.value = 0;
        toast('success', 'Item successfully added');
      } else {
        const isDone = await cart.storeOrder(data);
        inputDOM.value = 0;
        if (isDone) {
          toast('success', 'Item successfully added');
        }
      }
    });
  });
};

const pageLoading = isLoading => {
  const loadingDOM = document.querySelector('.loading');
  if (isLoading) {
    loadingDOM.classList.add('loading--show');
  } else {
    loadingDOM.classList.remove('loading--show');
  }
};

window.onload = async () => {
  cart = new Cart();
  // Check if token exist
  if (localStorage.getItem('token')) {
    const token = localStorage.getItem('token');
    const payload = token.split('.')[1];
    const data = JSON.parse(window.atob(payload));
    const expires = data.exp;
    const currentDate = Math.floor(Date.now() / 1000); // Convert date to seconds
    // Check if the token has expired or not
    if (expires < currentDate) {
      window.location.href = '/login';
    }
    const options = {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        token
      }
    };
    pageLoading(true);
    const res = await fetch(`${uri}/menu`, options);
    const result = await res.json();
    if (res.status !== 200) toast('danger', result.message);
    await constructDOM(result.menu);
    pageLoading(false);
  } else {
    flash({ type: 'default', message: 'Login Required' });
    window.location.href = '/login';
  }
  increment();
  decrement();
  handleButtonClick();
};