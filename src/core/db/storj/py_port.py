import sys
from storj import download_file, get_folder_size

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
    except Exception as e:
        print('false')

elif mode == 'get_folder_size':
    bucket_name = sys.argv[2]
    prefix = sys.argv[3]

    try:
        size = get_folder_size(bucket_name=bucket_name, prefix=prefix)
        print(size)
    except:
        print('false')
