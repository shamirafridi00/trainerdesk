'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TimezoneSelector } from '@/components/shared/timezone-selector';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ProfileSettingsSchema, ProfileSettingsInput } from '@/lib/validations/settings';
import { useUploadThing } from '@/lib/uploadthing';
import { detectTimezone } from '@/lib/utils/timezones';
import { toast } from 'sonner';

export default function ProfileSettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const { startUpload } = useUploadThing('profileImage');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileSettingsInput>({
    resolver: zodResolver(ProfileSettingsSchema),
    defaultValues: {
      timezone: detectTimezone(),
    },
  });

  const timezone = watch('timezone');

  // Fetch trainer profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.trainerId) return;

      try {
        const response = await fetch(`/api/trainers/${session.user.trainerId}`);
        if (!response.ok) throw new Error('Failed to fetch profile');

        const data = await response.json();

        setValue('name', data.user.name);
        setValue('businessName', data.businessName);
        setValue('bio', data.bio || '');
        setValue('phone', data.phone || '');
        setValue('timezone', data.timezone || detectTimezone());
        setValue('profilePhoto', data.profilePhoto || '');
        setProfilePhoto(data.profilePhoto);
      } catch (error) {
        console.error('Fetch profile error:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session, setValue]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image must be less than 4MB');
      return;
    }

    try {
      setIsUploading(true);

      const uploadedFiles = await startUpload([file]);

      if (!uploadedFiles || uploadedFiles.length === 0) {
        throw new Error('Upload failed');
      }

      const uploadedUrl = uploadedFiles[0].url;
      setProfilePhoto(uploadedUrl);
      setValue('profilePhoto', uploadedUrl);

      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ProfileSettingsInput) => {
    if (!session?.user?.trainerId) return;

    try {
      setIsSaving(true);

      const response = await fetch(`/api/trainers/${session.user.trainerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update session with new name
      await updateSession({
        ...session,
        user: {
          ...session.user,
          name: data.name,
        },
      });

      toast.success('Profile updated successfully');
      router.refresh();
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const userInitials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">
          Update your profile information and preferences
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Photo */}
          <div>
            <Label>Profile Photo</Label>
            <div className="mt-2 flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profilePhoto || undefined} />
                <AvatarFallback className="bg-blue-600 text-white text-xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={isUploading || isSaving}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  disabled={isUploading || isSaving}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Change Photo
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-600 mt-1">
                  JPG, PNG or GIF. Max size 4MB.
                </p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...register('name')}
              disabled={isSaving}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Business Name */}
          <div>
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              {...register('businessName')}
              disabled={isSaving}
              placeholder="My Fitness Studio"
            />
            {errors.businessName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.businessName.message}
              </p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={session?.user?.email || ''}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-600 mt-1">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              disabled={isSaving}
              placeholder="+1234567890"
            />
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
            )}
            <p className="text-xs text-gray-600 mt-1">
              Include country code (e.g., +1 for US, +92 for Pakistan)
            </p>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              disabled={isSaving}
              placeholder="Tell clients about yourself and your training philosophy..."
              rows={4}
              maxLength={500}
            />
            {errors.bio && (
              <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>
            )}
            <p className="text-xs text-gray-600 mt-1">
              {watch('bio')?.length || 0}/500 characters
            </p>
          </div>

          {/* Timezone */}
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <TimezoneSelector
              value={timezone}
              onChange={(value) => setValue('timezone', value)}
              disabled={isSaving}
            />
            {errors.timezone && (
              <p className="text-sm text-red-600 mt-1">
                {errors.timezone.message}
              </p>
            )}
            <p className="text-xs text-gray-600 mt-1">
              This affects how booking times are displayed to clients.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/settings')}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || isUploading}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
