import axios from "axios";


const register = async (user, formData, navigate) => {
    const response = await axios.post(`https://digital-patient-card-backend-839268888277.us-central1.run.app/${user}/register`, {
        "username": formData.username,
        "password": formData.password,
        "name": formData.name,
        "address": formData.address,
        "email": formData.email,
        "phoneNumber": formData.phoneNumber,
        "age": formData.age,
        "specialization": formData.specialization,
        "address": formData.address
    })
    if (response.status >= 200 && response.status < 300) {
        alert(`${user} Registered Successfully!!`);
        navigate(`/${user}-dashboard`);
    }
}

export default register;