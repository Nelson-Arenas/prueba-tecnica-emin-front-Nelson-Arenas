import { Link } from "react-router-dom"

export default function LoginView() {
    return (
        <> 
            <div>Login View</div>
            <nav>
                <Link to="/auth/register">Registrar</Link>
            </nav>
        </>
    )

}