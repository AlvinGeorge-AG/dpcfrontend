import axios from "axios";
import { useNavigate } from "react-router-dom";

const logOut = async (user, navigate) => {

    const response = await axios.post(`https://digital-patient-card-backend-839268888277.us-central1.run.app/${user}/logout`)
    console.log(response.data || "failed to get the rsponse !");
    if (response.status >= 200 && response.status < 300) {
        navigate("/", { replace: true });
    }
}

export default logOut;  