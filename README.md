# users-api

Una API REST para gestión de usuarios construida con Node.js, Express y MongoDB.

## Características

- Autenticación y autorización con JWT
- CRUD completo de usuarios
- Middleware de seguridad
- Validación de datos
- Manejo de errores
- Envío de emails

## Tecnologías

- **Backend**: Node.js, Express.js
- **Base de datos**: MongoDB con Mongoose
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: Express Validator
- **Testing**: Jest, Supertest

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/JuanPabloRomero00/users-api.git
cd users-api
```

2. Instala las dependencias:
```bash
cd users-api
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
# Edita el archivo .env con tus configuraciones
```

4. Inicia el servidor:
```bash
npm start
```

## � Scripts disponibles

- `npm start` - Inicia el servidor en producción
- `npm run dev` - Inicia el servidor en modo desarrollo
- `npm test` - Ejecuta las pruebas

## API Endpoints

### Usuarios
- `POST /api/users/register` - Registro de usuario
- `POST /api/users/login` - Login de usuario
- `GET /api/users/profile` - Obtener perfil (requiere autenticación)
- `PUT /api/users/profile` - Actualizar perfil (requiere autenticación)

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
