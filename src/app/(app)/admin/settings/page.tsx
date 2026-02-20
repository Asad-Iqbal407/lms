import { getServerEnv } from "@/server/env";

export default function AdminSettingsPage() {
  const env = getServerEnv();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-zinc-600">Operational settings for the LMS environment.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">Authentication</div>
          <p className="mt-1 text-xs text-zinc-600">Single sign-on and session settings.</p>
          <div className="mt-4 grid gap-2 text-sm text-zinc-700">
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
              <span>NextAuth URL</span>
              <span className="text-xs text-zinc-500">{env.NEXTAUTH_URL ?? "Not set"}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
              <span>Session strategy</span>
              <span className="text-xs text-zinc-500">JWT</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">Data</div>
          <p className="mt-1 text-xs text-zinc-600">Database connectivity and backup status.</p>
          <div className="mt-4 grid gap-2 text-sm text-zinc-700">
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
              <span>Database</span>
              <span className="text-xs text-emerald-600">Connected</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
              <span>Backup policy</span>
              <span className="text-xs text-zinc-500">Managed in MongoDB Atlas</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">Notifications</div>
          <p className="mt-1 text-xs text-zinc-600">Platform email and alert routing.</p>
          <div className="mt-4 grid gap-2 text-sm text-zinc-700">
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
              <span>Outbound email</span>
              <span className="text-xs text-zinc-500">Not configured</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
              <span>Admin alerts</span>
              <span className="text-xs text-zinc-500">Manual review</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">Policies</div>
          <p className="mt-1 text-xs text-zinc-600">Governance, terms, and access rules.</p>
          <div className="mt-4 grid gap-2 text-sm text-zinc-700">
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
              <span>Account approval</span>
              <span className="text-xs text-zinc-500">Admins only</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
              <span>Role reviews</span>
              <span className="text-xs text-zinc-500">Every semester</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
