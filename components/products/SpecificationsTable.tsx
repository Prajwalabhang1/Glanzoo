interface SpecificationsTableProps {
    specificationsJson: string | null | undefined
}

export function SpecificationsTable({ specificationsJson }: SpecificationsTableProps) {
    if (!specificationsJson) return null

    let specs: Record<string, string> = {}
    try {
        const parsed = JSON.parse(specificationsJson)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            specs = parsed
        }
    } catch {
        return null
    }

    const entries = Object.entries(specs).filter(([, v]) => v && String(v).trim() !== '')
    if (entries.length === 0) return null

    return (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
            {entries.map(([key, value]) => (
                <div key={key} className="col-span-1 flex flex-col">
                    <dt className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-0.5">
                        {key}
                    </dt>
                    <dd className="text-sm text-gray-800 font-medium">
                        {String(value)}
                    </dd>
                </div>
            ))}
        </dl>
    )
}
