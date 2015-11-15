import os
import random
import hashlib
from io import BytesIO

import requests

from settings import SETTINGS


def run():
    for req in range(SETTINGS.loop):

        location = ",".join(gen_location())
        size = "320x320"

        payload = {
            "location": location,
            "key": SETTINGS.key,
            "size": size
        }

        r = requests.get(SETTINGS.imaxe_url, params=payload)
        myio = BytesIO()

        for chunk in r.iter_content(128):
            myio.write(chunk)

        m = hashlib.md5()
        m.update(myio.getvalue())
        hd = m.hexdigest()
        if hd == SETTINGS.empty_photo:
            continue

        print(hd)

        with open(
            os.path.join(
                SETTINGS.app_folder,
                SETTINGS.photos_folder,
                "still-{}-{}.jpg".format(location, size)), "wb+"
                ) as f:
            f.write(myio.getvalue())


def gen_location():
    return (
        "{0:.4f}".format(random.uniform(43.837, 43.56)),
        "{0:.4f}".format(random.uniform(-8.0, -7.67))
    )


if __name__ == "__main__":
    run()
