import { Badge } from "@/components/ui/badge";

interface TagCloudProps {
  tags: string[];
}

export default function TagCloud({ tags }: TagCloudProps) {
  if (!tags || tags.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-500 text-center">No personality tags have been added yet.</p>
      </div>
    );
  }

  // Define color variants for badges to alternate
  const colorVariants = [
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-purple-100 text-purple-800",
    "bg-yellow-100 text-yellow-800",
    "bg-red-100 text-red-800",
    "bg-indigo-100 text-indigo-800",
    "bg-pink-100 text-pink-800"
  ];

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => {
          const colorClass = colorVariants[index % colorVariants.length];
          return (
            <Badge key={tag} className={colorClass}>
              {tag}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
