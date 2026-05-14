# 📰 Gator — Blog Aggregator

> A CLI-powered RSS feed aggregator built with TypeScript — scrapes feeds on a schedule, manages multi-user subscriptions, and delivers posts straight to your terminal.

---

## What is Gator?

Gator is a command-line RSS aggregator that lets multiple users register, follow feeds, and browse their personalized post feed — all backed by a PostgreSQL database via Drizzle ORM.

You give it a feed URL. It polls it on a schedule you control. Posts accumulate. You browse them. No browser required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Runtime | Node.js |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Config | JSON config file (`~/.gatorconfig.json`) |
| Feed parsing | RSS/XML HTTP scraping |

---

## Features

- **Multi-user system** — register multiple users, each with their own feed subscriptions
- **RSS scraping on a schedule** — `agg` command polls all feeds at a configurable interval
- **Follow/unfollow feeds** — per-user subscription management
- **Personalized browse** — see only posts from feeds you follow, with titles and descriptions
- **CLI-first design** — every action is a clean command with clear arguments
- **Cascade deletes** — clean data model, no orphaned records

---

## Commands

```bash
npm run start <command> [args]

register <name>        Register a new user
login <name>           Set active user in ~/.gatorconfig.json
users                  List all registered users
reset                  Wipe the user database (cascades everything)

addfeed <title> <url>  Add an RSS feed to the database
feeds                  List all feeds
follow <url>           Follow a feed as the current user
following              List feeds the current user follows
unfollow <url>         Unfollow a feed

agg <interval>         Start scraping feeds (e.g. 1m, 30s, 1h)
browse                 Show posts from feeds you follow
```

---

## Getting Started

**Prerequisites:** Node.js, PostgreSQL

```bash
# Clone the repo
git clone https://github.com/VladV1999/blog_aggregator
cd blog_aggregator

# Install dependencies
npm install

# Set up your config file
echo '{"db_url":"postgresql://user:pass@localhost:5432/gator","current_user_name":""}' \
  > ~/.gatorconfig.json

# Run migrations
npm run db:migrate

# Register yourself and start aggregating
npm run start register vlad
npm run start login vlad
npm run start addfeed "Hacker News" "https://news.ycombinator.com/rss"
npm run start agg 1m
npm run start browse
```

---

## How the Scraper Works

```
agg <interval>
    │
    ├── Fetch all feeds from DB
    ├── For each feed:
    │     ├── HTTP GET the RSS/XML URL
    │     ├── Parse feed items
    │     └── Upsert new posts to DB (skip duplicates)
    └── Sleep for <interval>, repeat
```

The scraper runs in a loop — set it going in one terminal, browse in another.

---

## What I Learned

- Building a real CLI application with structured command dispatch in TypeScript
- RSS/XML parsing and the quirks of real-world feed formats
- Drizzle ORM for schema management and type-safe queries with PostgreSQL
- Designing a config system using a local JSON file (`~/.gatorconfig.json`) for persistent user state
- Cascade deletes and relational schema design — keeping the database clean by design

---

## What's Next

- [ ] Web UI frontend for browsing posts
- [ ] Feed health monitoring (track failed fetches)
- [ ] Post search and filtering by keyword
- [ ] Email digest of new posts