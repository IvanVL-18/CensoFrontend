// src/components/users/AvatarCircle.tsx
import { User2 } from "lucide-react";

interface AvatarCircleProps {
  fullName: string;
  avatarUrl?: string | null;
}

export function AvatarCircle({ fullName, avatarUrl }: AvatarCircleProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fullName}
        className="h-8 w-8 rounded-full object-cover border border-gray-200"
      />
    );
  }

  return (
    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
      <User2 className="h-4 w-4 text-gray-500" />
    </div>
  );
}
