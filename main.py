import time
import json
from totp import totp

codes = json.loads(open("codes.json", "r").read())
selected_idx = 0

# Define the initial datetime values here in UTC (24 hour format)
year = 2024
month = 6
day = 12
hour = 17
minute = 59
second = 00

# Calculate the delta for synchronised time
initial_datetime = [year, month, day, hour, minute, second, 0, 0, 0]
delta = time.mktime(initial_datetime) - int(time.time())

def synchronised_time():
    return int(time.time()) + delta

while True:
    if selected_idx < len(codes) - 1:
        selected_idx = (selected_idx + 1) % len(codes)
    else:
        selected_idx = 0

    code = codes[selected_idx]

    password, expiry = totp(synchronised_time(), code['key'], step_secs=code['step'], digits=code['digits'])

    # Print the current code and its details
    print(f"\nCode Name: {code['name']}")
    print(f"Password: {password}")

    # Countdown simulation
    for remaining in range(expiry, 0, -1):
        print(f"{remaining} seconds remaining", end='\r')
        time.sleep(1)

    # Clear the line after the countdown is done
    print(' ' * 70, end='\r')
