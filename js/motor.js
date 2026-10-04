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
        const contenedor = document.getElementById('contenedor-3d');
        contenedor.innerHTML = '';

        // 1. Escena
        this.escena = new THREE.Scene();
        this.escena.background = new THREE.Color(0x87ceeb); // Cielo azul

        // 2. Cámara
        const ancho = window.innerWidth;
        const alto = window.innerHeight;
        this.camara = new THREE.PerspectiveCamera(60, ancho / alto, 0.1, 1000);

        // 3. Renderizador
        this.renderizador = new THREE.WebGLRenderer({ antialias: true });
        this.renderizador.setSize(ancho, alto);
        this.renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        contenedor.appendChild(this.renderizador.domElement);

        // 4. Iluminación
        const luzSol = new THREE.DirectionalLight(0xffffff, 1.2);
        luzSol.position.set(50, 100, 50);
        this.escena.add(luzSol);

        const luzAmbiental = new THREE.AmbientLight(0xffffff, 0.8);
        this.escena.add(luzAmbiental);

        // 5. Crear el mundo
        this.generarTerrenoYMundo();

        // 6. Crear Jugador
        this.jugador = new Jugador(this.escena);

        // Posicionar cámara inicialmente
        this.jugador.actualizar(this.camara);

        // Eventos
        if (!this.eventosConfigurados) {
            window.addEventListener('keydown', (e) => {
                if (e.key === '1') this.atacar(20);
                if (e.key === '2') this.atacar(45);
                if (e.key.toLowerCase() === 'e') this.interactuar();
            });
            window.addEventListener('resize', () => this.redimensionar());
            this.eventosConfigurados = true;
        }

        this.activo = true;
        this.redimensionar();

        // Arrancar bucle
        this.bucle();
    },

    generarTerrenoYMundo() {
        // Suelo Verde
        const sueloGeo = new THREE.PlaneGeometry(200, 200);
        const sueloMat = new THREE.MeshStandardMaterial({ color: 0x3b7a57 });
        const suelo = new THREE.Mesh(sueloGeo, sueloMat);
        suelo.rotation.x = -Math.PI / 2;
        this.escena.add(suelo);

        // Camino de Tierra
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

        // Casas
        for (let i = -1; i <= 1; i += 2) {
            const casaGeo = new THREE.BoxGeometry(6, 6, 6);
            const casaMat = new THREE.MeshStandardMaterial({ color: 0x6e473b });
            const casa = new THREE.Mesh(casaGeo, casaMat);
            casa.position.set(i * 12, 3, 0);
            this.escena.add(casa);
        }

        // NPC Misiones
        const npcGeo = new THREE.CylinderGeometry(0.6, 0.6, 2.2, 8);
        const npcMat = new THREE.MeshStandardMaterial({ color: 0x00ccff });
        this.npcMisiones = new THREE.Mesh(npcGeo, npcMat);
        this.npcMisiones.position.set(0, 1.1, -12);
        this.escena.add(this.npcMisiones);

        // Signo Misión
        const signoGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        const signoMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const signo = new THREE.Mesh(signoGeo, signoMat);
        signo.position.set(0, 2.2, 0);
        this.npcMisiones.add(signo);

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
        this.enemigos.push(new Enemigo(this.escena, 6, -30));
        this.enemigos.push(new Enemigo(this.escena, -6, -35));
        this.enemigos.push(new Enemigo(this.escena, 0, -55, true));
    },

    interactuar() {
        if (!this.jugador) return;
        const posJ = this.jugador.malla.position;

        if (posJ.distanceTo(this.npcMisiones.position) < 4) {
            GestorUI.abrirVentanaNPC(
                "Capitán de la Guardia",
                "¡Saludos! Los orcos amenazan el poblado. Elimina a 2 de ellos para protegernos.",
                true
            );
            return;
        }

        this.vetasMineral.forEach((veta) => {
            if (veta.visible && posJ.distanceTo(veta.position) < 3.5) {
                veta.visible = false;
                GestorUI.agregarAlInventario('🪨');
                GestorUI.aumentarMineria();
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

        const posJ = this.jugador.malla.position;
        const marcador = document.getElementById('marcador-posicion');
        if (marcador) {
            marcador.style.transform = `translate(${posJ.x * 0.8}px, ${posJ.z * 0.8}px)`;
        }

        this.renderizador.render(this.escena, this.camara);
    }
};