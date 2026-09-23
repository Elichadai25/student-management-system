"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { useParams } from "next/navigation";

type Student = {
    name?: string;
    email?: string;
    role?: string;
    status?: string;
};

export default function StudentDetailsPage() {
    const params = useParams();
    const id = params.id as string;

    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadStudent = async () => {
            try {
                const studentRef = doc(db, "users", id);
                const studentSnap = await getDoc(studentRef);

                if (!studentSnap.exists()) {
                    setError("Student was not found.");
                    return;
                }

                const data = studentSnap.data();

                if (data.role !== "student") {
                    setError("This account is not a student.");
                    return;
                }

                setStudent(data as Student);
            } catch (err) {
                console.error("Error loading student:", err);
                setError("Unable to load student information.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadStudent();
        }
    }, [id]);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100">
                <p className="text-gray-600">Loading student...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-3xl">
                    <Link
                        href="/teacher/students"
                        className="inline-block rounded-lg bg-gray-700 px-5 py-3 font-semibold text-white"
                    >
                        ← Back to Students
                    </Link>

                    <div className="mt-6 rounded-xl bg-white p-8 shadow">
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-3xl">

                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Student Details
                        </h1>

                        <p className="mt-2 text-gray-600">
                            View student information.
                        </p>
                    </div>

                    <Link
                        href="/teacher/students"
                        className="rounded-lg bg-gray-700 px-5 py-3 font-semibold text-white hover:bg-gray-800"
                    >
                        ← Students
                    </Link>
                </div>

                <div className="rounded-xl bg-white p-8 shadow">

                    <div className="mb-8">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl">
                            🎓
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">

                        <div>
                            <p className="text-sm text-gray-500">
                                Full Name
                            </p>

                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                {student?.name || "Not provided"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Email
                            </p>

                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                {student?.email || "Not provided"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Role
                            </p>

                            <p className="mt-1 text-lg font-semibold text-gray-900">
                                Student
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Status
                            </p>

                            <span className="mt-1 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                {student?.status || "Active"}
                            </span>
                        </div>

                    </div>

                    <div className="mt-8 border-t pt-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            Academic Activities
                        </h2>

                        <div className="mt-4 grid gap-4 sm:grid-cols-3">

                            <Link
                                href="/teacher/attendance"
                                className="rounded-lg bg-blue-50 p-4 text-blue-700 hover:bg-blue-100"
                            >
                                <p className="font-semibold">
                                    Attendance
                                </p>
                                <p className="mt-1 text-sm">
                                    View attendance
                                </p>
                            </Link>

                            <Link
                                href="/teacher/assignments"
                                className="rounded-lg bg-green-50 p-4 text-green-700 hover:bg-green-100"
                            >
                                <p className="font-semibold">
                                    Assignments
                                </p>
                                <p className="mt-1 text-sm">
                                    Manage assignments
                                </p>
                            </Link>

                            <Link
                                href="/teacher/submissions"
                                className="rounded-lg bg-purple-50 p-4 text-purple-700 hover:bg-purple-100"
                            >
                                <p className="font-semibold">
                                    Submissions
                                </p>
                                <p className="mt-1 text-sm">
                                    View submitted work
                                </p>
                            </Link>

                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}