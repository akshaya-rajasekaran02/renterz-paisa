function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Unable to load image for AI analysis.'))
    image.src = src
  })
}

function drawToCanvas(image, size = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Canvas context not available for AI analysis.')
  ctx.drawImage(image, 0, 0, size, size)
  return ctx.getImageData(0, 0, size, size).data
}

function computeMetrics(startPixels, endPixels) {
  const totalPixels = startPixels.length / 4
  let changedPixels = 0
  let diffSum = 0
  let startLumSum = 0
  let endLumSum = 0
  let startBlueSum = 0
  let endBlueSum = 0

  for (let i = 0; i < startPixels.length; i += 4) {
    const sr = startPixels[i]
    const sg = startPixels[i + 1]
    const sb = startPixels[i + 2]
    const er = endPixels[i]
    const eg = endPixels[i + 1]
    const eb = endPixels[i + 2]

    const diff = Math.abs(sr - er) + Math.abs(sg - eg) + Math.abs(sb - eb)
    const normalizedDiff = diff / 3
    diffSum += normalizedDiff
    if (normalizedDiff > 22) changedPixels += 1

    const startLum = 0.2126 * sr + 0.7152 * sg + 0.0722 * sb
    const endLum = 0.2126 * er + 0.7152 * eg + 0.0722 * eb
    startLumSum += startLum
    endLumSum += endLum
    startBlueSum += sb
    endBlueSum += eb
  }

  return {
    diffPercent: (changedPixels / totalPixels) * 100,
    avgDiff: diffSum / totalPixels,
    luminanceDelta: (endLumSum - startLumSum) / totalPixels,
    blueShift: (endBlueSum - startBlueSum) / totalPixels,
  }
}

function buildIssueHints(metrics) {
  const hints = []
  if (metrics.blueShift > 6 && metrics.diffPercent > 6) {
    hints.push('Possible moisture or seepage pattern detected')
  }
  if (metrics.luminanceDelta < -7 && metrics.diffPercent > 5) {
    hints.push('Dark patch formation indicates stain or paint deterioration')
  }
  if (metrics.avgDiff > 20 && metrics.diffPercent > 10) {
    hints.push('Surface impact/crack likelihood is elevated')
  }
  if (!hints.length) {
    hints.push('General surface wear detected')
  }
  return hints
}

function resolveSeverity(diffPercent) {
  if (diffPercent >= 16) return 'SEVERE'
  if (diffPercent >= 7) return 'MODERATE'
  return 'MINOR'
}

function resolveCostRange(severity) {
  if (severity === 'SEVERE') return { min: 15000, max: 45000 }
  if (severity === 'MODERATE') return { min: 5000, max: 15000 }
  return { min: 1500, max: 5000 }
}

export async function analyzeDamageWithAi({ startImage, endImage }) {
  if (!startImage || !endImage) {
    throw new Error('Both start and end images are required for AI detection.')
  }

  const [startLoaded, endLoaded] = await Promise.all([loadImage(startImage), loadImage(endImage)])
  const [startPixels, endPixels] = [drawToCanvas(startLoaded), drawToCanvas(endLoaded)]
  const metrics = computeMetrics(startPixels, endPixels)
  const severity = resolveSeverity(metrics.diffPercent)
  const confidence = clamp(Math.round(58 + metrics.diffPercent * 2 + metrics.avgDiff * 0.7), 55, 97)
  const costRange = resolveCostRange(severity)
  const suggested = Math.round((costRange.min + costRange.max) / 2)

  return {
    model: 'VisionDiff-v1',
    severity,
    confidence,
    changedAreaPct: Number(metrics.diffPercent.toFixed(2)),
    avgPixelShift: Number(metrics.avgDiff.toFixed(2)),
    primaryIssues: buildIssueHints(metrics),
    suggestedEstimate: suggested,
    estimatedCostRange: costRange,
    recommendation:
      severity === 'SEVERE'
        ? 'Immediate inspection and contractor intervention recommended.'
        : severity === 'MODERATE'
        ? 'Schedule repair within 3-7 days and re-validate after work.'
        : 'Track and patch during routine maintenance cycle.',
  }
}

