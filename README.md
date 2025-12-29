# 🎵 Luxe Audio - Reproductor de Música Elegante

Un reproductor de música web moderno y sofisticado con diseño minimalista en negro azabache y acentos amarillo suave. Construido con tecnologías web nativas para una experiencia de audio premium.

![Luxe Audio](https://img.shields.io/badge/Luxe%20Audio-v1.0.0-fbbf24?style=for-the-badge&logo=music&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Características Principales

### 🎨 **Diseño Elegante**
- **Tema único**: Negro azabache con acentos amarillo suave moderno
- **Interfaz minimalista**: Sin elementos innecesarios, solo funcionalidad esencial
- **Icono subwoofer**: Identidad musical apropiada
- **Gradientes suaves**: Efectos visuales elegantes y modernos
- **Responsive**: Adaptable a diferentes tamaños de pantalla

### 🎧 **Funcionalidades de Audio**
- **Reproducción MP3 completa**: Soporte nativo para archivos MP3
- **Amplificador hasta 200%**: Como VLC, usando Web Audio API real
- **Lectura de metadatos**: Extrae título, artista, álbum, año y carátulas
- **Carátulas embebidas**: Muestra artwork extraído de archivos MP3
- **Duración precisa**: Carga correcta de duración de pistas

### 📚 **Organización Inteligente**
- **Organización automática**: Por álbumes y artistas
- **Vista de álbum detallada**: Con lista de pistas y botón reproducir
- **Filtros**: Todas las canciones, artistas, álbumes
- **Búsqueda en tiempo real**: Por título, artista o álbum

### 🎮 **Controles Avanzados**
- **Controles completos**: Play/pause, anterior/siguiente
- **Shuffle y repeat**: Modos aleatorio y repetición
- **Barra de progreso**: Interactiva con seek
- **Control de volumen**: Con indicador de porcentaje
- **Cola de reproducción**: Gestión avanzada de queue

### 🖱️ **Experiencia de Usuario**
- **Drag & Drop**: Carga archivos arrastrando y soltando
- **Atajos de teclado**: Control rápido con teclas
- **Notificaciones elegantes**: Feedback visual para todas las acciones
- **Hover refinados**: Solo cambios de color, sin deformaciones
- **Animaciones suaves**: Transiciones fluidas y profesionales

## 🚀 **Tecnologías Utilizadas**

### **Frontend**
- **HTML5**: Estructura semántica moderna
- **CSS3**: Variables CSS, Grid, Flexbox, gradientes
- **JavaScript ES6+**: Clases, async/await, módulos
- **Web Audio API**: Amplificación real de audio
- **Font Awesome**: Iconografía profesional
- **Google Fonts**: Tipografía Inter

### **Librerías**
- **jsmediatags**: Lectura de metadatos MP3
- **Web Audio API**: Procesamiento de audio avanzado

## 📁 **Estructura del Proyecto**

```
music-player/
├── index.html          # Estructura principal
├── styles.css          # Estilos y diseño
├── script.js           # Lógica de la aplicación
└── README.md           # Documentación
```

## 🛠️ **Instalación y Uso**

### **Requisitos**
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Soporte para Web Audio API
- JavaScript habilitado

### **Instalación**
1. **Clona o descarga** el proyecto
2. **Abre** `index.html` en tu navegador
3. **¡Listo!** No requiere instalación adicional

### **Uso**
1. **Carga música**: Arrastra archivos MP3 o usa el botón "Agregar música"
2. **Explora**: Navega por álbumes, artistas o todas las canciones
3. **Reproduce**: Haz clic en cualquier canción o álbum
4. **Controla**: Usa los controles de reproducción o atajos de teclado
5. **Amplifica**: Sube el volumen hasta 200% si es necesario

## ⌨️ **Atajos de Teclado**

| Tecla | Acción |
|-------|--------|
| `Espacio` | Play/Pause |
| `←` | Canción anterior |
| `→` | Canción siguiente |
| `Ctrl+S` | Toggle shuffle |
| `Ctrl+R` | Toggle repeat |

## 🎨 **Paleta de Colores**

| Color | Hex | Uso |
|-------|-----|-----|
| Negro Azabache | `#000000` | Fondo principal |
| Gris Oscuro | `#111111` | Superficies |
| Amarillo Suave | `#fbbf24` | Acentos principales |
| Amarillo Claro | `#fcd34d` | Hover states |
| Naranja Suave | `#fb923c` | Acentos secundarios |
| Verde Esmeralda | `#10b981` | Estados de éxito |

## 🌟 **Características Únicas**

### **Amplificador Real**
- Implementación de Web Audio API
- Ganancia hasta 200% como VLC
- Indicador visual de amplificación
- Notificaciones de advertencia

### **Diseño Sin Deformaciones**
- Hover effects que solo cambian colores
- Altura consistente en listas
- Sin escalas o transformaciones molestas

### **Interfaz Limpia**
- Eliminación de elementos no funcionales
- Solo características esenciales
- Experiencia enfocada en la música

## 📱 **Responsive Design**

- **Desktop**: Experiencia completa con sidebar
- **Tablet**: Layout adaptado con controles optimizados
- **Mobile**: Interfaz simplificada y táctil

## 🔧 **Personalización**

### **Colores**
Modifica las variables CSS en `:root` para cambiar la paleta:

```css
:root {
    --primary-color: #fbbf24;
    --primary-hover: #fcd34d;
    --background-dark: #000000;
    /* ... más variables */
}
```

### **Funcionalidades**
El código está modularizado en clases para fácil extensión:

```javascript
class MusicPlayer {
    // Métodos organizados por funcionalidad
    // Fácil de extender y modificar
}
```

## 🎯 **Casos de Uso**

- **Uso personal**: Reproductor de música local
- **Desarrollo**: Base para aplicaciones de audio
- **Educativo**: Ejemplo de Web Audio API
- **Prototipado**: Interfaz de referencia para reproductores

## 🔮 **Futuras Mejoras**

- [ ] Soporte para más formatos de audio
- [ ] Ecualizador gráfico
- [ ] Listas de reproducción personalizadas
- [ ] Integración con servicios de streaming
- [ ] Modo offline con Service Workers
- [ ] Visualizaciones de audio
- [ ] Temas adicionales

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente.

## 👨‍💻 **Desarrollador**

Creado con ❤️ para ofrecer una experiencia de audio elegante y moderna.

---

**Luxe Audio** - *Experimenta la música con elegancia y sofisticación* 🎵✨
