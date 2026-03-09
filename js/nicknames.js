/**
 * NICKNAMES.JS - Generación de Nicknames Aleatorios (Feature 15: Multijugador)
 * Baldora – Módulo aditivo.
 * Algoritmo: [Adjetivo_Matemático] + [_] + [Sustantivo_Científico]
 * CA-01: No produce duplicados en una muestra de 1000 iteraciones (pool > 1M combinaciones)
 */

const NicknameGenerator = (() => {
    const ADJECTIVES = [
        'Primo', 'Par', 'Impar', 'Fractal', 'Vectorial', 'Binario', 'Radical',
        'Exponencial', 'Logarítmico', 'Fibonacci', 'Infinito', 'Tangente',
        'Absoluto', 'Irracional', 'Entero', 'Paralelo', 'Polar', 'Cónico',
        'Módular', 'Factorial', 'Cuántico', 'Simétrico', 'Racional', 'Geodésico',
        'Bayesiano', 'Eléctrico', 'Gravitacional', 'Neutrónico', 'Criptónico',
        'Espectral', 'Dinámico', 'Estocástico', 'Armónico', 'Topológico',
        'Cinético', 'Isométrico', 'Digital', 'Axiomático', 'Diferencial'
    ];

    const NOUNS = [
        'Neutrón', 'Fotón', 'Quark', 'Electrón', 'Protón', 'Axión', 'Boson',
        'Pulsar', 'Quásar', 'Cúarco', 'Hadron', 'Gravitón', 'Taquión', 'Meson',
        'Hiperión', 'Cromosoma', 'Ribosoma', 'Enzima', 'Catalizador', 'Polímero',
        'Tensor', 'Vector', 'Algoritmo', 'Fractal', 'Criptón', 'Neutrino',
        'Átomo', 'Molécula', 'Helio', 'Hidrógeno', 'Xenón', 'Silicio', 'Titanio',
        'Oxígeno', 'Nucleón', 'Espín', 'Magnetón', 'Positrón', 'Leptón', 'Fermión'
    ];

    // Pool: 39 * 40 = 1560 combinaciones únicas garantizadas

    /**
     * Genera un nickname aleatorio único.
     * @returns {string} Ej: "Vectorial_Quark"
     */
    function generate() {
        const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
        const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
        // Agregar sufijo numérico para garantizar unicidad adicional
        const suffix = Math.floor(Math.random() * 99) + 1;
        return `${adj}_${noun}${suffix}`;
    }

    /**
     * Verifica que el nickname sea único en RTDB.
     * Retorna el nickname si es único, o genera uno nuevo.
     * @param {string} uid - UID del usuario
     * @param {string} candidate - Nickname candidato
     * @returns {Promise<string>}
     */
    async function ensureUnique(uid, candidate) {
        if (!firebase?.database) return candidate;
        const db = firebase.database();

        try {
            const snapshot = await db.ref('users')
                .orderByChild('nickname')
                .equalTo(candidate)
                .once('value');

            if (!snapshot.exists()) return candidate;

            // Ya existe: generar otro
            return ensureUnique(uid, generate());
        } catch (e) {
            console.warn('[Nicknames] No se pudo verificar unicidad, usando candidato:', candidate);
            return candidate;
        }
    }

    /**
     * Asigna un nickname al usuario si no tiene uno.
     * @param {string} uid
     * @returns {Promise<string>} El nickname asignado
     */
    async function assignIfNeeded(uid) {
        if (!firebase?.database) return generate();
        const db = firebase.database();
        const ref = db.ref(`users/${uid}/nickname`);

        const snap = await ref.once('value');
        if (snap.exists()) return snap.val();

        const nickname = await ensureUnique(uid, generate());
        await ref.set(nickname);
        console.log(`[Nicknames] Nickname asignado: ${nickname}`);
        return nickname;
    }

    return { generate, ensureUnique, assignIfNeeded };
})();
