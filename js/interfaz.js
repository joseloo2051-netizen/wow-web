// Bloqueo global de Clic Derecho
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
}, false);

window.registrarLog = function(mensaje, esError = false) {
    console.log(`[WoW-Log]: ${mensaje}`);
    const logDiv = document.getElementById('log-consola');
    if (logDiv) {
        const item = document.createElement('div');
        item.style.color = esError ? '#ff4444' : '#00ff00';
        item.innerText = `> ${mensaje}`;
        logDiv.appendChild(item);
        logDiv.scrollTop = logDiv.scrollHeight;
    }
};

const GestorUI = {
    personajesGuardados: JSON.parse(localStorage.getItem('wow_personajes')) || [],
    personajeSeleccionado: null,
    nivelMineria: 1,

    inicializar() {
        window.registrarLog("Inicializando sistema de interfaz...");
        
        document.getElementById('boton-ingresar').addEventListener('click', () => this.irA('pantalla-selector'));
        document.getElementById('boton-ir-crear').addEventListener('click', () => this.irA('pantalla-creador'));
        document.getElementById('boton-guardar-personaje').addEventListener('click', () => this.crearPersonaje());
        document.getElementById('boton-entrar-mundo').addEventListener('click', () => this.entrarAlMundo());
        document.getElementById('hab-i').addEventListener('click', () => this.alternarInventario());
        document.getElementById('boton-cerrar-npc').addEventListener('click', () => {
            document.getElementById('ventana-npc').classList.add('oculta');
        });
        document.getElementById('boton-aceptar-mision').addEventListener('click', () => {
            if (window.GestorMisiones) window.GestorMisiones.aceptarMisionActual();
            document.getElementById('ventana-npc').classList.add('oculta');
        });

        this.actualizarListaPersonajes();
    },

    irA(idPantalla) {
        window.registrarLog(`Cambiando a pantalla -> ${idPantalla}`);
        document.querySelectorAll('.pantalla').forEach(p => p.classList.add('oculta'));
        document.getElementById(idPantalla).classList.remove('oculta');
    },

    crearPersonaje() {
        const nombre = document.getElementById('nombre-personaje').value || 'Héroe';
        const clase = document.getElementById('clase-personaje').value;

        const nuevoPersonaje = { nombre, clase };
        this.personajesGuardados.push(nuevoPersonaje);
        localStorage.setItem('wow_personajes', JSON.stringify(this.personajesGuardados));

        window.registrarLog(`Personaje creado: ${nombre} (${clase})`);
        this.actualizarListaPersonajes();
        this.irA('pantalla-selector');
    },

    actualizarListaPersonajes() {
        const contenedor = document.getElementById('lista-personajes');
        contenedor.innerHTML = '';

        this.personajesGuardados.forEach((p) => {
            const div = document.createElement('div');
            div.className = 'marco-wow';
            div.style.margin = '5px 0';
            div.style.padding = '8px';
            div.style.cursor = 'pointer';
            div.innerText = `${p.nombre} - ${p.clase}`;
            div.onclick = () => {
                this.personajeSeleccionado = p;
                window.registrarLog(`Personaje seleccionado -> ${p.nombre}`);
            };
            contenedor.appendChild(div);
        });
    },

    entrarAlMundo() {
        if (!this.personajeSeleccionado && this.personajesGuardados.length > 0) {
            this.personajeSeleccionado = this.personajesGuardados[0];
        }

        if (!this.personajeSeleccionado) {
            alert('Por favor crea un personaje primero.');
            return;
        }

        document.getElementById('hud-nombre').innerText = this.personajeSeleccionado.nombre;
        window.registrarLog("Entrando al mundo...");

        this.irA('pantalla-juego');

        setTimeout(() => {
            if (window.MotorJuego) {
                window.MotorJuego.iniciarJuego();
            }
        }, 100);
    },

    alternarInventario() {
        document.getElementById('inventario').classList.toggle('oculta');
    },

    agregarAlInventario(icono) {
        const rejilla = document.getElementById('rejilla-inventario');
        const casilla = document.createElement('div');
        casilla.className = 'casilla-inventario';
        casilla.innerText = icono;
        rejilla.appendChild(casilla);
    },

    abrirVentanaNPC(nombreNPC, dialogo, tieneMision = false) {
        document.getElementById('npc-nombre').innerText = nombreNPC;
        document.getElementById('npc-texto').innerText = dialogo;
        const btnMision = document.getElementById('boton-aceptar-mision');

        if (tieneMision) {
            btnMision.classList.remove('oculta');
        } else {
            btnMision.classList.add('oculta');
        }

        document.getElementById('ventana-npc').classList.remove('oculta');
    },

    actualizarZona(nombreZona) {
        const elemento = document.getElementById('nombre-zona');
        if (elemento) elemento.innerText = nombreZona;
    },

    aumentarMineria() {
        this.nivelMineria++;
        document.getElementById('nivel-profesion').innerText = `Minería Nivel: ${this.nivelMineria}`;
    }
};

window.GestorUI = GestorUI;
window.onload = () => GestorUI.inicializar();