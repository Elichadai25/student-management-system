"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    collection,
    getDocs,
    orderBy,
    query,
    updateDoc,
    doc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

type LeaveRequest = {
    id: string;
    studentId: string;
    studentName: string;
    reason: string;
    startDate: string;
    endDate: string;
    status: string;
    createdAt?: unknown;
};

export default function TeacherLeavePage() {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                window.location.href = "/login";
                return;
            }

            await loadRequests();
        });

        return () => unsubscribe();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const requestsQuery = query(
                collection(db, "leaveRequests"),
                orderBy("createdAt", "desc")
            );

            const snapshot = await getDocs(requestsQuery);

            const data: LeaveRequest[] = snapshot.docs.map((item) => {
                const value = item.data();

                return {
                    id: item.id,
                    studentId: value.studentId || "",
                    studentName: value.studentName || "Student",
                    reason: value.reason || "",
                    startDate: value.startDate || "",
                    endDate: value.endDate || "",
                    status: value.status || "pending",
                    createdAt: value.createdAt,
                };
            });

            setRequests(data);
        } catch (err) {
            console.error("Error loading leave requests:", err);

            setError(
                "Unable to load leave requests. Check your Firebase rules and Firestore index."
            );
        } finally {
            setLoading(false);
        }
    };

    const updateRequest = async (
        requestId: string,
        status: "approved" | "rejected"
    ) => {
        try {
            setUpdatingId(requestId);

            await updateDoc(
                doc(db, "leaveRequests", requestId),
                {
                    status,
                }
            );

            setRequests((current) =>
                current.map((request) =>
                    request.id === requestId
                        ? { ...request, status }
                        : request
                )
            );
        } catch (err) {
            console.error("Error updating leave request:", err);

            alert(
                "Unable to update this leave request. Check your Firebase permissions."
            );
        } finally {
            setUpdatingId("");
        }
    };

    const pendingRequests = requests.filter(
        (request) => request.status === "pending"
    );

    const approvedRequests = requests.filter(
        (request) => request.status === "approved"
    );

    const rejectedRequests = requests.filter(
        (request) => request.status === "rejected"
    );

    return (
        <main className="min-h-screen bg-slate-100 p-6">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-yellow-600">
                            Teacher Portal
                        </p>

                        <h1 className="mt-1 text-3xl font-bold text-gray-900">
                            Leave Requests
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Review and manage student leave requests.
                        </p>
                    </div>

                    <Link
                        href="/teacher/dashboard"
                        className="rounded-lg bg-gray-700 px-5 py-3 text-center font-semibold text-white transition hover:bg-gray-800"
                    >
                        ← Dashboard
                    </Link>

                </div>


                {/* Statistics */}
                <div className="mb-8 grid gap-5 sm:grid-cols-3">

                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Pending
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-yellow-600">
                            {pendingRequests.length}
                        </h2>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Approved
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-green-600">
                            {approvedRequests.length}
                        </h2>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Rejected
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-red-600">
                            {rejectedRequests.length}
                        </h2>
                    </div>

                </div>


                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}


                {/* Loading */}
                {loading && (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

                        <p className="mt-4 text-gray-600">
                            Loading leave requests...
                        </p>
                    </div>
                )}


                {/* Empty */}
                {!loading && requests.length === 0 && !error && (
                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-3xl">
                            📄
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-gray-900">
                            No leave requests
                        </h2>

                        <p className="mt-2 text-gray-600">
                            There are currently no student leave requests.
                        </p>

                    </div>
                )}


                {/* Requests */}
                {!loading && requests.length > 0 && (
                    <div className="space-y-5">

                        {requests.map((request) => (
                            <div
                                key={request.id}
                                className="rounded-2xl bg-white p-6 shadow-sm"
                            >

                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                                    {/* Information */}
                                    <div className="flex-1">

                                        <div className="flex flex-wrap items-center gap-3">

                                            <h2 className="text-xl font-bold text-gray-900">
                                                {request.studentName}
                                            </h2>

                                            {request.status === "pending" && (
                                                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                                                    Pending
                                                </span>
                                            )}

                                            {request.status === "approved" && (
                                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                    Approved
                                                </span>
                                            )}

                                            {request.status === "rejected" && (
                                                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                                    Rejected
                                                </span>
                                            )}

                                        </div>

                                        <div className="mt-4 grid gap-4 sm:grid-cols-2">

                                            <div>
                                                <p className="text-xs font-medium uppercase text-gray-400">
                                                    Start Date
                                                </p>

                                                <p className="mt-1 font-semibold text-gray-800">
                                                    {request.startDate || "Not provided"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium uppercase text-gray-400">
                                                    End Date
                                                </p>

                                                <p className="mt-1 font-semibold text-gray-800">
                                                    {request.endDate || "Not provided"}
                                                </p>
                                            </div>

                                        </div>

                                        <div className="mt-4 rounded-xl bg-gray-50 p-4">

                                            <p className="text-xs font-medium uppercase text-gray-400">
                                                Reason
                                            </p>

                                            <p className="mt-2 text-gray-700">
                                                {request.reason || "No reason provided"}
                                            </p>

                                        </div>

                                    </div>


                                    {/* Actions */}
                                    {request.status === "pending" && (
                                        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">

                                            <button
                                                type="button"
                                                disabled={updatingId === request.id}
                                                onClick={() =>
                                                    updateRequest(
                                                        request.id,
                                                        "approved"
                                                    )
                                                }
                                                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {updatingId === request.id
                                                    ? "Updating..."
                                                    : "✓ Approve"}
                                            </button>

                                            <button
                                                type="button"
                                                disabled={updatingId === request.id}
                                                onClick={() =>
                                                    updateRequest(
                                                        request.id,
                                                        "rejected"
                                                    )
                                                }
                                                className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {updatingId === request.id
                                                    ? "Updating..."
                                                    : "✕ Reject"}
                                            </button>

                                        </div>
                                    )}

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </div>
        </main>
    );
}