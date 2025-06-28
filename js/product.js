document.addEventListener("DOMContentLoaded", () => {
    var product = JSON.parse(localStorage.getItem("selectedProduct")) || {};
    var cart = JSON.parse(localStorage.getItem("cart")) ||[];
    let find = cart.find(item => item.id === product.id);

    document.title =product.title;

    const viewProduct = document.querySelector(".product-container");
    viewProduct.innerHTML = "";
    viewProduct.innerHTML += `
        <div class="product-images">
            <img src=${product.imagesUrl[0]} alt="${product.name}" class="card-image">
        </div>
        <div class="product-info">
            <h1>${product.name}</h1>
            <div class="price-info">
                <p class="price-tag">$${product.price}</p>
                <p class="product-stock">${product.stock} En stock</p>
            </div>
            <p class="product-description">${product.description}</p>
            <div class="quantity">
                <input type="number" value="${find ? find.inTheCart : 1}" min="1" max="${product.stock}" id="qty">
            </div>
            <button class="btn-clear" style="margin-top: 1rem;">Agregar al carrito</button>
        </div>
    `;

    /* WIP: reviews section
    const reviews = document.querySelector(".reviews-container");
    reviews.innerHTML = "";
    product.reviews.forEach(review => {
        reviews.innerHTML += `
            <div class="review-card reviewer-name">
                <h3>${review.reviewerName}</h3>
                <div class="star-icon star-review">${review.rating}<i class="fa-solid fa-star"></i></div>
                <p>${review.comment}</p>
            </div>
        `
    })*/

    //update cart
    const addCartBtn = document.querySelector(".btn-clear");
    addCartBtn.addEventListener('click', function(event) {
        event.preventDefault();
        let qty = Number(document.getElementById("qty").value);
        product.inTheCart = qty;
        find ? find.inTheCart = qty : cart.push(product);

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${product.title} ha sido agregado al carrito!`);
        updateCartCount();
    })

})