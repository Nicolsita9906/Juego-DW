// ================= VARIABLES GLOBALES =================
let palabra = "";
let oculta = [];
let vidas = 6;
let errores = 0;
let pistas = [];
let indicePista = 0;
let blurNivel = 20;


// ================= INICIAR JUEGO =================
async function iniciarJuego() {

    // Trae varios personajes
    let res = await fetch("https://api.disneyapi.dev/character");
    let data = await res.json();

    // Escoge uno aleatorio del array
    let personajes = data.data;
    let personaje = personajes[Math.floor(Math.random() * personajes.length)];

    // Nombre del personaje
    palabra = personaje.name.toLowerCase();

    // Oculta la palabra (mantiene espacios)
    oculta = palabra.split("").map(letra => letra === " " ? " " : "_");

    // IMAGEN
    let imgElement = document.getElementById("disney-img");
    imgElement.src = personaje.imageUrl || "";

    blurNivel = 20;
    imgElement.style.filter = `blur(${blurNivel}px)`;

    // PISTAS (adaptadas a Disney)
    pistas = [
        "Película: " + (personaje.films[0] || "Desconocida"),
        "Serie: " + (personaje.tvShows[0] || "No tiene"),
        "Videojuego: " + (personaje.videoGames[0] || "No tiene"),
        "Primera letra: " + palabra.charAt(0).toUpperCase()
    ];

    indicePista = 0;
    document.getElementById("pistas-container").innerHTML = "";

    vidas = 6;
    errores = 0;

    reiniciarAhorcado();
    actualizarPantalla();
}

// ================= ACTUALIZAR PANTALLA =================
function actualizarPantalla() {
    document.getElementById("palabra").innerText = oculta.join(" ");
    document.getElementById("vidas").innerText = "Vidas: " + vidas;
}


// ================= INTENTAR LETRA =================
function intentar() {
    let input = document.getElementById("letra");
    let letra = input.value.toLowerCase();
    input.value = "";

    if (!letra) return;

    let acierto = false;

    for (let i = 0; i < palabra.length; i++) {
        if (palabra[i] === letra) {
            oculta[i] = letra;
            acierto = true;
        }
    }

    if (!acierto) {
        vidas--;
        dibujarAhorcado();
        mostrarPista();
        // ❌ ya NO revelamos imagen aquí
    }

    actualizarPantalla();
    verificarFin();
}


// ================= DIBUJAR AHORCADO =================
function dibujarAhorcado() {
    errores++;

    const partes = [
        "cabeza",
        "cuerpo",
        "brazo-izq",
        "brazo-der",
        "pierna-izq",
        "pierna-der"
    ];

    if (errores <= partes.length) {
        document.getElementById(partes[errores - 1]).style.display = "block";
    }
}


// ================= REINICIAR AHORCADO =================
function reiniciarAhorcado() {
    document.querySelectorAll(".parte").forEach(p => {
        p.style.display = "none";
    });
}


// ================= MOSTRAR PISTA =================
function mostrarPista() {
    if (indicePista >= pistas.length) return;

    let contenedor = document.getElementById("pistas-container");

    let tarjeta = document.createElement("div");
    tarjeta.classList.add("pista");
    tarjeta.innerText = pistas[indicePista];

    contenedor.appendChild(tarjeta);
    indicePista++;
}


// ================= MOSTRAR IMAGEN COMPLETA =================
function mostrarImagenCompleta() {
    blurNivel = 0;
    let imgElement = document.getElementById("disney-img");
    imgElement.style.filter = "blur(0px)";
}


// ================= VERIFICAR FIN =================
function verificarFin() {

    // GANAR
    if (!oculta.includes("_")) {
        mostrarImagenCompleta();
        setTimeout(() => {
            alert("🎉 Ganaste! Era: " + palabra);
            iniciarJuego();
        }, 500);
    }

    // PERDER
    if (vidas <= 0) {
        mostrarImagenCompleta();
        setTimeout(() => {
            alert("💀 Perdiste! Era: " + palabra);
            iniciarJuego();
        }, 500);
    }
}


// ================= INICIO AUTOMÁTICO =================
iniciarJuego();