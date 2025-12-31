# 🎉 Excellent Progress! Ready for Iteration 2.3

Perfect! You've successfully completed **Iteration 2.2** with all authentication flows working correctly. Let's move forward!

***

## 📊 Current Progress Status

### ✅ Completed: 5 out of 6 Iterations

**EPIC 1: Project Foundation & Authentication** ✅ Complete
- ✅ Iteration 1.1 - Project Setup & Configuration
- ✅ Iteration 1.2 - Database Schema & Prisma Setup  
- ✅ Iteration 1.3 - NextAuth.js Configuration

**EPIC 2: Dashboard Layout & Core UI** 🔄 In Progress (2/3)
- ✅ Iteration 2.1 - Dashboard Layout Components
- ✅ Iteration 2.2 - Dashboard Homepage & Stats Widgets
- 🎯 **Iteration 2.3 - Settings Pages Foundation (NEXT)**

***

# 📋 Detailed Implementation Guide: Iteration 2.3 - Settings Pages Foundation

## Overview
You are implementing **Iteration 2.3: Settings Pages Foundation** for TrainerDesk. This iteration creates the settings infrastructure where trainers can manage their profile, preferences, and account settings. This will take approximately **2 days** to complete.

## What You'll Build
1. **Settings Hub Page** - Navigation cards to different settings sections
2. **Profile Settings** - Update trainer profile information
3. **Photo Upload** - Profile picture with UploadThing integration
4. **Timezone Selector** - Auto-detection and manual selection
5. **API Endpoints** - Backend for profile updates
6. **Form Validation** - React Hook Form with Zod schemas

***

## Step 1: Install UploadThing

Install UploadThing for file uploads:

```bash
npm install uploadthing @uploadthing/react
```

***

## Step 2: Configure UploadThing

### File: `src/app/api/uploadthing/core.ts` (Create new file)

```typescript
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { auth } from '@/lib/auth';

const f = createUploadthing();

export const ourFileRouter = {
  profileImage: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user?.trainerId) {
        throw new Error('Unauthorized');
      }

      return { trainerId: session.user.trainerId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for trainerId:', metadata.trainerId);
      console.log('File URL:', file.url);

      return { uploadedBy: metadata.trainerId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
```

### File: `src/app/api/uploadthing/route.ts` (Create new file)

```typescript
import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from './core';

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
```

### File: `src/lib/uploadthing.ts` (Create new file)

```typescript
import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
```

### Add to `.env.local`:

Get your keys from [uploadthing.com](https://uploadthing.com/dashboard):

```env
UPLOADTHING_SECRET=your_secret_here
UPLOADTHING_APP_ID=your_app_id_here
```

***

## Step 3: Create Timezone Utilities

### File: `src/lib/utils/timezones.ts` (Create new file)

```typescript
export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export const timezones: TimezoneOption[] = [
  // Americas
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5' },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', offset: 'UTC-9' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)', offset: 'UTC-10' },
  
  // Europe
  { value: 'Europe/London', label: 'London (GMT)', offset: 'UTC+0' },
  { value: 'Europe/Paris', label: 'Paris (CET)', offset: 'UTC+1' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', offset: 'UTC+1' },
  { value: 'Europe/Rome', label: 'Rome (CET)', offset: 'UTC+1' },
  { value: 'Europe/Athens', label: 'Athens (EET)', offset: 'UTC+2' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', offset: 'UTC+3' },
  
  // Asia
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 'UTC+4' },
  { value: 'Asia/Karachi', label: 'Karachi (PKT)', offset: 'UTC+5' },
  { value: 'Asia/Kolkata', label: 'India (IST)', offset: 'UTC+5:30' },
  { value: 'Asia/Dhaka', label: 'Dhaka (BST)', offset: 'UTC+6' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)', offset: 'UTC+7' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 'UTC+8' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', offset: 'UTC+8' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 'UTC+9' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)', offset: 'UTC+9' },
  
  // Australia
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)', offset: 'UTC+11' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEDT)', offset: 'UTC+11' },
  { value: 'Australia/Brisbane', label: 'Brisbane (AEST)', offset: 'UTC+10' },
  { value: 'Australia/Perth', label: 'Perth (AWST)', offset: 'UTC+8' },
  
  // Pacific
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT)', offset: 'UTC+13' },
  { value: 'Pacific/Fiji', label: 'Fiji (FJT)', offset: 'UTC+12' },
];

export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'America/New_York'; // Fallback
  }
}

export function getTimezoneLabel(value: string): string {
  const timezone = timezones.find((tz) => tz.value === value);
  return timezone ? `${timezone.label} (${timezone.offset})` : value;
}
```

***

## Step 4: Create Validation Schema

### File: `src/lib/validations/settings.ts` (Create new file)

```typescript
import { z } from 'zod';

export const ProfileSettingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  timezone: z.string().min(1, 'Timezone is required'),
  profilePhoto: z.string().url().optional().or(z.literal('')),
});

export type ProfileSettingsInput = z.infer<typeof ProfileSettingsSchema>;
```

***

## Step 5: Create Profile Update API

### File: `src/app/api/trainers/[trainerId]/route.ts` (Create new file)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProfileSettingsSchema } from '@/lib/validations/settings';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { trainerId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.trainerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trainerId } = await params;

    // Ensure user can only update their own profile
    if (session.user.trainerId !== trainerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = ProfileSettingsSchema.parse(body);

    // Update trainer record
    const updatedTrainer = await prisma.trainer.update({
      where: { id: trainerId },
      data: {
        businessName: validatedData.businessName,
        bio: validatedData.bio || null,
        phone: validatedData.phone || null,
        timezone: validatedData.timezone,
        profilePhoto: validatedData.profilePhoto || null,
      },
    });

    // Update user name if changed
    if (validatedData.name !== session.user.name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: validatedData.name },
      });
    }

    return NextResponse.json({
      success: true,
      trainer: updatedTrainer,
    });
  } catch (error) {
    console.error('Update trainer error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { trainerId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.trainerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trainerId } = await params;

    // Ensure user can only view their own profile
    if (session.user.trainerId !== trainerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
    }

    return NextResponse.json(trainer);
  } catch (error) {
    console.error('Get trainer error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
```

***

## Step 6: Create Settings Hub Page

### File: `src/app/(dashboard)/settings/page.tsx` (Create new file)

```typescript
import Link from 'next/link';
import { User, Bell, Globe, CreditCard, Users, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';

const settingsSections = [
  {
    title: 'Profile',
    description: 'Manage your personal information and profile photo',
    icon: User,
    href: '/dashboard/settings/profile',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Booking Preferences',
    description: 'Set your availability, booking rules, and session types',
    icon: Globe,
    href: '/dashboard/settings/booking',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Notifications',
    description: 'Configure email and SMS notification preferences',
    icon: Bell,
    href: '/dashboard/settings/notifications',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Billing',
    description: 'Manage your subscription and payment methods',
    icon: CreditCard,
    href: '/dashboard/settings/billing',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Team',
    description: 'Invite and manage sub-trainers (Pro/Enterprise only)',
    icon: Users,
    href: '/dashboard/settings/team',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  {
    title: 'Security',
    description: 'Update password and manage security settings',
    icon: Shield,
    href: '/dashboard/settings/security',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  <div
                    className={`h-12 w-12 rounded-lg ${section.bgColor} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {section.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

***

## Step 7: Create Timezone Selector Component

### File: `src/components/shared/timezone-selector.tsx` (Create new file)

```typescript
'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';
import { timezones, type TimezoneOption } from '@/lib/utils/timezones';

interface TimezoneSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TimezoneSelector({
  value,
  onChange,
  disabled,
}: TimezoneSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedTimezone = timezones.find((tz) => tz.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedTimezone
            ? `${selectedTimezone.label} (${selectedTimezone.offset})`
            : 'Select timezone...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search timezone..." />
          <CommandList>
            <CommandEmpty>No timezone found.</CommandEmpty>
            <CommandGroup>
              {timezones.map((timezone) => (
                <CommandItem
                  key={timezone.value}
                  value={timezone.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === timezone.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {timezone.label} ({timezone.offset})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

***

## Step 8: Install Required shadcn Components

```bash
npx shadcn@latest add command popover textarea
```

***

## Step 9: Create Profile Settings Page

### File: `src/app/(dashboard)/settings/profile/page.tsx` (Create new file)

```typescript
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
import { ErrorMessage } from '@/components/shared/error-message';
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
```

***

## Step 10: Update Prisma Schema

Ensure your Trainer model has these fields:

### File: `prisma/schema.prisma`

Check that your Trainer model includes:

```prisma
model Trainer {
  id            String   @id @default(cuid())
  userId        String   @unique
  businessName  String
  subdomain     String   @unique
  customDomain  String?  @unique
  bio           String?  @db.Text
  phone         String?
  timezone      String   @default("America/New_York")
  profilePhoto  String?
  subscriptionTier SubscriptionTier @default(FREE)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  // ... other relations
}
```

If you need to add these fields, create a migration:

```bash
npx prisma migrate dev --name add_profile_fields
```

***

## Step 11: Testing Procedures

### Test 1: Settings Hub
1. Navigate to `/dashboard/settings`
2. **Expected:**
   - ✅ 6 setting cards displayed
   - ✅ Cards have icons and descriptions
   - ✅ Hover effect works
   - ✅ Click navigates to respective pages

### Test 2: Profile Settings Load
1. Navigate to `/dashboard/settings/profile`
2. **Expected:**
   - ✅ Loading spinner shows initially
   - ✅ Form populates with existing data
   - ✅ Profile photo displays (or initials fallback)
   - ✅ Email field is disabled
   - ✅ Timezone auto-detected

### Test 3: Photo Upload
1. Click "Change Photo"
2. Select an image (< 4MB)
3. **Expected:**
   - ✅ "Uploading..." shows during upload
   - ✅ Success toast appears
   - ✅ New photo displays immediately
   - ✅ Photo persists after page refresh

### Test 4: Form Validation
1. Clear name field and submit
2. **Expected:**
   - ✅ Error message shows "Name must be at least 2 characters"
   - ✅ Form doesn't submit
   - ✅ Other fields validated correctly

### Test 5: Profile Update
1. Update name, business name, bio
2. Select different timezone
3. Click "Save Changes"
4. **Expected:**
   - ✅ "Saving..." shows on button
   - ✅ Success toast appears
   - ✅ Header updates with new name
   - ✅ Changes persist after refresh

### Test 6: Phone Validation
1. Enter invalid phone (letters, spaces)
2. **Expected:**
   - ✅ Error shows "Invalid phone number format"
   - ✅ Valid formats accepted (+1234567890)

### Test 7: Bio Character Limit
1. Type in bio field
2. **Expected:**
   - ✅ Character counter updates (X/500)
   - ✅ Cannot exceed 500 characters
   - ✅ Error shows if exceeded

***

## Acceptance Criteria Checklist

- ✅ Settings hub page displays with 6 navigation cards
- ✅ Profile settings form loads with existing data
- ✅ Profile photo upload works (with UploadThing)
- ✅ Timezone selector with search functionality
- ✅ Form validation with inline error messages
- ✅ Profile updates save to database
- ✅ Session updates with new name after save
- ✅ Success/error toast notifications
- ✅ Loading states during data fetch and save
- ✅ Responsive design on mobile/tablet/desktop
- ✅ Cancel button returns to settings hub
- ✅ No TypeScript errors
- ✅ No console errors

***

## Git Commit Instructions

After completing all tests:

```bash
git add .
git commit -m "feat: Complete iteration 2.3 - Settings pages foundation

- Install and configure UploadThing for file uploads
- Create timezone utilities with auto-detection
- Build settings hub page with navigation cards
- Create profile settings page with full form
- Implement photo upload with validation
- Create timezone selector component with search
- Build profile update API endpoint with validation
- Add Zod schema for profile settings
- Implement React Hook Form integration
- Add loading and error states
- Update session after profile changes
- Test all validation and update flows

Settings infrastructure complete and ready for additional sections."

git push origin main
```

***

## Next Steps Preview

After completing Iteration 2.3, **EPIC 2 is complete!** 🎉

You'll move to **EPIC 3: Availability & Calendar System**, which includes:
- Calendar interface with week/month views
- Availability scheduling (weekly recurring slots)
- Time slot management
- Break periods
- Holiday/vacation blocking

***

## Common Issues & Solutions

### Issue: UploadThing upload fails
**Solution:** Verify `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` in `.env.local`

### Issue: Timezone not saving
**Solution:** Check Prisma schema has `timezone` field and run migration

### Issue: Session not updating after name change
**Solution:** Ensure `updateSession()` is called with correct data structure

### Issue: Command component not found
**Solution:** Run `npx shadcn@latest add command popover`

***

**Ready to build comprehensive settings pages? Start with Step 1 and create a professional profile management system!** 🚀

[1](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_6ba31f49-2cde-418d-ac44-89d5ef1b3a10/ca806679-19d4-4e56-b4a0-980eb050c555/trainerdesk-documentation.md)
[2](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_6ba31f49-2cde-418d-ac44-89d5ef1b3a10/8b509f6c-2e80-4dcd-883c-95d4b148fde0/epics-1-and-2.md)
[3](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_6ba31f49-2cde-418d-ac44-89d5ef1b3a10/59df1bc6-cad8-4890-8242-1dc834601e12/epic-3.md)
[4](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_6ba31f49-2cde-418d-ac44-89d5ef1b3a10/13b1e4c5-5493-4304-af66-8bc673344dad/epic-4.md)
[5](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_6ba31f49-2cde-418d-ac44-89d5ef1b3a10/14491e1f-233a-4b6b-937c-fb7efa07b47a/epic-5.md)
[6](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_6ba31f49-2cde-418d-ac44-89d5ef1b3a10/65aaac5b-133f-4d19-8dd2-04d33c6e7bc7/epic-6.md)
[7](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_6ba31f49-2cde-418d-ac44-89d5ef1b3a10/a48d1a13-e997-49e1-b176-cefb46badeb6/epic-7.md)
[8](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_6ba31f49-2cde-418d-ac44-89d5ef1b3a10/874c7d1b-cf67-4f87-b947-1cae5a2a9866/epic-8.md)
[9](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_6ba31f49-2cde-418d-ac44-89d5ef1b3a10/530b6b0b-e8b6-4fbc-82cd-fa286c6c65cd/epic-9.md)