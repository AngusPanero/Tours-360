import React from 'react';
import { Link } from 'react-router-dom';
import LegalPage, { Dato, type LegalSection } from './LegalPage';
import { MARCA, RUTA_CONTACTO, RUTA_PRIVACIDAD, RUTA_PROCESO, SERVICIO, TITULAR } from './legalInfo';

/**
 * TerminosCondiciones — /policy-terms
 * ---------------------------------------------------------
 * Términos y condiciones del sitio y del servicio de tours virtuales 360 de Umbral.
 *
 * Normativa tenida en cuenta:
 * - Ley 24.240 de Defensa del Consumidor (información, art. 4; publicidad, arts. 7 y 8;
 *   cláusulas abusivas, art. 37).
 * - Código Civil y Comercial: contratos de consumo (arts. 1092 y ss.), revocación en
 *   contratos a distancia (arts. 1110 a 1116) y documentación contable (art. 328).
 * - Disposición SSDCyLC 954/2025 (botón de arrepentimiento y contratación a distancia).
 * - Ley 11.723 de Propiedad Intelectual.
 */

const secciones: LegalSection[] = [
  {
    id: 'titular',
    titulo: 'Quién presta el servicio',
    contenido: (
      <dl className="legal-dl">
        <dt>Titular</dt>
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
        <dt>Condición fiscal</dt>
        <dd>
          <Dato valor={TITULAR.condicionFiscal} />
        </dd>
        <dt>Correo electrónico</dt>
        <dd>
          <Dato valor={TITULAR.email} />
        </dd>
        <dt>Teléfono</dt>
        <dd>
          <Dato valor={TITULAR.telefono} />
        </dd>
        <dt>Nombre comercial</dt>
        <dd>
          {MARCA.nombreComercial} · {MARCA.web}
        </dd>
      </dl>
    ),
  },
  {
    id: 'objeto',
    titulo: 'Qué regulan estos términos',
    contenido: (
      <>
        <p>
          Estos términos regulan el uso del sitio {MARCA.web} y la contratación de tours virtuales 360 con{' '}
          {MARCA.nombreComercial}. Llamamos «Cliente» a quien contrata y «tour» al recorrido navegable que armamos con
          las fotos 360 de su espacio.
        </p>
        <p>
          Al aceptar un presupuesto aceptás también estos términos. Si algo del presupuesto es distinto de lo que dice
          acá, vale lo que dice el presupuesto. Solo pueden contratar personas mayores de 18 años.
        </p>
      </>
    ),
  },
  {
    id: 'servicio',
    titulo: 'Qué incluye el servicio',
    contenido: (
      <>
        <ul className="legal-list">
          <li>
            <strong>Visita y captura:</strong> vamos al espacio y hacemos una toma 360 por ambiente, o varias en los
            espacios grandes.
          </li>
          <li>
            <strong>Edición:</strong> unimos cada foto, nivelamos el horizonte, corregimos la luz y difuminamos personas y
            datos que no deban verse.
          </li>
          <li>
            <strong>Mapeo:</strong> unimos los ambientes con pasos, ordenamos las plantas, sumamos puntos de información y
            elegimos la vista inicial.
          </li>
          <li>
            <strong>Publicación:</strong> te entregamos un link propio y el código para insertar el tour en tu web.
          </li>
          <li>
            <strong>Alojamiento:</strong> el tour queda en línea durante {SERVICIO.alojamientoMeses} meses desde la
            entrega, salvo que el presupuesto diga otra cosa.
          </li>
        </ul>
        <p>
          No incluye planos, mediciones, fotos tradicionales ni video, salvo que figuren en el presupuesto. Trabajamos
          en {MARCA.zona}; fuera de esa zona el traslado se presupuesta aparte.
        </p>
      </>
    ),
  },
  {
    id: 'contratacion',
    titulo: 'Cómo se contrata',
    contenido: (
      <>
        <ol className="legal-list">
          <li>
            Nos escribís desde el <Link to={RUTA_CONTACTO}>formulario de contacto</Link>, por email o por WhatsApp.
          </li>
          <li>
            Te mandamos un presupuesto por escrito con lo que incluye, el precio, la forma de pago y el plazo de
            entrega. Vale por {SERVICIO.validezPresupuestoDias} días.
          </li>
          <li>Lo aceptás por escrito y abonás la seña para reservar la fecha.</li>
          <li>Hacemos la visita el día acordado.</li>
          <li>Editamos, mapeamos y te entregamos el link.</li>
        </ol>
        <p>
          El contrato queda celebrado cuando aceptás el presupuesto. Te confirmamos por email la fecha reservada y lo que
          contrataste, y guardamos esa constancia; si la necesitás, pedínosla.
        </p>
      </>
    ),
  },
  {
    id: 'precio',
    titulo: 'Precio y pago',
    contenido: (
      <>
        <p>
          El precio es el del presupuesto, en pesos argentinos. Ahí se indica si los impuestos están incluidos según
          nuestra condición fiscal (<Dato valor={TITULAR.condicionFiscal} />
          ). No hay cargos que no figuren en el presupuesto.
        </p>
        <p>
          Para reservar la fecha se abona una seña del {SERVICIO.senaPorcentaje} %. El saldo se paga al entregar el
          tour. Emitimos la factura con los datos que nos des, así que revisá que estén bien.
        </p>
      </>
    ),
  },
  {
    id: 'arrepentimiento',
    titulo: 'Derecho de arrepentimiento',
    contenido: (
      <>
        <p>
          Si contratás como consumidor y a distancia (por la web, email, WhatsApp o teléfono), podés revocar la
          contratación dentro de los <strong>10 días corridos</strong> desde que la celebraste, sin dar motivos y sin
          costo, como prevé el artículo 1110 del Código Civil y Comercial. Te devolvemos todo lo que hayas pagado por el
          mismo medio.
        </p>
        <p>
          Para ejercerlo, escribinos a <Dato valor={TITULAR.email} /> con el asunto «Arrepentimiento». No te pedimos
          registrarte ni ningún otro trámite, y dentro de las 24 horas te mandamos un código que identifica tu pedido.
        </p>
        <p>
          Este derecho es de los consumidores. No aplica cuando el tour se contrata para una actividad profesional, por
          ejemplo una inmobiliaria o un hotel que lo usa para ofrecer sus servicios.
        </p>
      </>
    ),
  },
  {
    id: 'cancelacion',
    titulo: 'Reprogramación y cancelación',
    contenido: (
      <>
        <ul className="legal-list">
          <li>
            Podés cambiar la fecha sin costo avisando con <strong>{SERVICIO.reprogramacionHoras} horas</strong> o más de
            anticipación.
          </li>
          <li>
            Si avisás con menos tiempo, o si al llegar no hay acceso al espacio, la seña se mantiene para una nueva
            fecha una sola vez. Una segunda reprogramación en esas condiciones se presupuesta aparte.
          </li>
          <li>Si el clima no permite hacer las tomas exteriores, reprogramamos sin costo.</li>
        </ul>
        <p>
          Si por algún motivo nosotros no podemos hacer la visita, te avisamos lo antes posible y elegís entre una nueva
          fecha o la devolución completa de lo que pagaste.
        </p>
      </>
    ),
  },
  {
    id: 'cliente',
    titulo: 'Lo que le toca al Cliente',
    contenido: (
      <ul className="legal-list">
        <li>Garantizar el acceso al espacio el día y la hora acordados.</li>
        <li>
          Dejar el espacio listo: luces prendidas, ambientes ordenados y objetos personales guardados. Te pasamos la
          lista antes de la visita (también está en <Link to={RUTA_PROCESO}>Proceso</Link>).
        </li>
        <li>
          Tener derecho a fotografiar y publicar el espacio: ser su titular o inquilino, o contar con la autorización de
          quien lo sea, y avisar a quienes viven o trabajan ahí.
        </li>
        <li>Que no haya personas en cada ambiente durante la toma.</li>
        <li>
          Que los textos, precios y datos que nos pase para los puntos de información sean ciertos. Son responsabilidad
          del Cliente.
        </li>
      </ul>
    ),
  },
  {
    id: 'entrega',
    titulo: 'Entrega y ajustes',
    contenido: (
      <>
        <p>
          Entregamos el link dentro de los <strong>{SERVICIO.entregaDiasHabiles} días hábiles</strong> posteriores a la
          visita, salvo que el presupuesto indique otro plazo.
        </p>
        <p>
          Mientras el tour esté alojado, los ajustes sobre lo ya capturado (nombres de ambientes, puntos de información,
          orden, vista inicial y difuminados) están incluidos y se hacen sobre el mismo link. Volver a fotografiar un
          ambiente o sumar ambientes nuevos se presupuesta aparte.
        </p>
      </>
    ),
  },
  {
    id: 'publicacion',
    titulo: 'Publicación y alojamiento',
    contenido: (
      <>
        <p>
          El tour es público para quien tenga el link. El Cliente decide dónde compartirlo o insertarlo, y puede pedirnos
          que lo despubliquemos en cualquier momento.
        </p>
        <p>
          Antes de que termine el alojamiento te avisamos por email para que puedas renovarlo. Si no se renueva, el tour
          se despublica y el link deja de funcionar. Las fotos originales sin difuminar las borramos a los{' '}
          {SERVICIO.conservacionOriginalesDias} días de la entrega.
        </p>
      </>
    ),
  },
  {
    id: 'propiedad',
    titulo: 'Propiedad intelectual y uso del tour',
    contenido: (
      <>
        <p>
          Las fotos 360, el tour y su diseño son obra de {MARCA.nombreComercial} y están protegidos por la Ley 11.723. Al
          pagar el servicio, el Cliente recibe una licencia no exclusiva para usar el tour y sus capturas para mostrar y
          promocionar ese espacio, en su web, portales, redes y avisos.
        </p>
        <p>
          No se permite revender el tour, usarlo para otro espacio ni editarlo de forma que muestre algo distinto de la
          realidad. Los logos y textos que nos pase el Cliente siguen siendo suyos; nos autoriza a usarlos solo dentro de
          su tour.
        </p>
        <p>
          Podemos mostrar el trabajo en nuestro portfolio, sin la dirección exacta si se trata de una vivienda. Si no
          querés que aparezca, avisanos y lo sacamos.
        </p>
      </>
    ),
  },
  {
    id: 'responsabilidad',
    titulo: 'Responsabilidad',
    contenido: (
      <>
        <p>
          El tour muestra el espacio tal como estaba el día de la visita. No es un relevamiento técnico ni sirve para
          tomar medidas exactas. Quien lo use en avisos es responsable de que la publicidad sea veraz, como exigen los
          artículos 7 y 8 de la Ley 24.240.
        </p>
        <p>
          Respondemos por los daños que causemos en el espacio durante la visita por nuestra culpa. Los tours se sirven a
          través de proveedores técnicos; hacemos lo posible para que estén siempre en línea y resolvemos cualquier
          interrupción lo antes posible.
        </p>
      </>
    ),
  },
  {
    id: 'reclamos',
    titulo: 'Consultas y reclamos',
    contenido: (
      <p>
        Cualquier consulta o reclamo podés hacerlo a <Dato valor={TITULAR.email} /> o al <Dato valor={TITULAR.telefono} />
        . Te confirmamos que lo recibimos y te respondemos dentro de los 10 días hábiles. Si sos consumidor, también podés
        acudir a la autoridad de defensa del consumidor de tu jurisdicción.
      </p>
    ),
  },
  {
    id: 'ley',
    titulo: 'Ley aplicable y jurisdicción',
    contenido: (
      <p>
        Estos términos se rigen por las leyes de la República Argentina. Ante cualquier diferencia, primero buscamos
        resolverla de forma directa. Si el Cliente es consumidor, son competentes los tribunales de su domicilio; en los
        demás casos, los tribunales ordinarios de la <Dato valor="PENDIENTE: jurisdicción (por ejemplo, Ciudad de Buenos Aires)" />
        .
      </p>
    ),
  },
  {
    id: 'web',
    titulo: 'Uso del sitio',
    contenido: (
      <p>
        Los textos, imágenes, diseño, logo y código del sitio son de {MARCA.nombreComercial} o se usan con autorización.
        No se permite copiarlos ni usarlos comercialmente sin permiso. Quien use el sitio se compromete a no cargar datos
        falsos ni de terceros sin su consentimiento. Cómo tratamos los datos personales lo contamos en la{' '}
        <Link to={RUTA_PRIVACIDAD}>política de privacidad</Link>.
      </p>
    ),
  },
  {
    id: 'modificaciones',
    titulo: 'Cambios en estos términos',
    contenido: (
      <p>
        Podemos actualizar estos términos. Cada versión indica su número y fecha arriba de todo. A cada contratación se le
        aplica la versión vigente el día en que se aceptó el presupuesto, así que los cambios posteriores no la afectan.
      </p>
    ),
  },
];

const TerminosCondiciones: React.FC = () => (
  <LegalPage
    eyebrow="Información legal"
    titulo="Términos y condiciones"
    intro={
      <p>
        Cómo trabajamos en {MARCA.nombreComercial}: qué incluye cada tour, cómo se contrata y se paga, qué pasa si
        necesitás cambiar la fecha y qué podés hacer con el tour una vez publicado. Están escritos para leerse rápido.
      </p>
    }
    secciones={secciones}
  />
);

export default TerminosCondiciones;