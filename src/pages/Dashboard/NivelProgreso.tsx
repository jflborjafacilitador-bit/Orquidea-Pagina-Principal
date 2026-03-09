import React from 'react';
import { TrendingUp } from 'lucide-react';

interface Props {
    nivelActual: number;
    totalDesbloqueados: number;
    totalPorDesbloquear: number;
}

export const NivelProgreso = ({ nivelActual, totalDesbloqueados, totalPorDesbloquear }: Props) => {
    const total = totalDesbloqueados + totalPorDesbloquear;
    const porcentaje = total > 0 ? Math.round((totalDesbloqueados / total) * 100) : 100;

    return (
        <div className="glass" style={{
            padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', gap: '1.2rem',
            backgroundColor: 'var(--color-white)', marginBottom: '1.5rem',
            flexWrap: 'wrap'
        }}>
            <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', flexShrink: 0
            }}>
                <TrendingUp size={22} />
            </div>

            <div style={{ flex: 1, minWidth: '150px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-dark)' }}>
                        Nivel {nivelActual} — {totalDesbloqueados} de {total} clases desbloqueadas
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700 }}>{porcentaje}%</span>
                </div>
                <div style={{ backgroundColor: 'var(--color-light-bg)', borderRadius: 'var(--radius-full)', overflow: 'hidden', height: '8px' }}>
                    <div style={{
                        height: '100%', width: `${porcentaje}%`,
                        background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                        borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease'
                    }} />
                </div>
            </div>

            {totalPorDesbloquear > 0 && (
                <div style={{
                    backgroundColor: 'var(--color-light-bg)', padding: '0.4rem 0.8rem',
                    borderRadius: 'var(--radius-full)', fontSize: '0.78rem', color: 'var(--color-gray-800)', whiteSpace: 'nowrap'
                }}>
                    🔒 {totalPorDesbloquear} próximamente
                </div>
            )}
        </div>
    );
};
