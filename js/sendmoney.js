$(function() {
    $('#return2').click(function() { 
        window.location.href = "menu.html";
    });

    const presentBalance = parseFloat(localStorage.getItem('presentBalance')) || 50000;
    $('#maxTransferAmount').text(`$${presentBalance.toLocaleString('es-ES')}`);

    // ============================================
    // FUNCIÓN 1: Guardar historial de transferencias
    // ============================================
    function saveTransferHistory(monto, contacto) {
        let historic = JSON.parse(localStorage.getItem('historic')) || [];
        
        const transaccion = {
            typeTransaction: 'Transferencia',
            amount: monto,
            contactName: contacto.nombre,
            contactAccount: contacto.cuenta,
            contactBank: contacto.banco,
            date: new Date().toLocaleString('es-ES')
        };
        
        historic.unshift(transaccion);
        localStorage.setItem('historic', JSON.stringify(historic));
    }

    // ============================================
    // FUNCIÓN 2: Guardar contacto con transferencia
    // ============================================
    function saveContactWithTransfer(contacto, monto) {
        let contactTransfers = JSON.parse(localStorage.getItem('contactTransfers')) || {};
        
        const contactoKey = contacto.cuenta;
        
        if (!contactTransfers[contactoKey]) {
            contactTransfers[contactoKey] = {
                nombre: contacto.nombre,
                cuenta: contacto.cuenta,
                banco: contacto.banco,
                alias: contacto.alias || '',
                totalTransferido: 0,
                cantidadTransferencias: 0,
                ultimaTransferencia: '',
                transferencias: []
            };
        }
        
        contactTransfers[contactoKey].totalTransferido += monto;
        contactTransfers[contactoKey].cantidadTransferencias += 1;
        contactTransfers[contactoKey].ultimaTransferencia = new Date().toLocaleString('es-ES');
        
        contactTransfers[contactoKey].transferencias.unshift({
            monto: monto,
            fecha: new Date().toLocaleString('es-ES'),
            saldoAnterior: presentBalance,
            saldoNuevo: presentBalance - monto
        });
        
        if (contactTransfers[contactoKey].transferencias.length > 10) {
            contactTransfers[contactoKey].transferencias = 
                contactTransfers[contactoKey].transferencias.slice(0, 10);
        }
        
        localStorage.setItem('contactTransfers', JSON.stringify(contactTransfers));
    }

    // ============================================
    // FUNCIÓN 3: Validar transferencia (tu función existente)
    // ============================================
    function validarTransferencia() {
        const contactoRadio = $('input[name="contactoSeleccionado"]:checked');
        const depositDecrease = parseFloat($("#depositDecrease").val());
        
        if (contactoRadio.length === 0) {
            return { 
                valido: false, 
                error: "Por favor, selecciona un contacto de la lista",
                tipo: "contacto"
            };
        }
        
        if (isNaN(depositDecrease) || depositDecrease <= 0) {
            return { 
                valido: false, 
                error: "Por favor, ingresa un monto válido mayor a 0",
                tipo: "monto"
            };
        }
        
        if (depositDecrease > presentBalance) {
            return { 
                valido: false, 
                error: `Saldo insuficiente. Tu saldo actual es $${presentBalance.toLocaleString('es-ES')}`,
                tipo: "saldo"
            };
        }
        
        const contacto = JSON.parse(contactoRadio.val());
        return {
            valido: true,
            depositDecrease: depositDecrease,
            contacto: contacto,
            nombreContacto: contacto.nombre,
            presentBalance: presentBalance
        };
    }

    // ============================================
    // EVENTO SUBMIT DEL FORMULARIO
    // ============================================
    $("#formTransferencia").on("submit", function(evento) {
        evento.preventDefault();
        
        const resultado = validarTransferencia();
        const $alert = $("#msgAlert");
        
        if (!resultado.valido) {
            $alert.html(`
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <div>❌ ${resultado.error}</div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `);
            
            if (resultado.tipo === "monto") {
                $("#depositDecrease").focus().select();
            } else if (resultado.tipo === "contacto") {
                $("#contactList").css("border", "2px solid #dc3545");
            }
            
            return;
        }
        
        const newBalance = resultado.presentBalance - resultado.depositDecrease;
        $('#maxTransferAmount').text(`$${newBalance.toLocaleString('es-ES')}`);
        
        $alert.html(`
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <div><strong>✅ ¡Transferencia exitosa!</strong></div>
                <div>Has enviado $${resultado.depositDecrease.toLocaleString('es-ES')} a ${resultado.nombreContacto}</div>
                <div><small>Cuenta: ${resultado.contacto.cuenta} | Banco: ${resultado.contacto.banco}</small></div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
        
        // ✅ GUARDAR DATOS
        localStorage.setItem('presentBalance', newBalance.toString()); // Saldo
        saveTransferHistory(resultado.depositDecrease, resultado.contacto); // Historial
        saveContactWithTransfer(resultado.contacto, resultado.depositDecrease); // Contacto
        
        $("#depositDecrease").val('');
        $("#contactList").css("border", "");
    });

    // ============================================
    // MEJORAS DE EXPERIENCIA (tu código existente)
    // ============================================
    $('input[name="contactoSeleccionado"]').change(function() {
        $("#contactList").css("border", "");
        $("#msgAlert").empty();
    });
    
    $("#depositDecrease").on('input', function() {
        $("#msgAlert").empty();
    });
    
    $("#contactAdd").click(function() {
        $('#contactModal').modal('show');
    });
});