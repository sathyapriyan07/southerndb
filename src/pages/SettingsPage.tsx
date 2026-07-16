import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile } from "@/services/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { User, Save } from "lucide-react";

export function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    await updateProfile(profile.id, { display_name: displayName, bio });
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 md:px-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] mb-8">Settings</h1>

        <div className="bg-bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar src={profile?.avatar_url} name={profile?.display_name || "User"} size="xl" />
            <div>
              <p className="text-sm font-medium text-text">{profile?.display_name}</p>
              <p className="text-xs text-text-muted">@{profile?.username}</p>
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted mb-2 block">Display Name</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              icon={<User className="w-4 h-4" />}
            />
          </div>

          <div>
            <label className="text-xs text-text-muted mb-2 block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="w-full h-24 bg-surface border border-border rounded-lg px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
