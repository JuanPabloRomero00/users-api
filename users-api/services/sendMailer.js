const nodemailer = require('nodemailer');

// Configuración para Resend (alternativa a Gmail que funciona en Render)
// Resend usa SMTP sobre TLS y no es bloqueado por firewalls
const createEmailTransporter = () => {
  // Solo Gmail SMTP como fallback local
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
  });
};

// Función para enviar email de recuperación de contraseña
exports.sendResetEmail = async (email, token, nombre = '') => {
  console.log('=== INICIO ENVIO EMAIL ===');
  console.log('Email destino:', email);
  console.log('Token presente:', !!token);
  console.log('Nombre usuario:', nombre || 'No proporcionado');
  
  try {
    console.log('== INICIO sendResetEmail ==');
    // Generar la URL de reset antes de cualquier uso
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    console.log('Datos recibidos:', { nombre, email, resetUrl });
    // Detectar qué servicio estamos usando
    const usingResend = !!process.env.RESEND_API_KEY;
    console.log('Servicio de email:', usingResend ? 'Resend' : 'Gmail');
    
    if (usingResend) {
      console.log('RESEND_API_KEY presente:', true);
      console.log('RESEND_API_KEY longitud:', process.env.RESEND_API_KEY.length);
    } else {
      console.log('GMAIL_USER presente:', !!process.env.GMAIL_USER);
      console.log('GMAIL_USER valor (parcial):', process.env.GMAIL_USER ? process.env.GMAIL_USER.substring(0, 5) + '***' : 'undefined');
      console.log('GMAIL_PASS presente:', !!process.env.GMAIL_PASS);
      console.log('GMAIL_PASS longitud:', process.env.GMAIL_PASS ? process.env.GMAIL_PASS.length : 0);
      
      if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        console.error('ERROR: Gmail credentials no configuradas');
        return false;
      }
    }

    console.log('Creando transporter...');
    const transporter = createEmailTransporter();
    
  console.log('Generando URL de reset...');
  // URL ya generada antes, solo loguear
  console.log('URL generada:', resetUrl);
    
    // Determinar el remitente basado en el servicio
    const fromEmail = process.env.RESEND_API_KEY 
      ? 'noreply@carwashfreaks.com'
      : process.env.GMAIL_USER;
    
    const mailOptions = {
      from: `"CarwashFreaks" <${fromEmail}>`,
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

    if (usingResend) {
      // Usar API HTTP de Resend
      console.log('Enviando email con Resend API HTTP...');
      const { sendResendEmail } = require('./resendClient');
      try {
        const result = await sendResendEmail({
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject,
          html: mailOptions.html,
          text: mailOptions.text
        });
        console.log('SUCCESS: Email enviado con Resend API HTTP');
        console.log('Resend response:', result);
        console.log('=== FIN ENVIO EMAIL ===');
        return true;
      } catch (error) {
        console.error('ERROR CRITICO AL ENVIAR EMAIL (Resend API):');
        console.error('Mensaje:', error.message);
        if (error.response) {
          console.error('Resend Response:', error.response);
        }
        if (error.code) {
          console.error('Codigo:', error.code);
        }
        console.error('Stack:', error.stack);
        console.log('=== FIN ENVIO EMAIL (ERROR) ===');
        return false;
      }
    } else {
      // Fallback a Gmail SMTP
      console.log('Preparando envío de email...');
      console.log('MailOptions:', mailOptions);
      console.log('Transporter config:', transporter && transporter.options ? transporter.options : transporter);
      console.log('Llamando a transporter.sendMail...');
      const info = await transporter.sendMail(mailOptions);
      console.log('SUCCESS: Email enviado exitosamente');
      console.log('Message ID:', info.messageId);
      console.log('=== FIN ENVIO EMAIL ===');
      return true;
    }
    
  } catch (error) {
    console.error('ERROR CRITICO AL ENVIAR EMAIL:');
    console.error('Mensaje:', error.message);
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
    if (error.code) {
      console.error('Codigo:', error.code);
    }
    console.error('Stack:', error.stack);
    console.log('=== FIN ENVIO EMAIL (ERROR) ===');
    return false;
  }
};
