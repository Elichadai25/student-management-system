"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function TeacherDashboard() {
    const router = useRouter();

    const [teacherName, setTeacherName] = useState("Teacher");
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.replace("/login");
                return;
            }

            try {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();

                    setTeacherName(
                        data.name ||
                        data.fullName ||
                        user.displayName ||
                        "Teacher"
                    );
                } else {
                    setTeacherName(user.displayName || "Teacher");
                }
            } catch (error) {
                console.error("Error loading teacher:", error);
                setTeacherName(user.displayName || "Teacher");
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        try {
            setLoggingOut(true);

            await signOut(auth);

            router.replace("/login");
        } catch (error) {
            console.error("Logout error:", error);
            setLoggingOut(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-100">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

                    <p className="mt-4 text-gray-600">
                        Loading teacher dashboard...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-100">

            {/* =====================================================
                HERO / HEADER
            ===================================================== */}
            <section
                className="relative overflow-hidden bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url('/teacher-dashboard.jpg')",
                }}
            >
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/65" />

                <div className="relative mx-auto max-w-7xl px-6 py-12">
                    <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

                        {/* Welcome */}
                        <div className="text-white">

                            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-blue-200">
                                Teacher Portal
                            </p>

                            <h1 className="text-4xl font-bold md:text-5xl">
                                Welcome, {teacherName}
                            </h1>

                            <p className="mt-4 max-w-2xl text-lg text-gray-200">
                                Manage your students, assignments,
                                attendance, submissions and leave requests
                                from one place.
                            </p>

                        </div>

                        {/* Logout */}
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="rounded-xl bg-white/15 px-6 py-3 font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loggingOut ? "Logging out..." : "Logout"}
                        </button>

                    </div>
                </div>
            </section>


            {/* =====================================================
                MAIN CONTENT
            ===================================================== */}
            <div className="mx-auto max-w-7xl px-6 py-10">

                {/* =================================================
                    QUICK STATS
                ================================================= */}
                <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Students */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Students
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-blue-600">
                                    —
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Manage students
                                </p>
                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                                👨‍🎓
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
                                    —
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Create assignments
                                </p>
                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                                📝
                            </div>

                        </div>
                    </div>


                    {/* Attendance */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Attendance
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-green-600">
                                    —
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Record attendance
                                </p>
                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-2xl">
                                📅
                            </div>

                        </div>
                    </div>


                    {/* Submissions */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Submissions
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-orange-600">
                                    —
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Review student work
                                </p>
                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                                📤
                            </div>

                        </div>
                    </div>

                </section>


                {/* =================================================
                    TEACHER TASKS
                ================================================= */}
                <section className="mt-12">

                    <div className="mb-7">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Teacher Tasks
                        </h2>

                        <p className="mt-1 text-gray-600">
                            Manage your classroom activities from here.
                        </p>
                    </div>


                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                        {/* =========================================
                            MANAGE STUDENTS
                        ========================================= */}
                        <Link
                            href="/teacher/students"
                            className="group rounded-2xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                                👨‍🎓
                            </div>

                            <h3 className="text-xl font-bold text-gray-900">
                                Manage Students
                            </h3>

                            <p className="mt-2 text-gray-600">
                                View students, add new students and manage
                                student information.
                            </p>

                            <div className="mt-5 font-semibold text-blue-600 group-hover:underline">
                                Manage Students →
                            </div>
                        </Link>


                        {/* =========================================
                            ASSIGNMENTS
                        ========================================= */}
                        <Link
                            href="/teacher/assignments"
                            className="group rounded-2xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                                📝
                            </div>

                            <h3 className="text-xl font-bold text-gray-900">
                                Assignments
                            </h3>

                            <p className="mt-2 text-gray-600">
                                Create assignments, set deadlines and manage
                                work given to students.
                            </p>

                            <div className="mt-5 font-semibold text-purple-600 group-hover:underline">
                                Manage Assignments →
                            </div>
                        </Link>


                        {/* =========================================
                            ATTENDANCE
                        ========================================= */}
                        <Link
                            href="/teacher/attendance"
                            className="group rounded-2xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-2xl">
                                📅
                            </div>

                            <h3 className="text-xl font-bold text-gray-900">
                                Attendance
                            </h3>

                            <p className="mt-2 text-gray-600">
                                Record and manage student attendance for
                                your classes.
                            </p>

                            <div className="mt-5 font-semibold text-green-600 group-hover:underline">
                                Manage Attendance →
                            </div>
                        </Link>


                        {/* =========================================
                            SUBMISSIONS
                        ========================================= */}
                        <Link
                            href="/teacher/submissions"
                            className="group rounded-2xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                                📤
                            </div>

                            <h3 className="text-xl font-bold text-gray-900">
                                Student Submissions
                            </h3>

                            <p className="mt-2 text-gray-600">
                                View submitted assignments, review student
                                work and provide grades or feedback.
                            </p>

                            <div className="mt-5 font-semibold text-orange-600 group-hover:underline">
                                Review Submissions →
                            </div>
                        </Link>


                        {/* =========================================
                            LEAVE REQUESTS
                        ========================================= */}
                        <Link
                            href="/teacher/leave"
                            className="group rounded-2xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-100 text-2xl">
                                📄
                            </div>

                            <h3 className="text-xl font-bold text-gray-900">
                                Leave Requests
                            </h3>

                            <p className="mt-2 text-gray-600">
                                Review student leave requests and approve or
                                reject them.
                            </p>

                            <div className="mt-5 font-semibold text-yellow-600 group-hover:underline">
                                Manage Leave Requests →
                            </div>
                        </Link>


                        {/* =========================================
                            CLASSROOM OVERVIEW
                        ========================================= */}
                        <Link
                            href="/teacher/students"
                            className="group rounded-2xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
                                📊
                            </div>

                            <h3 className="text-xl font-bold text-gray-900">
                                Classroom Overview
                            </h3>

                            <p className="mt-2 text-gray-600">
                                View your students and monitor their academic
                                activities.
                            </p>

                            <div className="mt-5 font-semibold text-indigo-600 group-hover:underline">
                                View Classroom →
                            </div>
                        </Link>

                    </div>
                </section>


                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}
                <section className="mt-12">

                    <div className="mb-7">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Quick Actions
                        </h2>

                        <p className="mt-1 text-gray-600">
                            Frequently used teacher actions.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">

                        <Link
                            href="/teacher/assignments"
                            className="rounded-xl bg-blue-600 p-5 font-semibold text-white transition hover:bg-blue-700"
                        >
                            + Create Assignment
                        </Link>

                        <Link
                            href="/teacher/students/add"
                            className="rounded-xl bg-green-600 p-5 font-semibold text-white transition hover:bg-green-700"
                        >
                            + Add Student
                        </Link>

                        <Link
                            href="/teacher/attendance"
                            className="rounded-xl bg-purple-600 p-5 font-semibold text-white transition hover:bg-purple-700"
                        >
                            ✓ Record Attendance
                        </Link>

                    </div>
                </section>


                {/* =================================================
                    INFORMATION
                ================================================= */}
                <section className="mt-12 rounded-2xl bg-white p-7 shadow-sm">

                    <h2 className="text-xl font-bold text-gray-900">
                        Teacher Portal
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Use the dashboard to manage students, assignments,
                        attendance, submissions and leave requests.
                    </p>

                    <div className="mt-6 grid gap-5 md:grid-cols-3">

                        <div className="rounded-xl bg-blue-50 p-5">
                            <div className="text-2xl">👨‍🎓</div>

                            <h3 className="mt-3 font-bold text-gray-900">
                                Students
                            </h3>

                            <p className="mt-1 text-sm text-gray-600">
                                Manage student records.
                            </p>
                        </div>

                        <div className="rounded-xl bg-purple-50 p-5">
                            <div className="text-2xl">📝</div>

                            <h3 className="mt-3 font-bold text-gray-900">
                                Academic Work
                            </h3>

                            <p className="mt-1 text-sm text-gray-600">
                                Create and review assignments.
                            </p>
                        </div>

                        <div className="rounded-xl bg-green-50 p-5">
                            <div className="text-2xl">📊</div>

                            <h3 className="mt-3 font-bold text-gray-900">
                                Monitoring
                            </h3>

                            <p className="mt-1 text-sm text-gray-600">
                                Track attendance and student activities.
                            </p>
                        </div>

                    </div>
                </section>

            </div>
        </main>
    );
}