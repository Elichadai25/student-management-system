"use client";

import { FormEvent, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            // 1. Create account in Firebase Authentication
            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            // 2. Create user profile in Firestore
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                role: role,
                status: "pending",
                createdAt: new Date(),
            });

            // 3. Show success message
            setSuccess(
                "Account created successfully! Please wait for approval."
            );

            // 4. Redirect to login
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (error: any) {
            console.error("Registration error:", error);

            if (error.code === "auth/email-already-in-use") {
                setError("This email is already registered.");
            } else if (error.code === "auth/weak-password") {
                setError(
                    "Password is too weak. Please use at least 6 characters."
                );
            } else if (error.code === "auth/invalid-email") {
                setError("Please enter a valid email address.");
            } else {
                setError(
                    "Registration failed. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10">

            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-200 opacity-40 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-200 opacity-40 blur-3xl" />
            </div>

            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl text-white">
                        🎓
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800">
                        Student Management System
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Create your account
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mt-6 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div className="mt-6 rounded-lg bg-green-100 p-3 text-sm text-green-700">
                        {success}
                    </div>
                )}

                {/* Form */}
                <form
                    onSubmit={handleRegister}
                    className="mt-8 space-y-5"
                >

                    {/* Name */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Full Name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            placeholder="Enter your full name"
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Email */}
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

                    {/* Password */}
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
                            placeholder="At least 6 characters"
                            minLength={6}
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Account Type
                        </label>

                        <select
                            value={role}
                            onChange={(e) =>
                                setRole(e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="student">
                                Student
                            </option>

                            <option value="teacher">
                                Teacher
                            </option>
                        </select>
                    </div>

                    {/* Register button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Already have an account?
                    </p>

                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="mt-2 font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                        ← Back to Login
                    </button>
                </div>
            </div>
        </main>
    );
}