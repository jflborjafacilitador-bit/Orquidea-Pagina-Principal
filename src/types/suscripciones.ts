// Tipos centrales para el sistema multi-suscripción de Orquídea

export type GrupoCategoria = 'jaboneria' | 'velas' | 'moldes' | 'marketing';
export type PlanSub = 'cobre' | 'plata' | 'unico' | 'oro';

export interface SuscripcionGrupo {
    plan: PlanSub;
    nivel: number;
    activa: boolean;
    desde?: string; // ISO date
}

// El mapa completo de suscripciones del usuario
export type MapaSuscripciones = Partial<Record<GrupoCategoria, SuscripcionGrupo>>;

// Perfil completo del usuario en Firestore
export interface UserProfile {
    id: string;
    email: string;
    displayName?: string;
    role?: string; // legacy / admin / free — se mantiene para compatibilidad
    suscripciones?: MapaSuscripciones;
    // Legacy access fields
    legacyCategories?: string[];
    legacyTier?: 'cobre' | 'plata';
    legacyExpiry?: string;
}

// Qué grupo pertenece cada CategoryKey de videos
export const CATEGORIA_A_GRUPO: Record<string, GrupoCategoria> = {
    jaboneria_basica: 'jaboneria',
    jaboneria_avanzada: 'jaboneria',
    velas_basica: 'velas',
    velas_avanzada: 'velas',
    moldes_silicon: 'moldes',
    marketing_digital: 'marketing',
};

// Dada una categoría y suscripciones, ¿tiene acceso?
export function tieneAcceso(
    category: string,
    suscripciones: MapaSuscripciones | undefined,
    role: string | undefined
): boolean {
    if (role === 'admin') return true;

    const grupo = CATEGORIA_A_GRUPO[category];
    if (!grupo) return false;

    const sub = suscripciones?.[grupo];
    if (!sub?.activa) return false;

    // Las categorías avanzadas requieren plan plata o superior
    if (category === 'jaboneria_avanzada' || category === 'velas_avanzada') {
        return sub.plan === 'plata' || sub.plan === 'oro';
    }

    return true;
}

// Nivel del usuario para esta categoría
export function nivelParaCategoria(
    category: string,
    suscripciones: MapaSuscripciones | undefined
): number {
    const grupo = CATEGORIA_A_GRUPO[category];
    return suscripciones?.[grupo]?.nivel ?? 0;
}

export const GRUPO_LABEL: Record<GrupoCategoria, string> = {
    jaboneria: '🧼 Jabonería',
    velas: '🕯️ Velas Artesanales',
    moldes: '🧩 Moldes de Silicón',
    marketing: '📱 Marketing Digital',
};

export const PLAN_LABEL: Record<PlanSub, string> = {
    cobre: '🥉 Cobre',
    plata: '🥈 Plata',
    unico: '✨ Único',
    oro: '🥇 Oro',
};

export const PLAN_COLOR: Record<PlanSub, string> = {
    cobre: '#CD7F32',
    plata: '#707B7C',
    unico: '#7c3aed',
    oro: '#B8860B',
};
