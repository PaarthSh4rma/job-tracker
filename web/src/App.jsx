import { useEffect, useState } from "react";
import { API_BASE_URL } from "./config";

function App() {
  const [applications, setApplications] = useState([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("applied");

  const fetchApplications = async () => {
    const res = await fetch(`${API_BASE_URL}/applications`);
    const data = await res.json();
    setApplications(data);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch(`${API_BASE_URL}/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, role, status }),
    });

    setCompany("");
    setRole("");
    setStatus("applied");

    fetchApplications();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-6">Job Tracker</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4 mb-8">
          <input
            className="border p-2 rounded"
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />

          <input
            className="border p-2 rounded"
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />

          <select
            className="border p-2 rounded"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            type="submit"
            className="col-span-3 bg-black text-white py-2 rounded hover:opacity-80"
          >
            Add Application
          </button>
        </form>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Company</th>
              <th className="p-2">Role</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
<tr key={app.id} className="border-b hover:bg-gray-50">
  <td className="p-2">{app.company}</td>
  <td className="p-2">{app.role}</td>
  <td className="p-2">
    <select
      className="border rounded p-1"
      value={app.status}
      onChange={async (e) => {
        await fetch(`${API_BASE_URL}/applications/${app.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: e.target.value }),
        });
        fetchApplications();
      }}
    >
      <option value="applied">Applied</option>
      <option value="interview">Interview</option>
      <option value="offer">Offer</option>
      <option value="rejected">Rejected</option>
    </select>
  </td>
  <td className="p-2 text-right">
    <button
      className="text-sm px-3 py-1 rounded bg-red-600 text-white hover:opacity-80"
      onClick={async () => {
        await fetch(`${API_BASE_URL}/applications/${app.id}`, {
          method: "DELETE",
        });
        fetchApplications();
      }}
    >
      Delete
    </button>
  </td>
</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;