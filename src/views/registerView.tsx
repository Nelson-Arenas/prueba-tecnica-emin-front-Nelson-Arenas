import { Link } from "react-router-dom";

export default function RegisterView() {
    return (
        <> 
            <div>Register View</div>
            <div>
                <img src="/grupo-emin.jpg" alt="Logotipo Emin" />
            </div>

            <nav>
                <Link to="/auth/login">Volver al login</Link>
            </nav>
        </>
    );    
}

