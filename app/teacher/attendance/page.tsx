"use client";

import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    addDoc,
    query,
    where,
    serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import Link from "next/link";

type Student = {
    id: string;
    name: string;
    email: string;
    status?: string;
};

type AttendanceStatus = "present" | "absent";

export default function AttendancePage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<
        Record<string, AttendanceStatus>
    >({});

    const [date, setDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ==========================================
    // LOAD STUDENTS
    // ==========================================

    useEffect(() => {
        const loadStudents = async () => {
            try {
                setLoading(true);
                setError("");

                const studentsQuery = query(
                    collection(db, "users"),
                    where("role", "==", "student")
                );

                const snapshot = await getDocs(studentsQuery);

                const studentList: Student[] = snapshot.docs.map((doc) => {
                    const data = doc.data();

                    return {
                        id: doc.id,
                        name: data.name || "Unnamed Student",
                        email: data.email || "No email",
                        status: data.status || "approved",
                    };
                });

                setStudents(studentList);

                // Default everyone to absent until teacher selects present.
                const initialAttendance: Record<
                    string,
                    AttendanceStatus
                > = {};

                studentList.forEach((student) => {
                    initialAttendance[student.id] = "absent";
                });

                setAttendance(initialAttendance);
            } catch (err) {
                console.error("Error loading students:", err);
                setError(
                    "Unable to load students. Please check your Firestore permissions."
                );
            } finally {
                setLoading(false);
            }
        };

        loadStudents();
    }, []);

    // ==========================================
    // CHANGE ATTENDANCE
    // ==========================================

    const markAttendance = (
        studentId: string,
        status: AttendanceStatus
    ) => {
        setAttendance((previous) => ({
            ...previous,
            [studentId]: status,
        }));
    };

    // ==========================================
    // SAVE ATTENDANCE
    // ==========================================

    const saveAttendance = async () => {
        if (!date) {
            setError("Please select a date.");
            return;
        }

        if (!auth.currentUser) {
            setError("You must be logged in as a teacher.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            for (const student of students) {
                await addDoc(collection(db, "attendance"), {
                    studentId: student.id,
                    studentName: student.name,
                    studentEmail: student.email,
                    date: date,
                    status: attendance[student.id] || "absent",
                    teacherId: auth.currentUser.uid,
                    createdAt: serverTimestamp(),
                });
            }

            setMessage("Attendance saved successfully.");

        } catch (err) {
            console.error("Error saving attendance:", err);

            setError(
                "Unable to save attendance. Please check your Firestore permissions."
            );
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="rounded-xl bg-white p-8 shadow">
                    <p className="text-gray-600">
                        Loading students...
                    </p>
                </div>
            </main>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-7xl">

                {/* HEADER */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Student Attendance
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Record daily student attendance.
                        </p>
                    </div>

                    <Link
                        href="/teacher/dashboard"
                        className="rounded-lg bg-gray-700 px-5 py-3 font-semibold text-white hover:bg-gray-800"
                    >
                        ← Dashboard
                    </Link>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {/* SUCCESS */}
                {message && (
                    <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-700">
                        {message}
                    </div>
                )}

                {/* DATE */}
                <div className="mb-6 rounded-xl bg-white p-6 shadow">

                    <label className="mb-2 block font-medium text-gray-700">
                        Select Date
                    </label>

                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                {/* STUDENTS */}
                <div className="overflow-hidden rounded-xl bg-white shadow">

                    {students.length === 0 ? (
                        <div className="p-10 text-center">
                            <p className="text-lg font-semibold text-gray-700">
                                No students found.
                            </p>

                            <p className="mt-2 text-gray-500">
                                Register students before recording attendance.
                            </p>

                            <Link
                                href="/teacher/students/add"
                                className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                            >
                                + Add Student
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">

                                <table className="w-full">

                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold text-gray-700">
                                                Student
                                            </th>

                                            <th className="px-6 py-4 text-left font-semibold text-gray-700">
                                                Email
                                            </th>

                                            <th className="px-6 py-4 text-left font-semibold text-gray-700">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {students.map((student) => {

                                            const currentStatus =
                                                attendance[student.id];

                                            return (
                                                <tr
                                                    key={student.id}
                                                    className="border-t"
                                                >

                                                    <td className="px-6 py-5 font-medium text-gray-900">
                                                        {student.name}
                                                    </td>

                                                    <td className="px-6 py-5 text-gray-600">
                                                        {student.email}
                                                    </td>

                                                    <td className="px-6 py-5">

                                                        <div className="flex gap-3">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    markAttendance(
                                                                        student.id,
                                                                        "present"
                                                                    )
                                                                }
                                                                className={`rounded-lg px-5 py-2 font-medium transition ${currentStatus ===
                                                                        "present"
                                                                        ? "bg-green-600 text-white"
                                                                        : "bg-green-100 text-green-700 hover:bg-green-200"
                                                                    }`}
                                                            >
                                                                Present
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    markAttendance(
                                                                        student.id,
                                                                        "absent"
                                                                    )
                                                                }
                                                                className={`rounded-lg px-5 py-2 font-medium transition ${currentStatus ===
                                                                        "absent"
                                                                        ? "bg-red-600 text-white"
                                                                        : "bg-red-100 text-red-700 hover:bg-red-200"
                                                                    }`}
                                                            >
                                                                Absent
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>
                                            );
                                        })}
                                    </tbody>

                                </table>
                            </div>

                            {/* SAVE */}
                            <div className="border-t p-6">

                                <button
                                    type="button"
                                    onClick={saveAttendance}
                                    disabled={saving || !date}
                                    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Attendance"}
                                </button>

                            </div>
                        </>
                    )}

                </div>
            </div>
        </main>
    );
}