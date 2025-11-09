"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createEntityAction } from "@/app/actions/entities";
import { EntityType } from "@/types";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EntityFormProps {
  worldId: string;
  initialData?: {
    name: string;
    type: EntityType;
    description: string;
    tags: string[];
  };
  mode?: "create" | "edit";
}

const entityTypes: { value: EntityType; label: string }[] = [
  { value: "character", label: "Character" },
  { value: "location", label: "Location" },
  { value: "object", label: "Object" },
  { value: "style", label: "Style" },
  { value: "custom", label: "Custom" },
];

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function EntityForm({ worldId, initialData, mode = "create" }: EntityFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState<EntityType>(initialData?.type || "character");
  const [description, setDescription] = useState(initialData?.description || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file count
    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: File size exceeds 10MB limit.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setImages([...images, ...validFiles]);

      // Create previews
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const input = fileInputRef.current;
    if (input) {
      const dataTransfer = new DataTransfer();
      files.forEach((file) => dataTransfer.items.add(file));
      input.files = dataTransfer.files;
      handleFileSelect({ target: input } as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (description.length < 20) {
      toast.error("Description must be at least 20 characters");
      return;
    }

    if (mode === "create" && images.length === 0) {
      toast.error("At least one image is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("type", type);
      formData.append("description", description);
      formData.append("tags", tags.join(","));

      const result = await createEntityAction(worldId, formData);

      if (result.success) {
        toast.success("Entity created successfully");
        router.push(`/worlds/${worldId}/entities/${result.data.id}`);
      } else {
        toast.error(result.error || "Failed to create entity");
      }
    } catch (error) {
      console.error("Error creating entity:", error);
      toast.error("Failed to create entity");
    } finally {
      setIsSubmitting(false);
    }
  };

  const descriptionLength = description.length;
  const isDescriptionValid = descriptionLength >= 20;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter entity name"
          required
          maxLength={255}
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label htmlFor="type">
          Type <span className="text-red-500">*</span>
        </Label>
        <Select value={type} onValueChange={(value) => setType(value as EntityType)}>
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {entityTypes.map((entityType) => (
              <SelectItem key={entityType.value} value={entityType.value}>
                {entityType.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">
            Description <span className="text-red-500">*</span>
          </Label>
          <span
            className={`text-sm ${
              isDescriptionValid
                ? "text-green-600 dark:text-green-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {descriptionLength}/20 minimum
          </span>
        </div>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the entity in detail (minimum 20 characters)"
          required
          rows={6}
          maxLength={5000}
          className={!isDescriptionValid && descriptionLength > 0 ? "border-amber-500" : ""}
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Provide detailed attributes that will be used for prompt enhancement and consistency
          checking.
        </p>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            placeholder="Add tags (press Enter)"
          />
          <Button type="button" onClick={handleAddTag} variant="outline">
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label>
          Images {mode === "create" && <span className="text-red-500">*</span>}
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
            ({images.length}/{MAX_IMAGES})
          </span>
        </Label>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Drag and drop images here, or click to browse
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            JPEG, PNG, WebP up to 10MB • Maximum {MAX_IMAGES} images
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(index);
                  }}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                {index === 0 && (
                  <Badge className="absolute bottom-2 left-2 bg-indigo-600 text-white">
                    Primary
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || !isDescriptionValid || (mode === "create" && images.length === 0)}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Entity"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
