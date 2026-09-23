"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
    doc,
    getDoc,
    addDoc,
    collection,
    serverTimestamp,
} from "firebase/firestore";

import {
    ref,
    uploadBytes,
    getDownloadURL,
} from "firebase/storage";

import { onAuthStateChanged } from "firebase/auth";

import { auth, db, storage } from "@/lib/firebase";

type Assignment = {
    title: string;
    description: string;
    deadline?: string;
    teacherId?: string;
};

export default function AssignmentSubmissionPage() {
    const params = useParams();
    const router = useRouter();

    const assignmentId = params.id as string;

    const [assignment, setAssignment] = useState<Assignment | null>(null);

    const [answer, setAnswer] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/login");
                return;
            }

            try {
                const assignmentRef = doc(
                    db,
                    "assignments",
                    assignmentId
                );

                const assignmentSnap = await getDoc(assignmentRef);

                if (!assignmentSnap.exists()) {
                    setError("Assignment not found.");
                    setLoading(false);
                    return;
                }

                setAssignment(
                    assignmentSnap.data() as Assignment
                );
            } catch (err) {
                console.error(err);
                setError("Unable to load assignment.");
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [assignmentId, router]);

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setError("");

        const selectedFile = e.target.files?.[0];

        if (!selectedFile) {
            setFile(null);
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            setError(
                "Please upload a PDF, DOC, or DOCX file."
            );

            e.target.value = "";
            setFile(null);
            return;
        }

        // Maximum 10MB
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError("File size must be less than 10MB.");
            e.target.value = "";
            setFile(null);
            return;
        }

        setFile(selectedFile);
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const user = auth.currentUser;

        if (!user) {
            router.push("/login");
            return;
        }

        if (!file && !answer.trim()) {
            setError(
                "Please write an answer or upload your assignment file."
            );
            return;
        }

        setSubmitting(true);

        try {
            let fileUrl = "";
            let fileName = "";
            let fileType = "";

            /*
             * Upload file to Firebase Storage
             */
            if (file) {
                const filePath = `submissions/${assignmentId}/${user.uid}/${Date.now()}_${file.name}`;

                const storageRef = ref(
                    storage,
                    filePath
                );

                await uploadBytes(
                    storageRef,
                    file
                );

                fileUrl = await getDownloadURL(
                    storageRef
                );

                fileName = file.name;
                fileType = file.type;
            }

            /*
             * Save submission information in Firestore
             */
            await addDoc(
                collection(db, "submissions"),
                {
                    assignmentId: assignmentId,

                    studentId: user.uid,

                    studentEmail: user.email || "",

                    answer: answer.trim(),

                    fileUrl: fileUrl,

                    fileName: fileName,

                    fileType: fileType,

                    status: "submitted",

                    submittedAt: serverTimestamp(),
                }
            );

            setSuccess(
                "Assignment submitted successfully!"
            );

            setAnswer("");
            setFile(null);

        } catch (err) {
            console.error("Submission error:", err);

            setError(
                "Unable to submit assignment. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100">
                <p className="text-lg text-gray-600">
                    Loading assignment...
                </p>
            </main>
        );
    }

    if (error && !assignment) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
                <div className="rounded-xl bg-white p-8 text-center shadow">
                    <h1 className="text-2xl font-bold text-red-600">
                        Assignment Not Found
                    </h1>

                    <p className="mt-3 text-gray-600">
                        {error}
                    </p>

                    <Link
                        href="/student/dashboard"
                        className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 px-4 py-8">
            <div className="mx-auto max-w-4xl">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                            Student Portal
                        </p>

                        <h1 className="mt-2 text-3xl font-bold text-gray-900">
                            Submit Assignment
                        </h1>
                    </div>

                    <Link
                        href="/student/dashboard"
                        className="rounded-lg bg-gray-700 px-5 py-3 text-center font-semibold text-white hover:bg-gray-800"
                    >
                        ← Dashboard
                    </Link>
                </div>

                {/* Assignment information */}
                <section className="mb-6 rounded-2xl bg-white p-6 shadow">

                    <h2 className="text-2xl font-bold text-gray-900">
                        {assignment?.title}
                    </h2>

                    <div className="mt-4 rounded-lg bg-gray-50 p-4">
                        <p className="text-sm font-semibold text-gray-700">
                            Assignment Instructions
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-gray-600">
                            {assignment?.description ||
                                "No description provided."}
                        </p>
                    </div>

                    {assignment?.deadline && (
                        <div className="mt-4">
                            <span className="font-semibold text-gray-700">
                                Deadline:
                            </span>{" "}
                            <span className="text-gray-600">
                                {assignment.deadline}
                            </span>
                        </div>
                    )}
                </section>

                {/* Submission form */}
                <section className="rounded-2xl bg-white p-6 shadow">

                    <h2 className="text-xl font-bold text-gray-900">
                        Your Submission
                    </h2>

                    <p className="mt-1 text-gray-500">
                        You can write your answer, upload a document,
                        or do both.
                    </p>

                    {/* Error */}
                    {error && (
                        <div className="mt-5 rounded-lg bg-red-100 p-4 text-sm font-medium text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="mt-5 rounded-lg bg-green-100 p-4 text-sm font-medium text-green-700">
                            {success}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="mt-6 space-y-6"
                    >

                        {/* Text answer */}
                        <div>
                            <label className="mb-2 block font-semibold text-gray-800">
                                Written Answer
                            </label>

                            <textarea
                                value={answer}
                                onChange={(e) =>
                                    setAnswer(e.target.value)
                                }
                                rows={8}
                                placeholder="Write your answer here..."
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <p className="mt-2 text-sm text-gray-500">
                                Optional if you are uploading a file.
                            </p>
                        </div>

                        {/* File upload */}
                        <div>
                            <label className="mb-2 block font-semibold text-gray-800">
                                Upload Assignment
                            </label>

                            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">

                                <div className="text-4xl">
                                    📄
                                </div>

                                <p className="mt-2 font-semibold text-gray-700">
                                    Upload your assignment file
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    PDF, DOC, or DOCX • Maximum 10MB
                                </p>

                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    className="mx-auto mt-5 block w-full max-w-md rounded-lg border border-gray-300 bg-white p-3 text-sm"
                                />

                                {file && (
                                    <div className="mt-4 rounded-lg bg-blue-50 p-3 text-left">
                                        <p className="font-semibold text-blue-800">
                                            Selected file:
                                        </p>

                                        <p className="mt-1 break-all text-sm text-blue-700">
                                            {file.name}
                                        </p>

                                        <p className="mt-1 text-xs text-blue-600">
                                            {(
                                                file.size /
                                                1024 /
                                                1024
                                            ).toFixed(2)}{" "}
                                            MB
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-lg bg-blue-600 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting
                                ? "Submitting..."
                                : "Submit Assignment"}
                        </button>

                    </form>
                </section>

            </div>
        </main>
    );
}