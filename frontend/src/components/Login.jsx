import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

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
    <div className="p-8 bg-chatgpt-bg-element border border-chatgpt-border rounded-2xl shadow-lg w-96 flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-chatgpt-text-primary mb-2">Welcome back</h2>
        <p className="text-chatgpt-text-secondary text-sm">Sign in to your account</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        {error && <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">{error}</div>}
      </form>
      <div className="flex flex-col items-center gap-3 w-full">
        <Button
          variant="outline"
          className="w-full"
          onClick={onContinueAsGuest}
        >
          Continue as Guest
        </Button>
        <p className="text-sm text-chatgpt-text-secondary">
          Don't have an account?{' '}
          <button className="text-chatgpt-accent hover:underline font-medium" onClick={switchToSignup}>
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
