# Simple demo — website

Simple demo is a whole learning site in one page: 150 lessons, 1,020 practice
problems in Simple, Python and Java, an IDE, accounts, points, badges,
profile customization and a leaderboard.

Invented by Bharat Seethagari.

## What's in this folder

| File | What it does |
| --- | --- |
| `index.html` | The whole website (lessons, problems, IDE, accounts). |
| `config.js` | Settings. Turns on online accounts (step 3). |
| `manifest.webmanifest`, `icon*.png`, `icon.svg` | Let people install the site like an app. |
| `sw.js` | Keeps the site working offline after the first visit. |

## 1. Try it on your computer

Double-click `index.html` to open it in your browser. Everything works, but
accounts are saved in that browser only. Installing as an app and offline mode
need a real web address (step 2).

## 2. Put it online (free)

Pick one:

- **Netlify Drop**: go to https://app.netlify.com/drop and drag this whole
  folder onto the page. You get a link like `https://simple-demo.netlify.app`.
- **GitHub Pages**: make a repository, upload these files, then go to
  Settings → Pages → Deploy from branch → `main` / root.
- **Cloudflare Pages** or **Vercel**: create a project and upload the folder.

Once it's online, people can install it. On a phone, use "Add to Home Screen".
On a computer in Chrome or Edge, click the install icon in the address bar.

## 3. Turn on real accounts (optional, free)

Without this step, each visitor's account and progress live only in their own
browser, and the leaderboard shows only people on that device. With
[Supabase](https://supabase.com), people log in with email and password from
any device, and everyone shares one leaderboard.

1. Make a free account at https://supabase.com and create a new project.
2. Open **SQL Editor**, paste the code below, and press **Run**:

```sql
-- Each person's saved progress. Private: only they can read or change it.
create table public.progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz default now()
);
alter table public.progress enable row level security;
create policy "read own progress"   on public.progress for select using (auth.uid() = user_id);
create policy "add own progress"    on public.progress for insert with check (auth.uid() = user_id);
create policy "change own progress" on public.progress for update using (auth.uid() = user_id);

-- The public leaderboard. Everyone can read it; each person writes only their own row.
create table public.scores (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  nickname   text check (char_length(nickname) <= 24),
  points     int  default 0,
  solved     int  default 0,
  lessons    int  default 0,
  icon       text,
  bg         text,
  updated_at timestamptz default now()
);
alter table public.scores enable row level security;
create policy "anyone reads scores" on public.scores for select using (true);
create policy "add own score"       on public.scores for insert with check (auth.uid() = user_id);
create policy "change own score"    on public.scores for update using (auth.uid() = user_id);
```

3. Go to **Project Settings → API Keys** (or click **Connect** at the top).
   Copy the **Project URL** and the **publishable** key (it starts with
   `sb_publishable_`; an older **anon** key works too) into `config.js`:

```js
window.PLAIN_CONFIG = {
  supabaseUrl: "https://abcdefgh.supabase.co",
  supabaseAnonKey: "sb_publishable_..."
};
```

   The publishable key is meant to be public. The row-level security rules above keep
   each person's data safe. Never put a secret key (`sb_secret_...` or `service_role`) in this file.

4. Optional: under **Authentication → Providers → Email**, turn off "Confirm
   email" so people can start right away. If you leave it on, new users get an
   email and log in after they click the link.

5. Upload the folder again. The sign-in box now asks for an email and
   password, and the Community page shows everyone on the site.

Points are worked out in the visitor's browser. That's fine for a demo, but a
determined person could fake a score. Before running real competitions, check
answers on a server (for example with Supabase Edge Functions).

## 4. Inside Claude

The same page is also published as a Claude artifact. When it's opened there,
people are signed in with their Claude account automatically, and progress and
the leaderboard are saved by Claude. The AI coach and "write it for me" helper in the
IDE work only inside Claude. On your own website they show a short note
saying the AI helper isn't available, and everything else works as usual.

## Ideas for next steps

- Weekly contests: a `contests` table with problem ids and start/end times.
- Help each other: a `questions` table with replies, linked to problem ids.
- Classes: a `groups` table so teachers can see their students' progress.
