class GestorMazmorra {
    constructor() {
        this.enMazmorra = false;
        this.paredes = [];
        this.jefe = null;
    }

    generarMazmorra(escena) {
        const grupo = new THREE.Group();
        grupo.name = "GrupoMazmorra";

        // Suelo de piedra de la mazmorra
        const sueloGeo = new THREE.PlaneGeometry(80, 80);
        const sueloMat = new THREE.MeshStandardMaterial({ color: 0x111115 });
        const suelo = new THREE.Mesh(sueloGeo, sueloMat);
        suelo.rotation.x = -Math.PI / 2;
        suelo.position.set(0, 0.05, -150);
        grupo.add(suelo);

        // Paredes cuadradas
        const matPared = new THREE.MeshStandardMaterial({ color: 0x22222e });
        const paredesConfig = [
            { w: 80, h: 12, d: 2, x: 0, y: 6, z: -190 }, // Norte
            { w: 80, h: 12, d: 2, x: 0, y: 6, z: -110 }, // Sur
            { w: 2, h: 12, d: 80, x: -40, y: 6, z: -150 }, // Oeste
            { w: 2, h: 12, d: 80, x: 40, y: 6, z: -150 }   // Este
        ];

        paredesConfig.forEach(p => {
            const geo = new THREE.BoxGeometry(p.w, p.h, p.d);
            const mesh = new THREE.Mesh(geo, matPared);
            mesh.position.set(p.x, p.y, p.z);
            grupo.add(mesh);
        });

        // Luz Roja de la cámara del Jefe
        const luzJefe = new THREE.PointLight(0xff0000, 2, 40);
        luzJefe.position.set(0, 8, -150);
        grupo.add(luzJefe);

        escena.add(grupo);

        // Instanciar al Jefe de la Mazmorra
        this.jefe = new Enemigo(escena, 0, -160, true);
    }
}

window.GestorMazmorra = new GestorMazmorra();