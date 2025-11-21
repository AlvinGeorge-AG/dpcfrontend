import { useEffect, useState } from "react";
import { Users, FileText, Calendar, Settings as SettingsIcon, LogOut, UserPlus, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logOut from "@/lib/logout";
import axios from "axios";
import LoadingModal from "@/components/spinner";

export default function DoctorDashboard() {
    const [active, setActive] = useState("patients");
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const [doctorDetails, setDoctorDetails] = useState({ referrals: [] });
    const [editMode, setEditMode] = useState(false);
    const [referral, setReferral] = useState({ patientUsername: "", referredDoctorUsername: "", remarks: "" });
    const [patients, setpatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setloading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [patientsfordoctor, setpatientsfordoctor] = useState([]);

    const doctordashboard = async () => {
        setloading(true);
        try {
            const response = await axios.get("https://digital-patient-card-backend-839268888277.us-central1.run.app/doctor/dashboard");
            if (response.status >= 200 && response.status < 300) {
                setDoctorDetails(response.data);
            }
        }
        catch (e) {
            console.log(e.response?.data || "Error");
            alert("Error Occured !");
        } finally {
            setloading(false);
        }
    }

    const findpatients = async () => {
        try {
            const response = await axios.post("https://digital-patient-card-backend-839268888277.us-central1.run.app/admin/patients/all");
            if (response.status >= 200 && response.status < 300) {
                setpatients(response.data);
            }
        } catch (e) {
            console.log(e.response?.data || "Error fetching patients!!");
        }
    }






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
        findpatients();
        doctordashboard();
        getDoctors();
    }, [])

    useEffect(() => {
        const filtered_Patients = [];

        patients.forEach(patient => {
            if (patient.diseases.some(d => d.specialization === doctorDetails.specialization)) {
                filtered_Patients.push(patient);
            }
        });

        setpatientsfordoctor(filtered_Patients);
    }, [patients])

    const filteredPatients = patients.filter(
        (p) =>
            p.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const verifyDisease = async (patientId, diseaseid) => {
        setloading(true);
        try {
            const response = await axios.post("https://digital-patient-card-backend-839268888277.us-central1.run.app/doctor/verify", null, {
                params: { patientId, diseaseid }
            });
            if (response.status >= 200 && response.status < 300) {
                findpatients();
                setloading(false);
            }
        } catch (e) {
            console.log(e.response?.data || "Error , Cant verify patient disease!");
            setloading(false);
        }
    };

    const handleDoctorUpdate = () => {
        setEditMode(false);
        alert("Doctor details updated (placeholder)");
    };

    const handleReferralSubmit = async () => {
        if (!referral.patientUsername || !referral.referredDoctorUsername || !referral.remarks) {
            alert("Please select a patient, a doctor, and provide remarks.");
            return;
        }
        setloading(true);
        try {
            const response = await axios.post("https://digital-patient-card-backend-839268888277.us-central1.run.app/doctor/refer", null, {
                params: {
                    patientusername: referral.patientUsername,
                    referredDoctorUsername: referral.referredDoctorUsername,
                    remarks: referral.remarks
                }
            });
            if (response.status >= 200 && response.status < 300) {
                alert("Referral submitted successfully!");
                setReferral({ patientUsername: "", referredDoctorUsername: "", remarks: "" });
                doctordashboard();
            }
        } catch (e) {
            console.error("Error submitting referral:", e.response?.data || e.message);
            alert("Failed to submit referral. Please try again.");
        } finally {
            setloading(false);
        }
    };

    const downloadPDF = async (username) => {
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

    // --- Sort referrals to show the latest one on top ---
    const sortedReferrals = [...(doctorDetails.referrals || [])].sort((a, b) => b.id - a.id);

    const navItems = [
        { id: "patients", label: "Patients", icon: <Users size={18} /> },
        { id: "reports", label: "Reports", icon: <FileText size={18} /> },
        { id: "appointments", label: "Appointments", icon: <Calendar size={18} /> },
        { id: "referral", label: "Referral", icon: <UserPlus size={18} /> },
        { id: "settings", label: "Settings", icon: <SettingsIcon size={18} /> },
    ];

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-50">
            {loading && (<LoadingModal message="Loading Dashboard...." />)}

            <header className="relative md:hidden flex justify-between items-center p-4 bg-cyan-700 text-white shadow-md z-30">
                <h2 className="text-xl font-bold">Doctor</h2>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <Menu size={24} />
                </button>
                {isMenuOpen && (
                    <div className="absolute top-full right-4 mt-2 w-64 bg-cyan-700 text-white p-4 z-50 rounded-md shadow-lg">
                        <nav className="flex flex-col space-y-2">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => { setActive(item.id); setIsMenuOpen(false); }}
                                    className={`flex items-center gap-2 p-2 rounded-md w-full text-left transition-colors ${active === item.id ? "bg-cyan-600" : "hover:bg-cyan-500"}`}
                                >
                                    {item.icon} {item.label}
                                </button>
                            ))}
                        </nav>
                        <div className="mt-4 pt-4 border-t border-cyan-600 flex justify-center">
                            <button onClick={async () => { setIsMenuOpen(false); await logOut("doctor", navigate); }} className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-cyan-500">
                                <LogOut size={18} /> Logout
                            </button>
                        </div>
                    </div>
                )}
            </header>

            <aside className="hidden md:flex w-64 bg-cyan-700 text-white shadow-md p-6 flex-col">
                <h2 className="text-2xl font-bold mb-6">Doctor Dashboard</h2>
                <nav className="flex-1 flex flex-col space-y-3">
                    {navItems.map((item) => (
                        <button key={item.id} onClick={() => setActive(item.id)} className={`flex items-center gap-2 p-2 rounded-md w-full text-left transition-colors ${active === item.id ? "bg-cyan-600" : "hover:bg-cyan-500"}`}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
                <button onClick={async () => await logOut("doctor", navigate)} className="mt-auto flex items-center gap-2 p-2 w-full rounded-md hover:bg-cyan-500 text-white">
                    <LogOut size={18} /> Logout
                </button>
            </aside>

            <main className="flex-1 p-6 overflow-y-auto">
                {active === "patients" && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl font-semibold">Welcome Dr.{" " + doctorDetails.name}</span>
                            <img width={20} height={20} style={{ marginTop: "2px" }} src={doctorDetails.status ? 'check.png' : 'xmark.png'} alt="Status icon" />
                        </div>
                        <input type="text" placeholder="Search patients by username " className="w-full mb-4 p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" onChange={(e) => setSearchTerm(e.target.value)} />
                        {filteredPatients.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {patientsfordoctor.map((p) => (
                                    <div key={p.id} className="p-4 bg-white rounded-lg shadow-sm border">
                                        <p className="font-medium text-lg">{p.name}</p>
                                        <p className="text-sm text-gray-500">ID: {p.id}</p>
                                        <p className="text-sm text-gray-500">Age: {p.age}</p>
                                        <p className="text-sm text-gray-500">Username: {p.username}</p>
                                        <div className="space-y-1">
                                            {p.diseases.map((d) => (
                                                <div key={d.id} className="flex items-center justify-between">
                                                    <span className={`text-sm ${d.status ? "text-green-600" : "text-red-600"}`}>{d.diseasename} ({d.status ? "Verified" : "Unverified"})</span>
                                                    <button onClick={() => verifyDisease(p.id, d.id)} className={`px-2 py-1 text-xs rounded-md text-white ${d.status ? 'bg-red-500 hover:bg-red-400' : 'bg-green-500 hover:bg-green-400'}`}>{d.status ? "Unverify" : "Verify"}</button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => { downloadPDF(p.username) }}
                                            className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                                        >
                                            Download DPC
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (<p className="text-gray-500">No matching patients found.</p>)}
                    </div>
                )}

                {active === "reports" && <div className="text-center text-gray-500">Reports Section Coming Soon</div>}
                {active === "appointments" && <div className="text-center text-gray-500">Appointments Section Coming Soon</div>}

                {active === "settings" && (
                    <div className="max-w-md bg-white p-6 rounded-lg shadow-md border">
                        <h3 className="text-xl font-semibold mb-4">Doctor Details</h3>
                        <div className="space-y-3">
                            {["name", "specialization", "email", "phoneNumber"].map((field) => (
                                <div key={field} className="flex justify-between items-center">
                                    <span className="font-medium capitalize">{field.replace(/([A-Z])/g, ' $1')}:</span>
                                    {editMode ? (<input className="border px-2 py-1 rounded-md" value={doctorDetails[field] || ''} onChange={(e) => setDoctorDetails({ ...doctorDetails, [field]: e.target.value, })} />) : (<span>{doctorDetails[field]}</span>)}
                                </div>
                            ))}
                            <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-400" onClick={editMode ? handleDoctorUpdate : () => setEditMode(true)}>{editMode ? "Save Changes" : "Edit Details"}</button>
                        </div>
                    </div>
                )}

                {active === "referral" && (
                    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md border space-y-6">
                        <h3 className="text-2xl font-bold text-gray-800 border-b pb-3">Doctor Referrals</h3>
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-700">Create New Referral</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Select Patient</label>
                                <select className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-cyan-500" value={referral.patientUsername} onChange={(e) => setReferral({ ...referral, patientUsername: e.target.value })}>
                                    <option value="">-- Select a Patient --</option>
                                    {patients.map((p) => (<option key={p.id} value={p.username}>{p.name} ({p.username})</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Refer To Doctor</label>
                                <select className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-cyan-500" value={referral.referredDoctorUsername} onChange={(e) => setReferral({ ...referral, referredDoctorUsername: e.target.value })}>
                                    <option value="">-- Select a Doctor --</option>
                                    {doctors.filter((d) => d.username !== doctorDetails.username).map((d) => (<option key={d.id} value={d.username}>Dr. {d.name} ({d.specialization})</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Remarks / Reason</label>
                                <textarea placeholder="Reason for referral..." className="w-full p-2 border rounded-md min-h-[100px] focus:ring-2 focus:ring-cyan-500" value={referral.remarks} onChange={(e) => setReferral({ ...referral, remarks: e.target.value })} />
                            </div>
                            <button className="w-full px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition-colors" onClick={handleReferralSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit Referral'}</button>
                        </div>

                        {/* --- UPDATED REFERRAL HISTORY SECTION --- */}
                        <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-gray-700 pt-4 border-t">Your Referral History</h4>
                            {sortedReferrals.length > 0 ? (
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                    {sortedReferrals.map((r) => (
                                        <div key={r.id} className="p-3 bg-gray-50 border rounded-md">
                                            <p className="font-medium text-gray-800">Patient: {r.patientUsername}</p>
                                            <p className="text-sm text-gray-600">Referred From: Dr. {r.referringDoctor}</p>
                                            <p className="text-sm text-gray-600">Referred to: Dr. {r.referredDoctor}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                <span className="font-medium">Remarks:</span> {r.reason}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (<p className="text-gray-500 text-sm italic">You have not made any referrals yet.</p>)}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}