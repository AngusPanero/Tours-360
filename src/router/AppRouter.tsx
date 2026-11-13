import type { ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { SessionProvider } from "../contexts/SessionContext";
import Footer from "../footer/Footer";
import NavBarCorporate from "../navbar/NavBarCorporate";
import PoliticaCookiesCorporate from "../cookies/PoliticaCookiesCorporate";
import Contact from "../contact/Contact";
import Home from "../home/Home";
/* import Error from "../processMessages/Error"; */
import PrivateRoute from "./PrivateRoute";
import Error404 from "../processMessages/Error404";
/* import ProcessOk from "../processMessages/ProcessOk"; */
import Products from "../products/Products";
import Cookies from "../cookies/Cookies";
/* import Loader from "../loader/Loader"; */
import AdminDashboard from "../admin/AdminDashboard";
import PoliticaPrivacidad from "../PoliticasGenerales/PoliticasPrivacidad";
import CondicionesReserva from "../PoliticasGenerales/CondicionesReserva";
import UserDashboard from "../user/UserDashboard";
/* import MaintenanceGate from "../maintenance/MaintenanceGate"; */
import TourViewer from "../tours/TourViewer";
import Proceso from "../proceso/Proceso";
import Rubros from "../rubros/Rubros";
import Estudio from "../estudio/Estudio";

const SiteChrome = ({ children }: { children: ReactNode }) => {
    const { pathname } = useLocation();
    return pathname.startsWith("/tour/") ? null : <>{children}</>;
};

const AppRouter = () => {
    return (
        <Router>
            {/* <MaintenanceGate> */}
            <SessionProvider>
                <SiteChrome>
                    <Cookies />
                    <NavBarCorporate />
                </SiteChrome>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/tour/:slug" element={<TourViewer />} />
                    <Route path="/proceso" element={<Proceso />} />
                    <Route path="/rubros" element={<Rubros />} />
                    <Route path="/estudio" element={<Estudio />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/policy-cookies" element={<PoliticaCookiesCorporate />} />
                    <Route path="/policy-privacy" element={<PoliticaPrivacidad />} />
                    <Route path="/policy-terms" element={<CondicionesReserva />} />
                    <Route path="/*" element={<Error404 />} />
                    {/* <Route path="/loader" element={<Loader />} />
                    <Route path="/error" element={<Error errorMessage="Error 404: Página no encontrada" />} />
                    <Route path="/ok" element={<ProcessOk processMessage="Proceso completado con éxito" />} /> */}
                    {/* Tiene Acceso solo el admin con la prop pasada */}
                    <Route path="/admin" element={<PrivateRoute adminOnly={true}><AdminDashboard /></PrivateRoute>} />
                    <Route path="/dashboard" element={<PrivateRoute role="user"><UserDashboard /></PrivateRoute>} />
                </Routes>
                <SiteChrome>
                    <Footer />
                </SiteChrome>
            </SessionProvider>
            {/* </MaintenanceGate> */}
        </Router>
    );  
}

export default AppRouter;