// auth-check.js
(function() {
    const sesion = localStorage.getItem("isLoggedIn");
    
    // Si no existe la sesión, redirigir antes de que se pinte el HTML
    if (sesion !== "true") {
        window.location.href = "login.html";
    }
})();

/*
$(function(){

});
*/