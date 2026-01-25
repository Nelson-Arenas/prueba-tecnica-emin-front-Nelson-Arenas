import { BrowserRouter,Routes,Route } from "react-router-dom";
import LoginView from "./views/loginView";
import RegisterView from "./views/registerView";

export function Router(){
    return(
        <BrowserRouter>
            <Routes>

                {/* Auth Routes */}
                <Route path="/auth/login" element={<LoginView />} />
                <Route path="/auth/register" element={<RegisterView />} />

                {/* App Routes */}

                
            </Routes>


        </BrowserRouter>
    )
}
