import { useEffect, useState } from "react";
import { FileText, Settings, LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import logOut from "@/lib/logout";
import LoadingModal from "@/components/spinner";

export default function AppointmentDiseasesPage() {
    const location = useLocation();
    const { specialization } = location.state || {};
    const { drname } = location.state || {};
    const [active, setActive] = useState("diseases");
    const [diseases, setDiseases] = useState([]);
    const [diseaseInput, setDiseaseInput] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [doctors, setDoctors] = useState([]);

    // Patient profile states
    const [patientName, setPatientName] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [filteredDiseases, setFilteredDiseases] = useState([])

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
                setDiseases(data.diseases || []);
            }
        } catch (e) {
            console.error("Failed to fetch patient data:", e);
            alert("Error Occurred!");
        } finally {
            setLoading(false);
        }
    };

    const getDoctors = async () => {
        try {
            const response = await axios.post("https://digital-patient-card-backend-839268888277.us-central1.run.app/admin/doctors/all");
            if (response.status >= 200 && response.status < 300) {
                setDoctors(response.data);
            }
        } catch (e) {
            console.log("Error fetching doctors:", e);
        }
    };

    useEffect(() => {
        getPatientData();
        getDoctors();
    }, []);

    useEffect(() => {
        if (!specialization || diseases.length === 0) {
            setFilteredDiseases([]);
            return;
        }
        // Filter correctly based on specialization
        setFilteredDiseases(diseases.filter(d => d.specialization === specialization));
    }, [diseases, specialization]);


    // Add a disease
    const addDisease = async () => {
        if (!diseaseInput) return;
        try {
            const response = await axios.post(
                "https://digital-patient-card-backend-839268888277.us-central1.run.app/patient/adddisease",
                null,
                { params: { description: diseaseInput, specialization: specialization } }
            );
            if (response.status >= 200 && response.status < 300) {
                getPatientData();
                setDiseaseInput("");
            }
        } catch (e) {
            console.error("Failed to add disease:", e);
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

    const navItems = [
        { id: "diseases", label: "Diseases", icon: <FileText size={18} /> },
        { id: "Manage Diseases", label: "Manage Diseases", icon: <FileText size={18} /> },
    ];

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-100">
            {loading && <LoadingModal message="Loading Appoinment...."></LoadingModal>}

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
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-2 mb-4 text-cyan-600 hover:underline">&larr;Back to Dashboard</button>

                {/* Diseases */}
                {active === "diseases" && (
                    <div className="bg-white rounded-2xl shadow p-6 space-y-4 text-gray-700">
                        <h2 className="text-xl font-semibold mb-4"><span>Appointment for Dr. {drname} Under the Department {specialization}</span><br />Diseases</h2>
                        <div className="flex gap-2 mb-6">
                            <input
                                value={diseaseInput}
                                onChange={(e) => setDiseaseInput(e.target.value)}
                                placeholder="Enter disease"
                                className="px-3 py-2 border rounded-lg flex-1 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            />
                            <button
                                onClick={addDisease}
                                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
                            >
                                Add
                            </button>
                        </div>
                        {filteredDiseases.length > 0 ? (
                            <ul className="space-y-2">
                                {filteredDiseases.map((d) => (
                                    <li
                                        key={d.id}
                                        className="bg-white shadow-sm rounded-xl p-4 flex flex-wrap justify-between items-center hover:shadow-md transition gap-2"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1 min-w-0">
                                            <span className="font-medium text-gray-800 truncate">{d.diseasename}</span>

                                            {d.verifiedDoctor && (
                                                <div className="flex items-center gap-1 text-sm text-gray-500 truncate">
                                                    <span>Verified By: Dr. {d.verifiedDoctor}</span>
                                                    <img
                                                        src={
                                                            d.isDoctorVerified === true
                                                                ? "xmark.png"
                                                                : "check.png"
                                                        }
                                                        alt="Doctor verification status"
                                                        className="w-4 h-4 mt-[2px]"
                                                    />
                                                </div>
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
                                    </li>
                                ))}
                            </ul>
                        ) : "No Appoinments For this Doctor!"}


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


            </main>
        </div>
    );
}
