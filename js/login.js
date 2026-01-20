$(function () {
    $("#loginForm").on("submit", function (evento) {

        const USER_VALIDO = "admin";
        const PASS_VALIDA = "123456";
        const $alerta = $("#mensajeAlerta");
        evento.preventDefault(); // evitar la recarga de la pagina
        //2  capturar los datos de login
        const user = $("#userInput").val();
        const pass = $("#passInput").val();
        //3 comprobacion de login

        if (user === USER_VALIDO && pass === PASS_VALIDA){
            $alerta.html(`
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <div>✅ ¡Acceso concedido! Bienvenido.</div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
                `);
                // GUARDAMOS LA SESIÓN: Creamos una llave llamada 'autenticado'
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("userLogin", user); // Opcional: para mostrar su nombre luego


            //espera 2 segundos (2000ms) y redireccionamos
            setTimeout(() => {
                window.location.href = "menu.html";
            }, 2000);
            // Aquí podrías redirigir: window.location.href = "inicio.html";
        } else {
            // Caso: ERROR
            $alerta.html(`
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <div>❌ Correo o contraseña incorrectos.</div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
                `);
        }
 
  });
});



/*       $("#tablaUsuarios").append(`
                    <tr>
                        <td>${nombre}</td>
                        <td>${edad}</td>
                        <td>acciones</td>
                    </tr>
                    `);
        //4.- limpiar los inputs
        $("#nombre").val("");
        $("#edad").val("");

*/