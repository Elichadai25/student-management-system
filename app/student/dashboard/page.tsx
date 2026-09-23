"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
    const router = useRouter();

    const [studentName, setStudentName] = useState("Student");
    const [loading, setLoading] = useState(true);

    const [attendance, setAttendance] = useState(0);
    const [present, setPresent] = useState(0);
    const [absent, setAbsent] = useState(0);
    const [assignments, setAssignments] = useState(0);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/login");
                return;
            }

            try {
                // ==============================
                // LOAD STUDENT PROFILE
                // ==============================

                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();

                    setStudentName(
                        data.name ||
                        data.fullName ||
                        user.displayName ||
                        "Student"
                    );
                }

                // ==============================
                // LOAD ASSIGNMENTS
                // ==============================

                const assignmentSnapshot = await getDocs(
                    collection(db, "assignments")
                );

                setAssignments(assignmentSnapshot.size);

                // ==============================
                // LOAD ATTENDANCE
                // ==============================

                const attendanceQuery = query(
                    collection(db, "attendance"),
                    where("studentId", "==", user.uid)
                );

                const attendanceSnapshot =
                    await getDocs(attendanceQuery);

                let presentCount = 0;
                let absentCount = 0;

                attendanceSnapshot.forEach((item) => {
                    const data = item.data();

                    if (data.status === "present") {
                        presentCount++;
                    }

                    if (data.status === "absent") {
                        absentCount++;
                    }
                });

                setPresent(presentCount);
                setAbsent(absentCount);

                const totalAttendance =
                    presentCount + absentCount;

                if (totalAttendance > 0) {
                    setAttendance(
                        Math.round(
                            (presentCount / totalAttendance) * 100
                        )
                    );
                } else {
                    setAttendance(0);
                }
            } catch (error) {
                console.error(
                    "Error loading student dashboard:",
                    error
                );
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    // ==============================
    // LOGOUT
    // ==============================

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.replace("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // ==============================
    // LOADING
    // ==============================

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>

                    <p className="text-gray-600">
                        Loading student dashboard...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-100">

            {/* ==============================
                HERO
            ============================== */}

            <section
                className="relative bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url('/student-dashboard.jpg')",
                }}
            >
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/60"></div>

                <div className="relative mx-auto max-w-7xl px-6 py-14">

                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                        <div className="text-white">

                            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-200">
                                Student Portal
                            </p>

                            <h1 className="text-4xl font-bold md:text-5xl">
                                Welcome, {studentName}
                            </h1>

                            <p className="mt-3 max-w-2xl text-lg text-gray-200">
                                Manage your assignments, attendance,
                                submissions and academic activities.
                            </p>

                        </div>

                        <button
                            onClick={handleLogout}
                            type="button"
                            className="rounded-lg bg-white px-6 py-3 font-semibold text-gray-900 shadow transition hover:bg-red-600 hover:text-white"
                        >
                            Logout
                        </button>

                    </div>
                </div>
            </section>

            {/* ==============================
                MAIN CONTENT
            ============================== */}

            <div className="mx-auto max-w-7xl px-6 py-8">

                {/* ==============================
                    STATISTICS
                ============================== */}

                <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Attendance */}

                    <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Attendance
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-blue-600">
                                    {attendance}%
                                </h2>
                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                                📅
                            </div>

                        </div>
                    </div>

                    {/* Present */}

                    <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Present
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-green-600">
                                    {present}
                                </h2>
                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-2xl">
                                ✓
                            </div>

                        </div>
                    </div>

                    {/* Absent */}

                    <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Absent
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-red-600">
                                    {absent}
                                </h2>
                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-100 text-2xl">
                                !
                            </div>

                        </div>
                    </div>

                    {/* Assignments */}

                    <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Assignments
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-purple-600">
                                    {assignments}
                                </h2>
                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                                📝
                            </div>

                        </div>
                    </div>

                </section>

                {/* ==============================
                    STUDENT ACTIVITIES
                ============================== */}

                <section className="mt-10">

                    <div className="mb-6">

                        <h2 className="text-2xl font-bold text-gray-900">
                            Student Activities
                        </h2>

                        <p className="mt-1 text-gray-600">
                            Access your academic activities from one place.
                        </p>

                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                        {/* ASSIGNMENTS */}

                        <Link
                            href="/student/assignments"
                            className="group rounded-2xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                                📝
                            </div>

                            <h3 className="text-xl font-bold text-gray-900">
                                My Assignments
                            </h3>

                            <p className="mt-2 text-gray-600">
                                View assignments given by your teachers
                                and submit your work.
                            </p>

                            <div className="mt-5 font-semibold text-purple-600 group-hover:underline">
                                View Assignments →
                            </div>
                        </Link>

                        {/* ATTENDANCE */}

                        <Link
                            href="/student/attendance"
                            className="group rounded-2xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                                📅
                            </div>

                            <h3 className="text-xl font-bold text-gray-900">
                                My Attendance
                            </h3>

                            <p className="mt-2 text-gray-600">
                                Check your attendance records and
                                monitor your attendance percentage.
                            </p>

                            <div className="mt-5 font-semibold text-blue-600 group-hover:underline">
                                View Attendance →
                            </div>
                        </Link>

                        {/* SUBMISSIONS */}

                        <Link
                            href="/student/submissions"
                            className="group rounded-2xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-2xl">
                                📤
                            </div>

                            <h3 className="text-xl font-bold text-gray-900">
                                My Submissions
                            </h3>

                            <p className="mt-2 text-gray-600">
                                View submitted assignments, grades
                                and teacher feedback.
                            </p>

                            <div className="mt-5 font-semibold text-green-600 group-hover:underline">
                                View Submissions →
                            </div>
                        </Link>

                        {/* LEAVE REQUEST */}

                        <Link
                            href="/student/leave"
                            className="group rounded-2xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                                📄
                            </div>

                            <h3 className="text-xl font-bold text-gray-900">
                                Leave Requests
                            </h3>

                            <p className="mt-2 text-gray-600">
                                Request leave and check the status
                                of previous requests.
                            </p>

                            <div className="mt-5 font-semibold text-orange-600 group-hover:underline">
                                Manage Leave →
                            </div>
                        </Link>

                        {/* PROFILE */}

                        <Link
                            href="/student/profile"
                            className="group rounded-2xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-2xl">
                                👤
                            </div>

                            <h3 className="text-xl font-bold text-gray-900">
                                My Profile
                            </h3>

                            <p className="mt-2 text-gray-600">
                                View and update your student information.
                            </p>

                            <div className="mt-5 font-semibold text-gray-700 group-hover:underline">
                                View Profile →
                            </div>
                        </Link>

                    </div>
                </section>

                {/* ==============================
                    ACADEMIC OVERVIEW
                ============================== */}

                <section className="mt-10 rounded-2xl bg-white p-7 shadow-sm">

                    <h2 className="text-xl font-bold text-gray-900">
                        Academic Overview
                    </h2>

                    <div className="mt-6 grid gap-6 md:grid-cols-3">

                        <div>
                            <p className="text-sm text-gray-500">
                                Attendance Status
                            </p>

                            <p
                                className={`mt-1 font-semibold ${attendance >= 75
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                            >
                                {attendance >= 75
                                    ? "Good Standing"
                                    : "Needs Improvement"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Assignments
                            </p>

                            <p className="mt-1 font-semibold text-blue-600">
                                {assignments} Available
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Academic Portal
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                                Active
                            </p>
                        </div>

                    </div>

                </section>

            </div>
        </main>
    );
}