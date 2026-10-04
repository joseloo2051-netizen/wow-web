const MotorJuego = {
    escena: null,
    camara: null,
    renderizador: null,
    jugador: null,
    enemigos: [],
    vetasMineral: [],
    npcMisiones: null,
    activo: false,

    iniciarJuego() {
        if (typeof window.registrarLog === 'function') {
            window.registrarLog("Iniciando motor 3D...");
        }

        if (typeof THREE === 'undefined') {
            if (typeof window.registrarLog === 'function') {
                window.registrarLog("ERROR CRÍTICO: THREE no está definido.", true);
            }
            return;
        }

        const contenedor = document.getElementById('contenedor-3d');
        contenedor.innerHTML = '';

        // Escena y Cielo
        this.escena = new THREE.Scene();
        this.escena.background = new THREE.Color(0x87ceeb);

        // Dimensiones
        const ancho = window.innerWidth || 800;
        const alto = window.innerHeight || 600;

        // Cámara
        this.camara = new THREE.PerspectiveCamera(60, ancho / alto, 0.1, 1000);

        // Renderizador WebGL
        this.renderizador = new THREE.WebGLRenderer({ antialias: true });
        this.renderizador.setSize(ancho, alto);
        this.renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        contenedor.appendChild(this.renderizador.domElement);

        // Iluminación
        const luzSol = new THREE.DirectionalLight(0xffffff, 1.2);
        luzSol.position.set(50, 100, 50);
        this.escena.add(luzSol);
        this.escena.add(new THREE.AmbientLight(0xffffff, 0.8));

        // Entidades
        this.generarTerrenoYMundo();

        if (window.Jugador) {
            this.jugador = new window.Jugador(this.escena);
        }

        // Eventos de control
        if (!this.eventosConfigurados) {
            window.addEventListener('keydown', (e) => {
                if (e.key === '1') this.atacar(20);
                if (e.key === '2') this.atacar(45);
                if (e.key.toLowerCase() === 'e') this.interactuar();
            });
            window.addEventListener('resize', () => this.redimensionar());
            this.eventosConfigurados = true;
        }

        this.redimensionar();
        this.activo = true;
        this.bucle();
    },

    generarTerrenoYMundo() {
        // Suelo Verde
        const sueloGeo = new THREE.PlaneGeometry(200, 200);
        const sueloMat = new THREE.MeshStandardMaterial({ color: 0x3b7a57 });
        const suelo = new THREE.Mesh(sueloGeo, sueloMat);
        suelo.rotation.x = -Math.PI / 2;
        this.escena.add(suelo);

        // Camino
        const caminoGeo = new THREE.PlaneGeometry(10, 150);
        const caminoMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
        const camino = new THREE.Mesh(caminoGeo, caminoMat);
        camino.rotation.x = -Math.PI / 2;
        camino.position.set(0, 0.02, -30);
        this.escena.add(camino);

        // Montañas
        for (let i = 0; i < 12; i++) {
            const alt = 15 + Math.random() * 15;
            const mtnGeo = new THREE.ConeGeometry(10, alt, 6);
            const mtnMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
            const montaña = new THREE.Mesh(mtnGeo, mtnMat);
            const angulo = (i / 12) * Math.PI * 2;
            montaña.position.set(Math.cos(angulo) * 85, alt / 2, Math.sin(angulo) * 85);
            this.escena.add(montaña);
        }

        // NPC Misiones
        const npcGeo = new THREE.CylinderGeometry(0.6, 0.6, 2.2, 8);
        const npcMat = new THREE.MeshStandardMaterial({ color: 0x00ccff });
        this.npcMisiones = new THREE.Mesh(npcGeo, npcMat);
        this.npcMisiones.position.set(0, 1.1, -12);
        this.escena.add(this.npcMisiones);

        // Vetas
        this.vetasMineral = [];
        for (let i = 0; i < 5; i++) {
            const vetaGeo = new THREE.DodecahedronGeometry(0.9);
            const vetaMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
            const veta = new THREE.Mesh(vetaGeo, vetaMat);
            veta.position.set(15 + (i * 4), 0.6, -10 - (i * 5));
            this.escena.add(veta);
            this.vetasMineral.push(veta);
        }

        // Enemigos
        this.enemigos = [];
        if (window.Enemigo) {
            this.enemigos.push(new window.Enemigo(this.escena, 6, -30));
            this.enemigos.push(new window.Enemigo(this.escena, -6, -35));
            this.enemigos.push(new window.Enemigo(this.escena, 0, -55, true));
        }
    },

    interactuar() {
        if (!this.jugador) return;
        const posJ = this.jugador.malla.position;

        if (this.npcMisiones && posJ.distanceTo(this.npcMisiones.position) < 4) {
            window.GestorUI.abrirVentanaNPC(
                "Capitán de la Guardia",
                "¡Saludos! Los orcos amenazan el poblado. Elimina a 2 de ellos para protegernos.",
                true
            );
            return;
        }

        this.vetasMineral.forEach((veta) => {
            if (veta.visible && posJ.distanceTo(veta.position) < 3.5) {
                veta.visible = false;
                window.GestorUI.agregarAlInventario('🪨');
                window.GestorUI.aumentarMineria();
                alert('¡Mineral recolectado! (+1 Mena de Oro)');
            }
        });
    },

    atacar(danio) {
        if (!this.jugador) return;
        this.enemigos.forEach(e => {
            if (e.vida > 0 && this.jugador.malla.position.distanceTo(e.malla.position) < 4) {
                e.recibirDanio(danio);
            }
        });
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

        if (this.jugador) this.jugador.actualizar(this.camara);

        this.enemigos.forEach(e => {
            e.actualizar(this.jugador.malla.position, (danio) => {
                this.jugador.recibirDanio(danio);
            });
        });

        this.renderizador.render(this.escena, this.camara);
    }
};

window.MotorJuego = MotorJuego;