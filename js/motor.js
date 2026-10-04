// Contenido principal de js/motor.js
const MotorJuego = {
    escena: null,
    camara: null,
    renderizador: null,
    jugador: null,
    enemigos: [],
    activo: false,

    iniciarJuego() {
        registrarLog("Iniciando motor 3D...");
        
        if (typeof THREE === 'undefined') {
            registrarLog("ERROR: Three.js no cargó.", true);
            return;
        }

        const contenedor = document.getElementById('contenedor-3d');
        contenedor.innerHTML = '';

        this.escena = new THREE.Scene();
        this.escena.background = new THREE.Color(0x87ceeb);

        const ancho = window.innerWidth;
        const alto = window.innerHeight;
        this.camara = new THREE.PerspectiveCamera(60, ancho / alto, 0.1, 1000);

        this.renderizador = new THREE.WebGLRenderer({ antialias: true });
        this.renderizador.setSize(ancho, alto);
        contenedor.appendChild(this.renderizador.domElement);

        // Luz basica
        const luz = new THREE.DirectionalLight(0xffffff, 1);
        luz.position.set(10, 20, 10);
        this.escena.add(luz);
        this.escena.add(new THREE.AmbientLight(0x404040));

        // Suelo de prueba
        const sueloGeo = new THREE.PlaneGeometry(100, 100);
        const sueloMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57 });
        const suelo = new THREE.Mesh(sueloGeo, sueloMat);
        suelo.rotation.x = -Math.PI / 2;
        this.escena.add(suelo);

        if (window.Jugador) {
            this.jugador = new Jugador(this.escena);
        }

        this.activo = true;
        this.bucle();
    },

    bucle() {
        if (!this.activo) return;
        requestAnimationFrame(() => this.bucle());
        if (this.jugador) this.jugador.actualizar(this.camara);
        this.renderizador.render(this.escena, this.camara);
    }
};

// Exportar explícitamente a la ventana global
window.MotorJuego = MotorJuego;