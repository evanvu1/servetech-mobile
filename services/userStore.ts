import { File, Paths } from "expo-file-system";
import type { UserProfile } from "@/types/user";

// Local-only profile, same pattern as historyStore: a single JSON file under
// the document directory. Its existence also doubles as the "has the user
// finished onboarding" flag, so there's no separate flag to keep in sync.
const profileFile = new File(Paths.document, "profile.json");

export async function getProfile(): Promise<UserProfile | null> {
  if (!profileFile.exists) return null;
  try {
    return JSON.parse(await profileFile.text()) as UserProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile) {
  profileFile.write(JSON.stringify(profile));
}
