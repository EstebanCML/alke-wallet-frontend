$(function(){
    $('#deposit_1').click(function (){ 
    // Redirigir a sitio
    window.location.href = "deposit.html";
    });

    $('#sendmoney_1').click(function (){ 
    // Redirigir a sitio
    window.location.href = "sendmoney.html";
    });

    $('#transactions_1').click(function (){ 
    // Redirigir a sitio
    window.location.href = "transactions.html";
    });

    // bnt cerra sesion y borrar datos del localStore
    $('#logOut').click(function (){ 
        // Borramos la credencial
    localStorage.removeItem("isLoggedIn");
    // Opcional: borrar también el usersi lo guardaste
    localStorage.removeItem("userLogin"); 
    
    // Redirigir al login
    window.location.href = "login.html";
    });

    const presentBalance = parseFloat(localStorage.getItem('presentBalance')) || 50000;

    $('#currentBalance').text(`$${presentBalance.toLocaleString('es-ES')}`);


});