
const dicc_notify = Object.freeze({

    // **************************************************** ERRORES ********************************************************************

    //                                ************ LOAD DATA EDIT *************
    Error_Notify_Edit: 'Tuvimos problemas al cargar los datos para Editar',

    //                                ************ STATUS 500 *************
    Error_Notify_ErrorServer: 'Ocurrio un error en el servidor',

    //                                ************ EXTRAS  *************
    Error_Notify_ErrorConexionServer: 'Error al conectarse al servidor',
    Error_Notify_ErrorSesionClose: 'Estamos teniendo problemas para cerrar la sesión',


    //                                ************ NOT FOUND BY IDs  *************


    //                                ************  NOT FOUND   *************


    //                                ************ DELETE *************
    Error_Notify_DelecteObject: 'Ocurrio un error al eliminar',

  //                                ************ DELETE RELATION *************


  //                             ************ CREATE *************



  //                             ************ USER *************


  // **************************************************** SUCCESS ********************************************************************

  //                                ************ DELETE *************
  Success_Notify_ConectionSuccess: 'Conexión exitosa',

    //                                ************ DELETE *************


    //                                ************ EDIT *************


    //                                ************ CREATE *************


    //                                ************ USER *************
    Success_Notify_ChangesPassword: 'Contraseña actualizada exitosamente.',

})

export const {

    // *** ERROR ***
    Error_Notify_Edit,
    Error_Notify_ErrorServer,
    Error_Notify_ErrorSesionClose,

    Error_Notify_ErrorConexionServer,

    Error_Notify_DelecteObject,

    // *** SUCCESS ***
    Success_Notify_ConectionSuccess,
    Success_Notify_ChangesPassword

}
    = dicc_notify
