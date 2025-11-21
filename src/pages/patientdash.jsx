import { useEffect, useState } from "react";
import { FileText, Settings, LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logOut from "@/lib/logout";
import updateprofile from "@/lib/updateprofile";
import LoadingModal from "@/components/spinner";

export default function PatientDashboard() {
  const [active, setActive] = useState("doctors");
  const [diseases, setDiseases] = useState([]);
  const [diseaseInput, setDiseaseInput] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Patient profile states
  const [patientName, setPatientName] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodgroup, setBloodgroup] = useState("O+");
  const [bloodpressure, setBloodpressure] = useState("");
  const [sugar, setSugar] = useState("");
  const [smoking, setSmoking] = useState(false);
  const [age, setAge] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [allergies, setAllergies] = useState("");
  const [pastConditions, setPastConditions] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);


  const navigate = useNavigate();

  // Fetch patient data
  const getPatientData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://digital-patient-card-backend-839268888277.us-central1.run.app/patient/dashboard"
      );
      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        setPatientName(data.name || "");
        setUsername(data.username || "");
        setGender(data.gender || "");
        setHeight(data.height || "");
        setWeight(data.weight || "");
        setBloodgroup(data.bloodgroup || "O+");
        setBloodpressure(data.bloodpressure || "");
        setSugar(data.sugar || "");
        setSmoking(data.smoking || false);
        setAge(data.age || "");
        setPhoneNumber(data.phoneNumber || "");
        setAllergies(data.allergies || "");
        setPastConditions(data.pastconditions || "");
        setDiseases(data.diseases || []);
      }
    } catch (e) {
      console.error("Failed to fetch patient data:", e);
      alert("Error Occurred!");
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctors from backend
  const getDoctors = async () => {
    setLoading(true);
    try {
      const response = await axios.post("https://digital-patient-card-backend-839268888277.us-central1.run.app/admin/doctors/all");
      if (response.status >= 200 && response.status < 300) {
        setDoctors(await response.data);
        setLoading(false);
      }
    } catch (e) {
      console.log("Error fetching doctors:", e);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    getPatientData();
    getDoctors();
  }, []);


  // Download PDF
  const downloadPDF = async () => {
    if (!username) return alert("Username not available");
    try {
      const response = await axios.get(
        `https://digital-patient-card-backend-839268888277.us-central1.run.app/download/patient-pdf`,
        {
          params: { username },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "patient.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download PDF:", err);
      alert("Failed to download PDF");
    }
  };

  const handleDeleteDisease = async (id) => {
    if (!window.confirm(`Are you sure you want to delete the disease?`)) return;
    setLoading(true);
    try {
      await axios.delete(`https://digital-patient-card-backend-839268888277.us-central1.run.app/patient/delete-disease/${id}`);
      // Refresh the local diseases list (refetch or filter out the deleted one)
      getPatientData();
      setLoading(false);
      //setDiseases(diseases.filter((di) => di.id !== id));
    } catch (e) {
      alert("Error deleting disease. Please try again.");
      setLoading(false);
    }
  }


  const handleAppointment = (specialization, drname) => {
    navigate("/appointment", { state: { specialization: specialization, drname: drname } });
  };


  useEffect(() => {
    getPatientData();
  }, []);

  const navItems = [
    { id: "my-info", label: "My Info", icon: <FileText size={18} /> },
    { id: "doctors", label: "Doctors", icon: <FileText size={18} /> },
    { id: "Manage Diseases", label: "Manage Diseases", icon: <FileText size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {loading && <LoadingModal message="Loading Dashboard...."></LoadingModal>}

      {/* Mobile Header */}
      <header className="relative md:hidden flex justify-between items-center p-4 bg-cyan-700 text-white shadow-md z-30">
        <h2 className="text-xl font-bold">Patient</h2>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Menu size={24} />
        </button>
        {isMenuOpen && (
          <div className="absolute top-full right-4 mt-2 w-64 bg-cyan-700 text-white p-4 z-50 rounded-md shadow-lg">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActive(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md transition-colors ${active === item.id ? "bg-cyan-500" : "hover:bg-cyan-600"
                    }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-cyan-600 flex justify-center">
              <button
                onClick={async () => {
                  setIsMenuOpen(false);
                  await logOut("patient", navigate);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-cyan-600"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 bg-cyan-700 text-white flex-col">
        <div className="p-4 text-2xl font-bold border-b border-cyan-600">
          Patient Dashboard
        </div>
        <nav className="flex-1 p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md mb-2 transition-colors ${active === item.id ? "bg-cyan-500" : "hover:bg-cyan-600"
                }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-cyan-600">
          <button
            onClick={async () => await logOut("patient", navigate)}
            className="flex items-center gap-2 px-3 py-2 w-full hover:bg-cyan-600 rounded-md"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* My Info */}
        {active === "my-info" && (
          <div className="bg-white rounded-2xl shadow p-6 space-y-6 text-gray-700">
            <h2 className="text-xl font-semibold mb-4">My Info</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p>
                <span className="font-bold">Name:</span> {patientName || "N/A"}
              </p>
              <p>
                <span className="font-bold">Age:</span> {age || "N/A"}
              </p>
              <p>
                <span className="font-bold">Gender:</span> {gender || "N/A"}
              </p>
              <p>
                <span className="font-bold">Height:</span> {height || "N/A"} cm
              </p>
              <p>
                <span className="font-bold">Weight:</span> {weight || "N/A"} kg
              </p>
              <p>
                <span className="font-bold">Blood Group:</span> {bloodgroup || "N/A"}
              </p>
              <p>
                <span className="font-bold">Blood Pressure:</span> {bloodpressure || "N/A"}
              </p>
              <p>
                <span className="font-bold">Sugar Level:</span> {sugar || "N/A"}
              </p>
              <p>
                <span className="font-bold">Smoking:</span> {smoking ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-bold">Phone:</span> {phoneNumber || "N/A"}
              </p>
              <p>
                <span className="font-bold">Allergies:</span> {allergies || "None"}
              </p>
              <p>
                <span className="font-bold">Past Conditions:</span>{" "}
                {pastConditions || "None"}
              </p>
              <p>
                <span className="font-bold">Diseases:</span>{" "}
                {diseases.length > 0
                  ? diseases.map((d) => d.diseasename).join(", ")
                  : "None"}
              </p>
            </div>

            <button
              onClick={downloadPDF}
              className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              Download PDF
            </button>
          </div>
        )}

        {/* Doctors */}
        {active === "doctors" && (
          <div>
            <h3 className="text-xl font-semibold mb-4">All Doctors</h3>
            {doctors.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {doctors.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 bg-white rounded-lg shadow border flex flex-col justify-between"
                  >
                    <div>
                      <p className="font-medium text-lg">{d.name}</p>
                      <p className="text-sm text-gray-500">ID: {d.id}</p>
                      <p className="text-sm text-gray-500">
                        Department: {d.specialization || "N/A"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedDoctor(d);
                        handleAppointment(d.specialization, d.name);
                      }}
                      className="mt-2 px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-500 text-sm"
                    >
                      Appointment
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No doctors found.</p>
            )}

          </div>
        )}


        {/* Manage Diseases */}
        {active === "Manage Diseases" && (
          <div className="bg-white rounded-2xl shadow p-6 space-y-4 text-gray-700">
            <h2 className="text-xl font-semibold mb-4">Diseases</h2>
            <ul className="space-y-2">
              {diseases.map((d) => (
                <li
                  key={d.id}
                  className="bg-white shadow-sm rounded-xl p-4 flex flex-wrap justify-between items-center hover:shadow-md transition gap-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1 min-w-0">
                    <span className="font-medium text-gray-800 truncate">{d.diseasename}</span>
                    {d.verifiedDoctor && (
                      <span className="text-sm text-gray-500 truncate">
                        Verified By: Dr. {d.verifiedDoctor}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs sm:text-sm px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${d.status
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {d.status ? "Verified" : "Unverified"}
                  </span>
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteDisease(d.id)}
                    className="ml-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-full flex items-center"
                    title="Delete Disease"
                  >
                    Delete &#10006; {/* Unicode multiply/cross character as delete icon */}
                  </button>
                </li>
              ))}
            </ul>

          </div>
        )}

        {/* Settings */}
        {active === "settings" && (
          <div className="bg-white rounded-2xl shadow p-6 max-w-md mx-auto space-y-4">
            <h2 className="text-xl font-semibold mb-4">Edit My Info</h2>
            <div>
              <label className="block text-gray-600 mb-1">Name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Blood Pressure</label>
              <input
                type="text"
                value={bloodpressure}
                onChange={(e) => setBloodpressure(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Blood Group</label>
              <select
                value={bloodgroup}
                onChange={(e) => setBloodgroup(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Sugar Level (mg/dL)</label>
              <input
                type="text"
                value={sugar}
                onChange={(e) => setSugar(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={smoking}
                onChange={(e) => setSmoking(e.target.checked)}
              />
              <label>Smoking</label>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <button
              onClick={async () => {
                const data = {
                  gender,
                  height: parseInt(height) || 0,
                  weight: parseInt(weight) || 0,
                  bloodgroup,
                  bloodpressure,
                  sugar,
                  smoking,
                  age: parseInt(age) || 0,
                };
                await updateprofile(data);
              }}
              className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
            >
              Save Changes
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
