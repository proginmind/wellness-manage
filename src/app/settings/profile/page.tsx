import { ProfileContent } from "@/components/profile-content";

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Manage your personal account information
        </p>
      </div>

      <ProfileContent />
    </div>
  );
}
