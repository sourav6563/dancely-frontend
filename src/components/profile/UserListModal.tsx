
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Search } from "lucide-react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FollowerUser } from "@/types";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: FollowerUser[];
  emptyMessage: string;
}

export function UserListModal({
  isOpen,
  onClose,
  title,
  users,
  emptyMessage,
}: UserListModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Simple client-side filtering
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm max-h-[70vh] h-auto flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogHeader className="p-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-base">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            List of {title.toLowerCase()}
          </DialogDescription>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 h-9 bg-muted/50 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 max-h-72">
          {filteredUsers.length > 0 ? (
            <div className="p-2 space-y-1">
              {filteredUsers.map((user) => (
                <Link key={user._id} href={`/profile/${user.username}`} onClick={onClose}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <Avatar className="h-9 w-9 ring-1 ring-purple-100 dark:ring-purple-900/50">
                      <AvatarImage src={user.profileImage} alt={user.name} />
                      <AvatarFallback className="bg-linear-to-br from-purple-500 to-blue-500 text-white text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm text-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground text-sm">
                {searchQuery ? "No users found" : emptyMessage}
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
