class Enemigo {
    constructor(escena, x, z, esJefe = false) {
        this.esJefe = esJefe;
        this.vidaMax = esJefe ? 150 : 50;
        this.vida = this.vidaMax;
        this.escena = escena;

        const radio = esJefe ? 1.0 : 0.6;
        const alto = esJefe ? 2.8 : 1.8;
        const color = esJefe ? 0x880000 : 0xaa2222;

        const geo = new THREE.CylinderGeometry(radio, radio, alto, 8);
        const mat = new THREE.MeshStandardMaterial({ color });
        this.malla = new THREE.Mesh(geo, mat);
        this.malla.position.set(x, alto / 2, z);
        escena.add(this.malla);

        this.ultimoAtaque = 0;
    }

    actualizar(posJugador, callbackAtaque) {
        if (this.vida <= 0) return;

        const distancia = this.malla.position.distanceTo(posJugador);

        // Persecución
        if (distancia < 15 && distancia > 1.8) {
            const dir = new THREE.Vector3().subVectors(posJugador, this.malla.position).normalize();
            this.malla.position.addScaledVector(dir, 0.05);
        }

        // Ataque
        if (distancia <= 2.0 && Date.now() - this.ultimoAtaque > 1500) {
            this.ultimoAtaque = Date.now();
            if (callbackAtaque) callbackAtaque(this.esJefe ? 25 : 10);
        }
    }

    recibirDanio(cantidad) {
        this.vida -= cantidad;
        if (this.vida <= 0) {
            this.malla.visible = false;
            if (window.GestorUI) window.GestorUI.notificarBajaEnemigo();
        }
    }
}

window.Enemigo = Enemigo;