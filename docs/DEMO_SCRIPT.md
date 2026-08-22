# 🎬 NagrikSetu: The 3-Minute "Golden Path" Demo Script

This script is engineered to flawlessly demonstrate the **"Architectural Illusion"** of the NagrikSetu platform. It highlights every major technical flex—AI routing, Haversine GPS fencing, WebRTC proof-of-work, and system interoperability—within a strict 3-minute window suitable for hackathon submissions.

---

## ⏱️ Timeline Overview
- **0:00 - 0:15:** Intro & Landing Page (The Hook)
- **0:15 - 1:00:** Citizen Flow (Frictionless, AI-powered reporting)
- **1:00 - 1:45:** Department Flow (Accountability & GPS Proof-of-work)
- **1:45 - 2:15:** Admin Flow (God-view & System interoperability)
- **2:15 - 2:45:** Public Map (Transparency & Gamification)
- **2:45 - 3:00:** Outro (The Viksit Bharat Vision)

---

## 🎬 Step-by-Step Recording Guide

### 1. The Hook (0:00 - 0:15)
*   **Screen:** Start on the root Landing Page (`/`). 
*   **Action:** Hover over the Framer Motion cards to show the cyberpunk aesthetic and glow effects.
*   **Voiceover:** *"Traditional civic complaint systems are broken black boxes. NagrikSetu replaces them with an AI-powered accountability engine. Let me show you how we enforce transparency from the moment a citizen takes a photo, all the way to the municipal commissioner's dashboard."*

### 2. The Citizen Flow (0:15 - 1:00)
*   **Screen:** Click **"Citizen Reporter"** and switch your browser to **Mobile View** (using Chrome DevTools).
*   **Action 1 (Live Capture):** Tap the camera area. Emphasize that the gallery is disabled—it forces a live WebRTC capture. Take a photo of an object (e.g., a crack on the floor).
*   **Action 2 (The AI Illusion):** Watch the 3-step scanning sequence:
    *   *Computer Vision Classification...*
    *   *EXIF Telemetry Validation...*
    *   *Anti-Spoofing Heuristics...*
*   **Action 3 (SLA & GPS):** Point out the Dynamic SLA (e.g., "Severity 88/100 -> Expedited SLA"). Tap **Acquire Live GPS**. The submit button unlocks. Hit **Submit**.
*   **Action 4 (Edge Case Flex):** Toggle the **[Demo Mode: Simulate Duplicate]**. Take another photo. Show the red Haversine Geofencing warning: *"Merged as UPVOTE to prevent queue clogging."*
*   **Voiceover:** *"Citizens cannot upload fake, old photos. Our system forces a live WebRTC capture, runs an anti-spoofing heuristic, and calculates severity to dynamically assign SLAs. If PostGIS detects a duplicate report within 50 meters, it automatically merges them to prevent spam."*

### 3. The Department Flow (1:00 - 1:45)
*   **Screen:** Navigate to `/department`. Keep it in Mobile View.
*   **Action 1 (Task Queue):** Point out the color-coded SLA borders (Red = Overdue, Green = On Track).
*   **Action 2 (GPS Accountability):** Click **Start Resolution** on the ticket you just submitted. The modal slides up.
*   **Action 3 (The Haversine Check):** Show the red Location Verification box: *"WARNING: You are 4,000km away from the site."* Point out that the **Confirm** button is physically disabled.
*   **Action 4 (Proof of Work):** Click the secret **[Demo Override]** to turn the GPS check green. Capture a live WebRTC "After" photo. Hit **Confirm & Close**.
*   **Voiceover:** *"For field workers, accountability is enforced cryptographically. When they start a resolution, our app runs a Haversine distance check against their live GPS. If they aren't within 100 meters of the pothole, the app physically prevents them from closing the ticket. They must also capture a live 'After' photo."*

### 4. The Admin Command Center (1:45 - 2:15)
*   **Screen:** Navigate to `/admin`. Switch back to **Desktop View**.
*   **Action 1 (AI Fallback):** Show the **Unassigned Queue**. Point out the low-confidence blurry photos. Explain the "Ping-Pong" prevention. Pick a department and route one.
*   **Action 2 (CV Verification):** Switch to the **Master Operations Log**. Click **CV Verify** on the resolved ticket. Run the 3-second Structural Similarity (SSIM) Analysis loading state until it flashes green.
*   **Action 3 (Interoperability):** Click the **Sync to CPGRAMS** button in the top right.
*   **Voiceover:** *"At the Command Center, we acknowledge AI isn't perfect. Tickets with low AI confidence enter a fallback queue for manual routing, eliminating inter-departmental ping-pong. When a ticket is closed, an SSIM computer vision model verifies the 'Before' and 'After' photos match. Finally, verified data is synced upstream to CPGRAMS via REST API."*

### 5. The Public God View (2:15 - 2:45)
*   **Screen:** Navigate to `/public`.
*   **Action 1 (Heatmap):** Pan around the CartoDB dark map. Show the glowing red and green CSS pins.
*   **Action 2 (Leaderboard):** Hover over the Glassmorphism sidebar. Point out the **Department Accountability Leaderboard** and the animated progress bars.
*   **Action 3 (ROI):** Highlight the "Taxpayer ROI" metric at the bottom.
*   **Voiceover:** *"Finally, radical transparency. The public God View maps every issue in real-time. By publicly ranking departments by their resolution rate, we use competitive pride to drive government performance, ultimately saving taxpayer money through early detection."*

### 6. Outro (2:45 - 3:00)
*   **Screen:** Back to the Landing Page `/`.
*   **Voiceover:** *"NagrikSetu is not just a reporting app. It is a highly scalable, secure Digital Public Infrastructure designed to restore trust between citizens and the state. Built for Viksit Bharat 2026. Thank you."*

---

## 🛠️ Pre-Flight Checklist Before Recording
- [ ] Ensure Supabase database is active and `NEXT_PUBLIC_SUPABASE_URL` is set.
- [ ] Allow browser Camera & Location permissions beforehand so popups don't ruin the flow.
- [ ] Open `/citizen` in a separate tab pre-set to Mobile View (iPhone 14 Pro size).
- [ ] Open `/department` in a separate tab pre-set to Mobile View.
- [ ] Open `/admin` and `/public` in Desktop tabs.
- [ ] Hide your browser bookmarks bar for a cleaner recording.
