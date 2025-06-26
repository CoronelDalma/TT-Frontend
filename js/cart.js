function getItems() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    return cart;
}

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    document.querySelector(".cart-count").innerText = cart.length < 10 ? `${cart.length}` : "+9";
}

function removeItemFromCart(id) {
    let cart = getItems();
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
}

function removeFromDOM(itemId) {
    const itemElement = document.getElementById(`cart-${itemId}`);
    if (itemElement) {
        itemElement.remove();
    }
}

function removeItem(id) {
    removeItemFromCart(id);
    removeFromDOM(id);
    updateCartCount();
    displayCart();
}

// quantities
function decrementItem(id) {
    let cart = getItems();
    const item = cart.find(item => item.id === id);
    if (item && item.inTheCart>1) {
        item.inTheCart= item.inTheCart - 1;
        localStorage.setItem('cart', JSON.stringify(cart));    
    }
}

function incrementItem(id) {
    let cart = getItems();
    const item = cart.find(item => item.id === id);
    if (item && item.stock > item.inTheCart) {
        let newValor = item.inTheCart +1;
        item.inTheCart=newValor;
        localStorage.setItem('cart', JSON.stringify(cart));
    }
}
function modifyQuantities(event) {
    const productId = Number(event.target.getAttribute('data-id'));
    event.target.id === 'decrement' ? decrementItem(productId) : incrementItem(productId);
    displayCart();
    event.stopImmediatePropagation();
}

// display
function displayCart() {
    let items = getItems();
    var total = 0;

    const container = document.querySelector(".container");
    container.innerHTML = '';
    container.innerHTML += `
        <h1 class="h1-center">Carrito de Compras</h1>
    `;
    items.forEach(item => {
        if (item) {
            total += item.price*item.inTheCart;
            container.innerHTML += `
                <div class="cart-item" id="item-${item.id}">
                    <img src=${item.images[0]} alt=${item.title}>
                    <div class="cart-title">
                        <h2>${item.title}</h2>
                        <p>${item.description}</p>
                    </div>
                    <div class="price">$${item.price}</div>
                    <div class="quantity-total">
                        <div>
                            <div class="input-group">
                                <button id="decrement" data-id="${item.id}" class=${(item.inTheCart===1) ? "disabled" : ""}>-</button>
                                <input type="text" value="${item.inTheCart}" id="quantity" readonly>
                                <button id="increment" data-id="${item.id}" class=${(item.inTheCart===item.stock) ? "disabled" : ""}>+</button>
                            </div>
                            <p>${(item.inTheCart===item.stock) ? "Stock: "+item.stock : ""}</p>
                        </div>

                        <div class="total">$${(item.price * item.inTheCart).toFixed(2)}</div>
                    </div>
                    <div class="cart-btn">
                        <button type="button" class="btn btn-danger" data-id="${item.id}">
                            <i class="fa-solid fa-trash"></i>Eliminar
                        </button>
                    </div>
                </div>
            `;
        }
    })

    container.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('btn-danger')) {
            const productId = event.target.getAttribute('data-id');
            removeItem(Number(productId));
        }

        if (event.target && (event.target.id === 'decrement' || event.target.id === 'increment')) {
            modifyQuantities(event);
        }
    });

    if (items.length>0) {
        container.innerHTML +=  `
            <div class="cart-total">
                <h2>Total: $${total.toFixed(2)}</h2>
                <a href="./checkout.html" class="goCheckout"><button id="finalizar-compra">Pagar</button></a>
            </div>
        `;
        document.querySelector(".goCheckout").addEventListener("click" , function(event) {
            event.preventDefault();
        })

        document.getElementById('finalizar-compra').addEventListener('click', () => {
            Swal.fire({
            title: 'Compra Procesada',
            text: 'Se ha procesado la compra #1200',
            icon: 'success',
            confirmButtonText: 'Aceptar'
            });
            
            localStorage.removeItem('cart'); 
            setTimeout(() => {
                window.location.href = 'index.html'; 
            }, 6000);     
        });

    } else {
        container.innerHTML +=  `
            <div class="cart-total">
                <h2>No hay productos en el carrito</h2>    
            </div>
        `;
    }
}

// Botón para finalizar la compra con sweet Alert
// document.getElementById('finalizar-compra').addEventListener('click', () => 
//     {
//         Swal.fire({
//             title: 'Compra Procesada',
//             text: 'Se ha procesado la compra #1200',
//             icon: 'success',
//             confirmButtonText: 'Aceptar'
//         });

//         // Limpiar el carrito después de finalizar la compra
//         localStorage.removeItem('cart'); 
        
//         // Redirigir al inicio despues de 4 segundos
//         setTimeout(() => {
//         window.location.href = 'index.html'; 
//         }, 4000);     
//     });

document.addEventListener('DOMContentLoaded', displayCart);