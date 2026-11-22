# MobileLauncher (Android, milestone 1)

Done: Microsoft device-code login -> Xbox -> XSTS -> Minecraft token + ownership check;
version manifest; parallel SHA-1-verified download of client jar, libraries, assets.

Setup
1. Azure portal -> App registrations -> new app, "Personal Microsoft accounts" supported,
   Authentication -> Allow public client flows = Yes. Put its Application (client) ID in
   auth/MicrosoftAuth.kt (CLIENT_ID).
2. Minecraft's API only accepts approved Azure apps. Request approval via Mojang's
   "Minecraft API Review" form, otherwise login_with_xbox returns 403.
3. Open in Android Studio and run on an arm64 device.

Next milestones
- Store refresh token (EncryptedSharedPreferences), call MicrosoftAuth.refresh on start.
- Bundle arm64 JRE 21 (+17/8 for older versions); start via JNI.
- Android LWJGL3 + GLFW shim (Surface, touch -> mouse/keys).
- GL translation layer (GL4ES / MobileGlux / ANGLE).
- Build the java launch command from the saved version JSON (arguments, classpath, natives).
