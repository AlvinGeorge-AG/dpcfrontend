import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Users, FileText, Settings, LogOut, Menu } from "lucide-react";
import axios from "axios";
import logOut from "@/lib/logout";
import LoadingModal from "@/components/spinner";

export default function AdminDashboard() {
    const [active, setActive] = useState("dashboard");
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setloading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); // For modal
    const [userType, setUserType] = useState(""); // "patient" or "doctor"
    const navigate = useNavigate();
    // Fetch patients from backend
    const getPatients = async () => {
        setloading(true);
        try {
            const response = await axios.post("https://digital-patient-card-backend-839268888277.us-central1.run.app/admin/patients/all");
            if (response.status >= 200 && response.status < 300) {
                setPatients(response.data);
            }
        } catch (e) {
            console.log("Error fetching patients:", e);
        } finally {
            setloading(false);
        }
    };

    // Fetch doctors from backend
    const getDoctors = async () => {
        setloading(true);
        try {
            const response = await axios.post("https://digital-patient-card-backend-839268888277.us-central1.run.app/admin/doctors/all");
            if (response.status >= 200 && response.status < 300) {
                setDoctors(response.data);
            }
        } catch (e) {
            console.log("Error fetching doctors:", e);
        } finally {
            setloading(false);
        }
    };

    // Delete doctor via backend
    const deleteDoctor = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete doctor ${name}?`)) return;
        try {
            const response = await axios.delete(`https://digital-patient-card-backend-839268888277.us-central1.run.app/admin/doctor/${id}`);
            if (response.status >= 200 && response.status < 300) {
                getDoctors();
                alert("Doctor Deleted Successfully!");
            }
        } catch (e) {
            console.log("Error deleting doctor:", e.message || e.response?.data);
        }
    };

    const deletePatient = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete patient ${name}?`)) return;
        try {
            const response = await axios.delete(`https://digital-patient-card-backend-839268888277.us-central1.run.app/admin/patient/${id}`);
            if (response.status >= 200 && response.status < 300) {
                getPatients();
                alert("Patient Deleted Successfully!");
            }
        } catch (e) {
            console.log("Error deleting patient:", e.response?.data || e.message);
        }
    };

    //Verify Doctors
    const verifyDoctor = async (id) => {
        setloading(true);
        try {
            const response = await axios.post(`https://digital-patient-card-backend-839268888277.us-central1.run.app/admin/verify/doctor/${id}`);
            if (response.status >= 200 && response.status < 300) {
                console.log(await response.data);
                getDoctors();
                alert(response.data || "Verified !");
                setloading(false);
            }
        } catch (e) {
            console.log("Error verifying Doctor : " + e);
            alert("Error verifying Doctor");
            setloading(false);
        }
    }
    const closeModal = () => {
        setSelectedUser(null);
        setUserType("");
    };

    // Modal Component
    const UserDetailModal = ({ user, type }) => (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6 relative">
                <button
                    onClick={closeModal}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
                <h2 className="text-xl font-bold mb-4">{user.name}</h2>
                <div className="space-y-2 text-gray-700">
                    {type === "patient" && (
                        <>
                            <p><strong>ID:</strong> {user.id}</p>
                            <p><strong>Age:</strong> {user.age}</p>
                            <p><strong>Blood Group:</strong> {user.bloodgroup}</p>
                            <p><strong>Email:</strong> {user.email || "N/A"}</p>
                            <p><strong>Phone:</strong> {user.phoneNumber || "N/A"}</p>
                            <p><strong>Address:</strong> {user.address || "N/A"}</p>
                        </>
                    )}
                    {type === "doctor" && (
                        <>
                            <p><strong>ID:</strong> {user.id}</p>
                            <p><strong>Specialization:</strong> {user.specialization || "N/A"}</p>
                            <p><strong>Email:</strong> {user.email || "N/A"}</p>
                            <p><strong>Phone:</strong> {user.phoneNumber || "N/A"}</p>
                            <p><strong>Status:</strong> {user.status ? "Verified" : "Not Verified"}</p>
                        </>
                    )}
                </div>
                <div className="mt-4 flex gap-2">
                    {type === "doctor" && !user.status && (
                        <button
                            onClick={() => verifyDoctor(user.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-400"
                        >
                            Verify
                        </button>
                    )}
                    <button
                        onClick={() => {
                            type === "patient"
                                ? deletePatient(user.id, user.name)
                                : deleteDoctor(user.id, user.name);
                            closeModal();
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );


    useEffect(() => {
        getPatients();
        getDoctors();
    }, []);

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
        { id: "patients", label: "Patients", icon: <Users size={18} /> },
        { id: "doctors", label: "Doctors", icon: <Users size={18} /> },
        { id: "reports", label: "Reports", icon: <FileText size={18} /> },
        { id: "settings", label: "Settings", icon: <Settings size={18} /> },
    ];

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-50">
            {loading && <LoadingModal message="Loading Admin Dashboard...." />}

            {/* Mobile Header */}
            <header className="relative md:hidden flex justify-between items-center p-4 bg-gray-800 text-white shadow-md z-30">
                <h2 className="text-xl font-bold">Admin</h2>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <Menu size={24} />
                </button>
                {isMenuOpen && (
                    <div className="absolute top-full right-4 mt-2 w-64 bg-gray-800 text-white p-4 z-50 rounded-md shadow-lg">
                        <nav className="flex flex-col space-y-2">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActive(item.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className={`flex items-center gap-2 p-2 rounded-md w-full text-left transition-colors ${active === item.id ? "bg-gray-700" : "hover:bg-gray-600"}`}
                                >
                                    {item.icon} {item.label}
                                </button>
                            ))}
                        </nav>
                        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-center">
                            <button
                                onClick={async () => {
                                    setIsMenuOpen(false);
                                    await logOut("admin", navigate);
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-md text-red-400 hover:bg-gray-700"
                            >
                                <LogOut size={18} /> Logout
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex w-64 bg-white shadow-md p-6 flex-col">
                <h2 className="text-2xl font-bold mb-6">Digital Patient Card</h2>
                <nav className="flex-1 flex flex-col space-y-3">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActive(item.id)}
                            className={`flex items-center gap-2 p-2 rounded-md w-full text-left transition-colors ${active === item.id ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
                                }`}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
                <button
                    onClick={async () => await logOut("admin", navigate)}
                    className="mt-auto flex items-center gap-2 p-2 w-full rounded-md hover:bg-gray-100 text-red-500"
                >
                    <LogOut size={18} /> Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {/* Dashboard */}
                {active === "dashboard" && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Welcome, Admin!</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow border">
                                <h4 className="font-bold text-lg">Total Patients</h4>
                                <p className="text-3xl">{patients.length}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow border">
                                <h4 className="font-bold text-lg">Total Doctors</h4>
                                <p className="text-3xl">{doctors.length}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Patients */}
                {active === "patients" && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">All Patients</h3>
                        {patients.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {patients.map((p) => (
                                    <div
                                        key={p.id}
                                        className="p-4 bg-white rounded-lg shadow border flex flex-col justify-between"
                                    >
                                        <div>
                                            <p className="font-medium text-lg">{p.name}</p>
                                            <p className="text-sm text-gray-500">ID: {p.id}</p>
                                            <p className="text-sm text-gray-500">Age: {p.age}</p>
                                            <p className="text-sm text-gray-500">Blood Group: {p.bloodgroup}</p>
                                        </div>
                                        <button
                                            onClick={() => { setSelectedUser(p); setUserType("patient"); }}
                                            className="mt-2 px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-500 text-sm"
                                        >
                                            View
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No patients found.</p>
                        )}
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
                                            <p className="text-sm text-gray-500">Specialization: {d.specialization || "N/A"}</p>
                                        </div>
                                        <button
                                            onClick={() => { setSelectedUser(d); setUserType("doctor"); }}
                                            className="mt-2 px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-500 text-sm"
                                        >
                                            View
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No doctors found.</p>
                        )}
                    </div>
                )}

                {/* Render modal if user selected */}
                {selectedUser && <UserDetailModal user={selectedUser} type={userType} />}

                {/* Reports */}
                {active === "reports" && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Reports</h3>
                        <p>Generate and view reports here (placeholder).</p>
                    </div>
                )}

                {/* Settings */}
                {active === "settings" && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Settings</h3>
                        <p>Configure system preferences here (placeholder).</p>
                    </div>
                )}
            </main>
        </div>
    );
}