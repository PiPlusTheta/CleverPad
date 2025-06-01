import React, { useState } from "react";

export default function Login({ onLogin, switchToSignup, onContinueAsGuest }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Login failed");
        setLoading(false);
        return;
      }
      const data = await res.json();
      // Fetch user info
      const userRes = await fetch("http://localhost:8000/auth/me", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const user = await userRes.json();
      onLogin({ ...user, token: data.access_token });
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow w-96 flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold mb-2">Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <input
          type="email"
          placeholder="Email"
          className="border rounded p-3 w-full"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border rounded p-3 w-full"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-zinc-800 text-white rounded p-3 font-semibold" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </form>
      <div className="flex flex-col items-center gap-2 w-full">
        <button
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded p-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          onClick={onContinueAsGuest}
        >
          Continue as Guest
        </button>
        <p className="text-sm text-zinc-500">
          Don't have an account?{' '}
          <button className="underline" onClick={switchToSignup}>Sign up</button>
        </p>
      </div>
    </div>
  );
}
