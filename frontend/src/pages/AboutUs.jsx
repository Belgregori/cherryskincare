import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';
import { getApiErrorMessage } from '../utils/apiError';
import './AboutUs.css';

function AboutUs() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const onChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'idle', message: '' });

    try {
      setStatus({ type: 'sending', message: 'Enviando...' });
      await api.post('/contact/messages', {
        name: form.name,
        email: form.email,
        message: form.message,
      });

      setForm({ name: '', email: '', message: '' });
      setStatus({ type: 'success', message: 'Mensaje enviado. ¡Gracias por contactarme!' });
    } catch (err) {
      console.error(err);
      setStatus({
        type: 'error',
        message: getApiErrorMessage(err, 'No se pudo enviar el mensaje. Probá nuevamente en unos minutos.'),
      });
    }
  };

  return (
    <div className="about-us-page">
      <Header />
      <div className="about-us-container">
        <div className="page-header">
          <h1>Sobre nosotros y contacto</h1>
          <p>Conocé más del proyecto y escribinos cuando quieras</p>
        </div>

        <div className="content-section">
          <div className="about-content">
            <h2>👩‍💻 Sobre la desarrolladora</h2>
            <p>
              Mi nombre es Belén, soy desarrolladora de software y estoy estudiando Ingeniería en Sistemas.
              Me apasiona crear sitios web a medida, con diseño cuidado y funcionalidad real.
              También tengo experiencia en creación y gestión de bases de datos, desarrollo frontend y backend.
            </p>

            <h2>✨ Beneficios de tener tu propio sitio web</h2>
            <ul className="features-list">
              <li>✅ Mayor visibilidad y presencia online</li>
              <li>✅ Diseño único y personalizado (no plantilla estándar)</li>
              <li>✅ Mejor imagen profesional y confianza</li>
              <li>✅ Diferenciarte de la competencia con una experiencia a medida</li>
            </ul>

            <p className="about-cta">
              ¿Te gustaría hablar sobre tu proyecto? Escribime y lo charlamos.
            </p>

            <h2>📩 Contacto</h2>
            <p className="contact-form-intro">
              Completá el formulario: tu mensaje se guarda de forma segura y te respondemos al email que indiques.
              También podés escribirnos directo por correo o WhatsApp.
            </p>
            <div className="contact-grid">
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <label className="form-label" htmlFor="contactName">Nombre</label>
                  <input
                    id="contactName"
                    type="text"
                    value={form.name}
                    onChange={onChange('name')}
                    required
                    placeholder="Tu nombre"
                  />
                </div>

                <div className="form-row">
                  <label className="form-label" htmlFor="contactEmail">Email</label>
                  <input
                    id="contactEmail"
                    type="email"
                    value={form.email}
                    onChange={onChange('email')}
                    required
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="form-row">
                  <label className="form-label" htmlFor="contactMessage">Mensaje</label>
                  <textarea
                    id="contactMessage"
                    value={form.message}
                    onChange={onChange('message')}
                    required
                    placeholder="Contame qué necesitás y te respondo a la brevedad."
                    rows={5}
                  />
                </div>

                <button
                  className="contact-submit"
                  type="submit"
                  disabled={status.type === 'sending'}
                >
                  {status.type === 'sending' ? 'Enviando...' : 'Enviar'}
                </button>

                {status.type === 'success' ? (
                  <div className="contact-status success">{status.message}</div>
                ) : null}
                {status.type === 'error' ? (
                  <div className="contact-status error">{status.message}</div>
                ) : null}
              </form>

              <div className="contact-details">
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <span>
                    Email:{' '}
                    <a href="mailto:gregoribeleen@gmail.com">gregoribeleen@gmail.com</a>
                  </span>
                </div>

                <div className="contact-item">
                  <span className="contact-icon">💬</span>
                  <span>
                    WhatsApp:{' '}
                    <a
                      href="https://wa.me/5493515154070"
                      target="_blank"
                      rel="noreferrer"
                    >
                      3515154070
                    </a>
                  </span>
                </div>
              </div>
            </div>
            <p>
              Si tenés un emprendimiento o negocio y te gustaría una web similar, escribime y lo armamos a tu medida.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AboutUs;


