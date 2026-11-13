import React from 'react';
import { Link } from 'react-router-dom';
import LegalPage, { Dato, type LegalSection } from './LegalPage';
import { MARCA, RUTA_PRIVACIDAD, TITULAR } from './legalInfo';

/**
 * PoliticaCookies — /policy-cookies
 * ---------------------------------------------------------
 * Política de cookies de Umbral. Usa la misma base que privacidad y términos
 * (LegalPage + politicasPrivacidad.css), así las tres páginas se ven iguales.
 *
 * Normativa tenida en cuenta:
 * - Constitución Nacional, art. 43 (hábeas data).
 * - Ley 25.326 y Decreto 1558/2001 (consentimiento, art. 5; derechos, arts. 14 a 16).
 * - Convenio 108+ del Consejo de Europa, aprobado por la Ley 27.699.
 * - Disposición DNPDP 10/2008 (leyenda sobre el derecho de acceso y la AAIP).
 */

interface Almacenamiento {
  nombre: string;
  tipo: string;
  para: string;
  duracion: string;
}

// TODO (Angus): revisá que coincida con lo que guarda tu proyecto (nombre real de la
// cookie de sesión y cualquier otra clave de localStorage, por ejemplo el idioma).
const ALMACENAMIENTO: Almacenamiento[] = [
  {
    nombre: 'Cookie de sesión',
    tipo: 'Cookie esencial, segura (httpOnly)',
    para: 'Mantener abierta tu sesión cuando entrás a tu cuenta',
    duracion: 'Hasta que cerrás sesión o vence por inactividad',
  },
  {
    nombre: 'Sesión de Firebase',
    tipo: 'Almacenamiento del navegador, esencial',
    para: 'Recordar el inicio de sesión de tu cuenta',
    duracion: 'Hasta que cerrás sesión',
  },
  {
    nombre: 'theme',
    tipo: 'Almacenamiento local, funcionalidad',
    para: 'Recordar si elegiste el tema claro u oscuro',
    duracion: 'Hasta que lo borres',
  },
  {
    nombre: 'cookiesAccepted',
    tipo: 'Almacenamiento local, funcionalidad',
    para: 'Recordar que ya viste el aviso de cookies',
    duracion: 'Hasta que lo borres',
  },
];

const secciones: LegalSection[] = [
  {
    id: 'que-son',
    titulo: 'Qué son las cookies',
    contenido: (
      <p>
        Las cookies son archivos chicos que un sitio guarda en tu dispositivo cuando lo visitás, para recordar algo entre
        una página y otra o entre una visita y la siguiente. En esta política también incluimos tecnologías parecidas, como
        el almacenamiento local del navegador (localStorage), que cumplen la misma función.
      </p>
    ),
  },
  {
    id: 'resumen',
    titulo: 'En pocas palabras',
    contenido: (
      <ul className="legal-list">
        <li>
          <strong>Solo usamos cookies técnicas:</strong> las necesarias para que puedas entrar a tu cuenta y para recordar
          tus preferencias.
        </li>
        <li>
          <strong>No usamos cookies de análisis ni de publicidad</strong>, y no te seguimos por otros sitios.
        </li>
        <li>
          <strong>Los tours no dejan cookies</strong>, tampoco cuando están insertados en la web de otra empresa.
        </li>
      </ul>
    ),
  },
  {
    id: 'responsable',
    titulo: 'Responsable',
    contenido: (
      <dl className="legal-dl">
        <dt>Responsable</dt>
        <dd>
          <Dato valor={TITULAR.nombre} />
        </dd>
        <dt>Correo electrónico</dt>
        <dd>
          <Dato valor={TITULAR.email} />
        </dd>
        <dt>Teléfono</dt>
        <dd>
          <Dato valor={TITULAR.telefono} />
        </dd>
        <dt>Sitio</dt>
        <dd>{MARCA.web}</dd>
      </dl>
    ),
  },
  {
    id: 'marco',
    titulo: 'Marco legal en Argentina',
    contenido: (
      <p>
        En Argentina no hay una ley específica sobre cookies. Cuando una cookie permite identificar a una persona, se
        aplica el régimen general de protección de datos: el artículo 43 de la Constitución Nacional (hábeas data), la Ley
        25.326 de Protección de los Datos Personales y su Decreto Reglamentario 1558/2001, y el Convenio 108+ del Consejo
        de Europa, aprobado por la Ley 27.699. La Agencia de Acceso a la Información Pública (AAIP) es el órgano de
        control.
      </p>
    ),
  },
  {
    id: 'cuales',
    titulo: 'Qué guardamos en tu navegador',
    contenido: (
      <>
        <div className="legal-table-wrap">
          <table className="legal-table">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Tipo</th>
                <th scope="col">Para qué</th>
                <th scope="col">Duración</th>
              </tr>
            </thead>
            <tbody>
              {ALMACENAMIENTO.map((a) => (
                <tr key={a.nombre}>
                  <th scope="row">{a.nombre}</th>
                  <td data-label="Tipo">{a.tipo}</td>
                  <td data-label="Para qué">{a.para}</td>
                  <td data-label="Duración">{a.duracion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Las dos primeras solo aparecen si tenés una cuenta y entrás a ella. Ninguna se comparte con terceros ni se usa
          para armar perfiles.
        </p>
      </>
    ),
  },
  {
    id: 'terceros',
    titulo: 'Servicios de terceros',
    contenido: (
      <>
        <p>
          Las fotos de los tours se sirven desde <strong>Cloudinary</strong> y las tipografías desde{' '}
          <strong>Google Fonts</strong>. Para entregarte esos archivos, esos servicios reciben la dirección IP de tu
          dispositivo, como cualquier servidor, pero no instalamos cookies suyas.
        </p>
        <p>
          Si ves uno de nuestros tours insertado en la web de una inmobiliaria, un hotel u otra empresa, el resto de esa
          página se rige por la política de cookies de ese sitio.
        </p>
      </>
    ),
  },
  {
    id: 'gestionar',
    titulo: 'Cómo gestionarlas',
    contenido: (
      <p>
        Podés borrar las cookies y los datos del sitio, o bloquearlos, desde la configuración de privacidad de tu
        navegador (Chrome, Firefox, Safari, Edge y los demás lo permiten). Si bloqueás las esenciales, no vas a poder
        entrar a tu cuenta; los tours y el resto del sitio siguen funcionando.
      </p>
    ),
  },
  {
    id: 'consentimiento',
    titulo: 'Consentimiento',
    contenido: (
      <p>
        Como solo usamos cookies técnicas, el aviso que ves al entrar es informativo: te cuenta qué guardamos y te deja
        leer esta política. Si en el futuro sumamos cookies de análisis o de cualquier otro tipo que no sea
        imprescindible, solo se van a activar si das tu consentimiento expreso, como pide el artículo 5 de la Ley 25.326,
        y vas a poder retirarlo cuando quieras.
      </p>
    ),
  },
  {
    id: 'derechos',
    titulo: 'Tus derechos',
    contenido: (
      <>
        <p>
          Podés pedir acceso, rectificación, actualización o supresión de tus datos escribiendo a{' '}
          <Dato valor={TITULAR.email} />. El detalle está en la <Link to={`${RUTA_PRIVACIDAD}#derechos`}>política de
          privacidad</Link>.
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
    id: 'cambios',
    titulo: 'Cambios en esta política',
    contenido: (
      <p>
        Si cambia lo que guardamos en tu navegador, actualizamos esta página y su fecha. Si sumamos cookies que necesiten
        tu permiso, el aviso vuelve a aparecer para que elijas.
      </p>
    ),
  },
];

const PoliticaCookies: React.FC = () => (
  <LegalPage
    eyebrow="Información legal"
    titulo="Política de cookies"
    intro={
      <p>
        Qué guarda {MARCA.nombreComercial} en tu navegador, para qué y cómo podés borrarlo. Es corta porque usamos lo
        mínimo: solo lo necesario para que el sitio funcione.
      </p>
    }
    secciones={secciones}
  />
);

export default PoliticaCookies;