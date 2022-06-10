"""

    此檔案為利用 py 呼叫 py 的 ts -> py 端口

"""

import sys
from storj import download_file, list_objects, upload_file

# argv: start from 1

mode = sys.argv[1]

if mode == 'download_file':
    bucket_name = sys.argv[2]
    local_path = sys.argv[3]
    download_path = sys.argv[4]

    try:
        download_file(
            bucket_name=bucket_name,
            local_path=local_path,
            storj_path=download_path
        )
        print('true')

    except:
        print('false')

elif mode == 'upload_file':
    bucket_name = sys.argv[2]
    local_path = sys.argv[3]
    upload_path = sys.argv[4]

    try:
        upload_file(
            bucket_name=bucket_name,
            local_path=local_path,
            storj_path=upload_path
        )
        print('true')

    except Exception as e:
        print(f'false, {e}')

elif mode == 'getFolderSize':
    bucket_name = sys.argv[2]
    prefix = sys.argv[3]

    if len(sys.argv) == 5:  # ... .png-.jpg
        suffixes = sys.argv[4].split('-')
    else:
        suffixes = []

    try:
        size = len(list_objects(
            bucket_name=bucket_name,
            prefix=prefix,
            suffixes=suffixes
        ))
        print(size)

    except:
        print('false')

elif mode == 'getFolderFiles':
    bucket_name = sys.argv[2]
    prefix = sys.argv[3]

    if len(sys.argv) == 5:  # ... .png-.jpg
        suffixes = sys.argv[4].split('-')
    else:
        suffixes = []

    try:
        filenames = list_objects(
            bucket_name=bucket_name,
            prefix=prefix,
            suffixes=suffixes
        )
        filenames = [filename[len(prefix):] for filename in filenames]
        print(', '.join(filenames))

    except:
        print('false')
