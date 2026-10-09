#!/usr/bin/env python3
"""Build the Kawan LinkedIn carousel: HTML -> headless Chrome -> PDF -> preview PNGs.

Everything is embedded (fonts + images as data URIs) so the render is deterministic
and the HTML file is portable. Re-run after editing PAGES.
"""
import base64, pathlib, subprocess, sys

import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.colormasks import SolidFillColorMask
from qrcode.image.styles.moduledrawers.pil import RoundedModuleDrawer

HERE = pathlib.Path(__file__).parent
OUT = HERE.parent
W, H = 1080, 1350

LINKS = {
    "repo": ("Repo", "github.com/M1KUAPP/Kawan", "https://github.com/M1KUAPP/Kawan"),
    "live": ("Live app", "kawan-frontend.vercel.app", "https://kawan-frontend.vercel.app"),
    "demo": ("Demo", "youtu.be/B3u5ByG_-jk", "https://youtu.be/B3u5ByG_-jk"),
}


def make_qrs():
    """Brand-styled QR: rounded modules, espresso on cream, Kawan eye centred.
    ERROR_CORRECT_H is required — the centre logo occludes modules."""
    for key, (_, _, url) in LINKS.items():
        qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=16, border=2)
        qr.add_data(url)
        qr.make(fit=True)
        qr.make_image(
            image_factory=StyledPilImage,
            module_drawer=RoundedModuleDrawer(),
            color_mask=SolidFillColorMask(back_color=(246, 241, 234), front_color=(58, 42, 30)),
            embeded_image_path=str(HERE / "img" / "logo.png"),
        ).save(HERE / "img" / f"qr-{key}.png")


make_qrs()


def b64(p: pathlib.Path) -> str:
    return base64.b64encode(p.read_bytes()).decode()


def font_face(name: str, file: str, style="normal", weight="300 700") -> str:
    return f"""@font-face{{font-family:'{name}';src:url(data:font/ttf;base64,{b64(HERE/'fonts'/file)}) format('truetype');font-style:{style};font-weight:{weight};font-display:block}}"""


def img(name: str) -> str:
    """Inline an asset from img/ as a data URI. Photographs are stored as JPEG."""
    for ext, mime in (("png", "image/png"), ("jpg", "image/jpeg")):
        p = HERE / "img" / f"{name}.{ext}"
        if p.exists():
            return f"data:{mime};base64,{b64(p)}"
    raise FileNotFoundError(f"img/{name}.(png|jpg)")


FONTS = (
    font_face("Fredoka", "Fredoka.ttf")
    + font_face("Fraunces", "Fraunces.ttf")
    + font_face("Fraunces", "Fraunces-Italic.ttf", style="italic", weight="400 700")
)

CSS = f"""
{FONTS}
*{{margin:0;padding:0;box-sizing:border-box}}
:root{{
  --bg:#ECE5DC; --surface:#F6F1EA; --surface2:#FBF8F3; --sunk:#E2D8CB;
  --ink:#3A2A1E; --soft:#6E5849; --faint:#9C8A7A;
  --line:#D8CCBD; --line2:#C8B7A4;
  --accent:#D9643A; --press:#B8502C; --tint:#F7E2D5;
  --sage:#A9B388; --sage-deep:#7C8A5A; --sage-tint:#E7ECDA;
  --dark:#1A140F; --dark-surf:#241B14; --dark-ink:#F4ECE1;
}}
html,body{{background:#888}}
.page{{
  width:{W}px; height:{H}px; position:relative; overflow:hidden;
  background:var(--bg); color:var(--ink);
  font-family:'Fredoka',system-ui,sans-serif;
  padding:88px; display:flex; flex-direction:column;
  page-break-after:always; break-after:page;
}}
.page:last-child{{page-break-after:auto;break-after:auto}}
.page.dark{{background:var(--dark); color:var(--dark-ink)}}
.page.dark::before{{
  content:''; position:absolute; inset:0;
  background:radial-gradient(120% 80% at 50% 18%, rgba(217,100,58,.16), transparent 62%);
  pointer-events:none;
}}
.page > *{{position:relative; z-index:1}}

.eyebrow{{font-size:22px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--faint)}}
.eyebrow .n{{color:var(--accent)}}
.dark .eyebrow{{color:#9C8A7A}}

h1{{font-size:76px;font-weight:600;line-height:1.06;letter-spacing:-.015em;margin-top:20px}}
h1 .em{{color:var(--accent)}}
.voice{{font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:400}}
.body{{font-size:30px;line-height:1.52;color:var(--soft);font-weight:400}}
.dark .body{{color:#C4B2A2}}
.body b{{font-weight:600;color:var(--ink)}}
.dark .body b{{color:var(--dark-ink)}}
.spacer{{flex:1}}
.rule{{height:1px;background:var(--line);margin:0}}
.dark .rule{{background:#3A2C21}}

.foot{{font-size:24px;color:var(--faint);font-weight:400;line-height:1.45}}
.foot b{{color:var(--ink);font-weight:600}}
.dark .foot b{{color:var(--dark-ink)}}

.card{{background:var(--surface);border:1px solid var(--line);border-radius:22px;padding:40px 42px}}
.card .lab{{font-size:20px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}}
.card .val{{font-size:34px;font-weight:500;line-height:1.35;margin-top:12px}}

.pill{{display:inline-block;border-radius:999px;padding:12px 26px;font-size:24px;font-weight:500;
      background:var(--surface);border:1px solid var(--line2)}}
.frame{{border-radius:26px;overflow:hidden;border:1px solid var(--line2);background:var(--surface2);
        box-shadow:0 18px 48px rgba(58,42,30,.10)}}
.frame img{{display:block;width:100%}}

.logo{{width:104px;height:104px;border-radius:50%;overflow:hidden;flex:none}}
.logo img{{width:100%;height:100%;display:block}}
.wordmark{{font-size:34px;font-weight:600;letter-spacing:.42em}}

/* slide-01 treatment: photograph fading up into the flat field */
.photo{{position:absolute;inset:0;z-index:0;
  background:url({img('desk')}) center bottom / cover no-repeat;
  -webkit-mask-image:linear-gradient(to top,#000 0%,rgba(0,0,0,.92) 20%,rgba(0,0,0,.45) 50%,rgba(0,0,0,.10) 70%,transparent 84%);
  opacity:.60}}
.scrim{{position:absolute;inset:0;z-index:0;
  background:linear-gradient(to top,rgba(26,20,15,.80) 0%,rgba(26,20,15,.30) 38%,rgba(26,20,15,.55) 78%,rgba(26,20,15,.88) 100%)}}
.partners{{display:flex;align-items:center;gap:26px}}
.partners img{{height:48px;display:block}}
.partners .div{{width:1px;height:34px;background:#4A3A2C}}
"""


def page(cls, inner):
    return f'<section class="page {cls}">{inner}</section>'


# ---------------------------------------------------------------- pages
P1 = page("dark", f"""
<div class="photo"></div><div class="scrim"></div>
<div style="display:flex;align-items:center;gap:26px">
  <div class="logo"><img src="{img('logo')}"></div>
  <div class="wordmark">KAWAN</div>
</div>
<div class="spacer"></div>
<div class="eyebrow">Chutes Hack Malaysia 2026</div>
<div style="font-size:148px;font-weight:600;line-height:.98;letter-spacing:-.03em;margin-top:18px">1st Place</div>
<div style="margin-top:26px">
  <span class="pill" style="background:rgba(217,100,58,.14);border-color:rgba(217,100,58,.5);color:#F0A184;font-weight:600">
    Corporate Track
  </span>
</div>
<div class="spacer"></div>
<div class="rule"></div>
<div class="voice" style="font-size:60px;line-height:1.2;margin-top:44px">
  It doesn't believe you. <span style="color:var(--accent)">Yet.</span>
</div>
<div class="body" style="margin-top:26px;font-size:28px">
  A Live2D accountability companion that verifies your commitments<br>with real evidence — and never does the work for you.
</div>
<div class="spacer"></div>
<div class="rule" style="margin-bottom:30px"></div>
<div class="foot" style="display:flex;justify-content:space-between;align-items:center">
  <span><b>Now open source</b></span>
  <span class="partners">
    <img src="{img('chutes')}"><span class="div"></span><img src="{img('nyalalabs')}">
  </span>
</div>
""")

P2 = page("", f"""
<div class="eyebrow"><span class="n">01</span> &nbsp;—&nbsp; The problem</div>
<div class="voice" style="font-size:92px;line-height:1.1;margin-top:26px">"I'll ship it&nbsp;Friday."</div>
<div class="body" style="margin-top:32px">
  You meant it. Friday came, nothing shipped, and the only thing that
  actually happened was <b>guilt</b>.
</div>
<div style="display:flex;flex-direction:column;gap:14px;margin-top:60px">
  <div class="card"><div class="lab">The promise</div><div class="val">"I'll ship it Friday."</div></div>
  <div style="text-align:center;font-size:34px;color:var(--line2);line-height:1">&darr;</div>
  <div class="card" style="background:var(--sunk);border-style:dashed">
    <div class="lab">Where a check should be</div>
    <div class="val voice" style="color:var(--faint)">nobody checks</div>
  </div>
  <div style="text-align:center;font-size:34px;color:var(--line2);line-height:1">&darr;</div>
  <div class="card"><div class="lab">The outcome</div><div class="val">Still not shipped. Nothing changed.</div></div>
</div>
<div class="spacer"></div>
<div class="rule" style="margin-bottom:28px"></div>
<div class="foot">Every AI coach trusts what you tell it. <b>None of them check.</b></div>
""")

P3 = page("", f"""
<div class="eyebrow"><span class="n">02</span> &nbsp;—&nbsp; The fix</div>
<h1>One commitment.<br><span class="em">Under 60 seconds.</span></h1>
<div class="frame" style="margin-top:48px;padding:26px"><img src="{img('composeform')}" style="border-radius:14px"></div>
<div class="body" style="margin-top:44px">
  One deliverable, one deadline, one source of proof.
  Nothing vague enough to hide behind.
</div>
<div class="spacer"></div>
<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:32px">
  <span class="pill">1 · Commit</span><span class="pill">2 · Plan</span>
  <span class="pill">3 · Check-in</span><span class="pill">4 · Verify</span>
  <span class="pill" style="background:var(--sage-tint);border-color:var(--sage)">5 · Outcome</span>
</div>
<div class="rule" style="margin-bottom:28px"></div>
<div class="foot">A win seeds the next commitment. A miss routes to recovery — <b>there is no streak to break.</b></div>
""")

P4 = page("", f"""
<div class="eyebrow"><span class="n">03</span> &nbsp;—&nbsp; The guardrail</div>
<h1>It can't move<br>your <span class="em">goalposts.</span></h1>
<div style="display:flex;gap:22px;margin-top:52px">
  <div class="card" style="flex:1;background:var(--surface2);padding:44px 40px">
    <div class="lab" style="color:var(--press)">Hard fields — you only</div>
    <div style="font-size:34px;line-height:2.15;margin-top:24px;font-weight:500">
      Deliverable<br>Deadline<br>Status<br>Stakes
    </div>
    <div style="font-size:24px;color:var(--faint);margin-top:28px;line-height:1.45">
      User-set and audited. The AI reads them. It cannot write them.
    </div>
  </div>
  <div class="card" style="flex:1;background:var(--sage-tint);border-color:var(--sage);padding:44px 40px">
    <div class="lab" style="color:var(--sage-deep)">Soft context — AI</div>
    <div style="font-size:34px;line-height:2.15;margin-top:24px;font-weight:500">
      Context<br><span style="color:var(--faint)">—</span><br><span style="color:var(--faint)">—</span><br><span style="color:var(--faint)">—</span>
    </div>
    <div style="font-size:24px;color:var(--sage-deep);margin-top:28px;line-height:1.45">
      Exactly one field. That is the entire surface the model may touch.
    </div>
  </div>
</div>
<div class="card" style="margin-top:28px;background:var(--surface2);display:flex;align-items:baseline;gap:28px">
  <div style="font-size:66px;font-weight:600;color:var(--accent);line-height:1;flex:none">1 of 5</div>
  <div style="font-size:26px;color:var(--soft);line-height:1.42">
    fields on a commitment are writable by the model.<br>The other four are yours alone.
  </div>
</div>
<div class="spacer"></div>
<div class="rule" style="margin-bottom:28px"></div>
<div class="foot">Enforced in the <b>schema</b> — not politely requested in a prompt.</div>
""")

P5 = page("", f"""
<div class="eyebrow"><span class="n">04</span> &nbsp;—&nbsp; The companion</div>
<h1>Three companions.<br>Or <span class="em">bring your own.</span></h1>
<div class="frame" style="margin-top:40px"><img src="{img('companions')}"></div>
<div class="spacer"></div>
<div class="rule" style="margin-bottom:28px"></div>
<div class="foot">
  <b>PixiJS + pixi-live2d-display + Cubism 4</b>, wired into React 18 + TypeScript.
  Emotion drives expression and lip-sync live. Adding your own character is a model folder and a JSON persona.
</div>
""")

P6 = page("", f"""
<div class="eyebrow"><span class="n">05</span> &nbsp;—&nbsp; The verdict</div>
<h1>It fetches the<br>evidence <span class="em">itself.</span></h1>
<div class="frame" style="margin-top:42px;border-radius:22px"><img src="{img('portrait')}"></div>
<div class="body" style="margin-top:38px;font-size:28px">
  It pulls the proof itself — you don't get to describe it.
</div>
<div style="display:flex;gap:12px;margin-top:30px">
  <span class="pill">GitHub commit</span><span class="pill">Screenshot</span><span class="pill">File</span>
</div>
<div style="display:flex;gap:14px;margin-top:26px">
  <div class="card" style="flex:1;text-align:center;padding:30px 10px;background:var(--sage-tint);border-color:var(--sage)">
    <div style="font-size:32px;font-weight:600;color:var(--sage-deep)">PASS</div></div>
  <div class="card" style="flex:1;text-align:center;padding:30px 10px;background:var(--tint);border-color:var(--accent)">
    <div style="font-size:32px;font-weight:600;color:var(--press)">FAIL</div></div>
  <div class="card" style="flex:1;text-align:center;padding:30px 10px;background:var(--sunk);border-style:dashed">
    <div style="font-size:32px;font-weight:600;color:var(--faint)">UNCLEAR</div></div>
</div>
<div class="spacer"></div>
<div class="rule" style="margin-bottom:28px"></div>
<div class="foot">Self-report is never accepted. And <b>"unclear" never punishes you.</b></div>
""")

P7 = page("dark", f"""
<div class="eyebrow"><span class="n">06</span> &nbsp;—&nbsp; The brain</div>
<h1>Built on <span class="em">Chutes.</span></h1>
<div style="margin-top:48px;display:flex;flex-direction:column">
""" + "".join(
    f"""<div style="display:flex;gap:26px;padding:26px 0;border-top:1px solid #3A2C21">
      <div style="font-size:21px;color:#8A7461;font-weight:600;width:44px;flex:none;padding-top:6px">0{i}</div>
      <div><div style="font-size:31px;font-weight:600">{t}</div>
      <div style="font-size:23px;color:#B5A392;line-height:1.45;margin-top:6px">{d}</div></div>
    </div>"""
    for i, (t, d) in enumerate([
        ("TEE + attestation", "Intel TDX confidential inference. Zero prompt logging."),
        ("Structured outputs", "Strict JSON is the control plane — it drives product logic, not formatting."),
        ("Multimodal judging", "A TEE vision model reads your screenshot and reasons about it."),
        ("Inline failover", "Per-persona primary with failover routing, in a single call."),
        ("Sign in with Chutes", "The user's own token is the Bearer. Every call bills their balance."),
    ], start=1)
) + """
</div>
<div class="spacer"></div>
<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:26px">
  <span class="pill" style="background:#241B14;border-color:#3A2C21;color:#C4B2A2;font-size:21px">gemma-4-31B-turbo</span>
  <span class="pill" style="background:#241B14;border-color:#3A2C21;color:#C4B2A2;font-size:21px">DeepSeek-V3.2</span>
  <span class="pill" style="background:#241B14;border-color:#3A2C21;color:#C4B2A2;font-size:21px">Kimi-K2.6</span>
</div>
<div class="foot voice" style="font-size:28px;color:#C4B2A2">Privacy, billing and product logic — one story.</div>
""")

P8 = page("dark", f"""
<div style="display:flex;align-items:center;gap:26px">
  <div class="logo"><img src="{img('logo')}"></div>
  <div class="wordmark">KAWAN</div>
</div>
<div class="spacer"></div>
<div class="voice" style="font-size:62px;line-height:1.24">
  No one keeps a promise to a cheerleader.<br>
  They keep it to a friend who <span style="color:var(--accent)">checks.</span>
</div>
<div class="spacer"></div>
<div class="rule"></div>
<div style="margin-top:40px;display:flex;gap:18px">
""" + "".join(
    f"""<div style="flex:1;min-width:0">
      <div style="background:var(--surface);border-radius:20px;padding:10px">
        <img src="{img('qr-' + k)}" style="width:100%;display:block;border-radius:9px">
      </div>
      <div style="font-size:23px;color:#A88C72;letter-spacing:.12em;text-transform:uppercase;font-weight:600;margin-top:18px">{lab}</div>
      <div style="font-size:19px;color:#C4B2A2;margin-top:5px;line-height:1.3;word-break:break-word">{disp}</div>
    </div>"""
    for k, (lab, disp, _) in LINKS.items()
) + """
</div>
<div class="spacer"></div>
<div class="foot" style="color:#8A7461">
  Built by<br>
  <span style="font-size:22px">Hee Zi Jie &middot; Lim Yuh Kang &middot; Jeremy Woon Zhe Ming &middot; Chan Kuan Hou</span>
</div>
""")

HTML = f"""<!doctype html><html><head><meta charset="utf-8">
<style>{CSS}
@page{{size:{W}px {H}px;margin:0}}
</style></head><body>{P1}{P2}{P3}{P4}{P5}{P6}{P7}{P8}</body></html>"""

html_path = HERE / "carousel.html"
html_path.write_text(HTML, encoding="utf-8")
print(f"html   {html_path}  ({len(HTML)/1e6:.2f} MB)")

CHROME = next(
    (p for p in [
        *pathlib.Path.home().glob(".cache/ms-playwright/chromium-*/chrome-linux64/chrome"),
        *pathlib.Path.home().glob(".cache/puppeteer/chrome/*/chrome-linux64/chrome"),
    ] if p.exists()), None,
)
if not CHROME:
    sys.exit("no chrome binary found")

pdf = OUT / "kawan-linkedin-carousel.pdf"
subprocess.run([
    str(CHROME), "--headless", "--disable-gpu", "--no-sandbox",
    "--no-pdf-header-footer", "--run-all-compositor-stages-before-draw",
    "--virtual-time-budget=12000",
    f"--print-to-pdf={pdf}", html_path.as_uri(),
], check=True, capture_output=True)
print(f"pdf    {pdf}  ({pdf.stat().st_size/1e6:.2f} MB)")

prev = HERE / "preview"
prev.mkdir(exist_ok=True)
subprocess.run(["pdftoppm", "-png", "-r", "36", str(pdf), str(prev / "p")], check=True)
print("preview", sorted(p.name for p in prev.glob("*.png")))
