# Kawan — LinkedIn win + open-source post (draft v2)

> Shape follows your Qwen open-source post: hook → win → drop the repo early → "what you're getting" → fair warning → direct ask → props.
> Cut from v1: results timing, story-time block, judge names. Open source promoted from footnote to spine.

---

"I'll ship it Friday."

You meant it. Friday came, nothing shipped, and the only thing that actually happened was guilt. Nobody checked — because no app checks. You tap "done", the streak survives, and every AI coach out there just takes your word for it. 💀

That's the gap we took to 𝗖𝗵𝘂𝘁𝗲𝘀 𝗛𝗮𝗰𝗸 𝗠𝗮𝗹𝗮𝘆𝘀𝗶𝗮 𝟮𝟬𝟮𝟲 — and 𝗞𝗮𝘄𝗮𝗻 came back 𝟭𝘀𝘁 𝗣𝗹𝗮𝗰𝗲, 𝗖𝗼𝗿𝗽𝗼𝗿𝗮𝘁𝗲 𝗧𝗿𝗮𝗰𝗸. 🏆

Kawan (Malay for "friend") is a Live2D-animated accountability companion that refuses to take your word for anything. Built with kymil4, Jeremy Woon Zhe Ming and Chan Kuan Hou.

And the entire build is now open source. 🔓
➤ [[github.com/kawan-chjl/dev]]

What you're getting:

• 𝗔 𝗟𝗶𝘃𝗲𝟮𝗗 𝘀𝘁𝗮𝗰𝗸 𝘁𝗵𝗮𝘁 𝗮𝗰𝘁𝘂𝗮𝗹𝗹𝘆 𝗿𝘂𝗻𝘀: PixiJS + pixi-live2d-display + Cubism 4, wired into React 18 + TypeScript + Vite. Model emotion drives expression and lip-sync live — not canned animation loops. Three swappable companions with their own personalities. Every cursed version pin that cost us two days is already in the lockfile. 🙏
• 𝗦𝘄𝗮𝗽 𝗶𝗻 𝘆𝗼𝘂𝗿 𝗼𝘄𝗻 𝗰𝗵𝗮𝗿𝗮𝗰𝘁𝗲𝗿: a model folder and a JSON persona file. That's the whole extension point.
• 𝗔𝗻 𝗔𝗜 𝘁𝗵𝗮𝘁 𝗰𝗮𝗻'𝘁 𝗰𝗵𝗲𝗮𝘁 𝗳𝗼𝗿 𝘆𝗼𝘂: deadline, deliverable and stakes are user-only and audited. The AI may write exactly one field. Enforced in the schema, not politely requested in a prompt.
• 𝗥𝗲𝗮𝗹 𝗲𝘃𝗶𝗱𝗲𝗻𝗰𝗲, 𝗻𝗲𝘃𝗲𝗿 𝘀𝗲𝗹𝗳-𝗿𝗲𝗽𝗼𝗿𝘁: it fetches your GitHub commit, screenshot or file itself, and a multimodal model rules on it — pass / fail / unclear. "Unclear" never punishes you.
• 𝟱 𝗿𝗼𝗹𝗲-𝘀𝗽𝗲𝗰𝗶𝗮𝗹𝗶𝘀𝗲𝗱 𝗮𝗴𝗲𝗻𝘁𝘀, 𝘀𝘁𝗿𝗶𝗰𝘁 𝗝𝗦𝗢𝗡: intake, planner, check-in, companion, evidence judge. No agent framework — structured output is the control plane.
• 𝗧𝗘𝗘 𝗶𝗻𝗳𝗲𝗿𝗲𝗻𝗰𝗲, 𝘂𝘀𝗲𝗿-𝗳𝘂𝗻𝗱𝗲𝗱: every call runs confidential on Chutes (Intel TDX, zero prompt logging), billed to the user's own balance via Sign in with Chutes. We can't read your goals — not "we promise not to", we can't.
• 𝗥𝘂𝗻𝘀 𝗼𝗻 𝗰𝗹𝗼𝗻𝗲: .env.example, model bootstrap script, and deploy config for Vercel + Render + Supabase.

𝗙𝗔𝗜𝗥 𝗪𝗔𝗥𝗡𝗜𝗡𝗚: the voice is scaffolded but TTS isn't shipped — she animates and lip-syncs, she just doesn't talk yet. The companions are Cubism's sample models, not commissioned art.

Genuinely though: if you clone this and put your own waifu in charge of your deadlines, please show me. I need to see what you people come up with. 😭

Massive props to kymil4, Jeremy Woon Zhe Ming and Chan Kuan Hou — four people, four lanes, one repo. 🙌 And thanks to Abel Chin (陈嘉航) and the Nyala Labs team for hosting Chutes Hack Malaysia 2026.

hashtag#ChutesHackMalaysia2026 hashtag#Chutes hashtag#OpenSource hashtag#Live2D hashtag#BuildWithAI hashtag#Hackathon hashtag#ConfidentialAI hashtag#Malaysia

---

## Notes

- ~2,050 chars (v1 was ~2,400). Bullets carry the weight now; prose between them is stripped.
- **Repo link moved above the bullets** so the open-source drop is the payoff, not a footer. Same move as your Qwen post.
- **Two Live2D bullets, placed first.** The stack bullet is for devs who've fought Cubism versioning; the "swap in your own character" bullet is the one that makes the weeb audience want it. Splitting them means the second reads as an invitation rather than a spec detail.
- **"put your own waifu in charge of your deadlines"** is the engagement ask — direct lift of your Qwen post's "if you clone it and make your own brainrot character, please show me." It's the line most likely to get quote-reposted.
- "four people, four lanes, one repo" — verifiable from the repo's lane structure. Swap if you'd rather say something else; I avoided claiming a timeframe I couldn't confirm.
- Judges dropped, Abel Chin + Nyala Labs credited as host/organiser per your note.
