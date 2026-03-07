"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

interface MultiImageUploaderProps {
    label: string;
    currentUrls: string; // newline-separated URLs stored in formData
    onChanged: (urls: string) => void;
}

export default function MultiImageUploader({ label, currentUrls, onChanged }: MultiImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [manualUrls, setManualUrls] = useState("");

    // Parse the newline-separated string into an array
    const urlList = currentUrls
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean);

    const pushUrl = (url: string) => {
        const next = [...urlList, url].join("\n");
        onChanged(next);
    };

    const addManualUrls = () => {
        const urlsToAdd = manualUrls
            .split("\n")
            .map((u) => u.trim())
            .filter(Boolean);

        if (urlsToAdd.length === 0) {
            setError("Add at least one image URL.");
            return;
        }

        const uniqueUrls = urlsToAdd.filter((url) => !urlList.includes(url));
        if (uniqueUrls.length === 0) {
            setError("Those image URLs are already in the gallery.");
            return;
        }

        const next = [...urlList, ...uniqueUrls].join("\n");
        onChanged(next);
        setManualUrls("");
        setError("");
    };

    const removeUrl = (index: number) => {
        const next = urlList.filter((_, i) => i !== index).join("\n");
        onChanged(next);
    };

    const uploadFile = async (file: File) => {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        return data.url as string;
    };

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        setError("");
        try {
            for (const file of Array.from(files)) {
                const url = await uploadFile(file);
                pushUrl(url);
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    return (
        <div className="space-y-2">
            <label className="block text-chrome-light font-mono text-xs uppercase">{label}</label>

            {/* Existing thumbnails */}
            {urlList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {urlList.map((url, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-white/10 flex-shrink-0 group">
                            <img
                                src={url}
                                alt={`Extra ${i + 1}`}
                                className="w-full h-full object-contain p-1 mix-blend-screen bg-black/40"
                            />
                            <button
                                type="button"
                                onClick={() => removeUrl(i)}
                                className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4 text-red-400" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Drop Zone */}
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all text-center ${dragging
                        ? "border-neon-teal bg-neon-teal/5"
                        : "border-white/10 hover:border-white/30 bg-black/20"
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
                <div className="flex flex-col items-center gap-1 text-chrome-dark">
                    {uploading ? (
                        <span className="font-mono text-xs animate-pulse text-neon-teal">Uploading...</span>
                    ) : (
                        <>
                            <Upload className="w-5 h-5" />
                            <span className="font-mono text-[10px] uppercase tracking-widest">Click or drag — multiple files supported</span>
                            <span className="font-mono text-[9px] text-white/20">JPG · PNG · WEBP · GIF · Max 10MB each</span>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">
                        Add secondary image links
                    </span>
                    <button
                        type="button"
                        onClick={addManualUrls}
                        className="rounded-lg border border-neon-teal/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-neon-teal transition-colors hover:border-neon-teal hover:bg-neon-teal/10"
                    >
                        Add Link{manualUrls.includes("\n") ? "s" : ""}
                    </button>
                </div>
                <textarea
                    value={manualUrls}
                    onChange={(e) => setManualUrls(e.target.value)}
                    placeholder={"https://example.com/image-1.png\nhttps://example.com/image-2.png"}
                    className="min-h-[88px] w-full rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-xs text-white outline-none transition-colors placeholder:text-white/20 focus:border-neon-teal"
                />
                <p className="font-mono text-[9px] text-white/30">
                    Paste one URL per line to add multiple gallery images at once.
                </p>
            </div>

            {error && <p className="text-red-400 font-mono text-[10px]">{error}</p>}
        </div>
    );
}
