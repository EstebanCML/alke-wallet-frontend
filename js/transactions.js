$(function(){
    // Botón para volver al menú principal
    $('#return2').click(function (){ 
        window.location.href = "menu.html";
    });

    // Función para cargar y mostrar el historial de transacciones
    function cargarHistorial() {
        // Obtener historial desde localStorage
        const historial = JSON.parse(localStorage.getItem('historic')) || [];
        const $lista = $('.list-group');
        
        // Limpiar la lista actual
        $lista.empty();
        
        // Si no hay historial, mostrar mensaje
        if (historial.length === 0) {
            const $item = $('<li>', {
                class: 'list-group-item text-muted',
                text: 'No hay transacciones registradas'
            });
            $lista.append($item);
            return;
        }
        
        // Mostrar cada transacción
        historial.forEach(transaccion => {
            const $item = $('<li>', {
                class: 'list-group-item d-flex justify-content-between align-items-center'
            });
            
            // Formatear fecha y hora
            let fechaHora = '';
            if (transaccion.timestamp) {
                const fecha = new Date(transaccion.timestamp);
                const dia = String(fecha.getDate()).padStart(2, '0');
                const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Meses 0-11
                const año = fecha.getFullYear();
                const horas = String(fecha.getHours()).padStart(2, '0');
                const minutos = String(fecha.getMinutes()).padStart(2, '0');
                
                fechaHora = `🕰️${dia}-${mes}-${año} ${horas}:${minutos} `;
            }
            
            // Crear contenido de la transacción
            const $contenido = $('<div>', {
                class: 'w-100'
            });
            
            // Encabezado con tipo y monto
            const $encabezado = $('<div>', {
                class: 'd-flex justify-content-between'
            });
            
            // Determinar icono y clase según tipo de transacción
            let icono  = '';
            let claseMonto = '';
            
            if (transaccion.typeTransaction === 'Depósito') {
                icono = '💰';
                claseMonto = 'text-success';
            } else if (transaccion.typeTransaction === 'Transferencia') {
                icono = '💸';
                claseMonto = 'text-danger';
            }
            
            const $tipo = $('<span>', {
                class: 'fw-bold',
                html: `${icono} ${transaccion.typeTransaction}`
            });
            
            const $monto = $('<span>', {
                class: `fw-bold ${claseMonto}`,
                text: `${transaccion.amount >= 0 ? '+' : '-'}$${Math.abs(transaccion.amount).toLocaleString('es-ES')}`
            });
            
            $encabezado.append($tipo, $monto);
            
            // Detalles de la transacción
            const $detalles = $('<div>', {
                class: 'text-muted small'
            });
            
            // Mostrar destinatario si es una transferencia
            if (transaccion.typeTransaction === 'Transferencia' && transaccion.recipient) {
                $detalles.html(`
                    <div>Para: ${transaccion.recipient.nombre}</div>
                    <div>Cuenta: ${transaccion.recipient.cuenta} | Banco: ${transaccion.recipient.banco}</div>
                    ${fechaHora ? `<div>Fecha: ${fechaHora}</div>` : ''}
                `);
            } else {
                $detalles.html(fechaHora ? `Fecha: ${fechaHora}` : '');
            }
            
            // Agregar todo al contenido
            $contenido.append($encabezado, $detalles);
            $item.append($contenido);
            
            // Agregar a la lista
            $lista.append($item);
        });
    }

    // Cargar historial cuando la página esté lista
    $(document).ready(cargarHistorial);
    
    // Opcional: también cargar historial cuando la ventana se enfoque
    $(window).on('focus', function() {
        cargarHistorial();
    });
});



