import json

try:
    with open('results.json', 'r', encoding='utf-8') as f:
        results = json.load(f)
except FileNotFoundError:
    results = {}

try:
    with open('predictions.json', 'r', encoding='utf-8') as f:
        all_predictions = json.load(f)
except FileNotFoundError:
    all_predictions = {}

try:
    with open('leaderboard.json', 'r', encoding='utf-8') as f:
        leaderboard = json.load(f)
except FileNotFoundError:
    leaderboard = []

for player in leaderboard:
    player_id = player['id']
    earned_points = 0
    if player_id in all_predictions:
        player_preds = all_predictions[player_id]
        for match_id, actual_winner in results.items():
            if match_id in player_preds and player_preds[match_id] == actual_winner:
                earned_points += 1
    player['points'] = earned_points

leaderboard.sort(key=lambda x: x['points'], reverse=True)

with open('leaderboard.json', 'w', encoding='utf-8') as f:
    json.dump(leaderboard, f, ensure_ascii=False, indent=4)

print("تم تحديث النقاط بنجاح!")
