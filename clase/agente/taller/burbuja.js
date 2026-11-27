/** Ordena números de menor a mayor sin modificar el arreglo original. */
function burbuja(numbers) {
  const sorted = [...numbers]

  for (let end = sorted.length - 1; end > 0; end--) {
    let swapped = false

    for (let i = 0; i < end; i++) {
      if (sorted[i] > sorted[i + 1]) {
        const current = sorted[i]
        sorted[i] = sorted[i + 1]
        sorted[i + 1] = current
        swapped = true
      }
    }

    if (!swapped) break
  }

  return sorted
}
