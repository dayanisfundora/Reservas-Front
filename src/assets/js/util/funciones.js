/* eslint-disable no-unreachable */
// IMPORT
import { api } from 'src/boot/axios'
import { ref, reactive } from 'vue'
import { Error, Success } from './notify'

const title = ref('')

// Funcion para cargar todos los datos de una tabla
const loadGet = async (endpoint) => {
    return await api
        .get(endpoint)
        .then((r) => {
            return r.data.data || []
        })
        .catch((error) => {
            error.response === undefined
                ? Error(error.message)
                : Error(error.response.data.mensajeError)
        })
}
// Funcion que se utiliza para cargar los datos en las opciones de los select
const loadSelectList = async (endpoint) => {
    return await api
        .get(endpoint)
        .then((r) => {
            return r.data.result
        })
        .catch((error) => {
            error.response === undefined
                ? Error(error.message)
                : Error(error.response.data.mensajeError)
        })
}
// Funcion para obtener una lista pasandole el endpoint y el arreglo
const load = async (endpoint, list) => {
    await api
        .get(endpoint)
        .then((r) => {
            list.value = r.data.result.elementos
        })
        .catch((error) => {
            error.response === undefined
                ? Error(error.message)
                : Error(error.response.data.mensajeError)
        })
}
// Funcion para guardar y editar
const saveData = async (endpoint, object, load, close, dialogLoad, shouldClose = true) => {
  const responseObj = reactive({
    result: null,
    errorMessage: null,
  })

  dialogLoad.value = true

  // Preparar datos para envío
  let dataToSend
  const config = {}

    // Siempre usar FormData para actualizaciones que pueden incluir archivos
    if (object.id || object.logo instanceof File) {
        dataToSend = new FormData()

        for (const key in object) {
            if (object[key] !== undefined && object[key] !== null) {
                if (key === "logo" && object.logo instanceof File) {
                    dataToSend.append("logo", object.logo)
                } else {
                    dataToSend.append(key, object[key])
                }
            }
        }

        config.headers = { "Content-Type": "multipart/form-data" }
    } else {
        dataToSend = object
    }

  try {
    let response

    if (object.id) {
      // Para actualizaciones, usar POST con _method=PUT si es FormData
      if (dataToSend instanceof FormData) {
        dataToSend.append("_method", "PUT")
        response = await api.post(`/${endpoint}/${object.id}`, dataToSend, config)
      } else {
        response = await api.put(`/${endpoint}/${object.id}`, dataToSend, config)
      }
    } else {
      response = await api.post(`/${endpoint}`, dataToSend, config)
    }

        responseObj.result = response
        Success(object.id ? "El elemento ha sido modificado correctamente" : "El elemento ha sido creado correctamente")
        await load()
        // Only close the dialog if caller requested it
        if (shouldClose && typeof close === 'function') {
                await close()
        }
        dialogLoad.value = false
    return responseObj
  } catch (error) {
    responseObj.errorMessage = error
    console.error("Error en saveData:", error)
    await load()
        if (shouldClose && typeof close === 'function') {
                await close()
        }
        dialogLoad.value = false
    return responseObj
  }
}

// Funcion de Eliminar
const deleteItem = async (endpoint, id, load, dialogLoad) => {
    const responseObj = reactive({
        result: null,
        errorMessage: null
    })
    dialogLoad.value = true
    return await api.delete(`/${endpoint}/${id}`).then(async (response) => {
        responseObj.result = response
        Success.call(this, 'El elemento ha sido eliminado correctamente')
        setTimeout(async () => {
            await load()
            dialogLoad.value = false
        })
        return responseObj
    }).catch(async (error) => {
        responseObj.errorMessage = error
        dialogLoad.value = false
        return responseObj
    })
}
// Funcion para Obtener datos por id esto se utiliza generalmente para cargar los datos del formulario
const getItem = async (endpoint, id, object, dialogLoad, dialog) => {
    dialogLoad.value = true
    await api.get(`${endpoint}/${id}`)
        .then(r => {
            Object.assign(object, r.data.data)
            title.value = `Editar ${endpoint}`
            dialog.value = true
        }).catch((error) => {
            error.response === undefined ? Error(error.message) : Error(error.response.data.mensajeError)
        })
    dialogLoad.value = false
}
/**
 * Checks if a value is repeated in a list of objects for a given property.
 * Comparison is case-insensitive and ignores leading/trailing spaces.
 * @param {string|number} val - Value to check.
 * @param {string} property - Property name to compare.
 * @param {object} object - Current object (to exclude by id).
 * @param {Array} items - List of objects.
 * @returns {boolean}
 */
const isValueRepeated = (val, property, object, items) => {
    // Si el valor está vacío, no validar (otros validadores se encargan)
    if (val === null || val === undefined || val === '') {
        return false;
    }
    
    let normalizedVal = typeof val === 'string' ? val.trim().toLowerCase() : val;
    
    // Si después de normalizar queda vacío, no validar
    if (typeof val === 'string' && normalizedVal === '') {
        return false;
    }
    
    return items.some((e) => {
        let eVal = e[property];
        
        // Si el valor del elemento está vacío, no comparar
        if (eVal === null || eVal === undefined || eVal === '') {
            return false;
        }
        
        if (typeof eVal === 'string') {
            eVal = eVal.trim().toLowerCase();
            if (eVal === '') {
                return false;
            }
        }
        
        // Si estamos editando (object.id existe), excluir el registro actual
        if (object.id && object.id === e.id) {
            return false;
        }
        
        // Comparar valores normalizados
        return eVal === normalizedVal;
    });
}

// Funcion para resetear los campos del dialogo y cerrarlo
const closeDialog = (object, initialObject, myForm, dialog) => {
    // Only reset validation if myForm is provided and has the method
    try {
        if (myForm && myForm.value && typeof myForm.value.resetValidation === 'function') {
            myForm.value.resetValidation()
        }
    } catch (e) {
        console.warn('closeDialog: myForm resetValidation failed or myForm is null', e)
    }

    // Eliminar propiedades de 'object' que no están en 'initialObject'
    // Object.keys(object).forEach(key => {
    //     if (!initialObject.hasOwnProperty(key)) {
    //         delete object.key;
    //     }
    // });

    // Asignar propiedades de 'initialObject' a 'object'
    Object.assign(object, initialObject);

    delete object.id;

    dialog.value = false
    // if (object.id !== null || object.id !== '' || object.id !== undefined) object.id = null
}
// Funcion para Filtrado
const filterOptions = (val, update, options, filterField, array) => {
    update(
        () => {
            const needle = val ? val.toLowerCase() : ''
            options = array.filter(
                (v) => v[filterField] && v[filterField].toLowerCase().indexOf(needle) >= 0
            )
        },
        (ref) => {
            if (
                val !== '' &&
                ref.options.length > 0 &&
                ref.getOptionIndex() === -1
            ) {
                ref.moveOptionSelection(1, true)
                ref.toggleOption(ref.options[ref.optionIndex], true)
            }
        }
    )
    return options
}
// Función para validar carnet
const validateIdCard = (val) => {
    if (val.length !== 11) {
        return false
    }

    const month = parseInt(val.substr(2, 2), 10)

    if (month < 1 || month > 12) {
        return false
    }

    const daysInMonth = new Date(2024, month, 0).getDate()

    const dayStr = val.substr(4, 2)
    const day = parseInt(dayStr, 10)

    if (day < 1 || day > daysInMonth) {
        return false
    }

    return true
}
// Funcion para validar letras y caracteres especiales
const validateLettersAndSpecialChars = (val) => {
    const regex = /^[A-Za-záéíóúÁÉÍÓÚñÑ\s#&]+$/

    return regex.test(val)
}
// Funcion para validar correo
const validateEmail = (val) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    return regex.test(val)
}
// Funcion para validar solo numeros
const validateOnlyNumbers = (val) => {
    const regex = /^[0-9]+$/

    return regex.test(val)
}

// Función general para imprimir PDF
const printPdf = async (endpoint, data = null) => {
    try {
        const response = await api.post(endpoint, data, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export {
    saveData,
    closeDialog,
    load,
    getItem,
    validateOnlyNumbers,
    validateEmail,
    filterOptions,
    deleteItem,
    validateIdCard,
    isValueRepeated,
    validateLettersAndSpecialChars,
    loadGet,
    loadSelectList,
    printPdf,
}
