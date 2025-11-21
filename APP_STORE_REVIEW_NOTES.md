# App Store Review Notes - ParkPedia

## IMPORTANT: Demo Account Information

### Test Account Credentials
- **Email**: reviewer@parkpedia.test
- **Password**: ReviewTest2024!

This account has been pre-configured with sample data to demonstrate all features.

---

## Testing Instructions

### ✅ GUIDELINE 5.1.1(v) - Account Deletion Feature

**How to verify:**

1. Launch the app and log in with the demo account
2. Tap the **"My Page" (マイページ)** tab in the bottom navigation bar
3. Scroll to find the **"アカウントを削除" (Delete Account)** button
   - The button has a RED BORDER and is located below the "ログアウト" (Logout) button
4. Tap the button to see a confirmation dialog
5. The dialog explains that all user data will be permanently deleted

**Implementation details:**
- ✅ Complete account deletion (not just deactivation)
- ✅ All user data is deleted: favorites, reviews, visit history, and local storage
- ✅ Firebase Authentication account is permanently removed
- ✅ Two-step confirmation prevents accidental deletion
- ✅ Re-authentication required for security (if session is old)

**IMPORTANT**: Please DO NOT actually delete the demo account. Just verify the button exists and the confirmation dialog appears.

---

### ✅ GUIDELINE 2.1 - Reviews in Recommended Parks Section

**How to verify reviews:**

1. On the Home screen, you will see the **"おすすめ" (Recommended)** section at the top
2. Tap on **ANY park card** (e.g., "中央公園", "桜の森公園", or "こどもの森公園")
3. On the park detail screen, **scroll down** to the **"レビュー" (Reviews)** section
4. You will see **MULTIPLE reviews with comments** for each park

**Expected results:**
- **中央公園 (Chuo Park)**: 4 reviews with detailed comments
- **桜の森公園 (Sakura Park)**: 3 reviews with detailed comments
- **こどもの森公園 (Kodomo Park)**: 3 reviews with detailed comments
- **水と緑の広場 (Water & Green Plaza)**: 2 reviews with detailed comments
- **展望台公園 (Observatory Park)**: 3 reviews with detailed comments

**Example review comments you should see:**
- "とても広々としていて、週末の散歩に最適です。家族連れにもおすすめ！"
- "清潔で管理が行き届いています。ベンチも多く、ゆっくりと休憩できます。"
- "子供の遊具が充実していて、安全に遊べます。トイレも清潔です。"

---

### ✅ GUIDELINE 2.1 - Flagging & Blocking Mechanism

**How to verify the report/flag feature:**

1. From the Home screen, tap any park to open the detail view
2. **Scroll down** to the **"レビュー(X件)" (Reviews)** section
3. Look at each review card - you will see a **"🚩 報告" (Report)** button on the RIGHT side
4. Tap the "🚩 報告" button on any review (NOT your own)
5. A confirmation dialog appears asking "このレビューを不適切なコンテンツとして報告しますか？"
6. Tap "報告する" (Report) to submit the report
7. You will see a success message: "レビューを報告しました。運営チームが確認します。"

**Implementation details:**
- ✅ Report button appears on ALL reviews except user's own reviews
- ✅ Reports are saved to Firestore "reports" collection with:
  - Review ID
  - Reporter user ID and email
  - Timestamp
  - Status (pending)
- ✅ Content moderation team can review flagged content in Firebase Console
- ✅ Users cannot report their own reviews (button is hidden)

**Why you might not have seen this before:**
- The report button only appears for reviews posted by OTHER users
- If you were looking at your own reviews, the button would be hidden
- Please make sure to tap on a park with existing reviews (listed above)

---

## Additional Features

### Search and Filter
- Use the search bar at the top of the Home screen
- Tap the menu button (top-right) to access filters:
  - Target age groups
  - Play equipment
  - Facilities
  - Distance
  - Rating

### Favorite Parks
- Tap the ❤️ (Favorite) button on any park detail screen
- View your favorites in the "My Page" → "お気に入りした公園" section

### Post Reviews
- On any park detail screen, tap the **"レビューを投稿する"** button at the bottom
- Rate with stars (1-5) and write a comment
- Optionally add photos

---

## Compliance Summary

### ✅ Guideline 5.1.1(v) - Account Deletion
**Status**: FULLY IMPLEMENTED
- Account deletion button clearly visible in My Page
- Complete data removal (not just deactivation)
- Two-step confirmation to prevent accidents
- All user data deleted from Firestore and Firebase Auth

### ✅ Guideline 2.1 - Information Needed
**Status**: FULLY IMPLEMENTED & VERIFIED
- Recommended parks section contains multiple parks with reviews
- Each park has 2-4 detailed reviews with comments
- Flagging mechanism (🚩 報告 button) visible on all reviews
- Reports stored in Firestore for moderation team review
- Demo account can access and test all features

---

## Support

If you encounter any issues or need clarification, please contact us through App Store Connect review comments.
