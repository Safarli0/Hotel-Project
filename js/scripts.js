// ELEMENTLERI SECIRIK
const darkBtn = document.getElementById("darkModeToggle");
const body = document.body;
let btnPrev = document.querySelector(".prev-btn");
let btnNext = document.querySelector(".next-btn");
let img1 = document.getElementById("glpc1");
let img2 = document.getElementById("glpc2");
let img3 = document.getElementById("glpc3");

let images = [
    "img/view1.jpg",
    "img/view2.webp",
    "img/view3.avif"
];

// function chngImg() {
//     img1.src = "img/view1.jpg";
//     img2.src = "img/view2.webp";
//     img3.src = "img/view3.avif"; 
// }

// btnNext.addEventListener("click", chngImg);
// btnPrev.addEventListener("click", chngImg);





// LOCAL STORAGE - istifadəçinin seçimini yadda saxlayırıq
if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark");
}

// DARK MODE TOGGLE
darkBtn.addEventListener("click", function () {
    body.classList.toggle("dark");
    

    // yadda saxla
    if (body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
});


// FORM VALIDATION
const form = document.querySelector(".contact-form");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let phone = document.getElementById("phone").value.trim();

    if (name === "" || email === "" || phone === "") {
        alert("Zəhmət olmasa bütün sahələri doldurun!");
        return;
    }

    if (!email.includes("@")) {
        alert("Email düzgün deyil!");
        return;
    }

    alert("Form uğurla göndərildi ✅");
    form.reset();
});


// SMOOTH SCROLL (menu klikdə yumşaq keçid)
const links = document.querySelectorAll("nav ul li a");

links.forEach(link => {
    link.addEventListener("click", function (e) {
        if (this.getAttribute("href").startsWith("#")) {
            e.preventDefault();

            const section = document.querySelector(this.getAttribute("href"));

            section.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});


// NAVBAR SCROLL EFFECT
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", function () {
    if (window.scrollY > 100) {
        navbar.style.background = "#000";
    } else {
        navbar.style.background = "transparent";
    }
});