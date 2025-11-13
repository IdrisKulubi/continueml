"use client";

import { useState } from "react";
import Image from "next/image";
import { EntityImage } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent,DialogTitle } from "@/components/ui/dialog";
import { ImageIcon, Star } from "lucide-react";

interface EntityImageGalleryProps {
  images: EntityImage[];
  entityId: string;
  worldId: string;
}

export function EntityImageGallery({ images, entityId, worldId }: EntityImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<EntityImage | null>(null);

  if (images.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-400" aria-hidden="true" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">No images uploaded yet</p>
        </div>
      </div>
    );
  }

  const primaryImage = images.find((img) => img.isPrimary) || images[0];
  const otherImages = images.filter((img) => img.id !== primaryImage.id);

  return (
    <>
      <div className="space-y-4">
        {/* Primary Image */}
        <div
          className="relative aspect-video rounded-lg overflow-hidden bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 cursor-pointer group border border-gray-200 dark:border-gray-700"
          onClick={() => setSelectedImage(primaryImage)}
        >
          <Image
            src={primaryImage.url}
            alt={`Primary reference image showing visual characteristics and appearance`}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
            priority
          />
          <Badge className="absolute top-3 left-3 bg-indigo-600 text-white border-0 z-10 shadow-lg" aria-label="Primary image">
            <Star className="w-3 h-3 mr-1 fill-current" aria-hidden="true" />
            Primary
          </Badge>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        </div>

        {/* Other Images */}
        {otherImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {otherImages.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square rounded-lg overflow-hidden bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 cursor-pointer group border border-gray-200 dark:border-gray-700"
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image.url}
                  alt={`Additional reference image ${otherImages.indexOf(image) + 2} of ${otherImages.length + 1} showing different angle or detail`}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Viewer Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogTitle >          
        </DialogTitle>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative w-full" style={{ maxHeight: "70vh" }}>
                <div className="relative rounded-lg overflow-hidden bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                  <div className="relative w-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    <Image
                      src={selectedImage.url}
                      alt={`Full size ${selectedImage.isPrimary ? 'primary' : 'additional'} reference image at ${selectedImage.width}×${selectedImage.height} pixels`}
                      width={selectedImage.width}
                      height={selectedImage.height}
                      className="w-full h-auto max-h-[70vh] object-contain"
                      sizes="90vw"
                      priority
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-2">
                <div className="font-medium">
                  {selectedImage.width} × {selectedImage.height} •{" "}
                  {(selectedImage.fileSize / 1024 / 1024).toFixed(2)} MB
                </div>
                {selectedImage.isPrimary && (
                  <Badge className="bg-indigo-600 text-white border-0" aria-label="Primary image">
                    <Star className="w-3 h-3 mr-1 fill-current" aria-hidden="true" />
                    Primary
                  </Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
