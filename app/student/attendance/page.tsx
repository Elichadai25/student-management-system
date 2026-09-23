"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    collection,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

type AttendanceRecord = {
    id: string;
    studentId: string;
    studentName?: string;
    date: string;
    status: "present" | "absent" | "late";
    subject?: string;
};

export default function StudentAttendancePage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setError("You must be logged in to view attendance.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const attendanceQuery = query(
                    collection(db, "attendance"),
                    where("studentId", "==", user.uid)
                );

                const snapshot = await getDocs(attendanceQuery);

                const data: AttendanceRecord[] = snapshot.docs.map((doc) => {
                    const item = doc.data();

                    return {
                        id: doc.id,
                        studentId: item.studentId,
                        studentName: item.studentName || "Student",
                        date: item.date || "",
                        status: item.status || "absent",
                        subject: item.subject || "General",
                    };
                });

                // Newest first
                data.sort((a, b) =>
                    b.date.localeCompare(a.date)
                );

                setRecords(data);
            } catch (err) {
                console.error("Attendance error:", err);

                setError(
                    "Unable to load attendance. Please check your Firebase permissions."
                );
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const total = records.length;

    const present = records.filter(
        (record) => record.status === "present"
    ).length;

    const absent = records.filter(
        (record) => record.status === "absent"
    ).length;

    const late = records.filter(
        (record) => record.status === "late"
    ).length;

    const percentage =
        total > 0 ? Math.round((present / total) * 100) : 0;

    const statusStyle = (status: string) => {
        if (status === "present") {
            return "bg-green-100 text-green-700";
        }

        if (status === "late") {
            return "bg-yellow-100 text-yellow-700";
        }

        return "bg-red-100 text-red-700";
    };

    return (
        <main className="min-h-screen bg-slate-100 p-6">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            My Attendance
                        </h1>

                        <p className="mt-2 text-gray-600">
                            View your attendance records and attendance percentage.
                        </p>
                    </div>

                    <Link
                        href="/student/dashboard"
                        className="rounded-lg bg-gray-700 px-5 py-3 text-center font-semibold text-white hover:bg-gray-800"
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
                    <div className="rounded-xl bg-white p-10 text-center shadow">
                        <p className="text-gray-600">
                            Loading attendance...
                        </p>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* Statistics */}
                        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                            <div className="rounded-2xl bg-white p-6 shadow">
                                <p className="text-sm text-gray-500">
                                    Attendance
                                </p>

                                <p className="mt-2 text-3xl font-bold text-blue-600">
                                    {percentage}%
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white p-6 shadow">
                                <p className="text-sm text-gray-500">
                                    Present
                                </p>

                                <p className="mt-2 text-3xl font-bold text-green-600">
                                    {present}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white p-6 shadow">
                                <p className="text-sm text-gray-500">
                                    Late
                                </p>

                                <p className="mt-2 text-3xl font-bold text-yellow-600">
                                    {late}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white p-6 shadow">
                                <p className="text-sm text-gray-500">
                                    Absent
                                </p>

                                <p className="mt-2 text-3xl font-bold text-red-600">
                                    {absent}
                                </p>
                            </div>
                        </div>

                        {/* Empty */}
                        {records.length === 0 ? (
                            <div className="rounded-2xl bg-white p-12 text-center shadow">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
                                    📅
                                </div>

                                <h2 className="text-xl font-bold text-gray-900">
                                    No attendance records
                                </h2>

                                <p className="mt-2 text-gray-600">
                                    Your teacher has not recorded your attendance yet.
                                </p>
                            </div>
                        ) : (
                            /* Attendance Table */
                            <div className="overflow-hidden rounded-2xl bg-white shadow">
                                <div className="border-b px-6 py-5">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Attendance History
                                    </h2>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                                    Date
                                                </th>

                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                                    Subject
                                                </th>

                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {records.map((record) => (
                                                <tr
                                                    key={record.id}
                                                    className="border-t"
                                                >
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        {record.date ||
                                                            "Unknown date"}
                                                    </td>

                                                    <td className="px-6 py-4 text-gray-600">
                                                        {record.subject}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${statusStyle(
                                                                record.status
                                                            )}`}
                                                        >
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}