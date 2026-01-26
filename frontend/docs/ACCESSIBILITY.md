# Guía de Accesibilidad

Este documento describe las mejoras de accesibilidad implementadas en la aplicación y cómo mantenerlas.

## Mejoras Implementadas

### 1. Atributos Alt en Imágenes

Todas las imágenes ahora tienen atributos `alt` descriptivos:

- **ImageCarousel**: Textos alternativos descriptivos basados en el contexto
- **ProductDetail**: Usa el nombre del producto en el alt
- **Productos**: Descripciones contextuales

**Ejemplo**:
```jsx
<img 
  src={product.imageUrl} 
  alt={getProductImageAlt(product, 'en la página de productos')}
/>
```

### 2. Labels Enlazados con Inputs

Todos los formularios usan `htmlFor` para enlazar labels con inputs:

```jsx
<label htmlFor="email">
  Email <span className="required-asterisk" aria-label="requerido">*</span>
</label>
<input 
  type="email" 
  id="email" 
  name="email"
  aria-required="true"
  autoComplete="email"
/>
```

### 3. Atributos ARIA

#### Navegación
- `aria-label` en elementos de navegación
- `aria-expanded` en menús desplegables
- `aria-hidden` para elementos decorativos
- `role="menubar"` y `role="menuitem"` en menús

#### Formularios
- `aria-required="true"` en campos requeridos
- `aria-describedby` para mensajes de error y ayuda
- `aria-labelledby` para grupos de campos
- `fieldset` y `legend` para grupos de radio buttons

#### Controles Interactivos
- `aria-label` en botones sin texto visible
- `aria-disabled` para elementos deshabilitados
- `aria-live` para regiones que cambian dinámicamente
- `role="group"` para controles relacionados

**Ejemplo**:
```jsx
<button
  onClick={handleClick}
  aria-label="Agregar producto al carrito"
  aria-disabled={isDisabled}
>
  <span aria-hidden="true">+</span>
</button>
```

### 4. Navegación por Teclado

- Todos los elementos interactivos son accesibles por teclado
- Orden de tabulación lógico
- Atrapamiento de foco en modales
- Skip links para saltar navegación

### 5. Contraste y Visibilidad

- Contraste mínimo de 4.5:1 para texto normal
- Contraste mínimo de 3:1 para texto grande
- Indicadores visuales claros para estados (focus, hover, active)
- Tamaño mínimo de 44x44px para elementos táctiles

### 6. Internacionalización (i18n)

Sistema de traducción configurado con `react-i18next`:

- Detección automática del idioma del navegador
- Soporte para español (es) e inglés (en)
- Fácil agregar más idiomas
- Traducciones organizadas por namespace

**Uso**:
```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('common.appName')}</h1>;
}
```

## Utilidades de Accesibilidad

### accessibility.js

Funciones helper disponibles en `src/utils/accessibility.js`:

- `getProductImageAlt()`: Genera alt descriptivo para imágenes de productos
- `getActionButtonAlt()`: Genera aria-label para botones de acción
- `getFormFieldAriaLabel()`: Genera aria-label para campos de formulario
- `announceToScreenReader()`: Anuncia mensajes a lectores de pantalla
- `focusFirstAccessibleElement()`: Enfoca el primer elemento accesible
- `trapFocus()`: Atrapa el foco en modales

## Estilos de Accesibilidad

### accessibility.css

Clases CSS disponibles:

- `.sr-only`: Oculta visualmente pero mantiene accesible para lectores de pantalla
- `.sr-only-focusable`: Muestra solo cuando está enfocado (skip links)
- `.required-asterisk`: Estilo para asteriscos de campos requeridos
- `.error-message[role="alert"]`: Estilos para mensajes de error
- `.form-group.has-error`: Estilos para campos con error

## Mejores Prácticas

### ✅ Hacer

- Usar `htmlFor` para enlazar labels con inputs
- Agregar `aria-label` a botones sin texto visible
- Usar `aria-required` en campos requeridos
- Proporcionar textos alternativos descriptivos para imágenes
- Usar `fieldset` y `legend` para grupos de campos relacionados
- Probar con lectores de pantalla (NVDA, JAWS, VoiceOver)
- Probar navegación solo con teclado
- Verificar contraste de colores

### ❌ Evitar

- No usar solo color para transmitir información
- No usar `alt=""` vacío a menos que la imagen sea decorativa
- No usar `aria-hidden="true"` en contenido importante
- No usar `tabindex` mayor que 0
- No crear elementos interactivos que no sean accesibles por teclado
- No usar placeholders como única etiqueta

## Testing de Accesibilidad

### Herramientas Recomendadas

1. **Lighthouse** (Chrome DevTools)
   - Ejecutar auditoría de accesibilidad
   - Objetivo: 90+ puntos

2. **axe DevTools** (Extensión del navegador)
   - Escanea automáticamente problemas de accesibilidad
   - Integración con CI/CD

3. **WAVE** (Web Accessibility Evaluation Tool)
   - Extensión del navegador
   - Reportes visuales de problemas

4. **Lectores de Pantalla**
   - NVDA (Windows, gratuito)
   - JAWS (Windows, de pago)
   - VoiceOver (macOS/iOS, incluido)
   - TalkBack (Android, incluido)

### Checklist de Accesibilidad

- [ ] Todas las imágenes tienen `alt` descriptivo
- [ ] Todos los inputs tienen labels enlazados
- [ ] Campos requeridos tienen `aria-required="true"`
- [ ] Mensajes de error tienen `role="alert"`
- [ ] Navegación funciona solo con teclado
- [ ] Contraste de colores cumple WCAG AA
- [ ] Formularios tienen validación accesible
- [ ] Modales atrapan el foco
- [ ] Skip links funcionan correctamente
- [ ] Textos se pueden aumentar hasta 200% sin problemas

## Internacionalización

### Agregar Nuevo Idioma

1. Crear archivo de traducción en `src/i18n/locales/[codigo].json`
2. Agregar el código de idioma en `i18n/config.js`:
   ```javascript
   supportedLngs: ['es', 'en', 'pt'], // Agregar 'pt' para portugués
   ```
3. Importar y agregar recursos:
   ```javascript
   import ptTranslations from './locales/pt.json';
   
   resources: {
     // ... otros idiomas
     pt: {
       common: ptTranslations.common || {},
       // ...
     },
   }
   ```

### Usar Traducciones

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  // Traducción simple
  const title = t('common.appName');
  
  // Traducción con interpolación
  const message = t('cart.removeItem', { name: product.name });
  
  // Cambiar idioma
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('es')}>Español</button>
    </div>
  );
}
```

## Referencias

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Accessibility Checklist](https://webaim.org/standards/wcag/checklist)
- [react-i18next Documentation](https://react.i18next.com/)
