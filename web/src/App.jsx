import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [applications, setApplications] = useState([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("applied");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchApplications();
    // eslint-disable-next-line
  }, [session]);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) alert(error.message);
    else setApplications(data || []);
  };

  const signUp = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Signed up! You can now log in.");
  };

  const signIn = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setApplications([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("applications").insert([
      {
        user_id: session.user.id,
        company,
        role,
        status,
      },
    ]);

    if (error) alert(error.message);

    setCompany("");
    setRole("");
    setStatus("applied");

    fetchApplications();
  };

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) alert(error.message);

    fetchApplications();
  };

  const deleteApp = async (id) => {
    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", id);

    if (error) alert(error.message);

    fetchApplications();
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold mb-6">Job Tracker</h1>

          <form className="space-y-4">
            <input
              className="w-full border p-2 rounded"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
            <input
              className="w-full border p-2 rounded"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />

            <button
              onClick={signIn}
              className="w-full bg-black text-white py-2 rounded hover:opacity-80"
            >
              Sign in
            </button>

            <button
              onClick={signUp}
              className="w-full border py-2 rounded hover:bg-gray-50"
            >
              Sign up
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Job Tracker</h1>
            <p className="text-sm text-gray-600">{session.user.email}</p>
          </div>
          <button
            onClick={signOut}
            className="bg-black text-white px-4 py-2 rounded hover:opacity-80"
          >
            Sign out
          </button>
        </div>

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
              <th className="p-2 text-right">Actions</th>
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
                    onChange={(e) =>
                      updateStatus(app.id, e.target.value)
                    }
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
                    onClick={() => deleteApp(app.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {applications.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-gray-500">
                  No applications yet — add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;