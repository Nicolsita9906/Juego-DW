// ================= VARIABLES GLOBALES =================
let palabra = "";
let oculta = [];
let vidas = 6;
let errores = 0;
let pistas = [];
let indicePista = 0;
let blurNivel = 20;
let intento = "";
let letrasUsadas = new Set();
let cryUrl = "";
let pokemonData = null;


// ================= INICIAR JUEGO =================
async function iniciarJuego() {
    let id = Math.floor(Math.random() * 151) + 1;
    let res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    let data = await res.json();
    pokemonData = data;

    palabra = data.name;
    oculta = palabra.split("").map(() => "_");

    // IMAGEN
    let img = data.sprites.front_default;
    let imgElement = document.getElementById("pokemon-img");
    imgElement.src = img;

    // Siempre inicia borrosa
    blurNivel = 20;
    imgElement.style.filter = `blur(${blurNivel}px)`;

    // SONIDO
    cryUrl = data.cries?.latest || data.cries?.legacy || "";

    // PISTAS
    pistas = [
        { texto: "Tipo: " + data.types.map(t => t.type.name).join(", "), esSonido: false },
        { texto: "Habilidad: " + data.abilities[0].ability.name, esSonido: false },
        { texto: "Número en Pokédex: " + data.id, esSonido: false },
        { texto: "🔊 Escucha su sonido", esSonido: true },
        { texto: "Defensa: " + data.stats.find(s => s.stat.name === "defense").base_stat, esSonido: false },
        { texto: "Termina en: " + palabra[palabra.length - 1], esSonido: false }
    ];

    indicePista = 0;
    letrasUsadas = new Set();
    document.getElementById("pistas-container").innerHTML = "";

    // REINICIO
    vidas = 6;
    errores = 0;

    reiniciarAhorcado();
    actualizarPantalla();
}


// ================= ACTUALIZAR PANTALLA =================
function actualizarPantalla() {
    document.getElementById("palabra").innerText = oculta.join(" ");
    document.getElementById("vidas").innerText = "Vidas: " + vidas;
    actualizarLetrasUsadas();
}


// ================= LETRAS USADAS =================
function actualizarLetrasUsadas() {
    let contenedor = document.getElementById("letras-usadas");
    if (!contenedor) return;

    if (letrasUsadas.size === 0) {
        contenedor.innerHTML = "<span class='letras-titulo'>Letras usadas:</span> <span class='ninguna'>ninguna</span>";
        return;
    }

    let letrasOrdenadas = [...letrasUsadas].sort();
    contenedor.innerHTML = "<span class='letras-titulo'>Letras usadas:</span> " +
        letrasOrdenadas.map(l =>
            `<span class="letra-badge ${oculta.includes(l) ? 'correcta' : 'incorrecta'}">${l.toUpperCase()}</span>`
        ).join("");
}


// ================= INTENTAR LETRA =================
function intentar() {
    let input = document.getElementById("letra");
    let letra = input.value.toLowerCase();
    input.value = "";
    input.focus();

    if (!letra || letrasUsadas.has(letra)) return;

    letrasUsadas.add(letra);

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

    let pista = pistas[indicePista];

    // Si es la pista de sonido
    if (pista.esSonido) {
        let texto = document.createElement("p");
        texto.innerText = "🔊 Sonido del Pokémon";

        let boton = document.createElement("button");
        boton.innerText = "▶ Reproducir";
        boton.style.marginTop = "6px";
        boton.style.fontSize = "0.9rem";
        boton.style.padding = "5px 14px";

        boton.onclick = () => {
            if (cryUrl) {
                let audio = new Audio(cryUrl);
                audio.play();
            } else {
                alert("No hay sonido disponible para este Pokémon.");
            }
        };

        tarjeta.appendChild(texto);
        tarjeta.appendChild(boton);
    } else {
        tarjeta.innerText = pista.texto;
    }

    contenedor.appendChild(tarjeta);
    indicePista++;
}


// ================= MOSTRAR IMAGEN COMPLETA =================
function mostrarImagenCompleta() {
    blurNivel = 0;
    let imgElement = document.getElementById("pokemon-img");
    imgElement.style.filter = "blur(0px)";
}


// ================= VERIFICAR FIN =================
function verificarFin() {

    // GANAR
    if (!oculta.includes("_") && palabra.length > 0) {
        mostrarImagenCompleta();
        setTimeout(() => {
            alert("🎉 ¡Ganaste! Era: " + palabra);
            iniciarJuego();
        }, 500);
    }

    // PERDER
    if (vidas <= 0) {
        mostrarImagenCompleta();
        setTimeout(() => {
            alert("💀 ¡Perdiste! Era: " + palabra);
            iniciarJuego();
        }, 500);
    }
}

// ================= TECLA ENTER =================
document.addEventListener("keydown", function(e) {
    if (e.key === "Enter") intentar();
});

// ================= INICIO AUTOMÁTICO =================
iniciarJuego();
