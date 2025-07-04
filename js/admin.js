// URL base for the API
const API_ARTICLES_URL = "http://localhost:8080/api/articulos";
const API_CATEGORIES_URL = "http://localhost:8080/api/categories";

// when the page loads
document.addEventListener("DOMContentLoaded", function () {
    resetForm();
    displayCategories();
    //displayArticles();            
});

async function fetchCategories() {
    try {
        const response = await fetch(API_CATEGORIES_URL);
        if (!response.ok) {
            throw new Error("Error fetching categories");
        }
        const categories = await response.json();
        return categories;
    } catch (error) {
        console.error(error);
    }
}

async function fetchArticles() {
    try {
        const response = await fetch(API_ARTICLES_URL);
        if (!response.ok) {
            throw new Error("Error fetching articles");
        }
        const articles = await response.json();
        return articles;
    } catch (error) {
        console.error(error);
    }
}

// This script is intended to manage the admin functionalities of an e-commerce platform.
// It fetches articles and categories from a REST API and displays them on the admin page.
let selectedCategories = [];
const categoryContainer = document.getElementById("categories-container");
function displayCategories() {
    sugerenciasDiv.innerHTML = "";
    fetchCategories()
        .then(categories => {
            console.log(categories);
            if (categories && categories.length > 0) {
                categories.forEach(cat => {
                    const label = document.createElement("label");
                    label.style.display = "flex";
                    label.style.margin = " 0 4px";
                    label.style.alignItems = "center";
                    label.style.gap = "0.5rem";

                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.value = cat.name;

                    checkbox.onchange = function () {
                        if (this.checked) {
                            addSelectedCategory(cat.name);
                        } else {
                            selectedCategories = selectedCategories.filter(c => c.name !== cat.name);
                            renderSelectedCategories();
                        }
                    };

                    label.appendChild(checkbox);
                    label.appendChild(document.createTextNode(" " + cat.name));
                    sugerenciasDiv.appendChild(label);
                });
                markCategories();
            } else {
                categoryContainer.innerHTML = "<span>No hay categorías disponibles</span>";
            }
        });
}

function markCategories() {
    selectedCategories.forEach((category) => {
    const checkbox = document.querySelector(`#sugerenciasCategorias input[value="${category.name}"]`);
    if (checkbox) checkbox.checked = true;
    })
}

function displayArticles() {
    const articleContainer = document.getElementById("articles-list");
    articleContainer.innerHTML = ""; // Clear existing articles
    articleContainer.innerHTML += `
        <h1 class="h1-center">Artículos</h1>
    `;
    fetchArticles()
    .then(articles => {
        console.log(articles);
        if (articles && articles.length > 0) {
            articles.forEach(article => {
            articleContainer.innerHTML += `
                <div class="cart-item" id="item-${article.id}">
                    <img src=${article.imagesUrl[0]} alt=${article.name}>
                    <div class="cart-title">
                        <h2>${article.name}</h2>
                        <p>${article.description}</p>
                    </div>
                    <div style="width:200px">
                        <p>${article.categories.map(cat => cat.name).join(", ")}</p>
                    </div>
                    <p class="price">$${article.price}</p>

                    <div class="article-btn">
                        <button type="button" class="btn btn-info" onClick="editItem(${article.id})" data-id="${article.id}">
                            <i class="fa-solid fa-trash"></i>Editar
                        </button>
                        <button type="button" class="btn btn-danger" onClick="deleteArticle(${article.id})" data-id="${article.id}">
                            <i class="fa-solid fa-trash"></i>Eliminar
                        </button>
                    </div>
                </div>
            `;
            });
        } else {
            const articleContainer = document.getElementById("articles-list");
            articleContainer.innerHTML += "<p>No hay artículos disponibles</p>";
        }
    });
}

function deleteArticle(id) {
    // Confirmación antes de eliminar
    if (confirm("¿Deseás eliminar este artículo?")) {
        // Llamada DELETE al backend
        fetch(`${API_ARTICLES_URL}/${id}`, {
            method: "DELETE"
        })
        .then(response => {
            if (!response.ok) throw new Error("Error al eliminar"); // Verificamos que la respuesta sea exitosa
            displayArticles(); // Actualizamos la lista de artículos
        })
        .catch(error => console.error("Error al eliminar artículo:", error)); // Manejo de errores
    }
}

function editItem(id) {
    fetch(`${API_ARTICLES_URL}/${id}`)
    .then(response => response.json())
    .then(item => {
        document.getElementById("item-id").value = item.id;
        document.getElementById("article-name").value = item.name;
        document.getElementById("article-price").value = item.price;
        document.getElementById("article-description").value = item.description;
        document.getElementById("article-image").value = item.imagesUrl;
        selectedCategories = item.categories;
        renderSelectedCategories();
        markCategories();

        // Scroll
        const form = document.getElementById("product");
        if (form) {
            form.scrollIntoView( { behavior: "smooth"});
        }
    })
    .catch(error => console.error("Error al obtener artículo:", error));
}

// ---- Handling the FORM to add a new article
document.getElementById("add-article-form").addEventListener("submit", addArticulo);
document.getElementById("cancel").addEventListener("click",resetForm);

function resetForm() {
    // Limpiamos el formulario y recargamos la tabla
    document.getElementById("add-article-form").reset();
    document.getElementById("item-id").value = null;
    selectedCategories = [];
    renderSelectedCategories();
    //document.getElementById("idArticulo").value = "";
    displayArticles();
}

function createArticulo() {
    const name = document.getElementById("article-name").value.trim();
    const price = parseFloat(document.getElementById("article-price").value);
    const description = document.getElementById("article-description").value.trim();
    const imagesRaw = document.getElementById("article-image").value;
    const images = imagesRaw.split(",").map(url => url.trim()).filter(url => url !== ""); // Para eliminar los arrays de espacios vacios -> solo queda []
    //const stock = parseInt(document.getElementById("article-stock").value);

    // TODO validaciones antes de crear el articulo
    if (!name || isNaN(price) || price <= 0) {
        alert("Por favor complete correctamente los campos.");
        return;
    }

    const article = { name, description, price, stock:5, imagesUrl: images, categories: selectedCategories};
    let id = document.getElementById("item-id") ? document.getElementById("item-id").value : null ;
    const url = id ? `${API_ARTICLES_URL}/${id}` : API_ARTICLES_URL;
    const method = id ? "PUT" : "POST";
    // Enviamos el artículo al backend usando fetch
    fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" }, // Indicamos que el cuerpo es JSON
        body: JSON.stringify(article) // Convertimos el objeto a JSON
    })
    .then(response => {
        if (!response.ok) throw new Error("Error al guardar"); // Verificamos respuesta exitosa
        return response.json();
    })
    .then(() => {
        resetForm();
    })
    .catch(error => console.error("Error al guardar artículo:", error)); // Manejo de errores
}

function addArticulo(event) {
    event.preventDefault();
    createArticulo();
}


// ----- handler create category
const sugerenciasDiv = document.getElementById("sugerenciasCategorias");
sugerenciasDiv.style.display = "flex";
sugerenciasDiv.style.gap = "1rem";
sugerenciasDiv.style.flexWrap = "wrap";

document.getElementById("createCategory").addEventListener("click",createCategory);

function createCategory(event) {
    const categoryInput = document.getElementById("categoryInput");
    const icon = document.getElementById("categoryIcon").value.trim();
    const name = categoryInput.value.trim().toUpperCase();
    if (name) {
        event.preventDefault();
        // pegarle a la api para crear la nueva categoria
        fetch(API_CATEGORIES_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({"name": name, "icon": icon})
        })
        .then(response => {
            addSelectedCategory(name);
            this.value = "";
            displayCategories();
        })
    }
}
/*categoryInput.addEventListener("keydown", function (e) {
    const name = this.value.trim();
    if (e.key === "Enter" && name) {
        e.preventDefault();
        // pegarle a la api para crear la nueva categoria
        fetch(API_CATEGORIES_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({"name": name, "icon": icon})
        })
        .then(response => {
            addSelectedCategory(this.value.trim());
            this.value = "";
            displayCategories();
        })

    }
});*/

function addSelectedCategory (name) {
    if (!selectedCategories.find(cat => cat.name === name)) {
        selectedCategories.push({name});

        renderSelectedCategories();
        // Marcar el checkbox si ya existe visualmente
        const checkbox = document.querySelector(`#sugerenciasCategorias input[value="${name}"]`);
        if (checkbox) checkbox.checked = true;
    }
}

function renderSelectedCategories() {
    categoryContainer.innerHTML = "";
    selectedCategories.forEach(cat => {
        const chip = document.createElement("p");
        chip.style.display = "inline-block";
        chip.style.margin = "0 1.5rem";
        chip.textContent = cat.name;
        console.log(cat);

        const cerrar = document.createElement("button");
        cerrar.textContent = "×";
        cerrar.onclick = () => {
            selectedCategories = selectedCategories.filter(c => c.name !== cat.name);
            renderSelectedCategories();
            // Desmarcar el checkbox si aplica
            const checkbox = document.querySelector(`#sugerenciasCategorias input[value="${cat.name}"]`);
            if (checkbox) checkbox.checked = false;
        };

        chip.appendChild(cerrar);
        categoryContainer.appendChild(chip);
    });
}

