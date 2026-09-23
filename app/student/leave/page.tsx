"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

type LeaveRequest = {
    id: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
    createdAt?: unknown;
};

export default function StudentLeavePage() {
    const router = useRouter();

    const [studentId, setStudentId] = useState("");

    const [leaveType, setLeaveType] = useState("Sick Leave");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");

    const [requests, setRequests] = useState<LeaveRequest[]>([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ==============================
    // LOAD LOGGED-IN STUDENT
    // ==============================

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/login");
                return;
            }

            setStudentId(user.uid);

            await loadRequests(user.uid);

            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    // ==============================
    // LOAD LEAVE REQUESTS
    // ==============================

    const loadRequests = async (uid: string) => {
        try {
            const leaveQuery = query(
                collection(db, "leaveRequests"),
                where("studentId", "==", uid),
                orderBy("createdAt", "desc")
            );

            const snapshot = await getDocs(leaveQuery);

            const data: LeaveRequest[] = snapshot.docs.map((item) => {
                const value = item.data();

                return {
                    id: item.id,
                    leaveType: value.leaveType || "",
                    startDate: value.startDate || "",
                    endDate: value.endDate || "",
                    reason: value.reason || "",
                    status: value.status || "pending",
                    createdAt: value.createdAt,
                };
            });

            setRequests(data);
        } catch (error) {
            console.error("Error loading leave requests:", error);
        }
    };

    // ==============================
    // SUBMIT LEAVE REQUEST
    // ==============================

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!studentId) {
            setError("You must be logged in.");
            return;
        }

        if (!startDate || !endDate) {
            setError("Please select the start and end dates.");
            return;
        }

        if (endDate < startDate) {
            setError("End date cannot be before start date.");
            return;
        }

        if (!reason.trim()) {
            setError("Please provide a reason for your leave.");
            return;
        }

        try {
            setSubmitting(true);

            await addDoc(collection(db, "leaveRequests"), {
                studentId,
                leaveType,
                startDate,
                endDate,
                reason: reason.trim(),
                status: "pending",
                createdAt: serverTimestamp(),
            });

            setSuccess(
                "Leave request submitted successfully."
            );

            setLeaveType("Sick Leave");
            setStartDate("");
            setEndDate("");
            setReason("");

            await loadRequests(studentId);
        } catch (error) {
            console.error("Error submitting leave:", error);

            setError(
                "Unable to submit leave request. Please check your Firebase permissions."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ==============================
    // STATUS STYLE
    // ==============================

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case "approved":
                return "bg-green-100 text-green-700";

            case "rejected":
                return "bg-red-100 text-red-700";

            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-100">
                <p className="text-gray-600">
                    Loading leave requests...
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-100 p-6">
            <div className="mx-auto max-w-6xl">

                {/* HEADER */}

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
                            Student Portal
                        </p>

                        <h1 className="mt-1 text-3xl font-bold text-gray-900">
                            Leave Requests
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Request leave and track your previous requests.
                        </p>
                    </div>

                    <Link
                        href="/student/dashboard"
                        className="rounded-lg bg-gray-700 px-5 py-3 text-center font-semibold text-white transition hover:bg-gray-800"
                    >
                        ← Dashboard
                    </Link>

                </div>

                {/* MESSAGES */}

                {error && (
                    <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-700">
                        {success}
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-2">

                    {/* =========================
                        REQUEST FORM
                    ========================= */}

                    <section className="rounded-2xl bg-white p-7 shadow-sm">

                        <h2 className="text-xl font-bold text-gray-900">
                            Request Leave
                        </h2>

                        <p className="mt-1 text-gray-500">
                            Complete the form below to submit your request.
                        </p>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-6 space-y-5"
                        >

                            {/* LEAVE TYPE */}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Leave Type
                                </label>

                                <select
                                    value={leaveType}
                                    onChange={(e) =>
                                        setLeaveType(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                >
                                    <option value="Sick Leave">
                                        Sick Leave
                                    </option>

                                    <option value="Personal Leave">
                                        Personal Leave
                                    </option>

                                    <option value="Family Emergency">
                                        Family Emergency
                                    </option>

                                    <option value="Academic Leave">
                                        Academic Leave
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>
                                </select>
                            </div>

                            {/* DATES */}

                            <div className="grid gap-4 sm:grid-cols-2">

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Start Date
                                    </label>

                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) =>
                                            setStartDate(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        End Date
                                    </label>

                                    <input
                                        type="date"
                                        value={endDate}
                                        min={startDate}
                                        onChange={(e) =>
                                            setEndDate(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                        required
                                    />
                                </div>

                            </div>

                            {/* REASON */}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Reason
                                </label>

                                <textarea
                                    value={reason}
                                    onChange={(e) =>
                                        setReason(e.target.value)
                                    }
                                    placeholder="Explain the reason for your leave..."
                                    rows={5}
                                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    required
                                />
                            </div>

                            {/* SUBMIT */}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "Submit Leave Request"}
                            </button>

                        </form>
                    </section>

                    {/* =========================
                        INFORMATION
                    ========================= */}

                    <section className="rounded-2xl bg-white p-7 shadow-sm">

                        <h2 className="text-xl font-bold text-gray-900">
                            Leave Information
                        </h2>

                        <div className="mt-6 space-y-4">

                            <div className="rounded-xl bg-blue-50 p-5">
                                <h3 className="font-semibold text-blue-800">
                                    📋 Request Process
                                </h3>

                                <p className="mt-2 text-sm text-blue-700">
                                    Submit your request with the correct
                                    dates and a clear reason. Your teacher
                                    or administrator will review it.
                                </p>
                            </div>

                            <div className="rounded-xl bg-yellow-50 p-5">
                                <h3 className="font-semibold text-yellow-800">
                                    ⏳ Pending
                                </h3>

                                <p className="mt-2 text-sm text-yellow-700">
                                    Your request has been submitted and is
                                    waiting for approval.
                                </p>
                            </div>

                            <div className="rounded-xl bg-green-50 p-5">
                                <h3 className="font-semibold text-green-800">
                                    ✓ Approved
                                </h3>

                                <p className="mt-2 text-sm text-green-700">
                                    Your leave request has been approved.
                                </p>
                            </div>

                            <div className="rounded-xl bg-red-50 p-5">
                                <h3 className="font-semibold text-red-800">
                                    ✕ Rejected
                                </h3>

                                <p className="mt-2 text-sm text-red-700">
                                    Your request was not approved.
                                </p>
                            </div>

                        </div>
                    </section>

                </div>

                {/* =========================
                    PREVIOUS REQUESTS
                ========================= */}

                <section className="mt-8 rounded-2xl bg-white p-7 shadow-sm">

                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            My Previous Requests
                        </h2>

                        <p className="mt-1 text-gray-500">
                            Track the status of your leave requests.
                        </p>
                    </div>

                    {requests.length === 0 ? (
                        <div className="rounded-xl bg-gray-50 p-10 text-center">
                            <div className="text-4xl">
                                📄
                            </div>

                            <h3 className="mt-3 font-semibold text-gray-800">
                                No leave requests
                            </h3>

                            <p className="mt-1 text-gray-500">
                                You have not submitted a leave request yet.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="border-b bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                            Type
                                        </th>

                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                            Start
                                        </th>

                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                            End
                                        </th>

                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                            Reason
                                        </th>

                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {requests.map((request) => (
                                        <tr
                                            key={request.id}
                                            className="border-b last:border-b-0"
                                        >

                                            <td className="px-4 py-4 font-medium text-gray-900">
                                                {request.leaveType}
                                            </td>

                                            <td className="px-4 py-4 text-gray-600">
                                                {request.startDate}
                                            </td>

                                            <td className="px-4 py-4 text-gray-600">
                                                {request.endDate}
                                            </td>

                                            <td className="max-w-xs px-4 py-4 text-gray-600">
                                                {request.reason}
                                            </td>

                                            <td className="px-4 py-4">

                                                <span
                                                    className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${getStatusStyle(
                                                        request.status
                                                    )}`}
                                                >
                                                    {request.status}
                                                </span>

                                            </td>

                                        </tr>
                                    ))}

                                </tbody>

                            </table>

                        </div>
                    )}

                </section>

            </div>
        </main>
    );
}