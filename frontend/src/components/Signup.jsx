import React, { useState } from "react";

export default function Signup({ onSignup, switchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Signup failed");
        setLoading(false);
        return;
      }
      // Auto-login after signup
      const loginRes = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });
      const loginData = await loginRes.json();
      const userRes = await fetch("http://localhost:8000/auth/me", {
        headers: { Authorization: `Bearer ${loginData.access_token}` },
      });
      const user = await userRes.json();
      onSignup({ ...user, token: loginData.access_token });
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow w-80">
      <h2 className="text-xl font-bold mb-4">Sign Up</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Name"
          className="border rounded p-2"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="border rounded p-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border rounded p-2"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-zinc-800 text-white rounded p-2" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </form>
      <p className="mt-2 text-sm text-zinc-500">
        Already have an account?{' '}
        <button className="underline" onClick={switchToLogin}>Login</button>
      </p>
    </div>
  );
}
