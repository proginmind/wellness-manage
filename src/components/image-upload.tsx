"use client";

import { useState, useRef } from "react";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Upload, X, Loader2 } from "lucide-react";
import { compressImage, validateImage } from "@/lib/utils/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

async function uploadImage(url: string, { arg }: { arg: File }) {
  const formData = new FormData();
  formData.append("file", arg);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }

  return response.json();
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { trigger: triggerUpload, isMutating } = useSWRMutation(
    "/api/upload/member-image",
    uploadImage,
    {
      onSuccess: (data) => {
        setPreview(data.url);
        onChange(data.url);
        toast.success("Image uploaded successfully");
      },
      onError: (error) => {
        toast.error("Upload failed", {
          description: error.message,
        });
      },
    }
  );

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate
    const validation = validateImage(file);
    if (!validation.valid) {
      toast.error("Invalid file", { description: validation.error });
      return;
    }

    try {
      // Compress
      toast.info("Compressing image...");
      const compressed = await compressImage(file);

      // Upload
      await triggerUpload(compressed);
    } catch (error) {
      toast.error("Failed to process image", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <div className="relative">
        <Avatar className="h-24 w-24">
          {preview && <AvatarImage src={preview} alt="Profile" />}
          <AvatarFallback>
            <User className="h-12 w-12 text-zinc-400" />
          </AvatarFallback>
        </Avatar>

        {isMutating && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          disabled={disabled || isMutating}
        >
          {isMutating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </>
          )}
        </Button>

        {preview && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={disabled || isMutating}
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
        Max 5MB • JPG, PNG, or WebP
      </p>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isMutating}
      />
    </div>
  );
}
