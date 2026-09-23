"use client";

import Link from "next/link";

export default function SubmissionsPage() {
    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-6xl">

                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Student Submissions
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Review and manage student work.
                        </p>
                    </div>

                    <Link
                        href="/teacher/dashboard"
                        className="rounded-lg bg-gray-700 px-5 py-3 font-semibold text-white hover:bg-gray-800"
                    >
                        ← Dashboard
                    </Link>
                </div>

                <div className="rounded-xl bg-white p-8 shadow">

                    <h2 className="mb-6 text-xl font-bold">
                        Recent Submissions
                    </h2>

                    <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
                        <p className="text-gray-500">
                            No student submissions yet.
                        </p>
                    </div>

                </div>

            </div>
        </main>
    );
}