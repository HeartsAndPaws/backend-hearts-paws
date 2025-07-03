export function formatearARS(valor: number): string{
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(valor);
}

export function calcularPorcentajeProgreso(meta: number, estado: number): string{
    if (meta <= 0) return '0%';
    const porcentaje = (estado / meta) * 100;
    return `${porcentaje.toFixed(2)}%`
}