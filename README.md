# GFX License Control Panel

Premium SaaS license key management — Next.js 14 + PostgreSQL + Vercel.

---

## 🚀 Deploy in 5 Steps

### 1. PostgreSQL Database
Use **Neon** (free, Vercel-native): https://neon.tech
- Create project → copy the `DATABASE_URL` connection string

### 2. Clone & Install
```bash
git clone <your-repo>
cd gfx-license-panel
npm install
cp .env.example .env.local   # fill in values
```

### 3. Generate AUTH_SECRET
```bash
openssl rand -hex 32
```
Paste result as `AUTH_SECRET` in `.env.local`.

### 4. Push DB + Create Admin
```bash
npm run db:push        # create tables
npm run db:seed        # create admin account
```

### 5. Deploy to Vercel
```bash
npx vercel
```
Add environment variables in Vercel dashboard:
- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

After first deploy, run migrations:
```bash
npx vercel env pull .env.production.local
DATABASE_URL=... npx prisma db push
DATABASE_URL=... npx tsx prisma/seed.ts
```

---

## 📱 Android Integration

```kotlin
// In your app's LicenseManager.kt
suspend fun verify(key: String, context: Context): Boolean {
    val deviceId = Settings.Secure.getString(
        context.contentResolver, Settings.Secure.ANDROID_ID
    )
    val body = JSONObject().apply {
        put("key", key)
        put("deviceId", deviceId)
        put("deviceName", Build.MODEL)
        put("appVersion", BuildConfig.VERSION_NAME)
    }
    val client = OkHttpClient()
    val request = Request.Builder()
        .url("https://YOUR-PANEL.vercel.app/api/connect")
        .post(body.toString().toRequestBody("application/json".toMediaType()))
        .build()
    return try {
        val response = client.newCall(request).execute()
        val json = JSONObject(response.body!!.string())
        json.getBoolean("success")
    } catch (e: Exception) {
        false  // Handle offline gracefully
    }
}
```

---

## 📡 API Reference

### POST /api/connect (Public)
```json
Request:  { "key": "GFX-XXXX-XXXX-XXXX", "deviceId": "...", "deviceName": "...", "appVersion": "..." }
Success:  { "success": true, "status": "active", "expiresAt": "2026-12-31T23:59:59Z" }
Failure:  { "success": false, "message": "License has expired" }
```

Failure reasons: `Key not found` · `License has been revoked` · `License has expired` · `Device is blocked` · `Maximum device limit reached`

---

## 🔐 Security Notes
- Admin password hashed with bcrypt (12 rounds)
- Sessions via iron-session (HTTP-only encrypted cookie)
- Rate limiting: 10 req/min per IP on `/api/connect`
- No credentials stored in Android APK
- All admin routes require server-side session validation
