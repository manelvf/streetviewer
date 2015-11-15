import os
import re
import random
import json

from settings import SETTINGS


def run():
    photos = os.listdir(os.path.join(
        SETTINGS.app_folder,
        SETTINGS.photos_folder)
    )
    photo_list = []
    for f in photos:
        m = re.search('still-([^,]+),(-?[^-]+)-([^x]+)x([^.]+)', f)
        if m and m.groups():
            still = list(m.groups()) + [f]
            photo_list.append(still)

    if len(photo_list) < 10:
        raise Exception("We should have a bunch of photos, dude")

    random.shuffle(photo_list)
    shuffled = photo_list[:9]
    shuffled_str = json.dumps({"data": shuffled})

    with open(os.path.join(
            SETTINGS.app_folder,
            SETTINGS.data_folder,
            "shuffled.json"), "w+") as f:
        f.write(shuffled_str)


if __name__ == "__main__":
    run()
