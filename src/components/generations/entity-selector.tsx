"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { Entity, EntityImage } from "@/types";

interface EntityWithImage extends Entity {
  primaryImage: EntityImage | null;
}

interface EntitySelectorProps {
  entities: EntityWithImage[];
  selectedEntityIds: string[];
  onSelectionChange: (entityIds: string[]) => void;
}

const ENTITY_TYPE_COLORS: Record<string, string> = {
  character: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  location: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  object: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  style: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  custom: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
};

export default function EntitySelector({
  entities,
  selectedEntityIds,
  onSelectionChange,
}: EntitySelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedEntities = entities.filter((e) => selectedEntityIds.includes(e.id));

  const toggleEntity = (entityId: string) => {
    if (selectedEntityIds.includes(entityId)) {
      onSelectionChange(selectedEntityIds.filter((id) => id !== entityId));
    } else {
      onSelectionChange([...selectedEntityIds, entityId]);
    }
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedEntityIds.length === 0 ? (
              <span className="text-muted-foreground">Select entities...</span>
            ) : (
              <span>
                {selectedEntityIds.length} {selectedEntityIds.length === 1 ? "entity" : "entities"} selected
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search entities..." />
            <CommandList>
              <CommandEmpty>No entities found.</CommandEmpty>
              <CommandGroup>
                {entities.map((entity) => (
                  <CommandItem
                    key={entity.id}
                    value={entity.name}
                    onSelect={() => toggleEntity(entity.id)}
                    className="flex items-center gap-2"
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        selectedEntityIds.includes(entity.id)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <span>{entity.name}</span>
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", ENTITY_TYPE_COLORS[entity.type])}
                      >
                        {entity.type}
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Entities Display */}
      {selectedEntities.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/50">
          {selectedEntities.map((entity) => (
            <Badge
              key={entity.id}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {entity.name}
              <button
                onClick={() => toggleEntity(entity.id)}
                className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="h-6 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
