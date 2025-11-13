"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  updateEntityAction,
  uploadEntityImageAction,
  deleteEntityImageAction,
  setPrimaryImageAction,
} from "@/app/actions/entities";
import { Entity, EntityImage } from "@/types";
import { Upload, X, Loader2, Star, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface EntityEditFormProps {
  worldId: string;
  entity: Entity;
  images: EntityImage[];
  shouldArchive?: boolean;
}

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function EntityEditForm({ worldId, entity, images: initialImages, shouldArchive }: EntityEditFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(entity.name);
  const [description, setDescription] = useState(entity.description);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(entity.tags);
  const [isArchived, setIsArchived] = useState(entity.isArchived);
  const [images, setImages] = useState<EntityImage[]>(initialImages);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Auto-toggle archive if shouldArchive is true
  useEffect(() => {
    if (shouldArchive) {
      setIsArchived(!entity.isArchived);
    }
  }, [shouldArchive, entity.isArchived]);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    setIsUploadingImage(true);

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: File size exceeds 10MB limit.`);
        continue;
      }

      try {
        // Read file as base64
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");

        // Get image dimensions
        const img = await createImageBitmap(file);
        const width = img.width;
        const height = img.height;

        // Upload image
        const result = await uploadEntityImageAction(entity.id, {
          buffer: base64,
          filename: file.name,
          mimeType: file.type,
          width,
          height,
          fileSize: file.size,
          isPrimary: images.length === 0,
        });

        if (result.success) {
          setImages([...images, result.data]);
          toast.success(`${file.name} uploaded successfully`);
        } else {
          toast.error(result.error || `Failed to upload ${file.name}`);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setIsUploadingImage(false);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const result = await deleteEntityImageAction(imageId);

      if (result.success) {
        setImages(images.filter((img) => img.id !== imageId));
        toast.success("Image deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    try {
      const result = await setPrimaryImageAction(entity.id, imageId);

      if (result.success) {
        setImages(
          images.map((img) => ({
            ...img,
            isPrimary: img.id === imageId,
          }))
        );
        toast.success("Primary image updated");
      } else {
        toast.error(result.error || "Failed to set primary image");
      }
    } catch (error) {
      console.error("Error setting primary image:", error);
      toast.error("Failed to set primary image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (description.length < 20) {
      toast.error("Description must be at least 20 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("tags", tags.join(","));
      formData.append("isArchived", String(isArchived));

      const result = await updateEntityAction(entity.id, formData);

      if (result.success) {
        toast.success("Entity updated successfully");
        router.push(`/worlds/${worldId}/entities/${entity.id}`);
      } else {
        toast.error(result.error || "Failed to update entity");
      }
    } catch (error) {
      console.error("Error updating entity:", error);
      toast.error("Failed to update entity");
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

      <Separator />

      {/* Images */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>
            Images
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              ({images.length}/{MAX_IMAGES})
            </span>
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage || images.length >= MAX_IMAGES}
          >
            {isUploadingImage ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Add Images
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                  <Image
                    src={image.url}
                    alt={`Reference image ${images.indexOf(image) + 1} of ${images.length}${image.isPrimary ? ' (primary)' : ''}`}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                  />
                </div>

                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!image.isPrimary && (
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7 shadow-lg"
                      onClick={() => handleSetPrimaryImage(image.id)}
                      title="Set as primary"
                    >
                      <Star className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-7 w-7 shadow-lg"
                    onClick={() => handleDeleteImage(image.id)}
                    title="Delete image"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Primary Badge */}
                {image.isPrimary && (
                  <Badge className="absolute bottom-2 left-2 bg-indigo-600 text-white border-0 shadow-lg z-10">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Primary
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">No images uploaded</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Archive Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="archive">Archive Entity</Label>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Archived entities are hidden from the main list but can be restored
          </p>
        </div>
        <Switch
          id="archive"
          checked={isArchived}
          onCheckedChange={setIsArchived}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || !isDescriptionValid}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
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
