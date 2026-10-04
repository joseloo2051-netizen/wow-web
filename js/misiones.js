class GestorMisiones {
    constructor() {
        this.cadenaMisiones = [
            {
                id: 1,
                titulo: "1. Amenaza de los Orcos",
                descripcion: "Elimina a 3 Orcos en el Bosque de Elwynn.",
                tipo: "caza",
                objetivo: 3,
                progreso: 0,
                recompensa: "🗡️ Espada de Hierro",
                icono: "🗡️"
            },
            {
                id: 2,
                titulo: "2. Minerales de la Mina",
                descripcion: "Recolecta 3 Vetas de Oro en las afueras.",
                tipo: "recoleccion",
                objetivo: 3,
                progreso: 0,
                recompensa: "🛡️ Escudo de Bronce",
                icono: "🛡️"
            },
            {
                id: 3,
                titulo: "3. La Mazmorra Oscura",
                descripcion: "Entra a la Mazmorra y derrota al Rey Orco.",
                tipo: "jefe",
                objetivo: 1,
                progreso: 0,
                recompensa: "👑 Corona de Azeroth",
                icono: "👑"
            }
        ];

        this.indiceActual = 0;
        this.misionActiva = null;
    }

    obtenerMisionActual() {
        return this.cadenaMisiones[this.indiceActual];
    }

    aceptarMisionActual() {
        if (this.indiceActual < this.cadenaMisiones.length) {
            this.misionActiva = this.cadenaMisiones[this.indiceActual];
            this.actualizarUI();
            window.registrarLog(`Misión aceptada: ${this.misionActiva.titulo}`);
        }
    }

    notificarBaja(tipoEnemigo) {
        if (!this.misionActiva) return;

        if (this.misionActiva.tipo === "caza" && tipoEnemigo === "orco") {
            this.misionActiva.progreso++;
            this.verificarCompletado();
        } else if (this.misionActiva.tipo === "jefe" && tipoEnemigo === "jefe") {
            this.misionActiva.progreso++;
            this.verificarCompletado();
        }
    }

    notificarRecoleccion() {
        if (!this.misionActiva) return;

        if (this.misionActiva.tipo === "recoleccion") {
            this.misionActiva.progreso++;
            this.verificarCompletado();
        }
    }

    verificarCompletado() {
        this.actualizarUI();
        if (this.misionActiva.progreso >= this.misionActiva.objetivo) {
            alert(`¡Misión Completada!\nRecompensa: ${this.misionActiva.recompensa}`);
            window.GestorUI.agregarAlInventario(this.misionActiva.icono);
            this.indiceActual++;
            this.misionActiva = null;
            document.getElementById('mision-texto').innerText = "¡Misión completada! Habla con el NPC.";
        }
    }

    actualizarUI() {
        const tracker = document.getElementById('mision-texto');
        if (!tracker) return;

        if (this.misionActiva) {
            tracker.innerText = `${this.misionActiva.titulo}\nProgreso: ${this.misionActiva.progreso}/${this.misionActiva.objetivo}`;
        } else if (this.indiceActual >= this.cadenaMisiones.length) {
            tracker.innerText = "¡Has completado todas las misiones del juego!";
        } else {
            tracker.innerText = "Misión disponible en el Capitan.";
        }
    }
}

window.GestorMisiones = new GestorMisiones();