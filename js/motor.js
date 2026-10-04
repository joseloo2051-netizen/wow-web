const MotorJuego = {
    escena: null,
    camara: null,
    renderizador: null,
    jugador: null,
    enemigos: [],
    vetasMineral: [],
    npcMisiones: null,
    portalMazmorra: null,
    activo: false,

    iniciarJuego() {
        window.registrarLog("Iniciando motor 3D...");

        const contenedor = document.getElementById('contenedor-3d');
        contenedor.innerHTML = '';

        this.escena = new THREE.Scene();
        this.escena.background = new THREE.Color(0x87ceeb);

        const ancho = window.innerWidth;
        const alto = window.innerHeight;

        this.camara = new THREE.PerspectiveCamera(60, ancho / alto, 0.1, 1000);

        this.renderizador = new THREE.WebGLRenderer({ antialias: true });
        this.renderizador.setSize(ancho, alto);
        this.renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        contenedor.appendChild(this.renderizador.domElement);

        // Luces
        const luzSol = new THREE.DirectionalLight(0xffffff, 1.2);
        luzSol.position.set(50, 100, 50);
        this.escena.add(luzSol);
        this.escena.add(new THREE.AmbientLight(0xffffff, 0.8));

        // Construir Mundo Ampliado
        this.generarMundoAmpliado();

        // Mazmorra
        if (window.GestorMazmorra) {
            window.GestorMazmorra.generarMazmorra(this.escena);
        }

        // Jugador
        if (window.Jugador) {
            this.jugador = new window.Jugador(this.escena);
        }

        // Teclas
        if (!this.eventosConfigurados) {
            window.addEventListener('keydown', (e) => {
                if (e.key === '1') this.atacar(25);
                if (e.key === '2') this.atacar(50);
                if (e.key.toLowerCase() === 'e') this.interactuar();
            });
            window.addEventListener('resize', () => this.redimensionar());
            this.eventosConfigurados = true;
        }

        this.redimensionar();
        this.activo = true;
        this.bucle();
    },

    generarMundoAmpliado() {
        // Terreno Exterior Grande
        const sueloGeo = new THREE.PlaneGeometry(300, 300);
        const sueloMat = new THREE.MeshStandardMaterial({ color: 0x2e6f40 });
        const suelo = new THREE.Mesh(sueloGeo, sueloMat);
        suelo.rotation.x = -Math.PI / 2;
        this.escena.add(suelo);

        // Camino Principal
        const caminoGeo = new THREE.PlaneGeometry(12, 180);
        const caminoMat = new THREE.MeshStandardMaterial({ color: 0x7c5227 });
        const camino = new THREE.Mesh(caminoGeo, caminoMat);
        camino.rotation.x = -Math.PI / 2;
        camino.position.set(0, 0.02, -40);
        this.escena.add(camino);

        // NPC Misiones
        const npcGeo = new THREE.CylinderGeometry(0.6, 0.6, 2.2, 8);
        const npcMat = new THREE.MeshStandardMaterial({ color: 0x00ccff });
        this.npcMisiones = new THREE.Mesh(npcGeo, npcMat);
        this.npcMisiones.position.set(0, 1.1, -10);
        this.escena.add(this.npcMisiones);

        // Signo Misión
        const signoGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        const signoMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const signo = new THREE.Mesh(signoGeo, signoMat);
        signo.position.set(0, 2.2, 0);
        this.npcMisiones.add(signo);

        // Portal Entrada Mazmorra
        const portalGeo = new THREE.TorusGeometry(3, 0.5, 8, 20);
        const portalMat = new THREE.MeshBasicMaterial({ color: 0x8800ff });
        this.portalMazmorra = new THREE.Mesh(portalGeo, portalMat);
        this.portalMazmorra.position.set(0, 3, -90);
        this.escena.add(this.portalMazmorra);

        // Vetas de Oro
        this.vetasMineral = [];
        for (let i = 0; i < 6; i++) {
            const vetaGeo = new THREE.DodecahedronGeometry(0.9);
            const vetaMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
            const veta = new THREE.Mesh(vetaGeo, vetaMat);
            veta.position.set(20 + (i * 3), 0.6, -20 - (i * 6));
            this.escena.add(veta);
            this.vetasMineral.push(veta);
        }

        // Lista de Enemigos en el Mundo Exterior
        this.enemigos = [];
        if (window.Enemigo) {
            this.enemigos.push(new window.Enemigo(this.escena, 10, -30, false, "orco"));
            this.enemigos.push(new window.Enemigo(this.escena, -12, -40, false, "orco"));
            this.enemigos.push(new window.Enemigo(this.escena, 15, -55, false, "orco"));
            this.enemigos.push(new window.Enemigo(this.escena, -15, -70, false, "esqueleto"));
        }
    },

    interactuar() {
        if (!this.jugador) return;
        const posJ = this.jugador.malla.position;

        // Hablar con NPC
        if (this.npcMisiones && posJ.distanceTo(this.npcMisiones.position) < 4) {
            const mision = window.GestorMisiones.obtenerMisionActual();
            if (mision) {
                window.GestorUI.abrirVentanaNPC(
                    "Comandante de Azeroth",
                    `${mision.descripcion}\nRecompensa: ${mision.recompensa}`,
                    true
                );
            } else {
                window.GestorUI.abrirVentanaNPC(
                    "Comandante de Azeroth",
                    "¡Gracias por salvar nuestro reino aventurero!"
                );
            }
            return;
        }

        // Entrar a la Mazmorra vía Portal
        if (this.portalMazmorra && posJ.distanceTo(this.portalMazmorra.position) < 4) {
            alert("¡Teletransportándote a la Mazmorra Subterránea!");
            this.jugador.malla.position.set(0, 0.9, -120);
            return;
        }

        // Recolección de Minerales
        this.vetasMineral.forEach((veta) => {
            if (veta.visible && posJ.distanceTo(veta.position) < 3.5) {
                veta.visible = false;
                window.GestorUI.agregarAlInventario('🪨');
                window.GestorUI.aumentarMineria();
                if (window.GestorMisiones) window.GestorMisiones.notificarRecoleccion();
                alert('¡Has picado 1 Veta de Oro!');
            }
        });
    },

    atacar(danio) {
        if (!this.jugador) return;

        // Atacar Enemigos Generales
        this.enemigos.forEach(e => {
            if (e.vida > 0 && this.jugador.malla.position.distanceTo(e.malla.position) < 4.5) {
                e.recibirDanio(danio);
            }
        });

        // Atacar al Jefe de la Mazmorra
        if (window.GestorMazmorra && window.GestorMazmorra.jefe) {
            const jefe = window.GestorMazmorra.jefe;
            if (jefe.vida > 0 && this.jugador.malla.position.distanceTo(jefe.malla.position) < 5.0) {
                jefe.recibirDanio(danio);
            }
        }
    },

    redimensionar() {
        if (this.camara && this.renderizador) {
            const ancho = window.innerWidth;
            const alto = window.innerHeight;
            this.camara.aspect = ancho / alto;
            this.camara.updateProjectionMatrix();
            this.renderizador.setSize(ancho, alto);
        }
    },

    bucle() {
        if (!this.activo) return;

        requestAnimationFrame(() => this.bucle());

        if (this.jugador) {
            this.jugador.actualizar(this.camara);

            // Actualizar nombre de zona según coordenadas
            const z = this.jugador.malla.position.z;
            if (z < -100) {
                window.GestorUI.actualizarZona("Mazmorra Subterránea");
            } else {
                window.GestorUI.actualizarZona("Bosque de Elwynn");
            }
        }

        // Actualizar Enemigos
        this.enemigos.forEach(e => {
            e.actualizar(this.jugador.malla.position, (danio) => {
                this.jugador.recibirDanio(danio);
            });
        });

        // Actualizar Jefe
        if (window.GestorMazmorra && window.GestorMazmorra.jefe) {
            window.GestorMazmorra.jefe.actualizar(this.jugador.malla.position, (danio) => {
                this.jugador.recibirDanio(danio);
            });
        }

        this.renderizador.render(this.escena, this.camara);
    }
};

window.MotorJuego = MotorJuego;