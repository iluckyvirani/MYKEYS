"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ContentField,
  ContentTextArea,
} from "@/components/admin/content/ContentFields";
import { api } from "@/lib/api";
import type { InspirePageContent } from "@/lib/content/inspireDefaults";
import {
  mergeMovingStoriesList,
  slugifyStoryTitle,
  type MovingStory,
  type MovingStoriesSectionContent,
} from "@/lib/movingStories";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function emptyStory(index: number): MovingStory {
  const title = `New moving story ${index}`;
  return {
    id: `story-${Date.now()}-${index}`,
    slug: slugifyStoryTitle(title),
    title,
    excerpt: "",
    cta: "Read more",
    image: "",
    imageAlt: "",
  };
}

function StoryImageField({
  label,
  image,
  onUploaded,
}: {
  label: string;
  image: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
    try {
      setUploading(true);
      setError("");
      const base64 = await fileToBase64(file);
      const res = await api.post("/upload", {
        image: base64,
        folder: "mykeys/moving-stories",
      });
      const url = res.data?.data?.url as string;
      if (!url) throw new Error("No URL returned");
      onUploaded(url);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Upload failed";
      setError(message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <div className="relative w-full sm:w-40 aspect-[16/11] rounded-lg overflow-hidden bg-slate-100 border border-gray-200">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
              No image
            </div>
          )}
        </div>
        <div className="space-y-2 flex-1 w-full">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPick}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ImagePlus className="w-4 h-4 mr-2" />
            )}
            {uploading ? "Uploading…" : "Upload image"}
          </Button>
          <ContentField
            label="Image URL"
            value={image}
            hint="Upload above or paste a URL"
            onChange={onUploaded}
          />
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}

function StoryFields({
  story,
  onChange,
  onRemove,
  canRemove,
  heading,
}: {
  story: MovingStory;
  onChange: (patch: Partial<MovingStory>) => void;
  onRemove?: () => void;
  canRemove?: boolean;
  heading: string;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-semibold text-gray-900">{heading}</h4>
        {onRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            disabled={!canRemove}
            className="text-red-600 hover:text-red-700 cursor-pointer"
            aria-label="Remove story"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        ) : null}
      </div>
      <ContentField
        label="Title"
        value={story.title}
        onChange={(v) =>
          onChange({
            title: v,
            slug: story.slug || slugifyStoryTitle(v),
          })
        }
      />
      <ContentField
        label="URL slug"
        value={story.slug}
        hint="Used in /inspire/moving-stories/your-slug"
        onChange={(v) =>
          onChange({
            slug: slugifyStoryTitle(v) || story.slug,
          })
        }
      />
      <ContentTextArea
        label="Excerpt"
        value={story.excerpt}
        rows={2}
        onChange={(v) => onChange({ excerpt: v })}
      />
      <ContentField
        label="CTA label"
        value={story.cta}
        onChange={(v) => onChange({ cta: v })}
      />
      <StoryImageField
        label="Story image"
        image={story.image}
        onUploaded={(url) => onChange({ image: url })}
      />
      <ContentField
        label="Image alt text"
        value={story.imageAlt}
        onChange={(v) => onChange({ imageAlt: v })}
      />
    </div>
  );
}

export function MovingStoriesEditor({
  content,
  setContent,
}: {
  content: InspirePageContent;
  setContent: React.Dispatch<React.SetStateAction<InspirePageContent>>;
}) {
  const stories: MovingStoriesSectionContent = mergeMovingStoriesList(
    content.stories
  );

  const setStories = (
    updater: (prev: MovingStoriesSectionContent) => MovingStoriesSectionContent
  ) => {
    setContent((c) => ({
      ...c,
      stories: updater(mergeMovingStoriesList(c.stories)),
    }));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="font-semibold text-gray-900">Story cards</h3>
        <p className="text-sm text-gray-500 mt-1">
          Upload images and edit titles for the Moving Stories list. Save this
          section when you are done.
        </p>
      </div>

      {stories.items.map((story, index) => (
        <StoryFields
          key={story.id}
          heading={`Story ${index + 1}`}
          story={story}
          canRemove={stories.items.length > 1}
          onRemove={() =>
            setStories((prev) => ({
              ...prev,
              items: prev.items.filter((_, i) => i !== index),
            }))
          }
          onChange={(patch) =>
            setStories((prev) => ({
              ...prev,
              items: prev.items.map((s, i) =>
                i === index ? { ...s, ...patch } : s
              ),
            }))
          }
        />
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          setStories((prev) => ({
            ...prev,
            items: [...prev.items, emptyStory(prev.items.length + 1)],
          }))
        }
        className="w-full h-12 border-dashed border-2 border-green-300 text-green-800 hover:bg-green-50 cursor-pointer"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add another story
      </Button>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">
          Featured sidebar story
        </h3>
        <StoryFields
          heading="Featured card"
          story={stories.featured}
          onChange={(patch) =>
            setStories((prev) => ({
              ...prev,
              featured: { ...prev.featured, ...patch },
            }))
          }
        />
      </div>
    </div>
  );
}
