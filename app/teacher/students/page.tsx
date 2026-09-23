"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Student = {
    id: string;
    name: string;
    email: string;
    status?: string;
};

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadStudents = async () => {
            try {
                setLoading(true);
                setError("");

                const snapshot = await getDocs(collection(db, "users"));

                const studentList: Student[] = snapshot.docs
                    .map((document) => {
                        const data = document.data();

                        return {
                            id: document.id,
                            name: data.name || data.displayName || "Unnamed Student",
                            email: data.email || "",
                            status: data.status || "Active",
                        };
                    })
                    .filter((student) => {
                        const data = snapshot.docs
                            .find((doc) => doc.id === student.id)
                            ?.data();

                        return data?.role === "student";
                    });

                setStudents(studentList);
            } catch (err) {
                console.error("Error loading students:", err);
                setError(
                    "Unable to load students. Please check your Firebase permissions."
                );
            } finally {
                setLoading(false);
            }
        };

        loadStudents();
    }, []);

    const filteredStudents = students.filter((student) => {
        const searchText = search.toLowerCase();

        return (
            student.name.toLowerCase().includes(searchText) ||
            student.email.toLowerCase().includes(searchText)
        );
    });

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Manage Students
                        </h1>

                        <p className="mt-2 text-gray-600">
                            View and manage registered students.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href="/teacher/dashboard"
                            className="rounded-lg bg-gray-700 px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
                        >
                            ← Dashboard
                        </Link>

                        <Link
                            href="/teacher/students/add"
                            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                        >
                            + Add Student
                        </Link>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6 rounded-xl bg-white p-5 shadow">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search students by name or email..."
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {/* Students table */}
                <div className="overflow-hidden rounded-xl bg-white shadow">
                    <div className="overflow-x-auto">

                        {loading ? (
                            <div className="p-12 text-center text-gray-500">
                                Loading students...
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="text-5xl">🎓</div>

                                <h2 className="mt-4 text-xl font-semibold text-gray-800">
                                    No students found
                                </h2>

                                <p className="mt-2 text-gray-500">
                                    {search
                                        ? "Try a different search."
                                        : "No students have registered yet."}
                                </p>

                                {!search && (
                                    <Link
                                        href="/teacher/students/add"
                                        className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                                    >
                                        + Add Student
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <table className="w-full">

                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                            Name
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                            Email
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredStudents.map((student) => (
                                        <tr
                                            key={student.id}
                                            className="border-t transition hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-5 font-medium text-gray-900">
                                                {student.name}
                                            </td>

                                            <td className="px-6 py-5 text-gray-600">
                                                {student.email}
                                            </td>

                                            <td className="px-6 py-5">
                                                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                                    {student.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5">
                                                <Link
                                                    href={`/teacher/students/${student.id}`}
                                                    className="font-medium text-blue-600 hover:underline"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
}