"""RSS source configuration for daily news crawl."""

# All RSS feeds to crawl — articles will be classified by LLM into categories
RSS_FEEDS: list[str] = [
    "https://www.cgtn.com/subscribe/rss/section/china.xml",
    "https://www.cgtn.com/subscribe/rss/section/world.xml",
    "https://www.cgtn.com/subscribe/rss/section/tech-sci.xml",
    "http://www.ecns.cn/rss/rss.xml",
]

# Target categories (LLM classifies each article into one of these)
CATEGORIES = ["education", "sports", "society", "technology", "military"]

# Max articles to extract per feed
MAX_PER_FEED = 5

# Output directory (relative to repo root)
OUTPUT_DIR = "public/data/daily-practice"

# Minimum characters for a usable article (CET-6 reading level)
MIN_TEXT_LENGTH = 800

# Number of blanks per article (random range)
BLANKS_MIN = 8
BLANKS_MAX = 12

# DeepSeek API settings
DEEPSEEK_BASE_URL = "https://api.deepseek.com"
DEEPSEEK_MODEL = "deepseek-chat"

# edge-tts voice (British English, clear female voice)
TTS_VOICE = "en-GB-SoniaNeural"
