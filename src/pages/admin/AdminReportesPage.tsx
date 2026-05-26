export default function AdminReportesPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                    Panel de reportes
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Gestioná todos los reportes de la plataforma.
                </p>
            </div>
            {/* TODO: tabla de reportes con GET /api/reports */}
            <p className="text-sm text-muted-foreground">Próximamente: listado completo de reportes.</p>
        </div>
    )
}