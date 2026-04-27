// ================= VARIABLES GLOBALES =================
let palabra = "";
let oculta = [];
let vidas = 6;
let errores = 0;
let pistas = [];
let indicePista = 0;
let blurNivel = 20;
let juegoTerminado = false;
let letrasUsadas = new Set();

// ================= CATEGORÍAS (con nombres exactos de la API) =================
const categorias = {
    princesas: ["Cinderella", "Belle", "Ariel", "Elsa", "Anna", "Rapunzel", "Snow White", "Moana", "Tiana", "Jasmine", "Aurora", "Merida"],
    villanos:  ["Maleficent", "Ursula", "Jafar", "Scar", "Hades", "Gaston", "Cruella De Vil", "The Evil Queen"],
    animales:  ["Simba", "Baloo", "Dumbo", "Bambi", "Nemo", "Dory", "Flounder", "Sebastian"],
    clasicos:  ["Mickey Mouse", "Donald Duck", "Goofy", "Pluto", "Daisy Duck", "Minnie Mouse"]
};

// ================= INICIAR JUEGO =================
async function iniciarJuego() {
    juegoTerminado = false;

    let categoriaSeleccionada = document.getElementById("categoria").value;
    let personaje = null;

    if (categoriaSeleccionada !== "todas") {
        let lista = categorias[categoriaSeleccionada];
        let nombreBuscado = lista[Math.floor(Math.random() * lista.length)];

        try {
            let res = await fetch(`https://api.disneyapi.dev/character?name=${encodeURIComponent(nombreBuscado)}`);
            let data = await res.json();
            if (data.data && data.data.length > 0 && data.data[0].imageUrl) {
                personaje = data.data[0];
            }
        } catch(e) {}
    }

    // Si no encontró por categoría o es "todas", busca una página random
    if (!personaje) {
        let paginaRandom = Math.floor(Math.random() * 149) + 1;
        let res = await fetch(`https://api.disneyapi.dev/character?page=${paginaRandom}&pageSize=10`);
        let data = await res.json();
        let candidatos = (data.data || []).filter(p => p.name && p.imageUrl);
        if (candidatos.length > 0) {
            personaje = candidatos[Math.floor(Math.random() * candidatos.length)];
        }
    }

    if (!personaje) return; // safety

    palabra = personaje.name.toLowerCase();
    oculta = palabra.split("").map(l => l === " " ? " " : "_");

    let imgElement = document.getElementById("disney-img");
    imgElement.src = personaje.imageUrl;
    blurNivel = 20;
    imgElement.style.filter = `blur(${blurNivel}px)`;

    pistas = [
        "Película: " + (personaje.films?.[0] || "Desconocida"),
        "Serie: " + (personaje.tvShows?.[0] || "No tiene"),
        "Categoría: " + categoriaSeleccionada,
        "Primera letra: " + palabra.charAt(0).toUpperCase()
    ];

    indicePista = 0;
    letrasUsadas = new Set();
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
    const partes = ["cabeza","cuerpo","brazo-izq","brazo-der","pierna-izq","pierna-der"];
    if (errores <= partes.length) {
        document.getElementById(partes[errores - 1]).style.display = "block";
    }
}

// ================= REINICIAR AHORCADO =================
function reiniciarAhorcado() {
    document.querySelectorAll(".parte").forEach(p => p.style.display = "none");
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

// ================= VERIFICAR FIN =================
function verificarFin() {
    if (!oculta.includes("_") && palabra.length > 0) {
        juegoTerminado = true;
        document.getElementById("disney-img").style.filter = "blur(0px)";
        setTimeout(() => {
            alert("🎉 ¡Ganaste! Era: " + palabra);
            iniciarJuego();
        }, 100);
    }
    if (vidas <= 0) {
        juegoTerminado = true;
        document.getElementById("disney-img").style.filter = "blur(0px)";
        setTimeout(() => {
            alert("💀 ¡Perdiste! Era: " + palabra);
            iniciarJuego();
        }, 100);
    }
}

// ================= TECLA ENTER =================
document.addEventListener("keydown", function(e) {
    if (e.key === "Enter") intentar();
});

// ================= INICIO AUTOMÁTICO =================
iniciarJuego();
