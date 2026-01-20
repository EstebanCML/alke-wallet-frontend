$(function(){
    $('#return2').click(function (){ 
        // Redirigir a sitio
        window.location.href = "menu.html";
    });

    const presentBalance = parseFloat(localStorage.getItem('presentBalance')) || 50000;
    $('#maxTransferAmount').text(`$${presentBalance.toLocaleString('es-ES')}`);

    // ============================================
    // FUNCIÓN PARA GUARDAR TRANSACCIONES
    // ============================================
    function saveTransaction(typeTransaction, amount, recipient = null) {
        // Obtener historial actual o crear uno nuevo
        let historic = JSON.parse(localStorage.getItem('historic')) || [];
        
        // Crear la transacción SIMPLE
        const transaccion = {
            typeTransaction: typeTransaction,
            amount: amount,
            timestamp: new Date().toISOString()
        };
        
        // Agregar info del destinatario si existe
        if (recipient) {
            transaccion.recipient = recipient;
        }
        
        // Agregar al historial
        historic.unshift(transaccion); // Agregar al principio
        
        // Guardar en localStorage
        localStorage.setItem('historic', JSON.stringify(historic));
        
        // Para depuración
        console.log('Transacción guardada:', transaccion);
    }

    function validarTransferencia() {
        // Buscar contacto seleccionado
        const contactoRadio = $('input[name="contactoSeleccionado"]:checked');
        
        // Obtener monto del input
        const depositDecrease = parseFloat($("#depositDecrease").val());
        
        //Validar que haya contacto seleccionado
        if (contactoRadio.length === 0) {
            return { 
                valido: false, 
                error: "Por favor, selecciona un contacto de la lista",
                tipo: "contacto"
            };
        }
        
        //Validar que el monto sea un número válido
        if (isNaN(depositDecrease) || depositDecrease <= 0) {
            return { 
                valido: false, 
                error: "Por favor, ingresa un monto válido mayor a 0",
                tipo: "monto"
            };
        }
        
        //Validar que haya saldo suficiente
        if (depositDecrease > presentBalance) {
            return { 
                valido: false, 
                error: `Saldo insuficiente. Tu saldo actual es $${presentBalance.toLocaleString('es-ES')}`,
                tipo: "saldo"
            };
        }
        
        //Si todo está bien, devolver datos
        const contacto = JSON.parse(contactoRadio.val());
        return {
            valido: true,
            depositDecrease: depositDecrease,
            contacto: contacto,
            nombreContacto: contacto.nombre,
            presentBalance: presentBalance
        };
    }
    //logica de tranferencia
    $("#formTransferencia").on("submit", function (evento) {
        evento.preventDefault(); // evitar la recarga de la pagina

        const resultado = validarTransferencia();
        const $alert = $("#msgAlert");


        

        
        if (!resultado.valido) {
            $alert.html(`
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <div>❌ ${resultado.error}</div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `);
            //Enfocar el campo correcto según el error
            if (resultado.tipo === "monto") {
                $("#depositDecrease").focus().select();
            } else if (resultado.tipo === "contacto") {
                $("#contactList").css("border", "2px solid #dc3545");
            }
            
            return; // Detener ejecución
        }
        const newBalance = resultado.presentBalance - resultado.depositDecrease;
        saveTransaction(
            "Transferencia", 
            -resultado.depositDecrease, // Monto negativo para indicar salida
            {
                nombre: resultado.nombreContacto,
                cuenta: resultado.contacto.cuenta,
                banco: resultado.contacto.banco
            }
        );
        localStorage.setItem('presentBalance', newBalance.toString());
        $('#maxTransferAmount').text(`$${newBalance.toLocaleString('es-ES')}`);//actualizar balance 

        $alert.html(`
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <div><strong>✅ ¡Transferencia exitosa!</strong></div>
                <div>Has enviado $${resultado.depositDecrease.toLocaleString('es-ES')} a ${resultado.nombreContacto}</div>
                <div><small>Cuenta: ${resultado.contacto.cuenta} | Banco: ${resultado.contacto.banco}</small></div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
        // Limpiar formulario
        $("#depositDecrease").val('');
        // Quitar borde rojo de la lista si estaba
        $("#contactList").css("border", "");
    });
    // ============================================
    // MEJORAS DE EXPERIENCIA
    // ============================================
    // Al escribir en el monto, limpiar alertas
    $("#depositDecrease").on('input', function() {
        $("#msgAlert").empty(); // Limpiar alertas
    });
    // Al seleccionar contacto, quitar borde rojo
    $('input[name="contactoSeleccionado"]').change(function() {
        $("#contactList").css("border", "");
        $("#msgAlert").empty(); // Limpiar alertas
        // Resaltar visualmente
        $("#contactList .list-group-item").removeClass('active');
        if (this.checked) {
            $(this).closest('.list-group-item').addClass('active');
        }
    });


    // Botón para agregar contacto
    $("#contactAdd").click(function() {
        $('#contactModal').modal('show');
    });
    // ============================================
    // FUNCIONALIDAD DE CONTACTOS CON LOCALSTORAGE
    // ============================================
    
    // Array para mantener seguimiento de contactos cargados en la sesión actual
    let loadedContacts = [];
    
    // Función para cargar contactos desde localStorage SIN duplicar
    function loadContacts() {
        const storedContacts = JSON.parse(localStorage.getItem('contactList')) || [];
        
        // Limpiar contactos actuales (excepto los predeterminados del HTML)
        // Primero, identificamos qué contactos ya están en el HTML (los predeterminados)
        const existingContacts = [];
        $('#contactList .list-group-item').each(function() {
            const radioValue = $(this).find('input[type="radio"]').val();
            if (radioValue) {
                try {
                    const contact = JSON.parse(radioValue);
                    existingContacts.push(contact.cuenta); // Usamos el número de cuenta como ID único
                } catch (e) {
                    console.error("Error parsing contact:", e);
                }
            }
        });
        
        // Agregar solo los contactos que no están ya en la lista
        storedContacts.forEach(contact => {
            // Verificar si el contacto ya existe (por número de cuenta)
            const alreadyExists = existingContacts.includes(contact.cuenta);
            const alreadyLoaded = loadedContacts.includes(contact.cuenta);
            
            if (!alreadyExists && !alreadyLoaded) {
                addContactToList(contact, false); // false = no guardar en storage (ya está guardado)
                loadedContacts.push(contact.cuenta);
            }
        });
    }
    
    // Función para agregar contacto a la lista (DOM y localStorage si es nuevo)
    function addContactToList(contact, saveToStorage = true) {
        // Verificar si el contacto ya existe en el DOM
        let exists = false;
        $('#contactList .list-group-item').each(function() {
            const radioValue = $(this).find('input[type="radio"]').val();
            if (radioValue) {
                try {
                    const existingContact = JSON.parse(radioValue);
                    if (existingContact.cuenta === contact.cuenta) {
                        exists = true;
                        return false; // Salir del bucle each
                    }
                } catch (e) {
                    // Ignorar errores de parsing
                }
            }
        });
        
        if (exists) {
            console.log("El contacto ya existe en la lista:", contact.nombre);
            return false;
        }
        
        // Generar ID único para el radio button
        const contactId = 'contactOption_' + Date.now() + Math.random();
        
        // Crear el nuevo elemento de contacto con jQuery
        const nuevoContacto = $(`
            <li class="list-group-item">
                <div class="contact-info">
                    <input class="form-check-input" type="radio" 
                           id="${contactId}" 
                           name="contactoSeleccionado" 
                           value='${JSON.stringify(contact)}'>
                    <span class="contact-name"><strong>${contact.nombre}</strong></span>
                    <span class="contact-details"> - Número de cuenta: ${contact.cuenta}, Alias: ${contact.alias}, Banco: ${contact.banco}</span>
                </div>
            </li>
        `);
        
        // Agregar evento al nuevo radio button
        nuevoContacto.find('input[type="radio"]').change(function() {
            $("#contactList").css("border", "");
            $("#msgAlert").empty(); // Limpiar alertas
            // Resaltar visualmente
            $("#contactList .list-group-item").removeClass('active');
            if (this.checked) {
                $(this).closest('.list-group-item').addClass('active');
            }
        });
        
        // Agregar el contacto a la lista (después de los contactos predeterminados)
        $("#contactList").append(nuevoContacto);
        
        // Guardar en localStorage si es un contacto nuevo
        if (saveToStorage) {
            saveContactToStorage(contact);
        }
        
        // Agregar a la lista de contactos cargados en esta sesión
        loadedContacts.push(contact.cuenta);
        
        return true;
    }
    
    // Función para guardar contacto en localStorage SIN DUPLICAR
    function saveContactToStorage(contact) {
        let storedContacts = JSON.parse(localStorage.getItem('contactList')) || [];
        
        // Verificar si el contacto ya existe en localStorage
        const contactExists = storedContacts.some(existingContact => 
            existingContact.cuenta === contact.cuenta || 
            existingContact.alias === contact.alias
        );
        
        if (!contactExists) {
            storedContacts.push(contact);
            localStorage.setItem('contactList', JSON.stringify(storedContacts));
            console.log("Contacto guardado en localStorage:", contact.nombre);
        } else {
            console.log("El contacto ya existe en localStorage:", contact.nombre);
        }
    }
    
    // Función para validar si el contacto ya existe (para el formulario)
    function contactExistsInStorage(contactToCheck) {
        const storedContacts = JSON.parse(localStorage.getItem('contactList')) || [];
        return storedContacts.some(contact => 
            contact.cuenta === contactToCheck.cuenta || 
            contact.alias === contactToCheck.alias
        );
    }
    
    // Cargar contactos solo una vez cuando se carga la página
    $(document).ready(function() {
        loadContacts();
    });
    
    // ============================================
    // MEJORAS DE EXPERIENCIA
    // ============================================
    // Al seleccionar contacto, quitar borde rojo
    $('input[name="contactoSeleccionado"]').change(function() {
        $("#contactList").css("border", "");
        $("#msgAlert").empty(); // Limpiar alertas
        // Resaltar visualmente
        $("#contactList .list-group-item").removeClass('active');
        if (this.checked) {
            $(this).closest('.list-group-item').addClass('active');
        }
    });
    
    // Al escribir en el monto, limpiar alertas
    $("#depositDecrease").on('input', function() {
        $("#msgAlert").empty(); // Limpiar alertas
    });
    
    // Botón para agregar contacto (abrir modal)
    $("#contactAdd").click(function() {
        $('#contactModal').modal('show');
    });
    
    // Formulario para agregar nuevo contacto
    $("#addContactForm").on("submit", function(e) {
        e.preventDefault();
        
        // Obtener valores del formulario
        const nombre = $("#newContactName").val().trim();
        const cbu = $("#newContactCBU").val().trim();
        const alias = $("#newContactAlias").val().trim();
        const banco = $("#newContactBank").val().trim();
        
        // Validaciones básicas
        if (!nombre || !cbu || !alias || !banco) {
            alert("Por favor, completa todos los campos");
            return;
        }
        
        // Validar formato de número de cuenta (solo números, mínimo 6 dígitos)
        if (!/^\d{6,}$/.test(cbu)) {
            alert("El número de cuenta debe tener al menos 6 dígitos numéricos");
            return;
        }
        
        // Crear objeto contacto
        const nuevoContacto = {
            nombre: nombre,
            cuenta: cbu,
            alias: alias,
            banco: banco
        };
        
        // Verificar si el contacto ya existe
        if (contactExistsInStorage(nuevoContacto)) {
            alert("Este contacto ya existe en tu lista (mismo número de cuenta o alias)");
            return;
        }
        
        // Agregar a la lista
        const added = addContactToList(nuevoContacto, true);
        
        if (added) {
            // Cerrar el modal y limpiar formulario
            $('#contactModal').modal('hide');
            $(this).trigger("reset");
            
            // Mostrar mensaje de éxito
            alert(`Contacto "${nombre}" agregado correctamente`);
            
            console.log(`Nuevo contacto agregado: ${nombre}`);
        } else {
            alert("El contacto no pudo ser agregado. Ya existe en la lista.");
        }
    });


});