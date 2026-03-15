"use client";

import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
    label: string;
    currentUrl: string;
    onUploaded: (url: string) => void;
}

export default function ImageUploader({ label, currentUrl, onUploaded }: ImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string>(currentUrl);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [dragging, setDragging] = useState(false);

    const handleFile = async (file: File) => {
        if (!file) return;
        setUploading(true);
        setError("");

        const form = new FormData();
        form.append("file", file);

        try {
            const res = await fetch("/api/admin/upload", { method: "POST", body: form });
            
            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                const text = await res.text();
                throw new Error(`Server Error (${res.status}): ${text.slice(0, 100)}`);
            }

            if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
            setPreview(data.url);
            onUploaded(data.url);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const clear = () => {
        setPreview("");
        onUploaded("");
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="space-y-2">
            <label className="block text-chrome-light font-mono text-xs uppercase">{label}</label>

            {/* Drop Zone */}
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all text-center ${dragging
                        ? "border-neon-teal bg-neon-teal/5"
                        : "border-white/10 hover:border-white/30 bg-black/20"
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    className="hidden"
                    onChange={handleInputChange}
                />

                {preview ? (
                    <div className="relative">
                        <img src={preview} alt="Preview" className="h-28 max-w-full object-contain mx-auto rounded-lg mix-blend-screen" />
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); clear(); }}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center hover:bg-red-500 transition-colors"
                        >
                            <X className="w-3 h-3 text-white" />
                        </button>
                    </div>
                ) : (
                    <div className="py-4 flex flex-col items-center gap-2 text-chrome-dark">
                        {uploading ? (
                            <div className="font-mono text-xs animate-pulse text-neon-teal">Uploading...</div>
                        ) : (
                            <>
                                <Upload className="w-6 h-6" />
                                <span className="font-mono text-[10px] uppercase tracking-widest">Click or drag image here</span>
                                <span className="font-mono text-[9px] text-white/20">JPG · PNG · WEBP · GIF · Max 10MB</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Also allow URL input */}
            <input
                type="text"
                value={currentUrl}
                onChange={(e) => { setPreview(e.target.value); onUploaded(e.target.value); }}
                className="w-full bg-black/50 border border-white/10 text-white font-mono p-2 text-xs focus:border-electric-lime outline-none rounded"
                placeholder="Or paste a URL..."
            />

            {error && <p className="text-red-400 font-mono text-[10px]">{error}</p>}
        </div>
    );
}
