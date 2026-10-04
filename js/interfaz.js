// Gestor principal de la interfaz de usuario
const GestorUI = {
    personajesGuardados: JSON.parse(localStorage.getItem('wow_personajes')) || [],
    personajeSeleccionado: null,

    misionActiva: null,
    progresoMision: 0,
    metaMision: 2,

    nivelMineria: 1,

    inicializar() {
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
        document.querySelectorAll('.pantalla').forEach(p => p.classList.add('oculta'));
        document.getElementById(idPantalla).classList.remove('oculta');
    },

    crearPersonaje() {
        const nombre = document.getElementById('nombre-personaje').value || 'Héroe';
        const clase = document.getElementById('clase-personaje').value;

        const nuevoPersonaje = { nombre, clase };
        this.personajesGuardados.push(nuevoPersonaje);
        localStorage.setItem('wow_personajes', JSON.stringify(this.personajesGuardados));

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
            div.style.cursor = 'pointer';
            div.innerText = `${p.nombre} - ${p.clase}`;
            div.onclick = () => {
                this.personajeSeleccionado = p;
                alert(`Personaje seleccionado: ${p.nombre}`);
            };
            contenedor.appendChild(div);
        });
    },

    // Transición segura al mundo 3D
    entrarAlMundo() {
        if (!this.personajeSeleccionado && this.personajesGuardados.length > 0) {
            this.personajeSeleccionado = this.personajesGuardados[0];
        }

        if (!this.personajeSeleccionado) {
            alert('Por favor crea un personaje primero.');
            return;
        }

        document.getElementById('hud-nombre').innerText = this.personajeSeleccionado.nombre;
        
        // 1. Mostrar la pantalla del juego
        this.irA('pantalla-juego');

        // 2. Dar tiempo al navegador para procesar el cambio visual de CSS antes de iniciar el lienzo 3D
        setTimeout(() => {
            if (window.MotorJuego) {
                window.MotorJuego.iniciarJuego();
            }
        }, 50);
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
                this.agregarAlInventario('⚔️');
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

window.onload = () => GestorUI.inicializar();