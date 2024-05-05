/* eslint-disable */
import { copy, rotate, remove } from './functions.js'

$(document).ready(function () {
    $(document).on('mousedown', function (e) { // Sürükleme.
        var $target = $(e.target) //Tıklanılan nesne
        var $dragElement = $target.closest('.drag-element') // Drag element öğesi. (Target in .drag-element e sahip en yakın atası)
        let startDragX, startDragY
        var editor = tinymce.get('TextEditor')

        if (!$target.is('.drag-element.selected .bi-arrow-repeat')) { // Döndürme elementine tıklanmıyorsa çalışır
            if ($dragElement.length) { // Drag elemente sahip öğe varsa çalışır
                e.preventDefault() // Varsayılan davranış iptali.

                if (!$target.closest('.TextEditor').length && !$target.closest('.tox-menu').length) {
                    $('.drag-element').not($dragElement).removeClass('selected')
                }
                $dragElement.addClass('selected') // Seçili sınıfı ekler.

                const rect = $dragElement.offset() // Mevcut konum.

                // Başlangıç konum farkları.
                startDragX = e.clientX - rect.left
                startDragY = e.clientY - rect.top

                // Mouse davranışına göre çalışcak olay dinleyicileri.
                $(document).on('mousemove', onMouseMove)
                $(document).one('mouseup', onMouseUp)

                // Boyutlandırma
                if ($target.hasClass('bi-arrows-angle-expand')) { // Tıklanan elementin resize handle olup olmadığını kontrol edin
                    let startX = e.clientX // mouse ile tıklanan yerin uzaklığı
                    let startY = e.clientY
                    let startWidth = $dragElement.outerWidth() // elementin mevcut genişliği
                    let startHeight = $dragElement.outerHeight() // elementin mevcut yüksekliği

                    let aspectRatio = startWidth / startHeight // Başlangıç oranını hesapla

                    const centerX = $dragElement.offset().left + startWidth / 2 // yatay merkez
                    const centerY = $dragElement.offset().top + startHeight / 2 // dikey merkez

                    // Mouse hareket ettiğinde resize işlemini yapacak fonksiyon
                    function resize (e) {
                        function getRotationAngle (target) { // Dönüş açısını hesaplayan fonksiyon
                            var obj = target.css("-webkit-transform") || target.css("-moz-transform") || target.css("-ms-transform") || target.css("-o-transform") || target.css("transform")
                            if (obj !== 'none') {
                                var values = obj.split('(')[1].split(')')[0].split(',')
                                var a = values[0]
                                var b = values[1]
                                var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI))
                                return angle
                            }
                            return 0
                        }
                        let widthChange
                        let heightChange
                        var angle = getRotationAngle($dragElement)
                        if (angle > -90 && angle < 90) { //dönüş açısına göre büyüyüp küçülme olayını düzenler.
                            // Normal davranış
                            widthChange = e.clientX - startX
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
                    }

                    // Mouse bırakıldığında resize işlemini durduracak fonksiyon
                    function stopResize () { // bu bölümün jquery versiyonu çalışmıyo..
                        document.removeEventListener('mousemove', resize)
                        document.removeEventListener('mouseup', stopResize)
                    }
                    document.addEventListener('mousemove', resize)
                    document.addEventListener('mouseup', stopResize)
                } // Boyutlandırma

                if (editor) { //Tiny başlatıldıysa görünür
                    editor.show()
                } else { // Tiny başlatılmamışsa başlatır
                    tinymce.init({
                        selector: '#TextEditor',
                        skin: 'oxide-dark',
                        height: '24vh',
                        width: '47vh',
                        menubar: 'edit view insert format',
                        init_instance_callback: function (editor) { // Düzenleyici hazır olduğunda ve bir instance başlatıldığında içeriği ayarla
                            setContentInTinyMCE('.drag-element.selected .content')
                            setContentInTinyMCE('.drag-element.selected .text-path')
                        },
                        setup: function (editor) {
                            editor.on('change keyup', function (e) {
                                // TinyMCE'deki içerik değiştiğinde çağrılacak fonksiyon
                                var content = editor.getContent({ format: 'html' })

                                // Hangi .drag-element seçili ise onun içeriğini güncelle
                                var selectedDragElement = $('.drag-element.selected')
                                if (selectedDragElement.has('.content').length) {
                                    selectedDragElement.find('.content').html(content)
                                } else if (selectedDragElement.has('.text-path').length) {
                                    // .text-path bir SVG içinde olduğundan, textContent kullanılmalı
                                    selectedDragElement.find('.text-path textPath').html(content)
                                }
                            })
                        }
                    })
                }

                // TinyMCE düzenleyicisine içerik ayarlama fonksiyonu
                function setContentInTinyMCE (selector) {
                    var element = $(selector)
                    if (element.length) {
                        var content = element.text()
                        tinymce.get('TextEditor').setContent(content)
                    }
                }

                // İçerik ayarlama işlemini her iki seçici için de çağır
                setContentInTinyMCE('.drag-element.selected .content')
                setContentInTinyMCE('.drag-element.selected .text-path')
            } else { // Tıklanan yer element değilse.
                if (!$target.closest('.TextEditor').length && !$target.closest('.tox-menu').length) {
                    $('.drag-element.selected').removeClass('selected')
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
})