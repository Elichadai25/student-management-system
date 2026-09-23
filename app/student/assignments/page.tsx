"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    collection,
    getDocs,
    query,
    orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type Assignment = {
    id: string;
    title: string;
    description: string;
    subject: string;
    dueDate: string;
    teacherId: string;
    createdAt?: unknown;
};

export default function StudentAssignmentsPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadAssignments = async () => {
            try {
                setLoading(true);
                setError("");

                const assignmentsQuery = query(
                    collection(db, "assignments"),
                    orderBy("createdAt", "desc")
                );

                const snapshot = await getDocs(assignmentsQuery);

                const data: Assignment[] = snapshot.docs.map((item) => {
                    const assignment = item.data();

                    return {
                        id: item.id,
                        title: assignment.title || "Untitled Assignment",
                        description: assignment.description || "",
                        subject: assignment.subject || "General",
                        dueDate: assignment.dueDate || "",
                        teacherId: assignment.teacherId || "",
                        createdAt: assignment.createdAt,
                    };
                });

                setAssignments(data);
            } catch (err) {
                console.error("Error loading assignments:", err);
                setError(
                    "Unable to load assignments. Please check your Firebase permissions."
                );
            } finally {
                setLoading(false);
            }
        };

        loadAssignments();
    }, []);

    return (
        <main className="min-h-screen bg-slate-100 p-6">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            My Assignments
                        </h1>

                        <p className="mt-2 text-gray-600">
                            View assignments given by your teachers.
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

                {/* Loading */}
                {loading && (
                    <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                        <p className="text-gray-600">
                            Loading assignments...
                        </p>
                    </div>
                )}

                {/* Empty */}
                {!loading && assignments.length === 0 && !error && (
                    <div className="rounded-xl bg-white p-12 text-center shadow-sm">

                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-3xl">
                            📝
                        </div>

                        <h2 className="text-xl font-bold text-gray-900">
                            No assignments yet
                        </h2>

                        <p className="mt-2 text-gray-600">
                            Your teacher has not created any assignments yet.
                        </p>

                    </div>
                )}

                {/* Assignments */}
                {!loading && assignments.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                        {assignments.map((assignment) => (
                            <div
                                key={assignment.id}
                                className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >

                                <div className="mb-4 flex items-center justify-between">

                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                                        {assignment.subject}
                                    </span>

                                    <span className="text-2xl">
                                        📝
                                    </span>

                                </div>

                                <h2 className="text-xl font-bold text-gray-900">
                                    {assignment.title}
                                </h2>

                                <p className="mt-3 line-clamp-3 text-gray-600">
                                    {assignment.description}
                                </p>

                                <div className="mt-5 border-t pt-4">

                                    <p className="text-sm text-gray-500">
                                        Due Date
                                    </p>

                                    <p className="mt-1 font-semibold text-red-600">
                                        {assignment.dueDate || "No deadline"}
                                    </p>

                                </div>

                                <Link
                                    href={`/student/assignments/${assignment.id}`}
                                    className="mt-5 block w-full rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
                                >
                                    View & Submit
                                </Link>

                            </div>
                        ))}

                    </div>
                )}

            </div>
        </main>
    );
}