import React from 'react';
import { Link } from 'react-router-dom';
import LegalPage, { Dato, type LegalSection } from './LegalPage';
import { CONSERVACION, MARCA, REGISTRO_BASE_DATOS, RUTA_PROCESO, RUTA_TERMINOS, SERVICIO, TITULAR } from './legalInfo';

/**
 * PoliticaPrivacidad — /policy-privacy
 * ---------------------------------------------------------
 * Política de privacidad de Umbral (tours virtuales 360, Argentina).
 *
 * Normativa tenida en cuenta:
 * - Ley 25.326 de Protección de los Datos Personales y Decreto 1558/2001
 *   (información al titular, art. 6; consentimiento, art. 5; derechos, arts. 14 a 16;
 *   transferencias internacionales, art. 12).
 * - Disposición DNPDP 10/2008: leyenda obligatoria sobre el derecho de acceso
 *   y la AAIP como órgano de control.
 * - Código Civil y Comercial, art. 53 (derecho a la propia imagen).
 */

interface Finalidad {
  finalidad: string;
  datos: string;
  base: string;
  plazo: string;
}

const FINALIDADES: Finalidad[] = [
  {
    finalidad: 'Responder tu consulta y armar el presupuesto',
    datos: 'Nombre, email, teléfono, tipo de espacio, zona, cantidad de ambientes y mensaje',
    base: 'Tu consentimiento, que das al enviar el formulario (art. 5 de la Ley 25.326)',
    plazo: `Hasta ${CONSERVACION.consultasMeses} meses desde el último contacto, si no contratás`,
  },
  {
    finalidad: 'Coordinar la visita, hacer las tomas, editar y publicar el tour',
    datos: 'Datos de contacto, dirección del espacio, fotos 360 y contenido de los puntos de información',
    base: 'La relación contractual con vos (art. 5, inc. 2.d, de la Ley 25.326)',
    plazo: 'Mientras dure el servicio y el alojamiento del tour y, después, mientras puedan surgir reclamos',
  },
  {
    finalidad: 'Facturar y cumplir las obligaciones fiscales y contables',
    datos: 'Nombre o razón social, CUIT o DNI, condición fiscal, domicilio e importes',
    base: 'Obligación legal: normativa de ARCA y Código Civil y Comercial',
    plazo: '10 años (art. 328 del Código Civil y Comercial)',
  },
  {
    finalidad: 'Darte una cuenta de acceso y mantenerla segura',
    datos: 'Email, verificación de la cuenta y registros de inicio de sesión',
    base: 'Tu consentimiento al crear la cuenta y la relación contractual',
    plazo: 'Mientras la cuenta esté activa',
  },
  {
    finalidad: 'Mostrar trabajos terminados en nuestro portfolio',
    datos: 'El tour o capturas del tour, sin la dirección exacta de viviendas particulares',
    base: 'Tu consentimiento, que podés retirar en cualquier momento',
    plazo: 'Hasta que nos pidas sacarlo',
  },
  {
    finalidad: 'Guardar la prueba de que aceptaste esta política',
    datos: 'Casilla marcada, versión del texto, fecha y hora, dirección IP',
    base: 'Acreditar el consentimiento que exige la ley (art. 5 de la Ley 25.326)',
    plazo: 'Mientras conservemos los datos a los que se refiere',
  },
  {
    finalidad: 'Mantener el sitio seguro y evitar abusos',
    datos: 'Dirección IP, navegador y registros técnicos del servidor',
    base: 'Deber de seguridad de los datos (art. 9 de la Ley 25.326)',
    plazo: 'Períodos cortos, salvo que hagan falta para investigar un incidente',
  },
];

interface Proveedor {
  nombre: string;
  servicio: string;
  ubicacion: string;
}

// TODO (Angus): revisá que la lista coincida con lo que usás en producción.
const PROVEEDORES: Proveedor[] = [
  { nombre: 'Cloudinary', servicio: 'Almacenamiento y entrega de las fotos 360 y de los tours publicados', ubicacion: 'EE. UU. y red global' },
  { nombre: 'Firebase (Google)', servicio: 'Cuentas de acceso y verificación del email', ubicacion: 'EE. UU.' },
  { nombre: 'MongoDB Atlas', servicio: 'Base de datos de tours y consultas', ubicacion: 'Según la región contratada' },
  { nombre: 'Render', servicio: 'Alojamiento del servidor y de la web', ubicacion: 'EE. UU. / UE' },
  { nombre: 'Google Fonts', servicio: 'Tipografías del sitio (recibe la dirección IP al cargarlas)', ubicacion: 'EE. UU.' },
  { nombre: 'PENDIENTE: proveedor de correo', servicio: 'Envío de emails de la cuenta y respuestas a consultas', ubicacion: 'PENDIENTE' },
];

const secciones: LegalSection[] = [
  {
    id: 'responsable',
    titulo: 'Quién es responsable de tus datos',
    contenido: (
      <>
        <dl className="legal-dl">
          <dt>Responsable</dt>
          <dd>
            <Dato valor={TITULAR.nombre} />
          </dd>
          {/* <dt>CUIT</dt>
          <dd>
            <Dato valor={TITULAR.cuit} />
          </dd>
          <dt>Domicilio</dt>
          <dd>
            <Dato valor={TITULAR.domicilio} />
          </dd> */}
          <dt>Correo electrónico</dt>
          <dd>
            <Dato valor={TITULAR.email} />
          </dd>
          <dt>Teléfono</dt>
          <dd>
            <Dato valor={TITULAR.telefono} />
          </dd>
          <dt>Base de datos</dt>
          <dd>
            <Dato valor={REGISTRO_BASE_DATOS} />
          </dd>
        </dl>
        <p>
          Esta política se aplica al sitio {MARCA.web}, al formulario de contacto, a las cuentas de acceso, a los tours
          que publicamos y a las visitas en las que hacemos las tomas.
        </p>
      </>
    ),
  },
  {
    id: 'datos',
    titulo: 'Qué datos tratamos',
    contenido: (
      <>
        <ul className="legal-list">
          <li>
            <strong>Consultas:</strong> nombre, email, teléfono, el tipo de espacio, la zona, la cantidad de ambientes y
            lo que nos escribas. También la fecha y hora del envío y la dirección IP, para frenar el spam.
          </li>
          <li>
            <strong>Clientes:</strong> los datos para coordinar la visita (incluida la dirección del espacio) y para
            facturar: nombre o razón social, CUIT o DNI, condición fiscal y domicilio.
          </li>
          <li>
            <strong>Cuentas de acceso:</strong> email y estado de verificación. La contraseña la gestiona Firebase y
            nosotros nunca la vemos ni la guardamos.
          </li>
          <li>
            <strong>Fotos y tours:</strong> las imágenes 360 de cada espacio y los textos de los puntos de información.
          </li>
          <li>
            <strong>Datos técnicos:</strong> dirección IP, navegador y registros del servidor, y tu preferencia de tema
            claro u oscuro, que queda guardada en tu navegador.
          </li>
        </ul>
        <p>
          Los campos marcados como obligatorios en cada formulario son necesarios para responderte o prestarte el
          servicio; si no los completás, no podemos avanzar. El resto es opcional. Si nos das datos de otra persona (por
          ejemplo, quien nos abre la puerta), tenés que avisarle de esta política.
        </p>
      </>
    ),
  },
  {
    id: 'fotos',
    titulo: 'Personas y datos que aparecen en las fotos',
    contenido: (
      <>
        <p>
          Una cámara 360 ve todo alrededor. Por eso pedimos que no haya nadie en el ambiente durante cada toma y te
          pasamos una lista para dejar el espacio listo (podés verla en <Link to={RUTA_PROCESO}>Proceso</Link>).
        </p>
        <p>
          Si igual aparece una persona, una patente, un documento, una foto familiar o cualquier dato que no deba verse,
          lo <strong>difuminamos antes de subir la imagen</strong>. La versión sin difuminar nunca se publica ni sale de
          nuestros equipos, y la borramos a los {SERVICIO.conservacionOriginalesDias} días de entregar el tour. Si
          después encontrás algo más para tapar, escribinos y lo difuminamos sin costo.
        </p>
        <p>
          Así respetamos el derecho a la propia imagen que reconoce el artículo 53 del Código Civil y Comercial.
        </p>
      </>
    ),
  },
  {
    id: 'finalidades',
    titulo: 'Para qué los usamos, con qué base y por cuánto tiempo',
    contenido: (
      <>
        <div className="legal-table-wrap">
          <table className="legal-table">
            <thead>
              <tr>
                <th scope="col">Finalidad</th>
                <th scope="col">Datos</th>
                <th scope="col">Base</th>
                <th scope="col">Conservación</th>
              </tr>
            </thead>
            <tbody>
              {FINALIDADES.map((f) => (
                <tr key={f.finalidad}>
                  <th scope="row">{f.finalidad}</th>
                  <td data-label="Datos">{f.datos}</td>
                  <td data-label="Base">{f.base}</td>
                  <td data-label="Conservación">{f.plazo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Cuando termina cada plazo, borramos los datos o los dejamos anónimos. No usamos tus datos para fines distintos
          de los que figuran acá, no armamos perfiles y no tomamos decisiones automáticas sobre vos.
        </p>
        <p>
          No te enviamos publicidad. Si algún día lo hacemos, te vamos a pedir permiso antes y vas a poder darte de baja
          en cualquier momento.
        </p>
      </>
    ),
  },
  {
    id: 'destinatarios',
    titulo: 'A quién se comunican',
    contenido: (
      <>
        <p>No vendemos ni cedemos tus datos. Solo acceden a ellos:</p>
        <ul className="legal-list">
          <li>
            <strong>Proveedores que nos prestan servicios técnicos</strong>, solo para ese fin y bajo sus condiciones de
            confidencialidad:
          </li>
        </ul>
        <div className="legal-table-wrap">
          <table className="legal-table">
            <thead>
              <tr>
                <th scope="col">Proveedor</th>
                <th scope="col">Servicio</th>
                <th scope="col">Ubicación</th>
              </tr>
            </thead>
            <tbody>
              {PROVEEDORES.map((p) => (
                <tr key={p.nombre}>
                  <th scope="row">
                    <Dato valor={p.nombre} />
                  </th>
                  <td data-label="Servicio">{p.servicio}</td>
                  <td data-label="Ubicación">
                    <Dato valor={p.ubicacion} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="legal-list">
          <li>
            <strong>Organismos públicos</strong>, cuando una ley o una orden judicial lo exige (por ejemplo, ARCA).
          </li>
          <li>
            <strong>Quien tenga el link de un tour publicado.</strong> Los tours son públicos para quien tenga la
            dirección y el cliente decide dónde compartirlos o insertarlos. Se pueden despublicar en cualquier momento.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'transferencias',
    titulo: 'Datos guardados fuera de Argentina',
    contenido: (
      <p>
        Varios de los proveedores anteriores tienen sus servidores fuera del país, principalmente en Estados Unidos y la
        Unión Europea. Esas transferencias se hacen con los resguardos que exige el artículo 12 de la Ley 25.326 y la
        normativa de la Agencia de Acceso a la Información Pública, como las cláusulas contractuales de protección de
        datos. Si querés más detalle, escribinos.
      </p>
    ),
  },
  {
    id: 'derechos',
    titulo: 'Tus derechos',
    contenido: (
      <>
        <p>En cualquier momento, y sin costo, podés pedirnos:</p>
        <ul className="legal-list">
          <li>
            <strong>Acceso:</strong> saber qué datos tuyos tenemos. Te respondemos dentro de los 10 días corridos.
          </li>
          <li>
            <strong>Rectificación y actualización:</strong> corregir datos que estén mal o incompletos.
          </li>
          <li>
            <strong>Supresión:</strong> que los borremos, salvo los que tengamos que guardar por ley.
          </li>
          <li>
            <strong>Retirar tu consentimiento</strong>, por ejemplo para que un trabajo deje de estar en el portfolio.
          </li>
        </ul>
        <p>
          Escribinos a <Dato valor={TITULAR.email} /> contando qué querés hacer. Si tenemos dudas razonables sobre tu
          identidad, te podemos pedir que la acredites. Los pedidos de rectificación, actualización o supresión los
          resolvemos dentro de los 5 días hábiles, como fija el artículo 16 de la Ley 25.326.
        </p>
        <p className="legal-quote">
          El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma
          gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme
          lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326. La Agencia de Acceso a la Información Pública,
          en su carácter de Órgano de Control de la Ley Nº 25.326, tiene la atribución de atender las denuncias y
          reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes
          en materia de protección de datos personales.
        </p>
        <p>
          Podés contactar a la AAIP en{' '}
          <a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener noreferrer">
            argentina.gob.ar/aaip
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: 'seguridad',
    titulo: 'Cómo los protegemos',
    contenido: (
      <ul className="legal-list">
        <li>Conexión cifrada (HTTPS) en todo el sitio y en los tours.</li>
        <li>Contraseñas gestionadas por Firebase y sesión en una cookie que el navegador no deja leer a otros scripts.</li>
        <li>El panel donde se arman los tours solo lo usan personas autorizadas, con verificación adicional.</li>
        <li>Las fotos se difuminan antes de subirse, y las subidas van firmadas desde nuestro servidor.</li>
        <li>Cada proveedor recibe solo los datos que necesita para su servicio.</li>
      </ul>
    ),
  },
  {
    id: 'cookies',
    titulo: 'Cookies y almacenamiento en el navegador',
    contenido: (
      <>
        <p>Solo usamos cookies y almacenamiento técnico, necesario para que el sitio funcione:</p>
        <ul className="legal-list">
          <li>La cookie de sesión, mientras tenés la cuenta abierta.</li>
          <li>Tu preferencia de tema claro u oscuro.</li>
          <li>Tu respuesta al aviso de cookies, para no volver a mostrártelo.</li>
        </ul>
        <p>
          No usamos cookies analíticas ni publicitarias. Los tours insertados en otras webs no dejan cookies propias:
          solo cargan las imágenes desde Cloudinary. Si en el futuro sumamos herramientas de medición, te vamos a pedir
          permiso antes y lo vamos a informar acá.
        </p>
      </>
    ),
  },
  {
    id: 'menores',
    titulo: 'Menores de edad',
    contenido: (
      <p>
        Nuestros servicios están pensados para mayores de 18 años. No pedimos ni guardamos a sabiendas datos de menores;
        si detectamos que nos llegaron, los borramos.
      </p>
    ),
  },
  {
    id: 'cambios',
    titulo: 'Cambios en esta política',
    contenido: (
      <p>
        Podemos actualizar esta política por cambios legales o del servicio. La versión y la fecha figuran arriba de todo,
        y si el cambio es importante te lo vamos a avisar por email. Las condiciones del servicio están en los{' '}
        <Link to={RUTA_TERMINOS}>términos y condiciones</Link>.
      </p>
    ),
  },
];

const PoliticaPrivacidad: React.FC = () => (
  <LegalPage
    eyebrow="Información legal"
    titulo="Política de privacidad"
    intro={
      <p>
        En {MARCA.nombreComercial} entramos a casas, hoteles y locales, así que cuidamos lo que se ve y lo que no. Acá te
        contamos, conforme a la Ley 25.326 de Protección de los Datos Personales, qué datos tratamos, para qué, durante
        cuánto tiempo y cómo podés ejercer tus derechos.
      </p>
    }
    secciones={secciones}
  />
);

export default PoliticaPrivacidad;