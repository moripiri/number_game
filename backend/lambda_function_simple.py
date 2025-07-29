import json

def lambda_handler(event, context):
    """
    간단한 테스트용 Lambda 함수
    """
    print(f"Event: {json.dumps(event)}")
    
    # CORS 헤더
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }
    
    # OPTIONS 요청 처리 (CORS preflight)
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    # 경로에 따른 응답
    path = event.get('path', '/')
    
    if path == '/':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'status': 'healthy',
                'message': 'Number Game API is running',
                'path': path
            })
        }
    
    elif path == '/start':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'message': 'Start game endpoint',
                'board': [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
                'remaining_adds': 999
            })
        }
    
    elif path == '/remove':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'message': 'Remove numbers endpoint',
                'path': path
            })
        }
    
    elif path == '/add':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'message': 'Add numbers endpoint',
                'path': path
            })
        }
    
    else:
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({
                'error': 'Not found',
                'path': path
            })
        } 