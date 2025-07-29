import json
import sys
import os

# Lambda 환경에서 경로 설정
sys.path.append('/opt/python')
sys.path.append(os.path.dirname(__file__))

try:
    from mangum import Adapter
    from app.main import app
    
    # Create handler for AWS Lambda
    handler = Adapter(app)
    
    def lambda_handler(event, context):
        print(f"Event: {json.dumps(event)}")
        try:
            return handler(event, context)
        except Exception as e:
            print(f"Error in lambda_handler: {str(e)}")
            return {
                'statusCode': 500,
                'body': json.dumps({'error': str(e)}),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
                }
            }
            
except ImportError as e:
    print(f"Import error: {str(e)}")
    def lambda_handler(event, context):
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'Import error: {str(e)}'}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
except Exception as e:
    print(f"Setup error: {str(e)}")
    def lambda_handler(event, context):
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'Setup error: {str(e)}'}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        } 