"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
    addDoc,
    collection,
    getDocs,
    serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Assignment = {
    id: string;
    title: string;
    description: string;
    subject: string;
    dueDate: string;
    maxMarks: number;
};

export default function AssignmentsPage() {
    const [showForm, setShowForm] = useState(false);
    const [assignments, setAssignments] = useState<Assignment[]>([]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [subject, setSubject] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [maxMarks, setMaxMarks] = useState("");

    const [loading, setLoading] = useState(false);
    const [loadingAssignments, setLoadingAssignments] = useState(true);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Load assignments
    const loadAssignments = async () => {
        try {
            setLoadingAssignments(true);

            const snapshot = await getDocs(
                collection(db, "assignments")
            );

            const assignmentData: Assignment[] = snapshot.docs.map(
                (document) => {
                    const data = document.data();

                    return {
                        id: document.id,
                        title: data.title || "",
                        description: data.description || "",
                        subject: data.subject || "",
                        dueDate: data.dueDate || "",
                        maxMarks: data.maxMarks || 0,
                    };
                }
            );

            setAssignments(assignmentData);
        } catch (error) {
            console.error("Error loading assignments:", error);

            setError(
                "Unable to load assignments. Please check your Firebase permissions."
            );
        } finally {
            setLoadingAssignments(false);
        }
    };

    useEffect(() => {
        loadAssignments();
    }, []);

    // Create assignment
    const handleCreateAssignment = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const user = auth.currentUser;

            if (!user) {
                setError(
                    "You are not logged in. Please login again."
                );
                return;
            }

            await addDoc(collection(db, "assignments"), {
                title: title.trim(),
                description: description.trim(),
                subject: subject.trim(),
                dueDate,
                maxMarks: Number(maxMarks),
                teacherId: user.uid,
                createdAt: serverTimestamp(),
            });

            setSuccess(
                "Assignment created successfully!"
            );

            // Clear form
            setTitle("");
            setDescription("");
            setSubject("");
            setDueDate("");
            setMaxMarks("");

            setShowForm(false);

            // Refresh assignments
            await loadAssignments();

        } catch (error: any) {
            console.error(
                "Create assignment error:",
                error
            );

            if (
                error?.code ===
                "permission-denied"
            ) {
                setError(
                    "Firebase denied permission to create assignments. We need to update your Firestore rules."
                );
            } else {
                setError(
                    "Could not create assignment. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-100 p-6">

            <div className="mx-auto max-w-6xl">

                {/* HEADER */}

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                            Teacher Portal
                        </p>

                        <h1 className="mt-1 text-3xl font-bold text-gray-900">
                            Assignments
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Create and manage assignments for your students.
                        </p>
                    </div>

                    <Link
                        href="/teacher/dashboard"
                        className="w-fit rounded-lg bg-gray-700 px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
                    >
                        ← Dashboard
                    </Link>

                </div>

                {/* ERROR */}

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {/* SUCCESS */}

                {success && (
                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
                        {success}
                    </div>
                )}

                {/* MAIN CARD */}

                <div className="rounded-2xl bg-white p-8 shadow-lg">

                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Your Assignments
                            </h2>

                            <p className="mt-1 text-gray-500">
                                {assignments.length} assignment
                                {assignments.length !== 1 ? "s" : ""}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(!showForm);
                                setError("");
                                setSuccess("");
                            }}
                            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                        >
                            {showForm
                                ? "✕ Cancel"
                                : "+ Create Assignment"}
                        </button>

                    </div>

                    {/* CREATE FORM */}

                    {showForm && (
                        <form
                            onSubmit={handleCreateAssignment}
                            className="mb-8 rounded-xl border border-blue-100 bg-blue-50 p-6"
                        >

                            <h3 className="mb-6 text-xl font-bold text-gray-900">
                                Create New Assignment
                            </h3>

                            <div className="grid gap-5 md:grid-cols-2">

                                {/* TITLE */}

                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Assignment Title
                                    </label>

                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                        placeholder="e.g. Database Design Assignment"
                                        required
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>

                                {/* SUBJECT */}

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Subject
                                    </label>

                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) =>
                                            setSubject(e.target.value)
                                        }
                                        placeholder="e.g. Information Management"
                                        required
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>

                                {/* DUE DATE */}

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Due Date
                                    </label>

                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) =>
                                            setDueDate(e.target.value)
                                        }
                                        required
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>

                                {/* MAX MARKS */}

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Maximum Marks
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        value={maxMarks}
                                        onChange={(e) =>
                                            setMaxMarks(e.target.value)
                                        }
                                        placeholder="100"
                                        required
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>

                                {/* DESCRIPTION */}

                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Description
                                    </label>

                                    <textarea
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                        placeholder="Describe what students need to do..."
                                        rows={5}
                                        required
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>

                            </div>

                            <div className="mt-6 flex gap-3">

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {loading
                                        ? "Creating..."
                                        : "Create Assignment"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowForm(false)
                                    }
                                    className="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-300"
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>
                    )}

                    {/* ASSIGNMENTS */}

                    {loadingAssignments ? (
                        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
                            <p className="text-gray-500">
                                Loading assignments...
                            </p>
                        </div>
                    ) : assignments.length === 0 ? (

                        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">

                            <div className="text-5xl">
                                📝
                            </div>

                            <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                No assignments yet
                            </h3>

                            <p className="mt-2 text-gray-500">
                                Create your first assignment for your students.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowForm(true)
                                }
                                className="mt-5 font-semibold text-blue-600 hover:underline"
                            >
                                + Create your first assignment
                            </button>

                        </div>

                    ) : (

                        <div className="grid gap-5 md:grid-cols-2">

                            {assignments.map(
                                (assignment) => (
                                    <div
                                        key={assignment.id}
                                        className="rounded-xl border border-gray-200 p-6 transition hover:shadow-md"
                                    >

                                        <div className="flex items-start justify-between gap-4">

                                            <h3 className="text-xl font-bold text-gray-900">
                                                {assignment.title}
                                            </h3>

                                            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                                {assignment.subject}
                                            </span>

                                        </div>

                                        <p className="mt-4 text-gray-600">
                                            {assignment.description}
                                        </p>

                                        <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-500">

                                            <span>
                                                📅 Due:{" "}
                                                {assignment.dueDate}
                                            </span>

                                            <span>
                                                🎯 Marks:{" "}
                                                {assignment.maxMarks}
                                            </span>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    )}

                </div>

            </div>

        </main>
    );
}
