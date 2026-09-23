"use client";

import { FormEvent, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            // 1. Login with Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );

            const user = userCredential.user;

            console.log("Logged in UID:", user.uid);

            // 2. Get user's Firestore profile
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);

            // 3. Check if profile exists
            if (!userDoc.exists()) {
                setError(
                    "Your account exists, but your user profile was not found."
                );
                return;
            }

            const userData = userDoc.data();

            console.log("User profile:", userData);

            // 4. Check account status
            if (userData.status !== "approved") {
                setError(
                    "Your account has not been approved yet."
                );
                return;
            }

            // 5. Check role
            if (userData.role === "student") {
                router.push("/student/dashboard");
            } else if (userData.role === "teacher") {
                router.push("/teacher/dashboard");
            } else {
                setError("Invalid user role.");
            }

        } catch (error: any) {
            console.error("Login error:", error);

            if (error.code === "auth/invalid-credential") {
                setError("Invalid email or password.");
            } else if (
                error.code === "permission-denied" ||
                error.code === "firestore/permission-denied"
            ) {
                setError(
                    "You logged in, but Firebase denied access to your profile."
                );
            } else {
                setError(
                    "Something went wrong. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">

            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

                <div className="text-center">

                    <h1 className="text-3xl font-bold text-gray-800">
                        Student Management System
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Login to your account
                    </p>

                </div>

                {error && (
                    <div className="mt-6 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleLogin}
                    className="mt-8 space-y-5"
                >

                    <div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Enter your email"
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>

                    <div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Enter your password"
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

                {/* Register link */}
                <div className="mt-6 text-center">

                    <p className="text-sm text-gray-500">
                        Don't have an account?
                    </p>

                    <button
                        type="button"
                        onClick={() => router.push("/register")}
                        className="mt-2 font-semibold text-blue-600 hover:text-blue-800"
                    >
                        Create an account
                    </button>

                </div>

            </div>

        </main>
    );
}