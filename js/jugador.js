class Jugador {
    constructor(escena) {
        this.vidaMax = 100;
        this.vida = 100;
        this.velocidad = 0.3;

        const geo = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 8);
        const mat = new THREE.MeshStandardMaterial({ color: 0x0055ff });
        this.malla = new THREE.Mesh(geo, mat);
        this.malla.position.set(0, 0.9, 0);
        escena.add(this.malla);

        this.teclas = {};
        window.addEventListener('keydown', (e) => this.teclas[e.key.toLowerCase()] = true);
        window.addEventListener('keyup', (e) => this.teclas[e.key.toLowerCase()] = false);
    }

    actualizar(camara) {
        if (this.teclas['w'] || this.teclas['arrowup']) this.malla.position.z -= this.velocidad;
        if (this.teclas['s'] || this.teclas['arrowdown']) this.malla.position.z += this.velocidad;
        if (this.teclas['a'] || this.teclas['arrowleft']) this.malla.position.x -= this.velocidad;
        if (this.teclas['d'] || this.teclas['arrowright']) this.malla.position.x += this.velocidad;

        if (camara) {
            camara.position.set(
                this.malla.position.x,
                this.malla.position.y + 7,
                this.malla.position.z + 13
            );
            camara.lookAt(this.malla.position);
        }
    }

    recibirDanio(cantidad) {
        this.vida = Math.max(0, this.vida - cantidad);
        const pct = (this.vida / this.vidaMax) * 100;
        const barra = document.getElementById('barra-vida-jugador');
        if (barra) barra.style.width = `${pct}%`;

        if (this.vida <= 0) {
            alert('¡Has caido en combate! Respawn en el poblado.');
            this.vida = this.vidaMax;
            this.malla.position.set(0, 0.9, 0);
            if (barra) barra.style.width = '100%';
        }
    }
}

window.Jugador = Jugador;