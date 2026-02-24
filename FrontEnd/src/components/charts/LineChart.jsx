export default function LineChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="card p-5">
                <h3 className="mb-4 text-lg font-semibold">Monthly Rent Collection</h3>
                <p className="text-sm text-soft">No data available.</p>
            </div>
        )
    }

    const max = Math.max(...data.map((item) => item.value), 1)
    const min = Math.min(...data.map((item) => item.value), 0)
    const range = max - min || 1

    const width = 100
    const height = 60
    const padding = 10

    const points = data.map((item, index) => {
        const x = padding + (index / (data.length - 1)) * (width - 2 * padding)
        const y = height - padding - ((item.value - min) / range) * (height - 2 * padding)
        return { x, y, ...item }
    })

    const linePath = points.map((point, index) =>
        index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
    ).join(' ')

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`

    return (
        <div className="card p-5">
            <h3 className="mb-4 text-lg font-semibold">Monthly Rent Collection</h3>
            <div className="relative h-64 w-full">
                <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.05" />
                        </linearGradient>
                    </defs>

                    {/* Area fill */}
                    <path d={areaPath} fill="url(#areaGradient)" />

                    {/* Line */}
                    <path
                        d={linePath}
                        fill="none"
                        stroke="#14b8a6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-sm"
                    />

                    {/* Data points */}
                    {points.map((point, index) => (
                        <g key={point.month}>
                            <circle
                                cx={point.x}
                                cy={point.y}
                                r="3"
                                fill="#0d9488"
                                stroke="white"
                                strokeWidth="1.5"
                                className="cursor-pointer transition-all hover:r-4"
                            />
                            {/* Tooltip on hover */}
                            <title>{`${point.month}: ₹${point.value.toLocaleString()}`}</title>
                        </g>
                    ))}
                </svg>

                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                    {data.map((item) => (
                        <span key={item.month} className="text-xs font-medium text-slate-500">
                            {item.month}
                        </span>
                    ))}
                </div>
            </div>

            {/* Legend / Summary */}
            <div className="mt-4 flex items-center justify-between border-t pt-3">
                <div className="text-sm">
                    <span className="text-slate-500">Total: </span>
                    <span className="font-semibold text-slate-700">
                        ₹{data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                    </span>
                </div>
                <div className="text-sm">
                    <span className="text-slate-500">Average: </span>
                    <span className="font-semibold text-slate-700">
                        ₹{Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length).toLocaleString()}
                    </span>
                </div>
                <div className="text-sm">
                    <span className="text-slate-500">Highest: </span>
                    <span className="font-semibold text-emerald-600">
                        ₹{max.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    )
}
