# 📌 Proyecto: ophi

Este repositorio contiene el código fuente de ophi, una aplicación desarrollada para todas las personas con alergias, intolerancias o dietas.  
El objetivo principal es que aquellos que tengan alguna condición alimentaria o dieta especial, puedan reconocer de forma rápida y simple
si el alimento es apto para su consumo o no lo es.

---

## 🚀 Funcionalidades Implementadas

-  Registro y login de usuarios.
-  Posibilidad de cargar más de 1 perfil.
-  Buscador completo, historial de búsqueda.
-  Productos recomendados por perfil.
-  Escaneo de productos.
-  Buscador por nombre en caso de fallo de escaner.

---

## 🧰 Tecnologías Utilizadas

### Frontend
- Vue.js
- Vite
- Tailwindcss / CSS
- Vue Router
- Axios

### Backend (si aplica)
- PHP
- Laravel

### Base de datos
- MySQL

### Otros
- Swiper.js


## 📦 Instalación

Instalar dependencias del frontend e iniciar servidor de desarrllo:

```bash
npm install
npm run dev
```
Instalar dependencias del backend e iniciar API:

```bash
composer install
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```
