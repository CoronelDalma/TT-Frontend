// URL base for the API
const API_ARTICLES_URL = "http://localhost:8080/api/articulos";
const API_CATEGORIES_URL = "http://localhost:8080/api/categories";

// when the page loads
document.addEventListener("DOMContentLoaded", function () {
    displayCategories();
    displayArticles();            
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
    let articles = fetchArticles()
    .then(articles => {
        console.log(articles);
        /*if (articles && articles.length > 0) {
            const articleContainer = document.getElementById("article-list");
            articleContainer.innerHTML = ""; // Clear existing articles

            articles.forEach(article => {
                const articleItem = document.createElement("li");
                articleItem.textContent = article.title;
                articleContainer.appendChild(articleItem);
            });
        } else {
            const articleContainer = document.getElementById("article-list");
            articleContainer.innerHTML = "<li>No hay artículos disponibles</li>";
        }*/
    });
}

// ---- Handling the FORM to add a new article
document.getElementById("add-article-form").addEventListener("submit", addArticulo);

function createArticulo() {
    const name = document.getElementById("article-name").value.trim();
    const price = parseFloat(document.getElementById("article-price").value);
    const description = document.getElementById("article-description").value.trim();
    const imagesRaw = document.getElementById("article-image").value;
    const images = imagesRaw.split(",").map(url => url.trim()).filter(url => url !== ""); // Para eliminar los arrays de espacios vacios -> solo queda []
    //const stock = parseInt(document.getElementById("article-stock").value);

    // TODO validaciones antes de crear el articulo
    console.log("name "+ name);
    console.log("price ",price);
    console.log("description ",description);
    console.log(images);
    //console.log("stock ",stock);
    if (!name || isNaN(price) || price <= 0) {
        alert("Por favor complete correctamente los campos.");
        return;
    }

    console.log(images);

    const article = { name, description, price, stock:5, imagesUrl: images, categories: selectedCategories};
    let id = null;
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
        // Limpiamos el formulario y recargamos la tabla
        document.getElementById("add-article-form").reset();
        //document.getElementById("idArticulo").value = "";
        displayArticles();
    })
    .catch(error => console.error("Error al guardar artículo:", error)); // Manejo de errores
}

function addArticulo(event) {
    event.preventDefault();
    createArticulo();
}


// ----- handler create category
const categoryInput = document.getElementById("categoryInput");
const sugerenciasDiv = document.getElementById("sugerenciasCategorias");
sugerenciasDiv.style.display = "flex";
sugerenciasDiv.style.gap = "1rem";
categoryInput.addEventListener("keydown", function (e) {
    const name = this.value.trim();
    if (e.key === "Enter" && name) {
        e.preventDefault();
        // pegarle a la api para crear la nueva categoria
        fetch(API_CATEGORIES_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({"name": name})
        })
        .then(response => {
            addSelectedCategory(this.value.trim());
            this.value = "";
            displayCategories();
        })

    }
});

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
        const chip = document.createElement("span");
        chip.className = "categoria-tag";
        chip.textContent = cat.name;

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

