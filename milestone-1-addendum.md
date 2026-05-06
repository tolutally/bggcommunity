# Milestone 1 Addendum — Auth, Onboarding & Shared Infrastructure

## Status overview

| Area | Status | Notes |
|------|--------|-------|
| Auth endpoints (register, login, refresh, logout, forgot/reset/change password, delete account) | ✅ Done | Full class-based router → controller → service → repository |
| JWT access + refresh token pair | ✅ Done | 15m access / 7-day refresh; refresh stored in Redis with TTL |
| Redis singleton (`ioredis`) | ✅ Done | `src/config/redis.ts` |
| Prisma schema (all 3 milestones) | ✅ Done | `prisma/schema.prisma`; migration `20260318152145_init` applied |
| Docker Compose (app + postgres + redis + adminer) | ✅ Done | Adminer on `--profile tools` |
| Email service (nodemailer + console fallback) | ✅ Done | `src/shared/services/email.service.ts` |
| Auth middleware (`verifyToken`, `requireAdmin`) | ✅ Done | `src/shared/middlewares/auth.middleware.ts` |
| Error middleware (`AppError` + global handler) | ✅ Done | Handles `AppError`, `ZodError`, fallback 500 |
| File upload abstraction + Cloudinary provider | ✅ Done | See section below |
| Google OAuth | ⚠️ Stubbed | Controllers return 501; see BLA-128 note below |
| `lastLoginAt` field | ❌ Missing | See BLA-218 below |
| Users module (profile, avatar, privacy, onboarding) | ❌ Not started | BLA-132 – BLA-136 |
| AuditService | ❌ Not started | BLA-220 |
| Input sanitisation middleware | ❌ Not started | BLA-221 |
| Swagger / OpenAPI setup | ❌ Not started | BLA-226 |
| Production email provider (Resend) | ❌ Not started | BLA-225 |

---

## File upload — storage abstraction (completed)

### Pattern

```
IStorageProvider  (interface)
  └── CloudinaryProvider  (concrete — used now)
  └── DigitalOceanSpacesProvider  (plug in later — zero call-site changes)

UploadService  (consumes IStorageProvider)
  └── uploadService singleton  (src/shared/services/storage/index.ts)
```

### Key files

| File | Purpose |
|------|---------|
| `src/shared/interfaces/storage.interface.ts` | `IStorageProvider`, `UploadOptions`, `UploadResult` |
| `src/shared/services/storage/cloudinary.provider.ts` | Cloudinary implementation |
| `src/shared/services/storage/index.ts` | Singleton — swap provider here only |
| `src/shared/services/upload.service.ts` | Validation (type, 2 MB cap) + delegate to provider |
| `src/shared/middlewares/upload.middleware.ts` | Multer in-memory middleware (`avatarUpload`) |

### New env vars (add to `.env`)

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Usage in a controller

```ts
import { avatarUpload } from "../../shared/middlewares/upload.middleware.js";
import { uploadService } from "../../shared/services/storage/index.js";

// router
router.post("/users/me/avatar", verifyToken, avatarUpload, usersController.uploadAvatar);

// controller method
uploadAvatar = async (req: Request, res: Response) => {
  if (!req.file) throw new AppError("No file provided.", 400);
  const result = await uploadService.uploadAvatar(
    req.file.buffer,
    req.file.mimetype,
    req.user!.userId,
  );
  // persist result.url and result.publicId to Profile.avatarUrl
  res.json({ success: true, data: { avatarUrl: result.url } });
};
```

---

## Outstanding items

### BLA-218 — `lastLoginAt` missing from schema

The `User` model needs a `lastLoginAt DateTime?` field. After adding it:

```bash
npx prisma migrate dev --name add_last_login_at
```

Then in `AuthService.login`, after issuing tokens:

```ts
await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
```

---

### BLA-128 — Google OAuth (correct flow)

The Linear spec calls for a **client-side `id_token` flow**, not a server-side redirect:

1. Frontend signs in with Google → receives `id_token`
2. Frontend sends `POST /api/v1/auth/google` with `{ idToken: "..." }`
3. Backend verifies with `google-auth-library` `OAuth2Client.verifyIdToken()`
4. Backend upserts user and returns the standard JWT pair

Install: `npm install google-auth-library`

Current stubs in `auth.controller.ts` return 501 — replace with this flow.

---

### BLA-132–136 — Users module (Milestone 1 completion)

Endpoints to implement in `src/modules/users/`:

| Method | Path | Description |
|--------|------|-------------|
| `PATCH` | `/api/v1/users/me/profile` | Update name, bio, jobTitle, company, industry, location, socials, isOpenToWork |
| `POST` | `/api/v1/users/me/avatar` | Upload avatar via `avatarUpload` middleware + `uploadService` |
| `PATCH` | `/api/v1/users/me/privacy` | Toggle `isPublic` |
| `POST` | `/api/v1/users/me/onboarding-complete` | Set `onboardingComplete: true` |

---

### BLA-220 — AuditService

Build a shared helper before starting Milestone 2 admin routes:

```ts
// src/shared/services/audit.service.ts
class AuditService {
  async log(params: {
    userId: string;       // admin performing the action
    action: string;       // e.g. "SUSPEND_USER"
    targetType: string;   // e.g. "User"
    targetId: string;
    metadata?: Record<string, unknown>;
  }): Promise<void>
}

export const auditService = new AuditService();
```

---

### BLA-221 — Input sanitisation

Install `sanitize-html` and add a middleware or Zod transform that strips HTML from all user-provided strings before they reach service/repository layers.

---

### BLA-225 — Production email (Resend)

Current `email.service.ts` uses nodemailer with an optional SMTP config. For production, swap the transport for Resend's SMTP relay or their REST SDK. The service interface (`sendEmail`, `sendPasswordResetEmail`) stays the same — only the transport changes.

---

### BLA-226 — Swagger / OpenAPI

`swagger-jsdoc` and `swagger-ui-express` are already installed. Steps:

1. Add `swaggerSpec` config in `src/config/swagger.ts`
2. Mount `swagger-ui-express` in `src/app.ts` at `/api/v1/docs`
3. Add JSDoc `@swagger` comments to auth routes first, then expand to all modules

---

## Recommended completion order

1. **BLA-218** — `lastLoginAt` migration (10 min)
2. **BLA-220** — `AuditService` (needed by all admin routes)
3. **BLA-132–136** — Users module (profile + avatar uses the new upload service)
4. **BLA-128** — Google OAuth (swap stubs for real `id_token` flow)
5. **BLA-221** — Input sanitisation middleware
6. **BLA-226** — Swagger setup
7. **BLA-225** — Production email provider
8. → Begin **Milestone 2**
