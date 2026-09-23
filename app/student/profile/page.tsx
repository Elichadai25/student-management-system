"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type StudentProfile = {
    name?: string;
    fullName?: string;
    email?: string;
    studentId?: string;
    role?: string;
    phone?: string;
    program?: string;
    department?: string;
};

export default function StudentProfilePage() {
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setError("You must be logged in to view your profile.");
                setLoading(false);
                return;
            }

            try {
                const userRef = doc(db, "users", user.uid);
                const userSnapshot = await getDoc(userRef);

                if (userSnapshot.exists()) {
                    setProfile({
                        ...(userSnapshot.data() as StudentProfile),
                        email:
                            userSnapshot.data().email ||
                            user.email ||
                            "",
                    });
                } else {
                    // Still show basic Firebase account information
                    setProfile({
                        email: user.email || "",
                        role: "student",
                    });
                }
            } catch (err) {
                console.error("Profile error:", err);
                setError("Unable to load your profile.");
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-100">
                <div className="rounded-xl bg-white p-8 shadow">
                    <p className="text-gray-600">
                        Loading profile...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-100 p-6">
            <div className="mx-auto max-w-4xl">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            My Profile
                        </h1>

                        <p className="mt-2 text-gray-600">
                            View your student account information.
                        </p>
                    </div>

                    <Link
                        href="/student/dashboard"
                        className="rounded-lg bg-gray-700 px-5 py-3 text-center font-semibold text-white transition hover:bg-gray-800"
                    >
                        ← Dashboard
                    </Link>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {profile && (
                    <div className="overflow-hidden rounded-2xl bg-white shadow-lg">

                        {/* Profile Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                            <div className="flex flex-col items-center gap-5 sm:flex-row">

                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-4xl font-bold text-blue-600 shadow-lg">
                                    {(profile.fullName ||
                                        profile.name ||
                                        profile.email ||
                                        "S")
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div className="text-center sm:text-left">
                                    <h2 className="text-2xl font-bold">
                                        {profile.fullName ||
                                            profile.name ||
                                            "Student"}
                                    </h2>

                                    <p className="mt-1 text-blue-100">
                                        {profile.email || "No email"}
                                    </p>

                                    <span className="mt-3 inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-semibold">
                                        Student
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Information */}
                        <div className="p-8">

                            <h3 className="mb-6 text-xl font-bold text-gray-900">
                                Student Information
                            </h3>

                            <div className="grid gap-5 sm:grid-cols-2">

                                <div className="rounded-xl bg-gray-50 p-5">
                                    <p className="text-sm text-gray-500">
                                        Full Name
                                    </p>

                                    <p className="mt-1 font-semibold text-gray-900">
                                        {profile.fullName ||
                                            profile.name ||
                                            "Not provided"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-5">
                                    <p className="text-sm text-gray-500">
                                        Email
                                    </p>

                                    <p className="mt-1 break-all font-semibold text-gray-900">
                                        {profile.email ||
                                            "Not provided"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-5">
                                    <p className="text-sm text-gray-500">
                                        Student ID
                                    </p>

                                    <p className="mt-1 font-semibold text-gray-900">
                                        {profile.studentId ||
                                            "Not provided"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-5">
                                    <p className="text-sm text-gray-500">
                                        Role
                                    </p>

                                    <p className="mt-1 font-semibold capitalize text-gray-900">
                                        {profile.role || "student"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-5">
                                    <p className="text-sm text-gray-500">
                                        Program
                                    </p>

                                    <p className="mt-1 font-semibold text-gray-900">
                                        {profile.program ||
                                            "Not provided"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-5">
                                    <p className="text-sm text-gray-500">
                                        Department
                                    </p>

                                    <p className="mt-1 font-semibold text-gray-900">
                                        {profile.department ||
                                            "Not provided"}
                                    </p>
                                </div>

                            </div>

                            {/* Actions */}
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                                <Link
                                    href="/student/dashboard"
                                    className="rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Go to Dashboard
                                </Link>

                                <Link
                                    href="/student/assignments"
                                    className="rounded-lg border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                    View Assignments
                                </Link>

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}