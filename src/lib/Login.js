import axios from "axios";
import { useNavigate } from "react-router-dom";

const login = async (user, username, password, navigate,setloading) => {
    setloading(true);
    try {
        const response = await axios.post(`http://localhost:8080/${user}/login`, null, {
            params: {
                username,
                password
            }
        });
        if (response.status >= 200 && response.status < 300) {
            setloading(false);
            navigate(`/${user}-dashboard`);
            console.log(response.data);
        }
    } catch (err) {
        setloading(false);
        if(err.response?.data=="Patient Already Logged in!"){
            navigate(`/${user}-dashboard`);
        }
        console.log("Error from backend:", err.response?.data || err.message);
        alert(err.response?.data || "Login failed , Check your network connection ");
    }
}

export default login;