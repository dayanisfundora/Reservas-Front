// VALIDACIONES FORMS
// #region  VALIDATE FORMS
const validateForms = Object.freeze({
    string: (value) => {
        if (value === null || value === '' || value === undefined) {
            return 'El campo es obligatorio'
        }
        return true
    },
    onlyLetter_Number: (value) => {
        // Permite letras, números, espacios, puntos y comas
        const pattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s.,;]+$/;
        if (!pattern.test(value)) {
            return 'Por favor, ingresa solo letras, números, puntos y comas.';
        }
        return true;
    },

    onlyLetter: (value) => {
        const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;
        if (!pattern.test(value)) {
            return 'Por favor, ingresa solo letras.';
        }
        return true;
    },

    onlyLetter_Number_Caracter: (value) => {
        const pattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s.,!?@#$%^&*()\-_+=;:'"<>[\]{}|\\/]+$/;
        if (!pattern.test(value)) {
            return 'Por favor, ingresa solo letras, números y caracteres especiales.';
        }
        return true;
    },

    onlyNumber_SpecialChars: (value) => {
        const pattern = /^[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
        if (!pattern.test(value)) {
            return 'Por favor, ingresa solo números y caract. esp.';
        }
        return true;
    },
    onlyLetter_Slach: (value) => {
        const pattern = /^[a-zA-Z0-9/s]+$/;
        if (!pattern.test(value)) {
            return 'Por favor, ingresa solo letras y barras.';
        }
        return true;
    },
    only_Number: (value) => {
        if (typeof value === 'number') {
            return true;
        }
        const pattern = /^[0-9]+$/;
        if (!pattern.test(value)) {
            return 'Por favor, ingresa solo números.';
        }
        return true;
    },
    onlyLetter_Number_Accents: (value) => {
        const pattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s]+$/;
        if (!pattern.test(value)) {
            return 'Por favor, ingresa solo letras, números, tildes o diéresis.';
        }
        return true;
    },
    email: (value) => {
        if (value === null || value === undefined || value.trim() === '') {
            return true;
        }
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(value)) {
            return 'Por favor, ingresa una dirección de correo electrónico válida.';
        }
        return true;
    },
    // Validación para números telefónicos cubanos e internacionales

    // Validación que solo se ejecuta al finalizar la escritura
    phone: (val) => {
        if (val === null || val === undefined || val.trim() === '') {
            return true;
        }

        // Eliminar todos los caracteres que no sean dígitos o el signo +
        const cleanPhone = val.replace(/[^\d+]/g, '');

        // Patrón estricto para números internacionales
        const strictInternationalPattern = /^\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/;

        // Patrón para números locales
        const localPattern = /^[0-9]{6,15}$/;

        // Verificar si es un número internacional válido
        const isInternational = strictInternationalPattern.test(val);

        // Verificar si es un número local válido
        const isLocal = localPattern.test(cleanPhone);

        if (isInternational || isLocal) {
            return true;
        }

        return 'Formato inválido. Ejemplos válidos: +5351234567, 51234567, +12125551234';
    },
    validateFilledFields: (fieldList) => {
        for (let i = 0; i < fieldList.length; i++) {
            let field = Object.values(fieldList[i])[0];

            if (Array.isArray(field)) {
                if (field.length === 0) {
                    return false;
                }
            } else {
                if (field === null || field === "") {
                    return false;
                }
            }
        }
        return true;
    },
    compareJSONObjects: (obj1, obj2) => {
        const jsonObj1 = JSON.stringify(obj1, Object.keys(obj1).sort());
        const jsonObj2 = JSON.stringify(obj2, Object.keys(obj2).sort());

        if (jsonObj1 === jsonObj2) {
            return deepCompareObjects(obj1, obj2)
        }
    },

    deepCompareObjects: (obj1, obj2) => {
        if (typeof obj1 !== "object" || typeof obj2 !== "object") {
            return obj1 === obj2
        }
        if (obj1 === null || obj2 === null) {
            return obj1 === obj2
        }
        if (Object.keys(obj1).length !== Object.keys(obj2).length) {
            return false
        }
        for (let key in obj1) {
            if (
                !obj2.hasOwnProperty(key) ||
                !validateForms.deepCompareObjects(obj1[key], obj2[key])
            ) {
                return false
            }
        }
        return true
    },
    decimal2: (value) => {
        // Allows integers or numbers with up to 2 decimal places, accepts a period or comma as a decimal separator
        const pattern = /^-?\d+(?:[.,]\d{0,2})?$/;
        if (value === null || value === '' || value === undefined) {
            return 'El campo es obligatorio';
        }
        if (!pattern.test(value)) {
            return 'Por favor, ingrese un número con hasta 2 decim.';
        }
        return true;
    },

    decimal3: (value) => {
        // Si está vacío, es válido (no obligatorio)
        if (value === null || value === '' || value === undefined) {
            return true;
        }
        // Permite enteros o hasta 2 decimales, con punto o coma
        const pattern = /^-?\d+(?:[.,]\d{0,2})?$/;
        if (!pattern.test(value)) {
            return 'Por favor, ingresa un número con hasta 2 decimales.';
        }
        return true;
    },

    // Validación de porciento
    percent: (value) => {
        if (value === null || value === '' || value === undefined) {
            return 'El campo es obligatorio';
        }
        // Permite valores entre 0 y 100, con hasta 2 decimales
        const pattern = /^(100(\.0{1,2})?|(\d{1,2})(\.\d{1,2})?)$/;
        if (!pattern.test(value)) {
            return 'Por favor, ingresa un porcentaje válido entre 0 y 100.';
        }
        return true;
    },
    noNegativeNumber: (value) => {
        if (value === null || value === '' || value === undefined) {
            return 'El campo es obligatorio';
        }
        const pattern = /^\d+(\.\d+)?$/;
        if (!pattern.test(value)) {
            return 'El valor de la OC excede el valor del contrato.';
        }
        return true;
    },
})

export const { string, noNegativeNumber, onlyLetter_Number_Caracter, percent, onlyLetter, onlyLetter_Slach, onlyNumber_SpecialChars, onlyLetter_Number, validateFilledFields, compareJSONObjects, deepCompareObjects, decimal2, decimal3, email, phone, onlyLetter_Number_Accents, only_Number } = validateForms;


// #endregion VALIDATE FORMS
