import sys
from storj import download_file, get_folder_size


mode = sys.argv[1]

if mode == 'download_file':
    bucket_name = sys.argv[1]
    local_path = sys.argv[2]
    download_path = sys.argv[3]


    download_file(
        bucket_name=bucket_name,
        local_path=local_path,
        storj_path=download_path
    )

    print('finished!')
elif mode == 'get_folder_size':
    bucket_name = sys.argv[1]
    prefix = sys.argv[2]
    
    size = get_folder_size(bucket_name=bucket_name, prefix=prefix)
    print(size)