# Frontend Agent Rules

- Toda función nueva debe incluir un bloque de comentario JSDoc encima en inglés.
- Todas las variables y funciones deben escribirse en camelCase.
- Usa nombres descriptivos y en inglés para variables, funciones y componentes.
- Los componentes Vue deben estar en PascalCase y los archivos en kebab-case.
- Ubica los agentes o servicios en la carpeta `src/assets/js/agents/` para mantener la organización.
- Prefiere la inyección de dependencias mediante props o provide/inject en Vue.
- Usa constantes para valores fijos en vez de literales mágicos.
- Define la visibilidad adecuada para métodos y propiedades (privado/público en clases o módulos).
- Si el agente interactúa con una API, documenta los endpoints y parámetros esperados en el JSDoc.
- Usa try/catch y maneja errores mostrando mensajes claros al usuario o lanzando excepciones personalizadas.
- Los tests deben ubicarse en `tests/unit/agents/` para lógica de negocio y en `tests/e2e/` para flujos completos.
- El nombre del método de test debe reflejar el método probado y el caso de uso (ejemplo: `shouldReturnSumWhenAddingNumbers`).
- Usa Jest y las utilidades de Vue Test Utils para pruebas unitarias y de componentes.
- Documenta ejemplos de uso en los comentarios JSDoc de cada clase, función o método relevante.

## Convención para mensajes de commit
- Los commits generados deben tener una estructura clara:
  - Título breve y descriptivo en presente (máx. 72 caracteres).
  - Línea en blanco.
  - Descripción detallada de cada funcionalidad nueva, cambio o fix.
  - Si hay varias funcionalidades nuevas, lista cada una con un punto o guion.
  - Si aplica, referencia archivos, componentes o métodos modificados.
  - Ejemplo:
    ```
    Add UserAgent with login method

    - Implement UserAgent class in src/assets/js/agents/
    - Add login() method to authenticate users
    - Include JSDoc and unit test for login()
    ```

Esto asegura trazabilidad y claridad en el historial de cambios.

## Buenas prácticas para funciones testeables
- Cada función pública debe ser atómica y tener una única responsabilidad.
- Evita efectos secundarios inesperados (no modificar variables globales ni estados ocultos).
- Usa dependencias inyectadas para facilitar el uso de mocks en los tests.
- Retorna valores claros y predecibles.
- Documenta y prueba los casos en que la función lanza excepciones.
- Los datos de entrada y salida deben ser fácilmente mockeables (objetos, arrays, DTOs, etc.).

---
Recuerda mantener los tests y la documentación actualizados para cada función pública o componente relevante.
