const ORDERS_URL = "http://localhost:8080/api/orders";

async function getItems() {
    const response = await fetch(ORDERS_URL);
    const orders = await response.json();
    const allItemsByUser = orders.filter(order => order.customer === null); // I don't have any clients yet.
    return allItemsByUser.flatMap(order => order.items).map(item => {
        let qty = item.qty || 1; // Default to 1 if not specified
        return {
            id: item.articulo.id,
            title: item.articulo.name,
            description: item.articulo.description,
            price: item.articulo.price,
            stock: item.articulo.stock,
            inTheCart: qty,
            images: item.articulo.imagesUrl || ["https://via.placeholder.com/150"] // Default image if none provided
        };
    });
};

function updateItemQuantity(itemId, qty) {
    const orderId = localStorage.getItem("orderId");

    fetch(`${ORDERS_URL}/${orderId}/items/${itemId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(qty)
    });
}

async function updateCartCount() {
    const cart = await getItems();
    document.querySelector(".cart-count").innerText = cart.length < 10 ? `${cart.length}` : "+9";
}

async function removeItemFromCart(id) {
    updateProductQuantity(id, "remove"); // Set quantity to 0 to remove the item
    let cart = await getItems();
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
/*function decrementItem(id) {
    let cart = getItems();
    const item = cart.find(item => item.id === id);
    if (item && item.inTheCart>1) {
        item.inTheCart= item.inTheCart - 1;
        localStorage.setItem('cart', JSON.stringify(cart));    
    }
}*/

/*async function incrementItem(id) {
    const orderId = localStorage.getItem("orderId");
    let cart = await getItems();

    const item = cart.find(item => item.id === id);
   
    if (item && item.stock > item.inTheCart) {
        let newValor = item.inTheCart +1;
        item.inTheCart=newValor;
        // update order
        const response = await fetch(`${ORDERS_URL}/${orderId}/items/${item.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newValor)
        });
        if (!response.ok) {
            console.error('Error updating item quantity:', response.statusText);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
    }
}*/

async function updateProductQuantity(itemId, action) {
    const orderId = localStorage.getItem("orderId");
    let cart = await getItems();

    const item = cart.find(item => item.id === itemId);

    if (item && item.id) {
        if (action === "increase" && item.inTheCart < item.stock) {
            item.inTheCart += 1;
        } else if (action === "decrease" && item.inTheCart > 1) {
            item.inTheCart -= 1;
        } else if (action === "remove") {
            item.inTheCart = 0;
        }
        qty = item.hasOwnProperty("inTheCart") ? Number(item.inTheCart) : 1;
        fetch(`${ORDERS_URL}/${orderId}/items/${item.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(qty)
        });
        localStorage.setItem("cart", JSON.stringify(cart));
        if (cart.length === 0) {
            localStorage.removeItem('cart');
            localStorage.removeItem('orderId'); // Clear orderId if cart is empty
        }
    }
    //displayCart();
    updateCartCount();
    updateQuantity();
}

async function updateQuantity() {
    var addCartBtn =  document.querySelectorAll('.add-cart');
    let cart = await getItems();
    cart.forEach(item => {
        let btn = Array.from(addCartBtn).find(button => Number(button.id) === item.id);
        if (btn){
            btn.innerHTML = `${item.inTheCart}<i class="fa-solid fa-cart-plus fa-xl "></i>`;
        }     
    })
}

function modifyQuantities(event) {
    const productId = Number(event.target.getAttribute('data-id'));
    event.target.id === 'decrement' ? updateProductQuantity(productId, "decrease") : updateProductQuantity(productId, "increase");
    displayCart();
    event.stopImmediatePropagation();
}

// display
async function displayCart() {
    let items = await getItems();
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
                    <p class="price">$${item.price}</p>
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
    });

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