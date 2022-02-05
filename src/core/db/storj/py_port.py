import sys
from storj import download_file, list_objects

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

elif mode == 'get_folder_size':
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

elif mode == 'get_folder_files':
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
        print(str(filenames)[1:-1])  # ['e1', 'e2', ..., 'en'] -> 'e1', 'e2', ..., 'en'
    
    except:
        print('false')
