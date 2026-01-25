import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginView from "./views/loginView";
import RegisterView from "./views/registerView";
import DashboardView from "./views/dashboardView";
import EmpresaView from "./views/empresaView.tsx";
import ActivoView from "./views/activoView.tsx";

export function Router() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Auth Routes */}
                <Route path="/auth/login" element={<LoginView />} />
                <Route path="/auth/register" element={<RegisterView />} />

                {/* App Routes */}
                <Route path="/home">
                    <Route index={true} path="dashboard" element={<DashboardView />} />
                    <Route path="empresa" element={<EmpresaView />} />
                    <Route path="activos" element={<ActivoView />} />
                </Route>


            </Routes>


        </BrowserRouter>
    )
}
