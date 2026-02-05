
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { userApi } from '@/lib/api/users';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { UserProfile } from '@/types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

interface EditProfileFormData {
  name: string;
  bio: string;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, currentUser }) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<EditProfileFormData>({
    defaultValues: {
      name: currentUser.name,
      bio: currentUser.bio || '',
    }
  });

  const onSubmit = async (data: EditProfileFormData) => {
    setIsSubmitting(true);
    try {
      // Update Name
      if (data.name !== currentUser.name) {
        await userApi.updateName(data.name);
      }
      
      // Update Bio
      if (data.bio !== (currentUser.bio || '')) {
        await userApi.updateBio(data.bio);
      }

      await queryClient.invalidateQueries({ queryKey: ['user', 'profile', currentUser.username] });
      
      toast.success("Profile Updated: Your profile details have been saved.");
      onClose();
    } catch (error) {
      toast.error("Error: Failed to update profile. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Edit Profile</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
            />
            {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300">Bio</Label>
            <Textarea
              id="bio"
              {...register("bio", { maxLength: { value: 160, message: "Bio must be less than 160 characters" } })}
              className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white resize-none h-24"
              placeholder="Tell us about yourself..."
            />
             {errors.bio && <span className="text-red-500 text-sm">{errors.bio.message}</span>}
            <div className="text-xs text-gray-500 text-right">
              Max 160 characters
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
