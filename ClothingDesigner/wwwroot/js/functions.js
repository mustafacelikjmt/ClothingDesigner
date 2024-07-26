/* eslint-disable */

export function copy () { // Kopyalama.
    const selectedElement = $(this).closest('.drag-element')
    if (selectedElement) {
        selectedElement.after(selectedElement.clone())
    }
} // Kopyalama.

export function rotate (e) { // D�nd�rme.
    e.preventDefault()
    const selectedElement = $(this).closest('.drag-element')

    // Mevcut d�n�� a��s�n� al ve radyana �evir
    const currentTransform = selectedElement.css('transform') // D�n�� a��s�c� al.
    let currentAngle = 0 // Ba�lang�� de�eri 0 olan mevcut a��y� saklayan de�i�ken.
    if (currentTransform !== 'none') {
        const values = currentTransform.split('(')[1].split(')')[0].split(',')
        const a = values[0]
        const b = values[1]
        currentAngle = Math.atan2(b, a)
    }

    const elementOffset = selectedElement.offset()
    const centerX = elementOffset.left + selectedElement.width() / 2
    const centerY = elementOffset.top + selectedElement.height() / 2
    const startAngle = Math.atan2(e.pageY - centerY, e.pageX - centerX) - currentAngle // Fare t�klamas� an�ndaki ba�lang�� a��s�n� hesaplar ve mevcut d�n�� a��s�n� ��kar�r.

    function rotateElement (e) {
        const angle = Math.atan2(e.pageY - centerY, e.pageX - centerX) - startAngle
        const degrees = angle * (180 / Math.PI)
        selectedElement.css('transform', `rotate(${degrees}deg)`)
    }

    $(document).on('mousemove', rotateElement)
    $(document).on('mouseup', function () {
        $(document).off('mousemove', rotateElement)
    })
} // D�nd�rme.

export function remove () { // Silme.
    // Bu t�klama olay� ile 'selected' s�n�f�na sahip '.drag-element' elementini bul.
    const selectedElement = $(this).closest('.drag-element')
    if (selectedElement) {
        // Bulunan elementi DOM'dan kald�r
        selectedElement.remove()
    }
} // Silme.

export function getRotationAngle (e) { // D�n�� a��s�n� hesaplayan fonksiyon
    var obj = e.css("-webkit-transform") || e.css("-moz-transform") || e.css("-ms-transform") || e.css("-o-transform") || e.css("transform")
    if (obj !== 'none') {
        var values = obj.split('(')[1].split(')')[0].split(',')
        var a = values[0]
        var b = values[1]
        var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI))
        return angle
    }
    return 0
} // D�n�� a��s�n� hesaplayan fonksiyon

export function setContentInTinyMCE (selector) { // TinyMCE d�zenleyicisine i�erik ayarlama fonksiyonu
    var element = $(selector)
    if (element.length) {
        var content = element.text()
        tinymce.get('TextEditor').setContent(content)
    }
}// TinyMCE d�zenleyicisine i�erik ayarlama fonksiyonu

export function startTiny (editor) { //Tiny ba�latma kontrol�
    if (editor) { //Tiny ba�lat�ld�ysa g�r�n�r
        editor.show()
    } else { // Tiny ba�lat�lmam��sa ba�lat�r
        tinymce.init({
            selector: '#TextEditor',
            skin: 'oxide-dark',
            height: '24vh',
            width: '47vh',
            menubar: 'edit view insert format',
            init_instance_callback: function (editor) { // D�zenleyici haz�r oldu�unda ve bir instance ba�lat�ld���nda i�eri�i ayarla
                setContentInTinyMCE('.drag-element.selected .content')
                setContentInTinyMCE('.drag-element.selected .text-path')
            },
            setup: function (editor) {
                editor.on('change keyup', function (e) {
                    // TinyMCE'deki i�erik de�i�ti�inde �a�r�lacak fonksiyon
                    var content = editor.getContent({ format: 'html' })

                    // Hangi .drag-element se�ili ise onun i�eri�ini g�ncelle
                    var selectedDragElement = $('.drag-element.selected')
                    if (selectedDragElement.has('.content').length) {
                        selectedDragElement.find('.content').html(content)
                    } else if (selectedDragElement.has('.text-path').length) {
                        // .text-path bir SVG i�inde oldu�undan, textContent kullan�lmal�
                        selectedDragElement.find('.text-path textPath').html(content)
                    }
                })
            }
        })
    }
} //Tiny ba�latma kontrol�