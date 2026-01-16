import axios from "axios";


export default async function updateprofile(data) {
    try {

        console.log("data :" + data);
        const response = await axios.post("https://digitalpatientcardbackend.onrender.com/patient/update-profile", data);
        if (response.status >= 200 && response.status < 300) {
            console.log(await response.data || "");
            alert("Patient Profile Updated SuccessFully !");
        }
    } catch (e) {
        console.log(e.response.data || "Error occured!");
    }
}