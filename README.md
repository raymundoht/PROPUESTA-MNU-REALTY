# PROPUESTA-MNU-REALTY

# mnü Realty — rediseño web

Prototipo navegable de mnü Realty inspirado en la dirección visual oscura y arquitectónica seleccionada, con acentos dorados reducidos y el logo original.

## Páginas incluidas

- Inicio con búsqueda y propiedades destacadas
- Catálogo de venta y catálogo de renta, con filtros, orden y paginación
- Fichas de propiedad con descripción, características, financiamiento y galería
- Quiénes somos
- Propietarios
- Contacto

El catálogo contiene 109 propiedades en venta y 53 en renta. Las fichas reúnen 148 propiedades únicas. Las fotos y galerías apuntan al CDN original de EasyBroker; se necesita conexión a internet para verlas. Se usan las fotos de ficha disponibles y, cuando una propiedad no tiene galería publicada, se muestra la foto de su tarjeta.

## Ejecutar localmente

Requiere Node.js 20 o superior.

    npm ci
    npm run dev

Vite mostrará la dirección local de la vista previa.

Los formularios muestran una confirmación local y no envían información a EasyBroker. Los enlaces de teléfono y WhatsApp sí abren el medio de contacto indicado.
