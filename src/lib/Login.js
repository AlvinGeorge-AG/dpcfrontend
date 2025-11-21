import axios from "axios";
import { useNavigate } from "react-router-dom";

const login = async (user, username, password, navigate, setloading, adminpin = "") => {
    setloading(true);
    try {
        const response = await axios.post(`https://digital-patient-card-backend-839268888277.us-central1.run.app/${user}/login`, null, {
            params: {
                username,
                password,
                adminpin
            }
        });
        if (response.status >= 200 && response.status < 300) {
            setloading(false);
            navigate(`/${user}-dashboard`);
            console.log(response.data);
        }
    } catch (err) {
        setloading(false);
        if (err.response?.data == "Patient Already Logged in!") {
            navigate(`/${user}-dashboard`);
        }
        if (err.response?.data == "Doctor Already Logged in") {
            navigate(`/${user}-dashboard`);
        }
        console.log("Error from backend:", err.response?.data || err.message);
        alert(err.response?.data || "Login failed , Check your network connection ");
    }
}

export default login;