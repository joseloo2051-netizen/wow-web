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
        if (this.activo) {
            this.redimensionar();
            return;
        }
        this.activo = true;

        // 1. Escena
        this.escena = new THREE.Scene();
        this.escena.background = new THREE.Color(0x87ceeb); // Cielo claro

        // 2. Cámara
        this.camara = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

        // 3. Renderizador (Solución a Pantalla Negra)
        this.renderizador = new THREE.WebGLRenderer({ antialias: true });
        this.renderizador.setSize(window.innerWidth, window.innerHeight);
        this.renderizador.setPixelRatio(window.devicePixelRatio);
        
        const contenedor = document.getElementById('contenedor-3d');
        contenedor.innerHTML = '';
        contenedor.appendChild(this.renderizador.domElement);

        // 4. Luces Potentes
        const luzSol = new THREE.DirectionalLight(0xffffff, 1.2);
        luzSol.position.set(50, 100, 50);
        this.escena.add(luzSol);

        const luzAmbiental = new THREE.AmbientLight(0xffffff, 0.6);
        this.escena.add(luzAmbiental);

        // 5. Generación del Mundo
        this.generarTerrenoYMundo();

        // 6. Instanciar Jugador
        this.jugador = new Jugador(this.escena);

        // 7. Eventos de interacción y habilidades
        window.addEventListener('keydown', (e) => {
            if (e.key === '1') this.atacar(20);
            if (e.key === '2') this.atacar(45);
            if (e.key.toLowerCase() === 'e') this.interactuar();
        });

        this.redimensionar();
        this.bucle();
    },

    generarTerrenoYMundo() {
        // Suelo principal (Hierba)
        const sueloGeo = new THREE.PlaneGeometry(200, 200, 32, 32);
        const sueloMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57 });
        const suelo = new THREE.Mesh(sueloGeo, sueloMat);
        suelo.rotation.x = -Math.PI / 2;
        this.escena.add(suelo);

        // Caminos de Tierra
        const caminoGeo = new THREE.PlaneGeometry(8, 120);
        const caminoMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
        const camino = new THREE.Mesh(caminoGeo, caminoMat);
        camino.rotation.x = -Math.PI / 2;
        camino.position.set(0, 0.01, -30);
        this.escena.add(camino);

        // Montañas alrededor del mapa
        for (let i = 0; i < 12; i++) {
            const alt = 10 + Math.random() * 15;
            const mtnGeo = new THREE.ConeGeometry(8 + Math.random() * 6, alt, 5);
            const mtnMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
            const montaña = new THREE.Mesh(mtnGeo, mtnMat);
            
            const angulo = (i / 12) * Math.PI * 2;
            montaña.position.set(Math.cos(angulo) * 80, alt / 2, Math.sin(angulo) * 80);
            this.escena.add(montaña);
        }

        // Ciudad / Casas en el centro
        for (let i = -1; i <= 1; i += 2) {
            const casaGeo = new THREE.BoxGeometry(6, 5, 6);
            const casaMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
            const casa = new THREE.Mesh(casaGeo, casaMat);
            casa.position.set(i * 12, 2.5, 0);
            this.escena.add(casa);
        }

        // NPC Misiones (Guardia con signo !)
        const npcGeo = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
        const npcMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
        this.npcMisiones = new THREE.Mesh(npcGeo, npcMat);
        this.npcMisiones.position.set(0, 1, -10);
        this.escena.add(this.npcMisiones);

        // Signo de exclamación encima del NPC
        const signoGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        const signoMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const signo = new THREE.Mesh(signoGeo, signoMat);
        signo.position.set(0, 2, 0);
        this.npcMisiones.add(signo);

        // Vetas de Minerales (Profesión de Minería)
        for (let i = 0; i < 5; i++) {
            const vetaGeo = new THREE.DodecahedronGeometry(0.8);
            const vetaMat = new THREE.MeshStandardMaterial({ color: 0xdaa520, metalness: 0.8 });
            const veta = new THREE.Mesh(vetaGeo, vetaMat);
            veta.position.set(15 + Math.random() * 20, 0.5, -10 - Math.random() * 20);
            this.escena.add(veta);
            this.vetasMineral.push(veta);
        }

        // Enemigos y Jefe de Mazmorra
        this.enemigos.push(new Enemigo(this.escena, 5, -35));
        this.enemigos.push(new Enemigo(this.escena, -5, -40));
        this.enemigos.push(new Enemigo(this.escena, 0, -60, true)); // Jefe
    },

    interactuar() {
        const posJ = this.jugador.malla.position;

        // Hablar con NPC
        if (posJ.distanceTo(this.npcMisiones.position) < 4) {
            GestorUI.abrirVentanaNPC(
                "Capitán de la Guardia",
                "¡Saludos aventurero! Los orcos están amenazando nuestra ciudad. Derrota a 2 de ellos para ayudarnos.",
                true
            );
            return;
        }

        // Picar Vetas de Mineral
        this.vetasMineral.forEach((veta, indice) => {
            if (veta.visible && posJ.distanceTo(veta.position) < 3) {
                veta.visible = false;
                GestorUI.agregarAlInventario('🪨');
                GestorUI.aumentarMineria();
                alert('Has picado un yacimiento de mineral (+1 Piedra).');
            }
        });
    },

    atacar(danio) {
        this.enemigos.forEach(e => {
            if (e.vida > 0 && this.jugador.malla.position.distanceTo(e.malla.position) < 4) {
                e.recibirDanio(danio);
            }
        });
    },

    redimensionar() {
        if (this.camara && this.renderizador) {
            this.camara.aspect = window.innerWidth / window.innerHeight;
            this.camara.updateProjectionMatrix();
            this.renderizador.setSize(window.innerWidth, window.innerHeight);
        }
    },

    bucle() {
        if (!MotorJuego.activo) return;

        requestAnimationFrame(MotorJuego.bucle);

        MotorJuego.jugador.actualizar(MotorJuego.camara);

        MotorJuego.enemigos.forEach(e => {
            e.actualizar(MotorJuego.jugador.malla.position, (danio) => {
                MotorJuego.jugador.recibirDanio(danio);
            });
        });

        // Actualizar Minimapa
        const posJ = MotorJuego.jugador.malla.position;
        const marcador = document.getElementById('marcador-posicion');
        marcador.style.transform = `translate(${posJ.x}px, ${posJ.z}px)`;

        MotorJuego.renderizador.render(MotorJuego.escena, MotorJuego.camara);
    }
};

window.addEventListener('resize', () => MotorJuego.redimensionar());