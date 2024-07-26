/* eslint-disable */
import { copy, rotate, remove, getRotationAngle, setContentInTinyMCE, startTiny } from './functions.js'

$(document).ready(function () {
    var $canvasContainer = $('.canvas-container canvas')
    $canvasContainer.hide()
    $(document).on('mousedown', function (e) { // Sürükleme.
        var $target = $(e.target) //Tıklanılan nesne
        var $dragElement = $target.closest('.drag-element') // Drag element öğesi. (Target in .drag-element e sahip en yakın atası)
        let startDragX, startDragY
        var editor = tinymce.get('TextEditor')

        if (!$target.is('.drag-element.selected .bi-arrow-repeat')) { // Döndürme elementine tıklanmıyorsa çalışır
            if ($dragElement.length) { // Drag elemente sahip öğe varsa çalışır
                e.preventDefault() // Varsayılan davranış iptali.
                const rect = $dragElement.offset() // Mevcut konum.
                if (!$target.closest('.TextEditor').length && !$target.closest('.tox-menu').length) {
                    $('.drag-element').not($dragElement).removeClass('selected')
                }
                $dragElement.addClass('selected') // Seçili sınıfı ekler.
                $canvasContainer.show()
                // Başlangıç konum farkları.
                startDragX = e.clientX - rect.left
                startDragY = e.clientY - rect.top
                // Mouse davranışına göre çalışcak olay dinleyicileriy
                $(document).on('mousemove', onMouseMove)
                $(document).one('mouseup', onMouseUp)

                // Boyutlandırma
                if ($target.hasClass('bi-arrows-angle-expand')) { // Tıklanan elementin resize handle olup olmadığını kontrol edin
                    let startX = e.clientX // mouse ile ilk tıklanan yerin yatay uzaklığı
                    let startY = e.clientY // mouse ile ilk tıklanan yerin dikey uzaklığı
                    let startWidth = $dragElement.outerWidth() // elementin mevcut genişliği
                    let startHeight = $dragElement.outerHeight() // elementin mevcut yüksekliği

                    let aspectRatio = startWidth / startHeight // Başlangıç oranını hesapla

                    const centerX = $dragElement.offset().left + startWidth / 2 // yatay merkez
                    const centerY = $dragElement.offset().top + startHeight / 2 // dikey merkez

                    document.addEventListener('mousemove', resize)
                    document.addEventListener('mouseup', stopResize)
                    // Mouse hareket ettiğinde resize işlemini yapacak fonksiyon
                    function resize (e) { //Boyutlandırma fonksiyonu
                        let widthChange
                        let heightChange
                        var angle = getRotationAngle($dragElement) // dönüş açısını hesaplayan fonksiyon
                        if (angle > -90 && angle < 90) { //dönüş açısına göre büyüyüp küçülme olayını düzenler.
                            // Normal davranış
                            widthChange = e.clientX - startX // burdaki e.clientX olay başladıktan sonraki mousenin uzaklığı
                            heightChange = e.clientY - startY
                        } else {
                            // Genişletme yönünü ters çevir
                            widthChange = startX - e.clientX
                            heightChange = startY - e.clientY
                        }
                        // Oranı koruyarak yeni genişlik ve yükseklik hesapla
                        let newWidth = Math.max(startWidth + (widthChange * 2), 10) // minimum genişlik 10px
                        let newHeight = Math.max(startHeight + (heightChange * 2), 10) // minimum yükseklik 10px
                        // Oranı korumak için genişlik veya yükseklikten birini ayarla
                        if (newWidth / newHeight > aspectRatio) {
                            // Yüksekliği, genişlik bazında ayarla
                            newHeight = newWidth / aspectRatio
                        } else {
                            // Genişliği, yükseklik bazında ayarla
                            newWidth = newHeight * aspectRatio
                        }

                        // Elementin boyutunu ve konumunu güncelle
                        $dragElement.css({
                            'width': newWidth + 'px',
                            'height': newHeight + 'px',
                            'left': (centerX - newWidth / 2) + 'px',
                            'top': (centerY - newHeight / 2) + 'px'
                        })

                        // Yazının boyutunu güncelle
                        if ($dragElement.find('.content').length > 0) {
                            let newFontSize = Math.max(newWidth / 5, 6) // yeni font boyutunu hesapla
                            $dragElement.find('.content').css('font-size', newFontSize + 'px')
                        }
                    } //Boyutlandırma fonksiyonu

                    // Mouse bırakıldığında resize işlemini durduracak fonksiyon
                    function stopResize () { // bu bölümün jquery versiyonu çalışmıyo..
                        document.removeEventListener('mousemove', resize)
                        document.removeEventListener('mouseup', stopResize)
                    }
                } // Boyutlandırma

                startTiny.call(this, editor) //Tiny başlatma kontrolü

                // İçerik ayarlama işlemini her iki seçici için de çağır
                setContentInTinyMCE('.drag-element.selected .content')
                setContentInTinyMCE('.drag-element.selected .text-path')
            } else { // Tıklanan yer element değilse.
                if (!$target.closest('.TextEditor').length && !$target.closest('.tox-menu').length) {
                    $('.drag-element.selected').removeClass('selected')
                    $canvasContainer.hide()
                }
                if (editor) { // Tiny başlatıldıysa gizle.
                    editor.setContent('') // Düzenleyicinin içeriğini temizle
                    editor.hide()
                }
            }

            function onMouseMove (e) { // Mouse hareketi.
                // Fare ile başlangıç noktası arasındaki yeni konum farkı.
                const x = e.clientX - startDragX
                const y = e.clientY - startDragY

                // Sürüklenen elementin yeni konumu.
                $dragElement.css({ 'left': x + 'px', 'top': y + 'px' })
            }

            function onMouseUp () { // Tıklama bırakıldığında.
                $(document).off('mousemove', onMouseMove)
            }
        }
    }) // Sürükleme.

    $(document).on('click', '.drag-element.selected .bi-trash', function (e) { // Silme.
        remove.call(this)
    }) // Silme.

    $(document).on('click', '.drag-element.selected .bi-copy', function (e) { // Kopyalama.
        copy.call(this)
    }) // Kopyalama.

    $(document).on('mousedown', '.drag-element.selected .bi-arrow-repeat', function (e) { // Döndürme.
        rotate.call(this, e)
    }) // Döndürme.

    function saveDesign () {
        if (isSaving) {
            return
        }
        isSaving = true
        var designName = document.getElementById("designname").value
        // ... (tasarım ismi kontrol ve bildirim)
        if (designName) {
            if (activeView === 'front') {
                localStorage.setItem(designName, JSON.stringify(canvas1))
            } else if (activeView === 'back') {
                localStorage.setItem(designName, JSON.stringify(canvas2))
            }
        }
        isSaving = false
    }
    function loadDesigns () {
        if (isSaving) {
            return
        }
        isSaving = true
        var keys = Object.keys(localStorage)
        var designs = keys.filter(key => key !== 'savedCanvas').sort()
        var selectElement = document.getElementById("designSelect")
        selectElement.innerHTML = ""
        if (designs.length > 0) {
            designs.forEach(function (designName) {
                var option = document.createElement("li")
                selectElement.appendChild(option)
                var buttondesign = document.createElement("button")
                buttondesign.textContent = designName
                option.appendChild(buttondesign)
                buttondesign.addEventListener("click", function (event) {
                    var selectedDesign = event.target.textContent
                    var loadedDesigndivid = document.getElementById("loadedDesigndiv")
                    loadedDesigndivid.innerHTML = "Seçilen tasarım: " + selectedDesign
                    if (selectedDesign && designs.includes(selectedDesign)) {
                        if (activeView === 'front') {
                            canvas1.loadFromJSON(localStorage.getItem(selectedDesign))
                        } else if (activeView === 'back') {
                            canvas2.loadFromJSON(localStorage.getItem(selectedDesign))
                        }
                    }
                })
            })
        }
        isSaving = false
    }
})