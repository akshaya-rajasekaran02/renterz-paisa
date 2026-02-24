import { Link } from 'react-router-dom'
import Footer from '../../components/Footer'

const sections = [
  { id: 'overview', title: 'Overview' },
  { id: 'roles', title: 'Roles and Access' },
  { id: 'auth', title: 'Authentication Flow' },
  { id: 'routing', title: 'Role Routing and Guards' },
  { id: 'features', title: 'Implemented Features' },
  { id: 'api', title: 'Backend API Contract Used' },
  { id: 'examples', title: 'Examples' },
  { id: 'visual', title: 'Visual Flow' },
]

export default function DocumentationPage() {
  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-4 pb-14 pt-8 md:px-6">
        <div className="mb-6 rounded-2xl border border-base bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-soft">Renterz Platform</p>
          <h1 className="mt-2 text-3xl font-bold">Frontend Documentation</h1>
          <p className="mt-2 text-sm text-soft">
            Complete implementation summary of the multi-tenant frontend updates done so far.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/" className="rounded-lg border border-base px-3 py-1.5 text-sm font-semibold hover-surface-soft">Back to Landing</Link>
            <a href="#overview" className="rounded-lg border border-base px-3 py-1.5 text-sm font-semibold hover-surface-soft">Start Reading</a>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="card h-fit p-4">
            <h2 className="text-sm font-semibold">Contents</h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {sections.map((item) => (
                <li key={item.id}>
                  <a className="text-soft hover:text-main" href={`#${item.id}`}>{item.title}</a>
                </li>
              ))}
            </ul>
          </aside>

          <section className="space-y-4">
            <article id="overview" className="card p-5">
              <h3 className="text-xl font-bold">Overview</h3>
              <p className="mt-2 text-sm text-soft">
                This app now supports a multi-tenant SaaS frontend model using JWT claims for role and building context, with a single login page and admin-managed user onboarding.
              </p>
            </article>

            <article id="roles" className="card p-5">
              <h3 className="text-xl font-bold">Roles and Access</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-soft">
                <li>`SUPER_ADMIN`: platform-level building management only.</li>
                <li>`BUILDING_ADMIN`: manage owners, tenants, and operational modules.</li>
                <li>`OWNER`: owner dashboard and owner module with scoped operations.</li>
                <li>`TENANT`: rent, payments, and complaints access for assigned account.</li>
              </ul>
            </article>

            <article id="auth" className="card p-5">
              <h3 className="text-xl font-bold">Authentication Flow</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-soft">
                <li>Single login page accepts email and password.</li>
                <li>JWT is parsed for `userId`, `role`, and `buildingId` (supports snake_case too).</li>
                <li>Session stored in `sessionStorage` and auto-cleared on logout/expiry.</li>
                <li>`/api/common/users/me` is used to sync profile and building status.</li>
                <li>If building is inactive (except super admin), user is forced to login.</li>
              </ul>
            </article>

            <article id="routing" className="card p-5">
              <h3 className="text-xl font-bold">Role Routing and Guards</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-soft">
                <li>Post-login redirects are role-based (`/super-admin` or `/dashboard`).</li>
                <li>Protected routes block unauthorized role access.</li>
                <li>Public routes redirect authenticated users to role home pages.</li>
                <li>Sidebar and UI items are rendered from role in JWT-derived auth context.</li>
              </ul>
            </article>

            <article id="features" className="card p-5">
              <h3 className="text-xl font-bold">Implemented Features</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-soft">
                <li>Owner can assign rent to tenant for owned units.</li>
                <li>Admin dashboard shows live online users count.</li>
                <li>Currency defaults to INR and converts to selected currency (USD/EUR/GBP/AED).</li>
                <li>Super Admin dashboard for building create/activate/deactivate.</li>
                <li>Building Admin users page integrated with backend APIs (owner/tenant only).</li>
              </ul>
            </article>

            <article id="api" className="card p-5">
              <h3 className="text-xl font-bold">Backend API Contract Used</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-soft">
                <li>`POST /auth/login`</li>
                <li>`GET /api/common/users/me`</li>
                <li>`GET /api/admin/users`</li>
                <li>`POST /api/admin/users/owners`</li>
                <li>`POST /api/admin/users/tenants`</li>
                <li>`DELETE /api/admin/users/:id`</li>
                <li>`POST /api/admin/users/:id/reset-password`</li>
              </ul>
            </article>

            <article id="examples" className="card p-5">
              <h3 className="text-xl font-bold">Examples</h3>
              <p className="mt-2 text-sm text-soft">Example JWT payload used by frontend:</p>
              <pre className="mt-3 overflow-x-auto rounded-xl border border-base bg-surface-soft p-3 text-xs">
{`{
  "sub": "buildingadmin@renterz.com",
  "userId": 17,
  "role": "BUILDING_ADMIN",
  "buildingId": 101,
  "exp": 1768888888
}`}
              </pre>
              <p className="mt-3 text-sm text-soft">Role redirect examples:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-soft">
                <li>`SUPER_ADMIN` {'->'} `/super-admin`</li>
                <li>`BUILDING_ADMIN` {'->'} `/dashboard`</li>
                <li>`OWNER` {'->'} `/dashboard`</li>
                <li>`TENANT` {'->'} `/dashboard`</li>
              </ul>
            </article>

            <article id="visual" className="card p-5">
              <h3 className="text-xl font-bold">Visual Flow</h3>
              <pre className="mt-3 overflow-x-auto rounded-xl border border-base bg-surface-soft p-3 text-xs">
{`[Login Page]
    |
    v
POST /auth/login
    |
    v
JWT { userId, role, buildingId, exp }
    |
    v
AuthContext (sessionStorage + token checks)
    |
    +--> GET /api/common/users/me (building status sync)
    |
    v
Role Home Redirect
    |
    +--> SUPER_ADMIN  -> Super Admin Dashboard
    +--> BUILDING_ADMIN -> Building Admin Dashboard
    +--> OWNER        -> Owner Dashboard
    +--> TENANT       -> Tenant Dashboard
`}
              </pre>
            </article>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
