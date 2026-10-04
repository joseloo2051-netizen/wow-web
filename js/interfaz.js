// Declaración global explícita para que motor.js y el resto de scripts la puedan usar
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
    misionActiva: null,
    progresoMision: 0,
    metaMision: 2,
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
        document.getElementById('boton-aceptar-mision').addEventListener('click', () => this.aceptarMision());

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
        window.registrarLog("Intentando entrar al mundo...");

        this.irA('pantalla-juego');

        setTimeout(() => {
            if (window.MotorJuego) {
                window.registrarLog("Invocando MotorJuego.iniciarJuego()...");
                window.MotorJuego.iniciarJuego();
            } else {
                window.registrarLog("ERROR CRÍTICO: No se encontró la variable global MotorJuego.", true);
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

        if (tieneMision && !this.misionActiva) {
            btnMision.classList.remove('oculta');
        } else {
            btnMision.classList.add('oculta');
        }

        document.getElementById('ventana-npc').classList.remove('oculta');
    },

    aceptarMision() {
        this.misionActiva = "Limpieza de Orcos";
        this.progresoMision = 0;
        this.actualizarTrackerMisiones();
        document.getElementById('ventana-npc').classList.add('oculta');
    },

    notificarBajaEnemigo() {
        if (this.misionActiva) {
            this.progresoMision++;
            if (this.progresoMision >= this.metaMision) {
                alert('¡Misión Completada! Has recibido una Espada Legendaria.');
                this.agregarAlInventario('⚔');
                this.misionActiva = null;
                document.getElementById('mision-texto').innerText = "Sin misiones activas";
            } else {
                this.actualizarTrackerMisiones();
            }
        }
    },

    actualizarTrackerMisiones() {
        document.getElementById('mision-texto').innerText = `${this.misionActiva}: ${this.progresoMision}/${this.metaMision} derrotados`;
    },

    aumentarMineria() {
        this.nivelMineria++;
        document.getElementById('nivel-profesion').innerText = `Minería Nivel: ${this.nivelMineria}`;
    }
};

window.GestorUI = GestorUI;
window.onload = () => GestorUI.inicializar();