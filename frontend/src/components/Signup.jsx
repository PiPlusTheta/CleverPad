import React, { useState } from "react";
import { UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

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
    <div className="w-full max-w-md mx-auto">      <div className="bg-chatgpt-bg-element border border-chatgpt-border rounded-xl shadow-sm p-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-chatgpt-bg-secondary rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-chatgpt-text-secondary" />
          </div>          <h1 className="text-lg font-semibold text-chatgpt-text-primary mb-2">
            Create your account
          </h1>
          <p className="text-xs text-chatgpt-text-secondary">
            Welcome! Please fill in the details to get started.
          </p>
        </div>        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <span className="text-xs text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>            <label htmlFor="name" className="block text-xs font-medium text-chatgpt-text-primary mb-2">
              Full name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>          <div>
            <label htmlFor="email" className="block text-sm font-medium text-chatgpt-text-primary mb-2">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-chatgpt-text-primary mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full mt-6" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-chatgpt-text-secondary">
            Already have an account?{' '}
            <button 
              onClick={switchToLogin}
              className="font-medium text-chatgpt-accent hover:opacity-80 transition-opacity"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
