import os
from uplink_python import Uplink, ListObjectsOptions
from dotenv import load_dotenv

load_dotenv()


# Storj database
STORJ_API_KEY = os.environ.get('STORJ_API_KEY')
STORJ_SATELLITE = os.environ.get('STORJ_SATELLITE')
STORJ_ENCRYPTION_PASSPHRASE = os.environ.get('STORJ_ENCRYPTION_PASSPHRASE')


uplink = Uplink()

access = uplink.request_access_with_passphrase(
    satellite=STORJ_SATELLITE,
    api_key=STORJ_API_KEY,
    passphrase=STORJ_ENCRYPTION_PASSPHRASE
)

project = access.open_project()


def download_file(bucket_name: str, local_path: str, storj_path: str):
    with open(local_path, 'w+b') as file_handle:
        download = project.download_object(bucket_name, storj_path)
        # download data from storj to file
        download.read_file(file_handle)
        # close the download stream
        download.close()


def get_folder_size(bucket_name: str, prefix: str = ''):
    # default options
    options = {
        "prefix": prefix,
        "recursive": True,
        "system": False
    }

    objects_list = project.list_objects(
        bucket_name,
        ListObjectsOptions(**options)
    )

    return len([obj.key for obj in objects_list if (obj.key.endswith('.png') or obj.key.endswith('.jpg'))])
