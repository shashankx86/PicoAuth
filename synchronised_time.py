import time

def create_synchronised_time(year, month, day, hour, minute, second):
    datetime = [year, month, day, hour, minute, second]

    # Calculate the delta between the set time and the current time
    delta = time.mktime(tuple(datetime) + (0, 0, -1)) - int(time.time())

    def synchronised_time():
        return int(time.time()) + delta

    return synchronised_time
