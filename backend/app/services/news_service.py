import random
from datetime import datetime, timedelta
from typing import Dict, Any, List

SIMULATED_NEWS_TEMPLATES = [
    {
        "headline": "Tesla plans $5 billion Gigafactory expansion in Europe",
        "content": "Tesla announced a $5 billion investment plan on Monday to expand its Berlin gigafactory, aiming to double production. The stock (TSLA) reacted positively, jumping 3.4% in pre-market trading.",
        "source": "Bloomberg",
        "category": "Corporate Expansion"
    },
    {
        "headline": "Apple acquires payment startup PayPlus for $2B",
        "content": "Apple acquired PayPlus in a $2B deal finalized on Tuesday. The acquisition will allow the tech giant (AAPL) to enhance its mobile payments infrastructure across international markets.",
        "source": "Reuters",
        "category": "M&A"
    },
    {
        "headline": "Microsoft reports record Q3 earnings growth",
        "content": "Microsoft reported Q3 earnings growth yesterday, exceeding analyst forecasts with total cloud revenue reaching $25 billion. The company (MSFT) credited AI integrations for the surge.",
        "source": "Financial Times",
        "category": "Earnings"
    },
    {
        "headline": "NVIDIA stock splits after crossing $1.2 trillion market cap",
        "content": "NVIDIA (NVDA) announced a 10-for-1 stock split on Thursday after its valuation crossed $1.2 trillion. The company continues to dominate GPU chip sales worldwide.",
        "source": "MarketWatch",
        "category": "Stock Market"
    },
    {
        "headline": "Goldman Sachs CEO predicts inflation slowdown in Q3 2026",
        "content": "Goldman Sachs CEO David Solomon stated on Friday that inflation pressures should cool down by Q3 2026. The banking firm (GS) is adjusting its interest rate predictions accordingly.",
        "source": "Wall Street Journal",
        "category": "Macroeconomics"
    },
    {
        "headline": "Amazon invests £80M in UK green logistics",
        "content": "Amazon committed to a £80M infrastructure project in London on Wednesday. The e-commerce provider (AMZN) plans to deploy electric delivery fleets by the end of next year.",
        "source": "Bloomberg",
        "category": "Sustainability"
    },
    {
        "headline": "Alphabet to buy cybersecurity firm Wiz in a $23 billion deal",
        "content": "Google parent Alphabet (GOOGL) is in advanced talks to buy Wiz in a $23 billion transaction. The acquisition represents Google's largest corporate takeover in history.",
        "source": "Reuters",
        "category": "M&A"
    },
    {
        "headline": "JPMorgan Chase reports record-breaking net interest income",
        "content": "JPMorgan Chase (JPM) declared Q2 net income of $14 billion on Friday, powered by high interest rates. CEO Jamie Dimon remains cautious about long-term economic indicators.",
        "source": "CNBC",
        "category": "Earnings"
    },
    {
        "headline": "Meta announces first-ever dividend payout of $0.50 per share",
        "content": "Meta announced a dividend payout of $0.50 per share on Wednesday. The social media giant (META) also expanded its share buyback program by $50 billion after a strong earnings quarter.",
        "source": "Bloomberg",
        "category": "Corporate Finance"
    },
    {
        "headline": "Stripe raises $600 million funding round at $95B valuation",
        "content": "Fintech leader Stripe announced a $600 million fundraising round today, valuation hitting $95B. Key investors include Berkshire Hathaway and Goldman Sachs.",
        "source": "TechCrunch",
        "category": "Venture Capital"
    },
    {
        "headline": "Federal Reserve keeps interest rate steady at 5.25%",
        "content": "The Federal Reserve kept interest rates steady on Thursday. Fed Chair Jerome Powell signaled that rate cuts may start in December if inflation rates continue to decrease.",
        "source": "Reuters",
        "category": "Macroeconomics"
    },
    {
        "headline": "Netflix surpasses subscriber targets in Q4 2025 earnings",
        "content": "Netflix (NFLX) reported earnings growth yesterday, adding 13 million new subscribers in Q4 2025. The company's operating margin increased by 22% during the holiday season.",
        "source": "Variety",
        "category": "Earnings"
    }
]

class NewsStreamService:
    @staticmethod
    def get_latest_news() -> List[Dict[str, Any]]:
        news_list = []
        now = datetime.utcnow()
        for i, item in enumerate(SIMULATED_NEWS_TEMPLATES):
            item_copy = dict(item)
            # Assign random back-dated timestamps to build a history list
            item_copy["id"] = f"news_{i}"
            item_copy["timestamp"] = (now - timedelta(minutes=i * 20)).isoformat() + "Z"
            news_list.append(item_copy)
        return news_list

    @staticmethod
    def generate_random_news() -> Dict[str, Any]:
        item = random.choice(SIMULATED_NEWS_TEMPLATES)
        item_copy = dict(item)
        item_copy["id"] = f"news_rand_{random.randint(1000, 9999)}"
        item_copy["timestamp"] = datetime.utcnow().isoformat() + "Z"
        return item_copy
