$(function(){

    $('#return1').click(function (){ 
    // Redirigir a sitio
    window.location.href = "menu.html";
    });

    $("#depositForm").on("submit", function (evento) {
        evento.preventDefault(); // evitar la recarga de la pagina
        const inputAmount = $("#depositInput").val();
        const depositAmount = parseFloat(inputAmount);
        const $alert = $("#msgAlert");

        // Validación
        // Pregunta primero si es un numero(false) y luego consulta si es un numero positivo
        if (isNaN(depositAmount) || depositAmount<= 0) {
            $alert.html(`
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <div>❌ Por favor, ingresa un monto válido mayor a 0.</div>
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
            `);
            $("#depositInput").focus();
            return;
        }
        // Obtener el saldo actual desde localStorage o $50.000
        const presentBalance = parseFloat(localStorage.getItem('presentBalance')) || 50000;
        const newBalance = presentBalance + depositAmount;
        $alert.html(`
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        <div>✅ ¡Transacción exitosa!.</div>
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `);

        //save del newBalance en el localstore(presentBalance)
        localStorage.setItem('presentBalance', newBalance.toString());
        // save localstore string para historial del transaction.html
        saveTransaction('Depósito', depositAmount);

        $('#addNewDeposit').removeClass("btn-new-deposit");
    });
    $('#addNewDeposit').click(function (){ 
        $('#addNewDeposit').addClass("btn-new-deposit");
        $("#depositInput").val('');
        $("#depositInput").focus();
    });

    // luego revisar
    function saveTransaction(typeTransaction, amount) {
        // Obtener historial actual o crear uno nuevo
        let historic = JSON.parse(localStorage.getItem('historic')) || [];
        
        // Crear la transacción SIMPLE
        const transaccion = {
            typeTransaction: typeTransaction,
            amount: amount,
            timestamp: new Date().toISOString()
        };
    
        // Agregar al historial
        historic.unshift(transaccion); // Agregar al principio
        // Guardar en localStorage
        localStorage.setItem('historic', JSON.stringify(historic));
        console.log('Transacción guardada:', transaccion);
    }
});