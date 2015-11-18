import os
from PIL import Image

from settings import SETTINGS


def run():
    for f in os.listdir(
        os.path.join(
            SETTINGS.app_folder,
            SETTINGS.photos_folder
            )):
        if ".jpg" in f:
            photo_path = os.path.join(
                SETTINGS.app_folder,
                SETTINGS.photos_folder,
                f
            )

            im = Image.open(photo_path)
            w, h = im.size

            if h > w:
                cropped = im.crop((0, 0, w, w))
                cropped.save(photo_path, "JPEG")


if __name__ == "__main__":
    run()
