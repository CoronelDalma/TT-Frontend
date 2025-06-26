// top categories
var topCat = ["groceries","home-decoration","laptops","smartphones","sports-accessories"];
fetch('json/categories.json')
.then(res => res.json())
.then(category => {
    var container = document.querySelector(".top");
    topCat.forEach(element => {
        container.innerHTML += `
            <li class="my-card category-card">
                <a href="https://dummyjson.com/products/category/${element}" class="">
                    <h6 class="white">${element}</h6>
                    <div class="image-container">
                        <img src=${category[element].imageUrl} alt=${element} class="card-image category-image">
                    </div>    
                </a>  
            </li>
        `;
    });

    // view - top categories
    var categoryCards = document.querySelectorAll(".category-card");
    categoryCards.forEach(card => {
        card.addEventListener('click', function(event) {
            event.preventDefault();
            let urlParts = card.firstElementChild.href.split("/");
            const lastPart = urlParts[urlParts.length - 1];
            localStorage.setItem(`category`, lastPart);
            window.location.href = "/products.html"
        })
    })
})

// products section
// To do : codigo repetido en scripts
function seeProduct(product) {
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    window.location.href = "product.html";
}

function displayData(data) {
    const container = document.querySelector('.products');
    console.log(container);
    container.innerHTML = '';
    if (data.total > 0) {
        data.products.forEach(product => {
            container.innerHTML += `
                <li class="my-card product-card">
                    <a href="product.html" class="product-${product.id}" id="${product.id}">
                        <div class="image-container imageh-75">
                            <div class="icons-product-card">
                                <div class="star-icon">${product.rating}<i class="fa-solid fa-star"></i></div>
                                <div class="price-tag">${product.price}</div>
                            </div>
                            <img src=${product.images[0]} alt=${product.title} class="card-image product-image">
                        </div>
                        <div class="info-product-card">
                            <div class="info-card">
                                <p class="white">${product.category}</p>
                                <h6 class="product-card-title">${product.title}</h6>
                            </div>
                        </div>
                    </a> 
                </li>
            `;

            // see product
            var links = document.querySelectorAll('[class^="product-"]');
            links.forEach((link) => {
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                    seeProduct(data.products[(link.id % limit)-1]);
                })          
            })
        })
    } else {
        container.innerHTML = `
            <div class="no-results">
                <h3>No se encontraron resultados</h3>
                <img src="./images/undraw_searching.svg" alt="No se encontraron resultados"> 
            </div>
        `;
    }
}

const limit = 6;
fetch(`https://dummyjson.com/products?limit=${limit}&skip=0&select=title,price,rating,images,category,description,stock,reviews`)
.then(res => res.json())
.then(data => {
    displayData(data);
});