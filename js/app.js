//SIMULADOR ADMINISTRADOR DE CITAS

//Selección HTML
const formularioCita = document.querySelector('#formulario-cita');
const formularioInput = document.querySelector('input[type="submit"]')
const paciente = document.querySelector('#paciente');
const propietario = document.querySelector('#propietario');
const email = document.querySelector('#email');
const fecha = document.querySelector('#fecha');
const sintomas = document.querySelector('#sintomas');
const citasInterfaz = document.querySelector('#citas');

//Parametros
let editando = false;
let esquema;

//Objeto Campos
const citaObj = {
    id: generarID(),
    paciente: '',
    propietario: '',
    email: '',
    fecha: '',
    sintomas: ''
}

//Clases
class Notificacion {
    constructor(texto, tipo) {
        this.texto = texto,
        this.tipo = tipo
    }

    //<-->//
    mostarAlerta() {
        const divAlert = document.createElement('div');
        divAlert.classList.add('alert', 'text-center', 'w-full', 'p-3', 'text-white', 'my-5', 'uppercase', 'font-bold', 'text-sm'); //Tailwind clases
        divAlert.textContent = this.texto;

        const alertaPrevia = document.querySelector('.alert');
        alertaPrevia?.remove(); 

        this.tipo === 'error' ? divAlert.classList.add('bg-red-500') : divAlert.classList.add('bg-green-500');

        formularioCita.parentElement.insertBefore(divAlert, formularioCita);

        setTimeout(() => {
            divAlert.remove();
        }, 2000)
    }
}

//--//
class InterfaceUser {
    establecerCitas() {
        //Base de Datos
        getRegistros();

        formularioCita.reset();
        this.reiniciarFormulario();
    }

    //<-->//
    validarRegistros(registros) {
        if(registros > 0) {
            citasInterfaz.innerHTML = '';
        } else {
            citasInterfaz.innerHTML = `<p class="text-xl mt-5 mb-10 text-center">No Hay Pacientes</p>`;
        }
    }

    //<-->//
    cargarEdicion(cita) {
        editando = true;
        formularioInput.value = 'Guardar Cambios';
    
        Object.assign(citaObj, cita);
        
        paciente.value = cita.paciente;
        propietario.value = cita.propietario;
        email.value = cita.email;
        fecha.value = cita.fecha;
        sintomas.value = cita.sintomas;
    }

    //<-->//
    reiniciarFormulario() {
        Object.assign(citaObj, {
            id: generarID(),
            paciente: '',
            propietario: '',
            email: '',
            fecha: '',
            sintomas: '',
        })
    }
}

//Instancia
const interfaceUser = new InterfaceUser();

//Eventos
//.load(): Evento que se ejeucta cuando window haya cargado por completo, similiar a 'DOMContentLoaded'.
window.onload = () => {
    cargarEventos();

    setDB();
}

//--//
function cargarEventos() {
    paciente.addEventListener('change', e => datosCita(e))

    propietario.addEventListener('change', e => datosCita(e))

    email.addEventListener('change', e => datosCita(e))

    fecha.addEventListener('change', e => datosCita(e))

    sintomas.addEventListener('change', e => datosCita(e))

    formularioCita.addEventListener('submit', e => submitCita(e))
}

//Funciones
function datosCita(e) {
    const nameInput = e.target.name;
    citaObj[nameInput] = e.target.value.trim();
}

//--//
function submitCita(e) {
    e.preventDefault();

    if(Object.values(citaObj).includes('')) {
        //Intancia
        const notificacion = new Notificacion('Todos los campos son obligatorios', 'error');
        notificacion.mostarAlerta();
        return;
    }

    if(editando) {
        //Base de datos
        setEdicion({...citaObj});
        return;
    }

    setTimeout(() => {
        interfaceUser.establecerCitas();

        //Intancia
        const notificacion = new Notificacion('Paciente registrado', 'exito');
        notificacion.mostarAlerta();

        btnEstado();
    }, 2000)

    //Base de Datos
    setRegistro({...citaObj});
}

//--//
function generarID() {
    return Date.now();
}

//--Funciones Base de Datos--//
function setDB() {
    const baseDatos = window.indexedDB.open('clientes', 1);

    baseDatos.onerror = () => console.log('ERROR: creación de Base de Datos');

    baseDatos.onsuccess = () => {
        console.log('EXITO: creación de Base de Datos');

        esquema = baseDatos.result;

        interfaceUser.establecerCitas();
    }

    baseDatos.onupgradeneeded = (e) => {
        const setEsquema = e.target.result;

        const tabla = setEsquema.createObjectStore('citas', {
            keyPath: 'id',
            unique: true,
        });

        tabla.createIndex('paciente', 'paciente', { unique: false });
        tabla.createIndex('propietario', 'propietario', { unique: false });
        tabla.createIndex('email', 'email', { unique: false });
        tabla.createIndex('fecha', 'fecha', { unique: false });
        tabla.createIndex('sintomas', 'sintomas', { unique: false });

        console.log('EXITO: creación de Esquema');
    }
}

//--//
function setRegistro(objRegistro) {
    const setTransaccion = esquema.transaction(['citas'], 'readwrite');

    const getTabla = setTransaccion.objectStore('citas');

    getTabla.add(objRegistro);

    setTransaccion.oncomplete = () => {
        console.log('EXITO: Registro establecido');

        //Intancia
        const notificacion = new Notificacion('Guardando', 'exito');
        notificacion.mostarAlerta();

        btnEstado();
    }
    setTransaccion.onerror = () => console.log('ERROR: Registro no establecido');
}

//--//
function setEdicion(objRegistro) {
    const setTransaccion = esquema.transaction(['citas'], 'readwrite');
    const getTabla = setTransaccion.objectStore('citas');
     getTabla.put(objRegistro);

    setTransaccion.oncomplete = () => {
        console.log("EXITO: Edición Guardada");

        editando = false;
        formularioInput.value = 'Registrar Paciente';

        //Intancia
        const notificacion = new Notificacion('Edición guardada', 'exito');
        notificacion.mostarAlerta();

        interfaceUser.establecerCitas();
    }

    setTransaccion.onerror = () => console.log('ERROR: Error en guardar edición');
}

//--//
function setEliminacion(citaId) {
    const setTransaccion = esquema.transaction(['citas'], 'readwrite');
    const getTabla = setTransaccion.objectStore('citas');
    getTabla.delete(citaId);

    setTransaccion.oncomplete = () => {
        console.log(`EXITO: Cita ${citaId} eliminada`);
        interfaceUser.establecerCitas();
    }

    setTransaccion.onerror = () => console.log('ERROR: Error en eliminar registro');
}

//--//
function getRegistros() {
    const setTransaccion = esquema.transaction(['citas']);
    const getTabla = setTransaccion.objectStore('citas');

    //.count(): Método que retorna la infomación general de los registros
    const totalRegistros = getTabla.count();
    totalRegistros.onsuccess = () => {
        //.result: Retorna el número de registros
        interfaceUser.validarRegistros(totalRegistros.result);
    }

    /*
    .openCursor(): Devuelve un objeto Cursor (puntero al conjunto de elementos), aplicando un método de 
    interación sobre los registros.
    Es un método de interación dinámico, es decir realiza un seguimiento por medio de la KeyPath-Primaria
    y guarda toda la información de las operaciones efectuadas con ese registro. Cada llamada al método
    actualizará el total de operaciones de cada registro anterior, ejecutando la nueva iteración.
    */
    const peticionRegistros = getTabla.openCursor();
    peticionRegistros.onsuccess = (e) => {
        //.target: Selección del objeto DBRequest (Objeto General de Petición de los Registros)
        //.result: Seleccion del objeto DBCursorWithValue (Selección General del Registro - Contiene métodos)
        const registro = e.target.result;
        
        if(registro) {
            const {paciente, propietario, email, fecha, sintomas} = registro.value;

            const divCitas = document.createElement('div');
            divCitas.classList.add('mx-5', 'my-10', 'bg-white', 'shadow-md', 'px-5', 'py-10', 'roudend-xl');

            const pacienteNew = document.createElement('p');
            pacienteNew.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case');
            pacienteNew.innerHTML = `<span class="font-bold uppercase">Paciente: </span> ${paciente}`;

            const propietarioNew = document.createElement('p');
            propietarioNew.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case');
            propietarioNew.innerHTML = `<span class="font-bold uppercase">Propietario: </span> ${propietario}`;

            const emailNew = document.createElement('p');
            emailNew.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case');
            emailNew.innerHTML = `<span class="font-bold uppercase">Email: </span> ${email}`;

            const fechaNew = document.createElement('p');
            fechaNew.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case');
            fechaNew.innerHTML = `<span class="font-bold uppercase">Fecha: </span> ${fecha}`;

            const sintomasNew = document.createElement('p');
            sintomasNew.classList.add('font-normal', 'mb-3', 'text-gray-700', 'normal-case');
            sintomasNew.innerHTML = `<span class="font-bold uppercase">Sintomas: </span> ${sintomas}`;

            //Sección de botones
            const divBotones = document.createElement('div');
            divBotones.classList.add('flex', 'justify-between', 'mt-10');

            const btnEditar = document.createElement('button');
            btnEditar.classList.add('py-2', 'px-5', 'bg-indigo-600', 'hover:bg-indigo-700', 'text-white', 'font-bold', 'uppercase', 'rounded-lg', 'flex', 'items-center', 'gap-2', 'btn-editar');
            btnEditar.innerHTML = 'Editar <svg fill="none" class="h-5 w-5" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>'
            const registroValue = registro.value;
            btnEditar.onclick = () => interfaceUser.cargarEdicion(registroValue);

            const btnEliminar = document.createElement('button');
            btnEliminar.classList.add('py-2', 'px-10', 'bg-red-600', 'hover:bg-red-700', 'text-white', 'font-bold', 'uppercase', 'rounded-lg', 'flex', 'items-center', 'gap-2', 'btn-eliminar');
            btnEliminar.innerHTML = 'Eliminar <svg fill="none" class="h-5 w-5" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
            const citaId = registro.value.id;
            btnEliminar.onclick = () => setEliminacion(citaId);
            //--

            divBotones.appendChild(btnEditar);
            divBotones.appendChild(btnEliminar);

            divCitas.appendChild(pacienteNew);
            divCitas.appendChild(propietarioNew);
            divCitas.appendChild(emailNew);
            divCitas.appendChild(fechaNew);
            divCitas.appendChild(sintomasNew);
            divCitas.appendChild(divBotones);
        
            citasInterfaz.appendChild(divCitas);

            //.continue(): Metodo tipo 'next' para el objeto petición
            registro.continue();
        }
    }
}

function btnEstado() {
    if(formularioInput.classList.contains('cursor-pointer')) {
        formularioInput.classList.remove('cursor-pointer');
        formularioInput.classList.add('cursor-not-allowed');
    } else {
        formularioInput.classList.remove('cursor-not-allowed');
        formularioInput.classList.add('cursor-pointer');
    }
}
