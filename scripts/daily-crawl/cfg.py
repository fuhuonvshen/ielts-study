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
MIN_TEXT_LENGTH = 1000

# Number of blanks per article (random range)
BLANKS_MIN = 15
BLANKS_MAX = 30

# Word difficulty level — change this to match your word list
# Options: 'IELTS', 'CET4', 'CET6', 'TOEFL', 'GRE'
WORD_LEVEL = 'IELTS'

WORD_LEVEL_GUIDE = {
    'IELTS': 'IELTS band 5.0-7.5 (intermediate to upper-intermediate). Prioritize academic nouns, precise verbs, descriptive adjectives. Skip basic everyday words.',
    'CET4':  'CET-4 level (basic to intermediate). Choose common academic and daily-use words. Skip very basic words like "go", "make", "good".',
    'CET6':  'CET-6 level (intermediate to advanced). Choose more sophisticated vocabulary including academic and formal words.',
    'TOEFL': 'TOEFL level (intermediate to advanced academic English). Focus on campus-life and academic lecture vocabulary.',
    'GRE':   'GRE level (advanced). Choose challenging academic vocabulary, complex and nuanced words.',
}

# DeepSeek API settings
DEEPSEEK_BASE_URL = "https://api.deepseek.com"
DEEPSEEK_MODEL = "deepseek-chat"
