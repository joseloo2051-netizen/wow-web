class Enemigo {
    constructor(escena, x, z, esJefe = false) {
        this.escena = escena;
        this.esJefe = esJefe;
        this.vida = esJefe ? 250 : 60;

        const tamaño = esJefe ? 2.5 : 1;
        const color = esJefe ? 0x990000 : 0xcc3300;

        const geometria = new THREE.BoxGeometry(tamaño, tamaño * 2, tamaño);
        const material = new THREE.MeshStandardMaterial({ color: color });
        this.malla = new THREE.Mesh(geometria, material);
        this.malla.position.set(x, tamaño, z);
        this.escena.add(this.malla);
    }

    actualizar(posicionJugador, alAtaqueCallback) {
        if (this.vida <= 0) return;

        const distancia = this.malla.position.distanceTo(posicionJugador);

        if (distancia < 15 && distancia > 2) {
            this.malla.lookAt(posicionJugador.x, this.malla.position.y, posicionJugador.z);
            this.malla.translateZ(0.05);
        } else if (distancia <= 2) {
            alAtaqueCallback(this.esJefe ? 8 : 2);
        }
    }

    recibirDanio(cantidad) {
        this.vida -= cantidad;
        if (this.vida <= 0) {
            this.escena.remove(this.malla);
            GestorUI.agregarAlInventario(this.esJefe ? '👑' : '🥩');
            GestorUI.notificarBajaEnemigo();
        }
    }
}