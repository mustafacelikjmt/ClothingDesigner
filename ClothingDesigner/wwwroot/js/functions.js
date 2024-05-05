/* eslint-disable */

export function copy () { // Kopyalama.
    const selectedElement = $(this).closest('.drag-element')
    if (selectedElement) {
        selectedElement.after(selectedElement.clone())
    }
} // Kopyalama.

export function rotate (e) { // Döndürme.
    e.preventDefault()
    const selectedElement = $(this).closest('.drag-element')

    // Mevcut dönüþ açýsýný al ve radyana çevir
    const currentTransform = selectedElement.css('transform') // Dönüþ açýsýcý al.
    let currentAngle = 0 // Baþlangýç deðeri 0 olan mevcut açýyý saklayan deðiþken.
    if (currentTransform !== 'none') {
        const values = currentTransform.split('(')[1].split(')')[0].split(',')
        const a = values[0]
        const b = values[1]
        currentAngle = Math.atan2(b, a)
    }

    const elementOffset = selectedElement.offset()
    const centerX = elementOffset.left + selectedElement.width() / 2
    const centerY = elementOffset.top + selectedElement.height() / 2
    const startAngle = Math.atan2(e.pageY - centerY, e.pageX - centerX) - currentAngle // Fare týklamasý anýndaki baþlangýç açýsýný hesaplar ve mevcut dönüþ açýsýný çýkarýr.

    function rotateElement (e) {
        const angle = Math.atan2(e.pageY - centerY, e.pageX - centerX) - startAngle
        const degrees = angle * (180 / Math.PI)
        selectedElement.css('transform', `rotate(${degrees}deg)`)
    }

    $(document).on('mousemove', rotateElement)
    $(document).on('mouseup', function () {
        $(document).off('mousemove', rotateElement)
    })
} // Döndürme.

export function remove () { // Silme.
    // Bu týklama olayý ile 'selected' sýnýfýna sahip '.drag-element' elementini bul.
    const selectedElement = $(this).closest('.drag-element')
    if (selectedElement) {
        // Bulunan elementi DOM'dan kaldýr
        selectedElement.remove()
    }
} // Silme.