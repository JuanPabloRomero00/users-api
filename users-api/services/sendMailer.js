const nodemailer = require('nodemailer');

// Configuración específica para Gmail como proveedor SMTP
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    connectionTimeout: 10000, // 10 segundos
    greetingTimeout: 5000,    // 5 segundos
    socketTimeout: 10000,     // 10 segundos
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });
};

// Función para enviar email de recuperación de contraseña
exports.sendResetEmail = async (email, token, nombre = '') => {
  console.log('=== INICIO ENVIO EMAIL ===');
  console.log('Email destino:', email);
  console.log('Token presente:', !!token);
  console.log('Nombre usuario:', nombre || 'No proporcionado');
  
  try {
    // Validar que las credenciales de Gmail estén configuradas
    console.log('Verificando credenciales Gmail...');
    console.log('GMAIL_USER presente:', !!process.env.GMAIL_USER);
    console.log('GMAIL_PASS presente:', !!process.env.GMAIL_PASS);
    
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.error('ERROR: Gmail credentials no configuradas');
      return false;
    }

    console.log('Creando transporter Gmail...');
    const transporter = createGmailTransporter();
    
    console.log('Generando URL de reset...');
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    console.log('URL generada:', resetUrl);
    
    const mailOptions = {
      from: `"CarwashFreaks" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Solicitud de recuperación de contraseña',
      text: `
Hola${nombre ? ' ' + nombre : ''},

Recibimos una solicitud para restablecer la contraseña de tu cuenta en CarwashFreaks.

Para continuar, haz clic en el siguiente enlace o cópialo en tu navegador:
${resetUrl}

Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá siendo válida.

Por seguridad, este enlace expirará en 1 hora.

Saludos cordiales,
El equipo de CarwashFreaks
      `.trim(),
      html: `
        <p>Hola${nombre ? ' ' + nombre : ''},</p>
        <p>Recibimos una solicitud para <strong>restablecer la contraseña</strong> de tu cuenta en <b>CarwashFreaks</b>.</p>
        <p>Para continuar, haz clic en el siguiente enlace o cópialo en tu navegador:</p>
        <p><a href="${resetUrl}" style="color:#1976d2;">${resetUrl}</a></p>
        <p style="color:#888;font-size:0.95em;">
          Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá siendo válida.<br>
          Por seguridad, este enlace expirará en <b>1 hora</b>.
        </p>
        <p><b>El equipo de CarwashFreaks</b></p>
      `
    };

    console.log('Enviando email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('SUCCESS: Email enviado exitosamente');
    console.log('Message ID:', info.messageId);
    console.log('=== FIN ENVIO EMAIL ===');
    return true;
    
  } catch (error) {
    console.error('ERROR CRITICO AL ENVIAR EMAIL:');
    console.error('Mensaje:', error.message);
    console.error('Codigo:', error.code);
    console.error('Stack:', error.stack);
    console.log('=== FIN ENVIO EMAIL (ERROR) ===');
    return false;
  }
};
