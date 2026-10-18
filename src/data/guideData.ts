import { GuideStep } from '../types/tournament';

export const tournamentGuideSteps: GuideStep[] = [
  {
    id: 1,
    titleUrdu: "Step 1: Custom Room Card Ka Intizam",
    titleEn: "Step 1: Custom Room Card Preparation",
    descUrdu: "Free Fire me tournament organize karne ke liye sab se pehli zaroorat Custom Room Cards ki hoti hai.",
    descEn: "To host a tournament in Garena Free Fire, you first need valid Custom Room Cards.",
    bulletPointsUrdu: [
      "Guild Rewards: Har Friday ko agar aapki Guild 1800 Dog Tags complete kare to Saturday ko 1 Free Room Card milta hai.",
      "In-Game Store: Garena Store me 100 Diamonds ka 1 Room Card milta hai.",
      "Craftland Room: Agar customized gun skins ya special rules chahiye to Craftland Cards use kar sakte hain.",
      "Setting Recommendation: Classic Battle Royale (48 Players) ya Clash Squad (4v4 / 8 Players)."
    ],
    bulletPointsEn: [
      "Guild Rewards: Completing 1800 Dog Tags every Friday yields 1 Free Custom Room Card every Saturday.",
      "In-Game Store: Available for 100 Diamonds directly from the in-game shop.",
      "Craftland Mode: Used if you want unlimited ammo or custom map barriers.",
      "Game Mode: Battle Royale for 12 squads (48 players) or Clash Squad (4v4)."
    ],
    proTipUrdu: "Hamesha match start karne se 30 minute pehle Room Card check karein taake emergency me match delay na ho.",
    proTipEn: "Always ensure you have room cards available 30 minutes before match time.",
    iconName: "Shield"
  },
  {
    id: 2,
    titleUrdu: "Step 2: Room Settings & Esports Rules (Banning Hacks)",
    titleEn: "Step 2: Custom Room Settings & Fair Play Rules",
    descUrdu: "Competitive matches ke liye authentic Garena FFWS (Free Fire World Series) rules set karein.",
    descEn: "Configure authentic FFWS esports tournament rules inside the custom room.",
    bulletPointsUrdu: [
      "Drop List / Gun Attributes: Professional tournaments me Gun Attributes ko 'No' kiya jata hai taake P2W skins ka advantage na ho.",
      "Character Skills: Major tournaments me 'Yes' rakha jata hai, lekin agar pure gun-power test karni ho to 'No' bhi kar sakte hain.",
      "Limited Ammo: Battle Royale me Limited Ammo 'Yes' hona chahiye, jabkay CS friendly matches me log 'No' pasand karte hain.",
      "Block Emulator / PC: Mobile tournament me PC emulators ko block karna zaroori hai (Setting: Block Emulator -> YES).",
      "Teaming & Cheating Ban: Kisi bhi player ka hack ya teaming pakda jaye to foran disqualify aur ban karein."
    ],
    bulletPointsEn: [
      "Gun Attributes: Set to 'No' for fair competitive esports play (neutralizes P2W skins).",
      "Character Skills: Can be set to 'Yes' for tactical FFWS metas or 'No' for raw aim battles.",
      "Limited Ammo: Keep 'Yes' for Battle Royale competitive matches.",
      "Block Emulator: Set 'Block Emulators -> YES' to maintain pure mobile integrity.",
      "Anti-Teaming: Zero tolerance for teaming or 3rd party headshot injection configs."
    ],
    proTipUrdu: "Spectator slots me kam az kam 2 admins / referees rakhein jo live hacker check kar sakein.",
    proTipEn: "Always allocate at least 2 spectator slots for tournament referees/streamers.",
    iconName: "Sliders"
  },
  {
    id: 3,
    titleUrdu: "Step 3: Registration & Squad Slot Allocation",
    titleEn: "Step 3: Player Registration & Slot Allotment",
    descUrdu: "Players ki verification aur slot matrix manage karne ka step-by-step tareeqa.",
    descEn: "Managing team registrations, Free Fire UIDs, and assigned slot positions.",
    bulletPointsUrdu: [
      "Data Collection: Har player ka Free Fire UID (e.g. 293810294) aur In-Game Name (IGN) verify karein.",
      "Slot Allotment: Battle Royale me 1 se 12 Squad slots (Slots 1 to 12) fix karein. Har squad ko unka slot number assign karein.",
      "Entry Fee Deduction: Agar paid tournament hai to app wallet se coins/cash cut honge.",
      "Lock Time: Match se 1 ghanta pehle registration close karein taake slot list finalize ho sake."
    ],
    bulletPointsEn: [
      "UID Collection: Record verified Free Fire UID and In-Game Name (IGN) for all players.",
      "Slot Assignment: Fixed squads (Slots 1 to 12, 4 players per slot) to avoid chaos in room lobby.",
      "Entry Collection: Entry coins deducted cleanly via digital wallet.",
      "Deadline: Close registration 1 hour prior to finalize verified roster."
    ],
    proTipUrdu: "Players ko unka Squad Slot number pehle bata dein taake room me aakar dusri team ke slot me na baithein.",
    proTipEn: "Assign slot numbers beforehand so squads don't occupy rival team positions.",
    iconName: "Users"
  },
  {
    id: 4,
    titleUrdu: "Step 4: Room ID & Password Distribution (Security)",
    titleEn: "Step 4: Secure Room ID & Password Distribution",
    descUrdu: "Room ID aur Password leak hone se bachane ke liye safe protocol use karein.",
    descEn: "Strict security protocol to deliver Room credentials only to registered players.",
    bulletPointsUrdu: [
      "Timing: Match shuru hone se theek 10 se 15 minute pehle Room ID & Password app me reveal karein.",
      "Access Restriction: Sirf un players ko ID & Pass dikhe jinhone entry fee pay ki hai aur register hue hain.",
      "One-Click Copy: App me 1-click copy button diya gaya hai taake player fast copy karke Free Fire paste kar sakein.",
      "Lobby Timer: 10 minute lobby countdown ke baad match foran START kar diya jata hai."
    ],
    bulletPointsEn: [
      "Timing Window: Reveal Room credentials exactly 10-15 minutes before scheduled match start.",
      "Restricted Visibility: Available strictly to confirmed registered participants.",
      "1-Click Copy: Quick copy button for seamless pasting into Free Fire Custom Room join box.",
      "Punctuality: Start match immediately when the 10-minute lobby countdown completes."
    ],
    proTipUrdu: "Kabhi bhi WhatsApp public groups me ID/Password share na karein, sirf is app ke private room panel me dein.",
    proTipEn: "Never leak room credentials in public social media chats; use in-app private reveal.",
    iconName: "Key"
  },
  {
    id: 5,
    titleUrdu: "Step 5: Match Result & Screenshot Proof Submission",
    titleEn: "Step 5: Results & Match Screenshot Verification",
    descUrdu: "Match khatam hone ke baad fair results verify karna aur points calculate karna.",
    descEn: "Submitting post-match summary screenshots and automated point tabulation.",
    bulletPointsUrdu: [
      "Screenshot Upload: Match khatam hone ke baad squads apna match summary screenshot upload karte hain.",
      "Official Points System (FFWS): Rank 1 (Booyah) = 12 Pts | Rank 2 = 9 Pts | Rank 3 = 8 Pts | Rank 4 = 7 Pts | etc. Har Kill ka +1 Point.",
      "Admin Approval: Host/Admin screenshot tally karta hai aur results declare karta hai.",
      "Kill Bounty & Prize Calculation: System automatic placement prize aur kill bounty calculate karta hai."
    ],
    bulletPointsEn: [
      "Screenshot Upload: Teams submit end-match recap screen with kill counts and placement.",
      "FFWS Point System: Rank 1 = 12pts, Rank 2 = 9pts, Rank 3 = 8pts ... + 1 point per kill.",
      "Admin Cross-Check: Host verifies kills and eliminates fake claims via referee logs.",
      "Automated Prize Split: Bounty and placement rewards calculated automatically."
    ],
    proTipUrdu: "FFWS points calculator tool is app me mojood hai, jo second me total score aur rank nikal deta hai.",
    proTipEn: "Use the built-in FFWS points calculator to verify total score and tier badges instantly.",
    iconName: "Trophy"
  },
  {
    id: 6,
    titleUrdu: "Step 6: Prize Distribution & Wallet Cashout",
    titleEn: "Step 6: Prize Payout & Wallet Cashout",
    descUrdu: "Winners ko unka prize foran unke wallet me transfer karna aur withdrawal process.",
    descEn: "Crediting winnings to player accounts and processing instant payment withdrawals.",
    bulletPointsUrdu: [
      "Instant Wallet Credit: Tournament khatam hote hi winner ke account me prize coins transfer ho jate hain.",
      "Payment Methods: EasyPaisa, JazzCash, UPI, Bank Transfer, ya Google Play gift codes.",
      "Transparency: Har transaction ka clear history log player ko dikhta hai.",
      "Organizer Profit: Entry fees se 10-20% platform hosting commission organizer apne paas rakhta hai."
    ],
    bulletPointsEn: [
      "Instant Balance: Prize earnings deposited directly to player wallet balance upon confirmation.",
      "Supported Channels: EasyPaisa, JazzCash, UPI, Direct Bank Transfer, or Google Play vouchers.",
      "Audit Trail: Complete transaction log for all deposits, entries, winnings, and payouts.",
      "Organizer Revenue: Host retains 10-20% tournament organizer fee from the entry prize pool."
    ],
    proTipUrdu: "Fast payout dene se aapke tournaments me hazaron loyal players jud jate hain.",
    proTipEn: "Fast payouts build immense trust and rapid community word-of-mouth growth.",
    iconName: "Coins"
  }
];
