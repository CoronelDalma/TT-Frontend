// components
/* ----- header -----*/
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    document.querySelector(".cart-count").innerText = cart.length < 10 ? `${cart.length}` : "+9";
}

function changeTheme() {
    const themeToggle = document.getElementById("theme-toggle");
    console.log("Theme toggle element:", themeToggle);
    const currentTheme = localStorage.getItem("theme");

    if (currentTheme === "dark") {
        document.body.classList.add("dark-theme");
        themeToggle.checked = true;
    }

    themeToggle.addEventListener("change", function () {
        if (themeToggle.checked) {
            document.body.classList.add("dark-theme");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-theme");
            localStorage.setItem("theme", "light");
        }
    });
}

fetch('Components/Header.html')
.then(response => response.text())
.then(data => {
    document.getElementById('header').innerHTML = data;
   
    var btn = document.querySelector(".search-button");
    btn.addEventListener('click', function(event){
        event.preventDefault();
    
        var search = document.querySelector(".search-input").value;
        if (search) {
            localStorage.setItem("search", search);
            window.location.href = "products.html";
        }
    })

    // cart
    updateCartCount();

    // theme
    changeTheme();
    
}); 

/* ----- footer -----*/
fetch('Components/Footer.html')
.then(response => response.text())
.then(data => {
    document.getElementById('footer').innerHTML = data;
});