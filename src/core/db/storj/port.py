import sys
from storj import download_file


bucket_name = sys.argv[1]
local_path = sys.argv[2]
download_path = sys.argv[3]


download_file(
    bucket_name='test',
    local_path=local_path,
    storj_path=download_path
)

print('finished!')
