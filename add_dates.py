import pandas as pd
from datetime import datetime, timedelta

# Read the CSV
df = pd.read_csv('src/data/poem_rhyme_game.csv')

# Get unique poems
unique_poems = df['poem_slug'].unique()

# Generate dates starting from 7 days ago
start_date = datetime.now() - timedelta(days=7)
date_map = {}

for i, poem_slug in enumerate(unique_poems):
    date = start_date + timedelta(days=i)
    date_map[poem_slug] = date.strftime('%Y-%m-%d')

# Add date column to dataframe
df['date'] = df['poem_slug'].map(date_map)

# Save back to CSV
df.to_csv('src/data/poem_rhyme_game.csv', index=False)

print(f"Added dates to {len(unique_poems)} unique poems")
print(f"Date range: {min(date_map.values())} to {max(date_map.values())}")
