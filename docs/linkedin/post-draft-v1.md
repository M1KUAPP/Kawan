# Kawan — LinkedIn win + open-source post (draft v1)

> Placeholders in `[[ ]]` need your input before posting.
> Names in **bold** should be LinkedIn @-mentions (type `@` then the name so it links).

---

"I'll ship it Friday."

You meant it. Friday came, nothing shipped, and the only thing that actually happened was guilt. Nobody checked — because no app checks. You tap "done", the streak survives, and every AI coach on the market just takes your word for it. 💀

That's the gap we took to 𝗖𝗵𝘂𝘁𝗲𝘀 𝗛𝗮𝗰𝗸 𝗠𝗮𝗹𝗮𝘆𝘀𝗶𝗮 𝟮𝟬𝟮𝟲 — and last Wednesday it came back 𝟭𝘀𝘁 𝗣𝗹𝗮𝗰𝗲, 𝗖𝗼𝗿𝗽𝗼𝗿𝗮𝘁𝗲 𝗧𝗿𝗮𝗰𝗸. 🏆

Together with kymil4, Jeremy Woon Zhe Ming and Chan Kuan Hou, we built 𝗞𝗮𝘄𝗮𝗻 (Malay for "friend") — a Live2D-animated accountability companion that refuses to take your word for anything.

• 𝗢𝗻𝗲 𝗰𝗼𝗺𝗺𝗶𝘁𝗺𝗲𝗻𝘁, 𝘂𝗻𝗱𝗲𝗿 𝟲𝟬 𝘀𝗲𝗰𝗼𝗻𝗱𝘀: one deliverable, one deadline, one source of proof. Nothing vague enough to hide behind.
• 𝗜𝘁 𝗳𝗲𝘁𝗰𝗵𝗲𝘀 𝘁𝗵𝗲 𝗲𝘃𝗶𝗱𝗲𝗻𝗰𝗲 𝗶𝘁𝘀𝗲𝗹𝗳: a GitHub commit, a screenshot, a file — then a multimodal model reads it and rules on it. Self-report is never accepted.
• 𝗜𝘁 𝗰𝗮𝗻'𝘁 𝗺𝗼𝘃𝗲 𝘆𝗼𝘂𝗿 𝗴𝗼𝗮𝗹𝗽𝗼𝘀𝘁𝘀: your deadline, deliverable and stakes are user-only and audited. The AI is allowed to write exactly one field. That's enforced in the schema, not politely requested in a prompt.
• "𝗨𝗻𝗰𝗹𝗲𝗮𝗿" 𝗻𝗲𝘃𝗲𝗿 𝗽𝘂𝗻𝗶𝘀𝗵𝗲𝘀 𝘆𝗼𝘂: verdicts are pass / fail / unclear. If the judge can't tell, you don't eat a fail because our inference had a bad day.
• 𝗡𝗼 𝘀𝘁𝗿𝗲𝗮𝗸 𝘁𝗼 𝗯𝗿𝗲𝗮𝗸: a win seeds the next commitment, a miss routes to cheap recovery and a re-commit. The thing that kills habit apps is the one thing we refused to build.
• 𝗥𝘂𝗻𝘀 𝗼𝗻 𝘆𝗼𝘂𝗿 𝗼𝘄𝗻 𝗰𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝘁𝗶𝗮𝗹 𝗰𝗼𝗺𝗽𝘂𝘁𝗲: every call is TEE inference on Chutes (Intel TDX, zero prompt logging), billed to your own balance through Sign in with Chutes. We cannot read your goals. Not "we promise not to" — we can't.

And now that it's over, the whole build is open source. 🔓
➤ GitHub: [[github.com/kawan-chjl/dev]]
➤ Live app: [[kawan-frontend.vercel.app]]
➤ Demo video: [[youtu.be/B3u5ByG_-jk]]

𝗙𝗔𝗜𝗥 𝗪𝗔𝗥𝗡𝗜𝗡𝗚: the voice is scaffolded but not shipped — the companion animates and lip-syncs, but TTS is still on the todo. The Live2D models are Cubism's sample characters, not commissioned art. It's a hackathon build, warts included.

Now story time — results were supposed to drop on 7 July. They landed last Wednesday. Three weeks of nobody in the group chat wanting to be the one to say "is it out yet", quietly assuming we'd lost, and me half-writing a "great learning experience" post I never sent. 😭 Turns out the wait was just the wait.

The thing I actually took from this build: the hardest problem wasn't making the AI capable, it was deciding what it's 𝗻𝗼𝘁 allowed to do. Anyone can wire an LLM to a habit tracker. The moment we split every commitment into hard fields the AI physically cannot write and one soft slot it can, the product got sharper and the pitch wrote itself. Constraint was the feature. If you're prepping for a hackathon, that's where I'd spend the first hour. ⚔️

Massive props to kymil4, Jeremy Woon Zhe Ming and Chan Kuan Hou — four people, one repo, zero merge disasters, genuinely the smoothest team I've shipped with. 🙌

Thanks to [[organizer — Nyala Labs / Abel Chin?]] for running it, and to [[judge names]] for the feedback.

hashtag#ChutesHackMalaysia2026 hashtag#Chutes hashtag#OpenSource hashtag#BuildWithAI hashtag#Hackathon hashtag#TEE hashtag#ConfidentialAI hashtag#Live2D hashtag#Malaysia

---

## Notes on choices

- **Hook** is lifted from your own deck (slide 02, "Mei — I'll ship it Friday"). It's the problem-scene opener you use in NexHack / Supervity / MyAIFuture, and it earns the "see more" click without spending it on the trophy.
- **You don't lead with the medal.** Colin's post opens `🥉2nd Runner Up — ...` in bold. Yours lands the win in line 3 as the payoff to a story. That's your existing pattern and it reads less like a press release.
- **The delay is played light, not bitter.** You told me the organizer was weak on comms; publicly you've always been generous to organizers, and a reader can't verify the grievance — it just costs you goodwill. The "half-wrote a "great learning experience" post I never sent" line gets the same honesty with none of the cost, and doubles as your explanation for posting a month late.
- **FAIR WARNING block** mirrors the Qwen open-source post. It pre-empts anyone opening the repo and noticing TTS isn't wired, and the self-deprecation is load-bearing for your voice.
- **Lesson section** — your two highest-effort posts (NexHack, MyAIFuture) both have one, and it's the part that gets quoted. "Constraint was the feature" continues the thread from "problem background and market research is KING".
- **Length** ~2,400 characters, inside LinkedIn's 3,000 limit. Your NexHack post was comparable.
