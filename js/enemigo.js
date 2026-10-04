class Enemigo {
    constructor(escena, x, z, esJefe = false, tipo = "orco") {
        this.esJefe = esJefe;
        this.tipo = tipo;
        this.vidaMax = esJefe ? 250 : 60;
        this.vida = this.vidaMax;
        this.escena = escena;

        const radio = esJefe ? 1.4 : 0.6;
        const alto = esJefe ? 3.5 : 1.8;
        const color = esJefe ? 0x990000 : (tipo === "esqueleto" ? 0xcccccc : 0x228822);

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

        // Rango de agro
        if (distancia < 18 && distancia > 2.0) {
            const dir = new THREE.Vector3().subVectors(posJugador, this.malla.position).normalize();
            this.malla.position.addScaledVector(dir, this.esJefe ? 0.04 : 0.06);
        }

        // Ataque
        if (distancia <= 2.2 && Date.now() - this.ultimoAtaque > 1400) {
            this.ultimoAtaque = Date.now();
            if (callbackAtaque) callbackAtaque(this.esJefe ? 30 : 12);
        }
    }

    recibirDanio(cantidad) {
        this.vida -= cantidad;
        if (this.vida <= 0) {
            this.malla.visible = false;
            if (window.GestorMisiones) {
                window.GestorMisiones.notificarBaja(this.esJefe ? "jefe" : "orco");
            }
        }
    }
}

window.Enemigo = Enemigo;