from io import BytesIO
from json import dumps
from minio import Minio
from os import getenv
from PIL import Image
from traceback import format_exc


minio_client = Minio(
    endpoint=getenv('MINIO_URL'),
    access_key=getenv('WEBMONITOR_USER1'),
    secret_key=getenv('WEBMONITOR_PASSWORD1'),
    secure=True,
)


def activate_bucket(user_id):
    try:
        bucket_name = get_bucket_name(user_id)

        if not minio_client.bucket_exists(bucket_name=bucket_name):
            minio_client.make_bucket(bucket_name=bucket_name)
        
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {"AWS": "*"},
                    "Action": "s3:GetObject",
                    "Resource": f"arn:aws:s3:::{bucket_name}/*",
                },
            ],
        }
        minio_client.set_bucket_policy(bucket_name, dumps(policy))
        return True

    except:
        print(format_exc())
        return False


def deactivate_bucket(user_id):
    try:
        bucket_name = get_bucket_name(user_id)
        minio_client.delete_bucket_policy(bucket_name)
        return True

    except:
        print(format_exc())
        return False


def get_bucket_name(user_id):
    bucket_name = str(user_id) 
    bucket_name_length = len(bucket_name)
    bucket_name = bucket_name if bucket_name_length >= 4 else ((4-bucket_name_length) * '0') + bucket_name
    return bucket_name


def generate_path(parent, name):
    if parent:
        return parent['path'] + name
    else:
        return name


def upload_image(action, user_id, data):
    try:
        bucket_name = get_bucket_name(user_id)

        if not minio_client.bucket_exists(bucket_name=bucket_name):
            minio_client.make_bucket(bucket_name=bucket_name)

        uploaded_file = data['filedata']
        filename = data['filename']
        content_type = data['content_type']
        length = len(uploaded_file.read())
        parent = None
        i = 0

        while True:
            path = generate_path(parent, filename)

            query = """
                SELECT id 
                FROM meuml.files 
                WHERE user_id = :user_id AND path = :path 
            """
            values = {'user_id': user_id, 'path': path}
            if parent:
                query += 'AND parent_id = :parent_id'
                values['parent_id'] = parent['id']
            
            if not action.fetchone(query, values):
                break
            else:
                i += 1
                filename = f"{data['filename']}_{i}"

        if 'image' in content_type: 
            uploaded_file.seek(0)
            im = Image.open(uploaded_file)

            if im.width > 242 or im.height > 242:
                im.thumbnail((242,242))

                extension = content_type.split('/')
                if len(extension) < 2:
                    return None
                
                thumbnail_file = BytesIO()
                im.save(thumbnail_file, format=extension[1])
                
                thumbnail_file.seek(0)
                thumbnail_length = len(thumbnail_file.read())
                thumbnail_file.seek(0)

                thumbnail_path = generate_path(parent, '.thumbnail_' + filename)

                minio_client.put_object(
                    bucket_name=bucket_name, 
                    object_name=thumbnail_path, 
                    data=thumbnail_file,
                    length=thumbnail_length,
                    content_type=content_type
                )
            else:
                thumbnail_path = path
        else:
            thumbnail_path = None

        uploaded_file.seek(0)
        minio_client.put_object(
            bucket_name=bucket_name, 
            object_name=path, 
            data=uploaded_file,
            length=length,
            content_type=content_type
        )

        query = """
            INSERT INTO meuml.files (user_id, parent_id, name, content_type, size, path, url, thumbnail_url) 
            VALUES (:user_id, :parent_id, :name, :content_type, :size, :path, :url, :thumbnail_url)
            RETURNING id
        """
        values = {
            'user_id': user_id,
            'parent_id': parent['id'] if parent else None,
            'name': filename,
            'content_type': content_type,
            'size': length,
            'path': path,
            'url': getenv('IMAGES_URL') + bucket_name + '/' + path,
            'thumbnail_url': getenv('IMAGES_URL') + bucket_name + '/' + thumbnail_path if thumbnail_path else None,
        }
        return action.execute_insert(query, values)
    except:
        print(format_exc())
        return None
