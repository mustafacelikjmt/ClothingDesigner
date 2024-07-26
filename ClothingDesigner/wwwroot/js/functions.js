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

export function getRotationAngle (e) { // Dönüþ açýsýný hesaplayan fonksiyon
    var obj = e.css("-webkit-transform") || e.css("-moz-transform") || e.css("-ms-transform") || e.css("-o-transform") || e.css("transform")
    if (obj !== 'none') {
        var values = obj.split('(')[1].split(')')[0].split(',')
        var a = values[0]
        var b = values[1]
        var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI))
        return angle
    }
    return 0
} // Dönüþ açýsýný hesaplayan fonksiyon

export function setContentInTinyMCE (selector) { // TinyMCE düzenleyicisine içerik ayarlama fonksiyonu
    var element = $(selector)
    if (element.length) {
        var content = element.text()
        tinymce.get('TextEditor').setContent(content)
    }
}// TinyMCE düzenleyicisine içerik ayarlama fonksiyonu

export function startTiny (editor) { //Tiny baþlatma kontrolü
    if (editor) { //Tiny baþlatýldýysa görünür
        editor.show()
    } else { // Tiny baþlatýlmamýþsa baþlatýr
        tinymce.init({
            selector: '#TextEditor',
            skin: 'oxide-dark',
            height: '24vh',
            width: '47vh',
            menubar: 'edit view insert format',
            init_instance_callback: function (editor) { // Düzenleyici hazýr olduðunda ve bir instance baþlatýldýðýnda içeriði ayarla
                setContentInTinyMCE('.drag-element.selected .content')
                setContentInTinyMCE('.drag-element.selected .text-path')
            },
            setup: function (editor) {
                editor.on('change keyup', function (e) {
                    // TinyMCE'deki içerik deðiþtiðinde çaðrýlacak fonksiyon
                    var content = editor.getContent({ format: 'html' })

                    // Hangi .drag-element seçili ise onun içeriðini güncelle
                    var selectedDragElement = $('.drag-element.selected')
                    if (selectedDragElement.has('.content').length) {
                        selectedDragElement.find('.content').html(content)
                    } else if (selectedDragElement.has('.text-path').length) {
                        // .text-path bir SVG içinde olduðundan, textContent kullanýlmalý
                        selectedDragElement.find('.text-path textPath').html(content)
                    }
                })
            }
        })
    }
} //Tiny baþlatma kontrolü