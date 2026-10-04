class Jugador {
    constructor(escena) {
        this.escena = escena;
        this.vidaMax = 100;
        this.vida = 100;

        // Visual del jugador
        const geometria = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0x0066ff });
        this.malla = new THREE.Mesh(geometria, material);
        this.malla.position.set(0, 1, 0);
        this.escena.add(this.malla);

        this.velocidad = 0.2;
        this.rotacionVelocidad = 0.04;
        this.teclas = {};

        window.addEventListener('keydown', (e) => this.teclas[e.key.toLowerCase()] = true);
        window.addEventListener('keyup', (e) => this.teclas[e.key.toLowerCase()] = false);
    }

    actualizar(camara) {
        if (this.teclas['a']) this.malla.rotation.y += this.rotacionVelocidad;
        if (this.teclas['d']) this.malla.rotation.y -= this.rotacionVelocidad;

        if (this.teclas['w']) this.malla.translateZ(-this.velocidad);
        if (this.teclas['s']) this.malla.translateZ(this.velocidad);

        // Control de cámara en 3ª persona
        const offset = new THREE.Vector3(0, 4, 8);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.malla.rotation.y);
        camara.position.copy(this.malla.position).add(offset);
        camara.lookAt(this.malla.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
    }

    recibirDanio(cantidad) {
        this.vida = Math.max(0, this.vida - cantidad);
        const porcentaje = (this.vida / this.vidaMax) * 100;
        document.getElementById('barra-vida-jugador').style.width = `${porcentaje}%`;

        if (this.vida <= 0) {
            alert('Has sido derrotado. Reapareciendo en la ciudad...');
            this.malla.position.set(0, 1, 0);
            this.vida = this.vidaMax;
            document.getElementById('barra-vida-jugador').style.width = '100%';
        }
    }
}